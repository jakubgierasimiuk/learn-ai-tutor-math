-- Create unified skill content table
CREATE TABLE public.unified_skill_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  skill_id UUID NOT NULL UNIQUE,
  content_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_complete BOOLEAN NOT NULL DEFAULT false,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.unified_skill_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view unified skill content" 
ON public.unified_skill_content 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage unified skill content" 
ON public.unified_skill_content 
FOR ALL 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_unified_skill_content_skill_id ON public.unified_skill_content(skill_id);
CREATE INDEX idx_unified_skill_content_complete ON public.unified_skill_content(is_complete);

-- Create trigger for updated_at
CREATE TRIGGER update_unified_skill_content_updated_at
BEFORE UPDATE ON public.unified_skill_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate complete skill data
INSERT INTO public.unified_skill_content (skill_id, content_data, metadata, is_complete)
SELECT 
  s.id as skill_id,
  jsonb_build_object(
    'theory', COALESCE(
      (
        SELECT jsonb_build_object(
          'title', stc.title,
          'content', stc.content,
          'key_concepts', stc.key_concepts,
          'formulas', stc.formulas,
          'created_at', stc.created_at
        )
        FROM skill_theory_content stc
        WHERE stc.skill_id = s.id AND stc.is_active = true
        LIMIT 1
      ), 
      '{}'::jsonb
    ),
    'examples', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'title', se.title,
            'problem_statement', se.problem_statement,
            'solution_steps', se.solution_steps,
            'final_answer', se.final_answer,
            'explanation', se.explanation,
            'difficulty_level', se.difficulty_level
          )
        )
        FROM skill_examples se
        WHERE se.skill_id = s.id AND se.is_active = true
      ),
      '[]'::jsonb
    ),
    'exercises', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'exercise_code', spe.exercise_code,
            'problem_statement', spe.problem_statement,
            'expected_answer', spe.expected_answer,
            'difficulty_level', spe.difficulty_level,
            'time_estimate', spe.time_estimate,
            'misconception_map', spe.misconception_map,
            'hints', spe.hints
          )
        )
        FROM skill_practice_exercises spe
        WHERE spe.skill_id = s.id AND spe.is_active = true
      ),
      '[]'::jsonb
    ),
    'pedagogical_notes', COALESCE(
      (
        SELECT jsonb_build_object(
          'scaffolding_questions', spn.scaffolding_questions,
          'teaching_flow', spn.teaching_flow,
          'estimated_total_time', spn.estimated_total_time,
          'prerequisite_description', spn.prerequisite_description,
          'next_topic_description', spn.next_topic_description
        )
        FROM skill_pedagogical_notes spn
        WHERE spn.skill_id = s.id AND spn.is_active = true
        LIMIT 1
      ),
      '{}'::jsonb
    ),
    'assessment_rubric', COALESCE(
      (
        SELECT jsonb_build_object(
          'mastery_threshold', sar.mastery_threshold,
          'skill_levels', sar.skill_levels,
          'total_questions', sar.total_questions,
          'scope_description', sar.scope_description
        )
        FROM skill_assessment_rubrics sar
        WHERE sar.skill_id = s.id AND sar.is_active = true
        LIMIT 1
      ),
      '{}'::jsonb
    ),
    'phases', COALESCE(
      (
        SELECT jsonb_agg(
          jsonb_build_object(
            'phase_number', sp.phase_number,
            'phase_name', sp.phase_name,
            'phase_description', sp.phase_description,
            'ai_instructions', sp.ai_instructions,
            'success_criteria', sp.success_criteria,
            'estimated_duration_minutes', sp.estimated_duration_minutes
          )
          ORDER BY sp.phase_number
        )
        FROM skill_phases sp
        WHERE sp.skill_id = s.id AND sp.is_active = true
      ),
      '[]'::jsonb
    )
  ) as content_data,
  jsonb_build_object(
    'skill_name', s.name,
    'department', s.department,
    'class_level', s.class_level,
    'skill_code', s.skill_code,
    'difficulty_range', s.difficulty_range,
    'estimated_time_minutes', s.estimated_time_minutes,
    'prerequisite_skills', s.prerequisite_skills,
    'learning_objectives', s.learning_objectives
  ) as metadata,
  (
    -- Check if skill has complete content (theory + examples + exercises with substantial data)
    EXISTS(SELECT 1 FROM skill_theory_content stc WHERE stc.skill_id = s.id AND stc.is_active = true AND LENGTH(stc.content) > 100) AND
    EXISTS(SELECT 1 FROM skill_examples se WHERE se.skill_id = s.id AND se.is_active = true AND LENGTH(se.solution_steps::text) > 50) AND
    EXISTS(SELECT 1 FROM skill_practice_exercises spe WHERE spe.skill_id = s.id AND spe.is_active = true AND LENGTH(spe.problem_statement) > 50)
  ) as is_complete
FROM skills s
WHERE s.is_active = true
AND (
  EXISTS(SELECT 1 FROM skill_theory_content stc WHERE stc.skill_id = s.id AND stc.is_active = true) OR
  EXISTS(SELECT 1 FROM skill_examples se WHERE se.skill_id = s.id AND se.is_active = true) OR
  EXISTS(SELECT 1 FROM skill_practice_exercises spe WHERE spe.skill_id = s.id AND spe.is_active = true)
);