export class CmsAssetVerificationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "OBJECT_NOT_FOUND"
      | "OBJECT_TYPE_MISMATCH"
      | "OBJECT_SIZE_MISMATCH"
      | "OBJECT_VERIFICATION_FAILED",
  ) {
    super(message);
    this.name = "CmsAssetVerificationError";
  }
}

export async function verifyCmsAssetObject({
  publicUrl,
  mimeType,
  size,
  fetcher = fetch,
}: {
  publicUrl: string;
  mimeType: string;
  size: number;
  fetcher?: typeof fetch;
}) {
  let response: Response;
  try {
    response = await fetcher(publicUrl, {
      method: "HEAD",
      cache: "no-store",
    });
  } catch {
    throw new CmsAssetVerificationError(
      "The uploaded object could not be verified.",
      "OBJECT_VERIFICATION_FAILED",
    );
  }

  if (!response.ok) {
    throw new CmsAssetVerificationError(
      "The uploaded object was not found.",
      "OBJECT_NOT_FOUND",
    );
  }

  const storedType = response.headers.get("content-type")?.split(";")[0];
  const storedSize = Number(response.headers.get("content-length") ?? "0");
  if (storedType && storedType !== mimeType) {
    throw new CmsAssetVerificationError(
      "The uploaded object has an unexpected media type.",
      "OBJECT_TYPE_MISMATCH",
    );
  }
  if (storedSize > 0 && storedSize !== size) {
    throw new CmsAssetVerificationError(
      "The uploaded object has an unexpected size.",
      "OBJECT_SIZE_MISMATCH",
    );
  }
}
