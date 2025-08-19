import { supabase } from "@/integrations/supabase/client";

export interface UniversalLearnerProfile {
  id: string;
  user_id: string;
  diagnostic_summary: Record<string, any>;
  class_level: number;
  track: string;
  last_diagnostic_at?: string;
  learning_style: Record<string, any>;
  response_patterns: Record<string, any>;
  error_patterns: Record<string, any>;
  skill_mastery_map: Record<string, any>;
  micro_skill_strengths: Record<string, any>;
  prerequisite_gaps: Record<string, any>;
  preferred_explanation_style: string;
  optimal_difficulty_range: { min: number; max: number };
  engagement_triggers: Record<string, any>;
  frustration_threshold: number;
  difficulty_multiplier: number;
  learning_velocity: number;
  retention_rate: number;
  current_learning_context: Record<string, any>;
  last_interaction_summary: Record<string, any>;
  next_recommended_action: Record<string, any>;
  total_learning_time_minutes: number;
  sessions_completed: number;
  concepts_mastered: number;
  created_at: string;
  updated_at: string;
}

export interface UnifiedLearningSession {
  id: string;
  user_id: string;
  profile_id: string;
  session_type: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed';
  skill_focus?: string;
  department?: string;
  difficulty_level: number;
  tasks_completed: number;
  correct_answers: number;
  total_response_time_ms: number;
  hints_used: number;
  difficulty_adjustments: Record<string, any>[];
  engagement_score: number;
  frustration_incidents: number;
  learning_momentum: number;
  ai_model_used: string;
  total_tokens_used: number;
  explanation_style_used: string;
  learning_path: Record<string, any>[];
  context_switches: number;
  concepts_learned: string[];
  misconceptions_addressed: string[];
  next_session_recommendations: Record<string, any>;
  started_at: string;
  completed_at?: string;
}

export class UniversalLearningController {
  /**
   * Get or create learner profile for user
   */
  public static async getOrCreateProfile(userId: string): Promise<UniversalLearnerProfile | null> {
    try {
      // Try to get existing profile
      const { data: existing, error: fetchError } = await supabase
        .from('universal_learner_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing && !fetchError) {
        return existing as UniversalLearnerProfile;
      }

      // Create new profile if none exists
      const { data: newProfile, error: createError } = await supabase
        .from('universal_learner_profiles')
        .insert({
          user_id: userId,
          diagnostic_summary: {},
          learning_style: { visual: 0.33, auditory: 0.33, kinesthetic: 0.33 },
          response_patterns: { avg_response_time: 30000, confidence_pattern: 'moderate' },
          error_patterns: {},
          skill_mastery_map: {},
          micro_skill_strengths: {},
          prerequisite_gaps: {},
          optimal_difficulty_range: { min: 3, max: 7 },
          engagement_triggers: { variety: true, progress_feedback: true },
          current_learning_context: {},
          last_interaction_summary: {},
          next_recommended_action: { type: 'diagnostic', priority: 'high' }
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating learner profile:', createError);
        return null;
      }

      return newProfile as UniversalLearnerProfile;
    } catch (error) {
      console.error('Error in getOrCreateProfile:', error);
      return null;
    }
  }

  /**
   * Update learner profile with new data
   */
  public static async updateProfile(userId: string, updates: Partial<UniversalLearnerProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('universal_learner_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating learner profile:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      return false;
    }
  }

  /**
   * Start a new unified learning session
   */
  public static async startSession(
    userId: string, 
    sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed',
    skillFocus?: string,
    department?: string
  ): Promise<string | null> {
    try {
      const profile = await this.getOrCreateProfile(userId);
      if (!profile) return null;

      // Calculate initial difficulty based on profile
      const initialDifficulty = this.calculateOptimalDifficulty(profile, skillFocus);

      const { data: session, error } = await supabase
        .from('unified_learning_sessions')
        .insert({
          user_id: userId,
          profile_id: profile.id,
          session_type: sessionType,
          skill_focus: skillFocus,
          department: department,
          difficulty_level: initialDifficulty,
          ai_model_used: this.selectOptimalAIModel(profile),
          explanation_style_used: profile.preferred_explanation_style,
          engagement_score: 0.5,
          learning_momentum: 1.0
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return null;
      }

      return session.id;
    } catch (error) {
      console.error('Error in startSession:', error);
      return null;
    }
  }

  /**
   * Update session with interaction data
   */
  public static async updateSession(
    sessionId: string,
    updates: {
      taskCompleted?: boolean;
      isCorrect?: boolean;
      responseTime?: number;
      hintsUsed?: number;
      tokensUsed?: number;
      newConcepts?: string[];
      misconceptionsFound?: string[];
      frustrationDetected?: boolean;
      difficultyAdjustment?: number;
    }
  ): Promise<boolean> {
    try {
      // Get current session
      const { data: session, error: fetchError } = await supabase
        .from('unified_learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError || !session) {
        console.error('Error fetching session:', fetchError);
        return false;
      }

      // Calculate new values
      const newTasksCompleted = updates.taskCompleted ? session.tasks_completed + 1 : session.tasks_completed;
      const newCorrectAnswers = updates.isCorrect ? session.correct_answers + 1 : session.correct_answers;
      const newTotalResponseTime = session.total_response_time_ms + (updates.responseTime || 0);
      const newHintsUsed = session.hints_used + (updates.hintsUsed || 0);
      const newTokensUsed = session.total_tokens_used + (updates.tokensUsed || 0);
      const newFrustrationIncidents = updates.frustrationDetected ? session.frustration_incidents + 1 : session.frustration_incidents;

      // Update difficulty adjustments array
      const difficultyAdjustments = Array.isArray(session.difficulty_adjustments) ? [...session.difficulty_adjustments] : [];
      if (updates.difficultyAdjustment) {
        difficultyAdjustments.push({
          timestamp: new Date().toISOString(),
          adjustment: updates.difficultyAdjustment,
          reason: updates.isCorrect === false ? 'incorrect_answer' : 'performance_optimization'
        });
      }

      // Update concepts learned
      const conceptsLearned = Array.isArray(session.concepts_learned) ? [...session.concepts_learned] : [];
      if (updates.newConcepts) {
        conceptsLearned.push(...updates.newConcepts);
      }

      // Update misconceptions addressed
      const misconceptionsAddressed = Array.isArray(session.misconceptions_addressed) ? [...session.misconceptions_addressed] : [];
      if (updates.misconceptionsFound) {
        misconceptionsAddressed.push(...updates.misconceptionsFound);
      }

      // Calculate engagement score (0-1)
      const accuracyRate = newTasksCompleted > 0 ? newCorrectAnswers / newTasksCompleted : 0.5;
      const avgResponseTime = newTasksCompleted > 0 ? newTotalResponseTime / newTasksCompleted : 30000;
      const responseTimeScore = Math.max(0, Math.min(1, 1 - (avgResponseTime - 15000) / 45000)); // 15-60s range
      const frustrationScore = Math.max(0, 1 - newFrustrationIncidents * 0.2);
      const engagementScore = (accuracyRate * 0.4 + responseTimeScore * 0.3 + frustrationScore * 0.3);

      // Calculate learning momentum
      const recentAccuracy = newTasksCompleted >= 3 ? (session.correct_answers + (updates.isCorrect ? 1 : 0)) / Math.min(3, newTasksCompleted) : accuracyRate;
      const learningMomentum = Math.max(0.1, Math.min(2.0, recentAccuracy * 1.5 + (1 - newFrustrationIncidents * 0.1)));

      // Update session
      const { error: updateError } = await supabase
        .from('unified_learning_sessions')
        .update({
          tasks_completed: newTasksCompleted,
          correct_answers: newCorrectAnswers,
          total_response_time_ms: newTotalResponseTime,
          hints_used: newHintsUsed,
          total_tokens_used: newTokensUsed,
          frustration_incidents: newFrustrationIncidents,
          difficulty_adjustments: difficultyAdjustments,
          concepts_learned: conceptsLearned,
          misconceptions_addressed: misconceptionsAddressed,
          engagement_score: engagementScore,
          learning_momentum: learningMomentum,
          difficulty_level: updates.difficultyAdjustment ? session.difficulty_level + updates.difficultyAdjustment : session.difficulty_level,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session:', updateError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in updateSession:', error);
      return false;
    }
  }

  /**
   * Complete a learning session and update profile
   */
  public static async completeSession(sessionId: string): Promise<boolean> {
    try {
      // Get session data
      const { data: session, error: fetchError } = await supabase
        .from('unified_learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (fetchError || !session) {
        console.error('Error fetching session:', fetchError);
        return false;
      }

      // Complete the session
      const { error: completeError } = await supabase
        .from('unified_learning_sessions')
        .update({
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (completeError) {
        console.error('Error completing session:', completeError);
        return false;
      }

      // Update learner profile based on session
      const typedSession = {
        ...session,
        session_type: session.session_type as 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed',
        difficulty_adjustments: Array.isArray(session.difficulty_adjustments) ? session.difficulty_adjustments : [],
        learning_path: Array.isArray(session.learning_path) ? session.learning_path : [],
        concepts_learned: Array.isArray(session.concepts_learned) ? session.concepts_learned : [],
        misconceptions_addressed: Array.isArray(session.misconceptions_addressed) ? session.misconceptions_addressed : []
      } as UnifiedLearningSession;
      await this.updateProfileFromSession(typedSession);

      return true;
    } catch (error) {
      console.error('Error in completeSession:', error);
      return false;
    }
  }

  /**
   * Calculate optimal difficulty for user and skill
   */
  private static calculateOptimalDifficulty(profile: UniversalLearnerProfile, skillId?: string): number {
    let baseDifficulty = 5; // Default middle difficulty

    // Check skill mastery if skill is specified
    if (skillId && profile.skill_mastery_map[skillId]) {
      const skillMastery = profile.skill_mastery_map[skillId];
      baseDifficulty = Math.max(1, Math.min(10, skillMastery.level || 5));
    }

    // Apply difficulty multiplier
    baseDifficulty *= profile.difficulty_multiplier;

    // Apply learning velocity
    baseDifficulty *= profile.learning_velocity;

    // Ensure within optimal range
    baseDifficulty = Math.max(profile.optimal_difficulty_range.min, Math.min(profile.optimal_difficulty_range.max, baseDifficulty));

    return Math.round(baseDifficulty);
  }

  /**
   * Select optimal AI model based on profile
   */
  private static selectOptimalAIModel(profile: UniversalLearnerProfile): string {
    // Use faster models for users who prefer quick responses
    if (profile.response_patterns?.avg_response_time < 20000) {
      return 'gpt-4o-mini';
    }

    // Use more powerful models for users who need detailed explanations
    if (profile.preferred_explanation_style === 'detailed' || profile.learning_velocity < 0.8) {
      return 'gpt-4o';
    }

    return 'gpt-4o-mini'; // Default
  }

  /**
   * Update learner profile based on completed session
   */
  private static async updateProfileFromSession(session: UnifiedLearningSession): Promise<void> {
    try {
      const { data: profile, error: fetchError } = await supabase
        .from('universal_learner_profiles')
        .select('*')
        .eq('id', session.profile_id)
        .single();

      if (fetchError || !profile) return;

      // Calculate session duration
      const sessionDuration = session.completed_at && session.started_at ? 
        Math.round((new Date(session.completed_at).getTime() - new Date(session.started_at).getTime()) / 60000) : 0;

      // Update response patterns
      const currentResponsePatterns = profile.response_patterns as Record<string, any> || {};
      const updatedResponsePatterns = {
        ...currentResponsePatterns,
        avg_response_time: session.tasks_completed > 0 ? session.total_response_time_ms / session.tasks_completed : currentResponsePatterns.avg_response_time || 30000,
        recent_accuracy: session.tasks_completed > 0 ? session.correct_answers / session.tasks_completed : 0.5
      };

      // Update skill mastery if skill was focused
      const currentSkillMasteryMap = profile.skill_mastery_map as Record<string, any> || {};
      const updatedSkillMasteryMap = { ...currentSkillMasteryMap };
      if (session.skill_focus) {
        const currentMastery = updatedSkillMasteryMap[session.skill_focus] || { level: 5, attempts: 0, correct: 0 };
        updatedSkillMasteryMap[session.skill_focus] = {
          level: Math.max(1, Math.min(10, currentMastery.level + (session.engagement_score - 0.5) * 2)),
          attempts: currentMastery.attempts + session.tasks_completed,
          correct: currentMastery.correct + session.correct_answers,
          last_session_performance: session.engagement_score
        };
      }

      // Update error patterns
      const currentErrorPatterns = profile.error_patterns as Record<string, any> || {};
      const updatedErrorPatterns = { ...currentErrorPatterns };
      session.misconceptions_addressed.forEach((misconception: string) => {
        updatedErrorPatterns[misconception] = (updatedErrorPatterns[misconception] || 0) + 1;
      });

      // Calculate new learning velocity based on performance
      const performanceRatio = session.engagement_score;
      const newLearningVelocity = Math.max(0.5, Math.min(2.0, profile.learning_velocity * (0.9 + performanceRatio * 0.2)));

      // Update profile
      await this.updateProfile(session.user_id, {
        response_patterns: updatedResponsePatterns,
        skill_mastery_map: updatedSkillMasteryMap,
        error_patterns: updatedErrorPatterns,
        learning_velocity: newLearningVelocity,
        difficulty_multiplier: Math.max(0.5, Math.min(2.0, session.learning_momentum)),
        total_learning_time_minutes: profile.total_learning_time_minutes + sessionDuration,
        sessions_completed: profile.sessions_completed + 1,
        concepts_mastered: profile.concepts_mastered + session.concepts_learned.length,
        last_interaction_summary: {
          session_type: session.session_type,
          performance: session.engagement_score,
          concepts_learned: session.concepts_learned.length,
          duration_minutes: sessionDuration
        },
        current_learning_context: {
          last_skill: session.skill_focus,
          last_department: session.department,
          current_difficulty: session.difficulty_level,
          momentum: session.learning_momentum
        }
      });

    } catch (error) {
      console.error('Error updating profile from session:', error);
    }
  }

  /**
   * Get learning recommendations for user
   */
  public static async getRecommendations(userId: string): Promise<any> {
    try {
      const profile = await this.getOrCreateProfile(userId);
      if (!profile) return null;

      // Analyze weak areas
      const weakSkills = Object.entries(profile.skill_mastery_map)
        .filter(([_, mastery]: [string, any]) => mastery.level < 6)
        .sort(([_, a]: [string, any], [__, b]: [string, any]) => a.level - b.level)
        .slice(0, 3);

      // Analyze error patterns
      const commonMisconceptions = Object.entries(profile.error_patterns)
        .sort(([_, a]: [string, any], [__, b]: [string, any]) => b - a)
        .slice(0, 3);

      return {
        recommended_skills: weakSkills.map(([skillId, _]) => skillId),
        focus_areas: commonMisconceptions.map(([misconception, _]) => misconception),
        optimal_difficulty: this.calculateOptimalDifficulty(profile),
        preferred_session_type: profile.response_patterns?.avg_response_time < 25000 ? 'ai_chat' : 'study_learn',
        estimated_session_duration: Math.round(30 * profile.learning_velocity),
        next_milestone: this.calculateNextMilestone(profile)
      };
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return null;
    }
  }

  /**
   * Calculate next learning milestone
   */
  private static calculateNextMilestone(profile: UniversalLearnerProfile): any {
    const totalMastery = Object.values(profile.skill_mastery_map).length;
    const masteredSkills = Object.values(profile.skill_mastery_map).filter((mastery: any) => mastery.level >= 8).length;
    
    if (masteredSkills < 5) {
      return { type: 'skill_mastery', target: 5, current: masteredSkills, description: 'Master 5 skills' };
    } else if (profile.sessions_completed < 20) {
      return { type: 'session_count', target: 20, current: profile.sessions_completed, description: 'Complete 20 learning sessions' };
    } else {
      return { type: 'advanced_concepts', description: 'Ready for advanced topics' };
    }
  }
}