import { TaskDefinition } from './UniversalInterfaces';

export class UniversalAnswerValidator {
  // Parse a numeric string (including fractions) to a number
  private parseNumericString(str: string): number | null {
    let s = str.trim();
    if (s === '') return null;
    // Handle fraction pattern
    const fractionMatch = s.match(/^(-?\\d+\\.?\\d*)\/(\d+\\.?\d*)$/);
    if (fractionMatch) {
      const numerator = parseFloat(fractionMatch[1]);
      const denominator = parseFloat(fractionMatch[2]);
      if (isNaN(numerator) || isNaN(denominator) || denominator === 0) return null;
      return numerator / denominator;
    }
    // Otherwise parse as float
    const val = parseFloat(s);
    if (isNaN(val)) return null;
    return val;
  }

  public validateNumericAnswer(userAnswer: string, expected: number, tolerance: number = 1e-9): boolean {
    const userVal = this.parseNumericString(userAnswer);
    if (userVal === null) return false;
    return Math.abs(userVal - expected) <= tolerance;
  }

  public validateFormulaAnswer(userAnswer: string, expected: string): boolean {
    const normalize = (s: string) => s.replace(/\s+/g, '');
    return normalize(userAnswer) === normalize(expected);
  }

  public validateEquationAnswer(userAnswer: string, expected: string[]): boolean {
    // Extract numeric tokens from user answer
    const tokens = userAnswer.replace(/(lub|or)/gi, ' ').split(/[^0-9\\.\\/-]+/).filter(t => t !== '');
    const userVals: number[] = [];
    for (const token of tokens) {
      const val = this.parseNumericString(token);
      if (val !== null) userVals.push(val);
    }
    const expectedVals: number[] = [];
    for (const exp of expected) {
      const val = this.parseNumericString(exp);
      if (val !== null) expectedVals.push(val);
    }
    if (userVals.length !== expectedVals.length || expectedVals.length === 0) {
      return false;
    }
    userVals.sort((a, b) => a - b);
    expectedVals.sort((a, b) => a - b);
    const tolerance = 1e-6;
    for (let i = 0; i < expectedVals.length; i++) {
      if (Math.abs(userVals[i] - expectedVals[i]) > tolerance) {
        return false;
      }
    }
    return true;
  }

  public detectDepartmentMisconception(department: string, userAnswer: string, task: TaskDefinition): string | null {
    const ansTrimmed = userAnswer.trim();
    for (const [wrongAns, info] of Object.entries(task.misconceptionMap)) {
      const key = wrongAns.trim();
      if (key === '') continue;
      const keyNum = this.parseNumericString(key);
      const userNum = this.parseNumericString(ansTrimmed);
      if (keyNum !== null && userNum !== null) {
        if (Math.abs(userNum - keyNum) < 1e-9) {
          return info.type;
        }
      } else {
        const normalize = (s: string) => s.replace(/\s+/g, '').toLowerCase();
        if (normalize(ansTrimmed) === normalize(key)) {
          return info.type;
        }
      }
    }
    return null;
  }

  public validateAnswer(userAnswer: string, task: TaskDefinition): {
    isCorrect: boolean;
    confidence: number;
    detectedMisconception?: string;
    feedback?: string;
  } {
    const normalizedUser = userAnswer.trim();
    const normalizedExpected = task.expectedAnswer.trim();
    
    // Try different validation methods
    let isCorrect = false;
    
    // Direct string match
    if (normalizedUser.toLowerCase() === normalizedExpected.toLowerCase()) {
      isCorrect = true;
    }
    
    // Numeric validation
    if (!isCorrect) {
      const expectedNum = this.parseNumericString(normalizedExpected);
      if (expectedNum !== null) {
        isCorrect = this.validateNumericAnswer(normalizedUser, expectedNum);
      }
    }
    
    // Formula validation
    if (!isCorrect) {
      isCorrect = this.validateFormulaAnswer(normalizedUser, normalizedExpected);
    }
    
    const result = {
      isCorrect,
      confidence: isCorrect ? 0.95 : 0.3,
      detectedMisconception: undefined as string | undefined,
      feedback: undefined as string | undefined
    };
    
    // Detect misconceptions if answer is wrong
    if (!isCorrect) {
      const misconception = this.detectDepartmentMisconception(task.department, normalizedUser, task);
      if (misconception) {
        result.detectedMisconception = misconception;
        result.confidence = 0.8;
        // Find feedback
        for (const [wrongAns, info] of Object.entries(task.misconceptionMap)) {
          if (info.type === misconception) {
            result.feedback = info.feedback;
            break;
          }
        }
      }
    }
    
    return result;
  }
}
