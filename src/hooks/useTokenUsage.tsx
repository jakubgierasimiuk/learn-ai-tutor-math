import { useSubscription } from './useSubscription';

export const useTokenUsage = () => {
  const { subscription, loading, refreshSubscription, hasTokens, getRemainingTokens, getUsagePercentage } = useSubscription();

  const getTokenStatus = () => {
    const remaining = getRemainingTokens();
    const percentage = getUsagePercentage();
    
    if (percentage >= 90) return 'critical'; // Red - 90%+
    if (percentage >= 75) return 'warning';  // Orange - 75-89%
    if (percentage >= 50) return 'moderate'; // Yellow - 50-74%
    return 'good'; // Green - 0-49%
  };

  const getStatusMessage = () => {
    const remaining = getRemainingTokens();
    const status = getTokenStatus();
    
    switch (status) {
      case 'critical':
        return `Zostało tylko ${remaining} tokenów! Ulepsz plan, aby kontynuować naukę.`;
      case 'warning':
        return `Zostało ${remaining} tokenów. Rozważ upgrade planu.`;
      case 'moderate':
        return `Zostało ${remaining} tokenów w tym miesiącu.`;
      default:
        return `Dostępnych tokenów: ${remaining}`;
    }
  };

  const shouldShowUpgradePrompt = () => {
    const percentage = getUsagePercentage();
    return percentage >= 75 && subscription?.subscription_type === 'free';
  };

  const shouldShowSoftPaywall = () => {
    if (!subscription || subscription.subscription_type !== 'free') return false;
    return !hasTokens();
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