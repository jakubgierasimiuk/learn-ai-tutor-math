// Educational Scaffolding System for Progressive Learning
export enum LearningPhase {
  THEORY = 'theory',
  EXAMPLE = 'example', 
  GUIDED_PRACTICE = 'guided_practice',
  INDEPENDENT_PRACTICE = 'independent_practice',
  ASSESSMENT = 'assessment'
}

export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM_EASY = 3,
  MEDIUM = 4,
  MEDIUM_HARD = 5,
  HARD = 6,
  VERY_HARD = 7
}

export interface StudentModel {
  confidence: number; // 0-100
  methodUnderstanding: number; // 0-100
  speedVsAccuracy: 'speed_focused' | 'accuracy_focused' | 'balanced';
  preferredExplanationStyle: 'visual' | 'algebraic' | 'verbal' | 'step_by_step';
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  frustrationLevel: number; // 0-100
  engagementLevel: number; // 0-100
}

export interface LearningPathStep {
  phase: LearningPhase;
  difficulty: DifficultyLevel;
  requiredMastery: number; // 0-100, required to advance
  maxAttempts: number;
  timeoutMinutes?: number;
}

export class EducationalScaffolding {
  public static getOptimalDifficulty(
    currentDifficulty: number,
    isCorrect: boolean,
    studentModel: StudentModel,
    errorType?: string
  ): number {
    let adjustment = 0;

    if (isCorrect) {
      // Micro-progression for correct answers
      if (studentModel.consecutiveCorrect >= 2) {
        adjustment = studentModel.confidence > 80 ? 0.5 : 0.3;
      } else {
        adjustment = 0.2; // Small boost
      }
    } else {
      // Micro-regression for errors
      switch (errorType) {
        case 'careless':
          adjustment = -0.1; // Barely any regression
          break;
        case 'calculation':
          adjustment = -0.3;
          break;
        case 'conceptual':
          adjustment = -0.7;
          break;
        case 'procedural':
          adjustment = -0.8;
          break;
        default:
          adjustment = -0.5;
      }

      // Additional adjustment based on frustration
      if (studentModel.frustrationLevel > 70) {
        adjustment -= 0.3; // More support when frustrated
      }
    }

    // Ensure we stay within bounds and use micro-steps
    const newDifficulty = Math.max(1, Math.min(7, currentDifficulty + adjustment));
    return Math.round(newDifficulty * 2) / 2; // Round to nearest 0.5
  }

  public static shouldAdvancePhase(
    currentPhase: LearningPhase,
    attempts: number,
    correctAttempts: number,
    studentModel: StudentModel
  ): boolean {
    const masteryRate = correctAttempts / Math.max(attempts, 1);
    
    switch (currentPhase) {
      case LearningPhase.THEORY:
        return attempts >= 1; // Just need to read/engage with theory
        
      case LearningPhase.EXAMPLE:
        return attempts >= 1 && studentModel.confidence > 50;
        
      case LearningPhase.GUIDED_PRACTICE:
        return masteryRate >= 0.7 && correctAttempts >= 2;
        
      case LearningPhase.INDEPENDENT_PRACTICE:
        return masteryRate >= 0.8 && correctAttempts >= 3;
        
      case LearningPhase.ASSESSMENT:
        return masteryRate >= 0.85 && correctAttempts >= 2;
        
      default:
        return false;
    }
  }

  public static detectPrerequisiteGap(
    consecutiveErrors: number,
    errorTypes: string[],
    skillName: string
  ): string | null {
    if (consecutiveErrors >= 3) {
      // Check for common prerequisite gaps
      const prerequisiteMap: Record<string, string> = {
        'linear_equations': 'basic_algebra',
        'quadratic_equations': 'linear_equations',
        'functions': 'coordinate_system',
        'trigonometry': 'geometry_basics'
      };

      return prerequisiteMap[skillName] || 'basic_operations';
    }
    return null;
  }

  public static generateEngagementRecovery(
    frustrationLevel: number,
    engagementLevel: number
  ): string {
    if (frustrationLevel > 80) {
      return 'confidence_building'; // Very easy task to rebuild confidence
    } else if (engagementLevel < 30) {
      return 'gamification'; // Add game-like elements
    } else if (frustrationLevel > 60) {
      return 'collaborative'; // Suggest peer discussion
    }
    return 'standard';
  }

  public static getScaffoldingPrompt(
    phase: LearningPhase,
    difficulty: DifficultyLevel,
    studentModel: StudentModel,
    skillName: string
  ): string {
    const basePrompts = {
      [LearningPhase.THEORY]: `Wyjaśnij teorię dla "${skillName}" w sposób ${studentModel.preferredExplanationStyle}. Poziom: ${difficulty}/7.`,
      
      [LearningPhase.EXAMPLE]: `Pokaż przykład rozwiązania dla "${skillName}". Poziom: ${difficulty}/7. Wyjaśnij każdy krok.`,
      
      [LearningPhase.GUIDED_PRACTICE]: `Stwórz zadanie z wskazówkami dla "${skillName}". Poziom: ${difficulty}/7. Student ma pewność: ${studentModel.confidence}%.`,
      
      [LearningPhase.INDEPENDENT_PRACTICE]: `Stwórz zadanie do samodzielnego rozwiązania dla "${skillName}". Poziom: ${difficulty}/7.`,
      
      [LearningPhase.ASSESSMENT]: `Stwórz zadanie sprawdzające dla "${skillName}". Poziom: ${difficulty}/7. Bez wskazówek.`
    };

    let prompt = basePrompts[phase];

    // Add adaptations based on student model
    if (studentModel.frustrationLevel > 70) {
      prompt += " WAŻNE: Student jest sfrustrowany - użyj zachęcających słów i prostsze przykłady.";
    }

    if (studentModel.speedVsAccuracy === 'speed_focused') {
      prompt += " Student preferuje szybsze tempo - krótsze wyjaśnienia.";
    } else if (studentModel.speedVsAccuracy === 'accuracy_focused') {
      prompt += " Student preferuje dokładność - dokładne wyjaśnienia kroków.";
    }

    return prompt;
  }

  public static createLearningPath(skillName: string): LearningPathStep[] {
    return [
      {
        phase: LearningPhase.THEORY,
        difficulty: DifficultyLevel.VERY_EASY,
        requiredMastery: 50,
        maxAttempts: 2
      },
      {
        phase: LearningPhase.EXAMPLE,
        difficulty: DifficultyLevel.EASY,
        requiredMastery: 60,
        maxAttempts: 3
      },
      {
        phase: LearningPhase.GUIDED_PRACTICE,
        difficulty: DifficultyLevel.MEDIUM_EASY,
        requiredMastery: 70,
        maxAttempts: 5
      },
      {
        phase: LearningPhase.INDEPENDENT_PRACTICE,
        difficulty: DifficultyLevel.MEDIUM,
        requiredMastery: 80,
        maxAttempts: 7
      },
      {
        phase: LearningPhase.ASSESSMENT,
        difficulty: DifficultyLevel.MEDIUM_HARD,
        requiredMastery: 85,
        maxAttempts: 3
      }
    ];
  }
}