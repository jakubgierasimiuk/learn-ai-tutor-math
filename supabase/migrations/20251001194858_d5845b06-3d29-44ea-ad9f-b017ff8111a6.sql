-- Clear global analytics and logs to start fresh
DO $$
BEGIN
  -- Anonymous/global analytics tables
  DELETE FROM public.analytics_cache;
  DELETE FROM public.page_analytics;
  DELETE FROM public.user_session_analytics; -- per-user analytics, clear all
  
  -- App logs not tied to specific user (or with NULL user)
  DELETE FROM public.app_event_logs; 
  DELETE FROM public.app_error_logs; 
  
  -- Referrals & rewards (clean marketing metrics)
  DELETE FROM public.referrals; 
  DELETE FROM public.referral_codes;
  DELETE FROM public.referral_rewards;
  DELETE FROM public.reward_claims;
  DELETE FROM public.rewards;
  
  RAISE NOTICE 'Analytics and logs cleared';
END $$;