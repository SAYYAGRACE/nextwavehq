-- Extend the app_role enum with the NTRI roles.
-- Kept in its own migration because a new enum value cannot be used in the
-- same transaction that adds it.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'assessor';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'reviewer';
