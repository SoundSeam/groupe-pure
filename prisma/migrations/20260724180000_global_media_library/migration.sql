ALTER TABLE "CmsAsset"
DROP CONSTRAINT "CmsAsset_pageId_fkey";

ALTER TABLE "CmsAsset"
ALTER COLUMN "pageId" DROP NOT NULL;

ALTER TABLE "CmsAsset"
ADD CONSTRAINT "CmsAsset_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "CmsAsset_createdAt_idx" ON "CmsAsset"("createdAt");
