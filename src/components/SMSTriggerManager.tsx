import React, { useState, useEffect } from 'react';
import { SMSActivationModal } from '@/components/SMSActivationModal';
import { useSMSGamification } from '@/hooks/useSMSGamification';
import { useAuth } from '@/hooks/useAuth';
import { useReferralV2 } from '@/hooks/useReferralV2';
import { useViralTriggers } from '@/hooks/useViralTriggers';
import { supabase } from '@/integrations/supabase/client';

export const SMSTriggerManager: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [userHasPhone, setUserHasPhone] = useState(false);
  const { user } = useAuth();
  const { getSMSTriggerConditions } = useSMSGamification();
  const { checkActivation } = useReferralV2();
  const { triggerMilestone } = useViralTriggers();

  useEffect(() => {
    checkPhoneVerificationStatus();
  }, [user]);

  // Check if user already has verified phone
  const checkPhoneVerificationStatus = async () => {
    if (!user) return;
    
    // Check profile for phone number
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone_e164, phone_verified_at')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setUserHasPhone(!!(profile?.phone_e164 && profile?.phone_verified_at));
  };

  // Smart trigger logic - check various conditions
  useEffect(() => {
    if (!user || userHasPhone) return;

    const conditions = getSMSTriggerConditions();
    
    if (conditions.showSMSPrompt) {
      // Add small delay for better UX
      const delay = conditions.urgencyLevel === 'critical' ? 0 : 2000;
      
      setTimeout(() => {
        setShowModal(true);
      }, delay);
    }
  }, [user, userHasPhone, getSMSTriggerConditions]);

  // Handle SMS verification completion
  const handleVerificationComplete = async (phoneNumber: string) => {
    setUserHasPhone(true);
    setShowModal(false);
    
    // Trigger viral moment
    triggerMilestone('phone_verified', {
      phoneNumber,
      bonusTokens: 4000
    });

    // Auto-trigger activation check after SMS + minimum learning time
    setTimeout(() => {
      checkActivation();
    }, 1200000); // 20 minutes
  };

  // Trigger SMS on specific events
  useEffect(() => {
    const handleSMSTriggerEvent = (event: CustomEvent) => {
      if (!userHasPhone && !showModal) {
        const { triggerType } = event.detail;
        
        const conditions = getSMSTriggerConditions();
        if (conditions.showSMSPrompt || triggerType === 'force') {
          setShowModal(true);
        }
      }
    };

    window.addEventListener('trigger-sms-prompt', handleSMSTriggerEvent as EventListener);
    return () => {
      window.removeEventListener('trigger-sms-prompt', handleSMSTriggerEvent as EventListener);
    };
  }, [userHasPhone, showModal, getSMSTriggerConditions]);

  return (
    <SMSActivationModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onVerificationComplete={handleVerificationComplete}
    />
  );
};