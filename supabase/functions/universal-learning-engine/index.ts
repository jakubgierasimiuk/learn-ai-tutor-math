import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Unified Learning Request Interface
interface UniversalLearningRequest {
  action: 'get_state' | 'process_interaction' | 'start_session' | 'end_session' | 'generate_task' | 'get_recommendations';
  userId?: string;
  sessionId?: string;
  sessionType?: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed';
  userMessage?: string;
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  skillId?: string;
  difficulty?: number;
  department?: string;
  taskType?: string;
  context?: any;
}

// Consolidated User State
interface ConsolidatedUserState {
  userId: string;
  // Profile data
  learningProfile: {
    learningVelocity: number;
    difficultyMultiplier: number;
    preferredStyle: string;
    cognitiveLoad: number;
    masteryLevel: number;
    flowState: number;
    fatigueLevel: number;
    attentionSpan: number;
  };
  // Current session
  currentSession: {
    id: string;
    type: string;
    startTime: string;
    skillFocus?: string;
    difficulty: number;
    tasksCompleted: number;
    correctAnswers: number;
    totalResponseTime: number;
    hintsUsed: number;
    engagementScore: number;
  } | null;
  // Performance data
  recentPerformance: {
    accuracy: number;
    averageResponseTime: number;
    recentTopics: string[];
    strugglingAreas: string[];
    masteredSkills: string[];
    errorPatterns: Record<string, number>;
  };
  // Adaptive recommendations
  recommendations: {
    nextAction: string;
    suggestedDifficulty: number;
    recommendedContent: string;
    explanationStyle: string;
    estimatedSessionTime: number;
    suggestedBreakTime?: number;
  };
}

// Unified Task Definition
interface UnifiedTaskDefinition {
  id: string;
  type: 'ai_generated' | 'database_content' | 'generated_math';
  department: string;
  skill: string;
  difficulty: number;
  content: string;
  expectedAnswer?: string;
  hints?: string[];
  metadata: Record<string, any>;
}

/**
 * UNIVERSAL LEARNING ENGINE
 * Single source of truth for all learning interactions
 */
class UniversalLearningEngine {
  private supabase: any;
  private openAIKey: string;
  
  constructor(supabase: any) {
    this.supabase = supabase;
    this.openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
  }

  /**
   * MAIN ENTRY POINT - consolidates all user data in real-time
   */
  async getConsolidatedUserState(userId: string): Promise<ConsolidatedUserState> {
    try {
      // Parallel data fetching for performance
      const [
        profileData,
        sessionData, 
        performanceData,
        progressData
      ] = await Promise.all([
        this.getUserProfile(userId),
        this.getCurrentSession(userId),
        this.getPerformanceMetrics(userId),
        this.getSkillProgress(userId)
      ]);

      // Real-time calculation of learning state
      const cognitiveLoad = this.calculateCognitiveLoad(performanceData);
      const flowState = this.calculateFlowState(performanceData, sessionData);
      const fatigueLevel = this.calculateFatigueLevel(sessionData, performanceData);
      const masteryLevel = this.calculateMasteryLevel(progressData);

      // Generate adaptive recommendations
      const recommendations = this.generateRecommendations({
        profile: profileData,
        performance: performanceData,
        cognitiveLoad,
        flowState,
        fatigueLevel,
        masteryLevel
      });

      return {
        userId,
        learningProfile: {
          learningVelocity: profileData?.learning_velocity || 1.0,
          difficultyMultiplier: profileData?.difficulty_multiplier || 1.0,
          preferredStyle: profileData?.preferred_explanation_style || 'balanced',
          cognitiveLoad,
          masteryLevel,
          flowState,
          fatigueLevel,
          attentionSpan: this.calculateAttentionSpan(performanceData, fatigueLevel)
        },
        currentSession: sessionData,
        recentPerformance: performanceData,
        recommendations
      };
    } catch (error) {
      console.error('Error getting consolidated state:', error);
      return this.getDefaultUserState(userId);
    }
  }

  /**
   * UNIFIED INTERACTION PROCESSING
   */
  async processLearningInteraction(request: UniversalLearningRequest): Promise<any> {
    const userId = request.userId!;
    
    try {
      // Get current state
      const currentState = await this.getConsolidatedUserState(userId);
      
      // Process the interaction
      let isCorrect: boolean | null = null;
      let misconception: string | null = null;
      
      if (request.userResponse && request.isCorrect !== undefined) {
        isCorrect = request.isCorrect;
        // Log the interaction
        await this.logLearningInteraction(userId, {
          userResponse: request.userResponse,
          isCorrect,
          responseTime: request.responseTime || 0,
          sessionType: request.sessionType || 'mixed',
          sessionId: currentState.currentSession?.id,
          skillId: request.skillId,
          difficulty: currentState.learningProfile.difficultyMultiplier
        });
      }
      
      // Generate AI response based on consolidated state
      const aiResponse = await this.generateAdaptiveResponse(request, currentState, isCorrect);
      
      // Update session if active
      if (currentState.currentSession?.id) {
        await this.updateCurrentSession(currentState.currentSession.id, {
          taskCompleted: !!request.userResponse,
          isCorrect,
          responseTime: request.responseTime || 0,
          hintsUsed: 0
        });
      }
      
      // Get updated state after processing
      const updatedState = await this.getConsolidatedUserState(userId);
      
      return {
        message: aiResponse,
        userState: updatedState,
        isCorrect,
        misconception,
        adaptations: updatedState.recommendations
      };
      
    } catch (error) {
      console.error('Error processing interaction:', error);
      throw error;
    }
  }

  /**
   * UNIFIED SESSION MANAGEMENT
   */
  async startUniversalSession(
    userId: string, 
    sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed',
    skillFocus?: string,
    department?: string
  ): Promise<string | null> {
    try {
      // Get user state to determine optimal starting conditions
      const userState = await this.getConsolidatedUserState(userId);
      
      // Create unified session
      const { data: session, error } = await this.supabase
        .from('unified_learning_sessions')
        .insert({
          user_id: userId,
          profile_id: userState.userId, // We'll use userId as profile reference
          session_type: sessionType,
          skill_focus: skillFocus,
          department: department || 'mathematics',
          difficulty_level: userState.recommendations.suggestedDifficulty,
          engagement_score: 0.5,
          learning_momentum: userState.learningProfile.learningVelocity,
          ai_model_used: this.selectOptimalAIModel(userState),
          explanation_style_used: userState.learningProfile.preferredStyle
        })
        .select()
        .single();

      if (error) {
        console.error('Error starting session:', error);
        return null;
      }

      return session.id;
    } catch (error) {
      console.error('Error in startUniversalSession:', error);
      return null;
    }
  }

  /**
   * UNIFIED TASK GENERATION
   */
  async generateUniversalTask(
    userId: string,
    difficulty: number,
    skillId?: string,
    department: string = 'mathematics'
  ): Promise<UnifiedTaskDefinition | null> {
    try {
      const userState = await this.getConsolidatedUserState(userId);
      
      // Choose generation strategy based on user state
      const strategy = this.selectTaskGenerationStrategy(userState, skillId);
      
      switch (strategy) {
        case 'ai_generated':
          return await this.generateAITask(userState, difficulty, skillId, department);
          
        case 'database_content':
          return await this.getDatabaseTask(skillId, difficulty);
          
        case 'generated_math':
          return await this.generateMathTask(difficulty, department, skillId);
          
        default:
          return await this.getFallbackTask(difficulty, department);
      }
    } catch (error) {
      console.error('Error generating universal task:', error);
      return this.getFallbackTask(difficulty, department);
    }
  }

  /**
   * DATA CONSOLIDATION METHODS
   */
  private async getUserProfile(userId: string): Promise<any> {
    const { data: profile } = await this.supabase
      .from('universal_learner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    const { data: basicProfile } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    return { ...profile, ...basicProfile };
  }

  private async getCurrentSession(userId: string): Promise<any> {
    const { data: session } = await this.supabase
      .from('unified_learning_sessions')
      .select('*')
      .eq('user_id', userId)
      .is('completed_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();
      
    if (!session) return null;
    
    return {
      id: session.id,
      type: session.session_type,
      startTime: session.started_at,
      skillFocus: session.skill_focus,
      difficulty: session.difficulty_level,
      tasksCompleted: session.tasks_completed || 0,
      correctAnswers: session.correct_answers || 0,
      totalResponseTime: session.total_response_time_ms || 0,
      hintsUsed: session.hints_used || 0,
      engagementScore: session.engagement_score || 0.5
    };
  }

  private async getPerformanceMetrics(userId: string): Promise<any> {
    // Get recent validation logs
    const { data: recentLogs } = await this.supabase
      .from('validation_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
      
    // Get recent learning interactions  
    const { data: interactions } = await this.supabase
      .from('learning_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('interaction_timestamp', { ascending: false })
      .limit(10);

    const logs = recentLogs || [];
    const allInteractions = interactions || [];
    
    // Calculate metrics
    const accuracy = logs.length > 0 
      ? logs.filter(log => log.is_correct).length / logs.length 
      : 0.5;
      
    const averageResponseTime = logs.length > 0
      ? logs.reduce((sum, log) => sum + (log.response_time || 30000), 0) / logs.length
      : 30000;
      
    // Error patterns
    const errorPatterns = logs
      .filter(log => log.detected_misconception)
      .reduce((acc: any, log) => {
        acc[log.detected_misconception] = (acc[log.detected_misconception] || 0) + 1;
        return acc;
      }, {});

    return {
      accuracy,
      averageResponseTime,
      recentTopics: [], // Would extract from interactions
      strugglingAreas: Object.keys(errorPatterns).slice(0, 3),
      masteredSkills: [], // Would calculate from skill_progress
      errorPatterns
    };
  }

  private async getSkillProgress(userId: string): Promise<any> {
    const { data: progress } = await this.supabase
      .from('skill_progress')
      .select('*')
      .eq('user_id', userId);
      
    return progress || [];
  }

  /**
   * ADAPTIVE CALCULATIONS
   */
  private calculateCognitiveLoad(performance: any): number {
    const accuracy = performance.accuracy || 0.5;
    const avgResponseTime = performance.averageResponseTime || 30000;
    
    // Higher cognitive load = lower accuracy + slower responses
    const accuracyFactor = 1 - accuracy;
    const timeFactor = Math.min(1, (avgResponseTime - 15000) / 45000);
    
    return Math.max(0, Math.min(1, (accuracyFactor * 0.6 + timeFactor * 0.4)));
  }

  private calculateFlowState(performance: any, session: any): number {
    const accuracy = performance.accuracy || 0.5;
    const avgResponseTime = performance.averageResponseTime || 30000;
    
    // Flow state = high accuracy + optimal response time (not too fast, not too slow)
    const accuracyBonus = accuracy > 0.7 ? accuracy : accuracy * 0.5;
    const timeInRange = avgResponseTime > 10000 && avgResponseTime < 30000 ? 1 : 0.5;
    const engagementBonus = session?.engagementScore || 0.5;
    
    return Math.max(0, Math.min(1, (accuracyBonus * 0.4 + timeInRange * 0.3 + engagementBonus * 0.3)));
  }

  private calculateFatigueLevel(session: any, performance: any): number {
    if (!session) return 0;
    
    const sessionDuration = Date.now() - new Date(session.startTime).getTime();
    const durationMinutes = sessionDuration / (1000 * 60);
    
    // Fatigue increases with time and decreases with good performance
    const timeFatigue = Math.min(1, durationMinutes / 60); // Max at 60 minutes
    const performanceFactor = 1 - (performance.accuracy || 0.5);
    
    return Math.max(0, Math.min(1, (timeFatigue * 0.7 + performanceFactor * 0.3)));
  }

  private calculateMasteryLevel(skillProgress: any[]): number {
    if (!skillProgress.length) return 0.5;
    
    const averageMastery = skillProgress.reduce((sum, skill) => 
      sum + (skill.mastery_level || 0), 0) / skillProgress.length;
      
    return Math.max(0, Math.min(1, averageMastery / 100));
  }

  private calculateAttentionSpan(performance: any, fatigueLevel: number): number {
    const baseLine = 25; // minutes
    const performanceBonus = (performance.accuracy || 0.5) * 10;
    const fatiguePenalty = fatigueLevel * 15;
    
    return Math.max(10, baseLine + performanceBonus - fatiguePenalty);
  }

  /**
   * RECOMMENDATION ENGINE
   */
  private generateRecommendations(data: any): any {
    const { performance, cognitiveLoad, flowState, fatigueLevel, masteryLevel } = data;
    
    // Determine next action
    let nextAction = 'continue';
    if (fatigueLevel > 0.8) nextAction = 'take_break';
    else if (cognitiveLoad > 0.8) nextAction = 'reduce_difficulty';
    else if (flowState > 0.8 && masteryLevel > 0.8) nextAction = 'increase_difficulty';
    else if (performance.accuracy < 0.4) nextAction = 'review_basics';
    
    // Suggest difficulty
    let suggestedDifficulty = 5;
    if (cognitiveLoad > 0.7) suggestedDifficulty = Math.max(1, suggestedDifficulty - 2);
    else if (flowState > 0.7) suggestedDifficulty = Math.min(10, suggestedDifficulty + 1);
    
    // Explanation style
    let explanationStyle = 'balanced';
    if (cognitiveLoad > 0.7) explanationStyle = 'step-by-step';
    else if (flowState > 0.7) explanationStyle = 'concise';
    
    return {
      nextAction,
      suggestedDifficulty,
      recommendedContent: this.getRecommendedContent(nextAction),
      explanationStyle,
      estimatedSessionTime: Math.max(15, 45 - (fatigueLevel * 20)),
      suggestedBreakTime: fatigueLevel > 0.6 ? Math.round(fatigueLevel * 15) : undefined
    };
  }

  private getRecommendedContent(action: string): string {
    switch (action) {
      case 'take_break': return 'Break time - you\'ve been working hard!';
      case 'reduce_difficulty': return 'Let\'s try something a bit easier to build confidence';
      case 'increase_difficulty': return 'Great progress! Ready for a bigger challenge?';
      case 'review_basics': return 'Let\'s review the fundamentals to strengthen your foundation';
      default: return 'Continue with your personalized learning path';
    }
  }

  /**
   * TASK GENERATION STRATEGIES
   */
  private selectTaskGenerationStrategy(userState: any, skillId?: string): string {
    // Use AI for high cognitive load users (need personalized help)
    if (userState.learningProfile.cognitiveLoad > 0.7) return 'ai_generated';
    
    // Use database content for structured learning
    if (skillId && userState.currentSession?.type === 'study_learn') return 'database_content';
    
    // Use math generator for high-performing users
    if (userState.learningProfile.flowState > 0.7) return 'generated_math';
    
    return 'ai_generated';
  }

  private async generateAITask(userState: any, difficulty: number, skillId?: string, department: string = 'mathematics'): Promise<UnifiedTaskDefinition> {
    const prompt = `Generate a ${department} task at difficulty level ${difficulty}/10. 
    User cognitive load: ${Math.round(userState.learningProfile.cognitiveLoad * 100)}%
    User flow state: ${Math.round(userState.learningProfile.flowState * 100)}%
    Preferred style: ${userState.learningProfile.preferredStyle}
    
    Provide a clear problem statement suitable for this learner's current state.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a math tutor creating personalized problems. Respond with just the problem statement.' },
            { role: 'user', content: prompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      const content = data.choices[0].message.content;

      return {
        id: `ai_${Date.now()}`,
        type: 'ai_generated',
        department,
        skill: skillId || 'general',
        difficulty,
        content,
        metadata: { generated_at: new Date().toISOString() }
      };
    } catch (error) {
      console.error('Error generating AI task:', error);
      return this.getFallbackTask(difficulty, department);
    }
  }

  private async getDatabaseTask(skillId?: string, difficulty: number = 5): Promise<UnifiedTaskDefinition | null> {
    if (!skillId) return null;
    
    try {
      const { data: lessons } = await this.supabase
        .from('lessons')
        .select('*')
        .eq('is_active', true)
        .gte('difficulty_level', difficulty - 1)
        .lte('difficulty_level', difficulty + 1)
        .limit(1);
        
      if (!lessons?.length) return null;
      
      const lesson = lessons[0];
      return {
        id: `db_${lesson.id}`,
        type: 'database_content',
        department: 'mathematics',
        skill: skillId,
        difficulty: lesson.difficulty_level,
        content: lesson.title + '\n\n' + lesson.description,
        metadata: { lesson_id: lesson.id }
      };
    } catch (error) {
      console.error('Error getting database task:', error);
      return null;
    }
  }

  private async generateMathTask(difficulty: number, department: string, skillId?: string): Promise<UnifiedTaskDefinition> {
    // Simple math task generation
    const operations = ['+', '-', '*', '/'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    const range = Math.pow(10, Math.min(3, Math.max(1, difficulty - 2)));
    const a = Math.floor(Math.random() * range) + 1;
    const b = Math.floor(Math.random() * range) + 1;
    
    let content: string;
    let expectedAnswer: string;
    
    switch (operation) {
      case '+':
        content = `Oblicz: ${a} + ${b}`;
        expectedAnswer = (a + b).toString();
        break;
      case '-':
        content = `Oblicz: ${Math.max(a, b)} - ${Math.min(a, b)}`;
        expectedAnswer = (Math.max(a, b) - Math.min(a, b)).toString();
        break;
      case '*':
        content = `Oblicz: ${a} × ${b}`;
        expectedAnswer = (a * b).toString();
        break;
      case '/':
        const dividend = a * b;
        content = `Oblicz: ${dividend} ÷ ${a}`;
        expectedAnswer = b.toString();
        break;
      default:
        content = `Oblicz: ${a} + ${b}`;
        expectedAnswer = (a + b).toString();
    }
    
    return {
      id: `math_${Date.now()}`,
      type: 'generated_math',
      department,
      skill: skillId || 'arithmetic',
      difficulty,
      content,
      expectedAnswer,
      metadata: { operation, operands: [a, b] }
    };
  }

  private getFallbackTask(difficulty: number, department: string): UnifiedTaskDefinition {
    return {
      id: `fallback_${Date.now()}`,
      type: 'ai_generated',
      department,
      skill: 'general',
      difficulty,
      content: `Ćwiczenie na poziomie ${difficulty}/10. Napisz "Rozpocznij" aby kontynuować.`,
      metadata: { is_fallback: true }
    };
  }

  /**
   * AI RESPONSE GENERATION
   */
  private async generateAdaptiveResponse(
    request: UniversalLearningRequest, 
    userState: ConsolidatedUserState, 
    isCorrect: boolean | null
  ): Promise<string> {
    const systemPrompt = this.buildAdaptiveSystemPrompt(userState);
    
    const contextPrompt = `
Aktualny stan ucznia:
- Obciążenie kognitywne: ${Math.round(userState.learningProfile.cognitiveLoad * 100)}%
- Stan flow: ${Math.round(userState.learningProfile.flowState * 100)}%
- Poziom zmęczenia: ${Math.round(userState.learningProfile.fatigueLevel * 100)}%
- Poziom mistrzostwa: ${Math.round(userState.learningProfile.masteryLevel * 100)}%
- Dokładność ostatnich odpowiedzi: ${Math.round(userState.recentPerformance.accuracy * 100)}%
- Zalecana akcja: ${userState.recommendations.nextAction}
- Zalecony styl wyjaśnienia: ${userState.recommendations.explanationStyle}

${isCorrect === true ? 'Ostatnia odpowiedź: POPRAWNA ✅' : 
  isCorrect === false ? 'Ostatnia odpowiedź: NIEPOPRAWNA ❌' : 
  'Rozpoczęcie sesji nauki'}

${userState.recentPerformance.strugglingAreas.length > 0 ? 
  `Obszary problemowe: ${userState.recentPerformance.strugglingAreas.join(', ')}` : ''}
`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'system', content: contextPrompt },
            { role: 'user', content: request.userMessage || 'Kontynuuj naukę' }
          ],
          max_tokens: 500,
          temperature: 0.7
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return this.getFallbackResponse(userState, isCorrect);
    }
  }

  private buildAdaptiveSystemPrompt(userState: ConsolidatedUserState): string {
    let basePrompt = `Jesteś adaptacyjnym AI tutorem matematyki. `;
    
    // Adapt based on cognitive load
    if (userState.learningProfile.cognitiveLoad > 0.7) {
      basePrompt += `Uczeń ma wysokie obciążenie kognitywne - używaj prostego języka, krótkich wyjaśnień i więcej zachęty. `;
    } else if (userState.learningProfile.flowState > 0.7) {
      basePrompt += `Uczeń jest w dobrym stanie flow - możesz wprowadzić trudniejsze wyzwania. `;
    }

    // Adapt based on fatigue
    if (userState.learningProfile.fatigueLevel > 0.6) {
      basePrompt += `Uczeń jest zmęczony - sugeruj przerwy i używaj krótszych zadań. `;
    }

    // Adapt style based on recommendations
    switch (userState.recommendations.explanationStyle) {
      case 'step-by-step':
        basePrompt += `Zawsze wyjaśniaj krok po kroku z numerowaną listą. `;
        break;
      case 'concise':
        basePrompt += `Bądź zwięzły i idź prosto do sedna. `;
        break;
      case 'balanced':
        basePrompt += `Używaj zbalansowanego podejścia - nie za długo, nie za krótko. `;
        break;
    }

    return basePrompt + `Zawsze odpowiadaj w języku polskim i dostosowuj trudność do aktualnego stanu ucznia.`;
  }

  private getFallbackResponse(userState: ConsolidatedUserState, isCorrect: boolean | null): string {
    if (isCorrect === true) {
      return "Świetnie! 🎉 Kontynuujmy naukę.";
    } else if (isCorrect === false) {
      return "Nie martw się, błędy to część nauki. Spróbujmy jeszcze raz! 💪";
    } else {
      return `Cześć! Jestem Twoim AI tutorem. ${userState.recommendations.recommendedContent}`;
    }
  }

  /**
   * HELPER METHODS
   */
  private async logLearningInteraction(userId: string, data: any): Promise<void> {
    try {
      await this.supabase.from('validation_logs').insert({
        user_id: userId,
        is_correct: data.isCorrect ?? false,
        confidence: data.isCorrect ? 0.9 : 0.3,
        response_time: data.responseTime,
        session_type: data.sessionType,
        session_id: data.sessionId,
        task_id: null,
        detected_misconception: null
      });
    } catch (error) {
      console.error('Error logging interaction:', error);
    }
  }

  private async updateCurrentSession(sessionId: string, updates: any): Promise<void> {
    try {
      // Get current session
      const { data: session } = await this.supabase
        .from('unified_learning_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (!session) return;

      // Calculate new values
      const newTasksCompleted = updates.taskCompleted ? session.tasks_completed + 1 : session.tasks_completed;
      const newCorrectAnswers = updates.isCorrect ? session.correct_answers + 1 : session.correct_answers;
      const newTotalResponseTime = session.total_response_time_ms + (updates.responseTime || 0);
      const newHintsUsed = session.hints_used + (updates.hintsUsed || 0);

      // Update session
      await this.supabase
        .from('unified_learning_sessions')
        .update({
          tasks_completed: newTasksCompleted,
          correct_answers: newCorrectAnswers,
          total_response_time_ms: newTotalResponseTime,
          hints_used: newHintsUsed,
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error updating session:', error);
    }
  }

  private selectOptimalAIModel(userState: ConsolidatedUserState): string {
    // Use faster models for users with high cognitive load
    if (userState.learningProfile.cognitiveLoad > 0.7) {
      return 'gpt-4o-mini';
    }
    
    // Use more powerful models for users in flow state
    if (userState.learningProfile.flowState > 0.7) {
      return 'gpt-4o';
    }
    
    return 'gpt-4o-mini'; // Default
  }

  private getDefaultUserState(userId: string): ConsolidatedUserState {
    return {
      userId,
      learningProfile: {
        learningVelocity: 1.0,
        difficultyMultiplier: 1.0,
        preferredStyle: 'balanced',
        cognitiveLoad: 0.5,
        masteryLevel: 0.5,
        flowState: 0.5,
        fatigueLevel: 0.0,
        attentionSpan: 25
      },
      currentSession: null,
      recentPerformance: {
        accuracy: 0.5,
        averageResponseTime: 30000,
        recentTopics: [],
        strugglingAreas: [],
        masteredSkills: [],
        errorPatterns: {}
      },
      recommendations: {
        nextAction: 'continue',
        suggestedDifficulty: 5,
        recommendedContent: 'Rozpocznij swoją spersonalizowaną naukę!',
        explanationStyle: 'balanced',
        estimatedSessionTime: 30
      }
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get user from auth
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    const request: UniversalLearningRequest = await req.json();
    const engine = new UniversalLearningEngine(supabaseClient);
    
    let result;
    
    switch (request.action) {
      case 'get_state':
        result = { userState: await engine.getConsolidatedUserState(request.userId || user.id) };
        break;
      
      case 'process_interaction':
        result = await engine.processLearningInteraction({
          ...request,
          userId: request.userId || user.id
        });
        break;
      
      case 'start_session':
        const sessionId = await engine.startUniversalSession(
          request.userId || user.id,
          request.sessionType || 'mixed',
          request.skillId,
          request.department || 'mathematics'
        );
        result = { sessionId };
        break;
      
      case 'generate_task':
        const task = await engine.generateUniversalTask(
          request.userId || user.id,
          request.difficulty || 5,
          request.skillId,
          request.department || 'mathematics'
        );
        result = { task };
        break;
      
      case 'get_recommendations':
        const userState = await engine.getConsolidatedUserState(request.userId || user.id);
        result = { recommendations: userState.recommendations };
        break;
      
      default:
        throw new Error(`Unknown action: ${request.action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in universal learning engine:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});