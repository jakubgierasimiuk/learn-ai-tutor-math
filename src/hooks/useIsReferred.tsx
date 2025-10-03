import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to check if the current user was referred by another user.
 * Checks if user exists in the referrals table as referred_user_id.
 */
export const useIsReferred = () => {
  const { user } = useAuth();

  const { data: isReferred, isLoading } = useQuery({
    queryKey: ['isReferred', user?.id],
    queryFn: async () => {
      if (!user) return false;

      console.log('[useIsReferred] Checking referral status for user:', user.id);

      // Check if user has a record in referrals table where they are the referred user
      const { data, error } = await supabase
        .from('referrals')
        .select('id, referrer_id, stage')
        .eq('referred_user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[useIsReferred] Error checking referral:', error);
        return false;
      }

      const wasReferred = !!data;
      console.log('[useIsReferred] User was referred:', wasReferred, data ? `by ${data.referrer_id} (stage: ${data.stage})` : '');

      return wasReferred;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,
  });

  return {
    isReferred: isReferred ?? false,
    isLoading,
  };
};
