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
    shouldShowSoftPaywall
  };
};