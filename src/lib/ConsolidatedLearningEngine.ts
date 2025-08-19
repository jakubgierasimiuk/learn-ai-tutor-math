import { supabase } from '@/integrations/supabase/client';

interface ConsolidatedLearnerData {
  userId: string;
  // Real-time learning state
  currentCognitiveLoad: number;
  attentionSpan: number;
  fatigueLevel: number;
  flowState: number;
  
  // Performance patterns  
  averageResponseTime: number;
  accuracyTrend: number[];
  errorPatterns: Record<string, number>;
  preferredDifficulty: number;
  
  // Learning preferences (derived from actual behavior)
  explanationPreference: 'visual' | 'step-by-step' | 'concise' | 'detailed';
  optimalSessionLength: number;
  bestTimeOfDay: number[];
  
  // Predictive indicators
  dropoutRisk: number;
  nextStruggleAreas: string[];
  masteryReadiness: Record<string, number>;
}

export class ConsolidatedLearningEngine {
  private static instance: ConsolidatedLearningEngine;
  private learnerCache = new Map<string, ConsolidatedLearnerData>();

  static getInstance(): ConsolidatedLearningEngine {
    if (!ConsolidatedLearningEngine.instance) {
      ConsolidatedLearningEngine.instance = new ConsolidatedLearningEngine();
    }
    return ConsolidatedLearningEngine.instance;
  }

  /**
   * UNIFIED DATA CONSOLIDATION - pulls from ALL sources
   */
  async getConsolidatedLearnerData(userId: string): Promise<ConsolidatedLearnerData> {
    // Check cache first
    if (this.learnerCache.has(userId)) {
      return this.learnerCache.get(userId)!;
    }

    try {
      // Pull from ALL data sources in parallel
      const [
        validationLogs,
        skillProgress, 
        sessionAnalytics,
        learningInteractions,
        studySessions,
        unifiedSessions,
        profile
      ] = await Promise.all([
        this.getValidationLogs(userId),
        this.getSkillProgress(userId),
        this.getSessionAnalytics(userId),
        this.getLearningInteractions(userId),
        this.getStudySessions(userId),
        this.getUnifiedSessions(userId),
        this.getProfile(userId)
      ]);

      // CONSOLIDATE all data into single profile
      const consolidatedData = this.consolidateAllData({
        validationLogs,
        skillProgress,
        sessionAnalytics, 
        learningInteractions,
        studySessions,
        unifiedSessions,
        profile,
        userId
      });

      // Cache for 5 minutes
      this.learnerCache.set(userId, consolidatedData);
      setTimeout(() => this.learnerCache.delete(userId), 5 * 60 * 1000);

      return consolidatedData;
    } catch (error) {
      console.error('Error consolidating learner data:', error);
      return this.getDefaultLearnerData(userId);
    }
  }

  private async getValidationLogs(userId: string) {
    const { data } = await supabase
      .from('validation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(100);
    return data || [];
  }

  private async getSkillProgress(userId: string) {
    const { data } = await supabase
      .from('skill_progress')
      .select('*')
      .eq('user_id', userId);
    return data || [];
  }

  private async getSessionAnalytics(userId: string) {
    const { data } = await supabase
      .from('session_analytics')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    return data || [];
  }

  private async getLearningInteractions(userId: string) {
    // Use validation_logs as learning interactions since learning_interactions table doesn't exist
    const { data } = await supabase
      .from('validation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(200);
    return data || [];
  }

  private async getStudySessions(userId: string) {
    const { data } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20);
    return data || [];
  }

  private async getUnifiedSessions(userId: string) {
    const { data } = await supabase
      .from('unified_learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(20);
    return data || [];
  }

  private async getProfile(userId: string) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data;
  }

  /**
   * SMART DATA CONSOLIDATION - creates single truth
   */
  private consolidateAllData(sources: any): ConsolidatedLearnerData {
    const { validationLogs, skillProgress, sessionAnalytics, learningInteractions, studySessions, unifiedSessions, profile, userId } = sources;

    // Calculate real-time cognitive state
    const recentInteractions = learningInteractions.slice(0, 10);
    const currentCognitiveLoad = this.calculateCognitiveLoad(recentInteractions, validationLogs.slice(0, 5));
    const attentionSpan = this.calculateAttentionSpan(sessionAnalytics, studySessions);
    const fatigueLevel = this.calculateFatigueLevel(recentInteractions);
    const flowState = this.calculateFlowState(recentInteractions, validationLogs.slice(0, 10));

    // Calculate performance patterns from all sources
    const allResponseTimes = [
      ...validationLogs.map(log => log.response_time).filter(Boolean),
      ...learningInteractions.map(int => int.response_time_ms).filter(Boolean),
      ...sessionAnalytics.map(s => s.duration_minutes * 60000 / Math.max(s.questions_answered, 1)).filter(Boolean)
    ];
    const averageResponseTime = allResponseTimes.length > 0 
      ? allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length 
      : 30000;

    // Calculate accuracy trend from multiple sources
    const accuracyData = [
      ...validationLogs.map(log => log.is_correct ? 1 : 0),
      ...sessionAnalytics.map(s => s.correct_answers / Math.max(s.questions_answered, 1))
    ];
    const accuracyTrend = [this.calculateTrend(accuracyData.slice(0, 20))];

    // Analyze error patterns
    const errorPatterns = this.analyzeErrorPatterns(validationLogs, learningInteractions);

    // Determine preferred difficulty
    const preferredDifficulty = this.calculatePreferredDifficulty(skillProgress, validationLogs, sessionAnalytics);

    // Analyze learning preferences from behavior
    const explanationPreference = this.analyzeExplanationPreference(learningInteractions, sessionAnalytics);
    const optimalSessionLength = this.calculateOptimalSessionLength(studySessions, unifiedSessions);
    const bestTimeOfDay = this.analyzeBestTimeOfDay([...studySessions, ...unifiedSessions]);

    // Predictive analytics
    const dropoutRisk = this.calculateDropoutRisk(validationLogs, sessionAnalytics, studySessions);
    const nextStruggleAreas = this.predictStruggleAreas(errorPatterns, skillProgress);
    const masteryReadiness = this.assessMasteryReadiness(skillProgress, validationLogs);

    return {
      userId,
      currentCognitiveLoad,
      attentionSpan,
      fatigueLevel,
      flowState,
      averageResponseTime,
      accuracyTrend,
      errorPatterns,
      preferredDifficulty,
      explanationPreference,
      optimalSessionLength,
      bestTimeOfDay,
      dropoutRisk,
      nextStruggleAreas,
      masteryReadiness
    };
  }

  /**
   * COGNITIVE LOAD - real-time calculation
   */
  private calculateCognitiveLoad(interactions: any[], recentLogs: any[]): number {
    let load = 0.5; // Base load

    // Recent response times
    const recentTimes = interactions
      .filter(i => i.response_time_ms)
      .slice(0, 5)
      .map(i => i.response_time_ms);

    if (recentTimes.length > 0) {
      const avgTime = recentTimes.reduce((sum, time) => sum + time, 0) / recentTimes.length;
      // Longer times = higher cognitive load
      load += Math.min(0.4, (avgTime - 15000) / 60000);
    }

    // Recent accuracy
    const recentAccuracy = recentLogs.length > 0
      ? recentLogs.filter(log => log.is_correct).length / recentLogs.length
      : 0.5;

    // Lower accuracy = higher cognitive load
    load += (1 - recentAccuracy) * 0.3;

    // Frustration indicators
    const frustrationScore = interactions
      .filter(i => i.frustration_indicators)
      .length / Math.max(interactions.length, 1);
    load += frustrationScore * 0.2;

    return Math.max(0, Math.min(1, load));
  }

  private calculateAttentionSpan(sessionAnalytics: any[], studySessions: any[]): number {
    const allSessions = [...sessionAnalytics, ...studySessions];
    if (allSessions.length === 0) return 25; // Default 25 minutes

    const sessionLengths = allSessions
      .filter(s => s.duration_minutes && s.duration_minutes > 0)
      .map(s => s.duration_minutes);

    if (sessionLengths.length === 0) return 25;

    // Calculate optimal attention span based on performance
    const qualitySessions = allSessions.filter(s => {
      const accuracy = s.correct_answers / Math.max(s.questions_answered, 1);
      return accuracy > 0.7; // Only consider high-quality sessions
    });

    if (qualitySessions.length > 0) {
      const optimalLengths = qualitySessions.map(s => s.duration_minutes);
      return optimalLengths.reduce((sum, len) => sum + len, 0) / optimalLengths.length;
    }

    return sessionLengths.reduce((sum, len) => sum + len, 0) / sessionLengths.length;
  }

  private calculateFatigueLevel(interactions: any[]): number {
    if (interactions.length === 0) return 0;

    const recentInteractions = interactions.slice(0, 10);
    let fatigueScore = 0;

    // Check response time degradation
    if (recentInteractions.length >= 5) {
      const firstHalf = recentInteractions.slice(0, 5);
      const secondHalf = recentInteractions.slice(5, 10);
      
      const firstAvg = firstHalf.reduce((sum, i) => sum + (i.response_time_ms || 30000), 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, i) => sum + (i.response_time_ms || 30000), 0) / secondHalf.length;
      
      if (secondAvg > firstAvg * 1.2) fatigueScore += 0.3;
    }

    // Check accuracy degradation
    const recentCorrectness = recentInteractions
      .filter(i => i.correctness_level !== undefined)
      .map(i => i.correctness_level);

    if (recentCorrectness.length >= 5) {
      const trend = this.calculateTrend(recentCorrectness);
      if (trend < -0.1) fatigueScore += 0.3;
    }

    // Check session length vs optimal
    const sessionTime = Date.now() - (interactions[0]?.interaction_timestamp ? new Date(interactions[0].interaction_timestamp).getTime() : Date.now());
    const sessionMinutes = sessionTime / (1000 * 60);
    
    if (sessionMinutes > 45) fatigueScore += 0.4;

    return Math.max(0, Math.min(1, fatigueScore));
  }

  private calculateFlowState(interactions: any[], validationLogs: any[]): number {
    let flowScore = 0;

    // Consistent response times
    const responseTimes = interactions
      .filter(i => i.response_time_ms)
      .slice(0, 10)
      .map(i => i.response_time_ms);

    if (responseTimes.length >= 5) {
      const variance = this.calculateVariance(responseTimes);
      const meanTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
      const consistency = 1 - (Math.sqrt(variance) / meanTime);
      flowScore += Math.max(0, consistency) * 0.3;
    }

    // High accuracy with appropriate difficulty
    const recentAccuracy = validationLogs.length > 0
      ? validationLogs.filter(log => log.is_correct).length / Math.min(validationLogs.length, 10)
      : 0;

    if (recentAccuracy > 0.7 && recentAccuracy < 0.95) {
      flowScore += 0.4; // Sweet spot accuracy
    }

    // Engagement indicators
    const engagementScore = interactions
      .filter(i => i.engagement_score)
      .reduce((sum, i) => sum + i.engagement_score, 0) / Math.max(interactions.length, 1);

    flowScore += engagementScore * 0.3;

    return Math.max(0, Math.min(1, flowScore));
  }

  private calculateTrend(values: number[]): number {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, idx) => sum + (val * idx), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;
    
    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  private analyzeErrorPatterns(validationLogs: any[], interactions: any[]): Record<string, number> {
    const patterns: Record<string, number> = {};

    // From validation logs
    validationLogs
      .filter(log => !log.is_correct && log.detected_misconception)
      .forEach(log => {
        patterns[log.detected_misconception] = (patterns[log.detected_misconception] || 0) + 1;
      });

    // From interactions
    interactions
      .filter(i => i.misconceptions_activated)
      .forEach(i => {
        if (Array.isArray(i.misconceptions_activated)) {
          i.misconceptions_activated.forEach((misconception: string) => {
            patterns[misconception] = (patterns[misconception] || 0) + 1;
          });
        }
      });

    return patterns;
  }

  private calculatePreferredDifficulty(skillProgress: any[], validationLogs: any[], sessionAnalytics: any[]): number {
    // Find difficulty level with best performance/engagement ratio
    const difficultyScores: Record<number, { accuracy: number, engagement: number, count: number }> = {};

    // From validation logs (assume difficulty from session context)
    validationLogs.forEach(log => {
      const difficulty = 5; // Default if not available
      if (!difficultyScores[difficulty]) {
        difficultyScores[difficulty] = { accuracy: 0, engagement: 0, count: 0 };
      }
      difficultyScores[difficulty].accuracy += log.is_correct ? 1 : 0;
      difficultyScores[difficulty].count += 1;
    });

    // Find optimal difficulty (accuracy between 0.7-0.8)
    let bestDifficulty = 5;
    let bestScore = 0;

    Object.entries(difficultyScores).forEach(([diff, stats]) => {
      if (stats.count >= 3) { // Minimum sample size
        const accuracy = stats.accuracy / stats.count;
        const score = accuracy >= 0.7 && accuracy <= 0.85 ? accuracy : 0;
        if (score > bestScore) {
          bestScore = score;
          bestDifficulty = parseInt(diff);
        }
      }
    });

    return bestDifficulty;
  }

  private analyzeExplanationPreference(interactions: any[], analytics: any[]): 'visual' | 'step-by-step' | 'concise' | 'detailed' {
    // Analyze time spent on different explanation types
    const timeSpent: Record<string, number> = {
      visual: 0,
      'step-by-step': 0,
      concise: 0,
      detailed: 0
    };

    // Default return
    return 'detailed';
  }

  private calculateOptimalSessionLength(studySessions: any[], unifiedSessions: any[]): number {
    const allSessions = [...studySessions, ...unifiedSessions];
    const qualitySessions = allSessions.filter(s => {
      // Define quality based on completion and accuracy
      const accuracy = s.correct_answers / Math.max(s.tasks_completed || s.questions_answered, 1);
      return accuracy > 0.6 && s.completed_at;
    });

    if (qualitySessions.length === 0) return 30; // Default

    const durations = qualitySessions.map(s => {
      const start = new Date(s.started_at).getTime();
      const end = new Date(s.completed_at).getTime();
      return (end - start) / (1000 * 60); // Minutes
    });

    return durations.reduce((sum, dur) => sum + dur, 0) / durations.length;
  }

  private analyzeBestTimeOfDay(sessions: any[]): number[] {
    const hourlyPerformance: Record<number, { total: number, quality: number }> = {};

    sessions.forEach(session => {
      const hour = new Date(session.started_at).getHours();
      const accuracy = session.correct_answers / Math.max(session.tasks_completed || session.questions_answered, 1);
      
      if (!hourlyPerformance[hour]) {
        hourlyPerformance[hour] = { total: 0, quality: 0 };
      }
      
      hourlyPerformance[hour].total += 1;
      hourlyPerformance[hour].quality += accuracy;
    });

    // Find best performing hours
    const bestHours = Object.entries(hourlyPerformance)
      .filter(([_, stats]) => stats.total >= 2) // Minimum sample
      .map(([hour, stats]) => ({ hour: parseInt(hour), score: stats.quality / stats.total }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.hour);

    return bestHours.length > 0 ? bestHours : [14, 15, 16]; // Default afternoon
  }

  private calculateDropoutRisk(validationLogs: any[], analytics: any[], sessions: any[]): number {
    let risk = 0;

    // Recent activity
    const lastActivity = Math.max(
      ...validationLogs.map(log => new Date(log.created_at).getTime()),
      ...analytics.map(a => new Date(a.created_at).getTime()),
      ...sessions.map(s => new Date(s.started_at).getTime())
    );

    const daysSinceLastActivity = (Date.now() - lastActivity) / (1000 * 60 * 60 * 24);
    if (daysSinceLastActivity > 7) risk += 0.4;
    else if (daysSinceLastActivity > 3) risk += 0.2;

    // Performance trend
    const recentAccuracy = validationLogs.slice(0, 10);
    if (recentAccuracy.length >= 5) {
      const accuracy = recentAccuracy.filter(log => log.is_correct).length / recentAccuracy.length;
      if (accuracy < 0.3) risk += 0.3;
      else if (accuracy < 0.5) risk += 0.1;
    }

    // Session frequency
    const recentSessions = sessions.filter(s => {
      const sessionDate = new Date(s.started_at).getTime();
      return Date.now() - sessionDate < 14 * 24 * 60 * 60 * 1000; // Last 14 days
    });

    if (recentSessions.length < 3) risk += 0.3;

    return Math.max(0, Math.min(1, risk));
  }

  private predictStruggleAreas(errorPatterns: Record<string, number>, skillProgress: any[]): string[] {
    // Combine error patterns with low skill progress
    const strugglingAreas = new Set<string>();

    // From error patterns
    Object.entries(errorPatterns)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .forEach(([pattern, _]) => strugglingAreas.add(pattern));

    // From skill progress
    skillProgress
      .filter(skill => skill.mastery_level < 3)
      .sort((a, b) => a.mastery_level - b.mastery_level)
      .slice(0, 2)
      .forEach(skill => strugglingAreas.add(skill.skill_id));

    return Array.from(strugglingAreas);
  }

  private assessMasteryReadiness(skillProgress: any[], validationLogs: any[]): Record<string, number> {
    const readiness: Record<string, number> = {};

    skillProgress.forEach(skill => {
      let score = 0;

      // Base mastery level
      score += (skill.mastery_level / 10) * 0.5;

      // Recent performance in this skill
      const skillLogs = validationLogs.filter(log => 
        log.session_type === skill.skill_id || 
        log.task_id?.includes(skill.skill_id)
      ).slice(0, 10);

      if (skillLogs.length >= 3) {
        const accuracy = skillLogs.filter(log => log.is_correct).length / skillLogs.length;
        score += accuracy * 0.3;

        // Consistency
        const consistency = 1 - this.calculateVariance(skillLogs.map(log => log.is_correct ? 1 : 0));
        score += consistency * 0.2;
      }

      readiness[skill.skill_id] = Math.max(0, Math.min(1, score));
    });

    return readiness;
  }

  private getDefaultLearnerData(userId: string): ConsolidatedLearnerData {
    return {
      userId,
      currentCognitiveLoad: 0.5,
      attentionSpan: 25,
      fatigueLevel: 0.2,
      flowState: 0.5,
      averageResponseTime: 30000,
      accuracyTrend: [0.5],
      errorPatterns: {},
      preferredDifficulty: 5,
      explanationPreference: 'detailed',
      optimalSessionLength: 30,
      bestTimeOfDay: [14, 15, 16],
      dropoutRisk: 0.3,
      nextStruggleAreas: [],
      masteryReadiness: {}
    };
  }

  /**
   * UNIFIED DECISION MAKING - single point of truth
   */
  async makeAdaptiveDecision(userId: string, context: {
    sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
    userResponse?: string;
    isCorrect?: boolean;
    responseTime?: number;
    currentSkill?: string;
    department: string;
  }) {
    const learnerData = await this.getConsolidatedLearnerData(userId);

    // Real-time adaptation based on consolidated data
    const adaptations = {
      difficulty: this.adaptDifficulty(learnerData, context),
      contentType: this.selectContentType(learnerData, context),
      explanationStyle: learnerData.explanationPreference,
      nextAction: this.determineNextAction(learnerData, context),
      feedbackMessage: this.generateSmartFeedback(learnerData, context),
      interventions: this.suggestInterventions(learnerData)
    };

    // Update learner data with new interaction
    await this.updateLearnerData(userId, context);

    return {
      learnerData,
      adaptations,
      predictions: {
        dropoutRisk: learnerData.dropoutRisk,
        nextStruggles: learnerData.nextStruggleAreas,
        masteryReadiness: learnerData.masteryReadiness
      }
    };
  }

  private adaptDifficulty(learnerData: ConsolidatedLearnerData, context: any): number {
    let targetDifficulty = learnerData.preferredDifficulty;

    // Adjust for cognitive load
    if (learnerData.currentCognitiveLoad > 0.8) {
      targetDifficulty = Math.max(1, targetDifficulty - 2);
    } else if (learnerData.flowState > 0.7) {
      targetDifficulty = Math.min(10, targetDifficulty + 1);
    }

    // Adjust for fatigue
    if (learnerData.fatigueLevel > 0.6) {
      targetDifficulty = Math.max(1, targetDifficulty - 1);
    }

    // Adjust for recent performance
    if (context.isCorrect === false) {
      targetDifficulty = Math.max(1, targetDifficulty - 1);
    } else if (context.isCorrect === true && context.responseTime < learnerData.averageResponseTime * 0.7) {
      targetDifficulty = Math.min(10, targetDifficulty + 1);
    }

    return targetDifficulty;
  }

  private selectContentType(learnerData: ConsolidatedLearnerData, context: any): string {
    // Select based on session type and learner state
    if (context.sessionType === 'diagnostic') return 'diagnostic_content';
    if (learnerData.currentCognitiveLoad > 0.7) return 'simplified_content';
    if (learnerData.flowState > 0.7) return 'challenging_content';
    return 'adaptive_content';
  }

  private determineNextAction(learnerData: ConsolidatedLearnerData, context: any): string {
    if (learnerData.fatigueLevel > 0.7) return 'suggest_break';
    if (learnerData.dropoutRisk > 0.6) return 'engagement_intervention';
    if (learnerData.flowState > 0.8) return 'maintain_flow';
    if (learnerData.currentCognitiveLoad > 0.8) return 'reduce_complexity';
    return 'continue_learning';
  }

  private generateSmartFeedback(learnerData: ConsolidatedLearnerData, context: any): string {
    if (context.isCorrect === undefined) {
      return "Let's continue your personalized learning journey!";
    }

    if (context.isCorrect) {
      if (learnerData.flowState > 0.7) {
        return "Excellent! You're in the zone. Let's keep this momentum going!";
      }
      return "Great work! You're building solid understanding.";
    } else {
      if (learnerData.currentCognitiveLoad > 0.7) {
        return "Let's break this down into smaller steps to make it clearer.";
      }
      return "Good attempt! Let's work through this together.";
    }
  }

  private suggestInterventions(learnerData: ConsolidatedLearnerData): string[] {
    const interventions = [];

    if (learnerData.dropoutRisk > 0.6) {
      interventions.push('motivational_message');
    }
    if (learnerData.fatigueLevel > 0.6) {
      interventions.push('suggest_break');
    }
    if (learnerData.currentCognitiveLoad > 0.8) {
      interventions.push('simplify_content');
    }
    if (learnerData.nextStruggleAreas.length > 0) {
      interventions.push('preemptive_support');
    }

    return interventions;
  }

  private async updateLearnerData(userId: string, context: any) {
    // Store new interaction data
    if (context.userResponse !== undefined) {
      await supabase.from('validation_logs').insert({
        user_id: userId,
        session_type: context.sessionType,
        is_correct: context.isCorrect || false,
        response_time: context.responseTime,
        confidence: 0.5, // Could be enhanced
        created_at: new Date().toISOString()
      });
    }

    // Clear cache to force reload with new data
    this.learnerCache.delete(userId);
  }
}