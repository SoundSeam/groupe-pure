"use client";

import { Upload } from "tus-js-client";

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
  "video/quicktime",
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

function safeFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "media";
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

async function optimizeImage(file: File) {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
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
    if (!optimized || optimized.size >= file.size * 0.94) return file;

    return new File([optimized], webpName(file.name), {
      type: "image/webp",
      lastModified: file.lastModified,
    });
  } catch {
    return file;
  }
}

async function resumableUpload(
  file: File,
  storagePath: string,
  onProgress?: (percentage: number) => void,
) {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("Your admin session expired.");

  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!projectUrl) throw new Error("Supabase is not configured.");
  const projectRef = new URL(projectUrl).hostname.split(".")[0];

  await new Promise<void>((resolve, reject) => {
    const upload = new Upload(file, {
      endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${session.access_token}`,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: RESUMABLE_THRESHOLD,
      metadata: {
        bucketName: BUCKET,
        objectName: storagePath,
        contentType: file.type,
        cacheControl: "31536000",
      },
      onError: reject,
      onProgress(bytesUploaded, bytesTotal) {
        onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100));
      },
      onSuccess: () => resolve(),
    });

    void upload.findPreviousUploads().then((uploads) => {
      if (uploads.length) upload.resumeFromPreviousUpload(uploads[0]);
      upload.start();
    });
  });
}

export async function uploadCmsMedia({
  file,
  fieldKey,
  pagePath,
  onProgress,
}: {
  file: File;
  fieldKey: string;
  pagePath: string;
  onProgress?: (percentage: number) => void;
}) {
  if (!acceptedTypes.has(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP, GIF, AVIF, MP4, WebM, or MOV file.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("The file is larger than 50 MB.");
  }

  const optimizedFile = await optimizeImage(file);
  const locale = pagePath.split("/")[1];
  const date = new Date().toISOString().slice(0, 10);
  const storagePath = `${locale}/${date}/${crypto.randomUUID()}-${safeFileName(
    optimizedFile.name,
  )}`;
  const supabase = createSupabaseBrowserClient();

  if (optimizedFile.size > RESUMABLE_THRESHOLD) {
    await resumableUpload(optimizedFile, storagePath, onProgress);
  } else {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, optimizedFile, {
        cacheControl: "31536000",
        contentType: optimizedFile.type,
        upsert: false,
      });
    if (error) throw new Error(error.message);
    onProgress?.(100);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  const response = await fetch("/api/cms/assets", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      pagePath,
      fieldKey,
      fileName: file.name,
      storagePath,
      publicUrl: data.publicUrl,
      mimeType: optimizedFile.type,
      size: optimizedFile.size,
    }),
  });
  const payload = (await response.json().catch(() => null)) as {
    asset?: CmsMediaAsset;
    error?: string;
  } | null;

  if (!response.ok || !payload?.asset) {
    await supabase.storage.from(BUCKET).remove([storagePath]);
    throw new Error(payload?.error ?? "The media could not be recorded.");
  }

  return payload.asset;
}
