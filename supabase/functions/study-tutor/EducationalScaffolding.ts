// Educational Scaffolding System for Adaptive Learning
export enum LearningPhase {
  THEORY_INTRODUCTION = 'theory_introduction',
  WORKED_EXAMPLE = 'worked_example', 
  GUIDED_PRACTICE = 'guided_practice',
  INDEPENDENT_PRACTICE = 'independent_practice',
  MASTERY_CHECK = 'mastery_check'
}

export interface StudentModel {
  confidence: number; // 0-100
  methodUnderstanding: number; // 0-100
  speedVsAccuracy: 'speed_focused' | 'accuracy_focused' | 'balanced';
  preferredExplanationStyle: 'visual' | 'verbal' | 'step_by_step';
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  frustrationLevel: number; // 0-100
  engagementLevel: number; // 0-100
}

export interface ScaffoldingRecommendation {
  phase: LearningPhase;
  explanation: string;
  nextSteps: string[];
  difficultyAdjustment: number;
  timeEstimate: number; // minutes
}

export class EducationalScaffolding {
  
  /**
   * Determines if student is ready to advance to next learning phase
   */
  public static shouldAdvancePhase(
    currentPhase: LearningPhase,
    studentModel: StudentModel,
    recentPerformance: { correct: number; total: number }
  ): boolean {
    const accuracy = recentPerformance.total > 0 ? recentPerformance.correct / recentPerformance.total : 0;
    
    switch (currentPhase) {
      case LearningPhase.THEORY_INTRODUCTION:
        // Always advance after theory (passive consumption)
        return true;
        
      case LearningPhase.WORKED_EXAMPLE:
        // Advance if student shows understanding signs
        return studentModel.confidence > 60;
        
      case LearningPhase.GUIDED_PRACTICE:
        // Need 70% accuracy to move to independent
        return accuracy >= 0.7 && studentModel.consecutiveCorrect >= 2;
        
      case LearningPhase.INDEPENDENT_PRACTICE:
        // Need 80% accuracy for mastery check
        return accuracy >= 0.8 && studentModel.consecutiveCorrect >= 3;
        
      case LearningPhase.MASTERY_CHECK:
        // Complete mastery required
        return accuracy >= 0.9 && studentModel.consecutiveCorrect >= 4;
        
      default:
        return false;
    }
  }

  /**
   * Gets appropriate scaffolding prompt for AI based on current state
   */
  public static getScaffoldingPrompt(
    phase: LearningPhase,
    difficulty: number,
    studentModel: StudentModel,
    skillName: string
  ): string {
    const basePrompts = {
      [LearningPhase.THEORY_INTRODUCTION]: `
FAZA: WPROWADZENIE TEORII dla ${skillName}
STYL: ${studentModel.preferredExplanationStyle}
POZIOM ZAUFANIA: ${studentModel.confidence}%

INSTRUKCJE:
- Wyjaśnij kluczowe koncepcje w ${studentModel.preferredExplanationStyle === 'visual' ? 'sposób wizualny z diagramami' : studentModel.preferredExplanationStyle === 'verbal' ? 'słowny z analogiami' : 'krok po kroku'}
- Połącz z wcześniejszą wiedzą
- Użyj prostych przykładów
- Sprawdź zrozumienie przed przejściem dalej
- NIE dawaj jeszcze zadań do rozwiązania`,

      [LearningPhase.WORKED_EXAMPLE]: `
FAZA: PRZYKŁAD ROZWIĄZANY dla ${skillName}
FRUSTRACJA: ${studentModel.frustrationLevel}%
ZROZUMIENIE METODY: ${studentModel.methodUnderstanding}%

INSTRUKCJE:
- Pokaż kompletne rozwiązanie przykładu
- Wyjaśnij każdy krok i DLACZEGO tak robimy
- Podkreśl częste błędy i jak ich unikać
- Zapytaj: "Czy jest jakiś krok, który wymaga wyjaśnienia?"
- Przygotuj ucznia do samodzielnej próby`,

      [LearningPhase.GUIDED_PRACTICE]: `
FAZA: PRAKTYKA Z PRZEWODNIKIEM dla ${skillName}
KOLEJNE POPRAWNE: ${studentModel.consecutiveCorrect}
STYL: ${studentModel.speedVsAccuracy}

INSTRUKCJE:
- Daj zadanie i prowadź krok po kroku jeśli potrzeba
- ${studentModel.speedVsAccuracy === 'speed_focused' ? 'Zachęć do przemyślenia, nie pędź' : studentModel.speedVsAccuracy === 'accuracy_focused' ? 'Dodaj motywację czasową' : 'Zachowaj balans tempo/dokładność'}
- Po błędzie: natychmiast wyjaśnij i daj podobne zadanie
- Po sukcesie: krótkie pochwały, następne zadanie
- ZATRZYMAJ jeśli 2 poprawne z rzędu`,

      [LearningPhase.INDEPENDENT_PRACTICE]: `
FAZA: SAMODZIELNA PRAKTYKA dla ${skillName}
ZAANGAŻOWANIE: ${studentModel.engagementLevel}%

INSTRUKCJE:
- Daj zadanie bez podpowiedzi
- Pozwól na samodzielne myślenie (nie przerywaj za szybko)
- Po błędzie: zapytaj "Sprawdź swoje rozwiązanie" zanim podasz odpowiedź
- ${studentModel.engagementLevel < 50 ? 'UWAGA: Niskie zaangażowanie - użyj ciekawszego kontekstu' : ''}
- Monitoruj frustrację`,

      [LearningPhase.MASTERY_CHECK]: `
FAZA: SPRAWDZIAN OPANOWANIA dla ${skillName}
PEWNOŚĆ: ${studentModel.confidence}%

INSTRUKCJE:
- Daj zadanie nieco trudniejsze niż zwykle
- Brak podpowiedzi unless student completely stuck
- Po rozwiązaniu: zapytaj o pewność (1-10)
- Jeśli pewność <8: więcej praktyki na tym poziomie
- Jeśli wszystko OK: gratulacje i przejście do wyższego poziomu`
    };

    return basePrompts[phase];
  }

  /**
   * Detects if student lacks prerequisite knowledge
   */
  public static detectPrerequisiteGap(
    consecutiveIncorrect: number,
    errorTypes: string[],
    skillName: string
  ): string | null {
    if (consecutiveIncorrect < 3) return null;

    const prerequisites: Record<string, string> = {
      'linear_equations': 'operacje na liczbach całkowitych i ułamkach',
      'quadratic_equations': 'równania liniowe i działania na wyrażeniach algebraicznych',
      'exponential_functions': 'potęgi i pierwiastki',
      'trigonometry': 'geometria trójkątów i koło jednostkowe',
      'derivatives': 'funkcje i ich własności',
      'integrals': 'pochodne i funkcje elementarne'
    };

    const prerequisite = prerequisites[skillName];
    return prerequisite ? prerequisite : 'podstawowe operacje matematyczne';
  }

  /**
   * Generates engagement recovery strategy when student is struggling
   */
  public static generateEngagementRecovery(
    frustrationLevel: number,
    engagementLevel: number
  ): 'confidence_building' | 'context_change' | 'break_suggestion' | 'gamification' {
    if (frustrationLevel > 80) return 'break_suggestion';
    if (engagementLevel < 30) return 'context_change'; 
    if (frustrationLevel > 60) return 'confidence_building';
    return 'gamification';
  }

  /**
   * Calculates optimal next difficulty based on learning science
   */
  public static calculateOptimalDifficulty(
    currentDifficulty: number,
    studentModel: StudentModel,
    phase: LearningPhase
  ): number {
    let adjustment = 0;

    // Phase-based adjustments
    switch (phase) {
      case LearningPhase.THEORY_INTRODUCTION:
      case LearningPhase.WORKED_EXAMPLE:
        adjustment = -0.5; // Easier during learning phases
        break;
      case LearningPhase.GUIDED_PRACTICE:
        adjustment = 0; // Stay at current level
        break;
      case LearningPhase.INDEPENDENT_PRACTICE:
        adjustment = studentModel.consecutiveCorrect > 3 ? 0.3 : 0;
        break;
      case LearningPhase.MASTERY_CHECK:
        adjustment = 0.5; // Slightly harder for mastery check
        break;
    }

    // Student state adjustments
    if (studentModel.frustrationLevel > 70) adjustment -= 0.8;
    if (studentModel.confidence < 40) adjustment -= 0.5;
    if (studentModel.consecutiveCorrect > 5) adjustment += 0.4;
    if (studentModel.consecutiveIncorrect > 2) adjustment -= 0.6;

    const newDifficulty = currentDifficulty + adjustment;
    return Math.max(1, Math.min(7, newDifficulty)); // Keep within bounds
  }

  /**
   * Generates micro-feedback for specific learning moments
   */
  public static generateMicroFeedback(
    isCorrect: boolean,
    responseTime: number,
    phase: LearningPhase,
    studentModel: StudentModel
  ): string {
    if (isCorrect) {
      if (phase === LearningPhase.GUIDED_PRACTICE) {
        return responseTime < 30000 ? "Świetnie! Widzę, że metoda staje się dla Ciebie naturalna." : "Doskonale! Dokładność jest ważniejsza niż szybkość.";
      }
      if (phase === LearningPhase.INDEPENDENT_PRACTICE) {
        return studentModel.confidence < 50 ? "Brawo! Widzisz, że potrafisz to robić samodzielnie." : "Excellent! Jesteś gotowy na większe wyzwanie.";
      }
    } else {
      if (phase === LearningPhase.GUIDED_PRACTICE) {
        return "To dobry moment na naukę. Spróbujmy razem przeanalizować ten problem.";
      }
      if (phase === LearningPhase.INDEPENDENT_PRACTICE) {
        return studentModel.frustrationLevel > 60 ? "Nie martw się, każdy matematyk popełnia błędy. To część procesu uczenia się." : "Sprawdź swoje rozwiązanie krok po kroku. Gdzie mogłeś się pomylić?";
      }
    }
    
    return "Kontynuujmy pracę!";
  }
}