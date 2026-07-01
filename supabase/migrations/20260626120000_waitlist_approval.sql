-- Waitlist Approval Workflow
-- Adds status tracking to waitlist_signups and creates approval RPCs

ALTER TABLE public.waitlist_signups
  ADD COLUMN status text NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'approved', 'rejected'));

ALTER TABLE public.waitlist_signups
  ADD COLUMN approved_at timestamptz;

ALTER TABLE public.waitlist_signups
  ADD COLUMN approved_by uuid REFERENCES auth.users(id);

ALTER TABLE public.waitlist_signups
  ADD COLUMN reviewed_at timestamptz;

ALTER TABLE public.waitlist_signups
  ADD COLUMN reviewed_by uuid REFERENCES auth.users(id);

-- NerdHaven members table for approved registrations
CREATE TABLE public.nerdhaven_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  waitlist_signup_id uuid REFERENCES public.waitlist_signups(id),
  registered_at timestamptz NOT NULL DEFAULT now(),
  last_login_at timestamptz
);

GRANT SELECT, INSERT ON public.nerdhaven_members TO authenticated;
GRANT ALL ON public.nerdhaven_members TO service_role;

ALTER TABLE public.nerdhaven_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins read members" ON public.nerdhaven_members
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Service role manage members" ON public.nerdhaven_members
  FOR ALL TO service_role USING (true);

-- Grant update on waitlist_signups to authenticated users
GRANT UPDATE (status, approved_at, approved_by, reviewed_at, reviewed_by) ON public.waitlist_signups TO authenticated;

-- Update RLS for waitlist — admins can update
CREATE POLICY "Admins update waitlist" ON public.waitlist_signups
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Approve waitlist signup
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

  -- Add to nerdhaven_members
  INSERT INTO public.nerdhaven_members (email, waitlist_signup_id)
  VALUES (_email, _id)
  ON CONFLICT (email) DO NOTHING;

  -- Log audit
  INSERT INTO public.admin_audit_log (admin_id, admin_email, action, target_table, target_id, metadata)
  VALUES (auth.uid(), _admin_email, 'approve', 'waitlist_signups', _id::text, jsonb_build_object('email', _email));

  RETURN true;
END;
$$;

-- Reject waitlist signup
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

GRANT EXECUTE ON FUNCTION public.approve_waitlist_signup TO authenticated;
GRANT EXECUTE ON FUNCTION public.reject_waitlist_signup TO authenticated;
