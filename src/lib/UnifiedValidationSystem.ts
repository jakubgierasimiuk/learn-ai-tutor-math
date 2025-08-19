import { UniversalAnswerValidator } from './UniversalAnswerValidator';
import { TaskDefinition, ValidationResult } from './UniversalInterfaces';

/**
 * Unified Validation System - Central validation for AI Chat and Study & Learn
 */
export class UnifiedValidationSystem {
  private validator = new UniversalAnswerValidator();
  private validationCache = new Map<string, ValidationResult>();

  /**
   * Validate answer with caching and enhanced feedback
   */
  public async validateAnswer(
    userAnswer: string,
    task: TaskDefinition,
    context: {
      userId?: string;
      sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
      responseTime?: number;
      hints_used?: number;
    }
  ): Promise<ValidationResult & {
    pedagogicalFeedback?: string;
    nextRecommendation?: string;
    confidenceLevel?: number;
  }> {
    // Create cache key
    const cacheKey = `${task.id}_${userAnswer.toLowerCase().trim()}`;
    
    // Check cache first
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey)!;
      return {
        ...cached,
        pedagogicalFeedback: await this.generatePedagogicalFeedback(cached, context),
        nextRecommendation: this.getNextRecommendation(cached, context)
      };
    }

    // Perform validation
    const result = this.validator.validateAnswer(userAnswer, task);
    
    // Cache result
    this.validationCache.set(cacheKey, result);

    // Enhanced result with pedagogical context
    const enhancedResult = {
      ...result,
      pedagogicalFeedback: await this.generatePedagogicalFeedback(result, context),
      nextRecommendation: this.getNextRecommendation(result, context),
      confidenceLevel: this.calculateConfidenceLevel(result, context)
    };

    // Log validation for analytics (async, don't wait)
    this.logValidation(result, context);

    return enhancedResult;
  }

  /**
   * Generate context-aware pedagogical feedback
   */
  private async generatePedagogicalFeedback(
    result: ValidationResult, 
    context: any
  ): Promise<string> {
    if (result.isCorrect) {
      if (context.responseTime && context.responseTime < 5000) {
        return "Świetnie! Szybka i prawidłowa odpowiedź.";
      } else if (context.hints_used && context.hints_used > 0) {
        return "Dobrze! Udało Ci się z pomocą podpowiedzi.";
      } else {
        return "Bardzo dobrze! Prawidłowa odpowiedź.";
      }
    } else {
      if (result.detectedMisconception) {
        return `Widzę błąd konceptualny: ${result.detectedMisconception}. Sprawdźmy to jeszcze raz.`;
      } else if (result.confidence > 0.7) {
        return "Blisko! Sprawdź swoje obliczenia krok po kroku.";
      } else {
        return "Nie martw się, to trudne zadanie. Spróbujmy razem.";
      }
    }
  }

  /**
   * Get next learning recommendation
   */
  private getNextRecommendation(result: ValidationResult, context: any): string {
    if (result.isCorrect && result.confidence > 0.8) {
      return context.sessionType === 'ai_chat' ? 'increase_difficulty' : 'advance_phase';
    } else if (!result.isCorrect && result.confidence < 0.3) {
      return context.sessionType === 'ai_chat' ? 'provide_tutorial' : 'review_basics';
    } else {
      return context.sessionType === 'ai_chat' ? 'similar_practice' : 'continue_phase';
    }
  }

  /**
   * Calculate confidence level in user's understanding
   */
  private calculateConfidenceLevel(result: ValidationResult, context: any): number {
    let confidence = result.confidence;
    
    // Adjust for response time
    if (context.responseTime) {
      if (context.responseTime < 3000) confidence += 0.1; // Quick response
      if (context.responseTime > 30000) confidence -= 0.1; // Very slow
    }

    // Adjust for hint usage
    if (context.hints_used) {
      confidence -= context.hints_used * 0.05;
    }

    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Log validation for learning analytics (simplified for now)
   */
  private async logValidation(result: ValidationResult, context: any): Promise<void> {
    // Simplified logging - will be enhanced once database types are updated
    console.log('Validation logged:', {
      userId: context.userId,
      sessionType: context.sessionType,
      isCorrect: result.isCorrect,
      confidence: result.confidence
    });
  }

  /**
   * Get validation statistics for user (simplified for now)
   */
  public async getValidationStats(userId: string, days: number = 7): Promise<{
    accuracy: number;
    avgConfidence: number;
    commonMisconceptions: string[];
    improvement: number;
  }> {
    // Simplified stats - will be enhanced once database types are updated
    return {
      accuracy: 0.8,
      avgConfidence: 0.7,
      commonMisconceptions: [],
      improvement: 0.1
    };
  }

  /**
   * Clear validation cache
   */
  public clearCache(): void {
    this.validationCache.clear();
  }

  /**
   * Get cache size for debugging
   */
  public getCacheSize(): number {
    return this.validationCache.size;
  }
}

// Singleton instance
export const unifiedValidation = new UnifiedValidationSystem();