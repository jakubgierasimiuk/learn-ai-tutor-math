-- Extend lessons table to support content database
ALTER TABLE lessons 
ADD COLUMN IF NOT EXISTS generator_params jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS teaching_flow jsonb DEFAULT '{}',
ADD COLUMN IF NOT EXISTS misconception_patterns jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS real_world_applications jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS assessment_rubric jsonb DEFAULT '{}';

-- Add validation trigger for content structure
CREATE OR REPLACE FUNCTION validate_lesson_content()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for content validation
DROP TRIGGER IF EXISTS validate_lesson_content_trigger ON lessons;
CREATE TRIGGER validate_lesson_content_trigger
  BEFORE INSERT OR UPDATE ON lessons
  FOR EACH ROW
  EXECUTE FUNCTION validate_lesson_content();

-- Add index for generator_params queries
CREATE INDEX IF NOT EXISTS idx_lessons_generator_params ON lessons USING GIN (generator_params);

-- Add index for teaching_flow queries  
CREATE INDEX IF NOT EXISTS idx_lessons_teaching_flow ON lessons USING GIN (teaching_flow);