-- Create edge function for generating lesson summaries for resumption
CREATE OR REPLACE FUNCTION resume_lesson_summary(
  p_skill_id UUID,
  p_user_id UUID
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  interaction_count INTEGER;
  summary_data JSONB;
BEGIN
  -- Get interaction count for this skill
  SELECT COUNT(*) INTO interaction_count
  FROM learning_interactions li
  JOIN study_sessions ss ON li.session_id = ss.id
  WHERE ss.skill_id = p_skill_id 
    AND ss.user_id = p_user_id;
    
  -- Return basic summary structure
  summary_data := jsonb_build_object(
    'interaction_count', interaction_count,
    'skill_id', p_skill_id,
    'user_id', p_user_id,
    'needs_ai_summary', CASE WHEN interaction_count >= 5 THEN true ELSE false END
  );
  
  RETURN summary_data;
END;
$$;