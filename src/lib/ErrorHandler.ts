import { supabase } from '@/integrations/supabase/client';

/**
 * Enhanced Error Handler with recovery strategies
 */
export class ErrorHandler {
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 1000;

  /**
   * Handle errors with automatic retry and fallback strategies
   */
  public static async handleWithRetry<T>(
    operation: () => Promise<T>,
    fallback: () => T,
    context: string
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.error(`${context} failed (attempt ${attempt}/${this.MAX_RETRIES}):`, error);
        
        // Log error to database for analysis
        this.logError(error as Error, context, attempt);
        
        if (attempt < this.MAX_RETRIES) {
          await this.delay(this.RETRY_DELAY * attempt);
        }
      }
    }
    
    console.warn(`${context} failed after ${this.MAX_RETRIES} attempts, using fallback`);
    return fallback();
  }

  /**
   * Handle database operations with specific recovery
   */
  public static async handleDatabaseOperation<T>(
    operation: () => Promise<{ data: T | null; error: any }>,
    fallback: T,
    context: string
  ): Promise<T> {
    try {
      const result = await operation();
      
      if (result.error) {
        console.error(`Database error in ${context}:`, result.error);
        this.logError(new Error(result.error.message), context, 1);
        return fallback;
      }
      
      if (result.data === null) {
        console.warn(`No data returned from ${context}, using fallback`);
        return fallback;
      }
      
      return result.data;
    } catch (error) {
      console.error(`Database operation failed in ${context}:`, error);
      this.logError(error as Error, context, 1);
      return fallback;
    }
  }

  /**
   * Log errors to database for monitoring
   */
  private static async logError(error: Error, context: string, attempt: number): Promise<void> {
    try {
      await supabase.from('app_error_logs').insert({
        message: error.message,
        stack: error.stack,
        location: context,
        source: 'unified_system',
        payload: { attempt, timestamp: new Date().toISOString() }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
  }

  /**
   * Delay helper for retries
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handle validation errors specifically
   */
  public static handleValidationError(error: Error, userAnswer: string, taskId: string): {
    isCorrect: boolean;
    confidence: number;
    feedback: string;
  } {
    console.error('Validation error:', error);
    this.logError(error, `validation_${taskId}`, 1);
    
    return {
      isCorrect: false,
      confidence: 0.0,
      feedback: 'Wystąpił błąd podczas sprawdzania odpowiedzi. Spróbuj ponownie.'
    };
  }

  /**
   * Handle task generation errors
   */
  public static handleTaskGenerationError(error: Error, department: string, difficulty: number): any {
    console.error('Task generation error:', error);
    this.logError(error, `task_generation_${department}`, 1);
    
    // Return a simple fallback task
    return {
      id: `fallback_${Date.now()}`,
      department,
      skillName: 'Podstawowe zadanie',
      microSkill: 'default',
      difficulty: Math.max(1, Math.min(10, difficulty)),
      latex: 'Rozwiąż: $2 + 2 = ?$',
      expectedAnswer: '4',
      misconceptionMap: {}
    };
  }
}