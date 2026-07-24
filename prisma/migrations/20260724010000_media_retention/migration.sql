ALTER TABLE "CmsAsset"
ADD COLUMN "lastReferencedAt" TIMESTAMP(3),
ADD COLUMN "retainedUntil" TIMESTAMP(3);

UPDATE "CmsAsset"
SET "lastReferencedAt" = "createdAt"
WHERE "lastReferencedAt" IS NULL;

CREATE INDEX "CmsAsset_retainedUntil_idx" ON "CmsAsset"("retainedUntil");
