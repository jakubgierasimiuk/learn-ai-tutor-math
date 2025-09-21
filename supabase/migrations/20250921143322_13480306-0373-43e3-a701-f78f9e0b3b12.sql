-- Fix critical search_path security issue in all functions
-- This prevents SQL injection attacks through search_path manipulation

-- Update all functions to have secure search_path
ALTER FUNCTION public.get_founding_members_count() SET search_path = public;
ALTER FUNCTION public.migrate_existing_marketing_consents() SET search_path = public;
ALTER FUNCTION public.assign_founding_position() SET search_path = public;
ALTER FUNCTION public.cleanup_analytics_cache() SET search_path = public;
ALTER FUNCTION public.get_virtual_spots_left() SET search_path = public;
ALTER FUNCTION public.get_due_surveys_for_user(uuid) SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, app_role) SET search_path = public;
ALTER FUNCTION public.update_referral_stats(uuid) SET search_path = public;
ALTER FUNCTION public.calculate_risk_score(uuid, boolean, boolean, boolean, boolean, boolean, integer) SET search_path = public;
ALTER FUNCTION public.check_admin_rate_limit(uuid, text, integer, integer) SET search_path = public;
ALTER FUNCTION public.check_and_award_achievements(uuid) SET search_path = public;
ALTER FUNCTION public.check_security_settings() SET search_path = public;
ALTER FUNCTION public.check_social_achievements(uuid) SET search_path = public;
ALTER FUNCTION public.create_learner_intelligence_profile() SET search_path = public;
ALTER FUNCTION public.generate_join_code() SET search_path = public;
ALTER FUNCTION public.generate_random_id() SET search_path = public;
ALTER FUNCTION public.generate_referral_code() SET search_path = public;
ALTER FUNCTION public.get_due_cards_for_user(uuid) SET search_path = public;
ALTER FUNCTION public.get_learning_analytics(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_learning_profile(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_roles(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_subscription_limits(uuid) SET search_path = public;
ALTER FUNCTION public.get_user_total_token_usage(uuid) SET search_path = public;
ALTER FUNCTION public.sync_subscription_limits() SET search_path = public;
ALTER FUNCTION public.get_weekly_benchmarks() SET search_path = public;
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.resume_lesson_summary(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.set_user_id_from_auth() SET search_path = public;
ALTER FUNCTION public.trigger_update_referral_stats() SET search_path = public;
ALTER FUNCTION public.trigger_update_referral_stats_v2() SET search_path = public;
ALTER FUNCTION public.update_leaderboard(uuid, integer) SET search_path = public;
ALTER FUNCTION public.update_learner_profile_from_session() SET search_path = public;
ALTER FUNCTION public.update_learner_profile_timestamp() SET search_path = public;
ALTER FUNCTION public.update_learning_profile_timestamp() SET search_path = public;
ALTER FUNCTION public.update_referral_stats_v2(uuid) SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_user_streak(uuid) SET search_path = public;
ALTER FUNCTION public.validate_lesson_content() SET search_path = public;