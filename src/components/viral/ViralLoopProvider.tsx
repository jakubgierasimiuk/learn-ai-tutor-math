import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReferralV2 } from '@/hooks/useReferralV2';
import { supabase } from '@/integrations/supabase/client';

interface ViralLoopContextType {
  showSuccessPopup: (trigger: string, details?: any) => void;
  showSocialProof: (type: 'testimonial' | 'local_stats' | 'fomo', data: any) => void;
  trackViralMoment: (eventType: string, data: any) => void;
}

const ViralLoopContext = createContext<ViralLoopContextType | undefined>(undefined);

export const useViralLoop = () => {
  const context = useContext(ViralLoopContext);
  if (!context) {
    throw new Error('useViralLoop must be used within ViralLoopProvider');
  }
  return context;
};

interface ViralLoopProviderProps {
  children: React.ReactNode;
}

export const ViralLoopProvider: React.FC<ViralLoopProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { stats } = useReferralV2();
  
  const showSuccessPopup = (trigger: string, details?: any) => {
    // Create and show popup based on trigger
    const event = new CustomEvent('show-viral-popup', {
      detail: { trigger, details, stats }
    });
    window.dispatchEvent(event);
  };

  const showSocialProof = (type: 'testimonial' | 'local_stats' | 'fomo', data: any) => {
    const event = new CustomEvent('show-social-proof', {
      detail: { type, data }
    });
    window.dispatchEvent(event);
  };

  const trackViralMoment = async (eventType: string, data: any) => {
    if (!user) return;
    
    try {
      // Track in app_event_logs instead
      await supabase.from('app_event_logs').insert({
        user_id: user.id,
        event_type: 'viral_moment',
        metadata: { viral_event: eventType, data: data },
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.log('Viral event tracking failed:', error);
    }
  };

  const value: ViralLoopContextType = {
    showSuccessPopup,
    showSocialProof,
    trackViralMoment,
  };

  return (
    <ViralLoopContext.Provider value={value}>
      {children}
    </ViralLoopContext.Provider>
  );
};