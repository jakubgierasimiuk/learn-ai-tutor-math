import { useSubscription } from './useSubscription';

export const useTokenUsage = () => {
  const { subscription, loading, refreshSubscription, hasTokens, getRemainingTokens, getUsagePercentage } = useSubscription();

  const getTokenStatus = () => {
    if (!subscription || subscription.subscription_type !== 'free') return 'good';
    
    const tokensUsed = subscription.tokens_used_total;
    const softLimit = subscription.token_limit_soft;
    const hardLimit = subscription.token_limit_hard;
    
    if (tokensUsed >= hardLimit) return 'critical'; // Hard limit reached
    if (tokensUsed >= softLimit) return 'warning';  // Soft limit reached  
    if (tokensUsed >= softLimit * 0.8) return 'moderate'; // 80% of soft limit
    return 'good';
  };

  const getStatusMessage = () => {
    if (!subscription || subscription.subscription_type !== 'free') {
      return 'Nieograniczone tokeny';
    }
    
    const tokensUsed = subscription.tokens_used_total;
    const softLimit = subscription.token_limit_soft; 
    const hardLimit = subscription.token_limit_hard;
    const remaining = hardLimit - tokensUsed;
    const status = getTokenStatus();
    
    switch (status) {
      case 'critical':
        return 'Osiągnięto limit 25 000 tokenów. Ulepsz plan, aby kontynuować.';
      case 'warning':
        return `Osiągnięto próg ${softLimit.toLocaleString()} tokenów. Zostało ${remaining.toLocaleString()} tokenów.`;
      case 'moderate':
        return `Wykorzystano ${tokensUsed.toLocaleString()} z ${hardLimit.toLocaleString()} tokenów.`;
      default:
        return `Wykorzystano ${tokensUsed.toLocaleString()} z ${hardLimit.toLocaleString()} tokenów.`;
    }
  };

  const shouldShowUpgradePrompt = () => {
    if (!subscription || subscription.subscription_type !== 'free') return false;
    const tokensUsed = subscription.tokens_used_total;
    const softLimit = subscription.token_limit_soft;
    return tokensUsed >= softLimit;
  };

  const shouldShowSoftPaywall = () => {
    if (!subscription || subscription.subscription_type !== 'free') return false;
    const tokensUsed = subscription.tokens_used_total;
    const hardLimit = subscription.token_limit_hard;
    return tokensUsed >= hardLimit;
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