import { useState, useEffect } from 'react';
import { SimplifiedLearningEngine } from '@/lib/SimplifiedLearningEngine';
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
      return await tutor.generateAdaptiveTask(contextWithUser);
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
      return await predictiveAssistant.predictNextStruggle(user.id);
    } catch (error) {
      console.error('Error getting learning predictions:', error);
      return null;
    }
  };

  const optimizeSpacedRepetition = async (skillId: string) => {
    if (!user?.id) return null;

    try {
      return await neuroplasticityEngine.optimizeSpacedRepetition(user.id, skillId);
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