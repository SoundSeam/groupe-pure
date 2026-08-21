-- Nullable visibility preserves the existing FULL_SITE_ENABLED behavior until
-- an administrator explicitly changes a page. No existing content is altered.
ALTER TABLE "CmsPage"
ADD COLUMN "isVisible" BOOLEAN,
ADD COLUMN "visibilityUpdatedBy" TEXT;
