
-- Fix 1: Switch has_role to SECURITY INVOKER (users can read their own roles via existing policy)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Fix 2: Replace always-true INSERT policies with constrained WITH CHECK expressions
DROP POLICY IF EXISTS "Anyone can submit contact" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND length(email) BETWEEN 3 AND 320
  AND email LIKE '%_@_%.__%'
  AND length(organization) BETWEEN 1 AND 200
  AND length(intent) BETWEEN 1 AND 100
  AND length(message) BETWEEN 1 AND 5000
);

DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist_signups;
CREATE POLICY "Anyone can join waitlist"
ON public.waitlist_signups
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(email) BETWEEN 3 AND 320
  AND email LIKE '%_@_%.__%'
  AND length(source) BETWEEN 1 AND 100
);
