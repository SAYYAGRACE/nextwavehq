-- Fix admin_id constraint (staff auth users don't have real Supabase Auth UIDs)
ALTER TABLE public.admin_audit_log ALTER COLUMN admin_id DROP NOT NULL;

-- Fix approve RPC: remove ::text cast on body in the trigger function
-- (handled in 20260626130000_email_triggers.sql update)

-- Recreate approve RPC with proper audit logging
CREATE OR REPLACE FUNCTION public.approve_waitlist_signup(_id uuid, _admin_email text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  SELECT email INTO _email FROM public.waitlist_signups WHERE id = _id;
  IF NOT FOUND THEN RETURN false; END IF;

  UPDATE public.waitlist_signups
  SET status = 'approved', approved_at = now(), approved_by = auth.uid(), reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _id;

  INSERT INTO public.nerdhaven_members (email, waitlist_signup_id)
  VALUES (_email, _id)
  ON CONFLICT (email) DO NOTHING;

  INSERT INTO public.admin_audit_log (admin_id, admin_email, action, target_table, target_id, metadata)
  VALUES (auth.uid(), _admin_email, 'approve', 'waitlist_signups', _id, jsonb_build_object('email', _email));

  RETURN true;
END;
$$;

-- Recreate reject RPC
CREATE OR REPLACE FUNCTION public.reject_waitlist_signup(_id uuid)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.waitlist_signups
  SET status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid()
  WHERE id = _id;
  RETURN true;
END;
$$;
