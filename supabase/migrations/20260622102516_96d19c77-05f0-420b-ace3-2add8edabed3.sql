
CREATE OR REPLACE FUNCTION public.handle_new_user_auto_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.email IN ('francejamie529@gmail.com', 'khalifamuhammad091@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_auto_admin
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_auto_admin();

-- Backfill any existing users matching those emails
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role FROM auth.users
WHERE email IN ('francejamie529@gmail.com', 'khalifamuhammad091@gmail.com')
ON CONFLICT (user_id, role) DO NOTHING;
