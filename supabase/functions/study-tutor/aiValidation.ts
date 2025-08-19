// AI Response Validation Functions

export function validateAIResponse(response: string): boolean {
  if (!response || typeof response !== 'string') {
    console.log('[AI Validation] Invalid response type');
    return false;
  }

  // Check minimum response length
  if (response.trim().length < 20) {
    console.log('[AI Validation] Response too short');
    return false;
  }

  // Check for obvious errors or nonsense
  const errorPatterns = [
    /I'm sorry, I can't/i,
    /As an AI/i,
    /I don't have access/i,
    /Unable to process/i,
    /Error occurred/i,
    /^null$/,
    /^undefined$/
  ];

  for (const pattern of errorPatterns) {
    if (pattern.test(response)) {
      console.log('[AI Validation] Response contains error pattern:', pattern);
      return false;
    }
  }

  // Check for mathematical content if it should contain math
  if (response.includes('Zadanie:') || response.includes('zadanie')) {
    const hasLatex = response.includes('$') || response.includes('\\');
    const hasMathTerms = /[+\-*/=(){}[\]0-9x-z]/i.test(response);
    
    if (!hasLatex && !hasMathTerms) {
      console.log('[AI Validation] Math task missing mathematical content');
      return false;
    }
  }

  // Check for proper Polish language structure
  const hasProperStructure = response.includes(':') || response.includes('?') || response.includes('.');
  if (!hasProperStructure) {
    console.log('[AI Validation] Response lacks proper structure');
    return false;
  }

  console.log('[AI Validation] Response passed validation');
  return true;
}

export function extractMathEquation(response: string): string | null {
  // Extract LaTeX math expressions
  const latexMatch = response.match(/\$([^$]+)\$/);
  if (latexMatch) {
    return latexMatch[1];
  }

  // Extract simple equations
  const equationMatch = response.match(/([a-z0-9+\-*/=\s()]+)/i);
  if (equationMatch && equationMatch[1].includes('=')) {
    return equationMatch[1].trim();
  }

  return null;
}