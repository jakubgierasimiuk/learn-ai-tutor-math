-- Delete test users with all related data
DO $$
DECLARE
  test_user_ids uuid[] := ARRAY['505946c7-3b70-42eb-a68c-57ae1158a55d', 'ea6ff6cf-87ac-46ba-a358-3e70ea1f35a7'];
BEGIN
  -- Delete from all tables that reference user_id
  DELETE FROM public.learning_interactions WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.learner_intelligence WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.learning_profiles WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.cognitive_load_profiles WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.emotional_learning_states WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.flow_state_analytics WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.learning_predictions WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.learning_phase_progress WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.diagnostic_sessions WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.diagnostic_item_attempts WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.diagnostic_tests WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.unified_learning_sessions WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.study_sessions WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.spaced_repetition_cards WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.marketing_consent_rewards WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.marketing_consents WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.devices WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.fraud_signals WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.user_subscriptions WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.ai_conversation_log WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.daily_stats WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.user_streaks WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.user_achievements WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.points_history WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.leaderboards WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.learning_goals WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.app_error_logs WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.app_event_logs WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.referrals WHERE referrer_id = ANY(test_user_ids);
  DELETE FROM public.user_referral_stats WHERE user_id = ANY(test_user_ids);
  DELETE FROM public.profiles WHERE user_id = ANY(test_user_ids);
  
  -- Finally delete from auth.users
  DELETE FROM auth.users WHERE id = ANY(test_user_ids);
END $$;
