import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Real Learning Engine - Based on cognitive science principles
class RealLearningEngine {
  private supabase: any;
  private openAIKey: string;
  
  constructor(supabase: any) {
    this.supabase = supabase;
    this.openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
  }

  /**
   * REAL ANSWER VALIDATION with misconception detection
   */
  async validateAnswer(userAnswer: string, expectedAnswer: string, skillCode: string): Promise<{
    isCorrect: boolean;
    partialCredit: number;
    detectedMisconceptions: string[];
    feedback: string;
  }> {
    try {
      // Get misconception patterns for this skill
      const { data: misconceptions } = await this.supabase
        .from('misconception_database')
        .select('*')
        .eq('skill_node_id', skillCode);

      const prompt = `
Analyze this math answer with expert precision:

Expected: ${expectedAnswer}
Student: ${userAnswer}
Skill: ${skillCode}

Evaluate:
1. Is it mathematically correct? (exact match, equivalent forms, acceptable variations)
2. Partial credit (0.0-1.0) if partially correct
3. Detect specific misconceptions from patterns
4. Provide constructive feedback

Respond in JSON:
{
  "isCorrect": boolean,
  "partialCredit": number,
  "misconceptions": ["specific_misconception_codes"],
  "feedback": "specific_constructive_explanation"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: 'You are an expert math teacher and assessment specialist. Analyze answers with precision and pedagogical insight.' },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: 300
        }),
      });

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        isCorrect: result.isCorrect,
        partialCredit: result.partialCredit || (result.isCorrect ? 1.0 : 0.0),
        detectedMisconceptions: result.misconceptions || [],
        feedback: result.feedback
      };
    } catch (error) {
      console.error('Error validating answer:', error);
      // Fallback to simple comparison
      const isCorrect = this.normalizeAnswer(userAnswer) === this.normalizeAnswer(expectedAnswer);
      return {
        isCorrect,
        partialCredit: isCorrect ? 1.0 : 0.0,
        detectedMisconceptions: [],
        feedback: isCorrect ? "Correct!" : "Try again - check your calculation."
      };
    }
  }

  private normalizeAnswer(answer: string): string {
    return answer.toLowerCase().replace(/\s+/g, '').replace(/[^\w\d.-]/g, '');
  }

  /**
   * SPACED REPETITION ALGORITHM (SuperMemo inspired)
   */
  async updateSpacedRepetition(userId: string, skillNodeId: string, grade: number): Promise<void> {
    try {
      // Get current card
      let { data: card } = await this.supabase
        .from('spaced_repetition_cards')
        .select('*')
        .eq('user_id', userId)
        .eq('skill_node_id', skillNodeId)
        .single();

      if (!card) {
        // Create new card
        const { data: newCard, error } = await this.supabase
          .from('spaced_repetition_cards')
          .insert({
            user_id: userId,
            skill_node_id: skillNodeId,
            next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
            review_history: JSON.stringify([{ date: new Date(), grade, response_time: 0 }])
          })
          .select()
          .single();
        
        if (error) throw error;
        card = newCard;
      }

      // Calculate new interval using SuperMemo algorithm
      const easeFactor = card.ease_factor || 2.5;
      const repetitionCount = card.repetition_count || 0;
      let newInterval: number;
      let newEaseFactor = easeFactor;

      if (grade < 3) {
        // Failed - restart
        newInterval = 1;
      } else {
        // Successful - calculate next interval
        if (repetitionCount === 0) {
          newInterval = 1;
        } else if (repetitionCount === 1) {
          newInterval = 6;
        } else {
          newInterval = Math.round(card.interval_days * easeFactor);
        }

        // Update ease factor based on grade
        newEaseFactor = easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        newEaseFactor = Math.max(1.3, newEaseFactor);
      }

      // Calculate mastery level
      const history = card.review_history ? JSON.parse(card.review_history) : [];
      history.push({ date: new Date(), grade, response_time: 0 });
      
      const recentGrades = history.slice(-5).map((h: any) => h.grade);
      const masteryLevel = recentGrades.length > 0 ? 
        recentGrades.reduce((sum: number, g: number) => sum + g, 0) / (recentGrades.length * 5) : 0;

      // Update card
      await this.supabase
        .from('spaced_repetition_cards')
        .update({
          interval_days: newInterval,
          ease_factor: newEaseFactor,
          repetition_count: repetitionCount + 1,
          next_review_at: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000),
          last_reviewed_at: new Date(),
          review_history: JSON.stringify(history),
          mastery_level: masteryLevel
        })
        .eq('id', card.id);

    } catch (error) {
      console.error('Error updating spaced repetition:', error);
    }
  }

  /**
   * REAL COGNITIVE LOAD CALCULATION from interaction patterns
   */
  calculateCognitiveLoad(responseTime: number, revisionsCount: number, pausePattern: any): number {
    // Base cognitive load from response time
    const timeLoad = Math.min(1, Math.max(0, (responseTime - 5000) / 30000)); // 5s-35s range
    
    // Revision penalty (multiple answer changes = higher load)
    const revisionLoad = Math.min(0.3, revisionsCount * 0.1);
    
    // Pause pattern analysis (frequent pauses = struggling)
    const pauseLoad = pausePattern?.longPauses ? Math.min(0.2, pausePattern.longPauses * 0.05) : 0;
    
    return Math.min(1, timeLoad + revisionLoad + pauseLoad);
  }

  /**
   * INTELLIGENT TASK GENERATION with real difficulty adaptation
   */
  async generateAdaptiveTask(userId: string, targetDifficulty: number, skillCode?: string): Promise<any> {
    try {
      // Get user's learning profile for personalization
      const profile = await this.getUserLearningProfile(userId);
      
      // Get skill node information
      const { data: skillNode } = await this.supabase
        .from('knowledge_nodes')
        .select('*')
        .eq('skill_code', skillCode || 'basic_arithmetic')
        .single();

      if (!skillNode) {
        return this.generateFallbackTask(targetDifficulty);
      }

      // Check if user needs prerequisite review
      const { data: prerequisites } = await this.supabase
        .from('knowledge_prerequisites')
        .select('prerequisite_id')
        .eq('skill_id', skillNode.id);

      // Adaptive prompt based on user's cognitive profile
      let adaptationInstructions = '';
      if (profile?.processing_speed_percentile < 30) {
        adaptationInstructions += 'Provide extra thinking time. Use clear, step-by-step presentation. ';
      }
      if (profile?.visual_vs_verbal_preference > 0.6) {
        adaptationInstructions += 'Include visual elements, diagrams, or graphical representations. ';
      }

      const prompt = `
Generate a mathematics task for skill: ${skillNode.skill_name}
Difficulty: ${targetDifficulty}/10
Department: ${skillNode.department}

Student Profile Adaptations:
${adaptationInstructions}

Requirements:
1. Create a clear, engaging problem statement
2. Provide the exact expected answer
3. Include 2-3 progressive hints
4. Consider common misconceptions for this skill
5. Make it appropriately challenging for difficulty level ${targetDifficulty}

Respond in JSON format:
{
  "problem": "clear problem statement",
  "expectedAnswer": "exact answer",
  "hints": ["hint1", "hint2", "hint3"],
  "difficulty": ${targetDifficulty},
  "skillFocus": "${skillNode.skill_name}",
  "estimatedTime": "estimated_minutes_to_solve"
}`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: 'You are an expert mathematics education specialist. Create personalized, pedagogically sound practice problems.' },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: 400
        }),
      });

      const data = await response.json();
      const taskData = JSON.parse(data.choices[0].message.content);

      return {
        id: `adaptive_${Date.now()}`,
        type: 'adaptive_generated',
        skillCode: skillCode || 'basic_arithmetic',
        difficulty: targetDifficulty,
        problem: taskData.problem,
        expectedAnswer: taskData.expectedAnswer,
        hints: taskData.hints || [],
        estimatedTime: taskData.estimatedTime || '5',
        metadata: {
          adaptations: adaptationInstructions,
          skillNode: skillNode.id,
          generated_at: new Date().toISOString()
        }
      };

    } catch (error) {
      console.error('Error generating adaptive task:', error);
      return this.generateFallbackTask(targetDifficulty);
    }
  }

  private generateFallbackTask(difficulty: number): any {
    const operations = ['+', '-', '×', '÷'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    const range = Math.pow(10, Math.min(2, Math.max(1, difficulty - 3)));
    
    const a = Math.floor(Math.random() * range) + 1;
    const b = Math.floor(Math.random() * range) + 1;
    
    let problem: string;
    let expectedAnswer: string;
    
    switch (operation) {
      case '+':
        problem = `Oblicz: ${a} + ${b}`;
        expectedAnswer = (a + b).toString();
        break;
      case '-':
        const larger = Math.max(a, b);
        const smaller = Math.min(a, b);
        problem = `Oblicz: ${larger} - ${smaller}`;
        expectedAnswer = (larger - smaller).toString();
        break;
      case '×':
        problem = `Oblicz: ${a} × ${b}`;
        expectedAnswer = (a * b).toString();
        break;
      case '÷':
        const dividend = a * b;
        problem = `Oblicz: ${dividend} ÷ ${a}`;
        expectedAnswer = b.toString();
        break;
      default:
        problem = `Oblicz: ${a} + ${b}`;
        expectedAnswer = (a + b).toString();
    }
    
    return {
      id: `fallback_${Date.now()}`,
      type: 'basic_math',
      skillCode: 'basic_arithmetic',
      difficulty,
      problem,
      expectedAnswer,
      hints: ['Użyj podstawowych działań matematycznych', 'Sprawdź swoje obliczenia'],
      estimatedTime: '3',
      metadata: { is_fallback: true }
    };
  }

  /**
   * REAL PERSONALIZED FEEDBACK with learning science
   */
  async generatePersonalizedFeedback(
    isCorrect: boolean, 
    misconceptions: string[], 
    userProfile: any,
    skillContext: string
  ): Promise<string> {
    try {
      let feedbackStyle = 'balanced';
      if (userProfile?.frustration_level > 0.7) {
        feedbackStyle = 'encouraging';
      } else if (userProfile?.confidence_level > 0.8) {
        feedbackStyle = 'challenging';
      }

      const prompt = `
Generate personalized learning feedback:

Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}
Detected issues: ${misconceptions.join(', ') || 'none'}
Student profile: ${feedbackStyle} style needed
Skill context: ${skillContext}

Feedback style guidelines:
- encouraging: Focus on progress, growth mindset, specific next steps
- challenging: Push for deeper understanding, extension questions
- balanced: Clear explanation with positive reinforcement

Provide:
1. Immediate response to their work
2. Specific learning guidance
3. Next step recommendation

Keep it concise (2-3 sentences max) and motivating.`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: 'You are an expert learning coach who provides personalized, pedagogically sound feedback that adapts to each student\'s needs and emotional state.' },
            { role: 'user', content: prompt }
          ],
          max_completion_tokens: 150
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;

    } catch (error) {
      console.error('Error generating feedback:', error);
      return isCorrect ? 
        "Excellent work! You're building strong problem-solving skills." :
        "Not quite right, but you're on the right track. Let's work through this step by step.";
    }
  }

  /**
   * REAL USER PROFILE MANAGEMENT
   */
  async getUserLearningProfile(userId: string): Promise<any> {
    try {
      const { data: profile } = await this.supabase
        .from('learning_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        // Create default profile
        const { data: newProfile } = await this.supabase
          .from('learning_profiles')
          .insert({
            user_id: userId,
            processing_speed_percentile: 50,
            working_memory_span: 4,
            cognitive_load_threshold: 0.7,
            attention_span_minutes: 25
          })
          .select()
          .single();
        
        return newProfile;
      }

      return profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * LOG REAL LEARNING INTERACTION with full context
   */
  async logLearningInteraction(userId: string, interaction: any): Promise<void> {
    try {
      await this.supabase
        .from('learning_interactions')
        .insert({
          user_id: userId,
          session_id: interaction.sessionId,
          skill_node_id: interaction.skillNodeId,
          task_type: interaction.taskType || 'practice',
          difficulty_presented: interaction.difficulty,
          student_input: interaction.userAnswer,
          parsed_answer: { raw: interaction.userAnswer },
          is_correct: interaction.isCorrect,
          partial_credit_score: interaction.partialCredit || 0,
          detected_misconceptions: interaction.detectedMisconceptions || [],
          error_category: interaction.errorCategory || null,
          response_time_ms: interaction.responseTime || 0,
          cognitive_load_during_task: interaction.cognitiveLoad || 0.5,
          engagement_score: interaction.engagementScore || 0.5
        });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const engine = new RealLearningEngine(supabaseClient);
    const { action, userId, ...params } = await req.json();

    let result;

    switch (action) {
      case 'validate_answer':
        result = await engine.validateAnswer(
          params.userAnswer, 
          params.expectedAnswer, 
          params.skillCode
        );
        break;

      case 'generate_task':
        result = await engine.generateAdaptiveTask(
          userId, 
          params.difficulty, 
          params.skillCode
        );
        break;

      case 'process_interaction':
        // Validate answer first
        const validation = await engine.validateAnswer(
          params.userAnswer,
          params.expectedAnswer,
          params.skillCode
        );

        // Update spaced repetition
        const grade = validation.isCorrect ? 5 : (validation.partialCredit > 0.5 ? 3 : 1);
        await engine.updateSpacedRepetition(userId, params.skillNodeId, grade);

        // Generate personalized feedback
        const profile = await engine.getUserLearningProfile(userId);
        const feedback = await engine.generatePersonalizedFeedback(
          validation.isCorrect,
          validation.detectedMisconceptions,
          profile,
          params.skillCode
        );

        // Log the interaction
        await engine.logLearningInteraction(userId, {
          sessionId: params.sessionId,
          skillNodeId: params.skillNodeId,
          taskType: 'practice',
          difficulty: params.difficulty,
          userAnswer: params.userAnswer,
          isCorrect: validation.isCorrect,
          partialCredit: validation.partialCredit,
          detectedMisconceptions: validation.detectedMisconceptions,
          responseTime: params.responseTime,
          cognitiveLoad: engine.calculateCognitiveLoad(
            params.responseTime, 
            params.revisionsCount || 0, 
            params.pausePattern
          )
        });

        result = {
          validation,
          feedback,
          nextDifficulty: validation.isCorrect ? 
            Math.min(10, params.difficulty + 0.5) : 
            Math.max(1, params.difficulty - 0.5)
        };
        break;

      case 'get_due_reviews':
        const { data: dueCards } = await supabaseClient
          .from('spaced_repetition_cards')
          .select('*, knowledge_nodes(*)')
          .eq('user_id', userId)
          .lte('next_review_at', new Date().toISOString());
        
        result = { dueCards: dueCards || [] };
        break;

      case 'get_profile':
        result = await engine.getUserLearningProfile(userId);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in real-learning-engine:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});