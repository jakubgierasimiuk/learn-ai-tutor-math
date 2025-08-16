// Mathematical validation and answer parsing utility
// Phase 1: System Weryfikacji Matematycznej

import { MathValidationResult, MathContext } from './UniversalInterfaces';
import { UniversalAnswerValidator } from './UniversalAnswerValidator';

const universalValidator = new UniversalAnswerValidator();

/**
 * Normalizes mathematical answers to handle different valid formats
 */
export function normalizeAnswer(answer: string): string {
  if (!answer) return '';
  
  return answer
    .trim()
    .toLowerCase()
    // Remove extra whitespace
    .replace(/\s+/g, ' ')
    // Normalize fractions
    .replace(/(\d+)\s*\/\s*(\d+)/g, '$1/$2')
    // Normalize decimals
    .replace(/,/g, '.')
    // Normalize equations
    .replace(/\s*=\s*/g, '=')
    // Normalize sets
    .replace(/\{\s*/g, '{')
    .replace(/\s*\}/g, '}')
    // Normalize common mathematical expressions
    .replace(/\s*\+\s*/g, '+')
    .replace(/\s*-\s*/g, '-')
    .replace(/\s*\*\s*/g, '*')
    .replace(/\s*\^\s*/g, '^')
    // Remove redundant parentheses around single numbers
    .replace(/^\(([^()]+)\)$/, '$1');
}

/**
 * Checks if two mathematical answers are equivalent
 */
export function areAnswersEquivalent(userAnswer: string, expectedAnswer: string): boolean {
  const normalized1 = normalizeAnswer(userAnswer);
  const normalized2 = normalizeAnswer(expectedAnswer);
  
  if (normalized1 === normalized2) return true;
  
  // Check numerical equivalence for different formats
  const num1 = parseFloat(normalized1);
  const num2 = parseFloat(normalized2);
  
  if (!isNaN(num1) && !isNaN(num2)) {
    return Math.abs(num1 - num2) < 0.0001;
  }
  
  // Check fraction equivalence
  const fraction1 = parseFraction(normalized1);
  const fraction2 = parseFraction(normalized2);
  
  if (fraction1 && fraction2) {
    return Math.abs(fraction1 - fraction2) < 0.0001;
  }
  
  // Check set equivalence (for equations with multiple solutions)
  if (normalized1.includes('{') && normalized2.includes('{')) {
    return areSetsEquivalent(normalized1, normalized2);
  }
  
  return false;
}

/**
 * Parses a fraction string to decimal
 */
function parseFraction(str: string): number | null {
  const match = str.match(/^(-?\d+)\/(\d+)$/);
  if (!match) return null;
  
  const numerator = parseInt(match[1]);
  const denominator = parseInt(match[2]);
  
  if (denominator === 0) return null;
  return numerator / denominator;
}

/**
 * Checks if two sets are equivalent (ignoring order)
 */
function areSetsEquivalent(set1: string, set2: string): boolean {
  const extract = (s: string) => {
    const match = s.match(/\{([^}]+)\}/);
    if (!match) return [];
    return match[1].split(/[,;]/).map(x => normalizeAnswer(x.trim()));
  };
  
  const items1 = extract(set1).sort();
  const items2 = extract(set2).sort();
  
  if (items1.length !== items2.length) return false;
  
  return items1.every((item, index) => areAnswersEquivalent(item, items2[index]));
}

/**
 * Validates a mathematical answer in context
 */
export function validateMathAnswer(
  userAnswer: string,
  expectedAnswer: string,
  context: MathContext
): MathValidationResult {
  // Use the universal validator for enhanced validation
  const result = universalValidator.validateAnswer(userAnswer, {
    id: 'legacy',
    department: 'unknown',
    skillName: 'Legacy Validation',
    microSkill: 'unknown',
    difficulty: 1,
    latex: '',
    expectedAnswer,
    misconceptionMap: {}
  });

  // Legacy compatibility - convert to old format expectations
  let errorType: 'computation' | 'method' | 'format' | 'unknown' | undefined;
  
  if (!result.isCorrect && context.expectedAnswerType === 'number') {
    const userNum = parseFloat(normalizeAnswer(userAnswer));
    const expectedNum = parseFloat(normalizeAnswer(expectedAnswer));
    
    if (!isNaN(userNum) && !isNaN(expectedNum)) {
      const diff = Math.abs(userNum - expectedNum);
      const relativeDiff = diff / Math.abs(expectedNum);
      
      if (relativeDiff < 0.1) {
        errorType = 'computation';
      } else {
        errorType = 'method';
      }
    } else if (isNaN(userNum)) {
      errorType = 'format';
    } else {
      errorType = 'unknown';
    }
  }

  return {
    isCorrect: result.isCorrect,
    normalizedAnswer: result.normalizedAnswer,
    confidence: result.confidence,
    detectedMisconception: result.detectedMisconception,
    feedback: result.feedback || (errorType === 'computation' ? "Bliska odpowiedź - sprawdź obliczenia" :
                                  errorType === 'method' ? "Inne podejście może być potrzebne" :
                                  errorType === 'format' ? "Odpowiedź powinna być liczbą" : undefined)
  };
}

/**
 * Detects if user needs prerequisite knowledge
 */
export function detectPrerequisiteGaps(userAnswer: string, context: MathContext): string[] {
  const gaps: string[] = [];
  const answer = userAnswer.toLowerCase();
  
  // Common gaps in mathematical understanding
  if (answer.includes('nie wiem') || answer.includes('nie rozumiem')) {
    gaps.push('conceptual_understanding');
  }
  
  if (answer.includes('jak przenosić') || answer.includes('przenoszenie')) {
    gaps.push('equation_manipulation');
  }
  
  if (answer.includes('wspólny mianownik') || answer.includes('ułamki')) {
    gaps.push('fraction_operations');
  }
  
  if (answer.includes('delta') || answer.includes('√')) {
    gaps.push('quadratic_formulas');
  }
  
  return gaps;
}

/**
 * Suggests next difficulty level based on performance
 */
export function suggestDifficultyAdjustment(
  responseTime: number,
  isCorrect: boolean,
  confidence: number,
  stepNumber: number
): 'increase' | 'maintain' | 'decrease' | 'prerequisite_needed' {
  // Quick correct answer (< 10 seconds) = too easy
  if (isCorrect && responseTime < 10000 && confidence > 0.9) {
    return stepNumber > 3 ? 'increase' : 'maintain';
  }
  
  // Slow but correct = good difficulty
  if (isCorrect && responseTime > 30000) {
    return 'maintain';
  }
  
  // Incorrect with low confidence = need prerequisites
  if (!isCorrect && confidence < 0.3) {
    return 'prerequisite_needed';
  }
  
  // Incorrect but close = maintain or slightly decrease
  if (!isCorrect && confidence > 0.7) {
    return 'maintain';
  }
  
  return 'decrease';
}