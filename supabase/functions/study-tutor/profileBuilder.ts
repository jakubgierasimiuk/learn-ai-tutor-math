// Enhanced Cognitive Profile Builder
// Integrates stored user data into comprehensive cognitive model

import { StudentProfile } from './adaptivePedagogy.ts';

export function buildCognitiveProfile(
  profile: any,
  skillProgress: any,
  diagnosticSession: any,
  learnerIntelligence?: any,
  emotionalStates?: any[],
  metacognitiveData?: any,
  misconceptionNetworks?: any[]
): StudentProfile {
  
  // Extract basic profile data
  const learnerProfile = profile?.learner_profile || {};
  const baseResponseTime = skillProgress?.total_response_time_ms || 3000;
  const correctnessRate = skillProgress ? 
    (skillProgress.correct_attempts / Math.max(1, skillProgress.total_attempts)) : 0.5;
  
  // Determine age group from diagnostic or profile
  const classLevel = diagnosticSession?.class_level || profile?.level || 8;
  const ageGroup = classLevel <= 6 ? 'elementary' : classLevel <= 9 ? 'middle' : 'high_school';
  
  // Calculate cognitive metrics - use advanced data if available, fallback to estimates
  const workingMemoryCapacity = learnerIntelligence?.working_memory_span || 
    calculateWorkingMemoryCapacity(learnerProfile, ageGroup);
  const processingSpeed = learnerIntelligence?.processing_speed_percentile || 
    calculateProcessingSpeed(baseResponseTime, ageGroup);
  const attentionRegulationIndex = calculateAttentionRegulation(skillProgress);
  const inhibitoryControlIndex = calculateInhibitoryControl(skillProgress);
  const cognitiveFlexibilityIndex = calculateCognitiveFlexibility(learnerProfile);
  const selfEfficacy = learnerProfile?.confidence_level || 0.6;
  const persistenceIndex = calculatePersistenceIndex(skillProgress);
  
  // Enhanced metrics from advanced tables
  const cognitiveLoadCapacity = learnerIntelligence?.cognitive_load_capacity || 
    (ageGroup === 'elementary' ? 3 : ageGroup === 'middle' ? 5 : 7);
  const emotionalBaseline = learnerIntelligence?.emotional_state?.baseline_arousal || 0.5;
  const stressThreshold = learnerIntelligence?.emotional_state?.stress_threshold || 0.7;
  const planningSkills = metacognitiveData?.planning_skills?.goal_setting || 3;
  const monitoringSkills = metacognitiveData?.monitoring_skills?.progress_awareness || 3;
  
  // Cognitive style detection from response patterns
  const cognitiveStyle = detectCognitiveStyle(skillProgress, baseResponseTime);
  
  // Age-based calibration
  const attentionSpanMinutes = calculateOptimalSessionLength(ageGroup);
  const cognitiveLoadThreshold = ageGroup === 'elementary' ? 1.2 : ageGroup === 'middle' ? 1.5 : 1.8;
  
  return {
    responseTime: baseResponseTime,
    correctnessRate,
    commonMistakes: learnerProfile?.struggle_areas || [],
    preferredExplanationStyle: learnerProfile?.learning_style || 'verbal',
    difficultyLevel: learnerProfile?.preferred_difficulty || 5,
    knowledgeGaps: learnerProfile?.knowledge_gaps || [],
    
    // Enhanced cognitive metrics
    workingMemoryCapacity,
    processingSpeed,
    attentionRegulationIndex,
    inhibitoryControlIndex, 
    cognitiveFlexibilityIndex,
    selfEfficacy,
    persistenceIndex,
    
    // Age-based factors
    ageGroup,
    attentionSpanMinutes,
    cognitiveLoadThreshold,
    
    // Learning patterns
    cognitiveStyle,
    preferredPedagogyStyle: learnerProfile?.preferred_pedagogy || 'fading',
    
    // Advanced cognitive intelligence (NEW)
    cognitiveLoadCapacity,
    emotionalBaseline,
    stressThreshold, 
    planningSkills,
    monitoringSkills,
    
    // Active misconceptions from networks
    activeMisconceptions: misconceptionNetworks?.map(m => m.misconception_cluster_id) || [],
    
    // Recent emotional states
    recentEmotions: emotionalStates?.slice(-3).map(e => e.detected_emotion) || []
  };
}

// Working Memory Capacity calculation (Miller's 7±2, age-adjusted)
function calculateWorkingMemoryCapacity(learnerProfile: any, ageGroup: string): number {
  const baseCapacity = ageGroup === 'elementary' ? 4 : ageGroup === 'middle' ? 5.5 : 7;
  const performanceModifier = (learnerProfile?.performance_patterns?.working_memory || 1.0);
  
  return Math.min(9, Math.max(3, baseCapacity * performanceModifier));
}

// Processing Speed calculation (response time to percentile)
function calculateProcessingSpeed(responseTime: number, ageGroup: string): number {
  // Age-adjusted baselines (milliseconds for typical problems)
  const baselines = {
    'elementary': 8000,  // 8 seconds
    'middle': 6000,      // 6 seconds  
    'high_school': 4000  // 4 seconds
  };
  
  const baseline = baselines[ageGroup] || 5000;
  
  // Convert to percentile (faster = higher percentile)
  const speedRatio = baseline / Math.max(1000, responseTime);
  return Math.min(100, Math.max(1, speedRatio * 50));
}

// Attention Regulation calculation (response time consistency)
function calculateAttentionRegulation(skillProgress: any): number {
  if (!skillProgress?.response_times || skillProgress.response_times.length < 3) {
    return 0.5; // neutral default
  }
  
  const times = skillProgress.response_times;
  const mean = times.reduce((a: number, b: number) => a + b, 0) / times.length;
  const variance = times.reduce((a: number, b: number) => a + Math.pow(b - mean, 2), 0) / times.length;
  const coefficientOfVariation = Math.sqrt(variance) / mean;
  
  // Lower variance = better attention regulation
  return Math.max(0, Math.min(1, 1 - coefficientOfVariation));
}

// Inhibitory Control calculation (impulse control measure)
function calculateInhibitoryControl(skillProgress: any): number {
  const totalAttempts = skillProgress?.total_attempts || 1;
  const quickIncorrectAttempts = skillProgress?.quick_incorrect_attempts || 0;
  
  // Higher ratio of quick incorrect = lower inhibitory control
  const impulsivityRatio = quickIncorrectAttempts / totalAttempts;
  return Math.max(0, Math.min(1, 1 - impulsivityRatio * 2));
}

// Cognitive Flexibility calculation (strategy adaptation)
function calculateCognitiveFlexibility(learnerProfile: any): number {
  const strategies = learnerProfile?.effective_strategies || [];
  const strategyCount = strategies.length;
  
  // More diverse strategies = higher flexibility
  return Math.min(1, strategyCount / 5);
}

// Persistence Index calculation (attempts before giving up)
function calculatePersistenceIndex(skillProgress: any): number {
  const hintsUsed = skillProgress?.hints_used || 0;
  const totalTasks = skillProgress?.total_tasks || 1;
  
  // Lower hints per task = higher persistence
  const hintsPerTask = hintsUsed / totalTasks;
  return Math.max(1, Math.min(5, 5 - hintsPerTask));
}

// Cognitive Style detection from behavioral patterns
function detectCognitiveStyle(
  skillProgress: any, 
  averageResponseTime: number
): 'impulsive' | 'reflective' | 'persistent' | 'minimalist' | 'optimistic' {
  
  const responseSpeed = averageResponseTime < 3000 ? 'fast' : 'slow';
  const accuracy = skillProgress ? 
    (skillProgress.correct_attempts / Math.max(1, skillProgress.total_attempts)) : 0.5;
  const persistence = skillProgress?.hints_used < 0.5 * skillProgress?.total_tasks;
  
  if (responseSpeed === 'fast' && accuracy < 0.6) {
    return 'impulsive';
  } else if (responseSpeed === 'slow' && accuracy > 0.8) {
    return 'reflective';
  } else if (persistence && accuracy > 0.7) {
    return 'persistent';
  } else if (!persistence && accuracy > 0.8) {
    return 'minimalist'; // efficient, gets help when needed
  } else {
    return 'optimistic'; // maintains positive approach
  }
}

// Age-based session length calculation
function calculateOptimalSessionLength(ageGroup: string): number {
  switch (ageGroup) {
    case 'elementary': return 8;  // 7-10 minutes
    case 'middle': return 15;     // 12-18 minutes  
    case 'high_school': return 25; // 20-30 minutes
    default: return 15;
  }
}