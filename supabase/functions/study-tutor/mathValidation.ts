// Mathematical validation for study-tutor edge function
export interface MathContext {
  currentEquation?: string;
  expectedAnswerType: 'number' | 'equation' | 'expression' | 'set' | 'steps';
  stepNumber: number;
  previousSteps?: string[];
}

export interface AnswerEvaluation {
  isCorrect: boolean;
  confidence: number;
  errorType?: 'computation' | 'method' | 'format' | 'unknown';
  feedback?: string;
  pseudoActivity?: boolean;
}

export function evaluateAnswer(
  userAnswer: string, 
  aiResponse: string,
  context: MathContext
): AnswerEvaluation {
  const lower = userAnswer.toLowerCase().trim();
  const aiLower = aiResponse.toLowerCase();
  
  // Check for pseudo-activity patterns
  const pseudoActivityIndicators = [
    lower.length < 3,
    /^\d+$/.test(lower) && lower.length === 1,
    lower === 'nie wiem' && aiResponse.includes('pierwsz'), // giving up on first question
  ];
  
  const hasPseudoActivity = pseudoActivityIndicators.some(Boolean);
  
  // Enhanced correctness detection from AI response
  const positiveIndicators = [
    'poprawnie', 'dobrze', 'świetnie', 'excellent', 'brawo', 'doskonale',
    'prawidłowo', 'prawidłowa', 'tak to jest', 'zgadza się'
  ];
  
  const negativeIndicators = [
    'niepoprawnie', 'błędnie', 'nie to', 'to nie jest', 'spróbuj ponownie',
    'sprawdź', 'pomyłka', 'błąd', 'nie zgadza', 'nie do końca'
  ];
  
  const hasPositive = positiveIndicators.some(indicator => aiLower.includes(indicator));
  const hasNegative = negativeIndicators.some(indicator => aiLower.includes(indicator));
  
  let isCorrect = false;
  let confidence = 0.5;
  
  if (hasPositive && !hasNegative) {
    isCorrect = true;
    confidence = 0.9;
  } else if (hasNegative && !hasPositive) {
    isCorrect = false;
    confidence = 0.9;
  } else if (aiLower.includes('bliska') || aiLower.includes('prawie')) {
    isCorrect = false;
    confidence = 0.7; // Close answer
  }
  
  // Mathematical validation
  if (context.expectedAnswerType === 'number') {
    const userNum = extractNumber(userAnswer);
    if (userNum !== null) {
      // Try to extract expected number from AI response
      const expectedFromAI = extractExpectedNumber(aiResponse);
      if (expectedFromAI !== null) {
        const isNumCorrect = Math.abs(userNum - expectedFromAI) < 0.0001;
        if (isNumCorrect) {
          isCorrect = true;
          confidence = 1.0;
        }
      }
    }
  }
  
  return {
    isCorrect,
    confidence,
    pseudoActivity: hasPseudoActivity,
    errorType: !isCorrect ? determineErrorType(userAnswer, aiResponse) : undefined
  };
}

function extractNumber(text: string): number | null {
  const cleaned = text.replace(/[^\d.,\-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function extractExpectedNumber(aiResponse: string): number | null {
  // Look for patterns like "prawidłowa odpowiedź to 5" or "wynik to -3"
  const patterns = [
    /(?:odpowiedź|wynik|rezultat)\s+(?:to|wynosi|=)\s*([-+]?\d+(?:[.,]\d+)?)/i,
    /powinn(?:a|o|en)\s+(?:być|wynosić|otrzymać)\s*([-+]?\d+(?:[.,]\d+)?)/i,
    /=\s*([-+]?\d+(?:[.,]\d+)?)/
  ];
  
  for (const pattern of patterns) {
    const match = aiResponse.match(pattern);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(num)) return num;
    }
  }
  
  return null;
}

function determineErrorType(userAnswer: string, aiResponse: string): 'computation' | 'method' | 'format' | 'unknown' {
  const aiLower = aiResponse.toLowerCase();
  
  if (aiLower.includes('obliczeni') || aiLower.includes('rachunk')) {
    return 'computation';
  }
  
  if (aiLower.includes('metod') || aiLower.includes('podejści') || aiLower.includes('sposób')) {
    return 'method';
  }
  
  if (aiLower.includes('format') || aiLower.includes('zapisz') || aiLower.includes('postać')) {
    return 'format';
  }
  
  return 'unknown';
}