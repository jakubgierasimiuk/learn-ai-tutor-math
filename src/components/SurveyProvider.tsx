import React, { useEffect } from 'react';
import { useSurveyManager } from '@/hooks/useSurveyManager';
import { SmartSurveyModal } from '@/components/SmartSurveyModal';
import { setSurveyTriggerCallback } from '@/lib/logger';

interface SurveyProviderProps {
  children: React.ReactNode;
}

export const SurveyProvider: React.FC<SurveyProviderProps> = ({ children }) => {
  const { currentSurvey, isOpen, triggerSurvey, closeSurvey } = useSurveyManager();

  useEffect(() => {
    // Set up the survey trigger callback for the logger
    setSurveyTriggerCallback(triggerSurvey);

    return () => {
      setSurveyTriggerCallback(() => {});
    };
  }, [triggerSurvey]);

  return (
    <>
      {children}
      <SmartSurveyModal
        survey={currentSurvey}
        open={isOpen}
        onClose={closeSurvey}
      />
    </>
  );
};