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

interface NeuroplasticityState {
  synapticStrength: number;
  masteryLevel: number;
  recommendedAction: string;
  strugglingAreas: string[];
  optimalSpacing: number;
}

export class NeuroplasticityEngine {
  private static instance: NeuroplasticityEngine;

  static getInstance(): NeuroplasticityEngine {
    if (!NeuroplasticityEngine.instance) {
      NeuroplasticityEngine.instance = new NeuroplasticityEngine();
    }
    return NeuroplasticityEngine.instance;
  }

  async optimizeNeuroplasticity(userId: string, context: LearningContext): Promise<NeuroplasticityState> {
    try {
      // Get spaced repetition data
      const { data: spacedData } = await supabase
        .from('neuroplasticity_spaced_repetition')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(10);

      // Calculate synaptic strength based on performance patterns
      const synapticStrength = this.calculateSynapticStrength(context, spacedData || []);
      
      // Determine mastery level
      const masteryLevel = this.calculateMasteryLevel(spacedData || []);
      
      // Identify struggling areas
      const strugglingAreas = this.identifyStrugglingAreas(spacedData || []);
      
      // Calculate optimal spacing interval
      const optimalSpacing = this.calculateOptimalSpacing(synapticStrength, masteryLevel);
      
      // Determine recommended action
      const recommendedAction = this.determineRecommendedAction(synapticStrength, masteryLevel, context);

      const state: NeuroplasticityState = {
        synapticStrength,
        masteryLevel,
        recommendedAction,
        strugglingAreas,
        optimalSpacing
      };

      // Update neuroplasticity data
      await this.updateNeuroplasticityData(userId, context, state);

      return state;
    } catch (error) {
      console.error('Error optimizing neuroplasticity:', error);
      return {
        synapticStrength: 0.5,
        masteryLevel: 0.5,
        recommendedAction: 'continue',
        strugglingAreas: [],
        optimalSpacing: 24
      };
    }
  }

  async optimizeSpacedRepetition(userId: string, skillId: string): Promise<any> {
    try {
      // Get current skill performance
      const { data: skillData } = await supabase
        .from('neuroplasticity_spaced_repetition')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      // Calculate next review time using neuroplasticity principles
      const forgettingCurve = this.calculateForgettingCurve(skillData);
      const nextReviewHours = this.calculateNextReviewInterval(forgettingCurve, skillData?.mastery_level || 0.5);

      const nextReviewTime = new Date();
      nextReviewTime.setHours(nextReviewTime.getHours() + nextReviewHours);

      // Update spaced repetition schedule
      await supabase
        .from('neuroplasticity_spaced_repetition')
        .upsert({
          user_id: userId,
          skill_id: skillId,
          next_review_at: nextReviewTime.toISOString(),
          mastery_level: (skillData?.mastery_level || 0.5) + 0.1,
          updated_at: new Date().toISOString()
        });

      return {
        nextReviewAt: nextReviewTime,
        masteryLevel: (skillData?.mastery_level || 0.5) + 0.1,
        intervalHours: nextReviewHours
      };
    } catch (error) {
      console.error('Error optimizing spaced repetition:', error);
      return null;
    }
  }

  private calculateSynapticStrength(context: LearningContext, spacedData: any[]): number {
    let strength = 0.5;

    // Base strength on correctness
    if (context.isCorrect === true) {
      strength += 0.2;
    } else if (context.isCorrect === false) {
      strength -= 0.1;
    }

    // Factor in response time (faster = stronger connections)
    if (context.responseTime) {
      const normalizedTime = Math.min(context.responseTime / 30000, 1); // 30 seconds baseline
      strength += (1 - normalizedTime) * 0.2;
    }

    // Factor in confidence
    if (context.confidence) {
      strength += context.confidence * 0.2;
    }

    // Use historical data
    if (spacedData.length > 0) {
      const avgMastery = spacedData.reduce((sum, item) => sum + (item.mastery_level || 0.5), 0) / spacedData.length;
      strength = (strength + avgMastery) / 2;
    }

    return Math.min(Math.max(strength, 0), 1);
  }

  private calculateMasteryLevel(spacedData: any[]): number {
    if (spacedData.length === 0) return 0.5;
    
    // Calculate weighted average of recent mastery levels
    const weights = spacedData.map((_, index) => Math.pow(0.9, index)); // Recent data weighted more
    const weightedSum = spacedData.reduce((sum, item, index) => sum + (item.mastery_level || 0.5) * weights[index], 0);
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return weightedSum / totalWeight;
  }

  private identifyStrugglingAreas(spacedData: any[]): string[] {
    const strugglingThreshold = 0.4;
    return spacedData
      .filter(item => (item.mastery_level || 0.5) < strugglingThreshold)
      .map(item => item.skill_id)
      .slice(0, 3); // Top 3 struggling areas
  }

  private calculateOptimalSpacing(synapticStrength: number, masteryLevel: number): number {
    // Base spacing calculation using Ebbinghaus forgetting curve principles
    const baseInterval = 24; // 24 hours
    const strengthMultiplier = Math.pow(2, synapticStrength * 4); // Exponential growth
    const masteryMultiplier = Math.pow(1.5, masteryLevel * 6);
    
    return Math.round(baseInterval * strengthMultiplier * masteryMultiplier);
  }

  private calculateForgettingCurve(skillData: any): number {
    if (!skillData) return 0.5;
    
    const timeSinceLastReview = Date.now() - new Date(skillData.updated_at).getTime();
    const hoursElapsed = timeSinceLastReview / (1000 * 60 * 60);
    
    // Forgetting curve: R = e^(-t/S) where S is strength
    const strength = (skillData.mastery_level || 0.5) * 100; // Convert to hours
    return Math.exp(-hoursElapsed / strength);
  }

  private calculateNextReviewInterval(forgettingCurve: number, masteryLevel: number): number {
    // If forgetting curve is low, review sooner
    // If mastery is high, can wait longer
    const baseInterval = 24;
    const forgettingMultiplier = Math.max(0.5, forgettingCurve);
    const masteryMultiplier = Math.pow(1.5, masteryLevel * 3);
    
    return Math.max(1, Math.round(baseInterval * forgettingMultiplier * masteryMultiplier));
  }

  private determineRecommendedAction(
    synapticStrength: number,
    masteryLevel: number,
    context: LearningContext
  ): string {
    if (synapticStrength < 0.3) {
      return 'strengthen';
    } else if (masteryLevel > 0.8) {
      return 'advance';
    } else if (context.isCorrect === false) {
      return 'review';
    } else {
      return 'continue';
    }
  }

  private async updateNeuroplasticityData(
    userId: string,
    context: LearningContext,
    state: NeuroplasticityState
  ): Promise<void> {
    try {
      await supabase
        .from('neuroplasticity_spaced_repetition')
        .upsert({
          user_id: userId,
          skill_id: context.currentSkill || 'general',
          mastery_level: state.masteryLevel,
          synaptic_strength: state.synapticStrength,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating neuroplasticity data:', error);
    }
  }
}