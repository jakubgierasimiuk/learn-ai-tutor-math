// Phase 2: Inteligentna Adaptacja Pedagogiczna

export type StudentResponsePattern = 
  | 'quick_correct'      // Szybka prawidłowa odpowiedź → zwiększ trudność
  | 'slow_correct'       // Powolna prawidłowa → pogratuluj, sprawdź obszary trudności  
  | 'computational_error' // Błąd rachunkowy vs. brak zrozumienia
  | 'method_error'       // Błędna metoda
  | 'completely_lost'    // Zupełnie nie wie jak się zabrać za problem
  | 'pseudo_activity';   // Pozorna aktywność

export interface StudentProfile {
  averageResponseTime: number;
  correctAnswerRate: number;
  commonMistakes: string[];
  preferredExplanationStyle: 'visual' | 'verbal' | 'step_by_step';
  difficultyLevel: number; // 1-10
  knowledgeGaps: string[];
}

export interface TeachingMoment {
  type: 'praise' | 'correction' | 'hint' | 'encouragement' | 'prerequisite_check';
  message: string;
  nextAction: 'continue' | 'increase_difficulty' | 'practice_more' | 'review_basics';
  focusAreas?: string[];
}

/**
 * Teaching Moment Detection - rozpoznaje kluczowe momenty w nauce
 */
export function detectTeachingMoment(
  responsePattern: StudentResponsePattern,
  userAnswer: string,
  expectedAnswer: string,
  responseTime: number,
  profile: StudentProfile
): TeachingMoment {
  
  switch (responsePattern) {
    case 'quick_correct':
      if (responseTime < profile.averageResponseTime * 0.5) {
        return {
          type: 'praise',
          message: `Świetnie! Rozwiązałeś to bardzo szybko. Widzę, że ten poziom jest dla Ciebie za łatwy.`,
          nextAction: 'increase_difficulty'
        };
      }
      return {
        type: 'praise', 
        message: `Doskonale! Prawidłowa odpowiedź.`,
        nextAction: 'continue'
      };

    case 'slow_correct':
      return {
        type: 'praise',
        message: `Bardzo dobrze! Nie spiesz się - ważne, że doszedłeś do właściwego rozwiązania. Który element sprawiał Ci trudność?`,
        nextAction: 'continue',
        focusAreas: ['time_management', 'confidence_building']
      };

    case 'computational_error':
      return {
        type: 'correction',
        message: `Twoja metoda jest poprawna, ale masz drobny błąd w obliczeniach. Sprawdź krok po kroku swoje działania.`,
        nextAction: 'practice_more',
        focusAreas: ['calculation_accuracy']
      };

    case 'method_error':
      return {
        type: 'correction',
        message: `Widzę inną metodę w Twoim podejściu. Pokażę Ci standardowy sposób rozwiązania tego typu zadań.`,
        nextAction: 'review_basics',
        focusAreas: ['method_understanding']
      };

    case 'completely_lost':
      return {
        type: 'prerequisite_check',
        message: `Rozumiem, że to może być trudne. Sprawdźmy czy masz wszystkie narzędzia potrzebne do tego zadania. Czy wiesz jak [podstawowa umiejętność]?`,
        nextAction: 'review_basics',
        focusAreas: ['prerequisite_skills']
      };

    case 'pseudo_activity':
      return {
        type: 'encouragement',
        message: `Widzę, że próbujesz szybko odpowiedzieć. Pamiętaj, że ważniejsze jest zrozumienie niż tempo. Przeanalizuj zadanie spokojnie.`,
        nextAction: 'practice_more',
        focusAreas: ['deep_thinking', 'patience']
      };

    default:
      return {
        type: 'encouragement',
        message: `Kontynuujmy naukę. Każdy błąd to okazja do nauki!`,
        nextAction: 'continue'
      };
  }
}

/**
 * Adaptive Difficulty Engine - inteligentnie dostosowuje trudność
 */
export function calculateNextDifficulty(
  currentDifficulty: number,
  recentPerformance: Array<{isCorrect: boolean, responseTime: number, confidence: number}>,
  profile: StudentProfile
): number {
  if (recentPerformance.length === 0) return currentDifficulty;

  const recent3 = recentPerformance.slice(-3);
  const correctCount = recent3.filter(p => p.isCorrect).length;
  const avgResponseTime = recent3.reduce((sum, p) => sum + p.responseTime, 0) / recent3.length;
  const avgConfidence = recent3.reduce((sum, p) => sum + p.confidence, 0) / recent3.length;

  // All correct and fast = increase significantly
  if (correctCount === 3 && avgResponseTime < profile.averageResponseTime * 0.7) {
    return Math.min(10, currentDifficulty + 2);
  }

  // All correct but slow = slight increase
  if (correctCount === 3 && avgResponseTime > profile.averageResponseTime * 1.3) {
    return Math.min(10, currentDifficulty + 1);
  }

  // Mixed results with high confidence = maintain
  if (correctCount >= 2 && avgConfidence > 0.7) {
    return currentDifficulty;
  }

  // Poor performance = decrease
  if (correctCount <= 1 || avgConfidence < 0.4) {
    return Math.max(1, currentDifficulty - 1);
  }

  return currentDifficulty;
}

/**
 * Generuje spersonalizowane przykłady na podstawie profilu ucznia
 */
export function generatePersonalizedExamples(
  topic: string,
  difficulty: number,
  profile: StudentProfile
): string[] {
  const examples: string[] = [];
  
  // Dostosuj przykłady do stylu nauki
  if (profile.preferredExplanationStyle === 'visual') {
    examples.push(`Wyobraź sobie ${topic} jako...`);
  } else if (profile.preferredExplanationStyle === 'step_by_step') {
    examples.push(`Krok 1: Najpierw...`);
  }

  // Unikaj obszarów, w których uczeń ma problemy
  if (!profile.knowledgeGaps.includes('fractions')) {
    examples.push(`Podobnie jak w ułamkach...`);
  }

  return examples;
}

/**
 * Wykrywa wzorce w odpowiedziach ucznia
 */
export function analyzeResponsePattern(
  userAnswer: string,
  expectedAnswer: string,
  responseTime: number,
  isCorrect: boolean,
  profile: StudentProfile
): StudentResponsePattern {
  
  const quickThreshold = profile.averageResponseTime * 0.6;
  const slowThreshold = profile.averageResponseTime * 1.5;

  if (isCorrect) {
    if (responseTime < quickThreshold) {
      return 'quick_correct';
    } else if (responseTime > slowThreshold) {
      return 'slow_correct';
    }
    return 'quick_correct'; // Default for correct answers
  }

  // For incorrect answers, analyze the type of error
  const userNum = parseFloat(userAnswer.replace(/[^\d.-]/g, ''));
  const expectedNum = parseFloat(expectedAnswer.replace(/[^\d.-]/g, ''));

  if (!isNaN(userNum) && !isNaN(expectedNum)) {
    const percentError = Math.abs((userNum - expectedNum) / expectedNum) * 100;
    
    if (percentError < 10) {
      return 'computational_error';
    } else if (percentError < 50) {
      return 'method_error';
    }
  }

  // Check for signs of being completely lost
  const lostIndicators = [
    'nie wiem', 'nie rozumiem', 'nie mam pojęcia', 'jak to zrobić',
    'co to znaczy', 'nie znam', 'pomóż', 'nie potrafię'
  ];
  
  if (lostIndicators.some(indicator => 
    userAnswer.toLowerCase().includes(indicator)
  )) {
    return 'completely_lost';
  }

  // Check for pseudo-activity (very quick wrong answers)
  if (responseTime < quickThreshold * 0.5) {
    return 'pseudo_activity';
  }

  return 'method_error'; // Default for unclassified errors
}

/**
 * System checkpointów - pyta o kontynuację lub zmianę poziomu
 */
export function shouldShowCheckpoint(
  stepsCompleted: number,
  consecutiveCorrect: number,
  timeSpent: number
): boolean {
  // Co 8-10 kroków
  if (stepsCompleted > 0 && stepsCompleted % 8 === 0) return true;
  
  // Po 5 z rzędu poprawnych odpowiedzi
  if (consecutiveCorrect >= 5) return true;
  
  // Po 15 minutach intensywnej nauki
  if (timeSpent > 15 * 60 * 1000) return true;
  
  return false;
}

/**
 * Generuje opcje na checkpoint
 */
export function generateCheckpointOptions(
  performance: { correct: number; total: number; avgTime: number },
  currentDifficulty: number
): Array<{action: string; label: string; description: string}> {
  const options = [];
  
  const successRate = performance.correct / performance.total;
  
  if (successRate > 0.8) {
    options.push({
      action: 'increase_difficulty',
      label: 'Podwyższ poziom',
      description: 'Radzisz sobie świetnie! Przejdźmy do trudniejszych zadań.'
    });
  }
  
  if (successRate > 0.6) {
    options.push({
      action: 'continue_same',
      label: 'Kontynuuj na tym poziomie', 
      description: 'Jeszcze kilka ćwiczeń na utrwalenie.'
    });
  }
  
  options.push({
    action: 'review_topic',
    label: 'Powtórz trudne elementy',
    description: 'Wróćmy do fragmentów, które sprawiały trudności.'
  });
  
  options.push({
    action: 'end_session',
    label: 'Zakończ lekcję',
    description: 'Podsumujmy to, co już się nauczyłeś.'
  });
  
  return options;
}