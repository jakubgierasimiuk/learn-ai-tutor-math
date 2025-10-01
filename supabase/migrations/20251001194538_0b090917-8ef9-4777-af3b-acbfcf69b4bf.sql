-- Delete test user ytrewq completely from database
-- User ID: 0ec22431-513b-4fe1-bfa6-67884643e586

DO $$
DECLARE
  test_user_id uuid := '0ec22431-513b-4fe1-bfa6-67884643e586';
BEGIN
  -- Delete from tables with user_id column
  DELETE FROM public.admin_rate_limits WHERE user_id = test_user_id;
  DELETE FROM public.ai_conversation_log WHERE user_id = test_user_id;
  DELETE FROM public.app_error_logs WHERE user_id = test_user_id;
  DELETE FROM public.app_event_logs WHERE user_id = test_user_id;
  DELETE FROM public.cognitive_load_profiles WHERE user_id = test_user_id;
  DELETE FROM public.daily_stats WHERE user_id = test_user_id;
  DELETE FROM public.devices WHERE user_id = test_user_id;
  DELETE FROM public.diagnostic_item_attempts WHERE user_id = test_user_id;
  DELETE FROM public.diagnostic_sessions WHERE user_id = test_user_id;
  DELETE FROM public.diagnostic_tests WHERE user_id = test_user_id;
  DELETE FROM public.emotional_learning_states WHERE user_id = test_user_id;
  DELETE FROM public.flow_state_analytics WHERE user_id = test_user_id;
  DELETE FROM public.founding_members WHERE user_id = test_user_id OR referred_by = test_user_id;
  DELETE FROM public.fraud_signals WHERE user_id = test_user_id;
  DELETE FROM public.goal_reminders WHERE user_id = test_user_id;
  DELETE FROM public.leaderboards WHERE user_id = test_user_id;
  DELETE FROM public.learner_intelligence WHERE user_id = test_user_id;
  DELETE FROM public.learning_goals WHERE user_id = test_user_id;
  DELETE FROM public.learning_interactions WHERE user_id = test_user_id;
  DELETE FROM public.learning_phase_progress WHERE user_id = test_user_id;
  DELETE FROM public.learning_predictions WHERE user_id = test_user_id;
  DELETE FROM public.learning_profiles WHERE user_id = test_user_id;
  DELETE FROM public.marketing_consent_rewards WHERE user_id = test_user_id;
  DELETE FROM public.marketing_consents WHERE user_id = test_user_id;
  DELETE FROM public.marketing_rewards_history WHERE user_id = test_user_id;
  DELETE FROM public.metacognitive_development WHERE user_id = test_user_id;
  DELETE FROM public.misconception_networks WHERE user_id = test_user_id;
  DELETE FROM public.neural_repetition_schedule WHERE user_id = test_user_id;
  DELETE FROM public.points_history WHERE user_id = test_user_id;
  DELETE FROM public.referral_codes WHERE user_id = test_user_id;
  DELETE FROM public.referral_rewards WHERE user_id = test_user_id;
  DELETE FROM public.reward_claims WHERE user_id = test_user_id;
  DELETE FROM public.rewards WHERE user_id = test_user_id;
  DELETE FROM public.session_participants WHERE user_id = test_user_id;
  DELETE FROM public.skill_mastery WHERE user_id = test_user_id;
  DELETE FROM public.skill_progress WHERE user_id = test_user_id;
  DELETE FROM public.sms_verifications WHERE user_id = test_user_id;
  DELETE FROM public.spaced_repetition_cards WHERE user_id = test_user_id;
  DELETE FROM public.study_group_members WHERE user_id = test_user_id;
  DELETE FROM public.study_sessions WHERE user_id = test_user_id;
  DELETE FROM public.survey_responses WHERE user_id = test_user_id;
  DELETE FROM public.token_limit_exceeded_logs WHERE user_id = test_user_id;
  DELETE FROM public.unified_learning_sessions WHERE user_id = test_user_id;
  DELETE FROM public.universal_learner_profiles WHERE user_id = test_user_id;
  DELETE FROM public.user_achievements WHERE user_id = test_user_id;
  DELETE FROM public.user_referral_stats WHERE user_id = test_user_id;
  DELETE FROM public.user_roles WHERE user_id = test_user_id;
  DELETE FROM public.user_session_analytics WHERE user_id = test_user_id;
  DELETE FROM public.user_streaks WHERE user_id = test_user_id;
  DELETE FROM public.user_subscriptions WHERE user_id = test_user_id;
  DELETE FROM public.user_surveys WHERE user_id = test_user_id;
  DELETE FROM public.validation_logs WHERE user_id = test_user_id;
  DELETE FROM public.weekly_summaries WHERE user_id = test_user_id;
  
  -- Delete from tables with other user columns
  DELETE FROM public.admin_actions_log WHERE admin_id = test_user_id OR target_user_id = test_user_id;
  DELETE FROM public.challenges WHERE created_by = test_user_id OR challenged_user = test_user_id;
  DELETE FROM public.group_study_sessions WHERE created_by = test_user_id;
  DELETE FROM public.referrals WHERE referrer_id = test_user_id OR referred_user_id = test_user_id;
  
  -- Finally delete the profile
  DELETE FROM public.profiles WHERE user_id = test_user_id;
  
  -- Delete from auth.users (this will cascade to related auth tables)
  DELETE FROM auth.users WHERE id = test_user_id;
  
  RAISE NOTICE 'Test user deleted successfully';
END $$;