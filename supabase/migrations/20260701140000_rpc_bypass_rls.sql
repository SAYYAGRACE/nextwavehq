-- RPC functions that bypass RLS for staff auth (which doesn't use real Supabase Auth)
-- These are SECURITY DEFINER so they run with the privileges of the function owner (service_role)

CREATE OR REPLACE FUNCTION public.get_waitlist_signups()
RETURNS SETOF public.waitlist_signups
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.waitlist_signups ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_contact_submissions()
RETURNS SETOF public.contact_submissions
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.contact_submissions ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_admin_audit_log()
RETURNS SETOF public.admin_audit_log
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.admin_audit_log ORDER BY created_at DESC LIMIT 200;
END;
$$;
