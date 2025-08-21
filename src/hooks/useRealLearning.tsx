import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Real Learning State based on cognitive science
interface RealLearningProfile {
  userId: string;
  processingSpeed: number;         // measured from actual response times
  workingMemorySpan: number;      // measured from task complexity handling
  cognitiveLoadThreshold: number; // when overload occurs
  attentionSpan: number;          // measured session duration
  visualVsVerbal: number;         // learning style preference
  optimalSessionLength: number;   // data-driven optimal time
  currentEnergyLevel: number;     // real-time state
  frustrationLevel: number;       // measured from interactions
  confidenceLevel: number;        // self-reported + behavioral
}

interface RealLearningSession {
  id: string;
  type: 'adaptive_practice' | 'spaced_review' | 'mastery_check';
  targetSkills: string[];
  currentDifficulty: number;
  tasksCompleted: number;
  correctResponses: number;
  cognitiveLoadLevel: number;
  engagementLevel: number;
  skillsPracticed: string[];
  skillsMastered: string[];
  knowledgeGapsIdentified: string[];
}

interface ValidationResult {
  isCorrect: boolean;
  partialCredit: number;
  detectedMisconceptions: string[];
  feedback: string;
}

interface AdaptiveTask {
  id: string;
  type: string;
  skillCode: string;
  difficulty: number;
  problem: string;
  expectedAnswer: string;
  hints: string[];
  estimatedTime: string;
  metadata: any;
}

interface SpacedRepetitionCard {
  id: string;
  skillNodeId: string;
  nextReviewAt: string;
  masteryLevel: number;
  intervalDays: number;
  easeFactor: number;
}

/**
 * REAL LEARNING HOOK
 * Based on actual cognitive science and learning analytics
 */
export const useRealLearning = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<RealLearningProfile | null>(null);
  const [currentSession, setCurrentSession] = useState<RealLearningSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dueReviews, setDueReviews] = useState<SpacedRepetitionCard[]>([]);

  // Load user profile on mount
  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
      loadDueReviews();
    }
  }, [user?.id]);

  /**
   * Load real learning profile from database
   */
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('real-learning-engine', {
        body: {
          action: 'get_profile',
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      const profileData = response.data;
      setProfile({
        userId: user.id,
        processingSpeed: profileData?.processing_speed_percentile || 50,
        workingMemorySpan: profileData?.working_memory_span || 4,
        cognitiveLoadThreshold: profileData?.cognitive_load_threshold || 0.7,
        attentionSpan: profileData?.attention_span_minutes || 25,
        visualVsVerbal: profileData?.visual_vs_verbal_preference || 0.5,
        optimalSessionLength: profileData?.optimal_session_length_minutes || 30,
        currentEnergyLevel: profileData?.current_energy_level || 1.0,
        frustrationLevel: profileData?.frustration_level || 0.0,
        confidenceLevel: profileData?.confidence_level || 0.5
      });
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Load cards due for spaced repetition review
   */
  const loadDueReviews = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await supabase.functions.invoke('real-learning-engine', {
        body: {
          action: 'get_due_reviews',
          userId: user.id
        }
      });

      if (response.error) throw response.error;

      setDueReviews(response.data.dueCards || []);
    } catch (error) {
      console.error('Error loading due reviews:', error);
    }
  }, [user?.id]);

  /**
   * Generate adaptive task based on real user profile
   */
  const generateAdaptiveTask = useCallback(async (
    targetDifficulty?: number,
    skillCode?: string
  ): Promise<AdaptiveTask | null> => {
    if (!user?.id || !profile) return null;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('real-learning-engine', {
        body: {
          action: 'generate_task',
          userId: user.id,
          difficulty: targetDifficulty || 5,
          skillCode: skillCode || 'b5a925c5-5821-401f-a7bb-824bceee34d3' // Use real skill UUID
        }
      });

      if (response.error) throw response.error;

      return response.data;
    } catch (error) {
      console.error('Error generating adaptive task:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, profile]);

  /**
   * Validate answer with misconception detection and adaptive feedback
   */
  const validateAnswer = useCallback(async (
    userAnswer: string,
    expectedAnswer: string,
    skillCode: string
  ): Promise<ValidationResult | null> => {
    if (!user?.id) return null;

    try {
      const response = await supabase.functions.invoke('real-learning-engine', {
        body: {
          action: 'validate_answer',
          userId: user.id,
          userAnswer,
          expectedAnswer,
          skillCode
        }
      });

      if (response.error) throw response.error;

      return response.data;
    } catch (error) {
      console.error('Error validating answer:', error);
      return null;
    }
  }, [user?.id]);

  /**
   * Process complete learning interaction with all analytics
   */
  const processLearningInteraction = useCallback(async (interaction: {
    userAnswer: string;
    expectedAnswer: string;
    skillCode: string;
    skillNodeId: string;
    sessionId: string;
    difficulty: number;
    responseTime: number;
    revisionsCount?: number;
    pausePattern?: any;
  }) => {
    if (!user?.id) return null;

    setIsLoading(true);
    try {
      const response = await supabase.functions.invoke('real-learning-engine', {
        body: {
          action: 'process_interaction',
          userId: user.id,
          ...interaction
        }
      });

      if (response.error) throw response.error;

      // Update due reviews after interaction
      await loadDueReviews();

      return response.data;
    } catch (error) {
      console.error('Error processing interaction:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, loadDueReviews]);

  /**
   * Start intelligent learning session
   */
  const startLearningSession = useCallback(async (
    sessionType: 'adaptive_practice' | 'spaced_review' | 'mastery_check',
    targetSkills?: string[]
  ) => {
    if (!user?.id) return null;

    try {
      const { data: session, error } = await supabase
        .from('unified_learning_sessions')
        .insert({
          user_id: user.id,
          profile_id: user.id, // Required field
          session_type: sessionType,
          skill_focus: targetSkills?.[0] || null,
          difficulty_level: 5.0,
          engagement_score: 0.5
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentSession({
        id: session.id,
        type: sessionType,
        targetSkills: targetSkills || [],
        currentDifficulty: 5.0,
        tasksCompleted: 0,
        correctResponses: 0,
        cognitiveLoadLevel: 0.5,
        engagementLevel: 0.5,
        skillsPracticed: [],
        skillsMastered: [],
        knowledgeGapsIdentified: []
      });

      return session.id;
    } catch (error) {
      console.error('Error starting session:', error);
      return null;
    }
  }, [user?.id]);

  /**
   * End learning session with analytics
   */
  const endLearningSession = useCallback(async () => {
    if (!currentSession) return;

    try {
      await supabase
        .from('unified_learning_sessions')
        .update({
          completed_at: new Date().toISOString()
        })
        .eq('id', currentSession.id);

      setCurrentSession(null);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [currentSession]);

  /**
   * Get personalized learning recommendations
   */
  const getRecommendations = useCallback(() => {
    if (!profile) return [];

    const recommendations = [];

    // Cognitive load recommendations
    if (profile.frustrationLevel > 0.7) {
      recommendations.push({
        type: 'break',
        message: 'Take a 5-10 minute break to reset your focus',
        priority: 'high'
      });
    }

    // Spaced repetition recommendations
    if (dueReviews.length > 0) {
      recommendations.push({
        type: 'review',
        message: `${dueReviews.length} skills ready for review to strengthen memory`,
        priority: 'medium'
      });
    }

    // Energy level recommendations
    if (profile.currentEnergyLevel < 0.4) {
      recommendations.push({
        type: 'energy',
        message: 'Consider shorter practice sessions or easier material',
        priority: 'medium'
      });
    }

    // Confidence building
    if (profile.confidenceLevel < 0.4) {
      recommendations.push({
        type: 'confidence',
        message: 'Practice some easier problems to build confidence',
        priority: 'medium'
      });
    }

    return recommendations;
  }, [profile, dueReviews]);

  // Derived state for easy access
  const derivedState = {
    // Profile insights
    isHighCognitiveLoad: profile ? profile.frustrationLevel > 0.7 : false,
    isLowEnergy: profile ? profile.currentEnergyLevel < 0.4 : false,
    needsBreak: profile ? profile.frustrationLevel > 0.8 : false,
    isVisualLearner: profile ? profile.visualVsVerbal > 0.6 : false,
    
    // Session insights
    hasActiveSession: !!currentSession,
    sessionProgress: currentSession ? currentSession.tasksCompleted : 0,
    sessionAccuracy: currentSession && currentSession.tasksCompleted > 0 ? 
      currentSession.correctResponses / currentSession.tasksCompleted : 0,
    
    // Review insights
    hasDueReviews: dueReviews.length > 0,
    dueReviewCount: dueReviews.length,
    urgentReviews: dueReviews.filter(card => 
      new Date(card.nextReviewAt) < new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  };

  return {
    // Core state
    profile,
    currentSession,
    dueReviews,
    isLoading,
    
    // Derived insights
    ...derivedState,
    
    // Actions
    generateAdaptiveTask,
    validateAnswer,
    processLearningInteraction,
    startLearningSession,
    endLearningSession,
    loadUserProfile,
    loadDueReviews,
    getRecommendations,
    
    // Convenience
    isReady: !!user?.id && !!profile,
    hasData: !!profile
  };
};

export default useRealLearning;