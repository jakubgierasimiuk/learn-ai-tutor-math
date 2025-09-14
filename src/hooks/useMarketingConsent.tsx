import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface MarketingConsentState {
  hasGeneralConsent: boolean;
  hasEmailConsent: boolean;
  hasSmsConsent: boolean;
  hasPersonalizationConsent: boolean;
  hasAnalyticsConsent: boolean;
  rewardStatus: 'pending' | 'granted' | 'clawed_back' | 'expired' | null;
  isEligibleForReward: boolean;
  loading: boolean;
}

interface TriggerConfig {
  shouldShow: boolean;
  trigger: 'registration' | 'first_lesson' | 'reengagement' | 'token_warning';
  reason?: string;
}

export const useMarketingConsent = () => {
  const { user } = useAuth();
  const [state, setState] = useState<MarketingConsentState>({
    hasGeneralConsent: false,
    hasEmailConsent: false,
    hasSmsConsent: false,
    hasPersonalizationConsent: false,
    hasAnalyticsConsent: false,
    rewardStatus: null,
    isEligibleForReward: false,
    loading: true
  });

  // Load consent status from backend
  const loadConsentStatus = useCallback(async () => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Get consents
      const { data: consentData, error: consentError } = await supabase.functions.invoke('marketing-consent-manager', {
        body: { action: 'get_consents' }
      });

      if (consentError) throw consentError;

      // Get reward status
      const { data: rewardData, error: rewardError } = await supabase.functions.invoke('marketing-consent-manager', {
        body: { action: 'check_reward_status' }
      });

      if (rewardError) throw rewardError;

      // Check eligibility
      const { data: eligibilityData, error: eligibilityError } = await supabase.functions.invoke('marketing-consent-reward', {
        body: { action: 'check_eligibility' }
      });

      if (eligibilityError) throw eligibilityError;

      setState({
        hasGeneralConsent: consentData?.current_status?.general || false,
        hasEmailConsent: consentData?.current_status?.email || false,
        hasSmsConsent: consentData?.current_status?.sms || false,
        hasPersonalizationConsent: consentData?.current_status?.personalization || false,
        hasAnalyticsConsent: consentData?.current_status?.analytics || false,
        rewardStatus: rewardData?.reward_status?.status || null,
        isEligibleForReward: eligibilityData?.eligible || false,
        loading: false
      });

    } catch (error) {
      console.error('Load consent status error:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  // Check if marketing consent modal should be shown
  const checkShouldShowModal = useCallback(async (): Promise<TriggerConfig> => {
    if (!user || state.loading) {
      return { shouldShow: false, trigger: 'registration' };
    }

    // Don't show if already has consent or not eligible for reward
    if (state.hasGeneralConsent || !state.isEligibleForReward) {
      return { shouldShow: false, trigger: 'registration' };
    }

    // Check if user just registered (within last 5 minutes)
    const userCreatedAt = new Date(user.created_at);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    if (userCreatedAt > fiveMinutesAgo) {
      return { 
        shouldShow: true, 
        trigger: 'registration',
        reason: 'New user registration'
      };
    }

    // Check if user completed first lesson recently
    try {
      const { data: lessonData } = await supabase
        .from('learning_phase_progress')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (lessonData?.completed_at) {
        const completedAt = new Date(lessonData.completed_at);
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        
        if (completedAt > oneHourAgo) {
          return { 
            shouldShow: true, 
            trigger: 'first_lesson',
            reason: 'Completed first lesson'
          };
        }
      }
    } catch (error) {
      console.log('Error checking lesson progress:', error);
    }

    // Check token usage (80% threshold)
    try {
      const { data: subData } = await supabase.functions.invoke('check-subscription');
      
      if (subData?.data) {
        const tokenUsage = subData.data.monthly_tokens_used || 0;
        const tokenLimit = subData.data.token_limit_soft || 1000;
        const usagePercentage = (tokenUsage / tokenLimit) * 100;

        if (usagePercentage >= 80) {
          return { 
            shouldShow: true, 
            trigger: 'token_warning',
            reason: 'High token usage'
          };
        }
      }
    } catch (error) {
      console.log('Error checking subscription:', error);
    }

    // Check for re-engagement (inactive for 3+ days)
    try {
      const { data: eventData } = await supabase
        .from('app_event_logs')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (eventData?.created_at) {
        const lastActivity = new Date(eventData.created_at);
        const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // Show if last activity was 3+ days ago but user is active now
        if (lastActivity < threeDaysAgo) {
          return { 
            shouldShow: true, 
            trigger: 'reengagement',
            reason: 'Re-engagement after inactivity'
          };
        }
      }
    } catch (error) {
      console.log('Error checking activity:', error);
    }

    return { shouldShow: false, trigger: 'registration' };
  }, [user, state]);

  // Update specific consent
  const updateConsent = useCallback(async (
    consentType: 'general' | 'email' | 'sms' | 'personalization' | 'analytics',
    isGranted: boolean,
    source: string = 'api'
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase.functions.invoke('marketing-consent-manager', {
        body: {
          action: 'update_consent',
          consent_type: consentType,
          is_granted: isGranted,
          source
        }
      });

      if (error) throw error;

      // Reload state
      await loadConsentStatus();
      return true;

    } catch (error) {
      console.error('Update consent error:', error);
      return false;
    }
  }, [user, loadConsentStatus]);

  // Grant marketing reward
  const grantReward = useCallback(async () => {
    if (!user || !state.isEligibleForReward) return false;

    try {
      const { data, error } = await supabase.functions.invoke('marketing-consent-reward', {
        body: { action: 'grant_reward' }
      });

      if (error) throw error;

      // Reload state
      await loadConsentStatus();
      return data;

    } catch (error) {
      console.error('Grant reward error:', error);
      return false;
    }
  }, [user, state.isEligibleForReward, loadConsentStatus]);

  // Initialize on mount
  useEffect(() => {
    loadConsentStatus();
  }, [loadConsentStatus]);

  return {
    ...state,
    loadConsentStatus,
    checkShouldShowModal,
    updateConsent,
    grantReward
  };
};