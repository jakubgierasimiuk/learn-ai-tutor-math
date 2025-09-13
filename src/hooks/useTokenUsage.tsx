import { useSubscription } from './useSubscription';

export const useTokenUsage = () => {
  const { subscription, loading, refreshSubscription, hasTokens, getRemainingTokens, getUsagePercentage } = useSubscription();

  const getTokenStatus = () => {
    if (!subscription) return 'good';
    
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'warning';
    if (percentage >= 50) return 'moderate';
    return 'good';
  };

  const isOnTrial = () => {
    return subscription?.subscription_type === 'free' && subscription?.trial_end_date;
  };

  const isTrialExpired = () => {
    return subscription?.is_trial_expired || false;
  };

  const getTrialDaysLeft = () => {
    if (!subscription?.trial_end_date) return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trial_end_date);
    const diffTime = trialEnd.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const getStatusMessage = () => {
    if (!subscription) return 'Ładowanie...';
    
    if (subscription.subscription_type === 'paid') {
      const remaining = getRemainingTokens();
      return `${remaining.toLocaleString()} tokenów pozostało w tym miesiącu`;
    }

    if (subscription.subscription_type === 'expired') {
      const remaining = getRemainingTokens();
      return `Plan wygasł - ${remaining.toLocaleString()} tokenów dostępnych`;
    }

    if (subscription.subscription_type === 'limited_free') {
      const remaining = getRemainingTokens();
      return `${remaining.toLocaleString()} tokenów pozostało w tym miesiącu`;
    }

    if (isOnTrial()) {
      const daysLeft = getTrialDaysLeft();
      const remaining = getRemainingTokens();
      if (daysLeft === 0) {
        return `Trial kończy się dziś! ${remaining.toLocaleString()} tokenów dostępnych`;
      }
      return `Trial: ${daysLeft} dni • ${remaining.toLocaleString()} tokenów`;
    }

    const remaining = getRemainingTokens();
    const status = getTokenStatus();
    
    switch (status) {
      case 'critical':
        return `Zostało tylko ${remaining.toLocaleString()} tokenów!`;
      case 'warning':
        return `Zostało ${remaining.toLocaleString()} tokenów`;
      case 'moderate':
        return `Pozostało ${remaining.toLocaleString()} tokenów`;
      default:
        return `${remaining.toLocaleString()} tokenów dostępnych`;
    }
  };

  const shouldShowUpgradePrompt = () => {
    if (!subscription || subscription.subscription_type === 'paid') return false;
    
    // Show upgrade prompt for trial users near expiry or token limit
    if (isOnTrial()) {
      const daysLeft = getTrialDaysLeft();
      const usagePercentage = getUsagePercentage();
      return daysLeft <= 2 || usagePercentage >= 75;
    }

    // Show upgrade for limited_free users always
    if (subscription.subscription_type === 'limited_free') {
      return true;
    }
    
    if (subscription.subscription_type === 'expired') {
      return subscription.tokens_used_total >= subscription.token_limit_soft;
    }
    
    return subscription.tokens_used_total >= subscription.token_limit_soft;
  };

  const shouldShowSoftPaywall = () => {
    if (!subscription) return false;
    
    if (subscription.subscription_type === 'paid') {
      return (subscription.monthly_tokens_used || 0) >= subscription.token_limit_hard;
    }

    if (subscription.subscription_type === 'limited_free') {
      return (subscription.monthly_tokens_used || 0) >= subscription.token_limit_hard;
    }
    
    return subscription.tokens_used_total >= subscription.token_limit_hard;
  };

  return {
    subscription,
    loading,
    refreshSubscription,
    hasTokens,
    getRemainingTokens,
    getUsagePercentage,
    getTokenStatus,
    getStatusMessage,
    shouldShowUpgradePrompt,
    shouldShowSoftPaywall,
    isOnTrial,
    isTrialExpired,
    getTrialDaysLeft
  };
};