-- Run in the Supabase SQL Editor. The application database lives in Neon;
-- Supabase is used for authentication and media storage.
--
-- Keep the email below aligned with ADMIN_EMAILS.

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
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
VALUES (
  'contact-attachments',
  'contact-attachments',
  false,
  20971520,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/heic',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated editors can upload site media"
ON storage.objects;
DROP POLICY IF EXISTS "Authenticated editors can update site media"
ON storage.objects;
DROP POLICY IF EXISTS "Authenticated editors can delete site media"
ON storage.objects;
DROP POLICY IF EXISTS "Site media is publicly readable"
ON storage.objects;
DROP POLICY IF EXISTS "Admin editors can upload site media"
ON storage.objects;
DROP POLICY IF EXISTS "Admin editors can update site media"
ON storage.objects;
DROP POLICY IF EXISTS "Admin editors can delete site media"
ON storage.objects;

CREATE POLICY "Admin editors can upload site media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'sounds@soundseam.com'
);

CREATE POLICY "Admin editors can update site media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'sounds@soundseam.com'
)
WITH CHECK (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'sounds@soundseam.com'
);

CREATE POLICY "Admin editors can delete site media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = 'sounds@soundseam.com'
);

-- Public buckets serve object URLs without a broad SELECT policy. Omitting
-- that policy prevents clients from listing every file in the bucket.
