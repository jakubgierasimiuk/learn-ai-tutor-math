import { UnifiedLearningController } from './UnifiedLearningController';
import { UniversalDifficultyController } from './UniversalDifficultyController';
import { MathTaskGenerator } from './generators/MathTaskGenerator';
import { ContentTaskManager } from './ContentTaskManager';
import { TaskDefinition, TaskGenerationParams } from './UniversalInterfaces';
import { supabase } from "@/integrations/supabase/client";

export interface LearningContext {
  userId: string;
  currentSkill?: string;
  department: string;
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed';
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  confidence?: number;
  hintsUsed?: number;
}

export interface AdaptationDecision {
  newDifficulty: number;
  recommendedAction: 'continue' | 'review' | 'advance' | 'switch_mode' | 'take_break';
  contentSource: 'ai_generation' | 'database_content' | 'task_generator';
  explanationStyle: 'concise' | 'detailed' | 'visual' | 'step-by-step';
  nextTask?: TaskDefinition;
  feedbackMessage?: string;
  adaptationReason: string;
}

/**
 * Smart Learning Orchestrator - Central decision-making system for personalized learning
 */
export class SmartLearningOrchestrator {
  private taskGenerator = new MathTaskGenerator();
  private contentManager = new ContentTaskManager();

  /**
   * Main orchestration method - decides what happens next in the learning journey
   */
  public async orchestrateLearning(context: LearningContext): Promise<AdaptationDecision> {
    try {
      // Get learner profile
      const profile = await UnifiedLearningController.getOrCreateProfile(context.userId);
      if (!profile) {
        return this.getDefaultDecision(context);
      }

      // Analyze current performance if response provided
      let performanceAnalysis = null;
      if (context.userResponse !== undefined && context.isCorrect !== undefined) {
        performanceAnalysis = this.analyzePerformance(context, profile);
      }

      // Calculate new difficulty
      const newDifficulty = this.calculateAdaptiveDifficulty(context, profile, performanceAnalysis);

      // Determine optimal content source
      const contentSource = this.selectContentSource(context, profile, newDifficulty);

      // Choose explanation style
      const explanationStyle = this.selectExplanationStyle(context, profile, performanceAnalysis);

      // Decide on next action
      const recommendedAction = this.decideNextAction(context, profile, performanceAnalysis, newDifficulty);

      // Generate next task if needed
      let nextTask: TaskDefinition | undefined;
      if (recommendedAction === 'continue' || recommendedAction === 'advance') {
        nextTask = await this.generateNextTask(context, newDifficulty, contentSource);
      }

      // Generate feedback message
      const feedbackMessage = this.generateFeedbackMessage(context, profile, performanceAnalysis, recommendedAction);

      // Get adaptation reason
      const adaptationReason = this.getAdaptationReason(performanceAnalysis, recommendedAction, newDifficulty);

      return {
        newDifficulty,
        recommendedAction,
        contentSource,
        explanationStyle,
        nextTask,
        feedbackMessage,
        adaptationReason
      };

    } catch (error) {
      console.error('Error in orchestrateLearning:', error);
      return this.getDefaultDecision(context);
    }
  }

  /**
   * Analyze user's performance on current task
   */
  private analyzePerformance(context: LearningContext, profile: any): any {
    const isCorrect = context.isCorrect || false;
    const responseTime = context.responseTime || 30000;
    const confidence = context.confidence || 0.5;
    const hintsUsed = context.hintsUsed || 0;

    // Analyze response speed
    const avgResponseTime = profile.response_patterns?.avg_response_time || 30000;
    const speedRatio = responseTime / avgResponseTime;
    const isSlowResponse = speedRatio > 1.5;
    const isFastResponse = speedRatio < 0.7;

    // Analyze confidence vs correctness
    const confidenceMismatch = isCorrect && confidence < 0.5 ? 'underconfident' :
                              !isCorrect && confidence > 0.7 ? 'overconfident' : 'aligned';

    // Detect patterns
    const needsSupport = !isCorrect && hintsUsed === 0 && confidence < 0.4;
    const showingMastery = isCorrect && isFastResponse && confidence > 0.8 && hintsUsed === 0;
    const strugglingWithSpeed = isCorrect && isSlowResponse && hintsUsed > 1;

    return {
      isCorrect,
      responseTime,
      confidence,
      hintsUsed,
      speedRatio,
      confidenceMismatch,
      needsSupport,
      showingMastery,
      strugglingWithSpeed,
      overallPerformance: this.calculateOverallPerformance(isCorrect, speedRatio, confidence, hintsUsed)
    };
  }

  /**
   * Calculate overall performance score (0-1)
   */
  private calculateOverallPerformance(isCorrect: boolean, speedRatio: number, confidence: number, hintsUsed: number): number {
    let score = 0;
    
    // Correctness is most important (50% weight)
    score += isCorrect ? 0.5 : 0;
    
    // Speed factor (25% weight)
    const speedScore = Math.max(0, Math.min(1, 2 - speedRatio));
    score += speedScore * 0.25;
    
    // Confidence (15% weight)
    score += confidence * 0.15;
    
    // Minimal hint usage (10% weight)
    const hintPenalty = Math.min(0.1, hintsUsed * 0.02);
    score += (0.1 - hintPenalty);
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Calculate adaptive difficulty based on performance and profile
   */
  private calculateAdaptiveDifficulty(context: LearningContext, profile: any, performanceAnalysis: any): number {
    const currentDifficulty = profile.current_learning_context?.current_difficulty || 5;
    
    if (!performanceAnalysis) {
      return currentDifficulty;
    }

    // Use existing difficulty controller as base
    const baseDifficultyAdjustment = UniversalDifficultyController.getNextDifficulty(
      currentDifficulty,
      performanceAnalysis.isCorrect,
      performanceAnalysis.responseTime,
      performanceAnalysis.confidence
    );

    // Apply profile-specific modifications
    let adjustedDifficulty = baseDifficultyAdjustment;

    // Consider learning velocity
    adjustedDifficulty *= profile.learning_velocity || 1.0;

    // Consider frustration threshold
    if (profile.current_learning_context?.recent_errors >= profile.frustration_threshold) {
      adjustedDifficulty = Math.max(1, adjustedDifficulty - 1);
    }

    // Apply difficulty multiplier from profile
    adjustedDifficulty *= profile.difficulty_multiplier || 1.0;

    // Ensure within optimal range
    const minDiff = profile.optimal_difficulty_range?.min || 1;
    const maxDiff = profile.optimal_difficulty_range?.max || 10;
    
    return Math.max(minDiff, Math.min(maxDiff, Math.round(adjustedDifficulty)));
  }

  /**
   * Select optimal content source based on context and profile
   */
  private selectContentSource(context: LearningContext, profile: any, difficulty: number): 'ai_generation' | 'database_content' | 'task_generator' {
    // For diagnostic sessions, prefer database content
    if (context.sessionType === 'diagnostic') {
      return 'database_content';
    }

    // For AI chat, prefer AI generation for flexibility
    if (context.sessionType === 'ai_chat') {
      return 'ai_generation';
    }

    // For Study & Learn, check if we have structured content
    if (context.sessionType === 'study_learn' && context.currentSkill) {
      return 'database_content';
    }

    // For specific skills with known patterns, use task generator
    if (context.currentSkill && profile.skill_mastery_map?.[context.currentSkill]) {
      return 'task_generator';
    }

    // Default to AI generation for flexibility
    return 'ai_generation';
  }

  /**
   * Select explanation style based on context and profile
   */
  private selectExplanationStyle(context: LearningContext, profile: any, performanceAnalysis: any): 'concise' | 'detailed' | 'visual' | 'step-by-step' {
    // Use profile preference as base
    let style = profile.preferred_explanation_style || 'balanced';

    // Adapt based on performance
    if (performanceAnalysis) {
      if (performanceAnalysis.needsSupport) {
        style = 'step-by-step';
      } else if (performanceAnalysis.showingMastery) {
        style = 'concise';
      } else if (performanceAnalysis.strugglingWithSpeed) {
        style = 'visual';
      }
    }

    // Adapt based on learning style
    if (profile.learning_style?.visual > 0.6) {
      style = 'visual';
    } else if (profile.learning_style?.kinesthetic > 0.6) {
      style = 'step-by-step';
    }

    // Map 'balanced' to appropriate style
    if (style === 'balanced') {
      style = 'detailed';
    }

    return style as 'concise' | 'detailed' | 'visual' | 'step-by-step';
  }

  /**
   * Decide what action to take next
   */
  private decideNextAction(context: LearningContext, profile: any, performanceAnalysis: any, newDifficulty: number): 'continue' | 'review' | 'advance' | 'switch_mode' | 'take_break' {
    // No performance analysis means this is the start of a session
    if (!performanceAnalysis) {
      return 'continue';
    }

    // Check for break conditions
    const sessionTime = profile.current_learning_context?.session_duration || 0;
    if (sessionTime > 45) { // More than 45 minutes
      return 'take_break';
    }

    // Check frustration level
    const recentErrors = profile.current_learning_context?.recent_errors || 0;
    if (recentErrors >= profile.frustration_threshold) {
      return context.sessionType === 'ai_chat' ? 'switch_mode' : 'review';
    }

    // Check for mastery
    if (performanceAnalysis.showingMastery && newDifficulty >= 8) {
      return 'advance';
    }

    // Check if struggling
    if (performanceAnalysis.needsSupport || performanceAnalysis.overallPerformance < 0.4) {
      return 'review';
    }

    // Default to continue
    return 'continue';
  }

  /**
   * Generate next task based on context and difficulty
   */
  private async generateNextTask(context: LearningContext, difficulty: number, contentSource: string): Promise<TaskDefinition | undefined> {
    try {
      switch (contentSource) {
        case 'database_content':
          if (context.currentSkill) {
            const tasks = await this.contentManager.getInitialTasks(context.currentSkill);
            return tasks.find(task => Math.abs(task.difficulty - difficulty) <= 1) || tasks[0];
          }
          break;

        case 'task_generator':
          const taskParams: TaskGenerationParams = {
            department: context.department,
            difficulty: difficulty,
            microSkill: 'default'
          };
          return this.taskGenerator.generateTask(taskParams);

        case 'ai_generation':
        default:
          // Return a placeholder for AI generation
          return {
            id: `ai_${Date.now()}`,
            department: context.department,
            skillName: context.currentSkill || 'general',
            microSkill: 'default',
            difficulty: difficulty,
            latex: '',
            expectedAnswer: '',
            misconceptionMap: {}
          };
      }
    } catch (error) {
      console.error('Error generating next task:', error);
      return undefined;
    }
  }

  /**
   * Generate appropriate feedback message
   */
  private generateFeedbackMessage(context: LearningContext, profile: any, performanceAnalysis: any, action: string): string {
    if (!performanceAnalysis) {
      return "Let's start your personalized learning session!";
    }

    const { isCorrect, showingMastery, needsSupport, strugglingWithSpeed, confidenceMismatch } = performanceAnalysis;

    if (showingMastery) {
      return "Excellent work! You're demonstrating strong mastery. Let's try something more challenging.";
    }

    if (needsSupport) {
      return "That's a tricky one! Let me provide some additional guidance to help you through this concept.";
    }

    if (strugglingWithSpeed) {
      return "Good job getting the right answer! Let's work on building your confidence and speed with similar problems.";
    }

    if (confidenceMismatch === 'underconfident' && isCorrect) {
      return "Great work! You knew more than you thought. Trust your instincts!";
    }

    if (confidenceMismatch === 'overconfident' && !isCorrect) {
      return "Close! Let's take another look at this concept to strengthen your understanding.";
    }

    if (action === 'take_break') {
      return "You've been working hard! Consider taking a short break to let this information settle.";
    }

    if (action === 'switch_mode') {
      return "Let's try a different approach that might work better for you.";
    }

    if (isCorrect) {
      return "Well done! Let's keep building on this success.";
    } else {
      return "Not quite, but that's part of learning! Let's work through this together.";
    }
  }

  /**
   * Get explanation for why adaptations were made
   */
  private getAdaptationReason(performanceAnalysis: any, action: string, newDifficulty: number): string {
    if (!performanceAnalysis) {
      return "Starting new session with personalized settings";
    }

    const reasons = [];

    if (performanceAnalysis.showingMastery) {
      reasons.push("showing mastery - increasing challenge");
    }

    if (performanceAnalysis.needsSupport) {
      reasons.push("needs support - providing scaffolding");
    }

    if (performanceAnalysis.speedRatio > 1.5) {
      reasons.push("slower response - adjusting pace");
    }

    if (performanceAnalysis.speedRatio < 0.7) {
      reasons.push("quick response - maintaining engagement");
    }

    if (action === 'review') {
      reasons.push("reviewing for stronger foundation");
    }

    if (action === 'advance') {
      reasons.push("ready for advancement");
    }

    return reasons.length > 0 ? reasons.join(', ') : "continuing personalized learning path";
  }

  /**
   * Get default decision when orchestration fails
   */
  private getDefaultDecision(context: LearningContext): AdaptationDecision {
    return {
      newDifficulty: 5,
      recommendedAction: 'continue',
      contentSource: 'ai_generation',
      explanationStyle: 'detailed',
      adaptationReason: 'using default settings',
      feedbackMessage: "Let's continue with your learning!"
    };
  }

  /**
   * Get learning statistics for user
   */
  public async getLearningStatistics(userId: string): Promise<any> {
    try {
      const profile = await UnifiedLearningController.getOrCreateProfile(userId);
      if (!profile) return null;

      // Get recent sessions
      const { data: recentSessions } = await supabase
        .from('unified_learning_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const sessions = recentSessions || [];

      // Calculate statistics
      const totalSessions = sessions.length;
      const averageEngagement = sessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / Math.max(1, totalSessions);
      const averageAccuracy = sessions.reduce((sum, s) => sum + (s.tasks_completed > 0 ? s.correct_answers / s.tasks_completed : 0), 0) / Math.max(1, totalSessions);
      const totalConceptsLearned = sessions.reduce((sum, s) => sum + (Array.isArray(s.concepts_learned) ? s.concepts_learned.length : 0), 0);

      return {
        profile_summary: {
          learning_velocity: profile.learning_velocity,
          difficulty_multiplier: profile.difficulty_multiplier,
          preferred_style: profile.preferred_explanation_style,
          total_learning_time: profile.total_learning_time_minutes,
          concepts_mastered: profile.concepts_mastered
        },
        recent_performance: {
          average_engagement: averageEngagement,
          average_accuracy: averageAccuracy,
          total_concepts_learned: totalConceptsLearned,
          session_count: totalSessions
        },
        skill_breakdown: profile.skill_mastery_map,
        learning_trends: this.analyzeLearningTrends(sessions),
        recommendations: await UnifiedLearningController.getRecommendations(userId)
      };
    } catch (error) {
      console.error('Error getting learning statistics:', error);
      return null;
    }
  }

  /**
   * Analyze learning trends from session data
   */
  private analyzeLearningTrends(sessions: any[]): any {
    if (sessions.length < 2) return { trend: 'insufficient_data' };

    const recentSessions = sessions.slice(0, 5);
    const olderSessions = sessions.slice(5, 10);

    const recentAvgEngagement = recentSessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / Math.max(1, recentSessions.length);
    const olderAvgEngagement = olderSessions.reduce((sum, s) => sum + (s.engagement_score || 0), 0) / Math.max(1, olderSessions.length);

    const engagementTrend = recentAvgEngagement > olderAvgEngagement ? 'improving' : 'declining';

    const recentAvgAccuracy = recentSessions.reduce((sum, s) => sum + (s.tasks_completed > 0 ? s.correct_answers / s.tasks_completed : 0), 0) / Math.max(1, recentSessions.length);
    const olderAvgAccuracy = olderSessions.reduce((sum, s) => sum + (s.tasks_completed > 0 ? s.correct_answers / s.tasks_completed : 0), 0) / Math.max(1, olderSessions.length);

    const accuracyTrend = recentAvgAccuracy > olderAvgAccuracy ? 'improving' : 'declining';

    return {
      engagement_trend: engagementTrend,
      accuracy_trend: accuracyTrend,
      consistency: this.calculateConsistency(sessions),
      momentum: recentAvgEngagement * recentAvgAccuracy
    };
  }

  /**
   * Calculate consistency score based on session variance
   */
  private calculateConsistency(sessions: any[]): number {
    if (sessions.length < 3) return 0.5;

    const engagementScores = sessions.map(s => s.engagement_score || 0);
    const mean = engagementScores.reduce((sum, score) => sum + score, 0) / engagementScores.length;
    const variance = engagementScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / engagementScores.length;
    
    // Lower variance = higher consistency
    return Math.max(0, Math.min(1, 1 - variance));
  }
}