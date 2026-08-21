-- The CMS database is hosted separately, but its media objects live in
-- Supabase Storage. Keep this setup in the Supabase migration stream so a
-- regular `supabase db push` installs the bucket and its RLS policies.

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
    'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Remove both the original broad policies and the current admin-only policy
-- before recreating the desired rules. This also repairs partially configured
-- environments where the bucket exists but the INSERT policy does not.
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
  AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'sounds@soundseam.com',
    'groupepure@icloud.com'
  )
);

CREATE POLICY "Admin editors can update site media"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'sounds@soundseam.com',
    'groupepure@icloud.com'
  )
)
WITH CHECK (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'sounds@soundseam.com',
    'groupepure@icloud.com'
  )
);

CREATE POLICY "Admin editors can delete site media"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'sounds@soundseam.com',
    'groupepure@icloud.com'
  )
);

-- Public object URLs remain readable because the bucket is public. Deliberately
-- omit a SELECT policy so clients cannot list every CMS upload.
