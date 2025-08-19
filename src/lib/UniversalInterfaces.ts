export interface TaskGenerationParams {
  department: string;
  difficulty: number;
  microSkill?: string;
  targetMisconception?: string;
}

export interface TaskDefinition {
  id: string;
  department: string;
  skillName: string;
  microSkill: string;
  difficulty: number;
  latex: string;
  expectedAnswer: string;
  misconceptionMap: {
    [incorrectAnswer: string]: {
      type: string;
      feedback: string;
    };
  };
}

export interface MathContext {
  currentEquation?: string;
  expectedAnswerType: 'number' | 'expression' | 'equation_set' | 'equation' | 'set' | 'steps';
  stepNumber: number;
  previousSteps?: string[];
}

export interface MathValidationResult {
  isCorrect: boolean;
  normalizedAnswer: string;
  confidence: number;
  detectedMisconception?: string;
  feedback?: string;
}

// Alias for consistency across the codebase
export type ValidationResult = MathValidationResult;

export class SeededRandom {
  private seed: number;

  constructor(seed: string) {
    this.seed = this.hashString(seed);
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  public nextDouble(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextDouble() * (max - min + 1)) + min;
  }
}