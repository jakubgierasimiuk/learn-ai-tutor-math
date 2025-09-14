import React, { useEffect } from 'react';
import { useSurveyManager } from '@/hooks/useSurveyManager';

interface LessonFeedbackProps {
  lessonId: string;
  lessonName: string;
  score?: number;
  timeSpent: number;
  difficulty: number;
}

export const LessonFeedback: React.FC<LessonFeedbackProps> = ({
  lessonId,
  lessonName,
  score,
  timeSpent,
  difficulty
}) => {
  const { triggerSurvey } = useSurveyManager();

  useEffect(() => {
    // Trigger lesson feedback survey with 30% probability
    const shouldTrigger = Math.random() < 0.3;
    
    if (shouldTrigger) {
      const context = {
        lesson_id: lessonId,
        lesson_name: lessonName,
        score: score,
        time_spent_minutes: Math.round(timeSpent / 60),
        difficulty_level: difficulty,
        completed_at: new Date().toISOString()
      };

      // Small delay to ensure lesson completion is processed
      setTimeout(() => {
        triggerSurvey('lesson_feedback', context);
      }, 2000);
    }
  }, [lessonId, triggerSurvey, lessonName, score, timeSpent, difficulty]);

  // This component doesn't render anything visible
  return null;
};