-- NTRI sample data. Clearly labelled demo schools ONLY. Never treat as real.
-- Single flag removal:  DELETE FROM public.assessments WHERE is_sample;
--                       DELETE FROM public.schools WHERE is_sample;
-- (indicator_scores / cohort rows cascade from assessments.)

INSERT INTO public.rubric_versions (version, effective_date, definition)
VALUES (
  '1.0',
  '2026-10-01',
  '{"scale":{"min":0,"max":4},"tiers":[{"key":"foundational","min":0,"max":24},{"key":"emerging","min":25,"max":49},{"key":"developing","min":50,"max":69},{"key":"advanced","min":70,"max":84},{"key":"leading","min":85,"max":100}]}'::jsonb
)
ON CONFLICT (version) DO NOTHING;

DO $$
DECLARE
  v_rubric UUID;
  ind RECORD;
  sch RECORD;
  v_assessment UUID;
  v_total NUMERIC(5,1);
  v_tier TEXT;
  v_score INTEGER;
  v_prev UUID;
  v_prev_total NUMERIC(5,1);
BEGIN
  SELECT id INTO v_rubric FROM public.rubric_versions WHERE version = '1.0';

  CREATE TEMP TABLE seed_schools (
    name TEXT, slug TEXT, lga TEXT, ward TEXT, type TEXT, level TEXT, consent TEXT, drift INT
  ) ON COMMIT DROP;

  INSERT INTO seed_schools VALUES
    ('Sardauna Model Primary School','sardauna-model-primary','Kaduna North','Sardauna','public','primary','granted',2),
    ('Unguwan Rimi Secondary School','unguwan-rimi-secondary','Kaduna North','Unguwan Rimi','public','secondary','granted',1),
    ('Heritage International Academy','heritage-international-academy','Kaduna North','GRA','private','secondary','granted',1),
    ('Al-Hikmah Science College','al-hikmah-science-college','Kaduna North','Kabala','mission','secondary','granted',0),
    ('GRA Model Nursery & Primary','gra-model-nursery-primary','Kaduna North','GRA','private','primary','granted',2),
    ('Kabala Community Secondary School','kabala-community-secondary','Kaduna North','Kabala','public','secondary','granted',0),
    ('Sabo GRA Primary School','sabo-gra-primary','Chikun','Sabo','public','primary','granted',0),
    ('Christ the King College','christ-the-king-college','Chikun','Narayi','mission','secondary','granted',1),
    ('Narayi Unity Secondary School','narayi-unity-secondary','Chikun','Narayi','public','secondary','granted',0),
    ('Bright Future Academy','bright-future-academy','Chikun','Kujama','private','primary','granted',1),
    ('Government Girls College Zaria','government-girls-college-zaria','Zaria','Tudun Wada','public','secondary','granted',2),
    ('Aliyu Dansidi College','aliyu-dansidi-college','Zaria','Dambo','mission','secondary','declined',0);

  CREATE TEMP TABLE ind (pillar TEXT, key TEXT, weight INT, evidence TEXT) ON COMMIT DROP;
  INSERT INTO ind VALUES
    ('power','grid_reliability',6,'observed'),
    ('power','backup_power',5,'observed'),
    ('power','secure_equipment_room',4,'observed'),
    ('devices','devices_per_student',8,'measured'),
    ('devices','devices_functional',6,'measured'),
    ('devices','lab_access_scheduling',6,'observed'),
    ('connectivity','internet_availability',6,'observed'),
    ('connectivity','download_speed',5,'measured'),
    ('connectivity','staff_student_access',4,'self_reported'),
    ('curriculum','ict_on_timetable',7,'document'),
    ('curriculum','teacher_digital_skills',7,'observed'),
    ('curriculum','trained_ict_staff',6,'document'),
    ('students','digital_literacy_test',10,'measured'),
    ('students','aptitude_test',10,'measured'),
    ('leadership','ict_plan',3,'document'),
    ('leadership','budget_maintenance',4,'document'),
    ('leadership','safeguarding_policy',3,'document');

  FOR sch IN SELECT * FROM seed_schools LOOP
    INSERT INTO public.schools (name, slug, lga, ward, type, level, address, consent_status, is_sample)
    VALUES (sch.name, sch.slug, sch.lga, sch.ward, sch.type, sch.level, sch.ward || ', ' || sch.lga,
            sch.consent, true)
    RETURNING id INTO v_assessment; -- stash school id temporarily

    -- Published assessment for every sampled school.
    INSERT INTO public.assessments
      (school_id, rubric_version_id, assessment_date, status, total_score, tier, published_at, is_sample)
    VALUES (v_assessment, v_rubric, '2026-03-18', 'published', 0, 'foundational', '2026-03-20T12:00:00Z', true)
    RETURNING id INTO v_assessment;

    FOR ind IN SELECT * FROM ind LOOP
      v_score := LEAST(4, GREATEST(0, (ABS(hashtext(sch.slug || ind.key)) % 5) + sch.drift - 1));
      IF ind.evidence = 'self_reported' THEN v_score := LEAST(v_score, 2); END IF;
      INSERT INTO public.indicator_scores
        (assessment_id, pillar, indicator_key, score, evidence_type, assessor_a_score, assessor_b_score)
      VALUES (v_assessment, ind.pillar, ind.key, v_score, ind.evidence, v_score, v_score);
    END LOOP;

    SELECT ROUND(SUM(
      (LEAST(COALESCE(s.score,0), CASE WHEN s.evidence_type='self_reported' THEN 2 ELSE 4 END) / 4.0) * i.weight
    ), 1)
    INTO v_total
    FROM public.indicator_scores s JOIN ind i ON i.key = s.indicator_key
    WHERE s.assessment_id = v_assessment;

    v_tier := CASE
      WHEN v_total <= 24 THEN 'foundational'
      WHEN v_total <= 49 THEN 'emerging'
      WHEN v_total <= 69 THEN 'developing'
      WHEN v_total <= 84 THEN 'advanced'
      ELSE 'leading' END;

    UPDATE public.assessments SET total_score = v_total, tier = v_tier WHERE id = v_assessment;

    INSERT INTO public.student_cohort_aggregates (assessment_id, sample_size, avg_literacy_score, avg_aptitude_score)
    VALUES (v_assessment, 45, 42, 39);

    -- A prior (lower) published assessment for two schools, to exercise trends.
    IF sch.slug IN ('sardauna-model-primary', 'unguwan-rimi-secondary') THEN
      INSERT INTO public.assessments
        (school_id, rubric_version_id, assessment_date, status, total_score, tier, published_at, is_sample)
      SELECT school_id, v_rubric, '2025-03-12', 'published',
             GREATEST(0, v_total - 15), 'emerging', '2025-03-14T12:00:00Z', true
      FROM public.assessments WHERE id = v_assessment
      RETURNING id INTO v_prev;
      FOR ind IN SELECT * FROM ind LOOP
        INSERT INTO public.indicator_scores
          (assessment_id, pillar, indicator_key, score, evidence_type, assessor_a_score, assessor_b_score)
        SELECT v_prev, ind.pillar, ind.key,
               GREATEST(0, LEAST(COALESCE(s.score,0), CASE WHEN s.evidence_type='self_reported' THEN 2 ELSE 4 END) - 1),
               ind.evidence, 0, 0
        FROM public.indicator_scores s WHERE s.assessment_id = v_assessment AND s.indicator_key = ind.key;
      END LOOP;
    END IF;
  END LOOP;

  -- Non-published records that must never surface publicly.
  INSERT INTO public.assessments (school_id, rubric_version_id, assessment_date, status, is_sample)
  SELECT id, v_rubric, '2026-09-01', 'draft', true FROM public.schools WHERE slug = 'heritage-international-academy';
  INSERT INTO public.assessments (school_id, rubric_version_id, assessment_date, status, is_sample)
  SELECT id, v_rubric, '2026-08-20', 'withheld', true FROM public.schools WHERE slug = 'narayi-unity-secondary';
END $$;
