-- Clean up duplicate skills step by step

-- First, find duplicate "Nierówności liniowe z jedną niewiadomą" skills
DO $$
DECLARE
    skill_to_keep UUID;
    skills_to_remove UUID[];
BEGIN
    -- Find the skill with most content to keep
    SELECT s.id INTO skill_to_keep
    FROM skills s
    LEFT JOIN skill_theory_content st ON s.id = st.skill_id AND st.is_active = true
    LEFT JOIN skill_examples se ON s.id = se.skill_id AND se.is_active = true
    LEFT JOIN skill_practice_exercises sp ON s.id = sp.skill_id AND sp.is_active = true
    WHERE s.name = 'Nierówności liniowe z jedną niewiadomą' AND s.class_level = 1
    ORDER BY 
        (CASE WHEN st.id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN se.id IS NOT NULL THEN 1 ELSE 0 END) +
        (CASE WHEN sp.id IS NOT NULL THEN 1 ELSE 0 END) DESC,
        s.created_at ASC
    LIMIT 1;

    -- Get all other duplicates
    SELECT array_agg(s.id) INTO skills_to_remove
    FROM skills s
    WHERE s.name = 'Nierówności liniowe z jedną niewiadomą' 
    AND s.class_level = 1 
    AND s.id != skill_to_keep;

    -- Delete content from duplicate skills
    DELETE FROM skill_theory_content WHERE skill_id = ANY(skills_to_remove);
    DELETE FROM skill_examples WHERE skill_id = ANY(skills_to_remove);
    DELETE FROM skill_practice_exercises WHERE skill_id = ANY(skills_to_remove);
    
    -- Delete duplicate skills
    DELETE FROM skills WHERE id = ANY(skills_to_remove);
    
    RAISE NOTICE 'Removed % duplicate skills for Nierówności liniowe', array_length(skills_to_remove, 1);
END $$;