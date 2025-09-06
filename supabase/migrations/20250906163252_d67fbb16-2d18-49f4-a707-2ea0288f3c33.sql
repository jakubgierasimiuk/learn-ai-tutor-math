-- Zamknij wszystkie otwarte sesje w study_sessions
UPDATE study_sessions 
SET 
  completed_at = now(),
  status = 'completed',
  summary_state = jsonb_build_object(
    'closed_by', 'system_cleanup',
    'reason', 'manual_cleanup_before_debug'
  )
WHERE completed_at IS NULL;

-- Zamknij wszystkie otwarte sesje w unified_learning_sessions  
UPDATE unified_learning_sessions
SET 
  completed_at = now(),
  next_session_recommendations = jsonb_build_object(
    'closed_by', 'system_cleanup', 
    'reason', 'manual_cleanup_before_debug'
  )
WHERE completed_at IS NULL;