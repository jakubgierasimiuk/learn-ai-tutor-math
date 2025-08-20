// Learner Profile Updater with Cognitive Analytics
// Updates user profiles with real-time cognitive insights

import { FlowStateIndicators, StudentProfile } from './adaptivePedagogy.ts';

interface SessionAnalytics {
  responseTime: number;
  isCorrect: boolean;
  pedagogicalStrategy?: string;
  difficultyAdjustment: number;
}

export async function updateLearnerProfileWithCognition(
  supabaseClient: any,
  userId: string,
  update: {
    flowState: FlowStateIndicators;
    cognitiveProfile: StudentProfile;
    sessionAnalytics: SessionAnalytics;
  }
): Promise<void> {
  
  try {
    // Get current profile
    const { data: currentProfile } = await supabaseClient
      .from('profiles')
      .select('learner_profile')
      .eq('user_id', userId)
      .single();

    const existingProfile = currentProfile?.learner_profile || {};
    
    // Update cognitive metrics with exponential moving average
    const alpha = 0.2; // learning rate for updates
    
    const updatedProfile = {
      ...existingProfile,
      
      // Real-time cognitive metrics
      current_flow_state: {
        engagement_level: update.flowState.engagementLevel,
        frustration_level: update.flowState.frustrationLevel,
        perceived_challenge: update.flowState.perceivedChallenge,
        last_updated: new Date().toISOString()
      },
      
      // Updated cognitive profile (exponential moving average)
      cognitive_profile: {
        working_memory_capacity: exponentialMovingAverage(
          existingProfile.cognitive_profile?.working_memory_capacity || update.cognitiveProfile.workingMemoryCapacity,
          update.cognitiveProfile.workingMemoryCapacity,
          alpha
        ),
        processing_speed: exponentialMovingAverage(
          existingProfile.cognitive_profile?.processing_speed || update.cognitiveProfile.processingSpeed,
          update.cognitiveProfile.processingSpeed,
          alpha
        ),
        attention_regulation_index: exponentialMovingAverage(
          existingProfile.cognitive_profile?.attention_regulation_index || update.cognitiveProfile.attentionRegulationIndex,
          update.cognitiveProfile.attentionRegulationIndex,
          alpha
        ),
        inhibitory_control_index: exponentialMovingAverage(
          existingProfile.cognitive_profile?.inhibitory_control_index || update.cognitiveProfile.inhibitoryControlIndex,
          update.cognitiveProfile.inhibitoryControlIndex,
          alpha
        ),
        self_efficacy: exponentialMovingAverage(
          existingProfile.cognitive_profile?.self_efficacy || update.cognitiveProfile.selfEfficacy,
          update.cognitiveProfile.selfEfficacy,
          alpha
        ),
        persistence_index: exponentialMovingAverage(
          existingProfile.cognitive_profile?.persistence_index || update.cognitiveProfile.persistenceIndex,
          update.cognitiveProfile.persistenceIndex,
          alpha
        ),
        cognitive_style: update.cognitiveProfile.cognitiveStyle,
        age_group: update.cognitiveProfile.ageGroup,
        last_updated: new Date().toISOString()
      },
      
      // Session analytics history (keep last 10 sessions)
      recent_sessions: [
        ...(existingProfile.recent_sessions || []).slice(-9),
        {
          timestamp: new Date().toISOString(),
          response_time: update.sessionAnalytics.responseTime,
          is_correct: update.sessionAnalytics.isCorrect,
          pedagogical_strategy: update.sessionAnalytics.pedagogicalStrategy,
          difficulty_adjustment: update.sessionAnalytics.difficultyAdjustment,
          flow_indicators: {
            engagement: update.flowState.engagementLevel,
            frustration: update.flowState.frustrationLevel
          }
        }
      ],
      
      // Learning patterns detection
      learning_patterns: detectLearningPatterns(existingProfile, update),
      
      // Performance trends
      performance_trends: calculatePerformanceTrends(existingProfile, update.sessionAnalytics),
      
      last_updated: new Date().toISOString()
    };

    // Update the profile
    await supabaseClient
      .from('profiles')
      .update({ learner_profile: updatedProfile })
      .eq('user_id', userId);

    console.log(`[ProfileUpdater] Updated cognitive profile for user ${userId}`);
    
  } catch (error) {
    console.error('[ProfileUpdater] Error updating learner profile:', error);
  }
}

// Exponential moving average for smooth metric updates
function exponentialMovingAverage(oldValue: number, newValue: number, alpha: number): number {
  return alpha * newValue + (1 - alpha) * oldValue;
}

// Detect learning patterns from session history
function detectLearningPatterns(existingProfile: any, update: any): any {
  const recentSessions = existingProfile.recent_sessions || [];
  const lastFiveSessions = recentSessions.slice(-5);
  
  // Pattern detection
  const patterns = {
    consistency: calculateConsistency(lastFiveSessions),
    improvement_trend: calculateImprovementTrend(lastFiveSessions),
    optimal_difficulty_range: calculateOptimalDifficultyRange(lastFiveSessions),
    preferred_strategies: calculatePreferredStrategies(lastFiveSessions),
    peak_performance_conditions: identifyPeakConditions(lastFiveSessions)
  };
  
  return patterns;
}

// Calculate performance consistency
function calculateConsistency(sessions: any[]): number {
  if (sessions.length < 3) return 0.5;
  
  const accuracies = sessions.map(s => s.is_correct ? 1 : 0);
  const mean = accuracies.reduce((a, b) => a + b, 0) / accuracies.length;
  const variance = accuracies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / accuracies.length;
  
  return Math.max(0, 1 - Math.sqrt(variance));
}

// Calculate improvement trend
function calculateImprovementTrend(sessions: any[]): number {
  if (sessions.length < 3) return 0;
  
  const recentAccuracy = sessions.slice(-3).filter(s => s.is_correct).length / 3;
  const olderAccuracy = sessions.slice(0, -3).filter(s => s.is_correct).length / Math.max(1, sessions.length - 3);
  
  return recentAccuracy - olderAccuracy;
}

// Calculate optimal difficulty range
function calculateOptimalDifficultyRange(sessions: any[]): { min: number; max: number } {
  const successfulSessions = sessions.filter(s => s.is_correct && s.flow_indicators?.engagement > 0.6);
  
  if (successfulSessions.length === 0) {
    return { min: 3, max: 7 };
  }
  
  const challenges = successfulSessions.map(s => s.flow_indicators?.challenge || 5);
  return {
    min: Math.min(...challenges),
    max: Math.max(...challenges)
  };
}

// Calculate preferred pedagogical strategies
function calculatePreferredStrategies(sessions: any[]): string[] {
  const strategySuccess: Record<string, number> = {};
  
  sessions.forEach(session => {
    if (session.pedagogical_strategy && session.is_correct) {
      strategySuccess[session.pedagogical_strategy] = (strategySuccess[session.pedagogical_strategy] || 0) + 1;
    }
  });
  
  return Object.entries(strategySuccess)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([strategy]) => strategy);
}

// Identify peak performance conditions
function identifyPeakConditions(sessions: any[]): any {
  const peakSessions = sessions.filter(s => 
    s.is_correct && 
    s.flow_indicators?.engagement > 0.8 && 
    s.flow_indicators?.frustration < 0.3
  );
  
  if (peakSessions.length === 0) return null;
  
  const avgResponseTime = peakSessions.reduce((sum, s) => sum + s.response_time, 0) / peakSessions.length;
  const commonStrategies = calculatePreferredStrategies(peakSessions);
  
  return {
    optimal_response_time_range: [avgResponseTime * 0.8, avgResponseTime * 1.2],
    effective_strategies: commonStrategies,
    session_count: peakSessions.length
  };
}

// Calculate performance trends over time
function calculatePerformanceTrends(existingProfile: any, currentSession: SessionAnalytics): any {
  const sessions = existingProfile.recent_sessions || [];
  const allSessions = [...sessions, currentSession];
  
  // Weekly trend (last 7 sessions)
  const weeklyTrend = calculateTrendSlope(allSessions.slice(-7));
  
  // Monthly trend (all sessions)
  const monthlyTrend = calculateTrendSlope(allSessions);
  
  return {
    weekly_improvement: weeklyTrend,
    monthly_improvement: monthlyTrend,
    current_streak: calculateCurrentStreak(allSessions),
    best_streak: calculateBestStreak(allSessions)
  };
}

// Calculate trend slope using linear regression
function calculateTrendSlope(sessions: any[]): number {
  if (sessions.length < 2) return 0;
  
  const n = sessions.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = sessions.map(s => s.is_correct ? 1 : 0);
  
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return isNaN(slope) ? 0 : slope;
}

// Calculate current correct answer streak
function calculateCurrentStreak(sessions: any[]): number {
  let streak = 0;
  for (let i = sessions.length - 1; i >= 0 && sessions[i].is_correct; i--) {
    streak++;
  }
  return streak;
}

// Calculate best historical streak
function calculateBestStreak(sessions: any[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  sessions.forEach(session => {
    if (session.is_correct) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  });
  
  return maxStreak;
}
