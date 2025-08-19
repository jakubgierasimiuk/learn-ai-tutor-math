import { supabase } from '@/integrations/supabase/client';
import { ErrorHandler } from './ErrorHandler';

/**
 * Enhanced Diagnostics Integration System
 */
export class DiagnosticsIntegration {
  
  /**
   * Process diagnostic results and update learning system
   */
  public static async processAndIntegrateDiagnostics(
    userId: string,
    diagnosticResults: {
      skillId: string;
      totalQuestions: number;
      correctAnswers: number;
      responses: Array<{
        questionId: string;
        userAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
        responseTime: number;
        topic: string;
        difficulty: number;
      }>;
    }
  ): Promise<{
    strengthAreas: string[];
    weakAreas: string[];
    recommendedSkills: string[];
    detectedMisconceptions: string[];
    optimalDifficulty: number;
  }> {
    return await ErrorHandler.handleWithRetry(
      async () => {
        // Analyze responses for patterns
        const analysis = this.analyzeDiagnosticResponses(diagnosticResults.responses);
        
        // Update learner profile with diagnostic insights
        await this.updateLearnerProfileFromDiagnostics(userId, analysis, diagnosticResults);
        
        // Generate misconception patterns
        await this.generateMisconceptionPatterns(userId, analysis.detectedMisconceptions);
        
        // Update skill progress based on diagnostics
        await this.updateSkillProgressFromDiagnostics(userId, diagnosticResults);
        
        return analysis;
      },
      () => ({
        strengthAreas: [],
        weakAreas: [],
        recommendedSkills: [],
        detectedMisconceptions: [],
        optimalDifficulty: 5
      }),
      'processAndIntegrateDiagnostics'
    );
  }

  /**
   * Analyze diagnostic responses for patterns
   */
  private static analyzeDiagnosticResponses(responses: any[]): {
    strengthAreas: string[];
    weakAreas: string[];
    recommendedSkills: string[];
    detectedMisconceptions: string[];
    optimalDifficulty: number;
  } {
    const topicPerformance = new Map<string, { correct: number; total: number; avgDifficulty: number }>();
    const misconceptions = new Set<string>();
    
    // Group by topics
    responses.forEach(response => {
      const topic = response.topic;
      if (!topicPerformance.has(topic)) {
        topicPerformance.set(topic, { correct: 0, total: 0, avgDifficulty: 0 });
      }
      
      const stats = topicPerformance.get(topic)!;
      stats.total++;
      stats.avgDifficulty += response.difficulty;
      
      if (response.isCorrect) {
        stats.correct++;
      } else {
        // Detect potential misconceptions based on wrong answers
        misconceptions.add(`${topic}_misconception_${response.questionId}`);
      }
    });

    // Calculate performance by topic
    const strengthAreas: string[] = [];
    const weakAreas: string[] = [];
    let totalDifficulty = 0;
    let difficultyCount = 0;

    for (const [topic, stats] of topicPerformance) {
      const accuracy = stats.correct / stats.total;
      stats.avgDifficulty = stats.avgDifficulty / stats.total;
      
      totalDifficulty += stats.avgDifficulty;
      difficultyCount++;
      
      if (accuracy >= 0.8) {
        strengthAreas.push(topic);
      } else if (accuracy <= 0.5) {
        weakAreas.push(topic);
      }
    }

    // Calculate optimal difficulty
    const avgDifficulty = difficultyCount > 0 ? totalDifficulty / difficultyCount : 5;
    const overallAccuracy = responses.filter(r => r.isCorrect).length / responses.length;
    
    let optimalDifficulty = avgDifficulty;
    if (overallAccuracy > 0.8) {
      optimalDifficulty += 1;
    } else if (overallAccuracy < 0.5) {
      optimalDifficulty -= 1;
    }
    
    optimalDifficulty = Math.max(1, Math.min(10, optimalDifficulty));

    return {
      strengthAreas,
      weakAreas,
      recommendedSkills: weakAreas.slice(0, 3), // Focus on top 3 weak areas
      detectedMisconceptions: Array.from(misconceptions),
      optimalDifficulty
    };
  }

  /**
   * Update learner profile with diagnostic insights
   */
  private static async updateLearnerProfileFromDiagnostics(
    userId: string,
    analysis: any,
    diagnosticResults: any
  ): Promise<void> {
    await ErrorHandler.handleDatabaseOperation(
      async () => {
        return await supabase
          .from('universal_learner_profiles')
          .upsert({
            user_id: userId,
            diagnostic_summary: {
              last_test_date: new Date().toISOString(),
              total_questions: diagnosticResults.totalQuestions,
              correct_answers: diagnosticResults.correctAnswers,
              accuracy: diagnosticResults.correctAnswers / diagnosticResults.totalQuestions,
              skill_id: diagnosticResults.skillId
            },
            micro_skill_strengths: analysis.strengthAreas.reduce((acc: any, area: string) => {
              acc[area] = { level: 8, confidence: 0.9 };
              return acc;
            }, {}),
            prerequisite_gaps: analysis.weakAreas.reduce((acc: any, area: string) => {
              acc[area] = { severity: 'high', detected_at: new Date().toISOString() };
              return acc;
            }, {}),
            optimal_difficulty_range: {
              min: Math.max(1, analysis.optimalDifficulty - 1),
              max: Math.min(10, analysis.optimalDifficulty + 1)
            },
            current_learning_context: {
              recommended_focus: analysis.recommendedSkills,
              next_diagnostic_due: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
          });
      },
      { data: null, error: null },
      'updateLearnerProfileFromDiagnostics'
    );
  }

  /**
   * Generate and store misconception patterns
   */
  private static async generateMisconceptionPatterns(
    userId: string,
    misconceptions: string[]
  ): Promise<void> {
    for (const misconception of misconceptions) {
      await ErrorHandler.handleDatabaseOperation(
        async () => {
          return await supabase
            .from('misconception_patterns')
            .upsert({
              misconception_id: misconception,
              department: 'mathematics',
              micro_skill: 'diagnostic_detected',
              description: `Błąd wykryty podczas diagnozy użytkownika ${userId}`,
              feedback_template: 'Sprawdź swoje rozumowanie w tym obszarze',
              correction_strategy: 'Poćwicz podobne zadania',
              difficulty_adjustment: -1
            });
        },
        { data: null, error: null },
        'generateMisconceptionPatterns'
      );
    }
  }

  /**
   * Update skill progress based on diagnostic results
   */
  private static async updateSkillProgressFromDiagnostics(
    userId: string,
    diagnosticResults: any
  ): Promise<void> {
    const masteryLevel = Math.round((diagnosticResults.correctAnswers / diagnosticResults.totalQuestions) * 100);
    
    await ErrorHandler.handleDatabaseOperation(
      async () => {
        return await supabase
          .from('skill_progress')
          .upsert({
            user_id: userId,
            skill_id: diagnosticResults.skillId,
            mastery_level: masteryLevel,
            total_attempts: diagnosticResults.totalQuestions,
            correct_attempts: diagnosticResults.correctAnswers,
            last_reviewed_at: new Date().toISOString(),
            next_review_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            is_mastered: masteryLevel >= 80
          });
      },
      { data: null, error: null },
      'updateSkillProgressFromDiagnostics'
    );
  }

  /**
   * Get diagnostic-informed recommendations
   */
  public static async getDiagnosticRecommendations(userId: string): Promise<{
    nextDiagnosticSkill?: string;
    shouldRetakeDiagnostic: boolean;
    focusAreas: string[];
    estimatedTime: number;
  }> {
    return await ErrorHandler.handleWithRetry(
      async () => {
        const { data: profile } = await supabase
          .from('universal_learner_profiles')
          .select('*')
          .eq('user_id', userId)
          .single();

        if (!profile?.diagnostic_summary) {
          return {
            shouldRetakeDiagnostic: true,
            focusAreas: ['podstawy_matematyki'],
            estimatedTime: 30,
            nextDiagnosticSkill: 'basic_arithmetic'
          };
        }

        const lastTest = new Date((profile.diagnostic_summary as any)?.last_test_date || Date.now());
        const daysSinceTest = (Date.now() - lastTest.getTime()) / (1000 * 60 * 60 * 24);
        
        return {
          shouldRetakeDiagnostic: daysSinceTest > 30,
          focusAreas: Object.keys(profile.prerequisite_gaps || {}),
          estimatedTime: 15,
          nextDiagnosticSkill: (profile.current_learning_context as any)?.recommended_focus?.[0] || 'basic_arithmetic'
        };
      },
      () => ({
        shouldRetakeDiagnostic: true,
        focusAreas: [],
        estimatedTime: 30,
        nextDiagnosticSkill: 'basic_arithmetic'
      }),
      'getDiagnosticRecommendations'
    );
  }
}