import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface LearningContext {
  userId: string;
  sessionId?: string;
  sessionType: 'ai_chat' | 'study_learn' | 'diagnostic' | 'mixed';
  department: string;
  currentSkill?: string;
  userResponse?: string;
  isCorrect?: boolean;
  responseTime?: number;
  confidence?: number;
  hintsUsed?: number;
}

interface AdaptationDecision {
  newDifficulty: number;
  recommendedAction: 'continue' | 'review' | 'advance' | 'switch_mode' | 'take_break';
  contentSource: 'ai_generation' | 'database_content' | 'task_generator';
  explanationStyle: 'concise' | 'detailed' | 'visual' | 'step-by-step';
  feedbackMessage?: string;
  adaptationReason: string;
  nextTaskSuggestion?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, context } = await req.json() as {
      action: 'orchestrate' | 'start_session' | 'update_session' | 'complete_session' | 'get_profile';
      context: LearningContext & any;
    };

    console.log(`Processing ${action} for user ${context.userId}`);

    switch (action) {
      case 'get_profile':
        return await getOrCreateProfile(context.userId);

      case 'start_session':
        return await startLearningSession(context);

      case 'update_session':
        return await updateLearningSession(context);

      case 'complete_session':
        return await completeLearningSession(context);

      case 'orchestrate':
        return await orchestrateLearning(context);

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in unified-learning function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getOrCreateProfile(userId: string) {
  try {
    // Try to get existing profile
    const { data: existing, error: fetchError } = await supabase
      .from('universal_learner_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existing && !fetchError) {
      return new Response(
        JSON.stringify({ profile: existing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabase
      .from('universal_learner_profiles')
      .insert({
        user_id: userId,
        diagnostic_summary: {},
        learning_style: { visual: 0.33, auditory: 0.33, kinesthetic: 0.33 },
        response_patterns: { avg_response_time: 30000, confidence_pattern: 'moderate' },
        error_patterns: {},
        skill_mastery_map: {},
        micro_skill_strengths: {},
        prerequisite_gaps: {},
        optimal_difficulty_range: { min: 3, max: 7 },
        engagement_triggers: { variety: true, progress_feedback: true },
        current_learning_context: {},
        last_interaction_summary: {},
        next_recommended_action: { type: 'diagnostic', priority: 'high' }
      })
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create profile: ${createError.message}`);
    }

    return new Response(
      JSON.stringify({ profile: newProfile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in getOrCreateProfile:', error);
    throw error;
  }
}

async function startLearningSession(context: LearningContext) {
  try {
    // Get user profile first
    const profileResponse = await getOrCreateProfile(context.userId);
    const profileData = await profileResponse.json();
    const profile = profileData.profile;

    if (!profile) {
      throw new Error('Failed to get user profile');
    }

    // Calculate initial difficulty
    const initialDifficulty = calculateOptimalDifficulty(profile, context.currentSkill);

    // Create session
    const { data: session, error } = await supabase
      .from('unified_learning_sessions')
      .insert({
        user_id: context.userId,
        profile_id: profile.id,
        session_type: context.sessionType,
        skill_focus: context.currentSkill,
        department: context.department,
        difficulty_level: initialDifficulty,
        ai_model_used: selectOptimalAIModel(profile),
        explanation_style_used: profile.preferred_explanation_style,
        engagement_score: 0.5,
        learning_momentum: 1.0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }

    return new Response(
      JSON.stringify({ sessionId: session.id, initialDifficulty }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in startLearningSession:', error);
    throw error;
  }
}

async function updateLearningSession(context: any) {
  try {
    if (!context.sessionId) {
      throw new Error('Session ID is required for updates');
    }

    // Get current session
    const { data: session, error: fetchError } = await supabase
      .from('unified_learning_sessions')
      .select('*')
      .eq('id', context.sessionId)
      .single();

    if (fetchError || !session) {
      throw new Error(`Failed to fetch session: ${fetchError?.message}`);
    }

    // Calculate updates
    const updates: any = {};

    if (context.taskCompleted) {
      updates.tasks_completed = session.tasks_completed + 1;
    }
    if (context.isCorrect !== undefined) {
      updates.correct_answers = context.isCorrect ? session.correct_answers + 1 : session.correct_answers;
    }
    if (context.responseTime) {
      updates.total_response_time_ms = session.total_response_time_ms + context.responseTime;
    }
    if (context.hintsUsed) {
      updates.hints_used = session.hints_used + context.hintsUsed;
    }
    if (context.newConcepts?.length > 0) {
      const existingConcepts = Array.isArray(session.concepts_learned) ? session.concepts_learned : [];
      updates.concepts_learned = [...existingConcepts, ...context.newConcepts];
    }

    // Calculate engagement score
    const tasksCompleted = updates.tasks_completed || session.tasks_completed;
    const correctAnswers = updates.correct_answers || session.correct_answers;
    const accuracyRate = tasksCompleted > 0 ? correctAnswers / tasksCompleted : 0.5;
    
    updates.engagement_score = Math.max(0.1, Math.min(1.0, accuracyRate));
    updates.learning_momentum = Math.max(0.5, Math.min(2.0, updates.engagement_score * 1.5));

    // Apply updates
    const { error: updateError } = await supabase
      .from('unified_learning_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', context.sessionId);

    if (updateError) {
      throw new Error(`Failed to update session: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ success: true, updates }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in updateLearningSession:', error);
    throw error;
  }
}

async function completeLearningSession(context: any) {
  try {
    if (!context.sessionId) {
      throw new Error('Session ID is required');
    }

    // Complete the session
    const { error } = await supabase
      .from('unified_learning_sessions')
      .update({
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', context.sessionId);

    if (error) {
      throw new Error(`Failed to complete session: ${error.message}`);
    }

    // The trigger will automatically update the learner profile

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in completeLearningSession:', error);
    throw error;
  }
}

async function orchestrateLearning(context: LearningContext): Promise<Response> {
  try {
    // Get user profile
    const profileResponse = await getOrCreateProfile(context.userId);
    const profileData = await profileResponse.json();
    const profile = profileData.profile;

    // Simple orchestration logic
    const decision: AdaptationDecision = {
      newDifficulty: calculateAdaptiveDifficulty(context, profile),
      recommendedAction: determineNextAction(context, profile),
      contentSource: selectContentSource(context, profile),
      explanationStyle: selectExplanationStyle(context, profile),
      feedbackMessage: generateFeedback(context, profile),
      adaptationReason: generateAdaptationReason(context, profile)
    };

    return new Response(
      JSON.stringify({ decision }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in orchestrateLearning:', error);
    throw error;
  }
}

// Helper functions
function calculateOptimalDifficulty(profile: any, skillId?: string): number {
  let baseDifficulty = 5; // Default middle difficulty

  if (skillId && profile.skill_mastery_map?.[skillId]) {
    const skillMastery = profile.skill_mastery_map[skillId];
    baseDifficulty = Math.max(1, Math.min(10, skillMastery.level || 5));
  }

  baseDifficulty *= profile.difficulty_multiplier || 1.0;
  baseDifficulty *= profile.learning_velocity || 1.0;

  const minDiff = profile.optimal_difficulty_range?.min || 1;
  const maxDiff = profile.optimal_difficulty_range?.max || 10;
  
  return Math.max(minDiff, Math.min(maxDiff, Math.round(baseDifficulty)));
}

function selectOptimalAIModel(profile: any): string {
  if (profile.response_patterns?.avg_response_time < 20000) {
    return 'gpt-4o-mini';
  }
  if (profile.preferred_explanation_style === 'detailed' || profile.learning_velocity < 0.8) {
    return 'gpt-4o';
  }
  return 'gpt-4o-mini';
}

function calculateAdaptiveDifficulty(context: LearningContext, profile: any): number {
  const currentDifficulty = profile.current_learning_context?.current_difficulty || 5;
  
  if (context.isCorrect === undefined) {
    return currentDifficulty;
  }

  let adjustment = context.isCorrect ? 1 : -1;
  
  if (context.responseTime) {
    const avgTime = profile.response_patterns?.avg_response_time || 30000;
    if (context.responseTime < avgTime * 0.7) adjustment += 0.5;
    if (context.responseTime > avgTime * 1.5) adjustment -= 0.5;
  }

  if (context.confidence) {
    if (context.confidence > 0.8 && context.isCorrect) adjustment += 0.5;
    if (context.confidence < 0.4) adjustment -= 0.5;
  }

  const newDifficulty = Math.max(1, Math.min(10, currentDifficulty + adjustment));
  return Math.round(newDifficulty);
}

function determineNextAction(context: LearningContext, profile: any): AdaptationDecision['recommendedAction'] {
  if (!context.isCorrect && context.hintsUsed === 0) {
    return 'review';
  }
  if (context.isCorrect && context.confidence && context.confidence > 0.8) {
    return 'advance';
  }
  return 'continue';
}

function selectContentSource(context: LearningContext, profile: any): AdaptationDecision['contentSource'] {
  if (context.sessionType === 'diagnostic') return 'database_content';
  if (context.sessionType === 'ai_chat') return 'ai_generation';
  return 'task_generator';
}

function selectExplanationStyle(context: LearningContext, profile: any): AdaptationDecision['explanationStyle'] {
  const style = profile.preferred_explanation_style || 'detailed';
  if (style === 'balanced') return 'detailed';
  return style as AdaptationDecision['explanationStyle'];
}

function generateFeedback(context: LearningContext, profile: any): string {
  if (context.isCorrect === true) {
    return "Świetnie! Kontynuuj dobrą pracę.";
  } else if (context.isCorrect === false) {
    return "Nie martw się, to część procesu nauki. Spróbujmy ponownie.";
  }
  return "Rozpocznijmy Twoją spersonalizowaną sesję nauki!";
}

function generateAdaptationReason(context: LearningContext, profile: any): string {
  if (context.isCorrect === true) {
    return "prawidłowa odpowiedź - kontynuujemy";
  } else if (context.isCorrect === false) {
    return "nieprawidłowa odpowiedź - dostosowujemy poziom";
  }
  return "rozpoczynamy nową sesję z spersonalizowanymi ustawieniami";
}