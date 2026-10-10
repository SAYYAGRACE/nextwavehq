-- NTRI email + review workflow.
-- Run when the Supabase project is live. Nothing here is applied yet.

-- Extend assessments with the delivery-gated review clock + contact state.
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS review_window_starts_at timestamptz,
  ADD COLUMN IF NOT EXISTS review_window_source text
    CHECK (review_window_source IN ('delivered', 'other_channel')),
  ADD COLUMN IF NOT EXISTS contacted_by_other_channel_at timestamptz,
  ADD COLUMN IF NOT EXISTS contact_status text NOT NULL DEFAULT 'pending'
    CHECK (contact_status IN ('pending', 'contacted', 'delivered', 'contact_undeliverable'));

-- One or more contacts per school; a WhatsApp/SMS number enables fallback channels.
CREATE TABLE public.school_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  name text,
  email text,
  whatsapp_e164 text CHECK (whatsapp_e164 IS NULL OR whatsapp_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  sms_e164 text CHECK (sms_e164 IS NULL OR sms_e164 ~ '^\+[1-9][0-9]{6,14}$'),
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX school_contacts_school_idx ON public.school_contacts (school_id);
CREATE UNIQUE INDEX school_contacts_one_primary_idx
  ON public.school_contacts (school_id) WHERE is_primary;

-- Every outbound email is logged and tracked through the provider lifecycle.
CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  recipient text NOT NULL,
  school_id uuid REFERENCES public.schools (id) ON DELETE SET NULL,
  assessment_id uuid REFERENCES public.assessments (id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'sent', 'delivered', 'bounced', 'complained', 'failed')),
  provider_message_id text,
  error text,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  next_attempt_at timestamptz,
  last_attempt_at timestamptz,
  template_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX email_log_status_due_idx ON public.email_log (status, next_attempt_at);
CREATE INDEX email_log_provider_idx ON public.email_log (provider_message_id);
CREATE INDEX email_log_school_idx ON public.email_log (school_id);
CREATE INDEX email_log_assessment_idx ON public.email_log (assessment_id);

-- Single-use signed links. We store only the hash of the token, never the token.
CREATE TABLE public.review_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid NOT NULL REFERENCES public.assessments (id) ON DELETE CASCADE,
  school_id uuid NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  opened_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX review_tokens_assessment_idx ON public.review_tokens (assessment_id);

-- Public-facing review activity (opens + actions). Feeds the audit trail.
CREATE TABLE public.review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id uuid REFERENCES public.assessments (id) ON DELETE CASCADE,
  school_id uuid REFERENCES public.schools (id) ON DELETE CASCADE,
  token_id uuid REFERENCES public.review_tokens (id) ON DELETE SET NULL,
  event text NOT NULL
    CHECK (event IN ('opened', 'consented', 'declined', 'correction_submitted', 'assessment_submitted')),
  ip_hash text,
  user_agent text,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX review_events_assessment_idx ON public.review_events (assessment_id);
CREATE INDEX review_events_created_idx ON public.review_events (created_at DESC);

-- Internal alerts surfaced to admins (final delivery failure, approaching deadlines…).
CREATE TABLE public.admin_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  title text NOT NULL,
  body text,
  school_id uuid REFERENCES public.schools (id) ON DELETE SET NULL,
  assessment_id uuid REFERENCES public.assessments (id) ON DELETE SET NULL,
  email_log_id uuid REFERENCES public.email_log (id) ON DELETE SET NULL,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_alerts_open_idx ON public.admin_alerts (resolved_at, created_at DESC);

-- Keep updated_at fresh on email_log.
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER email_log_touch
  BEFORE UPDATE ON public.email_log
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Delivery confirmation starts the review clock (once). The clock never starts
-- on "sent" — only on a real "delivered" event from the provider.
CREATE OR REPLACE FUNCTION public.start_review_clock_on_delivery()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'delivered'
     AND OLD.status IS DISTINCT FROM 'delivered'
     AND NEW.assessment_id IS NOT NULL
     AND NEW.type IN ('consent_request', 'review_link_invitation') THEN
    UPDATE public.assessments
       SET review_window_starts_at = COALESCE(review_window_starts_at, now()),
           review_window_source = COALESCE(review_window_source, 'delivered'),
           contact_status = 'delivered'
     WHERE id = NEW.assessment_id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER email_log_delivery_starts_review
  AFTER UPDATE ON public.email_log
  FOR EACH ROW EXECUTE FUNCTION public.start_review_clock_on_delivery();

-- Admin action: the school was reached by WhatsApp/SMS instead of email, so the
-- review clock may start even without a delivered email.
CREATE OR REPLACE FUNCTION public.mark_contacted_other_channel(_assessment_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _email text;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  UPDATE public.assessments
     SET contacted_by_other_channel_at = COALESCE(contacted_by_other_channel_at, now()),
         review_window_starts_at = COALESCE(review_window_starts_at, now()),
         review_window_source = COALESCE(review_window_source, 'other_channel'),
         contact_status = 'contacted'
   WHERE id = _assessment_id;

  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_audit_log (admin_id, admin_email, action, target_table, target_id, metadata)
  VALUES (auth.uid(), _email, 'contacted_other_channel', 'assessments', _assessment_id, '{}'::jsonb);
END;
$$;

-- Final delivery failure: alert admins and mark the assessment undeliverable.
CREATE OR REPLACE FUNCTION public.mark_contact_undeliverable(_assessment_id uuid, _error text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.assessments
     SET contact_status = 'contact_undeliverable'
   WHERE id = _assessment_id;

  INSERT INTO public.admin_alerts (kind, severity, title, body, assessment_id)
  VALUES (
    'contact_undeliverable',
    'critical',
    'School contact undeliverable',
    COALESCE(_error, 'Email delivery failed after all retries.'),
    _assessment_id
  );
END;
$$;

-- Enable RLS.
ALTER TABLE public.school_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_alerts ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.school_contacts TO authenticated;
GRANT SELECT ON public.email_log TO authenticated;
GRANT SELECT ON public.review_tokens TO authenticated;
GRANT SELECT ON public.review_events TO authenticated;
GRANT SELECT, UPDATE ON public.admin_alerts TO authenticated;

GRANT ALL ON public.school_contacts TO service_role;
GRANT ALL ON public.email_log TO service_role;
GRANT ALL ON public.review_tokens TO service_role;
GRANT ALL ON public.review_events TO service_role;
GRANT ALL ON public.admin_alerts TO service_role;

-- Admins manage contacts; only admins read delivery/audit data.
CREATE POLICY "Admins manage school contacts"
  ON public.school_contacts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read email log"
  ON public.email_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read review tokens"
  ON public.review_tokens FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read review events"
  ON public.review_events FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read alerts"
  ON public.admin_alerts FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins resolve alerts"
  ON public.admin_alerts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON FUNCTION public.mark_contacted_other_channel(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_contacted_other_channel(uuid) TO authenticated, service_role;
REVOKE ALL ON FUNCTION public.mark_contact_undeliverable(uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_contact_undeliverable(uuid, text) TO service_role;
