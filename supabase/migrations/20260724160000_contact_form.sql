CREATE EXTENSION IF NOT EXISTS pgcrypto;

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

CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idempotency_key uuid NOT NULL UNIQUE,
  locale text NOT NULL CHECK (locale IN ('fr', 'en')),
  name text NOT NULL,
  visitor_email text NOT NULL,
  phone text,
  project_type text NOT NULL CHECK (
    project_type IN ('architecture', 'construction', 'excavation')
  ),
  subcategory text NOT NULL,
  budget_range text NOT NULL,
  message text NOT NULL,
  attachment_name text,
  attachment_type text,
  attachment_size integer,
  storage_path text UNIQUE,
  ip_hash text NOT NULL,
  user_agent text,
  status text NOT NULL DEFAULT 'PENDING' CHECK (
    status IN ('PENDING', 'PROCESSING', 'SENT', 'FAILED', 'REJECTED')
  ),
  resend_email_id text,
  error_code text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz
);

CREATE INDEX IF NOT EXISTS contact_submissions_ip_created_idx
ON public.contact_submissions (ip_hash, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_status_created_idx
ON public.contact_submissions (status, created_at DESC);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only the Edge Function's privileged client may access lead data. There are
-- deliberately no anon or authenticated RLS policies.
REVOKE ALL ON TABLE public.contact_submissions FROM anon, authenticated;
GRANT ALL ON TABLE public.contact_submissions TO service_role;

CREATE OR REPLACE FUNCTION public.set_contact_submission_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_contact_submission_updated_at
ON public.contact_submissions;

CREATE TRIGGER set_contact_submission_updated_at
BEFORE UPDATE ON public.contact_submissions
FOR EACH ROW
EXECUTE FUNCTION public.set_contact_submission_updated_at();
