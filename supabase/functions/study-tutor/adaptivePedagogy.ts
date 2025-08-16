// Adaptive Pedagogy for Study Tutor Edge Function
// Phase 1: Intelligent Answer Pattern Recognition & Pedagogical Logic

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
  correctAnswerRate: number;
  commonMistakes: string[];
  preferredExplanationStyle: 'visual' | 'verbal' | 'step_by_step';
  difficultyLevel: number; // 1-10
  knowledgeGaps: string[];
  lastActivity: Date;
}

export interface TeachingMoment {
  type: 'praise' | 'correction' | 'hint' | 'encouragement' | 'prerequisite_check' | 'checkpoint';
  message: string;
  nextAction: 'continue' | 'increase_difficulty' | 'practice_more' | 'review_basics' | 'show_checkpoint' | 'end_session';
  focusAreas?: string[];
  difficultyAdjustment?: number; // -2 to +2
  generateMoreProblems?: number; // How many more problems of this type
}

export interface AnswerAnalysis {
  pattern: StudentResponsePattern;
  confidence: number;
  teachingMoment: TeachingMoment;
  sessionShouldContinue: boolean;
  adaptedInstructions?: string;
}

/**
 * GŁÓWNA FUNKCJA: Analizuje odpowiedź ucznia i generuje inteligentną reakcję
 */
export function analyzeStudentAnswer(
  userAnswer: string,
  expectedAnswer: string,
  responseTime: number,
  isCorrect: boolean,
  profile: StudentProfile,
  sessionContext: {
    stepsCompleted: number;
    consecutiveCorrect: number;
    recentPerformance: Array<{isCorrect: boolean, responseTime: number, confidence: number}>;
    currentDifficulty: number;
    timeSpent: number;
  }
): AnswerAnalysis {
  
  // 1. ROZPOZNAJ WZORZEC ODPOWIEDZI
  const pattern = classifyResponsePattern(userAnswer, expectedAnswer, responseTime, isCorrect, profile);
  
  // 2. WYGENERUJ TEACHING MOMENT
  const teachingMoment = generateTeachingMoment(pattern, userAnswer, expectedAnswer, responseTime, profile, sessionContext);
  
  // 3. OKREŚL CZY SESJA POWINNA KONTYNUOWAĆ
  const sessionShouldContinue = shouldContinueSession(pattern, sessionContext, teachingMoment);
  
  // 4. WYGENERUJ ADAPTOWANE INSTRUKCJE DLA AI
  const adaptedInstructions = generateAIInstructions(pattern, teachingMoment, sessionContext);
  
  return {
    pattern,
    confidence: calculateConfidence(pattern, isCorrect, responseTime, profile),
    teachingMoment,
    sessionShouldContinue,
    adaptedInstructions
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

function calculateConfidence(pattern: StudentResponsePattern, isCorrect: boolean, responseTime: number, profile: StudentProfile): number {
  if (pattern === 'quick_correct') return 0.95;
  if (pattern === 'slow_correct') return 0.85;
  if (pattern === 'hesitant_correct') return 0.70;
  if (pattern === 'computational_error') return 0.60;
  if (pattern === 'method_error') return 0.40;
  if (pattern === 'completely_lost') return 0.20;
  if (pattern === 'pseudo_activity') return 0.10;
  return 0.50;
}

function shouldShowCheckpoint(stepsCompleted: number, consecutiveCorrect: number, timeSpent: number): boolean {
  // Co 8-10 kroków
  if (stepsCompleted > 0 && stepsCompleted % 8 === 0) return true;
  // Po 5 z rzędu poprawnych odpowiedzi
  if (consecutiveCorrect >= 5) return true;
  // Po 15 minutach intensywnej nauki
  if (timeSpent > 15 * 60 * 1000) return true;
  return false;
}

function extractNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d.,\-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}