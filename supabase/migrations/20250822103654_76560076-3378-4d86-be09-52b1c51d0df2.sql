-- Remove old content tables now that data is unified
DROP TABLE IF EXISTS skill_theory_content CASCADE;
DROP TABLE IF EXISTS skill_examples CASCADE;
DROP TABLE IF EXISTS skill_practice_exercises CASCADE;
DROP TABLE IF EXISTS skill_pedagogical_notes CASCADE;
DROP TABLE IF EXISTS skill_assessment_rubrics CASCADE;
DROP TABLE IF EXISTS skill_phases CASCADE;
DROP TABLE IF EXISTS micro_skills CASCADE;

-- Clean up content_structure and content_data from skills table since we have unified table
ALTER TABLE skills DROP COLUMN IF EXISTS content_structure;
ALTER TABLE skills DROP COLUMN IF EXISTS content_data;