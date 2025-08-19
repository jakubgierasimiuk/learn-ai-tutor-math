import { supabase } from '@/integrations/supabase/client';

interface SimplifiedLearningState {
  cognitiveLoad: number;
  masteryLevel: number;
  nextAction: string;
  difficulty: number;
}

export class SimplifiedLearningEngine {
  private static instance: SimplifiedLearningEngine;

  static getInstance(): SimplifiedLearningEngine {
    if (!SimplifiedLearningEngine.instance) {
      SimplifiedLearningEngine.instance = new SimplifiedLearningEngine();
    }
    return SimplifiedLearningEngine.instance;
  }

  async processLearning(userId: string, context: any): Promise<SimplifiedLearningState> {
    try {
      // Get recent performance from validation logs
      const { data: recentLogs } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      const logs = recentLogs || [];
      
      // Calculate simplified metrics
      const accuracy = logs.length > 0 
        ? logs.filter(log => log.is_correct).length / logs.length 
        : 0.5;
      
      const avgConfidence = logs.length > 0
        ? logs.reduce((sum, log) => sum + (log.confidence || 0.5), 0) / logs.length
        : 0.5;

      const cognitiveLoad = this.calculateCognitiveLoad(context, accuracy);
      const masteryLevel = this.calculateMastery(accuracy, avgConfidence);
      const difficulty = this.calculateDifficulty(cognitiveLoad, masteryLevel);
      const nextAction = this.determineAction(cognitiveLoad, masteryLevel, accuracy);

      return {
        cognitiveLoad,
        masteryLevel,
        nextAction,
        difficulty
      };
    } catch (error) {
      console.error('Error in simplified learning engine:', error);
      return {
        cognitiveLoad: 0.6,
        masteryLevel: 0.5,
        nextAction: 'continue',
        difficulty: 5
      };
    }
  }

  private calculateCognitiveLoad(context: any, accuracy: number): number {
    let load = 0.5;
    
    if (context.responseTime > 30000) load += 0.2;
    if (context.hintsUsed > 1) load += 0.1;
    if (accuracy < 0.6) load += 0.2;
    
    return Math.min(Math.max(load, 0), 1);
  }

  private calculateMastery(accuracy: number, confidence: number): number {
    return (accuracy * 0.7 + confidence * 0.3);
  }

  private calculateDifficulty(cognitiveLoad: number, masteryLevel: number): number {
    let difficulty = 5;
    
    if (cognitiveLoad > 0.8) difficulty -= 2;
    else if (cognitiveLoad < 0.4) difficulty += 1;
    
    if (masteryLevel > 0.8) difficulty += 1;
    else if (masteryLevel < 0.4) difficulty -= 1;
    
    return Math.max(1, Math.min(10, Math.round(difficulty)));
  }

  private determineAction(cognitiveLoad: number, masteryLevel: number, accuracy: number): string {
    if (cognitiveLoad > 0.8) return 'reduce_difficulty';
    if (masteryLevel > 0.9) return 'advance_topic';
    if (accuracy < 0.4) return 'review_basics';
    return 'continue_learning';
  }
}