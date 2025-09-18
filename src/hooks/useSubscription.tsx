import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionData {
  subscription_type: 'free' | 'paid' | 'super' | 'test' | 'expired' | 'limited_free';
  token_limit_soft: number;
  token_limit_hard: number;
  tokens_used_total: number;
  monthly_tokens_used?: number;
  subscription_end?: string;
  status: string;
  trial_end_date?: string;
  is_trial_expired?: boolean;
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
        status: 'active',
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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
        status: 'active',
        trial_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
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
    if (!subscription) return false;
    
    if (subscription.subscription_type === 'paid') {
      // Paid users: check monthly limit
      return (subscription.monthly_tokens_used || 0) < subscription.token_limit_hard;
    } else if (subscription.subscription_type === 'limited_free') {
      // Limited free: check monthly limit
      return (subscription.monthly_tokens_used || 0) < subscription.token_limit_hard;
    } else {
      // Free/expired users: check lifetime limit
      return subscription.tokens_used_total < subscription.token_limit_hard;
    }
  };

  const getRemainingTokens = () => {
    if (!subscription) return 0;
    
    if (subscription.subscription_type === 'paid') {
      // Paid users: remaining from monthly limit
      return Math.max(0, subscription.token_limit_hard - (subscription.monthly_tokens_used || 0));
    } else if (subscription.subscription_type === 'limited_free') {
      // Limited free: remaining from monthly limit
      return Math.max(0, subscription.token_limit_hard - (subscription.monthly_tokens_used || 0));
    } else {
      // Free/expired users: remaining from lifetime limit
      return Math.max(0, subscription.token_limit_hard - subscription.tokens_used_total);
    }
  };

  const getUsagePercentage = () => {
    if (!subscription) return 0;
    
    // Zabezpieczenie przed dzieleniem przez zero
    if (!subscription.token_limit_hard || subscription.token_limit_hard <= 0) return 0;
    
    let percentage = 0;
    
    if (subscription.subscription_type === 'paid') {
      // Paid users: percentage of monthly usage
      const used = subscription.monthly_tokens_used || 0;
      percentage = (used / subscription.token_limit_hard) * 100;
    } else if (subscription.subscription_type === 'limited_free') {
      // Limited free: percentage of monthly usage
      const used = subscription.monthly_tokens_used || 0;
      percentage = (used / subscription.token_limit_hard) * 100;
    } else {
      // Free/expired users: percentage of lifetime usage
      const used = subscription.tokens_used_total || 0;
      percentage = (used / subscription.token_limit_hard) * 100;
    }
    
    // Ograniczenie do zakresu 0-100% i zaokrąglenie
    return Math.min(100, Math.max(0, Math.round(percentage)));
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