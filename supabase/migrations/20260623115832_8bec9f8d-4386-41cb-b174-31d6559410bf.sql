
-- 1) Audit log table
CREATE TABLE public.admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_email text,
  action text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
-- No INSERT/UPDATE/DELETE policies — writes happen via SECURITY DEFINER RPCs only.

CREATE INDEX admin_audit_log_created_at_idx ON public.admin_audit_log (created_at DESC);

-- 2) Hardened delete RPCs (verify admin + write audit atomically)
CREATE OR REPLACE FUNCTION public.admin_delete_contact(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _row public.contact_submissions%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _row FROM public.contact_submissions WHERE id = _id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.contact_submissions WHERE id = _id;

  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_audit_log (admin_id, admin_email, action, target_table, target_id, metadata)
  VALUES (
    auth.uid(),
    _email,
    'delete',
    'contact_submissions',
    _id,
    jsonb_build_object('name', _row.name, 'email', _row.email, 'intent', _row.intent)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_waitlist(_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
  _row public.waitlist_signups%ROWTYPE;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT * INTO _row FROM public.waitlist_signups WHERE id = _id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found' USING ERRCODE = 'P0002';
  END IF;

  DELETE FROM public.waitlist_signups WHERE id = _id;

  SELECT email INTO _email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_audit_log (admin_id, admin_email, action, target_table, target_id, metadata)
  VALUES (
    auth.uid(),
    _email,
    'delete',
    'waitlist_signups',
    _id,
    jsonb_build_object('email', _row.email, 'source', _row.source)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_delete_contact(uuid) FROM public, anon;
REVOKE ALL ON FUNCTION public.admin_delete_waitlist(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.admin_delete_contact(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_waitlist(uuid) TO authenticated;
