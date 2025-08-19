import { UniversalAnswerValidator } from './UniversalAnswerValidator';
import { TaskDefinition, ValidationResult } from './UniversalInterfaces';
import { supabase } from '@/integrations/supabase/client';

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
   * Log validation for learning analytics
   */
  private async logValidation(result: ValidationResult, context: any): Promise<void> {
    if (!context.userId) return;

    try {
      await supabase.from('validation_logs').insert({
        user_id: context.userId,
        session_type: context.sessionType,
        is_correct: result.isCorrect,
        confidence: result.confidence,
        detected_misconception: result.detectedMisconception,
        response_time: context.responseTime,
        hints_used: context.hints_used,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to log validation:', error);
    }
  }

  /**
   * Get validation statistics for user
   */
  public async getValidationStats(userId: string, days: number = 7): Promise<{
    accuracy: number;
    avgConfidence: number;
    commonMisconceptions: string[];
    improvement: number;
  }> {
    try {
      const { data, error } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const logs = data || [];
      const accuracy = logs.length > 0 ? logs.filter(l => l.is_correct).length / logs.length : 0;
      const avgConfidence = logs.length > 0 ? logs.reduce((sum, l) => sum + l.confidence, 0) / logs.length : 0;
      
      const misconceptions = logs
        .filter(l => l.detected_misconception)
        .map(l => l.detected_misconception)
        .reduce((acc: Record<string, number>, mc: string) => {
          acc[mc] = (acc[mc] || 0) + 1;
          return acc;
        }, {});

      const commonMisconceptions = Object.entries(misconceptions)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([mc]) => mc);

      // Calculate improvement (recent vs older performance)
      const half = Math.floor(logs.length / 2);
      const recentAccuracy = half > 0 ? logs.slice(0, half).filter(l => l.is_correct).length / half : 0;
      const olderAccuracy = half > 0 ? logs.slice(half).filter(l => l.is_correct).length / (logs.length - half) : 0;
      const improvement = recentAccuracy - olderAccuracy;

      return {
        accuracy,
        avgConfidence,
        commonMisconceptions,
        improvement
      };
    } catch (error) {
      console.error('Error getting validation stats:', error);
      return {
        accuracy: 0,
        avgConfidence: 0,
        commonMisconceptions: [],
        improvement: 0
      };
    }
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