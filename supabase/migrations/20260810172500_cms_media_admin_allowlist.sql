-- Keep existing Supabase projects aligned with the CMS ADMIN_EMAILS allowlist.
-- The initial Storage migration may already be recorded, so update the live
-- policies in a separate forward migration instead of relying on it to rerun.

ALTER POLICY "Admin editors can upload site media"
ON storage.objects TO authenticated
WITH CHECK (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'sounds@soundseam.com',
    'groupepure@icloud.com'
  )
);

ALTER POLICY "Admin editors can update site media"
ON storage.objects TO authenticated
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

ALTER POLICY "Admin editors can delete site media"
ON storage.objects TO authenticated
USING (
  bucket_id = 'site-media'
  AND lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'sounds@soundseam.com',
    'groupepure@icloud.com'
  )
);
