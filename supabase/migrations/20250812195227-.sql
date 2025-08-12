-- Harden RLS for user_referral_stats by removing permissive system policy
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;

-- Remove overly permissive policy if present
DROP POLICY IF EXISTS "System can manage stats" ON public.user_referral_stats;

-- Ensure owner-only SELECT policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_referral_stats' 
      AND policyname = 'Users can view their own stats'
  ) THEN
    CREATE POLICY "Users can view their own stats"
    ON public.user_referral_stats
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END$$;

-- Ensure owner-only UPDATE policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'user_referral_stats' 
      AND policyname = 'Users can update their own stats'
  ) THEN
    CREATE POLICY "Users can update their own stats"
    ON public.user_referral_stats
    FOR UPDATE
    USING (auth.uid() = user_id);
  END IF;
END$$;