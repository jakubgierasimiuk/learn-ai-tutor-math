import { supabase } from '@/integrations/supabase/client';

interface LearningContext {
  userId: string;
  currentSkill?: string;
  department?: string;
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  hintsUsed?: number;
  confidence?: number;
}

interface CognitiveState {
  currentLoad: number;
  optimalLoad: number;
  optimalDifficulty: number;
  recommendedLoad: number;
  flowStateProbability: number;
  adaptationStrategy: string;
}

export class LearningVelocityEngine {
  private static instance: LearningVelocityEngine;

  static getInstance(): LearningVelocityEngine {
    if (!LearningVelocityEngine.instance) {
      LearningVelocityEngine.instance = new LearningVelocityEngine();
    }
    return LearningVelocityEngine.instance;
  }

  async optimizeCognitiveLoad(userId: string, context: LearningContext): Promise<CognitiveState> {
    try {
      // Use existing validation logs as cognitive load proxy
      const { data: loadData } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Calculate cognitive load factors
      const currentLoad = this.calculateCurrentLoad(context, loadData);
      const optimalLoad = this.calculateOptimalLoad(userId, loadData);
      const flowStateProbability = this.calculateFlowState(currentLoad, optimalLoad, context);

      // Determine optimal difficulty and adaptation strategy
      const optimalDifficulty = this.calculateOptimalDifficulty(currentLoad, optimalLoad, context);
      const adaptationStrategy = this.determineAdaptationStrategy(currentLoad, optimalLoad, flowStateProbability);

      const cognitiveState: CognitiveState = {
        currentLoad,
        optimalLoad,
        optimalDifficulty,
        recommendedLoad: optimalLoad,
        flowStateProbability,
        adaptationStrategy
      };

      // Store updated cognitive load data
      await this.updateCognitiveLoad(userId, {
        currentLoad,
        optimalLoad,
        factors: {
          responseTime: context.responseTime,
          hintsUsed: context.hintsUsed,
          isCorrect: context.isCorrect,
          confidence: context.confidence
        }
      });

      return cognitiveState;
    } catch (error) {
      console.error('Error optimizing cognitive load:', error);
      return {
        currentLoad: 0.6,
        optimalLoad: 0.7,
        optimalDifficulty: 5,
        recommendedLoad: 0.7,
        flowStateProbability: 0.5,
        adaptationStrategy: 'maintain'
      };
    }
  }

  private calculateCurrentLoad(context: LearningContext, loadData: any): number {
    // Base load calculation
    let load = 0.5;

    // Adjust based on response time
    if (context.responseTime) {
      const normalizedTime = Math.min(context.responseTime / 60000, 1); // Normalize to 1 minute
      load += normalizedTime * 0.3;
    }

    // Adjust based on hints used
    if (context.hintsUsed) {
      load += context.hintsUsed * 0.1;
    }

    // Adjust based on correctness
    if (context.isCorrect === false) {
      load += 0.2;
    }

    // Use historical data if available
    if (loadData?.current_load) {
      load = (load + loadData.current_load) / 2;
    }

    return Math.min(Math.max(load, 0), 1);
  }

  private calculateOptimalLoad(userId: string, loadData: any): number {
    // Start with default optimal load
    let optimalLoad = 0.7;

    // Adjust based on user's historical performance
    if (loadData?.optimal_load) {
      optimalLoad = loadData.optimal_load;
    }

    return optimalLoad;
  }

  private calculateFlowState(currentLoad: number, optimalLoad: number, context: LearningContext): number {
    // Flow state occurs when current load is close to optimal load
    const loadDifference = Math.abs(currentLoad - optimalLoad);
    let flowProbability = Math.max(0, 1 - (loadDifference * 2));

    // Boost flow state if user is performing well
    if (context.isCorrect && context.confidence && context.confidence > 0.7) {
      flowProbability *= 1.2;
    }

    // Reduce flow state if struggling
    if (context.hintsUsed && context.hintsUsed > 2) {
      flowProbability *= 0.7;
    }

    return Math.min(flowProbability, 1);
  }

  private calculateOptimalDifficulty(currentLoad: number, optimalLoad: number, context: LearningContext): number {
    // Base difficulty (1-10 scale)
    let difficulty = 5;

    // Adjust based on cognitive load
    const loadRatio = currentLoad / optimalLoad;
    if (loadRatio > 1.2) {
      difficulty = Math.max(difficulty - 2, 1);
    } else if (loadRatio < 0.8) {
      difficulty = Math.min(difficulty + 1, 10);
    }

    // Adjust based on recent performance
    if (context.isCorrect === true && context.confidence && context.confidence > 0.8) {
      difficulty = Math.min(difficulty + 0.5, 10);
    } else if (context.isCorrect === false) {
      difficulty = Math.max(difficulty - 0.5, 1);
    }

    return Math.round(difficulty);
  }

  private determineAdaptationStrategy(currentLoad: number, optimalLoad: number, flowState: number): string {
    if (flowState > 0.7) {
      return 'maintain_flow';
    } else if (currentLoad > optimalLoad * 1.3) {
      return 'reduce_load';
    } else if (currentLoad < optimalLoad * 0.7) {
      return 'increase_challenge';
    } else {
      return 'gradual_adjustment';
    }
  }

  private async updateCognitiveLoad(userId: string, loadData: any): Promise<void> {
    // Store cognitive load insights in validation logs for now
    try {
      await supabase
        .from('validation_logs')
        .insert({
          user_id: userId,
          session_type: 'cognitive_load_update',
          is_correct: true,
          confidence: loadData.currentLoad,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating cognitive load:', error);
    }
  }
}