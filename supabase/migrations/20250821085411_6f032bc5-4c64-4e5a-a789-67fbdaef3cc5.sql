-- Remove duplicate skills, keeping only the first occurrence of each name
WITH ranked_skills AS (
  SELECT id, name, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at ASC) as rn
  FROM skills
)
DELETE FROM skills 
WHERE id IN (
  SELECT id FROM ranked_skills WHERE rn > 1
);

-- Now add unique constraints needed for skill content import

-- For skills table - unique constraint on name
ALTER TABLE skills ADD CONSTRAINT unique_skill_name UNIQUE (name);

-- For skill_theory_content - unique constraint on skill_id (one theory per skill)
ALTER TABLE skill_theory_content ADD CONSTRAINT unique_theory_skill UNIQUE (skill_id);

-- For skill_examples - unique constraint on skill_id + example_code
ALTER TABLE skill_examples ADD CONSTRAINT unique_example_per_skill UNIQUE (skill_id, example_code);

-- For skill_practice_exercises - unique constraint on skill_id + exercise_code  
ALTER TABLE skill_practice_exercises ADD CONSTRAINT unique_exercise_per_skill UNIQUE (skill_id, exercise_code);

-- For skill_misconception_patterns - unique constraint on skill_id + pattern_code
ALTER TABLE skill_misconception_patterns ADD CONSTRAINT unique_misconception_per_skill UNIQUE (skill_id, pattern_code);

-- For skill_real_world_applications - unique constraint on skill_id + context
ALTER TABLE skill_real_world_applications ADD CONSTRAINT unique_application_per_skill UNIQUE (skill_id, context);

-- For skill_pedagogical_notes - unique constraint on skill_id (one note set per skill)
ALTER TABLE skill_pedagogical_notes ADD CONSTRAINT unique_notes_per_skill UNIQUE (skill_id);

-- For skill_assessment_rubrics - unique constraint on skill_id (one rubric per skill)
ALTER TABLE skill_assessment_rubrics ADD CONSTRAINT unique_rubric_per_skill UNIQUE (skill_id);