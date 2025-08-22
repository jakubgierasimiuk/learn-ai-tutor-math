-- Clean up duplicate skills and fix data integrity issues

-- First, identify and remove duplicate skills, keeping the most complete ones
WITH skill_duplicates AS (
  SELECT 
    s.id,
    s.name,
    s.class_level,
    s.created_at,
    ROW_NUMBER() OVER (
      PARTITION BY s.name, s.class_level 
      ORDER BY 
        (CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN se.id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN sp.id IS NOT NULL THEN 1 ELSE 0 END) DESC,
        s.created_at ASC
    ) as rn
  FROM skills s
  LEFT JOIN skill_theory_content st ON s.id = st.skill_id AND st.is_active = true
  LEFT JOIN skill_examples se ON s.id = se.skill_id AND se.is_active = true
  LEFT JOIN skill_practice_exercises sp ON s.id = sp.skill_id AND sp.is_active = true
),
duplicates_to_remove AS (
  SELECT id FROM skill_duplicates WHERE rn > 1
)
-- Delete content from duplicate skills first
DELETE FROM skill_theory_content 
WHERE skill_id IN (SELECT id FROM duplicates_to_remove);

DELETE FROM skill_examples 
WHERE skill_id IN (SELECT id FROM duplicates_to_remove);

DELETE FROM skill_practice_exercises 
WHERE skill_id IN (SELECT id FROM duplicates_to_remove);

-- Delete duplicate skills
DELETE FROM skills 
WHERE id IN (SELECT id FROM duplicates_to_remove);

-- Add missing examples and exercises for "Wartość bezwzględna - definicja i własności"
INSERT INTO skill_examples (skill_id, example_code, problem_statement, solution_steps, final_answer, explanation, time_estimate, difficulty_level)
SELECT 
  s.id,
  'wartość_bezwzględna_przykład_1',
  'Oblicz wartość wyrażenia |3 - 7|',
  '["Obliczamy wyrażenie wewnątrz wartości bezwzględnej: 3 - 7 = -4", "Stosujemy definicję wartości bezwzględnej: |-4| = 4"]'::jsonb,
  '4',
  'Wartość bezwzględna liczby ujemnej to ta sama liczba ze znakiem dodatnim.',
  5,
  1
FROM skills s 
WHERE s.name = 'Wartość bezwzględna - definicja i własności' AND s.class_level = 1;

INSERT INTO skill_examples (skill_id, example_code, problem_statement, solution_steps, final_answer, explanation, time_estimate, difficulty_level)
SELECT 
  s.id,
  'wartość_bezwzględna_przykład_2',
  'Rozwiąż równanie |x| = 5',
  '["Z definicji wartości bezwzględnej: |x| = 5 oznacza x = 5 lub x = -5", "Sprawdzenie: |5| = 5 ✓ i |-5| = 5 ✓"]'::jsonb,
  'x = 5 lub x = -5',
  'Równanie |x| = a ma dwa rozwiązania: x = a i x = -a (gdy a > 0).',
  8,
  2
FROM skills s 
WHERE s.name = 'Wartość bezwzględna - definicja i własności' AND s.class_level = 1;

INSERT INTO skill_practice_exercises (skill_id, exercise_code, problem_statement, expected_answer, difficulty_level, time_estimate, misconception_map)
SELECT 
  s.id,
  'wartość_bezwzględna_ćwiczenie_1',
  'Oblicz |−8|',
  '8',
  1,
  3,
  '[]'::jsonb
FROM skills s 
WHERE s.name = 'Wartość bezwzględna - definicja i własności' AND s.class_level = 1;

INSERT INTO skill_practice_exercises (skill_id, exercise_code, problem_statement, expected_answer, difficulty_level, time_estimate, misconception_map)
SELECT 
  s.id,
  'wartość_bezwzględna_ćwiczenie_2',
  'Rozwiąż równanie |x - 2| = 3',
  'x = 5 lub x = -1',
  2,
  10,
  '[]'::jsonb
FROM skills s 
WHERE s.name = 'Wartość bezwzględna - definicja i własności' AND s.class_level = 1;