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
    try {
      if (!context.userId) return;

      const { error } = await supabase
        .from('validation_logs')
        .insert({
          user_id: context.userId,
          session_type: context.sessionType,
          is_correct: result.isCorrect,
          confidence: result.confidence,
          response_time: context.responseTime,
          hints_used: context.hints_used || 0,
          detected_misconception: result.detectedMisconception
        });

      if (error) {
        console.error('Error logging validation:', error);
      }
    } catch (error) {
      console.error('Error in logValidation:', error);
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
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: logs, error } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error || !logs) {
        console.error('Error fetching validation stats:', error);
        return { accuracy: 0, avgConfidence: 0, commonMisconceptions: [], improvement: 0 };
      }

      const accuracy = logs.length > 0 ? 
        logs.filter(log => log.is_correct).length / logs.length : 0;
      
      const avgConfidence = logs.length > 0 ? 
        logs.reduce((sum, log) => sum + (log.confidence || 0), 0) / logs.length : 0;

      const misconceptions = logs
        .filter(log => log.detected_misconception)
        .reduce((acc, log) => {
          const misconception = log.detected_misconception as string;
          acc[misconception] = (acc[misconception] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const commonMisconceptions = Object.entries(misconceptions)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([misconception]) => misconception);

      // Calculate improvement (simplified)
      const recentLogs = logs.slice(0, Math.floor(logs.length / 2));
      const olderLogs = logs.slice(Math.floor(logs.length / 2));
      
      const recentAccuracy = recentLogs.length > 0 ? 
        recentLogs.filter(log => log.is_correct).length / recentLogs.length : 0;
      const olderAccuracy = olderLogs.length > 0 ? 
        olderLogs.filter(log => log.is_correct).length / olderLogs.length : 0;
      
      const improvement = recentAccuracy - olderAccuracy;

      return {
        accuracy,
        avgConfidence,
        commonMisconceptions,
        improvement
      };
    } catch (error) {
      console.error('Error calculating validation stats:', error);
      return { accuracy: 0, avgConfidence: 0, commonMisconceptions: [], improvement: 0 };
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