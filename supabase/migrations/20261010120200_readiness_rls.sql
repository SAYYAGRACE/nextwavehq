-- NTRI security: RLS policies + public read-only views.
-- Public (anon) can NEVER read base tables directly; only the filtered views,
-- and only published + consent-granted records. Contact details are never exposed.

ALTER TABLE public.rubric_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicator_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cohort_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_status_log ENABLE ROW LEVEL SECURITY;

-- Base tables are closed to anonymous users. Staff access is granted below.
REVOKE ALL ON public.schools FROM anon;
REVOKE ALL ON public.assessments FROM anon;
REVOKE ALL ON public.indicator_scores FROM anon;
REVOKE ALL ON public.student_cohort_aggregates FROM anon;
REVOKE ALL ON public.assessment_status_log FROM anon;
REVOKE ALL ON public.rubric_versions FROM anon;

GRANT SELECT ON public.rubric_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.schools TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.indicator_scores TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.student_cohort_aggregates TO authenticated;
GRANT SELECT ON public.assessment_status_log TO authenticated;
GRANT INSERT, SELECT ON public.corrections TO authenticated, anon;

-- Staff can manage readiness data. Admins can do anything.
CREATE OR REPLACE FUNCTION public.is_readiness_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'assessor')
      OR public.has_role(auth.uid(), 'reviewer');
$$;

CREATE POLICY "staff read schools" ON public.schools
  FOR SELECT TO authenticated USING (public.is_readiness_staff());
CREATE POLICY "assessors write schools" ON public.schools
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "assessors update schools" ON public.schools
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete schools" ON public.schools
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "staff read assessments" ON public.assessments
  FOR SELECT TO authenticated USING (public.is_readiness_staff());
CREATE POLICY "assessors create assessments" ON public.assessments
  FOR INSERT TO authenticated WITH CHECK (
    (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'))
    AND status IN ('draft', 'submitted')
  );
CREATE POLICY "assessors update assessments" ON public.assessments
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete assessments" ON public.assessments
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "staff read scores" ON public.indicator_scores
  FOR SELECT TO authenticated USING (public.is_readiness_staff());
CREATE POLICY "assessors write scores" ON public.indicator_scores
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'assessor')
        AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.status = 'draft'))
  );
CREATE POLICY "assessors update scores" ON public.indicator_scores
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), 'admin')
    OR (public.has_role(auth.uid(), 'assessor')
        AND EXISTS (SELECT 1 FROM public.assessments a WHERE a.id = assessment_id AND a.status = 'draft'))
  );

CREATE POLICY "staff read cohort" ON public.student_cohort_aggregates
  FOR SELECT TO authenticated USING (public.is_readiness_staff());
CREATE POLICY "assessors write cohort" ON public.student_cohort_aggregates
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'assessor') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "anyone can submit a correction" ON public.corrections
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "staff read corrections" ON public.corrections
  FOR SELECT TO authenticated USING (public.is_readiness_staff());
CREATE POLICY "admins update corrections" ON public.corrections
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "staff read status log" ON public.assessment_status_log
  FOR SELECT TO authenticated USING (public.is_readiness_staff());

-- ---------------------------------------------------------------------------
-- Public read-only views (owner = postgres, so they bypass base-table RLS).
-- They expose ONLY safe columns, and only published + consent-granted rows.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE VIEW public.public_schools AS
SELECT s.id, s.name, s.slug, s.lga, s.ward, s.type, s.level
FROM public.schools s
WHERE s.consent_status = 'granted'
  AND EXISTS (
    SELECT 1 FROM public.assessments a
    WHERE a.school_id = s.id AND a.status = 'published'
  );

CREATE OR REPLACE VIEW public.public_assessments AS
SELECT a.id, a.school_id, a.assessment_date, a.total_score, a.tier, a.published_at, r.version AS rubric_version
FROM public.assessments a
JOIN public.schools s ON s.id = a.school_id
JOIN public.rubric_versions r ON r.id = a.rubric_version_id
WHERE a.status = 'published' AND s.consent_status = 'granted';

CREATE OR REPLACE VIEW public.public_indicator_scores AS
SELECT i.id, i.assessment_id, i.pillar, i.indicator_key, i.score, i.evidence_type
FROM public.indicator_scores i
JOIN public.assessments a ON a.id = i.assessment_id
JOIN public.schools s ON s.id = a.school_id
WHERE a.status = 'published' AND s.consent_status = 'granted';

-- Aggregates: only shown where at least 5 schools contribute.
CREATE OR REPLACE VIEW public.public_lga_averages AS
SELECT s.lga,
       COUNT(DISTINCT s.id) AS schools,
       ROUND(AVG(a.total_score), 1) AS average_score
FROM public.schools s
JOIN public.assessments a ON a.school_id = s.id AND a.status = 'published'
WHERE s.consent_status IN ('granted', 'declined')
GROUP BY s.lga
HAVING COUNT(DISTINCT s.id) >= 5;

GRANT SELECT ON public.public_schools TO anon, authenticated;
GRANT SELECT ON public.public_assessments TO anon, authenticated;
GRANT SELECT ON public.public_indicator_scores TO anon, authenticated;
GRANT SELECT ON public.public_lga_averages TO anon, authenticated;
