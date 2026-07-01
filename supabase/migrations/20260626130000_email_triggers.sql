-- Trigger to send email notifications on waitlist approval
-- Requires the send-email edge function to be deployed

CREATE OR REPLACE FUNCTION public.notify_waitlist_approved()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    PERFORM
      net.http_post(
        url := CONCAT(current_setting('app.settings.edge_function_url'), '/send-email'),
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
        ),
        body := jsonb_build_object(
          'type', 'approved',
          'to', NEW.email,
          'name', split_part(NEW.email, '@', 1)
        )::text
      );
  END IF;
  RETURN NEW;
END;
$$;

-- Create the trigger on waitlist_signups
DROP TRIGGER IF EXISTS on_waitlist_approved ON public.waitlist_signups;
CREATE TRIGGER on_waitlist_approved
  AFTER UPDATE OF status ON public.waitlist_signups
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_waitlist_approved();

-- Also create a trigger for contact submissions to email the team
CREATE OR REPLACE FUNCTION public.notify_contact_submission()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  PERFORM
    net.http_post(
      url := CONCAT(current_setting('app.settings.edge_function_url'), '/send-email'),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', CONCAT('Bearer ', current_setting('app.settings.service_role_key'))
      ),
      body := jsonb_build_object(
        'type', 'contact',
        'to', 'nextwavehq@outlook.com',
        'name', NEW.name,
        'email', NEW.email,
        'intent', NEW.intent,
        'message', NEW.message
      )::text
    );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_contact_submitted ON public.contact_submissions;
CREATE TRIGGER on_contact_submitted
  AFTER INSERT ON public.contact_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_contact_submission();
