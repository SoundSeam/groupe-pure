export type CmsUploadPhase =
  | "optimizing"
  | "uploading"
  | "verifying"
  | "registering"
  | "applying"
  | "saving"
  | "complete";

export type CmsUploadStatus = {
  phase: CmsUploadPhase;
  bytesUploaded?: number;
  bytesTotal?: number;
  percentage?: number;
};

export type CmsMediaUploadJob = {
  id: string;
  pagePath: string;
  fieldKey: string;
  locale: string;
  date: string;
  storagePath?: string;
};

export function createCmsMediaUploadJob({
  fieldKey,
  pagePath,
  id = crypto.randomUUID(),
  now = new Date(),
}: {
  fieldKey: string;
  pagePath: string;
  id?: string;
  now?: Date;
}): CmsMediaUploadJob {
  return {
    id,
    pagePath,
    fieldKey,
    locale: pagePath.split("/")[1] || "shared",
    date: now.toISOString().slice(0, 10),
  };
}

export function safeCmsFileName(name: string) {
  const normalized = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "media";
}

export function storagePathForJob(job: CmsMediaUploadJob, fileName: string) {
  return `${job.locale}/${job.date}/${job.id}-${safeCmsFileName(fileName)}`;
}

export function cmsUploadFingerprint(
  job: CmsMediaUploadJob,
  storagePath: string,
  file: Pick<File, "name" | "type" | "size" | "lastModified">,
) {
  return [
    "groupe-pure-cms",
    job.id,
    storagePath,
    file.name,
    file.type,
    file.size,
    file.lastModified,
  ].join(":");
}

export function uploadPercentage(bytesUploaded: number, bytesTotal: number) {
  if (!Number.isFinite(bytesUploaded) || !Number.isFinite(bytesTotal)) return 0;
  if (bytesTotal <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((bytesUploaded / bytesTotal) * 100)));
}
