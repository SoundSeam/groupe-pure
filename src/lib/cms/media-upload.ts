"use client";

import { Upload } from "tus-js-client";

import {
  cmsUploadFingerprint,
  storagePathForJob,
  uploadPercentage,
  type CmsMediaUploadJob,
  type CmsUploadStatus,
} from "@/lib/cms/upload-contract";
import { getSupabaseConfig } from "@/lib/env";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const BUCKET = "site-media";
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const RESUMABLE_THRESHOLD = 6 * 1024 * 1024;
const MAX_IMAGE_EDGE = 2560;
const IMAGE_QUALITY = 0.82;

const acceptedTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
]);

export type CmsMediaAsset = {
  id: string;
  fileName: string;
  storagePath: string;
  publicUrl: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type UploadCmsMediaOptions = {
  file: File;
  job: CmsMediaUploadJob;
  onStatus?: (status: CmsUploadStatus) => void;
  signal?: AbortSignal;
};

function abortError() {
  return new DOMException("The upload was cancelled.", "AbortError");
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw abortError();
}

function webpName(name: string) {
  const base = name.replace(/\.[^.]+$/, "") || "image";
  return `${base}.webp`;
}

function canvasBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
) {
  return new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, quality);
  });
}

async function optimizeImage(file: File, signal?: AbortSignal) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    throwIfAborted(signal);
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    throwIfAborted(signal);
    const scale = Math.min(
      1,
      MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height),
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      bitmap.close();
      return file;
    }

    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const optimized = await canvasBlob(canvas, "image/webp", IMAGE_QUALITY);
    throwIfAborted(signal);
    if (!optimized || optimized.size >= file.size * 0.94) return file;

    return new File([optimized], webpName(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    return file;
  }
}

async function getUploadSession() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Your admin session expired.");
  return { session, supabase };
}

async function standardUpload(
  file: File,
  storagePath: string,
  accessToken: string,
  publishableKey: string,
  projectUrl: string,
  onStatus?: (status: CmsUploadStatus) => void,
  signal?: AbortSignal,
) {
  await new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    const path = [BUCKET, ...storagePath.split("/")]
      .map(encodeURIComponent)
      .join("/");
    let settled = false;

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", cancel);
      callback();
    };
    const cancel = () => {
      request.abort();
      finish(() => reject(abortError()));
    };

    request.open("POST", `${projectUrl}/storage/v1/object/${path}`);
    request.setRequestHeader("authorization", `Bearer ${accessToken}`);
    request.setRequestHeader("apikey", publishableKey);
    request.setRequestHeader("x-upsert", "false");
    request.upload.addEventListener("progress", (event) => {
      if (!event.lengthComputable) return;
      onStatus?.({
        phase: "uploading",
        bytesUploaded: event.loaded,
        bytesTotal: event.total,
        percentage: uploadPercentage(event.loaded, event.total),
      });
    });
    request.addEventListener("load", () => {
      if (request.status >= 200 && request.status < 300) {
        finish(resolve);
        return;
      }

      let message = `Storage upload failed (${request.status}).`;
      try {
        const payload = JSON.parse(request.responseText) as { message?: string };
        if (payload.message) message = payload.message;
      } catch {
        // Keep the status-based fallback for non-JSON responses.
      }
      finish(() => reject(new Error(message)));
    });
    request.addEventListener("error", () => {
      finish(() => reject(new Error("The storage upload could not connect.")));
    });
    request.addEventListener("abort", () => {
      finish(() => reject(abortError()));
    });
    signal?.addEventListener("abort", cancel, { once: true });

    const form = new FormData();
    form.append("cacheControl", "31536000");
    form.append("", file);
    request.send(form);
  });
}

async function resumableUpload(
  file: File,
  job: CmsMediaUploadJob,
  storagePath: string,
  accessToken: string,
  projectUrl: string,
  onStatus?: (status: CmsUploadStatus) => void,
  signal?: AbortSignal,
) {
  const projectRef = new URL(projectUrl).hostname.split(".")[0];

  await new Promise<void>((resolve, reject) => {
    let settled = false;
    const upload = new Upload(file, {
      endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${accessToken}`,
        "x-upsert": "false",
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: RESUMABLE_THRESHOLD,
      fingerprint: async () => cmsUploadFingerprint(job, storagePath, file),
      metadata: {
        bucketName: BUCKET,
        objectName: storagePath,
        contentType: file.type,
        cacheControl: "31536000",
      },
      onError: (error) => finish(() => reject(error)),
      onProgress(bytesUploaded, bytesTotal) {
        onStatus?.({
          phase: "uploading",
          bytesUploaded,
          bytesTotal,
          percentage: uploadPercentage(bytesUploaded, bytesTotal),
        });
      },
      onSuccess: () => finish(resolve),
    });

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", cancel);
      callback();
    };
    const cancel = () => {
      void upload.abort(true).finally(() => {
        finish(() => reject(abortError()));
      });
    };
    signal?.addEventListener("abort", cancel, { once: true });

    void upload
      .findPreviousUploads()
      .then((uploads) => {
        throwIfAborted(signal);
        const matchingUpload = uploads.find(
          (previous) =>
            previous.metadata?.bucketName === BUCKET &&
            previous.metadata?.objectName === storagePath,
        );
        if (matchingUpload) upload.resumeFromPreviousUpload(matchingUpload);
        upload.start();
      })
      .catch((error) => finish(() => reject(error)));
  });
}

async function verifyPublicMedia(
  publicUrl: string,
  file: File,
  signal?: AbortSignal,
) {
  const response = await fetch(publicUrl, {
    method: "HEAD",
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("The uploaded object could not be verified.");

  const contentType = response.headers.get("content-type")?.split(";")[0];
  const contentLength = Number(response.headers.get("content-length") ?? "0");
  if (contentType && contentType !== file.type) {
    throw new Error("The uploaded object has an unexpected media type.");
  }
  if (contentLength > 0 && contentLength !== file.size) {
    throw new Error("The uploaded object has an unexpected size.");
  }
}

export async function uploadCmsMedia({
  file,
  job,
  onStatus,
  signal,
}: UploadCmsMediaOptions) {
  if (!acceptedTypes.has(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP, GIF, AVIF, MP4, or WebM file.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("The file is larger than 50 MB.");
  }

  throwIfAborted(signal);
  onStatus?.({ phase: "optimizing" });
  const optimizedFile = await optimizeImage(file, signal);
  const storagePath = job.storagePath ?? storagePathForJob(job, optimizedFile.name);
  job.storagePath = storagePath;
  const { publishableKey, url: projectUrl } = getSupabaseConfig();
  const { session, supabase } = await getUploadSession();

  onStatus?.({
    phase: "uploading",
    bytesUploaded: 0,
    bytesTotal: optimizedFile.size,
    percentage: 0,
  });
  if (optimizedFile.size > RESUMABLE_THRESHOLD) {
    await resumableUpload(
      optimizedFile,
      job,
      storagePath,
      session.access_token,
      projectUrl,
      onStatus,
      signal,
    );
  } else {
    await standardUpload(
      optimizedFile,
      storagePath,
      session.access_token,
      publishableKey,
      projectUrl,
      onStatus,
      signal,
    );
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);

  try {
    throwIfAborted(signal);
    onStatus?.({ phase: "verifying" });
    await verifyPublicMedia(data.publicUrl, optimizedFile, signal);
    onStatus?.({ phase: "registering" });
    const response = await fetch("/api/cms/assets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pagePath: job.pagePath,
        fieldKey: job.fieldKey,
        fileName: file.name,
        storagePath,
        publicUrl: data.publicUrl,
        mimeType: optimizedFile.type,
        size: optimizedFile.size,
      }),
      signal,
    });
    const payload = (await response.json().catch(() => null)) as {
      asset?: CmsMediaAsset;
      error?: string;
    } | null;

    if (!response.ok || !payload?.asset) {
      throw new Error(payload?.error ?? "The media could not be recorded.");
    }

    return payload.asset;
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => undefined);
    throw error;
  }
}
