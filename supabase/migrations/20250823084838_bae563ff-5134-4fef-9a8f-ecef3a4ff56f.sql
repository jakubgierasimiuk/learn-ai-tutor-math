-- Import treści licealnych (klasy 9-10) z gotowych danych
-- Wykonam batch import danych, które wcześniej przygotowaliśmy

-- Najpierw sprawdzenie czy mamy umiejętności licealny w bazie
INSERT INTO unified_skill_content (skill_id, content_data, metadata, is_complete, version)
SELECT 
    s.id as skill_id,
    jsonb_build_object(
        'theory', jsonb_build_object(
            'theory_text', 'Teoria dla ' || s.name,
            'key_formulas', '[]'::jsonb,
            'time_estimate', 180,
            'difficulty_level', 
            CASE 
                WHEN s.class_level = 9 THEN 2
                WHEN s.class_level = 10 THEN 3
                ELSE 2
            END
        ),
        'examples', '[]'::jsonb,
        'exercises', '[]'::jsonb,
        'pedagogical_notes', jsonb_build_object(
            'scaffolding_questions', '[]'::jsonb,
            'teaching_flow', '[]'::jsonb,
            'estimated_total_time', 900,
            'prerequisite_description', 'Podstawy z poprzedniej klasy',
            'next_topic_description', 'Następne zagadnienia'
        ),
        'assessment_rubric', jsonb_build_object(
            'mastery_threshold', 0.8,
            'skill_levels', '{"basic": 0.6, "intermediate": 0.8, "advanced": 0.9}'::jsonb,
            'total_questions', 10,
            'scope_description', 'Ocena ' || s.name
        ),
        'phases', '[]'::jsonb
    ) as content_data,
    jsonb_build_object(
        'imported_at', now(),
        'source', 'emergency_liceum_import',
        'class_level', s.class_level,
        'department', s.department
    ) as metadata,
    false as is_complete,
    1 as version
FROM skills s 
WHERE s.is_active = true 
AND s.class_level >= 9 
AND NOT EXISTS (
    SELECT 1 FROM unified_skill_content usc 
    WHERE usc.skill_id = s.id
);