ALTER TABLE public.contact_submissions
ADD COLUMN IF NOT EXISTS decision text NOT NULL DEFAULT 'ACCEPTED',
ADD COLUMN IF NOT EXISTS decision_reasons text[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS risk_score smallint NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS turnstile_status text NOT NULL DEFAULT 'NOT_CONFIGURED',
ADD COLUMN IF NOT EXISTS email_hash text,
ADD COLUMN IF NOT EXISTS content_hash text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contact_submissions_decision_check'
      AND conrelid = 'public.contact_submissions'::regclass
  ) THEN
    ALTER TABLE public.contact_submissions
    ADD CONSTRAINT contact_submissions_decision_check
    CHECK (decision IN ('ACCEPTED', 'QUARANTINED', 'REJECTED'));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'contact_submissions_risk_score_check'
      AND conrelid = 'public.contact_submissions'::regclass
  ) THEN
    ALTER TABLE public.contact_submissions
    ADD CONSTRAINT contact_submissions_risk_score_check
    CHECK (risk_score BETWEEN 0 AND 100);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS contact_submissions_decision_created_idx
ON public.contact_submissions (decision, created_at DESC);

CREATE INDEX IF NOT EXISTS contact_submissions_email_created_idx
ON public.contact_submissions (email_hash, created_at DESC)
WHERE email_hash IS NOT NULL;

CREATE INDEX IF NOT EXISTS contact_submissions_content_created_idx
ON public.contact_submissions (email_hash, content_hash, created_at DESC)
WHERE email_hash IS NOT NULL AND content_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.contact_rate_limits (
  scope text NOT NULL,
  key_hash text NOT NULL,
  window_start timestamptz NOT NULL,
  window_seconds integer NOT NULL CHECK (window_seconds > 0),
  request_count integer NOT NULL DEFAULT 1 CHECK (request_count > 0),
  expires_at timestamptz NOT NULL,
  PRIMARY KEY (scope, key_hash, window_start)
);

CREATE INDEX IF NOT EXISTS contact_rate_limits_expiry_idx
ON public.contact_rate_limits (expires_at);

ALTER TABLE public.contact_rate_limits ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.contact_rate_limits
FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.contact_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_contact_counter_private(
  p_scope text,
  p_key_hash text,
  p_window_start timestamptz,
  p_window_seconds integer,
  p_expires_at timestamptz
)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  INSERT INTO public.contact_rate_limits (
    scope,
    key_hash,
    window_start,
    window_seconds,
    request_count,
    expires_at
  )
  VALUES (
    p_scope,
    p_key_hash,
    p_window_start,
    p_window_seconds,
    1,
    p_expires_at
  )
  ON CONFLICT (scope, key_hash, window_start)
  DO UPDATE SET
    request_count = public.contact_rate_limits.request_count + 1,
    expires_at = GREATEST(
      public.contact_rate_limits.expires_at,
      EXCLUDED.expires_at
    )
  RETURNING request_count;
$$;

REVOKE ALL ON FUNCTION public.consume_contact_counter_private(
  text,
  text,
  timestamptz,
  integer,
  timestamptz
) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.consume_contact_rate_limits(
  p_ip_hash text,
  p_email_hash text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now timestamptz := clock_timestamp();
  v_minute_start timestamptz := date_trunc('minute', v_now);
  v_hour_start timestamptz := date_trunc('hour', v_now);
  v_day_start timestamptz := date_trunc('day', v_now);
  v_ip_minute integer;
  v_ip_hour integer;
  v_ip_day integer;
  v_email_hour integer;
  v_email_day integer;
  v_global_hour integer;
  v_decision text := 'ACCEPTED';
  v_reasons text[] := '{}';
BEGIN
  IF p_ip_hash IS NULL OR p_ip_hash = '' OR
     p_email_hash IS NULL OR p_email_hash = '' THEN
    RAISE EXCEPTION 'Rate-limit hashes are required';
  END IF;

  v_ip_minute := public.consume_contact_counter_private(
    'ip_minute',
    p_ip_hash,
    v_minute_start,
    60,
    v_minute_start + interval '10 minutes'
  );
  v_ip_hour := public.consume_contact_counter_private(
    'ip_hour',
    p_ip_hash,
    v_hour_start,
    3600,
    v_hour_start + interval '2 hours'
  );
  v_ip_day := public.consume_contact_counter_private(
    'ip_day',
    p_ip_hash,
    v_day_start,
    86400,
    v_day_start + interval '2 days'
  );
  v_email_hour := public.consume_contact_counter_private(
    'email_hour',
    p_email_hash,
    v_hour_start,
    3600,
    v_hour_start + interval '2 hours'
  );
  v_email_day := public.consume_contact_counter_private(
    'email_day',
    p_email_hash,
    v_day_start,
    86400,
    v_day_start + interval '2 days'
  );
  v_global_hour := public.consume_contact_counter_private(
    'global_hour',
    'contact_form',
    v_hour_start,
    3600,
    v_hour_start + interval '2 hours'
  );

  IF v_ip_minute > 3 THEN
    v_decision := 'QUARANTINED';
    v_reasons := array_append(v_reasons, 'IP_BURST');
  END IF;

  IF v_ip_hour > 10 THEN
    v_decision := 'QUARANTINED';
    v_reasons := array_append(v_reasons, 'IP_HOURLY_VOLUME');
  END IF;

  IF v_ip_day > 30 THEN
    v_decision := 'QUARANTINED';
    v_reasons := array_append(v_reasons, 'IP_DAILY_VOLUME');
  END IF;

  IF v_global_hour > 100 THEN
    v_decision := 'QUARANTINED';
    v_reasons := array_append(v_reasons, 'GLOBAL_VOLUME');
  END IF;

  IF v_email_hour > 5 THEN
    v_decision := 'REJECTED';
    v_reasons := array_append(v_reasons, 'EMAIL_HOURLY_LIMIT');
  END IF;

  IF v_email_day > 10 THEN
    v_decision := 'REJECTED';
    v_reasons := array_append(v_reasons, 'EMAIL_DAILY_LIMIT');
  END IF;

  RETURN jsonb_build_object(
    'decision', v_decision,
    'reasons', to_jsonb(v_reasons),
    'counts', jsonb_build_object(
      'ipMinute', v_ip_minute,
      'ipHour', v_ip_hour,
      'ipDay', v_ip_day,
      'emailHour', v_email_hour,
      'emailDay', v_email_day,
      'globalHour', v_global_hour
    )
  );
END;
$$;

REVOKE ALL ON FUNCTION public.consume_contact_rate_limits(text, text)
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_contact_rate_limits(text, text)
TO service_role;

CREATE OR REPLACE FUNCTION public.cleanup_contact_security_state()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_rate_rows integer := 0;
  v_submission_rows integer := 0;
BEGIN
  DELETE FROM public.contact_rate_limits
  WHERE expires_at < clock_timestamp();
  GET DIAGNOSTICS v_rate_rows = ROW_COUNT;

  DELETE FROM public.contact_submissions
  WHERE status IN ('PENDING', 'FAILED', 'REJECTED')
    AND storage_path IS NULL
    AND updated_at < clock_timestamp() - interval '30 days';
  GET DIAGNOSTICS v_submission_rows = ROW_COUNT;

  RETURN jsonb_build_object(
    'rateLimitRows', v_rate_rows,
    'submissionRows', v_submission_rows
  );
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_contact_security_state()
FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_contact_security_state()
TO service_role;

CREATE OR REPLACE VIEW public.contact_security_daily
WITH (security_invoker = true)
AS
SELECT
  date_trunc('day', created_at) AS day,
  decision,
  turnstile_status,
  count(*) AS submissions,
  count(*) FILTER (WHERE status = 'SENT') AS sent,
  count(*) FILTER (WHERE status = 'FAILED') AS failed
FROM public.contact_submissions
GROUP BY 1, 2, 3;

REVOKE ALL ON TABLE public.contact_security_daily
FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.contact_security_daily TO service_role;
