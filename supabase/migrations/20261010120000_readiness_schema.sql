-- NTRI (Nextwave School Tech Readiness Index) — core schema.
-- Run when the Supabase project is live. Nothing here is applied yet.

-- Rubric is versioned so future changes never rewrite historical scores.
CREATE TABLE public.rubric_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL UNIQUE,
  definition JSONB NOT NULL,
  effective_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  lga TEXT NOT NULL,
  ward TEXT,
  type TEXT NOT NULL CHECK (type IN ('public', 'private', 'mission')),
  level TEXT NOT NULL CHECK (level IN ('primary', 'secondary')),
  address TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  consent_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (consent_status IN ('pending', 'granted', 'declined')),
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX schools_lga_idx ON public.schools (lga);
CREATE INDEX schools_consent_idx ON public.schools (consent_status);

CREATE TABLE public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools (id) ON DELETE CASCADE,
  rubric_version_id UUID NOT NULL REFERENCES public.rubric_versions (id),
  assessment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'submitted', 'school_review', 'published', 'withheld')),
  review_deadline DATE,
  total_score NUMERIC(5, 1),
  tier TEXT CHECK (tier IN ('foundational', 'emerging', 'developing', 'advanced', 'leading')),
  assessor_a UUID REFERENCES auth.users (id),
  assessor_b UUID REFERENCES auth.users (id),
  published_at TIMESTAMPTZ,
  is_sample BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX assessments_school_idx ON public.assessments (school_id);
CREATE INDEX assessments_status_idx ON public.assessments (status);

CREATE TABLE public.indicator_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments (id) ON DELETE CASCADE,
  pillar TEXT NOT NULL,
  indicator_key TEXT NOT NULL,
  score INTEGER CHECK (score BETWEEN 0 AND 4),
  evidence_type TEXT NOT NULL
    CHECK (evidence_type IN ('observed', 'measured', 'document', 'self_reported')),
  notes TEXT,
  assessor_a_score INTEGER CHECK (assessor_a_score BETWEEN 0 AND 4),
  assessor_b_score INTEGER CHECK (assessor_b_score BETWEEN 0 AND 4),
  -- Self-reported evidence is capped at 2 of 4 points (enforced here and in the app).
  CONSTRAINT self_reported_cap CHECK (evidence_type <> 'self_reported' OR score IS NULL OR score <= 2),
  UNIQUE (assessment_id, indicator_key)
);

-- Aggregate only. No individual student records or names are ever stored.
CREATE TABLE public.student_cohort_aggregates (
  assessment_id UUID PRIMARY KEY REFERENCES public.assessments (id) ON DELETE CASCADE,
  sample_size INTEGER NOT NULL CHECK (sample_size >= 0),
  avg_literacy_score NUMERIC(5, 2),
  avg_aptitude_score NUMERIC(5, 2)
);

CREATE TABLE public.corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools (id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  evidence TEXT,
  contact_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'reviewing', 'resolved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX corrections_school_idx ON public.corrections (school_id);

-- Status-change audit log.
CREATE TABLE public.assessment_status_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES public.assessments (id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users (id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only admins may publish or withhold.
CREATE OR REPLACE FUNCTION public.enforce_publish_admin()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('published', 'withheld') AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NOT public.has_role(auth.uid(), 'admin') THEN
      RAISE EXCEPTION 'Only admins can publish or withhold an assessment';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assessments_publish_guard
  BEFORE UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.enforce_publish_admin();

CREATE OR REPLACE FUNCTION public.log_assessment_status()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.assessment_status_log (assessment_id, from_status, to_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER assessments_status_audit
  AFTER UPDATE ON public.assessments
  FOR EACH ROW EXECUTE FUNCTION public.log_assessment_status();
