// Mathematical Error Classification for Pedagogical Response
export enum MathErrorType {
  CALCULATION = 'calculation', // Arithmetic mistakes (2+3=6)
  CONCEPTUAL = 'conceptual', // Misunderstanding concepts (-(x-3) = -x-3)
  PROCEDURAL = 'procedural', // Wrong method/steps
  CARELESS = 'careless', // Simple oversight, knows the concept
  INCOMPLETE = 'incomplete', // Partial work, on right track
  SYNTAX = 'syntax' // LaTeX/notation issues
}

export interface MathError {
  type: MathErrorType;
  description: string;
  pedagogicalResponse: string;
  difficultyAdjustment: number;
  requiresIntervention: boolean;
}

export interface CommonMisconception {
  pattern: string;
  description: string;
  correctiveStrategy: string;
  examples: string[];
}

export class MathErrorClassifier {
  private static commonMisconceptions: Record<string, CommonMisconception[]> = {
    'linear_equations': [
      {
        pattern: 'negative_distribution',
        description: 'Students think -(x-3) = -x-3 instead of -x+3',
        correctiveStrategy: 'Show distribution step by step with visual model',
        examples: ['-(x-3)', '-(2x-5)', '-(a+b)']
      },
      {
        pattern: 'isolation_confusion',
        description: 'Adding instead of subtracting to isolate variable',
        correctiveStrategy: 'Use balance scale analogy',
        examples: ['x+5=10', '2x-3=7']
      }
    ],
    'quadratic_equations': [
      {
        pattern: 'square_root_sign',
        description: 'Forgetting ± when taking square roots',
        correctiveStrategy: 'Emphasize both positive and negative solutions',
        examples: ['x²=16', 'x²=25']
      }
    ]
  };

  public static classifyError(
    userAnswer: string,
    expectedAnswer: string,
    skillName: string,
    responseTime: number
  ): MathError {
    // Quick response suggests careless error
    if (responseTime < 10000 && this.isNearCorrect(userAnswer, expectedAnswer)) {
      return {
        type: MathErrorType.CARELESS,
        description: 'Szybka odpowiedź z małym błędem',
        pedagogicalResponse: 'Sprawdź jeszcze raz swoje obliczenia. Jesteś bardzo blisko!',
        difficultyAdjustment: -0.2,
        requiresIntervention: false
      };
    }

    // Check for common misconceptions
    const misconception = this.detectMisconception(userAnswer, expectedAnswer, skillName);
    if (misconception) {
      return {
        type: MathErrorType.CONCEPTUAL,
        description: misconception.description,
        pedagogicalResponse: misconception.correctiveStrategy,
        difficultyAdjustment: -0.5,
        requiresIntervention: true
      };
    }

    // Check for calculation errors
    if (this.hasCorrectMethod(userAnswer, expectedAnswer)) {
      return {
        type: MathErrorType.CALCULATION,
        description: 'Poprawna metoda, błąd w obliczeniach',
        pedagogicalResponse: 'Dobra metoda! Sprawdź swoje obliczenia krok po kroku.',
        difficultyAdjustment: -0.3,
        requiresIntervention: false
      };
    }

    // Check for procedural errors
    if (this.hasWrongMethod(userAnswer)) {
      return {
        type: MathErrorType.PROCEDURAL,
        description: 'Niepoprawna metoda rozwiązania',
        pedagogicalResponse: 'Spróbujmy inną metodę. Pokażę Ci krok po kroku.',
        difficultyAdjustment: -0.8,
        requiresIntervention: true
      };
    }

    // Default classification
    return {
      type: MathErrorType.CONCEPTUAL,
      description: 'Błąd wymagający wyjaśnienia koncepcji',
      pedagogicalResponse: 'Wróćmy do podstaw tego zagadnienia.',
      difficultyAdjustment: -0.7,
      requiresIntervention: true
    };
  }

  private static detectMisconception(
    userAnswer: string,
    expectedAnswer: string,
    skillName: string
  ): CommonMisconception | null {
    const misconceptions = this.commonMisconceptions[skillName] || [];
    
    for (const misconception of misconceptions) {
      if (this.matchesMisconceptionPattern(userAnswer, misconception)) {
        return misconception;
      }
    }
    return null;
  }

  private static matchesMisconceptionPattern(
    userAnswer: string,
    misconception: CommonMisconception
  ): boolean {
    // Simple pattern matching - could be enhanced with more sophisticated logic
    switch (misconception.pattern) {
      case 'negative_distribution':
        return userAnswer.includes('-x-') || userAnswer.includes('- x -');
      case 'isolation_confusion':
        return false; // Would need more context to detect
      case 'square_root_sign':
        return !userAnswer.includes('±') && !userAnswer.includes('lub');
      default:
        return false;
    }
  }

  private static isNearCorrect(userAnswer: string, expectedAnswer: string): boolean {
    // Simple heuristic - in real implementation would use more sophisticated comparison
    const userNum = parseFloat(userAnswer.replace(/[^\d.-]/g, ''));
    const expectedNum = parseFloat(expectedAnswer.replace(/[^\d.-]/g, ''));
    
    if (isNaN(userNum) || isNaN(expectedNum)) return false;
    
    const difference = Math.abs(userNum - expectedNum);
    return difference < Math.abs(expectedNum) * 0.1; // Within 10%
  }

  private static hasCorrectMethod(userAnswer: string, expectedAnswer: string): boolean {
    // Placeholder - would analyze steps/structure
    return userAnswer.length > 5 && userAnswer.includes('=');
  }

  private static hasWrongMethod(userAnswer: string): boolean {
    // Placeholder - would detect completely wrong approaches
    return userAnswer.length < 3 || !userAnswer.includes('=');
  }
}