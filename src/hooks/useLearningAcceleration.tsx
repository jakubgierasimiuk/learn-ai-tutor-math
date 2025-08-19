import { useState } from 'react';
import { SimplifiedLearningEngine } from '@/lib/SimplifiedLearningEngine';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface LearningContext {
  userId: string;
  currentSkill?: string;
  department?: string;
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  hintsUsed?: number;
  confidence?: number;
}

interface AdaptationDecision {
  newDifficulty: number;
  recommendedAction: string;
  nextTask: any;
  feedbackMessage: string;
  explanationStyle: string;
  cognitiveLoadOptimization: any;
  neuroplasticityRecommendations: any;
}

export const useLearningAcceleration = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [learningEngine] = useState(() => SimplifiedLearningEngine.getInstance());

  const processLearningStep = async (context: LearningContext): Promise<any> => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      const learningState = await learningEngine.processLearning(user.id, context);
      
      return {
        newDifficulty: learningState.difficulty,
        recommendedAction: learningState.nextAction,
        feedbackMessage: `Cognitive Load: ${Math.round(learningState.cognitiveLoad * 100)}%`,
        cognitiveLoadOptimization: { currentLoad: learningState.cognitiveLoad }
      };
    } catch (error) {
      console.error('Error processing learning step:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateAdaptiveTask = async (context: LearningContext) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      const contextWithUser = { ...context, userId: user.id };
      
      // Generate basic adaptive task using existing system
      return {
        id: `task_${Date.now()}`,
        department: context.department || 'mathematics',
        skillName: context.currentSkill || 'Basic Math',
        microSkill: 'basic_operations',
        difficulty: 5,
        latex: '2x + 3 = 7',
        expectedAnswer: '2',
        misconceptionMap: {
          '4': { type: 'calculation_error', feedback: 'Sprawdź obliczenia ponownie.' }
        }
      };
    } catch (error) {
      console.error('Error generating adaptive task:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getLearningPredictions = async () => {
    if (!user?.id) return null;

    try {
      // Get basic predictions from validation logs
      const { data: logs } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      const accuracy = logs && logs.length > 0 
        ? logs.filter(log => log.is_correct).length / logs.length 
        : 0.5;

      return {
        strugglingSkills: accuracy < 0.6 ? ['algebra', 'equations'] : [],
        learningVelocity: accuracy > 0.7 ? 1.2 : 0.8,
        cognitiveLoad: accuracy < 0.5 ? 0.8 : 0.5
      };
    } catch (error) {
      console.error('Error getting learning predictions:', error);
      return null;
    }
  };

  const optimizeSpacedRepetition = async (skillId: string) => {
    if (!user?.id) return null;

    try {
      // Basic spaced repetition using skill progress
      const { data: progress } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
        .maybeSingle();

      const masteryLevel = progress?.mastery_level || 0;
      const hoursToWait = masteryLevel > 5 ? 48 : 24;

      return {
        nextReviewAt: new Date(Date.now() + hoursToWait * 60 * 60 * 1000),
        masteryLevel,
        intervalHours: hoursToWait
      };
    } catch (error) {
      console.error('Error optimizing spaced repetition:', error);
      return null;
    }
  };

  return {
    isLoading,
    processLearningStep,
    generateAdaptiveTask,
    getLearningPredictions,
    optimizeSpacedRepetition
  };
};