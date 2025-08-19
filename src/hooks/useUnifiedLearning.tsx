import { useState, useEffect } from 'react';
import { UnifiedLearningController } from '@/lib/UnifiedLearningController';
import { SmartLearningOrchestrator, LearningContext, AdaptationDecision } from '@/lib/SmartLearningOrchestrator';
import { useAuth } from './useAuth';

export const useUnifiedLearning = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [learnerProfile, setLearnerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const orchestrator = SmartLearningOrchestrator.getInstance();

  // Initialize learner profile
  useEffect(() => {
    if (user?.id) {
      loadLearnerProfile();
    }
  }, [user?.id]);

  const loadLearnerProfile = async () => {
    if (!user?.id) return;
    
    try {
      const profile = await UnifiedLearningController.getOrCreateProfile(user.id);
      setLearnerProfile(profile);
    } catch (error) {
      console.error('Error loading learner profile:', error);
    }
  };

  const startSession = async (
    sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed',
    skillFocus?: string,
    department: string = 'mathematics'
  ) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      const sessionId = await UnifiedLearningController.startSession(
        user.id,
        sessionType,
        skillFocus,
        department
      );
      setCurrentSession(sessionId);
      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const processLearningStep = async (context: LearningContext): Promise<AdaptationDecision | null> => {
    try {
      setIsLoading(true);
      
      // Get orchestrator decision
      const decision = await orchestrator.orchestrateLearning(context);
      
      // Update current session if response provided
      if (currentSession && context.userResponse !== undefined) {
        await UnifiedLearningController.updateSession(currentSession, {
          taskCompleted: true,
          isCorrect: context.isCorrect,
          responseTime: context.responseTime,
          hintsUsed: context.hintsUsed,
          difficultyAdjustment: decision.newDifficulty - (learnerProfile?.current_learning_context?.current_difficulty || 5)
        });
      }

      return decision;
    } catch (error) {
      console.error('Error processing learning step:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSession = async () => {
    if (!currentSession) return;

    try {
      await UnifiedLearningController.completeSession(currentSession);
      setCurrentSession(null);
      await loadLearnerProfile(); // Refresh profile
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const getRecommendations = async () => {
    if (!user?.id) return null;
    
    try {
      return await UnifiedLearningController.getRecommendations(user.id);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return null;
    }
  };

  const getLearningStatistics = async () => {
    if (!user?.id) return null;
    
    try {
      return await orchestrator.getLearningStatistics(user.id);
    } catch (error) {
      console.error('Error getting learning statistics:', error);
      return null;
    }
  };

  return {
    learnerProfile,
    currentSession,
    isLoading,
    startSession,
    processLearningStep,
    completeSession,
    getRecommendations,
    getLearningStatistics,
    refreshProfile: loadLearnerProfile
  };
};