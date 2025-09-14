import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Survey {
  survey_id: string;
  survey_type: string;
  title: string;
  description: string;
  questions: any[];
  context: Record<string, any>;
}

export const useSurveyManager = () => {
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();

  const checkForDueSurveys = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .rpc('get_due_surveys_for_user', { target_user_id: user.id });

      if (error) {
        console.error('Error fetching due surveys:', error);
        return;
      }

      if (data && data.length > 0) {
        const survey = data[0];
        setCurrentSurvey({
          ...survey,
          questions: Array.isArray(survey.questions) ? survey.questions : JSON.parse(survey.questions as string),
          context: typeof survey.context === 'object' ? survey.context as Record<string, any> : {}
        });
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Error checking for due surveys:', error);
    }
  };

  const triggerSurvey = async (surveyType: string, context: Record<string, any> = {}) => {
    if (!user?.id) return;

    try {
      // Get survey template
      const { data: templates, error: templateError } = await supabase
        .from('survey_templates')
        .select('*')
        .eq('survey_type', surveyType)
        .eq('is_active', true)
        .limit(1);

      if (templateError || !templates || templates.length === 0) {
        console.error('No survey template found for type:', surveyType);
        return;
      }

      const template = templates[0];

      // Check if user already has a pending survey of this type
      const { data: existingSurvey } = await supabase
        .from('user_surveys')
        .select('id')
        .eq('user_id', user.id)
        .eq('survey_type', surveyType)
        .eq('status', 'pending')
        .limit(1);

      if (existingSurvey && existingSurvey.length > 0) {
        console.log('User already has pending survey of this type');
        return;
      }

      // Check frequency limit
      const { data: recentSurveys } = await supabase
        .from('user_surveys')
        .select('completed_at')
        .eq('user_id', user.id)
        .eq('survey_type', surveyType)
        .gte('completed_at', new Date(Date.now() - template.max_frequency_days * 24 * 60 * 60 * 1000).toISOString());

      if (recentSurveys && recentSurveys.length > 0) {
        console.log('User completed this survey type too recently');
        return;
      }

      // Apply probability filter for certain survey types
      const displayRules = template.display_rules as any;
      if (displayRules?.probability && Math.random() > displayRules.probability) {
        console.log('Survey not triggered due to probability filter');
        return;
      }

      // Create new survey instance
      const { data: newSurvey, error: insertError } = await supabase
        .from('user_surveys')
        .insert({
          user_id: user.id,
          survey_type: surveyType,
          template_id: template.id,
          context: context,
          status: 'pending'
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error creating survey instance:', insertError);
        return;
      }

      setCurrentSurvey({
        survey_id: newSurvey.id,
        survey_type: surveyType,
        title: template.title,
        description: template.description,
        questions: Array.isArray(template.questions) ? template.questions : JSON.parse(template.questions as string),
        context: context
      });
      setIsOpen(true);
    } catch (error) {
      console.error('Error triggering survey:', error);
    }
  };

  const closeSurvey = () => {
    setIsOpen(false);
    setCurrentSurvey(null);
  };

  // Check for due surveys on mount and user change
  useEffect(() => {
    if (user?.id) {
      checkForDueSurveys();
    }
  }, [user?.id]);

  return {
    currentSurvey,
    isOpen,
    triggerSurvey,
    closeSurvey,
    checkForDueSurveys
  };
};