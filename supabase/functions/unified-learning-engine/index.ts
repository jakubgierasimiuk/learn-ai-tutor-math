import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Import from study-tutor
import { evaluateAnswer, MathContext } from '../study-tutor/mathValidation.ts';
import { analyzeStudentAnswer, StudentProfile } from '../study-tutor/adaptivePedagogy.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LearningRequest {
  userMessage: string;
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
  sessionId?: string;
  skillId?: string;
  responseTime?: number;
  department: string;
  currentSkill?: string;
}

interface ConsolidatedLearnerData {
  userId: string;
  currentCognitiveLoad: number;
  attentionSpan: number;
  fatigueLevel: number;
  flowState: number;
  averageResponseTime: number;
  accuracyTrend: number[];
  errorPatterns: Record<string, number>;
  preferredDifficulty: number;
  explanationPreference: 'visual' | 'step-by-step' | 'concise' | 'detailed';
  optimalSessionLength: number;
  dropoutRisk: number;
  nextStruggleAreas: string[];
  masteryReadiness: Record<string, number>;
}

class UnifiedLearningEngine {
  private supabase: any;
  private openAIKey: string;
  
  constructor(supabase: any) {
    this.supabase = supabase;
    this.openAIKey = Deno.env.get('OPENAI_API_KEY') || '';
  }

  /**
   * UNIFIED DATA CONSOLIDATION - real-time from all sources
   */
  async getConsolidatedData(userId: string): Promise<ConsolidatedLearnerData> {
    const [
      validationLogs,
      lessonSteps,
      skillProgress,
      sessions
    ] = await Promise.all([
      this.supabase.from('validation_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50),
      this.supabase.from('lesson_steps').select('*').eq('session_id', userId).order('created_at', { ascending: false }).limit(50),
      this.supabase.from('skill_progress').select('*').eq('user_id', userId),
      this.supabase.from('study_sessions').select('*').eq('user_id', userId).order('started_at', { ascending: false }).limit(10)
    ]);

    return this.calculateRealTimeMetrics({
      validationLogs: validationLogs.data || [],
      lessonSteps: lessonSteps.data || [],
      skillProgress: skillProgress.data || [],
      sessions: sessions.data || [],
      userId
    });
  }

  /**
   * REAL-TIME METRIC CALCULATION
   */
  private calculateRealTimeMetrics(data: any): ConsolidatedLearnerData {
    const { validationLogs, lessonSteps, skillProgress, sessions, userId } = data;
    
    // Combine all interaction data
    const allInteractions = [
      ...validationLogs.map((log: any) => ({
        isCorrect: log.is_correct,
        responseTime: log.response_time,
        timestamp: log.created_at,
        misconception: log.detected_misconception
      })),
      ...lessonSteps.map((step: any) => ({
        isCorrect: step.is_correct,
        responseTime: step.response_time_ms,
        timestamp: step.created_at
      }))
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 20);

    // Calculate cognitive load (more errors + slower response = higher load)
    const recentAccuracy = allInteractions.length > 0 
      ? allInteractions.filter(i => i.isCorrect).length / allInteractions.length 
      : 0.5;
    const avgResponseTime = allInteractions.length > 0
      ? allInteractions.reduce((sum, i) => sum + (i.responseTime || 5000), 0) / allInteractions.length
      : 5000;
    
    const cognitiveLoad = Math.min(1, (1 - recentAccuracy) * 0.6 + Math.min(avgResponseTime / 10000, 0.4));
    
    // Calculate flow state (high accuracy + optimal response time = flow)
    const flowState = recentAccuracy > 0.7 && avgResponseTime > 2000 && avgResponseTime < 8000 
      ? Math.min(1, recentAccuracy * 1.2) 
      : recentAccuracy * 0.8;

    // Calculate fatigue (long session or declining performance)
    const sessionDuration = sessions.length > 0 ? Date.now() - new Date(sessions[0].started_at).getTime() : 0;
    const fatigueLevel = Math.min(1, (sessionDuration / (45 * 60 * 1000)) + (cognitiveLoad * 0.3));

    // Error patterns analysis
    const misconceptions = validationLogs
      .filter((log: any) => log.detected_misconception)
      .reduce((acc: any, log: any) => {
        acc[log.detected_misconception] = (acc[log.detected_misconception] || 0) + 1;
        return acc;
      }, {});

    // Preferred difficulty from skill progress
    const avgMastery = skillProgress.length > 0 
      ? skillProgress.reduce((sum: number, skill: any) => sum + (skill.mastery_level || 0), 0) / skillProgress.length
      : 50;
    const preferredDifficulty = Math.round((avgMastery / 100) * 10);

    return {
      userId,
      currentCognitiveLoad: cognitiveLoad,
      attentionSpan: Math.max(15, 45 - (fatigueLevel * 30)),
      fatigueLevel,
      flowState,
      averageResponseTime: avgResponseTime,
      accuracyTrend: allInteractions.slice(0, 10).map(i => i.isCorrect ? 1 : 0),
      errorPatterns: misconceptions,
      preferredDifficulty,
      explanationPreference: cognitiveLoad > 0.7 ? 'step-by-step' : 'concise',
      optimalSessionLength: Math.max(15, 45 - (fatigueLevel * 20)),
      dropoutRisk: Math.min(1, fatigueLevel * 0.6 + (cognitiveLoad * 0.4)),
      nextStruggleAreas: Object.keys(misconceptions).slice(0, 3),
      masteryReadiness: skillProgress.reduce((acc: any, skill: any) => {
        acc[skill.skill_id] = (skill.mastery_level || 0) / 100;
        return acc;
      }, {})
    };
  }

  /**
   * PROCESS LEARNING INTERACTION - validates, adapts, responds
   */
  async processInteraction(request: LearningRequest, userId: string) {
    console.log('[UnifiedEngine] Processing interaction:', request.sessionType);

    // 1. Get consolidated learner data
    const learnerData = await this.getConsolidatedData(userId);
    
    // 2. Validate mathematical answer if applicable
    let isCorrect: boolean | null = null;
    let misconception: string | null = null;
    
    if (request.sessionType === 'study_learn' || this.containsMath(request.userMessage)) {
      const mathContext: MathContext = {
        userAnswer: request.userMessage,
        expectedAnswer: '', // We'll get this from AI or content
        skillContext: request.currentSkill || 'general'
      };
      
      const validation = await evaluateAnswer(mathContext);
      isCorrect = validation.isCorrect;
      misconception = validation.detectedMisconception || null;
    }

    // 3. Log interaction for future analysis
    await this.logInteraction(userId, {
      userResponse: request.userMessage,
      isCorrect,
      responseTime: request.responseTime || 0,
      sessionType: request.sessionType,
      misconception,
      cognitiveLoad: learnerData.currentCognitiveLoad,
      flowState: learnerData.flowState
    });

    // 4. Generate AI response with adaptive context
    const aiResponse = await this.generateAIResponse(request, learnerData, isCorrect);

    // 5. Calculate adaptations for next interaction
    const adaptations = this.calculateAdaptations(learnerData, isCorrect);

    return {
      message: aiResponse,
      learnerData,
      adaptations,
      isCorrect,
      misconception,
      insights: {
        cognitiveLoad: learnerData.currentCognitiveLoad,
        flowState: learnerData.flowState,
        recommendedAction: adaptations.nextAction
      }
    };
  }

  private containsMath(message: string): boolean {
    return /[\d+\-*/=()x²√∫∞]/.test(message) || /\b(równanie|wzór|oblicz|rozwiąż)\b/i.test(message);
  }

  private async logInteraction(userId: string, data: any) {
    // Log to validation_logs for unified tracking
    await this.supabase.from('validation_logs').insert({
      user_id: userId,
      is_correct: data.isCorrect ?? false,
      confidence: data.isCorrect ? 0.9 : 0.3,
      response_time: data.responseTime,
      session_type: data.sessionType,
      detected_misconception: data.misconception
    });

    // Log to learning_interactions for detailed analysis
    await this.supabase.from('learning_interactions').insert({
      user_id: userId,
      session_id: crypto.randomUUID(),
      interaction_type: data.sessionType,
      response_time_ms: data.responseTime,
      correctness_level: data.isCorrect ? 1.0 : 0.0,
      cognitive_load_estimate: data.cognitiveLoad,
      flow_state_probability: data.flowState,
      misconceptions_activated: data.misconception ? [data.misconception] : []
    });
  }

  private async generateAIResponse(request: LearningRequest, learnerData: ConsolidatedLearnerData, isCorrect: boolean | null) {
    const systemPrompt = this.buildAdaptiveSystemPrompt(learnerData, request.sessionType);
    
    const contextPrompt = `
Dane ucznia:
- Poziom kognitywny: ${Math.round(learnerData.currentCognitiveLoad * 100)}%
- Stan flow: ${Math.round(learnerData.flowState * 100)}%
- Zmęczenie: ${Math.round(learnerData.fatigueLevel * 100)}%
- Preferowana trudność: ${learnerData.preferredDifficulty}/10
- Ostatnia odpowiedź: ${isCorrect === true ? 'POPRAWNA' : isCorrect === false ? 'NIEPOPRAWNA' : 'NIEEWALUOWANA'}

Obszary problemowe: ${learnerData.nextStruggleAreas.join(', ')}
Preferowany styl: ${learnerData.explanationPreference}
`;

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
          { role: 'user', content: request.userMessage }
        ],
        max_tokens: 500,
        temperature: 0.7
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private buildAdaptiveSystemPrompt(learnerData: ConsolidatedLearnerData, sessionType: string): string {
    let basePrompt = `Jesteś adaptacyjnym tutorem matematyki. `;
    
    // Adapt based on cognitive load
    if (learnerData.currentCognitiveLoad > 0.7) {
      basePrompt += `Uczeń ma wysokie obciążenie kognitywne - używaj prostego języka, krótkich wyjaśnień i więcej zachęty. `;
    } else if (learnerData.flowState > 0.7) {
      basePrompt += `Uczeń jest w dobrym stanie flow - możesz wprowadzić trudniejsze wyzwania. `;
    }

    // Adapt based on fatigue
    if (learnerData.fatigueLevel > 0.6) {
      basePrompt += `Uczeń jest zmęczony - sugeruj przerwy i używaj krótszych zadań. `;
    }

    // Adapt style
    switch (learnerData.explanationPreference) {
      case 'step-by-step':
        basePrompt += `Zawsze wyjaśniaj krok po kroku z numerowaną listą. `;
        break;
      case 'visual':
        basePrompt += `Używaj diagramów ASCII i wizualnych reprezentacji gdy możliwe. `;
        break;
      case 'concise':
        basePrompt += `Bądź zwięzły i idź prosto do sedna. `;
        break;
    }

    return basePrompt + `Zawsze odpowiadaj w języku polskim i dostosowuj trudność do poziomu ${learnerData.preferredDifficulty}/10.`;
  }

  private calculateAdaptations(learnerData: ConsolidatedLearnerData, isCorrect: boolean | null) {
    let nextAction = 'continue';
    let difficultyAdjustment = 0;
    
    // High cognitive load or fatigue - suggest break
    if (learnerData.currentCognitiveLoad > 0.8 || learnerData.fatigueLevel > 0.7) {
      nextAction = 'suggest_break';
    }
    // High flow state - maintain momentum  
    else if (learnerData.flowState > 0.7) {
      nextAction = 'maintain_flow';
      difficultyAdjustment = 1;
    }
    // High dropout risk - provide support
    else if (learnerData.dropoutRisk > 0.6) {
      nextAction = 'provide_support';
      difficultyAdjustment = -1;
    }

    return {
      nextAction,
      difficultyAdjustment,
      recommendedBreakDuration: Math.round(learnerData.fatigueLevel * 15),
      nextContentType: learnerData.flowState > 0.6 ? 'challenge' : 'review'
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

    const request: LearningRequest = await req.json();
    
    const engine = new UnifiedLearningEngine(supabaseClient);
    const result = await engine.processInteraction(request, user.id);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in unified learning engine:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});