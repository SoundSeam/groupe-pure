CREATE TYPE "CmsRevisionState" AS ENUM ('DRAFT', 'PUBLISHED');

CREATE TABLE "CmsPage" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "draftContent" JSONB NOT NULL DEFAULT '{}',
    "publishedContent" JSONB NOT NULL DEFAULT '{}',
    "revision" INTEGER NOT NULL DEFAULT 0,
    "publishedRevision" INTEGER NOT NULL DEFAULT 0,
    "updatedBy" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CmsRevision" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "state" "CmsRevisionState" NOT NULL,
    "content" JSONB NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CmsRevision_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CmsAsset" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "fieldKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CmsAsset_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CmsPage_path_key" ON "CmsPage"("path");
CREATE INDEX "CmsPage_locale_idx" ON "CmsPage"("locale");
CREATE UNIQUE INDEX "CmsRevision_pageId_revision_key" ON "CmsRevision"("pageId", "revision");
CREATE INDEX "CmsRevision_pageId_state_createdAt_idx" ON "CmsRevision"("pageId", "state", "createdAt");
CREATE UNIQUE INDEX "CmsAsset_storagePath_key" ON "CmsAsset"("storagePath");
CREATE INDEX "CmsAsset_pageId_fieldKey_createdAt_idx" ON "CmsAsset"("pageId", "fieldKey", "createdAt");

ALTER TABLE "CmsRevision"
ADD CONSTRAINT "CmsRevision_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CmsAsset"
ADD CONSTRAINT "CmsAsset_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

DO $$
BEGIN
  -- Supabase projects provide the storage schema. Keeping this conditional
  -- also lets Prisma validate the migration in a plain Postgres shadow DB.
  IF EXISTS (SELECT 1 FROM pg_namespace WHERE nspname = 'storage') THEN
    EXECUTE $storage$
      INSERT INTO storage.buckets (
        id,
        name,
        public,
        file_size_limit,
        allowed_mime_types
      )
      VALUES (
        'site-media',
        'site-media',
        true,
        52428800,
        ARRAY[
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/gif',
          'image/avif',
          'video/mp4',
          'video/webm',
          'video/quicktime'
        ]
      )
      ON CONFLICT (id) DO UPDATE SET
        public = EXCLUDED.public,
        file_size_limit = EXCLUDED.file_size_limit,
        allowed_mime_types = EXCLUDED.allowed_mime_types
    $storage$;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Authenticated editors can upload site media'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "Authenticated editors can upload site media"
        ON storage.objects FOR INSERT TO authenticated
        WITH CHECK (bucket_id = 'site-media')
      $policy$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Authenticated editors can update site media'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "Authenticated editors can update site media"
        ON storage.objects FOR UPDATE TO authenticated
        USING (bucket_id = 'site-media')
        WITH CHECK (bucket_id = 'site-media')
      $policy$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Authenticated editors can delete site media'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "Authenticated editors can delete site media"
        ON storage.objects FOR DELETE TO authenticated
        USING (bucket_id = 'site-media')
      $policy$;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'storage'
        AND tablename = 'objects'
        AND policyname = 'Site media is publicly readable'
    ) THEN
      EXECUTE $policy$
        CREATE POLICY "Site media is publicly readable"
        ON storage.objects FOR SELECT TO public
        USING (bucket_id = 'site-media')
      $policy$;
    END IF;
  END IF;
END
$$;
