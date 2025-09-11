import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionData {
  subscription_type: 'free' | 'paid' | 'super' | 'test';
  token_limit_soft: number;
  token_limit_hard: number;
  tokens_used_total: number;
  subscription_end?: string;
  status: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const refreshSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        console.error('Error checking subscription:', error);
        // Set default free subscription on error
      setSubscription({
        subscription_type: 'free',
        token_limit_soft: 20000,
        token_limit_hard: 25000,
        tokens_used_total: 0,
        status: 'active'
      });
      } else {
        setSubscription({
          ...data,
          tokens_used_total: data.tokens_used_total || 0
        });
      }
    } catch (error) {
      console.error('Error in refreshSubscription:', error);
      setSubscription({
        subscription_type: 'free',
        token_limit_soft: 20000,
        token_limit_hard: 25000,
        tokens_used_total: 0,
        status: 'active'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();
  }, [user]);

  // Auto-refresh every 30 seconds when user is on the page
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(refreshSubscription, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const hasTokens = () => {
    if (!subscription || subscription.subscription_type !== 'free') return true; // Paid users have unlimited
    return subscription.tokens_used_total < subscription.token_limit_hard;
  };

  const getRemainingTokens = () => {
    if (!subscription || subscription.subscription_type !== 'free') return 999999999; // Paid users have unlimited
    return Math.max(0, subscription.token_limit_hard - subscription.tokens_used_total);
  };

  const getUsagePercentage = () => {
    if (!subscription || subscription.subscription_type !== 'free') return 0; // Paid users always show 0%
    return (subscription.tokens_used_total / subscription.token_limit_hard) * 100;
  };

  return {
    subscription,
    loading,
    refreshSubscription,
    hasTokens,
    getRemainingTokens,
    getUsagePercentage
  };
};