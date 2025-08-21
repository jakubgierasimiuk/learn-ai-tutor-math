-- Add RLS policies for all skill-related tables to allow content import

-- Enable RLS on all skill content tables (if not already enabled)
ALTER TABLE skill_theory_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_examples ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_practice_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_misconception_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_real_world_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_pedagogical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessment_rubrics ENABLE ROW LEVEL SECURITY;

-- Add INSERT policies for skill content tables
CREATE POLICY "System can insert skill theory content" ON skill_theory_content FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert skill examples" ON skill_examples FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert skill practice exercises" ON skill_practice_exercises FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert skill misconception patterns" ON skill_misconception_patterns FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert skill real world applications" ON skill_real_world_applications FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert skill pedagogical notes" ON skill_pedagogical_notes FOR INSERT WITH CHECK (true);
CREATE POLICY "System can insert skill assessment rubrics" ON skill_assessment_rubrics FOR INSERT WITH CHECK (true);

-- Add UPDATE policies for skill content tables
CREATE POLICY "System can update skill theory content" ON skill_theory_content FOR UPDATE USING (true);
CREATE POLICY "System can update skill examples" ON skill_examples FOR UPDATE USING (true);
CREATE POLICY "System can update skill practice exercises" ON skill_practice_exercises FOR UPDATE USING (true);
CREATE POLICY "System can update skill misconception patterns" ON skill_misconception_patterns FOR UPDATE USING (true);
CREATE POLICY "System can update skill real world applications" ON skill_real_world_applications FOR UPDATE USING (true);
CREATE POLICY "System can update skill pedagogical notes" ON skill_pedagogical_notes FOR UPDATE USING (true);
CREATE POLICY "System can update skill assessment rubrics" ON skill_assessment_rubrics FOR UPDATE USING (true);