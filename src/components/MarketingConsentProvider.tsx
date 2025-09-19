import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMarketingConsent } from '@/hooks/useMarketingConsent';
import { MarketingConsentModal } from '@/components/MarketingConsentModal';

interface MarketingConsentContextType {
  showModal: (trigger?: 'registration' | 'first_lesson' | 'reengagement' | 'token_warning') => void;
  hideModal: () => void;
  isModalOpen: boolean;
  currentTrigger: 'registration' | 'first_lesson' | 'reengagement' | 'token_warning';
}

const MarketingConsentContext = createContext<MarketingConsentContextType | undefined>(undefined);

export const useMarketingConsentModal = () => {
  const context = useContext(MarketingConsentContext);
  if (!context) {
    throw new Error('useMarketingConsentModal must be used within MarketingConsentProvider');
  }
  return context;
};

interface MarketingConsentProviderProps {
  children: React.ReactNode;
}

export const MarketingConsentProvider: React.FC<MarketingConsentProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { checkShouldShowModal, hasGeneralConsent, isEligibleForReward, loading } = useMarketingConsent();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<'registration' | 'first_lesson' | 'reengagement' | 'token_warning'>('registration');
  const [hasCheckedOnMount, setHasCheckedOnMount] = useState(false);

  // Auto-check for modal display on user login/registration
  useEffect(() => {
    if (!user || loading || hasCheckedOnMount) return;

    const checkAndShowModal = async () => {
      try {
        const { shouldShow, trigger } = await checkShouldShowModal();
        
        if (shouldShow && isEligibleForReward && !hasGeneralConsent) {
          setCurrentTrigger(trigger);
          
          // Small delay to ensure UI is ready
          setTimeout(() => {
            setIsModalOpen(true);
          }, 1000);
        }
        
        setHasCheckedOnMount(true);
      } catch (error) {
        console.error('Error checking modal display:', error);
        setHasCheckedOnMount(true);
      }
    };

    checkAndShowModal();
  }, [user, loading, checkShouldShowModal, isEligibleForReward, hasGeneralConsent, hasCheckedOnMount]);

  // Listen for lesson completion events
  useEffect(() => {
    if (!user || hasGeneralConsent || !isEligibleForReward) return;

    let lessonTimeout: NodeJS.Timeout;

    const handleLessonCompleted = async () => {
      const { shouldShow, trigger } = await checkShouldShowModal();
      
      if (shouldShow && trigger === 'first_lesson') {
        setCurrentTrigger(trigger);
        lessonTimeout = setTimeout(() => {
          setIsModalOpen(true);
        }, 2000); // Longer delay after lesson completion
      }
    };

    const handleHighTokenUsage = () => {
      if (!hasGeneralConsent && isEligibleForReward) {
        setCurrentTrigger('token_warning');
        setIsModalOpen(true);
      }
    };

    // Listen for custom events
    if (typeof window !== 'undefined') {
      window.addEventListener('lesson-completed', handleLessonCompleted);
      window.addEventListener('high-token-usage', handleHighTokenUsage);
    }

    return () => {
      clearTimeout(lessonTimeout);
      if (typeof window !== 'undefined') {
        window.removeEventListener('lesson-completed', handleLessonCompleted);
        window.removeEventListener('high-token-usage', handleHighTokenUsage);
      }
    };
  }, [user, hasGeneralConsent, isEligibleForReward, checkShouldShowModal]);

  // Check for re-engagement (user returns after inactivity) - SAFE localStorage access
  useEffect(() => {
    if (!user || hasGeneralConsent || !isEligibleForReward || typeof window === 'undefined') return;

    let reengagementTimeout: NodeJS.Timeout;

    try {
      const lastVisit = localStorage.getItem(`last-visit-${user.id}`);
      const now = Date.now();
      
      if (lastVisit) {
        const daysSinceLastVisit = (now - parseInt(lastVisit)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastVisit >= 3) {
          // User returned after 3+ days
          reengagementTimeout = setTimeout(() => {
            setCurrentTrigger('reengagement');
            setIsModalOpen(true);
          }, 3000); // Show after 3 seconds
        }
      }

      // Update last visit timestamp
      localStorage.setItem(`last-visit-${user.id}`, now.toString());
    } catch {
      // Silent fail - localStorage not available
    }

    // Set up visibility change listener for re-engagement
    const handleVisibilityChange = () => {
      if (!document.hidden && typeof window !== 'undefined') {
        try {
          localStorage.setItem(`last-visit-${user.id}`, Date.now().toString());
        } catch {
          // Silent fail - localStorage not available
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearTimeout(reengagementTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, hasGeneralConsent, isEligibleForReward]);

  const showModal = (trigger: 'registration' | 'first_lesson' | 'reengagement' | 'token_warning' = 'registration') => {
    if (!isEligibleForReward || hasGeneralConsent) return;
    
    setCurrentTrigger(trigger);
    setIsModalOpen(true);
  };

  const hideModal = () => {
    setIsModalOpen(false);
  };

  const contextValue: MarketingConsentContextType = {
    showModal,
    hideModal,
    isModalOpen,
    currentTrigger
  };

  return (
    <MarketingConsentContext.Provider value={contextValue}>
      {children}
      <MarketingConsentModal
        isOpen={isModalOpen}
        onClose={hideModal}
        trigger={currentTrigger}
      />
    </MarketingConsentContext.Provider>
  );
};