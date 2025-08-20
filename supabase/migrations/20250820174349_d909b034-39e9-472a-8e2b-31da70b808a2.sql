-- Delete all user data safely in correct order to respect foreign key constraints

-- Delete dependent tables first
DELETE FROM public.lesson_steps;
DELETE FROM public.session_participants;
DELETE FROM public.study_group_members;
DELETE FROM public.user_achievements;
DELETE FROM public.referral_rewards;
DELETE FROM public.challenges;
DELETE FROM public.topic_progress_history;
DELETE FROM public.session_analytics;
DELETE FROM public.validation_logs;
DELETE FROM public.app_error_logs;

-- Delete main user data tables
DELETE FROM public.learning_interactions;
DELETE FROM public.emotional_learning_states;
DELETE FROM public.misconception_networks;
DELETE FROM public.metacognitive_development;
DELETE FROM public.learner_intelligence;
DELETE FROM public.skill_progress;
DELETE FROM public.learning_phase_progress;
DELETE FROM public.daily_stats;
DELETE FROM public.unified_learning_sessions;
DELETE FROM public.study_sessions;
DELETE FROM public.referrals;
DELETE FROM public.user_referral_stats;
DELETE FROM public.profiles;

-- Finally delete all users from auth schema
DELETE FROM auth.users;