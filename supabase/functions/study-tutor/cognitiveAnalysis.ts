// Cognitive Analysis and Flow State Management for Universal Learning Engine
// Implements cognitive science principles from ChatGPT's pedagogical research

import { StudentProfile, FlowStateIndicators, StudentResponsePattern } from './adaptivePedagogy.ts';

// Calculate flow state indicators based on cognitive science principles
export function calculateFlowState(responseTime: number, profile: StudentProfile): FlowStateIndicators {
  // Response time variance calculation (attention regulation)
  const expectedResponseTime = profile.processingSpeed * 1000; // convert to ms
  const timeDeviation = Math.abs(responseTime - expectedResponseTime) / expectedResponseTime;
  const responseTimeVariance = Math.min(1, timeDeviation);
  
  // Error stability based on recent performance patterns
  const errorStabilityIndex = 1 - (profile.commonMistakes.length / 10); // normalize to 0-1
  
  // Self-correction frequency (metacognitive awareness)
  const selfCorrectionFrequency = profile.persistenceIndex / 5; // normalize attempts to 0-1
  
  // Perceived challenge based on working memory load
  const cognitiveLoad = calculateCognitiveLoad(profile);
  const perceivedChallenge = Math.min(10, cognitiveLoad * profile.difficultyLevel);
  
  // Engagement level based on multiple factors
  const engagementLevel = calculateEngagementLevel(profile, responseTimeVariance);
  
  // Frustration level based on performance and cognitive overload
  const frustrationLevel = calculateFrustrationLevel(profile, cognitiveLoad);
  
  return {
    responseTimeVariance,
    errorStabilityIndex,
    selfCorrectionFrequency,
    perceivedChallenge,
    engagementLevel,
    frustrationLevel
  };
}

// Calculate cognitive load using Sweller's Cognitive Load Theory
export function calculateCognitiveLoad(profile: StudentProfile): number {
  const intrinsicLoad = profile.difficultyLevel / 10; // task complexity
  const extraneousLoad = profile.knowledgeGaps.length / 5; // missing prerequisites
  const germaneLoad = profile.workingMemoryCapacity / 9; // available processing capacity
  
  // CLT formula: effective load = (intrinsic + extraneous) / germane
  const cognitiveLoad = (intrinsicLoad + extraneousLoad) / Math.max(0.1, germaneLoad);
  
  return Math.min(2.0, cognitiveLoad); // cap at 2.0 for extreme overload
}

// Zone of Proximal Development calculation (Vygotsky)
export function calculateZPDAlignment(responsePattern: StudentResponsePattern, profile: StudentProfile): number {
  const currentMastery = profile.correctnessRate;
  const optimalZPDRange = [currentMastery + 0.1, currentMastery + 0.3]; // 10-30% above current level
  
  let taskDifficulty = 0.5; // default medium
  
  // Map response patterns to difficulty estimates
  switch (responsePattern) {
    case 'quick_correct':
      taskDifficulty = currentMastery - 0.2; // too easy
      break;
    case 'slow_correct':
      taskDifficulty = currentMastery + 0.15; // good ZPD
      break;
    case 'computational_error':
      taskDifficulty = currentMastery + 0.1; // slightly challenging
      break;
    case 'method_error':
      taskDifficulty = currentMastery + 0.4; // too hard
      break;
    default:
      taskDifficulty = currentMastery;
  }
  
  // Calculate alignment (1.0 = perfect ZPD, 0.0 = far from ZPD)
  if (taskDifficulty >= optimalZPDRange[0] && taskDifficulty <= optimalZPDRange[1]) {
    return 1.0;
  } else {
    const distance = Math.min(
      Math.abs(taskDifficulty - optimalZPDRange[0]),
      Math.abs(taskDifficulty - optimalZPDRange[1])
    );
    return Math.max(0, 1 - distance * 2); // linear falloff
  }
}

// Select optimal pedagogical strategy based on cognitive profile
export function selectPedagogicalStrategy(
  responsePattern: StudentResponsePattern, 
  profile: StudentProfile
): 'fading' | 'example-problem' | 'self-explanation' | 'interleaving' | 'contrasting' {
  
  // Age-based strategy preferences
  if (profile.ageGroup === 'elementary') {
    switch (responsePattern) {
      case 'method_error':
        return 'example-problem'; // concrete examples work better for younger learners
      case 'computational_error':
        return 'fading'; // step-by-step scaffolding
      default:
        return 'fading';
    }
  }
  
  // Cognitive style-based selection
  switch (profile.cognitiveStyle) {
    case 'impulsive':
      return 'self-explanation'; // forces reflection
    case 'reflective':
      return 'contrasting'; // analytical comparison
    case 'persistent':
      return 'interleaving'; // varied practice
    default:
      return profile.preferredPedagogyStyle;
  }
}

// Calculate optimal difficulty adjustment
export function calculateDifficultyAdjustment(
  responsePattern: StudentResponsePattern,
  profile: StudentProfile,
  flowState: FlowStateIndicators
): number {
  let adjustment = 0;
  
  // Flow state optimization (Csikszentmihalyi)
  if (flowState.perceivedChallenge < 4 && flowState.engagementLevel > 0.7) {
    adjustment += 1; // increase challenge
  } else if (flowState.perceivedChallenge > 8 || flowState.frustrationLevel > 0.7) {
    adjustment -= 1; // decrease challenge
  }
  
  // Response pattern-based adjustment
  switch (responsePattern) {
    case 'quick_correct':
      adjustment += profile.selfEfficacy > 0.8 ? 1 : 0;
      break;
    case 'method_error':
      adjustment -= 1;
      break;
    case 'computational_error':
      adjustment -= 0.5;
      break;
  }
  
  // Age-based moderation
  if (profile.ageGroup === 'elementary') {
    adjustment *= 0.7; // more conservative adjustments
  }
  
  return Math.max(-2, Math.min(2, adjustment));
}

// Calculate engagement level based on multiple cognitive indicators
function calculateEngagementLevel(profile: StudentProfile, responseTimeVariance: number): number {
  // Base engagement from self-efficacy and persistence
  let engagement = (profile.selfEfficacy + profile.persistenceIndex / 5) / 2;
  
  // Attention regulation bonus
  engagement += (1 - responseTimeVariance) * 0.2;
  
  // Working memory efficiency bonus
  engagement += (profile.workingMemoryCapacity / 9) * 0.1;
  
  return Math.min(1, engagement);
}

// Calculate frustration level using multiple indicators
function calculateFrustrationLevel(profile: StudentProfile, cognitiveLoad: number): number {
  let frustration = 0;
  
  // Cognitive overload contributes to frustration
  if (cognitiveLoad > profile.cognitiveLoadThreshold) {
    frustration += (cognitiveLoad - profile.cognitiveLoadThreshold) * 0.5;
  }
  
  // Low self-efficacy increases frustration
  frustration += (1 - profile.selfEfficacy) * 0.3;
  
  // Frequent mistakes increase frustration
  frustration += (profile.commonMistakes.length / 10) * 0.2;
  
  // Inhibitory control deficit increases frustration
  frustration += (1 - profile.inhibitoryControlIndex) * 0.2;
  
  return Math.min(1, frustration);
}

// Age-based attention span calculation (developmental psychology)
export function calculateOptimalSessionLength(ageGroup: 'elementary' | 'middle' | 'high_school'): number {
  switch (ageGroup) {
    case 'elementary':
      return 7; // 7-10 minutes for grades 4-6
    case 'middle':
      return 15; // 12-15 minutes for middle school
    case 'high_school':
      return 25; // 20-25 minutes for high school
    default:
      return 15;
  }
}

// Detect method misconceptions using pattern analysis
export function detectMethodMisconception(
  userAnswer: string, 
  expectedAnswer: string, 
  profile: StudentProfile
): string {
  // Common misconception patterns in mathematics
  const misconceptionPatterns = {
    'fraction_addition': /(\d+\/\d+)\+(\d+\/\d+)=(\d+\/\d+)/,
    'negative_distribution': /-\(([^)]+)\)/,
    'equation_operations': /([a-z])\s*([+\-])\s*(\d+)\s*=\s*(\d+)/
  };
  
  // Age-appropriate misconception messages
  const messages = {
    'fraction_addition': profile.ageGroup === 'elementary' 
      ? 'Pamiętaj: przy dodawaniu ułamków musimy mieć taki sam mianownik!'
      : 'Aby dodać ułamki, potrzebujemy wspólnego mianownika. Spróbuj znaleźć najmniejszą wspólną wielokrotność.',
    'negative_distribution': profile.ageGroup === 'elementary'
      ? 'Minus przed nawiasem zmienia znaki wszystkich liczb w nawiasie.'
      : 'Przy rozkładaniu minusa pamiętaj o zmianie znaku każdego składnika w nawiasie.',
    'equation_operations': 'Sprawdź: co robisz z jedną stroną równania, musisz zrobić z drugą stroną.'
  };
  
  // Pattern matching and response
  for (const [type, pattern] of Object.entries(misconceptionPatterns)) {
    if (pattern.test(userAnswer)) {
      return messages[type as keyof typeof messages] || 'Spróbuj innej metody rozwiązania.';
    }
  }
  
  return 'Przeanalizuj swoje podejście do problemu. Czy użyłeś właściwej metody?';
}

// Check if student needs a micro-break (brain break)
export function shouldTakeMicroBreak(
  sessionDuration: number, 
  profile: StudentProfile, 
  flowState: FlowStateIndicators
): boolean {
  const optimalSessionLength = calculateOptimalSessionLength(profile.ageGroup);
  
  return (
    sessionDuration >= optimalSessionLength || 
    flowState.frustrationLevel > 0.8 ||
    flowState.engagementLevel < 0.3 ||
    flowState.responseTimeVariance > 0.7
  );
}