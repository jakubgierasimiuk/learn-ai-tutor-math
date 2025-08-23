-- Fix security definer view and update function search paths
ALTER FUNCTION public.set_user_id_from_auth() SET search_path = 'public';
ALTER FUNCTION public.update_learner_profile_timestamp() SET search_path = 'public';
ALTER FUNCTION public.update_learning_profile_timestamp() SET search_path = 'public';
ALTER FUNCTION public.generate_referral_code() SET search_path = 'public';