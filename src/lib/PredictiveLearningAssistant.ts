import { supabase } from '@/integrations/supabase/client';

interface PredictionResult {
  strugglingSkills: string[];
  likelyMisconceptions: string[];
  learningVelocity: number;
  dropoutRisk: number;
  interventionNeeded: boolean;
  recommendedActions: string[];
}

export class PredictiveLearningAssistant {
  private static instance: PredictiveLearningAssistant;

  static getInstance(): PredictiveLearningAssistant {
    if (!PredictiveLearningAssistant.instance) {
      PredictiveLearningAssistant.instance = new PredictiveLearningAssistant();
    }
    return PredictiveLearningAssistant.instance;
  }

  async predictNextStruggle(userId: string): Promise<PredictionResult> {
    try {
      // Get user's learning patterns
      const { data: learningData } = await supabase
        .from('predictive_learning_models')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Get recent validation logs to analyze patterns
      const { data: validationLogs } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get misconception networks
      const { data: misconceptions } = await supabase
        .from('misconception_networks')
        .select('*')
        .eq('user_id', userId)
        .order('last_manifested', { ascending: false })
        .limit(10);

      // Analyze patterns and generate predictions
      const strugglingSkills = this.predictStrugglingSkills(validationLogs || []);
      const likelyMisconceptions = this.predictMisconceptions(misconceptions || []);
      const learningVelocity = this.calculateLearningVelocity(validationLogs || []);
      const dropoutRisk = this.calculateDropoutRisk(learningData, validationLogs || []);
      const interventionNeeded = dropoutRisk > 0.6 || strugglingSkills.length > 3;
      const recommendedActions = this.generateRecommendedActions(
        strugglingSkills,
        likelyMisconceptions,
        dropoutRisk,
        interventionNeeded
      );

      const prediction: PredictionResult = {
        strugglingSkills,
        likelyMisconceptions,
        learningVelocity,
        dropoutRisk,
        interventionNeeded,
        recommendedActions
      };

      // Update prediction model
      await this.updatePredictionModel(userId, prediction);

      return prediction;
    } catch (error) {
      console.error('Error predicting next struggle:', error);
      return {
        strugglingSkills: [],
        likelyMisconceptions: [],
        learningVelocity: 1.0,
        dropoutRisk: 0.3,
        interventionNeeded: false,
        recommendedActions: ['continue_current_pace']
      };
    }
  }

  private predictStrugglingSkills(validationLogs: any[]): string[] {
    // Analyze recent performance patterns
    const skillPerformance = new Map<string, { correct: number; total: number }>();
    
    validationLogs.forEach(log => {
      const sessionType = log.session_type || 'general';
      if (!skillPerformance.has(sessionType)) {
        skillPerformance.set(sessionType, { correct: 0, total: 0 });
      }
      
      const performance = skillPerformance.get(sessionType)!;
      performance.total++;
      if (log.is_correct) {
        performance.correct++;
      }
    });

    // Identify skills with low success rate
    const strugglingSkills: string[] = [];
    skillPerformance.forEach((performance, skill) => {
      if (performance.total >= 3) { // Minimum attempts for reliable data
        const successRate = performance.correct / performance.total;
        if (successRate < 0.6) {
          strugglingSkills.push(skill);
        }
      }
    });

    return strugglingSkills.slice(0, 5); // Top 5 struggling skills
  }

  private predictMisconceptions(misconceptions: any[]): string[] {
    // Analyze misconception patterns and strength
    return misconceptions
      .filter(m => (m.strength || 0) > 0.5 && (m.persistence || 0) > 0.4)
      .map(m => m.misconception_cluster_id)
      .slice(0, 3); // Top 3 likely misconceptions
  }

  private calculateLearningVelocity(validationLogs: any[]): number {
    if (validationLogs.length < 5) return 1.0;

    // Calculate learning velocity based on improvement over time
    const recentLogs = validationLogs.slice(0, 10);
    const olderLogs = validationLogs.slice(10, 20);

    const recentAccuracy = recentLogs.reduce((sum, log) => sum + (log.is_correct ? 1 : 0), 0) / recentLogs.length;
    const olderAccuracy = olderLogs.length > 0 
      ? olderLogs.reduce((sum, log) => sum + (log.is_correct ? 1 : 0), 0) / olderLogs.length 
      : 0.5;

    // Calculate velocity as improvement rate
    const improvement = recentAccuracy - olderAccuracy;
    const baseVelocity = 1.0;
    
    return Math.max(0.1, Math.min(3.0, baseVelocity + improvement * 2));
  }

  private calculateDropoutRisk(learningData: any, validationLogs: any[]): number {
    let risk = 0.3; // Base risk

    // Increase risk based on recent performance
    if (validationLogs.length > 0) {
      const recentAccuracy = validationLogs.slice(0, 10)
        .reduce((sum, log) => sum + (log.is_correct ? 1 : 0), 0) / Math.min(10, validationLogs.length);
      
      if (recentAccuracy < 0.4) risk += 0.3;
      else if (recentAccuracy < 0.6) risk += 0.1;
    }

    // Factor in learning data if available
    if (learningData) {
      if (learningData.dropout_risk_score) {
        risk = (risk + learningData.dropout_risk_score) / 2;
      }
    }

    // Check for engagement patterns
    const lastActivity = validationLogs.length > 0 
      ? new Date(validationLogs[0].created_at) 
      : new Date();
    const daysSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActivity > 3) risk += 0.2;
    if (daysSinceLastActivity > 7) risk += 0.3;

    return Math.min(1.0, risk);
  }

  private generateRecommendedActions(
    strugglingSkills: string[],
    likelyMisconceptions: string[],
    dropoutRisk: number,
    interventionNeeded: boolean
  ): string[] {
    const actions: string[] = [];

    if (interventionNeeded) {
      actions.push('immediate_intervention');
    }

    if (dropoutRisk > 0.7) {
      actions.push('motivational_support');
      actions.push('reduce_difficulty');
    }

    if (strugglingSkills.length > 0) {
      actions.push('targeted_practice');
      actions.push('review_fundamentals');
    }

    if (likelyMisconceptions.length > 0) {
      actions.push('misconception_correction');
      actions.push('conceptual_reinforcement');
    }

    if (actions.length === 0) {
      actions.push('continue_current_pace');
    }

    return actions;
  }

  private async updatePredictionModel(userId: string, prediction: PredictionResult): Promise<void> {
    try {
      await supabase
        .from('predictive_learning_models')
        .upsert({
          user_id: userId,
          dropout_risk_score: prediction.dropoutRisk,
          learning_velocity: prediction.learningVelocity,
          struggling_skills: prediction.strugglingSkills,
          likely_misconceptions: prediction.likelyMisconceptions,
          intervention_needed: prediction.interventionNeeded,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating prediction model:', error);
    }
  }
}