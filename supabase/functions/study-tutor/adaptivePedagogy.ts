// Enhanced Adaptive Pedagogy with Mathematical Error Classification
import { MathErrorClassifier, MathErrorType } from './MathErrorClassifier.ts';
import { EducationalScaffolding, LearningPhase, StudentModel } from './EducationalScaffolding.ts';

// Enhanced Student Response Patterns
export type StudentResponsePattern = 
  | 'quick_correct'      // Szybka prawidłowa odpowiedź → zwiększ trudność
  | 'slow_correct'       // Powolna prawidłowa → pogratuluj, sprawdź obszary trudności  
  | 'hesitant_correct'   // Prawidłowa z wahaniem → sprawdź pewność
  | 'computational_error' // Błąd rachunkowy vs. brak zrozumienia
  | 'method_error'       // Błędna metoda
  | 'completely_lost'    // Zupełnie nie wie jak się zabrać za problem
  | 'pseudo_activity';   // Pozorna aktywność

export interface StudentProfile {
  averageResponseTime: number;
  correctnessRate: number;
  commonMistakes: string[];
  preferredExplanationStyle: 'visual' | 'verbal' | 'step_by_step';
  difficultyLevel: number; // 1-7 (enhanced granularity)
  knowledgeGaps: string[];
  lastActivity: Date;
}

export interface TeachingMoment {
  type: 'praise' | 'correction' | 'hint' | 'encouragement' | 'prerequisite_check' | 'checkpoint' | 'intervention';
  message: string;
  nextAction: 'continue' | 'increase_difficulty' | 'practice_more' | 'review_basics' | 'show_checkpoint' | 'end_session' | 'confidence_building' | 'prerequisite_review';
  focusAreas?: string[];
  difficultyAdjustment?: number; // Now micro-adjustments: -1.5 to +1.0
  generateMoreProblems?: number;
}

export interface AnswerAnalysis {
  pattern: StudentResponsePattern;
  confidence: number;
  teachingMoment: TeachingMoment;
  shouldContinueSession: boolean;
  nextDifficultyAdjustment: number;
}

/**
 * ENHANCED FUNCTION: Analizuje odpowiedź ucznia z użyciem zaawansowanej klasyfikacji błędów
 */
export function analyzeStudentAnswer(
  userAnswer: string,
  expectedAnswer: string,
  responseTime: number,
  isCorrect: boolean,
  profile: StudentProfile,
  sessionContext: any
): AnswerAnalysis {
  console.log('[Enhanced Pedagogy] Analyzing student answer:', {
    userAnswer,
    expectedAnswer,
    responseTime,
    isCorrect,
    profileSnippet: { correctnessRate: profile.correctnessRate, averageResponseTime: profile.averageResponseTime }
  });

  // Use enhanced math error classification
  const mathError = MathErrorClassifier.classifyError(
    userAnswer,
    expectedAnswer,
    sessionContext.skillName || 'default',
    responseTime
  );

  // Create student model from profile
  const studentModel: StudentModel = {
    confidence: Math.min(100, (profile.correctnessRate || 0.5) * 100),
    methodUnderstanding: calculateMethodUnderstanding(profile),
    speedVsAccuracy: determineSpeedVsAccuracy(profile),
    preferredExplanationStyle: profile.preferredExplanationStyle || 'step_by_step',
    consecutiveCorrect: sessionContext.consecutiveCorrect || 0,
    consecutiveIncorrect: sessionContext.consecutiveIncorrect || 0,
    frustrationLevel: calculateFrustrationLevel(profile, sessionContext),
    engagementLevel: calculateEngagementLevel(sessionContext)
  };

  const pattern = classifyResponsePattern(userAnswer, expectedAnswer, responseTime, isCorrect, profile);
  const teachingMoment = generateEnhancedTeachingMoment(mathError, studentModel, sessionContext);
  const shouldContinue = shouldContinueSession(pattern, teachingMoment, sessionContext);

  // Check for prerequisite gaps
  if (sessionContext.consecutiveIncorrect >= 3) {
    const prerequisiteGap = EducationalScaffolding.detectPrerequisiteGap(
      sessionContext.consecutiveIncorrect,
      [mathError.type],
      sessionContext.skillName || 'default'
    );
    
    if (prerequisiteGap) {
      teachingMoment.nextAction = 'prerequisite_review';
      teachingMoment.message += ` Sprawdźmy podstawy: ${prerequisiteGap}.`;
    }
  }

  return {
    pattern,
    confidence: calculateConfidence(pattern),
    teachingMoment,
    shouldContinueSession: shouldContinue,
    nextDifficultyAdjustment: mathError.difficultyAdjustment
  };
}

/**
 * Klasyfikuje wzorzec odpowiedzi ucznia
 */
function classifyResponsePattern(
  userAnswer: string,
  expectedAnswer: string,
  responseTime: number,
  isCorrect: boolean,
  profile: StudentProfile
): StudentResponsePattern {
  
  const quickThreshold = Math.max(2000, profile.averageResponseTime * 0.6);
  const slowThreshold = profile.averageResponseTime * 1.8;
  
  // Sprawdź oznaki pozornej aktywności
  if (isPseudoActivity(userAnswer, responseTime, quickThreshold)) {
    return 'pseudo_activity';
  }
  
  if (isCorrect) {
    if (responseTime < quickThreshold) {
      return 'quick_correct';
    } else if (responseTime > slowThreshold) {
      return 'slow_correct';
    } else {
      // Sprawdź czy odpowiedź jest pewna czy z wahaniem
      const hesitationMarkers = ['chyba', 'może', 'prawdopodobnie', 'myślę że', '?'];
      const hasHesitation = hesitationMarkers.some(marker => 
        userAnswer.toLowerCase().includes(marker)
      );
      return hasHesitation ? 'hesitant_correct' : 'quick_correct';
    }
  }
  
  // Dla błędnych odpowiedzi - klasyfikuj typ błędu
  return classifyErrorType(userAnswer, expectedAnswer, profile);
}

/**
 * Wykrywa pozorną aktywność
 */
function isPseudoActivity(userAnswer: string, responseTime: number, quickThreshold: number): boolean {
  const answer = userAnswer.trim().toLowerCase();
  
  // Bardzo krótkie odpowiedzi w bardzo krótkim czasie
  if (responseTime < quickThreshold * 0.5 && answer.length < 3) {
    return true;
  }
  
  // Pojedyncze cyfry w bardzo krótkim czasie  
  if (responseTime < 2000 && /^\d$/.test(answer)) {
    return true;
  }
  
  // Typowe "szybkie" odpowiedzi bez zastanowienia
  const quickAnswers = ['nie wiem', 'nie', 'tak', '0', '1', 'a', 'b', 'c'];
  if (responseTime < quickThreshold * 0.7 && quickAnswers.includes(answer)) {
    return true;
  }
  
  return false;
}

/**
 * Klasyfikuje typ błędu
 */
function classifyErrorType(
  userAnswer: string,
  expectedAnswer: string,
  profile: StudentProfile
): StudentResponsePattern {
  
  // Sprawdź czy uczeń w ogóle próbował
  const lostIndicators = [
    'nie wiem', 'nie rozumiem', 'nie mam pojęcia', 'jak to zrobić',
    'co to znaczy', 'nie znam', 'pomóż', 'nie potrafię', 'nie umiem'
  ];
  
  if (lostIndicators.some(indicator => 
    userAnswer.toLowerCase().includes(indicator)
  )) {
    return 'completely_lost';
  }
  
  // Porównaj numeryczne wartości jeśli możliwe
  const userNum = extractNumber(userAnswer);
  const expectedNum = extractNumber(expectedAnswer);
  
  if (userNum !== null && expectedNum !== null) {
    const percentError = Math.abs((userNum - expectedNum) / expectedNum) * 100;
    
    // Małe odchylenie = błąd rachunkowy
    if (percentError < 15) {
      return 'computational_error';
    }
    
    // Duże odchylenie = błędna metoda
    if (percentError > 50) {
      return 'method_error';
    }
  }
  
  return 'method_error'; // Domyślnie błędna metoda
}

/**
 * Generuje odpowiedni Teaching Moment
 */
function generateTeachingMoment(
  pattern: StudentResponsePattern,
  userAnswer: string,
  expectedAnswer: string,
  responseTime: number,
  profile: StudentProfile,
  sessionContext: any
): TeachingMoment {
  
  switch (pattern) {
    case 'quick_correct':
      return {
        type: 'praise',
        message: `Świetnie! Rozwiązałeś to bardzo szybko i poprawnie. Widzę, że ten poziom jest dla Ciebie zbyt łatwy.`,
        nextAction: 'increase_difficulty',
        difficultyAdjustment: +2,
        generateMoreProblems: 2
      };

    case 'slow_correct':
      return {
        type: 'praise',
        message: `Bardzo dobrze! Nie spiesz się - ważne, że doszedłeś do właściwego rozwiązania. Który krok sprawiał Ci największą trudność?`,
        nextAction: 'continue',
        focusAreas: ['confidence_building', 'method_reinforcement']
      };

    case 'hesitant_correct':
      return {
        type: 'praise',
        message: `Dobra odpowiedź! Wydajesz się mieć wątpliwości - na ile jesteś pewien swojego rozwiązania? (1-10)`,
        nextAction: 'continue',
        focusAreas: ['confidence_check', 'method_verification']
      };

    case 'computational_error':
      return {
        type: 'correction',
        message: `Twoja metoda jest poprawna, ale masz drobny błąd w obliczeniach. Sprawdź krok po kroku swoje działania matematyczne.`,
        nextAction: 'practice_more',
        focusAreas: ['calculation_accuracy'],
        generateMoreProblems: 1
      };

    case 'method_error':
      return {
        type: 'correction',
        message: `Widzę inne podejście w Twoim rozwiązaniu. Pokażę Ci standardową metodę rozwiązywania tego typu zadań.`,
        nextAction: 'review_basics',
        focusAreas: ['method_understanding'],
        difficultyAdjustment: -1
      };

    case 'completely_lost':
      return {
        type: 'prerequisite_check',
        message: `Rozumiem, że to może być trudne. Sprawdźmy czy masz wszystkie podstawowe narzędzia. Zacznijmy od prostszego przykładu.`,
        nextAction: 'review_basics',
        focusAreas: ['prerequisite_skills'],
        difficultyAdjustment: -2
      };

    case 'pseudo_activity':
      return {
        type: 'encouragement',
        message: `Widzę, że próbujesz szybko odpowiedzieć. Pamiętaj - ważniejsze jest zrozumienie niż tempo. Przeanalizuj zadanie spokojnie.`,
        nextAction: 'practice_more',
        focusAreas: ['deep_thinking', 'patience']
      };

    default:
      return {
        type: 'encouragement',
        message: `Kontynuujmy naukę. Każdy błąd to okazja do zdobycia nowej wiedzy!`,
        nextAction: 'continue'
      };
  }
}

/**
 * Określa czy sesja powinna kontynuować
 */
function shouldContinueSession(
  pattern: StudentResponsePattern,
  sessionContext: any,
  teachingMoment: TeachingMoment
): boolean {
  
  // Sprawdź czy to czas na checkpoint
  if (shouldShowCheckpoint(sessionContext.stepsCompleted, sessionContext.consecutiveCorrect, sessionContext.timeSpent)) {
    return false; // Pokaż checkpoint
  }
  
  // Jeśli uczeń jest totalnie zagubiony - krótka sesja
  if (pattern === 'completely_lost' && sessionContext.stepsCompleted > 3) {
    return false;
  }
  
  // Jeśli za dużo pseudo-aktywności
  if (pattern === 'pseudo_activity' && sessionContext.stepsCompleted > 5) {
    return false;
  }
  
  // Jeśli za łatwo i było już dużo kroków
  if (pattern === 'quick_correct' && sessionContext.consecutiveCorrect > 6) {
    return false; // Zakończ z sukcesem
  }
  
  return true;
}

/**
 * Generuje dostosowane instrukcje dla AI
 */
function generateAIInstructions(
  pattern: StudentResponsePattern,
  teachingMoment: TeachingMoment,
  sessionContext: any
): string {
  
  let instructions = `WZORZEC_ODPOWIEDZI: ${pattern}\n`;
  instructions += `REAKCJA: ${teachingMoment.message}\n`;
  instructions += `NASTĘPNY_KROK: ${teachingMoment.nextAction}\n`;
  
  if (teachingMoment.difficultyAdjustment) {
    const change = teachingMoment.difficultyAdjustment > 0 ? 'ZWIĘKSZ' : 'ZMNIEJSZ';
    instructions += `TRUDNOŚĆ: ${change} o ${Math.abs(teachingMoment.difficultyAdjustment)} poziom(y)\n`;
  }
  
  if (teachingMoment.generateMoreProblems) {
    instructions += `WIĘCEJ_ZADAŃ: Wygeneruj ${teachingMoment.generateMoreProblems} podobnych przykładów\n`;
  }
  
  if (teachingMoment.focusAreas) {
    instructions += `SKUPIENIE: ${teachingMoment.focusAreas.join(', ')}\n`;
  }
  
  // Specjalne instrukcje według wzorca
  switch (pattern) {
    case 'quick_correct':
      instructions += `SPECJALNE: Nie gratuluj długo, od razu przejdź do trudniejszego zadania. Sprawdź czy uczeń przypadkiem nie zgadł.`;
      break;
    case 'slow_correct':
      instructions += `SPECJALNE: Pogratuluj cierpliwości. Zapytaj konkretnie: "Który krok Ci się wydawał najtrudniejszy?"`;
      break;
    case 'hesitant_correct':
      instructions += `SPECJALNE: Zapytaj o pewność (skala 1-10). Jeśli <7, daj więcej przykładów na tym poziomie.`;
      break;
    case 'computational_error':
      instructions += `SPECJALNE: Pokaż TYLKO błąd rachunkowy, nie całe rozwiązanie. Daj podobne zadanie do przećwiczenia.`;
      break;
    case 'method_error':
      instructions += `SPECJALNE: Wyjaśnij METODĘ krok po kroku, ale pozwól uczniowi samodzielnie ją zastosować.`;
      break;
    case 'completely_lost':
      instructions += `SPECJALNE: Sprawdź podstawy. Zacznij od "Czy wiesz jak [podstawowa operacja]?" Dawaj mikro-kroki.`;
      break;
    case 'pseudo_activity':
      instructions += `SPECJALNE: Nie krytykuj bezpośrednio. Zachęć do "spokojnej analizy" i daj proste zadanie na rozgrzewkę.`;
      break;
  }
  
  return instructions;
}

// FUNKCJE POMOCNICZE

// Enhanced helper functions for new pedagogy system
function calculateMethodUnderstanding(profile: StudentProfile): number {
  // Base understanding on error patterns and response consistency
  return Math.min(100, (profile.correctnessRate || 0.5) * 80 + 20);
}

function determineSpeedVsAccuracy(profile: StudentProfile): 'speed_focused' | 'accuracy_focused' | 'balanced' {
  const avgTime = profile.averageResponseTime;
  const accuracy = profile.correctnessRate || 0.5;
  
  if (avgTime < 15000 && accuracy > 0.8) return 'balanced';
  if (avgTime < 10000) return 'speed_focused';
  if (accuracy > 0.9) return 'accuracy_focused';
  return 'balanced';
}

function calculateFrustrationLevel(profile: StudentProfile, sessionContext: any): number {
  const incorrectStreak = sessionContext.consecutiveIncorrect || 0;
  const timePressure = (sessionContext.totalTime || 0) > 20 * 60 * 1000; // > 20 min
  
  let frustration = incorrectStreak * 20; // 20% per wrong answer
  if (timePressure) frustration += 30;
  if ((profile.correctnessRate || 0.5) < 0.3) frustration += 20;
  
  return Math.min(100, frustration);
}

function calculateEngagementLevel(sessionContext: any): number {
  const steps = sessionContext.totalSteps || 1;
  const responseVariability = sessionContext.responseTimeVariability || 0.5;
  
  let engagement = 70; // Base engagement
  if (steps > 10) engagement += 15; // Sustained activity
  if (responseVariability < 0.3) engagement -= 20; // Too consistent (possible distraction)
  
  return Math.max(0, Math.min(100, engagement));
}

function generateEnhancedTeachingMoment(
  mathError: any,
  studentModel: StudentModel,
  sessionContext: any
): TeachingMoment {
  // Use EducationalScaffolding for more sophisticated responses
  let message = mathError.pedagogicalResponse;
  let nextAction = 'continue';
  let difficultyAdjustment = mathError.difficultyAdjustment;

  // Emergency protocols
  if (studentModel.frustrationLevel > 80) {
    const recovery = EducationalScaffolding.generateEngagementRecovery(
      studentModel.frustrationLevel,
      studentModel.engagementLevel
    );
    
    if (recovery === 'confidence_building') {
      message = "Spróbujmy czegoś prostszego, żeby odbudować pewność siebie.";
      difficultyAdjustment = -1.5;
      nextAction = 'confidence_building';
    }
  }

  // Scaffolding recommendations
  if (mathError.requiresIntervention) {
    const currentPhase = sessionContext.learningPhase || LearningPhase.INDEPENDENT_PRACTICE;
    const scaffoldingPrompt = EducationalScaffolding.getScaffoldingPrompt(
      currentPhase,
      sessionContext.currentDifficulty || 4,
      studentModel,
      sessionContext.skillName || 'default'
    );
    
    message += ` ${scaffoldingPrompt}`;
  }

  return {
    type: mathError.requiresIntervention ? 'intervention' : 'encouragement',
    message,
    nextAction,
    difficultyAdjustment
  };
}

function calculateConfidence(pattern: StudentResponsePattern): number {
  if (pattern === 'quick_correct') return 0.95;
  if (pattern === 'slow_correct') return 0.85;
  if (pattern === 'hesitant_correct') return 0.70;
  if (pattern === 'computational_error') return 0.60;
  if (pattern === 'method_error') return 0.40;
  if (pattern === 'completely_lost') return 0.20;
  if (pattern === 'pseudo_activity') return 0.10;
  return 0.50;
}

function extractNumber(text: string): number | null {
  const match = text.match(/-?\d+\.?\d*/);
  return match ? parseFloat(match[0]) : null;
}