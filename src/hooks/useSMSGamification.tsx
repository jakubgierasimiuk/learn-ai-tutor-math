import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIsReferred } from '@/hooks/useIsReferred';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { useViralTriggers } from '@/hooks/useViralTriggers';

interface SMSTriggerConditions {
  showSMSPrompt: boolean;
  urgencyLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  triggerReason: string;
  personalizedMessage: string;
  rewardAmount: number;
}

export const useSMSGamification = () => {
  const { user } = useAuth();
  const { isReferred } = useIsReferred();
  const { getTokenStatus, getRemainingTokens, shouldShowUpgradePrompt } = useTokenUsage();
  const { showSocialProof } = useViralTriggers();
  const [hasShownSMSToday, setHasShownSMSToday] = useState(false);

  // Smart SMS trigger logic
  const getSMSTriggerConditions = (): SMSTriggerConditions => {
    if (!user) return { showSMSPrompt: false, urgencyLevel: 'none', triggerReason: '', personalizedMessage: '', rewardAmount: 4000 };

    // Check if user came with referral code (from URL params) OR was referred by someone
    const urlRefParam = new URLSearchParams(window.location.search).get('ref');
    const hasReferralCode = !!urlRefParam || isReferred;
    
    console.log('[useSMSGamification] Trigger check:', { urlRefParam, isReferred, hasReferralCode });
    
    const tokenStatus = getTokenStatus();
    const remainingTokens = getRemainingTokens();
    const shouldUpgrade = shouldShowUpgradePrompt();
    
    // Critical trigger - paywall hit (only for referred users)
    if (remainingTokens <= 0 && hasReferralCode) {
      return {
        showSMSPrompt: true,
        urgencyLevel: 'critical',
        triggerReason: 'paywall_hit',
        personalizedMessage: 'Nie strać postępów! Odblokuj 4000 darmowych tokenów w 2 minuty.',
        rewardAmount: 4000
      };
    }

    // High urgency - very low tokens + upgrade prompt (only for referred users)
    if (tokenStatus === 'critical' && shouldUpgrade && hasReferralCode) {
      return {
        showSMSPrompt: true,
        urgencyLevel: 'high',
        triggerReason: 'tokens_critical',
        personalizedMessage: 'Zostało Ci tylko kilka tokenów! Zabezpiecz swój postęp teraz.',
        rewardAmount: 4000
      };
    }

    // Medium urgency - referral code present
    if (hasReferralCode && !hasShownSMSToday) {
      return {
        showSMSPrompt: true,
        urgencyLevel: 'medium',
        triggerReason: 'referral_activation',
        personalizedMessage: 'Twój znajomy przygotował dla Ciebie nagrodę! Odbierz +4000 tokenów.',
        rewardAmount: 4000
      };
    }

    // No trigger for non-referred users
    return {
      showSMSPrompt: false,
      urgencyLevel: 'none',
      triggerReason: '',
      personalizedMessage: '',
      rewardAmount: 4000
    };
  };

  // Generate personalized SMS message based on user context
  const getPersonalizedSMSContext = () => {
    const conditions = getSMSTriggerConditions();
    const urlRefParam = new URLSearchParams(window.location.search).get('ref');
    const hasReferral = !!urlRefParam || isReferred;
    
    return {
      ...conditions,
      showReferrerInfo: !!hasReferral,
      socialProofMessage: getSocialProofMessage(),
      timeLeft: getTimeLeft(conditions.urgencyLevel),
      progressBar: getProgressBarData()
    };
  };

  const getSocialProofMessage = () => {
    const messages = [
      "Dziś już 247 uczniów odebrało swoje bonusy",
      "89% uczniów weryfikuje telefon w pierwszym dniu",
      "Premium funkcje oszczędzają średnio 3 tygodnie"
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const getTimeLeft = (urgency: string) => {
    switch (urgency) {
      case 'critical': return '⏰ Tylko 2 minuty na odblokowanie';
      case 'high': return '⏱️ Oferta ważna 24 godziny';
      case 'medium': return '🕐 Nagroda ważna przez 48 godzin';
      default: return '';
    }
  };

  const getProgressBarData = () => {
    return {
      currentStep: 2,
      totalSteps: 2,
      label: 'Krok 2/2 do odblokowania premium'
    };
  };

  // Trigger viral moments during SMS flow
  const triggerSMSViralMoments = () => {
    // Show social proof during SMS waiting
    showSocialProof('local_stats', {
      city: 'Twojej okolicy',
      count: Math.floor(Math.random() * 500) + 800
    });

    // Show testimonial after SMS sent
    setTimeout(() => {
      showSocialProof('testimonial', {
        name: 'Marta K.',
        subject: 'matematyka',
        improvement: 85
      });
    }, 10000);
  };

  // Mark SMS as shown today
  const markSMSShownToday = () => {
    setHasShownSMSToday(true);
    localStorage.setItem(`sms_shown_${user?.id}`, new Date().toDateString());
  };

  // Check if SMS was already shown today
  useEffect(() => {
    if (user) {
      const lastShown = localStorage.getItem(`sms_shown_${user.id}`);
      setHasShownSMSToday(lastShown === new Date().toDateString());
    }
  }, [user]);

  return {
    getSMSTriggerConditions,
    getPersonalizedSMSContext,
    triggerSMSViralMoments,
    markSMSShownToday,
    hasShownSMSToday
  };
};