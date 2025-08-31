-- Fix remaining database functions missing search_path
-- These functions were identified by the security linter

-- Fix validate_lesson_content function
CREATE OR REPLACE FUNCTION public.validate_lesson_content()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Validate LaTeX expressions (max 50 chars, inline only)
  IF NEW.content_data IS NOT NULL THEN
    -- Basic validation for content structure
    IF NOT (NEW.content_data ? 'theory' OR NEW.content_data ? 'examples' OR NEW.content_data ? 'practiceExercises') THEN
      RAISE EXCEPTION 'Content must contain at least one of: theory, examples, practiceExercises';
    END IF;
  END IF;
  
  -- Validate generator_params microSkill
  IF NEW.generator_params IS NOT NULL AND NEW.generator_params ? 'microSkill' THEN
    IF NOT (NEW.generator_params->>'microSkill' IN (
      'linear_equations', 'quadratic_equations', 'factoring', 'area_perimeter', 
      'angles', 'transformations', 'basic_operations', 'fractions', 'decimals',
      'linear_functions', 'graphing', 'domain_range', 'arithmetic', 'geometric',
      'patterns', 'basic_ratios', 'unit_circle', 'identities', 'derivatives',
      'integrals', 'applications', 'probability', 'descriptive', 'combinatorics',
      'default'
    )) THEN
      -- Auto-correct invalid microSkill to 'default'
      NEW.generator_params = jsonb_set(NEW.generator_params, '{microSkill}', '"default"');
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_learner_profile_from_session function
CREATE OR REPLACE FUNCTION public.update_learner_profile_from_session()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  -- Update total learning time and session count
  UPDATE public.universal_learner_profiles 
  SET 
    total_learning_time_minutes = total_learning_time_minutes + 
      COALESCE(EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60, 0),
    sessions_completed = sessions_completed + 1,
    concepts_mastered = concepts_mastered + 
      COALESCE(jsonb_array_length(NEW.concepts_learned), 0),
    last_interaction_summary = jsonb_build_object(
      'session_type', NEW.session_type,
      'performance', NEW.engagement_score,
      'concepts_learned', COALESCE(jsonb_array_length(NEW.concepts_learned), 0),
      'duration_minutes', EXTRACT(EPOCH FROM (NEW.completed_at - NEW.started_at))/60
    ),
    current_learning_context = jsonb_build_object(
      'last_skill', NEW.skill_focus,
      'last_department', NEW.department,
      'current_difficulty', NEW.difficulty_level,
      'momentum', NEW.learning_momentum
    ),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Fix update_learner_profile_timestamp function
CREATE OR REPLACE FUNCTION public.update_learner_profile_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.learner_profile = jsonb_set(
    COALESCE(NEW.learner_profile, '{}'::jsonb),
    '{last_updated}',
    to_jsonb(NOW()::text)
  );
  RETURN NEW;
END;
$$;

-- Fix generate_join_code function
CREATE OR REPLACE FUNCTION public.generate_join_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(chars, trunc(random() * length(chars))::integer + 1, 1);
    END LOOP;
    RETURN result;
END;
$$;