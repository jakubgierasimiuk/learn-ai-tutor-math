import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SubscriptionStats {
  freeAccounts: number;
  limitedFreeAccounts: number;
  expiredAccounts: number;
  paidAccounts: number;
  totalAccounts: number;
  tokenLimitExceeded: number;
  trialExpired: number;
  trialDaysBreakdown: {
    day1: number;
    day2: number;
    day3: number;
    day4: number;
    day5: number;
    day6: number;
    day7: number;
  };
}

export const useSubscriptionStats = () => {
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all user subscriptions with token usage
      const { data: subscriptions, error: subError } = await supabase
        .from('user_subscriptions')
        .select('subscription_type, tokens_used_total, token_limit_hard, trial_end_date, created_at');

      if (subError) throw subError;

      if (!subscriptions) {
        setStats({
          freeAccounts: 0,
          limitedFreeAccounts: 0,
          expiredAccounts: 0,
          paidAccounts: 0,
          totalAccounts: 0,
          tokenLimitExceeded: 0,
          trialExpired: 0,
          trialDaysBreakdown: {
            day1: 0, day2: 0, day3: 0, day4: 0, day5: 0, day6: 0, day7: 0
          }
        });
        return;
      }

      const now = new Date();
      let freeAccounts = 0;
      let limitedFreeAccounts = 0;
      let expiredAccounts = 0;
      let paidAccounts = 0;
      let tokenLimitExceeded = 0;
      let trialExpired = 0;
      const trialDaysBreakdown = {
        day1: 0, day2: 0, day3: 0, day4: 0, day5: 0, day6: 0, day7: 0
      };

      subscriptions.forEach(sub => {
        const tokensUsed = sub.tokens_used_total || 0;
        const hardLimit = sub.token_limit_hard || 25000;
        
        // Classify by actual status considering token usage
        if (sub.subscription_type === 'paid') {
          paidAccounts++;
        } else if (sub.subscription_type === 'expired') {
          expiredAccounts++;
        } else if (sub.subscription_type === 'limited_free') {
          limitedFreeAccounts++;
        } else if (sub.subscription_type === 'free') {
          // Check if should actually be classified differently
          if (tokensUsed >= hardLimit) {
            // Should be expired but database not updated yet
            expiredAccounts++;
            tokenLimitExceeded++;
          } else if (sub.trial_end_date) {
            const trialEnd = new Date(sub.trial_end_date);
            if (now > trialEnd) {
              // Trial expired but not moved to limited_free yet
              limitedFreeAccounts++;
              trialExpired++;
            } else {
              // Active free trial
              freeAccounts++;
              
              // Calculate days left in trial
              const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
              if (daysLeft >= 1 && daysLeft <= 7) {
                const dayKey = `day${daysLeft}` as keyof typeof trialDaysBreakdown;
                trialDaysBreakdown[dayKey]++;
              }
            }
          } else {
            // Free account without trial date - old account
            freeAccounts++;
          }
        }
      });

      setStats({
        freeAccounts,
        limitedFreeAccounts,
        expiredAccounts,
        paidAccounts,
        totalAccounts: subscriptions.length,
        tokenLimitExceeded,
        trialExpired,
        trialDaysBreakdown
      });

    } catch (err) {
      console.error('Error fetching subscription stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refreshStats: fetchStats
  };
};