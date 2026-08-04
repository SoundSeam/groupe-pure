BEGIN;

CREATE TABLE "CmsAssetUsage" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "inDraft" BOOLEAN NOT NULL DEFAULT false,
    "inPublished" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsAssetUsage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CmsAssetUsage_assetId_pageId_fieldKey_key"
ON "CmsAssetUsage"("assetId", "pageId", "fieldKey");

CREATE INDEX "CmsAssetUsage_pageId_fieldKey_idx"
ON "CmsAssetUsage"("pageId", "fieldKey");

CREATE INDEX "CmsAssetUsage_assetId_inDraft_inPublished_idx"
ON "CmsAssetUsage"("assetId", "inDraft", "inPublished");

ALTER TABLE "CmsAssetUsage"
ADD CONSTRAINT "CmsAssetUsage_assetId_fkey"
FOREIGN KEY ("assetId") REFERENCES "CmsAsset"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CmsAssetUsage"
ADD CONSTRAINT "CmsAssetUsage_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
