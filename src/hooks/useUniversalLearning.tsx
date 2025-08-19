import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Unified Learning State Interface
interface UniversalLearningState {
  // Profile data
  learningProfile: {
    learningVelocity: number;
    difficultyMultiplier: number;
    preferredStyle: string;
    cognitiveLoad: number;
    masteryLevel: number;
    flowState: number;
    fatigueLevel: number;
    attentionSpan: number;
  };
  // Current session
  currentSession: {
    id: string;
    type: string;
    startTime: string;
    skillFocus?: string;
    difficulty: number;
    tasksCompleted: number;
    correctAnswers: number;
    totalResponseTime: number;
    hintsUsed: number;
    engagementScore: number;
  } | null;
  // Performance data
  recentPerformance: {
    accuracy: number;
    averageResponseTime: number;
    recentTopics: string[];
    strugglingAreas: string[];
    masteredSkills: string[];
    errorPatterns: Record<string, number>;
  };
  // Adaptive recommendations
  recommendations: {
    nextAction: string;
    suggestedDifficulty: number;
    recommendedContent: string;
    explanationStyle: string;
    estimatedSessionTime: number;
    suggestedBreakTime?: number;
  };
}

// Learning Interaction Context
interface LearningInteractionContext {
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed';
  userMessage?: string;
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  skillId?: string;
  difficulty?: number;
  department?: string;
  context?: any;
}

// Unified Task Definition
interface UniversalTask {
  id: string;
  type: 'ai_generated' | 'database_content' | 'generated_math';
  department: string;
  skill: string;
  difficulty: number;
  content: string;
  expectedAnswer?: string;
  hints?: string[];
  metadata: Record<string, any>;
}

// Default state
const getDefaultState = (): UniversalLearningState => ({
  learningProfile: {
    learningVelocity: 1.0,
    difficultyMultiplier: 1.0,
    preferredStyle: 'balanced',
    cognitiveLoad: 0.5,
    masteryLevel: 0.5,
    flowState: 0.5,
    fatigueLevel: 0.0,
    attentionSpan: 25
  },
  currentSession: null,
  recentPerformance: {
    accuracy: 0.5,
    averageResponseTime: 30000,
    recentTopics: [],
    strugglingAreas: [],
    masteredSkills: [],
    errorPatterns: {}
  },
  recommendations: {
    nextAction: 'continue',
    suggestedDifficulty: 5,
    recommendedContent: 'Rozpocznij swoją spersonalizowaną naukę!',
    explanationStyle: 'balanced',
    estimatedSessionTime: 30
  }
});

/**
 * UNIVERSAL LEARNING HOOK
 * Single source of truth for all learning interactions
 */
export const useUniversalLearning = () => {
  const { user } = useAuth();
  const [userState, setUserState] = useState<UniversalLearningState>(getDefaultState());
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<UniversalTask | null>(null);
  const [lastInteractionResult, setLastInteractionResult] = useState<any>(null);

  // Load initial user state
  useEffect(() => {
    if (user?.id) {
      loadUserState();
    }
  }, [user?.id]);

  /**
   * Load complete user state from Universal Learning Engine
   */
  const loadUserState = useCallback(async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('universal-learning-engine', {
        body: {
          action: 'get_state',
          userId: user.id
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { userState: newState } = response.data;
      setUserState(newState);
    } catch (error) {
      console.error('Error loading user state:', error);
      // Keep default state on error
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Process learning interaction and get adaptive response
   */
  const processInteraction = useCallback(async (context: LearningInteractionContext) => {
    if (!user?.id) return null;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('universal-learning-engine', {
        body: {
          action: 'process_interaction',
          userId: user.id,
          ...context
        }
      });

      if (response.error) {
        throw response.error;
      }

      const result = response.data;
      
      // Update local state with new user state
      if (result.userState) {
        setUserState(result.userState);
      }
      
      // Store last interaction result for components to access
      setLastInteractionResult(result);
      
      return result;
    } catch (error) {
      console.error('Error processing interaction:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Start a new learning session
   */
  const startSession = useCallback(async (
    sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed',
    skillId?: string,
    department?: string
  ) => {
    if (!user?.id) return null;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('universal-learning-engine', {
        body: {
          action: 'start_session',
          userId: user.id,
          sessionType,
          skillId,
          department
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { sessionId } = response.data;
      
      // Refresh user state to get updated session info
      await loadUserState();
      
      return sessionId;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadUserState]);

  /**
   * Generate a task based on current user state
   */
  const generateTask = useCallback(async (
    difficulty?: number,
    skillId?: string,
    department?: string
  ) => {
    if (!user?.id) return null;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('universal-learning-engine', {
        body: {
          action: 'generate_task',
          userId: user.id,
          difficulty: difficulty || userState.recommendations.suggestedDifficulty,
          skillId,
          department: department || 'mathematics'
        }
      });

      if (response.error) {
        throw response.error;
      }

      const { task } = response.data;
      setCurrentTask(task);
      
      return task;
    } catch (error) {
      console.error('Error generating task:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, userState.recommendations.suggestedDifficulty]);

  /**
   * Get recommendations based on current state
   */
  const getRecommendations = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const response = await supabase.functions.invoke('universal-learning-engine', {
        body: {
          action: 'get_recommendations',
          userId: user.id
        }
      });

      if (response.error) {
        throw response.error;
      }

      return response.data.recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return null;
    }
  }, [user?.id]);

  /**
   * Refresh user state from backend
   */
  const refreshState = useCallback(async () => {
    await loadUserState();
  }, [loadUserState]);

  // Expose derived state for easy access
  const derivedState = {
    // Learning profile metrics
    cognitiveLoad: userState.learningProfile.cognitiveLoad,
    masteryLevel: userState.learningProfile.masteryLevel,
    flowState: userState.learningProfile.flowState,
    fatigueLevel: userState.learningProfile.fatigueLevel,
    attentionSpan: userState.learningProfile.attentionSpan,
    
    // Performance metrics
    accuracy: userState.recentPerformance.accuracy,
    averageResponseTime: userState.recentPerformance.averageResponseTime,
    strugglingAreas: userState.recentPerformance.strugglingAreas,
    masteredSkills: userState.recentPerformance.masteredSkills,
    
    // Recommendations
    nextAction: userState.recommendations.nextAction,
    suggestedDifficulty: userState.recommendations.suggestedDifficulty,
    recommendedContent: userState.recommendations.recommendedContent,
    explanationStyle: userState.recommendations.explanationStyle,
    estimatedSessionTime: userState.recommendations.estimatedSessionTime,
    suggestedBreakTime: userState.recommendations.suggestedBreakTime,
    
    // Session info
    hasActiveSession: !!userState.currentSession,
    currentSessionType: userState.currentSession?.type,
    sessionEngagement: userState.currentSession?.engagementScore,
    
    // State helpers
    needsBreak: userState.recommendations.nextAction === 'take_break',
    inFlowState: userState.learningProfile.flowState > 0.7,
    highCognitiveLoad: userState.learningProfile.cognitiveLoad > 0.7,
    isStrugglingAreas: userState.recentPerformance.strugglingAreas.length > 0
  };

  return {
    // Core state
    userState,
    isLoading,
    currentTask,
    lastInteractionResult,
    
    // Derived state for easy access
    ...derivedState,
    
    // Actions
    processInteraction,
    startSession,
    generateTask,
    getRecommendations,
    refreshState,
    
    // Convenience methods
    isReady: !!user?.id && !isLoading,
    hasSession: !!userState.currentSession
  };
};

export default useUniversalLearning;
