-- Delete all user data safely
-- First delete all user-related data in public schema
DELETE FROM public.profiles;
DELETE FROM public.study_sessions;
DELETE FROM public.learning_phase_progress;
DELETE FROM public.session_analytics;
DELETE FROM public.learning_interactions;
DELETE FROM public.emotional_learning_states;
DELETE FROM public.unified_learning_sessions;
DELETE FROM public.topic_progress_history;
DELETE FROM public.validation_logs;
DELETE FROM public.misconception_networks;
DELETE FROM public.learner_intelligence;
DELETE FROM public.user_referral_stats;
DELETE FROM public.referrals;
DELETE FROM public.referral_rewards;
DELETE FROM public.user_achievements;
DELETE FROM public.metacognitive_development;
DELETE FROM public.skill_progress;
DELETE FROM public.daily_stats;
DELETE FROM public.app_error_logs;
DELETE FROM public.lesson_steps;
DELETE FROM public.study_group_members;
DELETE FROM public.session_participants;
DELETE FROM public.challenges;

-- Finally delete all users from auth schema (this will cascade if properly set up)
DELETE FROM auth.users;