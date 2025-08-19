import { supabase } from '@/integrations/supabase/client';

interface SimplifiedPredictionResult {
  strugglingSkills: string[];
  learningVelocity: number;
  dropoutRisk: number;
  recommendedActions: string[];
}

export class SimplifiedPredictiveLearningAssistant {
  private static instance: SimplifiedPredictiveLearningAssistant;

  static getInstance(): SimplifiedPredictiveLearningAssistant {
    if (!SimplifiedPredictiveLearningAssistant.instance) {
      SimplifiedPredictiveLearningAssistant.instance = new SimplifiedPredictiveLearningAssistant();
    }
    return SimplifiedPredictiveLearningAssistant.instance;
  }

  async predictNextStruggle(userId: string): Promise<SimplifiedPredictionResult> {
    try {
      // Get recent validation logs for pattern analysis
      const { data: validationLogs } = await supabase
        .from('validation_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      // Get skill progress data
      const { data: skillProgress } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(20);

      const logs = validationLogs || [];
      const skills = skillProgress || [];
      
      // Analyze patterns
      const strugglingSkills = this.identifyStrugglingSkills(logs, skills);
      const learningVelocity = this.calculateLearningVelocity(logs);
      const dropoutRisk = this.calculateDropoutRisk(logs);
      const recommendedActions = this.generateRecommendations(strugglingSkills, learningVelocity, dropoutRisk);

      return {
        strugglingSkills,
        learningVelocity,
        dropoutRisk,
        recommendedActions
      };
    } catch (error) {
      console.error('Error predicting learning patterns:', error);
      return {
        strugglingSkills: [],
        learningVelocity: 1.0,
        dropoutRisk: 0.3,
        recommendedActions: ['continue_current_pace']
      };
    }
  }

  private identifyStrugglingSkills(logs: any[], skills: any[]): string[] {
    const struggling: string[] = [];

    // Analyze validation logs for low accuracy areas
    const sessionTypes = new Map<string, { correct: number; total: number }>();
    
    logs.forEach(log => {
      const sessionType = log.session_type || 'general';
      if (!sessionTypes.has(sessionType)) {
        sessionTypes.set(sessionType, { correct: 0, total: 0 });
      }
      
      const stats = sessionTypes.get(sessionType)!;
      stats.total++;
      if (log.is_correct) {
        stats.correct++;
      }
    });

    // Find sessions with low success rate
    sessionTypes.forEach((stats, sessionType) => {
      if (stats.total >= 3 && stats.correct / stats.total < 0.6) {
        struggling.push(sessionType);
      }
    });

    // Add skills with low mastery levels
    skills.forEach(skill => {
      if (skill.mastery_level < 3) {
        struggling.push(`skill_${skill.skill_id}`);
      }
    });

    return struggling.slice(0, 5); // Return top 5
  }

  private calculateLearningVelocity(logs: any[]): number {
    if (logs.length < 10) return 1.0;

    // Compare recent vs older performance
    const recentLogs = logs.slice(0, 10);
    const olderLogs = logs.slice(10, 20);

    const recentAccuracy = recentLogs.reduce((sum, log) => sum + (log.is_correct ? 1 : 0), 0) / recentLogs.length;
    const olderAccuracy = olderLogs.length > 0 
      ? olderLogs.reduce((sum, log) => sum + (log.is_correct ? 1 : 0), 0) / olderLogs.length 
      : 0.5;

    // Calculate improvement rate
    const improvement = recentAccuracy - olderAccuracy;
    const baseVelocity = 1.0;
    
    // Velocity between 0.2 and 2.0
    return Math.max(0.2, Math.min(2.0, baseVelocity + improvement * 2));
  }

  private calculateDropoutRisk(logs: any[]): number {
    let risk = 0.2; // Base risk

    if (logs.length === 0) {
      return 0.8; // High risk if no recent activity
    }

    // Check recent performance
    const recentLogs = logs.slice(0, 10);
    const recentAccuracy = recentLogs.reduce((sum, log) => sum + (log.is_correct ? 1 : 0), 0) / recentLogs.length;
    
    if (recentAccuracy < 0.3) risk += 0.4;
    else if (recentAccuracy < 0.5) risk += 0.2;

    // Check activity frequency
    const lastActivity = new Date(logs[0].created_at);
    const daysSinceLastActivity = (Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastActivity > 7) risk += 0.3;
    else if (daysSinceLastActivity > 3) risk += 0.1;

    // Check consistency
    const sessionDates = logs.map(log => new Date(log.created_at).toDateString());
    const uniqueDates = new Set(sessionDates);
    const consistency = uniqueDates.size / Math.min(logs.length, 14); // Check last 2 weeks
    
    if (consistency < 0.3) risk += 0.2;

    return Math.min(1.0, risk);
  }

  private generateRecommendations(strugglingSkills: string[], velocity: number, dropoutRisk: number): string[] {
    const actions: string[] = [];

    if (dropoutRisk > 0.7) {
      actions.push('immediate_support', 'reduce_difficulty', 'motivational_intervention');
    } else if (dropoutRisk > 0.5) {
      actions.push('check_engagement', 'adjust_pace');
    }

    if (strugglingSkills.length > 3) {
      actions.push('focus_fundamentals', 'targeted_practice');
    } else if (strugglingSkills.length > 0) {
      actions.push('review_weak_areas');
    }

    if (velocity < 0.5) {
      actions.push('slow_down_pace', 'provide_scaffolding');
    } else if (velocity > 1.5) {
      actions.push('increase_challenge', 'accelerate_learning');
    }

    if (actions.length === 0) {
      actions.push('continue_current_approach');
    }

    return actions;
  }
}