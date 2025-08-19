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

interface SimplifiedNeuroplasticityState {
  masteryLevel: number;
  recommendedAction: string;
  nextReviewHours: number;
}

export class SimplifiedNeuroplasticityEngine {
  private static instance: SimplifiedNeuroplasticityEngine;

  static getInstance(): SimplifiedNeuroplasticityEngine {
    if (!SimplifiedNeuroplasticityEngine.instance) {
      SimplifiedNeuroplasticityEngine.instance = new SimplifiedNeuroplasticityEngine();
    }
    return SimplifiedNeuroplasticityEngine.instance;
  }

  async optimizeNeuroplasticity(userId: string, context: LearningContext): Promise<SimplifiedNeuroplasticityState> {
    try {
      // Use existing skill_progress table for neuroplasticity data
      const { data: skillData } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(5);

      const skills = skillData || [];
      
      // Calculate average mastery
      const avgMastery = skills.length > 0 
        ? skills.reduce((sum, skill) => sum + (skill.mastery_level || 0), 0) / skills.length
        : 0;

      // Determine recommended action
      let recommendedAction = 'continue';
      if (avgMastery < 3) {
        recommendedAction = 'strengthen_basics';
      } else if (avgMastery > 7) {
        recommendedAction = 'advance_level';
      } else if (context.isCorrect === false) {
        recommendedAction = 'review_concept';
      }

      // Calculate spaced repetition interval
      const nextReviewHours = this.calculateSpacedInterval(avgMastery, context.isCorrect);

      return {
        masteryLevel: avgMastery / 10, // Normalize to 0-1
        recommendedAction,
        nextReviewHours
      };
    } catch (error) {
      console.error('Error in simplified neuroplasticity engine:', error);
      return {
        masteryLevel: 0.5,
        recommendedAction: 'continue',
        nextReviewHours: 24
      };
    }
  }

  async optimizeSpacedRepetition(userId: string, skillId: string): Promise<any> {
    try {
      // Get or create skill progress entry
      let { data: skillProgress } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_id', skillId)
        .maybeSingle();

      if (!skillProgress) {
        // Create new skill progress entry
        const { data: newProgress } = await supabase
          .from('skill_progress')
          .insert({
            user_id: userId,
            skill_id: skillId,
            mastery_level: 1,
            total_attempts: 1,
            correct_attempts: 0
          })
          .select()
          .single();
        
        skillProgress = newProgress;
      }

      const masteryLevel = skillProgress?.mastery_level || 1;
      const intervalHours = this.calculateSpacedInterval(masteryLevel, true);
      
      const nextReviewTime = new Date();
      nextReviewTime.setHours(nextReviewTime.getHours() + intervalHours);

      // Update next review time
      await supabase
        .from('skill_progress')
        .update({
          next_review_at: nextReviewTime.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('skill_id', skillId);

      return {
        nextReviewAt: nextReviewTime,
        masteryLevel: masteryLevel / 10,
        intervalHours
      };
    } catch (error) {
      console.error('Error optimizing spaced repetition:', error);
      return null;
    }
  }

  private calculateSpacedInterval(masteryLevel: number, isCorrect?: boolean): number {
    // Basic spaced repetition algorithm
    let baseInterval = 24; // 24 hours

    // Adjust based on mastery level (1-10 scale)
    const masteryMultiplier = Math.pow(1.3, masteryLevel);
    
    // Adjust based on correctness
    const correctnessMultiplier = isCorrect === false ? 0.5 : (isCorrect === true ? 1.5 : 1);
    
    const interval = baseInterval * masteryMultiplier * correctnessMultiplier;
    
    // Clamp between 1 hour and 30 days
    return Math.max(1, Math.min(interval, 720)); // 720 hours = 30 days
  }
}