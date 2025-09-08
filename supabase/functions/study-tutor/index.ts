import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input sanitization function
function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .slice(0, 10000); // Limit input length
}

// Error handler that doesn't expose sensitive information
function createSafeErrorResponse(error: any, message: string = 'An error occurred') {
  console.error('Study-tutor error:', error);
  return new Response(
    JSON.stringify({ 
      error: message,
      timestamp: new Date().toISOString()
    }),
    { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  );
}

// Educational context building functions
async function buildEducationalContext(params: {
  userId: string;
  skillId?: string;
  sessionId?: string;
  supabaseClient: any;
  interactionType: 'initial' | 'ongoing' | 'response_analysis';
}): Promise<{ systemPromptAddition: string } | null> {
  const { userId, skillId, sessionId, supabaseClient, interactionType } = params;
  
  try {
    console.log('Building educational context for:', { userId, skillId, sessionId, interactionType });
    
    const contextParts: string[] = [];
    
    // Level 1: Basic cognitive profile and skill content (always when enabled)
    const [cognitiveProfile, skillContent, progressData] = await Promise.all([
      fetchCognitiveProfile(supabaseClient, userId),
      skillId ? fetchSkillContent(supabaseClient, skillId) : null,
      skillId ? fetchSkillProgress(supabaseClient, userId, skillId) : null
    ]);
    
    if (cognitiveProfile) {
      console.log('Adding cognitive profile to context for user:', userId);
      contextParts.push(formatCognitiveProfileContext(cognitiveProfile));
    } else {
      console.log('No cognitive profile available for user:', userId);
    }
    
    if (skillContent) {
      contextParts.push(formatSkillContentContext(skillContent));
    }
    
    if (progressData) {
      contextParts.push(formatProgressContext(progressData));
    }
    
    // Level 2: Learning interactions and behavior patterns
    const [recentInteractions, emotionalState, metacognitiveProfile] = await Promise.all([
      fetchRecentLearningInteractions(supabaseClient, userId),
      fetchEmotionalLearningState(supabaseClient, userId),
      fetchMetacognitiveProfile(supabaseClient, userId)
    ]);
    
    if (recentInteractions && recentInteractions.length > 0) {
      contextParts.push(formatLearningInteractionsContext(recentInteractions));
    }
    
    if (emotionalState) {
      contextParts.push(formatEmotionalStateContext(emotionalState));
    }
    
    if (metacognitiveProfile) {
      contextParts.push(formatMetacognitiveContext(metacognitiveProfile));
    }

    // Level 3: Misconceptions and session history (if available)
    if (interactionType !== 'initial') {
      const [misconceptions, sessionHistory] = await Promise.all([
        fetchActiveMisconceptions(supabaseClient, userId),
        sessionId ? fetchSessionHistory(supabaseClient, sessionId) : null
      ]);
      
      if (misconceptions && misconceptions.length > 0) {
        contextParts.push(formatMisconceptionsContext(misconceptions));
      }
      
      if (sessionHistory) {
        contextParts.push(formatSessionHistoryContext(sessionHistory));
      }
    }
    
    // Level 4: Advanced pedagogical guidance (for ongoing interactions)
    if (interactionType === 'ongoing' && skillContent) {
      const pedagogicalGuidance = buildPedagogicalInstructions(skillContent, cognitiveProfile);
      if (pedagogicalGuidance) {
        contextParts.push(pedagogicalGuidance);
      }
    }
    
    if (contextParts.length === 0) {
      return null;
    }
    
    const systemPromptAddition = `
=== KONTEKST EDUKACYJNY ===
${contextParts.join('\n\n')}
=== KONIEC KONTEKSTU ===

INSTRUKCJE PEDAGOGICZNE:
- Wykorzystaj powyższy kontekst do personalizacji swojej odpowiedzi
- Dostosuj trudność i styl wyjaśnień do profilu kognitywnego ucznia
- Unikaj powtarzania błędnych koncepcji, które już zidentyfikowałeś
- Jeśli uczeń pokazuje wzorce trudności, zastosuj odpowiednie strategie wsparcia
`;
    
    console.log('Educational context built successfully, total length:', systemPromptAddition.length);
    return { systemPromptAddition };
    
  } catch (error) {
    console.error('Error building educational context:', error);
    return null;
  }
}

async function fetchCognitiveProfile(supabaseClient: any, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('learner_intelligence')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching cognitive profile:', error);
      return null;
    }
    
    if (!data) {
      console.log('No cognitive profile found for user:', userId, '- using default profile');
      // Return default profile structure if none exists
      return {
        user_id: userId,
        cognitive_load_capacity: 7.0,
        processing_speed_percentile: 50,
        working_memory_span: 4,
        attention_span_minutes: 25.0,
        learning_velocity: {"math": 1.0, "reading": 1.0, "reasoning": 1.0},
        mastery_acquisition_rate: 0.8,
        retention_half_life: {"long_term": 168, "short_term": 24},
        emotional_state: {"flow_triggers": [], "baseline_arousal": 0.5, "stress_threshold": 0.7},
        motivation_drivers: {"mastery": 0.5, "purpose": 0.5, "autonomy": 0.5},
        frustration_patterns: {"triggers": [], "threshold": 3, "recovery_time": 5},
        metacognitive_skills: {"planning": 3, "evaluating": 3, "monitoring": 3},
        learning_strategies: {"avoided": [], "effective": [], "preferred": []},
        self_regulation_score: 0.5
      };
    }
    
    console.log('Cognitive profile found for user:', userId);
    return data;
  } catch (error) {
    console.error('Exception in fetchCognitiveProfile:', error);
    return null;
  }
}

async function fetchSkillContent(supabaseClient: any, skillId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('unified_skill_content')
      .select('content_data')
      .eq('skill_id', skillId)
      .maybeSingle();
    
    if (error || !data) {
      console.log('No skill content found');
      return null;
    }
    
    return data.content_data;
  } catch (error) {
    console.error('Error fetching skill content:', error);
    return null;
  }
}

async function fetchSkillProgress(supabaseClient: any, userId: string, skillId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('skill_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .maybeSingle();
    
    if (error) {
      console.log('No skill progress found');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching skill progress:', error);
    return null;
  }
}

async function fetchActiveMisconceptions(supabaseClient: any, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('misconception_networks')
      .select('*')
      .eq('user_id', userId)
      .gte('strength', 0.3)
      .order('strength', { ascending: false })
      .limit(5);
    
    if (error) {
      console.log('No misconceptions found');
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching misconceptions:', error);
    return [];
  }
}

async function fetchRecentLearningInteractions(supabaseClient: any, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('learning_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('interaction_timestamp', { ascending: false })
      .limit(10);
    
    if (error) {
      console.log('No learning interactions found:', error);
      return [];
    }
    
    console.log(`Found ${data?.length || 0} recent learning interactions for user ${userId}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching learning interactions:', error);
    return [];
  }
}

async function fetchEmotionalLearningState(supabaseClient: any, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('emotional_learning_states')
      .select('*')
      .eq('user_id', userId)
      .order('detected_at', { ascending: false })
      .limit(3);
    
    if (error) {
      console.log('No emotional learning states found:', error);
      return null;
    }
    
    console.log(`Found ${data?.length || 0} emotional learning states for user ${userId}`);
    return data && data.length > 0 ? data : null;
  } catch (error) {
    console.error('Error fetching emotional learning states:', error);
    return null;
  }
}

async function fetchMetacognitiveProfile(supabaseClient: any, userId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('metacognitive_development')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.log('No metacognitive profile found:', error);
      return null;
    }
    
    console.log(`Metacognitive profile found for user ${userId}:`, !!data);
    return data;
  } catch (error) {
    console.error('Error fetching metacognitive profile:', error);
    return null;
  }
}

async function fetchSessionHistory(supabaseClient: any, sessionId: string) {
  try {
    const { data, error } = await supabaseClient
      .from('study_sessions')
      .select('summary_state, mastery_score, hints_used, pseudo_activity_strikes')
      .eq('id', sessionId)
      .maybeSingle();
    
    if (error) {
      console.log('No session history found');
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching session history:', error);
    return null;
  }
}

function formatCognitiveProfileContext(profile: any): string {
  return ''; // Disabled - using static defaults
}

function formatLearningInteractionsContext(interactions: any[]): string {
  if (!interactions || interactions.length === 0) return '';
  
  const recentInteractions = interactions.slice(0, 5);
  const avgResponseTime = recentInteractions.reduce((sum, int) => sum + (int.response_time_ms || 0), 0) / recentInteractions.length;
  const avgEngagement = recentInteractions.reduce((sum, int) => sum + (int.engagement_score || 0.5), 0) / recentInteractions.length;
  const avgCognitiveLoad = recentInteractions.reduce((sum, int) => sum + (int.cognitive_load_estimate || 0.5), 0) / recentInteractions.length;
  
  return `OSTATNIE INTERAKCJE UCZNIA:
- Liczba interakcji: ${interactions.length}
- Średni czas odpowiedzi: ${Math.round(avgResponseTime)}ms
- Średni poziom zaangażowania: ${Math.round(avgEngagement * 100)}%
- Średnie obciążenie kognitywne: ${Math.round(avgCognitiveLoad * 100)}%
- Wykryte umiejętności: ${JSON.stringify(recentInteractions.flatMap(i => i.skills_demonstrated || []).slice(0, 3))}
- Błędne koncepcje: ${JSON.stringify(recentInteractions.flatMap(i => i.misconceptions_activated || []).slice(0, 3))}`;
}

function formatEmotionalStateContext(emotionalStates: any[]): string {
  if (!emotionalStates || emotionalStates.length === 0) return '';
  
  const recent = emotionalStates[0];
  return `STAN EMOCJONALNY UCZNIA:
- Ostatnia wykryta emocja: ${recent.detected_emotion || 'neutralna'}
- Intensywność: ${Math.round((recent.emotion_intensity || 0.5) * 100)}%
- Skuteczność nauki w tym stanie: ${Math.round((recent.learning_effectiveness_during_emotion || 0.5) * 100)}%
- Odporność emocjonalna: ${Math.round((recent.emotional_resilience_score || 0.5) * 100)}%
- Rekomendowane interwencje: ${JSON.stringify(recent.optimal_interventions || [])}`;
}

function formatMetacognitiveContext(profile: any): string {
  if (!profile) return '';
  
  return `PROFIL METAKOGNITYWNY:
- Umiejętności planowania: ${JSON.stringify(profile.planning_skills || {})}
- Umiejętności monitorowania: ${JSON.stringify(profile.monitoring_skills || {})}
- Umiejętności ewaluacji: ${JSON.stringify(profile.evaluation_skills || {})}
- Kontrola impulsów: ${Math.round((profile.impulse_control_score || 0.5) * 100)}%
- Wytrwałość: ${Math.round((profile.persistence_score || 0.5) * 100)}%
- Poziom wsparcia potrzebny: ${profile.scaffolding_level_needed || 3}/5`;
}

function formatSkillContentContext(skillContent: any): string {
  const parts = [];
  
  if (skillContent.theory) {
    parts.push(`Teoria: ${skillContent.theory.theory_text?.substring(0, 200)}...`);
  }
  
  if (skillContent.examples && skillContent.examples.length > 0) {
    parts.push(`Dostępne przykłady: ${skillContent.examples.length}`);
  }
  
  if (skillContent.exercises && skillContent.exercises.length > 0) {
    parts.push(`Dostępne ćwiczenia: ${skillContent.exercises.length}`);
  }
  
  return `ZAWARTOŚĆ UMIEJĘTNOŚCI:\n${parts.join('\n')}`;
}

function formatProgressContext(progress: any): string {
  const parts = [];
  
  if (progress.mastery_level !== undefined) {
    parts.push(`Poziom opanowania: ${progress.mastery_level}/5`);
  }
  
  if (progress.total_attempts && progress.correct_attempts) {
    const accuracy = (progress.correct_attempts / progress.total_attempts * 100).toFixed(1);
    parts.push(`Dokładność: ${accuracy}% (${progress.correct_attempts}/${progress.total_attempts})`);
  }
  
  if (progress.consecutive_correct) {
    parts.push(`Poprawne z rzędu: ${progress.consecutive_correct}`);
  }
  
  return `POSTĘP W UMIEJĘTNOŚCI:\n${parts.join('\n')}`;
}

function formatMisconceptionsContext(misconceptions: any[]): string {
  const parts = misconceptions.slice(0, 3).map(m => 
    `- ${m.misconception_cluster_id} (siła: ${(m.strength * 100).toFixed(0)}%)`
  );
  
  return `AKTYWNE BŁĘDNE KONCEPCJE:\n${parts.join('\n')}`;
}

function formatSessionHistoryContext(sessionData: any): string {
  const parts = [];
  
  if (sessionData.mastery_score !== undefined) {
    parts.push(`Wynik opanowania: ${(sessionData.mastery_score * 100).toFixed(0)}%`);
  }
  
  if (sessionData.hints_used) {
    parts.push(`Użyte podpowiedzi: ${sessionData.hints_used}`);
  }
  
  if (sessionData.pseudo_activity_strikes > 0) {
    parts.push(`Oznaki powierzchownej aktywności: ${sessionData.pseudo_activity_strikes}`);
  }
  
  return `HISTORIA SESJI:\n${parts.join('\n')}`;
}

function buildPedagogicalInstructions(skillContent: any, cognitiveProfile: any): string {
  return ''; // Disabled - cognitive profile uses static defaults
}

// Helper function to log AI conversation
async function logAIConversation(
  sessionId: string | undefined,
  userId: string | undefined,
  sequenceNumber: number,
  functionName: string,
  endpoint: string,
  fullPrompt: string,
  aiResponse: string,
  parameters: any = {},
  userInput?: string,
  processingTime?: number,
  tokensUsed?: number,
  modelUsed?: string
) {
  try {
    // Use service role for logging to bypass RLS
    const serviceSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { error } = await serviceSupabase.from('ai_conversation_log').insert({
      session_id: sessionId,
      user_id: userId,
      sequence_number: sequenceNumber,
      function_name: functionName,
      endpoint: endpoint,
      full_prompt: fullPrompt,
      ai_response: aiResponse,
      parameters: parameters,
      user_input: userInput,
      processing_time_ms: processingTime,
      tokens_used: tokensUsed,
      model_used: modelUsed
    });

    if (error) {
      console.error('Error inserting AI conversation log:', error);
    } else {
      console.log('Successfully logged AI conversation');
    }
  } catch (error) {
    console.error('Failed to log AI conversation:', error);
  }
}

const generatePrompt = async (
  skillName: string,
  difficulty: number,
  latex: string,
  expectedAnswer: string,
  misconceptionMap: any
) => {
  const difficultyMap = {
    1: 'very easy',
    2: 'easy',
    3: 'medium',
    4: 'hard',
    5: 'very hard',
  }

  const prompt = `
  I am building a math education app. I want you to play the role of a helpful math tutor.

  I will provide you with a math problem, the skill it assesses, its difficulty, the expected answer, and a misconception map.

  I want you to generate a response that helps the student understand the problem and arrive at the correct answer.

  Here are some guidelines:
  - Be encouraging and supportive.
  - Do not give away the answer directly.
  - Instead, ask guiding questions that help the student think through the problem.
  - Only provide hints, not solutions.
  - Focus on the student's reasoning, not just the answer.
  - Do not include any introductory or concluding remarks.
  - Do not ask more than one question at a time.
  - Do not include any external links or resources.
  - Do not include any markdown formatting.
  - Keep your response concise (under 100 words).

  Here is the math problem:
  Skill: ${skillName}
  Difficulty: ${difficultyMap[difficulty as keyof typeof difficultyMap]}
  Problem: ${latex}
  Expected answer: ${expectedAnswer}
  Misconception map: ${JSON.stringify(misconceptionMap)}

  Begin!
  `
  return prompt
}

const edgeContentUrl = 'https://uvxbgwhjxqdzvewatlpb.supabase.co/functions/v1/get-skill-content'

async function handleGetTasks(req: Request): Promise<Response> {
  // Set CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { skillId } = await req.json()

    if (!skillId) {
      console.error('Skill ID is missing')
      return new Response(JSON.stringify({ error: 'Skill ID is missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Key is missing')
      return new Response(JSON.stringify({ error: 'Supabase URL or Key is missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    const edgeContentTaskManager = new EdgeContentTaskManager()
    const tasks = await edgeContentTaskManager.getInitialTasks(supabaseClient, skillId)

    return new Response(JSON.stringify({ data: tasks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate tasks' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleTutor(req: Request): Promise<Response> {
  // Set CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { skillName, difficulty, latex, expectedAnswer, misconceptionMap } = await req.json()

    if (!skillName || !difficulty || !latex || !expectedAnswer || !misconceptionMap) {
      console.error('Missing parameters')
      return new Response(JSON.stringify({ error: 'Missing parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const prompt = await generatePrompt(skillName, difficulty, latex, expectedAnswer, misconceptionMap)

    const openAiKey = Deno.env.get('OPENAI_API_KEY')

    if (!openAiKey) {
      console.error('OpenAI API key is missing')
      return new Response(JSON.stringify({ error: 'OpenAI API key is missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const url = 'https://api.openai.com/v1/chat/completions'
    const init = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'You are a helpful math tutor. Follow the guidelines exactly as provided.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 10000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stop: ['Student:'],
      }),
    }

    const response = await fetch(url, init)

    if (!response.ok) {
      console.error('OpenAI API error')
      return new Response(JSON.stringify({ error: 'OpenAI API error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const json = await response.json()
    const explanation = json.choices[0].message.content.trim()

    return new Response(JSON.stringify({ data: explanation }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate explanation' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

async function handleGetSkillContent(req: Request): Promise<Response> {
  // Set CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { skillId } = await req.json()

    if (!skillId) {
      console.error('Skill ID is missing')
      return new Response(JSON.stringify({ error: 'Skill ID is missing' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')

    if (!supabaseUrl || !supabaseKey) {
      console.error('Supabase URL or Key is missing')
      return new Response(JSON.stringify({ error: 'Supabase URL or Key is missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    })

    return getSkillContent(supabaseClient, skillId)
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Failed to fetch skill content' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}


async function handlePhaseBasedLesson(req: Request): Promise<Response> {
  try {
    // Extract JWT token from Authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid authorization header')
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const jwt = authHeader.replace('Bearer ', '')
    
    const { 
      message, 
      sessionId, 
      skillId, 
      responseTime, 
      stepType, 
      currentPhase, 
      sessionType, 
      department 
    } = await req.json()

    console.log('Phase-based lesson request:', { 
      message, 
      sessionId, 
      skillId, 
      currentPhase, 
      stepType 
    });

    if (!message || !skillId) {
      console.error('Missing required parameters')
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      console.error('OpenAI API key is missing')
      return new Response(JSON.stringify({ error: 'OpenAI API key is missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get skill information with authenticated client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
      console.error('Supabase configuration missing')
      return new Response(JSON.stringify({ error: 'Supabase configuration missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Create authenticated Supabase client
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
      },
    })

    // Service role client for bypassing RLS
    const serviceClient = createClient(supabaseUrl, serviceRoleKey)

    // Verify user authentication
    const { data: user, error: userError } = await supabaseClient.auth.getUser(jwt)
    if (userError || !user) {
      console.error('Invalid user token:', userError)
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userId = user.user?.id
    console.log('Authenticated user:', userId)

    // Fetch skill content
    const { data: skillData, error: skillError } = await supabaseClient
      .from('skills')
      .select('name, description')
      .eq('id', skillId)
      .single()

    if (skillError) {
      console.error('Error fetching skill:', skillError)
      return new Response(JSON.stringify({ error: 'Skill not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Load conversation history for session if it exists
    let conversationHistory = []
    if (sessionId) {
      const { data: interactions, error: historyError } = await supabaseClient
        .from('learning_interactions')
        .select('user_input, ai_response, sequence_number')
        .eq('session_id', sessionId)
        .order('sequence_number', { ascending: true })

      if (!historyError && interactions) {
        conversationHistory = interactions
        console.log(`Loaded ${interactions.length} previous interactions for session ${sessionId}`)
      }
    }

    // Build conversation messages for AI context
    let conversationMessages = []
    
    // Add system prompt with conversation history context
    let systemPrompt = `Jesteś korepetytorem matematyki dla licealistów używającym METODY SOKRATEJSKIEJ na temat: "${skillData.name}".

KLUCZOWE ZASADY ODPOWIEDZI:
1. KRÓTKO: Maksymalnie 100 słów + 1 pytanie na końcu
2. PYTAJ, NIE WYKŁADAJ: Prowadź ucznia pytaniami do odkrycia
3. JĘZYK LICEALNY: Dostosuj słownictwo do poziomu liceum
4. KONTYNUUJ ROZMOWĘ: Wykorzystuj wcześniejszą historię rozmowy

SYMBOLE MATEMATYCZNE - ZAWSZE WYJAŚNIAJ:
- Gdy użyjesz skomplikowanych symboli, od razu je wytłumacz
- Przykład: "f'(x) (czyli pochodna funkcji f od x)"

Jeśli uczeń chce rozpocząć lekcję:
- Najpierw zapytaj co już wie o tym temacie 😊
- Zacznij od jednego prostego pytania związanego z "${skillData.name}"

Odpowiadaj po polsku i bądź zachęcający!`

    if (conversationHistory.length > 0) {
      systemPrompt += `\n\nHISTORIA ROZMOWY: Kontynuujesz rozmowę z uczniem. Wcześniej rozmawialiście o tej umiejętności. Pamiętaj o tym co już omawialiście i kontynuuj od tego miejsca.`
    }

    conversationMessages.push({ role: 'system', content: systemPrompt })

    // Add conversation history
    conversationHistory.forEach(interaction => {
      if (interaction.user_input) {
        conversationMessages.push({ role: 'user', content: interaction.user_input })
      }
      if (interaction.ai_response) {
        conversationMessages.push({ role: 'assistant', content: interaction.ai_response })
      }
    })

    // Add current user message
    conversationMessages.push({ role: 'user', content: message })

    // Call OpenAI with full conversation context
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: conversationMessages,
        max_completion_tokens: 10000,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI response failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiData = await response.json()
    console.log('OpenAI response:', JSON.stringify(aiData, null, 2))
    
    // Defensive parsing of OpenAI response
    if (!aiData.choices || aiData.choices.length === 0) {
      console.error('No choices in OpenAI response:', aiData)
      return new Response(JSON.stringify({ error: 'No AI response generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const aiMessage = aiData.choices[0]?.message?.content?.trim() || 'Przepraszam, nie mogę teraz odpowiedzieć. Spróbuj ponownie.'

    // **CRITICAL FIX 1: Save interaction to learning_interactions table**
    if (sessionId && userId) {
      try {
        const nextSequence = conversationHistory.length + 1
        
        const { error: saveError } = await serviceClient
          .from('learning_interactions')
          .insert({
            user_id: userId,
            session_id: sessionId,
            interaction_type: stepType || 'regular',
            user_input: message,
            ai_response: aiMessage,
            sequence_number: nextSequence,
            response_time_ms: responseTime || 0,
            prompt_tokens: aiData.usage?.prompt_tokens || 0,
            completion_tokens: aiData.usage?.completion_tokens || 0,
            interaction_timestamp: new Date().toISOString()
          })

        if (saveError) {
          console.error('Error saving interaction:', saveError)
        } else {
          console.log('✅ Interaction saved successfully')
        }
      } catch (error) {
        console.error('Failed to save interaction:', error)
      }
    }

    // **CRITICAL FIX 2: Update study_sessions table**
    if (sessionId) {
      try {
        const updateData: any = {
          completed_steps: (conversationHistory.length + 1),
          total_tokens_used: (await supabaseClient
            .from('learning_interactions')
            .select('total_tokens')
            .eq('session_id', sessionId)
            .then(({ data }) => 
              data ? data.reduce((sum, interaction) => sum + (interaction.total_tokens || 0), 0) : 0
            )) + (aiData.usage?.total_tokens || 0)
        }

        // Only set completed_at if this is an ending interaction
        if (message.toLowerCase().includes('koniec') || message.toLowerCase().includes('zakończ')) {
          updateData.completed_at = new Date().toISOString()
          updateData.status = 'completed'
        }

        const { error: sessionError } = await supabaseClient
          .from('study_sessions')
          .update(updateData)
          .eq('id', sessionId)

        if (sessionError) {
          console.error('Error updating session:', sessionError)
        } else {
          console.log('✅ Session updated successfully')
        }
      } catch (error) {
        console.error('Failed to update session:', error)
      }
    }

    // **CRITICAL FIX 3: Update skill_progress table**
    if (skillId && userId) {
      try {
        // Determine if this interaction shows improvement
        const isPositiveInteraction = !message.toLowerCase().includes('nie wiem') && 
                                     !message.toLowerCase().includes('nie rozumiem') &&
                                     message.length > 5 // Basic engagement check

        // Get current progress
        const { data: currentProgress } = await supabaseClient
          .from('skill_progress')
          .select('*')
          .eq('user_id', userId)
          .eq('skill_id', skillId)
          .maybeSingle()

        const newTotalAttempts = (currentProgress?.total_attempts || 0) + 1
        const newCorrectAttempts = (currentProgress?.correct_attempts || 0) + (isPositiveInteraction ? 1 : 0)
        const newMasteryLevel = Math.min(5, Math.floor((newCorrectAttempts / newTotalAttempts) * 5))

        const progressData = {
          user_id: userId,
          skill_id: skillId,
          total_attempts: newTotalAttempts,
          correct_attempts: newCorrectAttempts,
          mastery_level: newMasteryLevel,
          last_reviewed_at: new Date().toISOString(),
          is_mastered: newMasteryLevel >= 4,
          updated_at: new Date().toISOString()
        }

        const { error: progressError } = await supabaseClient
          .from('skill_progress')
          .upsert(progressData, {
            onConflict: 'user_id,skill_id'
          })

        if (progressError) {
          console.error('Error updating skill progress:', progressError)
        } else {
          console.log('✅ Skill progress updated successfully')
        }
      } catch (error) {
        console.error('Failed to update skill progress:', error)
      }
    }

    return new Response(JSON.stringify({ 
      message: aiMessage,
      isCorrect: message.toLowerCase().includes('rozpocznij') 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in handlePhaseBasedLesson:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

// Public chat endpoint (no JWT required)
async function handleChat(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      message, 
      skillId, 
      sessionId, 
      messages: messageHistory, 
      enrichedContext = false 
    } = await req.json()

    // DETAILED DEBUGGING LOGS
    console.log('=== CHAT HANDLER DEBUG ===');
    console.log('Chat request:', { message, skillId, sessionId, messageHistory: messageHistory?.length, enrichedContext });
    console.log('Input message type:', typeof message);
    console.log('Input skillId type:', typeof skillId);
    console.log('Message history length:', messageHistory?.length || 0);
    console.log('Enriched context enabled:', enrichedContext);
    
    const startTime = Date.now();

    if (!message) {
      console.error('Missing message parameter')
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAiKey) {
      console.error('OpenAI API key is missing')
      return new Response(JSON.stringify({ error: 'OpenAI API key is missing' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase client for data access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')
    let supabaseClient = null;
    
    if (supabaseUrl && supabaseKey) {
      supabaseClient = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      })
    }

    // Get skill information if skillId provided
    let skillName = 'matematyka';
    if (skillId && supabaseClient) {
      const { data: skillData, error: skillError } = await supabaseClient
        .from('skills')
        .select('name')
        .eq('id', skillId)
        .single()

      if (!skillError && skillData) {
        skillName = skillData.name;
      }
    }

    // Get user ID from auth header first
    const authHeader = req.headers.get('authorization');
    let userId = undefined;
    if (authHeader) {
      try {
        const { data: { user } } = await supabaseClient.auth.getUser(authHeader.replace('Bearer ', ''));
        userId = user?.id;
      } catch (error) {
        console.log("Could not get user from auth header:", error);
      }
    }

    // Check token usage limit for authenticated users
    if (userId) {
      const { data: subscription } = await supabaseClient
        .from('user_subscriptions')
        .select('tokens_used_this_month, monthly_token_limit, subscription_type')
        .eq('user_id', userId)
        .single();

      if (subscription && subscription.tokens_used_this_month >= subscription.monthly_token_limit) {
        console.log('🚫 Token limit exceeded:', subscription);
        
        // Log detailed information about token limit exceeded
        const conversationLength = messageHistory?.length || 0;
        const contextSize = 0; // Will be calculated if enriched context was requested
        
        try {
          await supabaseClient
            .from('token_limit_exceeded_logs')
            .insert({
              user_id: userId,
              session_id: sessionId,
              attempted_tokens: 2000, // Our current token limit
              monthly_limit: subscription.monthly_token_limit,
              tokens_used_this_month: subscription.tokens_used_this_month,
              subscription_type: subscription.subscription_type,
              conversation_length: conversationLength,
              skill_id: skillId,
              user_message: message.substring(0, 500), // Truncate for storage
              enriched_context_enabled: enrichedContext,
              context_size: contextSize
            });
          
          console.log(`🔍 Detailed token limit exceeded log created for user ${userId}: ${subscription.tokens_used_this_month}/${subscription.monthly_token_limit} tokens used this month`);
        } catch (logError) {
          console.error('Failed to log token limit exceeded event:', logError);
        }
        
        return new Response(JSON.stringify({
          error: 'Token limit exceeded',
          message: `Osiągnięto limit ${subscription.monthly_token_limit} tokenów na miesiąc. Rozważ upgrade planu.`,
          subscription_type: subscription.subscription_type
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Build enriched educational context if enabled
    let enrichedContextData = null;
    if (enrichedContext && userId && supabaseClient) {
      console.log('Building educational context for:', { userId, skillId, sessionId, interactionType: messageHistory?.length > 0 ? 'ongoing' : 'initial' });
      
      // If no skillId provided, try to get from recent sessions
      let contextSkillId = skillId;
      if (!contextSkillId) {
        const { data: recentSession } = await supabaseClient
          .from('study_sessions')
          .select('skill_id')
          .eq('user_id', userId)
          .not('skill_id', 'is', null)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        contextSkillId = recentSession?.skill_id;
        console.log('No skillId provided, using from recent session:', contextSkillId);
      }
      
      enrichedContextData = await buildEducationalContext({
        userId,
        skillId: contextSkillId,
        sessionId,
        supabaseClient,
        interactionType: messageHistory?.length > 0 ? 'ongoing' : 'initial'
      });
      console.log('Enriched context built:', !!enrichedContextData);
      if (enrichedContextData) {
        console.log('Context length:', enrichedContextData.systemPromptAddition.length);
      }
    }

    // Build conversation history and context
    let conversationMessages = [];
    
    // Check if this is a first contact (no message history)
    const isFirstContact = !messageHistory || messageHistory.length === 0;
    
    // Check if this is a hint request (based on common patterns)
    const isHintRequest = message.toLowerCase().includes('podpowied') || 
                         message.toLowerCase().includes('wskazów') ||
                         message.toLowerCase().includes('pomocy');
                         
    // Check message count for calibration reminders (every 3-4 messages)
    const messageCount = messageHistory ? messageHistory.length : 0;
    const needsCalibrationReminder = messageCount > 0 && messageCount % 3 === 0;

    // Main Socratic tutoring system prompt for high school students
    let systemPrompt = `Jesteś korepetytorem matematyki dla licealistów. Używasz METODY SOKRATEJSKIEJ - prowadzisz ucznia pytaniami, nie wykładasz teorii od razu.

KLUCZOWE ZASADY:
1. KRÓTKIE ODPOWIEDZI: Maksymalnie 150 słów + 1 konkretne pytanie na końcu
2. KROK PO KROKU: Nie załatwiaj wszystkiego "na raz" - jeden problem/zagadnienie naraz  
3. PYTAJ, NIE WYKŁADAJ: Zamiast podawać wzory, zapytaj co uczeń wie o danym zagadnieniu
4. JĘZYK LICEALNY: Dostosuj słownictwo do poziomu liceum - unikaj uniwersyteckiego żargonu

FORMATOWANIE:
- Krótkie akapity (max 2-3 zdania każdy)
- Wzory matematyczne w prostej formie z wyjaśnieniami
- Użyj emoji 😊 dla zachęty, ⚠️ dla ważnych rzeczy
- Nigdy nie pisz długich bloków tekstu bez przerw

SYMBOLE MATEMATYCZNE - ZAWSZE WYJAŚNIAJ:
- d/dx = "pochodna funkcji względem x"
- f'(x) = "pochodna funkcji f od x" 
- f(x) = "funkcja f od x" lub "f od iksa"
- x^n = "x do potęgi n"
- Gdy używasz skomplikowanych symboli, od razu je tłumacz

STRATEGIA ODPOWIEDZI:
1. Sprawdź co uczeń już wie
2. Zadaj pytanie prowadzące do rozwiązania  
3. Poczekaj na odpowiedź przed podaniem kolejnego kroku
4. Jeśli uczeń nie rozumie - uprość i zmień podejście

PRZYKŁAD DOBREJ ODPOWIEDZI:
"Widzę, że masz problem z pochodnymi! 😊 
Zanim przejdziemy do reguły łańcuchowej, powiedz mi - czy wiesz co to znaczy "pochodna funkcji"? 
Co dzieje się z funkcją gdy liczysz jej pochodną?"

    ${skillId ? `\nUMIEJĘTNOŚĆ: ${skillName} - dostosuj wszystkie pytania i przykłady do tej konkretnej umiejętności.` : ''}`;

    // Special handling for different interaction types
    if (isFirstContact) {
      systemPrompt += `\n\n⚠️ PIERWSZY KONTAKT - KALIBRACJA POTRZEBNA:
Na początku dodaj krótką wiadomość: "😊 Cześć! Jestem tu by Ci pomóc z matematyką. Jeśli czegoś nie rozumiesz w moich odpowiedziach - napisz od razu! Mogę wyjaśnić prościej lub inaczej. Dostosowuję się do Twojego tempa nauki."`;
    }

    if (isHintRequest) {
      systemPrompt += `\n\n⚠️ PROŚBA O PODPOWIEDŹ:
Użytkownik prosi o pomoc. Odwołaj się dokładnie do problemu który już wcześniej omawialiście w tej rozmowie. NIE wymyślaj nowego przykładu - użyj tego samego!`;
    }

    if (needsCalibrationReminder) {
      systemPrompt += `\n\n⚠️ PRZYPOMNIENIE O KALIBRACJI:
Na końcu odpowiedzi dodaj: "😊 Przypomnę - jeśli coś jest zbyt trudne, zbyt techniczne lub jest tego za dużo na raz, napisz mi! Jestem tu by dostosować się do Twojego stylu nauki."`;
    }

    // Add mathematical symbol processing note
    systemPrompt += `\n\n⚠️ WAŻNE - SYMBOLE MATEMATYCZNE:
Gdy napiszesz skomplikowany symbol (jak d/dx, f'(x), x^n), od razu go wytłumacz w prostych słowach.
Przykład: "d/dx (to znaczy: pochodna względem x)" lub "f'(x) (czyli pochodna funkcji f od x)"`;

    // Limit response length strictly 
    systemPrompt += `\n\n⚠️ LIMIT DŁUGOŚCI ODPOWIEDZI:
MAKSYMALNIE 150 słów + JEDNO pytanie na końcu. NIGDY więcej! Jeśli musisz więcej wyjaśnić - zrób to w kolejnej wymianie, nie w jednej długiej odpowiedzi.`;

    // Add enriched context if enabled and available
    if (enrichedContextData) {
      systemPrompt += '\n\n' + enrichedContextData.systemPromptAddition;
      console.log('Added enriched context to system prompt, length:', enrichedContextData.systemPromptAddition.length);
    } else {
      // Fallback to basic session summary if enriched context is disabled
      if (sessionId && supabaseClient) {
        try {
          const { data: sessionData } = await supabaseClient
            .from('study_sessions')
            .select('summary_compact')
            .eq('id', sessionId)
            .single();
          
          if (sessionData?.summary_compact) {
            systemPrompt += ` Kontekst z poprzednich sesji: ${sessionData.summary_compact}`;
          }
        } catch (error) {
          console.log('No session summary available');
        }
      }
    }

    conversationMessages.push({ role: 'system', content: systemPrompt });

    // Add message history to conversation
    if (messageHistory && Array.isArray(messageHistory)) {
      for (const msgPair of messageHistory) {
        if (msgPair.user) {
          conversationMessages.push({ role: 'user', content: msgPair.user });
        }
        if (msgPair.assistant) {
          conversationMessages.push({ role: 'assistant', content: msgPair.assistant });
        }
      }
    }

    // Add current message
    conversationMessages.push({ role: 'user', content: message });

    console.log('Sending to OpenAI with conversation length:', conversationMessages.length);

    // Create full prompt for logging
    const fullPrompt = conversationMessages.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n\n');

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: conversationMessages,
        max_completion_tokens: 2000, // Set to 2000 for testing
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      return new Response(JSON.stringify({ error: 'AI response failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const aiData = await response.json()
    console.log('OpenAI response status:', response.status);
    console.log('OpenAI response data:', JSON.stringify(aiData, null, 2));
    
    if (!aiData.choices || aiData.choices.length === 0) {
      console.error('No choices in OpenAI response:', aiData)
      return new Response(JSON.stringify({ error: 'No AI response generated' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    
    const aiMessage = aiData.choices[0]?.message?.content?.trim() || 'Przepraszam, nie mogę teraz odpowiedzieć. Spróbuj ponownie.'
    const processingTime = Date.now() - startTime;
    const tokensUsed = aiData.usage?.total_tokens || 0;
    console.log('Extracted AI message:', aiMessage);

    // Update token usage if user is identified
    if (userId && tokensUsed > 0) {
      const { error: tokenError } = await supabaseClient.rpc('update_token_usage', {
        p_user_id: userId,
        p_tokens_used: tokensUsed
      });
      
      if (tokenError) {
        console.log('⚠️ Error updating token usage:', tokenError);
      } else {
        console.log('✅ Updated token usage:', tokensUsed);
      }
    }


    // Log AI conversation
    await logAIConversation(
      sessionId,
      userId,
      1,
      'study-tutor',
      'chat',
      fullPrompt,
      aiMessage,
      {
        skillId,
        messageHistoryLength: messageHistory?.length || 0,
        model: 'gpt-5-2025-08-07',
        enrichedContext,
        contextDataSize: enrichedContextData ? enrichedContextData.systemPromptAddition.length : 0
      },
      message,
      processingTime,
      aiData.usage?.total_tokens || tokensUsed,
      'gpt-5-2025-08-07'
    );

    const finalResponse = { message: aiMessage };
    console.log('Final response object:', JSON.stringify(finalResponse, null, 2));
    console.log('=== END CHAT HANDLER DEBUG ===');

    return new Response(JSON.stringify(finalResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in handleChat:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
}

serve(async (req) => {
  const { pathname } = new URL(req.url)
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log('Request pathname:', pathname);
  
  // Check for endpoint parameter in body for POST requests
  if (req.method === 'POST') {
    try {
      const body = await req.clone().json();
      console.log('Request body endpoint:', body.endpoint);
      
      if (body.endpoint === 'chat') {
        console.log('Routing to chat handler');
        return handleChat(req);
      }
    } catch (e) {
      console.log('No endpoint parameter found, continuing with pathname routing');
    }
  }

  if (pathname === '/tutor') {
    return handleTutor(req)
  } else if (pathname === '/get-tasks') {
    return handleGetTasks(req)
  } else if (pathname === '/get-skill-content') {
    return handleGetSkillContent(req)
  } else if (pathname === '/chat') {
    return handleChat(req)
  } else {
    // Handle phase-based lesson requests (default endpoint)
    return handlePhaseBasedLesson(req)
  }
})

// Unified skill content interface for edge functions
interface SkillContent {
  theory: {
    theory_text: string;
    key_formulas: any[];
    time_estimate: number;
    difficulty_level: number;
  } | null;
  examples: Array<{
    example_code: string;
    problem_statement: string;
    solution_steps: any;
    final_answer: string;
    explanation: string;
    difficulty_level: number;
    time_estimate: number;
  }>;
  exercises: Array<{
    exercise_code: string;
    problem_statement: string;
    expected_answer: string;
    difficulty_level: number;
    time_estimate: number;
    misconception_map: any;
    hints: any[];
  }>;
  pedagogical_notes: {
    scaffolding_questions: any[];
    teaching_flow: any[];
    estimated_total_time: number;
  } | null;
  phases: Array<{
    phase_number: number;
    phase_name: string;
    phase_description: string;
    ai_instructions: string;
  }>;
}

class EdgeContentTaskManager {
  private contentCache = new Map<string, SkillContent>();

  async fetchSkillContent(supabaseClient: any, skillId: string): Promise<SkillContent | null> {
    if (this.contentCache.has(skillId)) {
      return this.contentCache.get(skillId)!;
    }

    try {
      console.log(`[ContentManager] Fetching unified content for skill: ${skillId}`);
      
      const { data: unifiedContent, error } = await supabaseClient
        .from('unified_skill_content')
        .select('content_data, metadata, is_complete')
        .eq('skill_id', skillId)
        .maybeSingle();

      if (error) {
        console.error('[ContentManager] Error fetching unified content:', error);
        return null;
      }

      if (!unifiedContent) {
        console.log(`[ContentManager] No unified content found for skill ${skillId}`);
        return {
          theory: null,
          examples: [],
          exercises: [],
          pedagogical_notes: null,
          phases: []
        };
      }

      const contentData = unifiedContent.content_data as any;
      const content: SkillContent = {
        theory: contentData.theory || null,
        examples: contentData.examples || [],
        exercises: contentData.exercises || [],
        pedagogical_notes: contentData.pedagogical_notes || null,
        phases: contentData.phases || []
      };

      this.contentCache.set(skillId, content);
      
      console.log(`[ContentManager] Successfully fetched unified content:`, {
        hasTheory: !!content.theory,
        examplesCount: content.examples.length,
        exercisesCount: content.exercises.length,
        phasesCount: content.phases.length
      });

      return content;
    } catch (error) {
      console.error('[ContentManager] Error fetching unified skill content:', error);
      return null;
    }
  }

  async getInitialTasks(supabaseClient: any, skillId: string): Promise<any[]> {
    try {
      const content = await this.fetchSkillContent(supabaseClient, skillId);
      if (!content) return [];

      const tasks: any[] = [];

      // Convert exercises to tasks
      if (content.exercises?.length > 0) {
        content.exercises.slice(0, 2).forEach((exercise, index) => {
          tasks.push({
            id: `exercise_${skillId}_${index}`,
            department: 'exercise_based',
            skill_name: 'Mathematical Problem Solving',
            difficulty: exercise.difficulty_level || 3,
            latex: exercise.problem_statement,
            expectedAnswer: exercise.expected_answer,
            misconceptionMap: exercise.misconception_map || {}
          });
        });
      }

      return tasks;
    } catch (error) {
      console.error('[ContentManager] Error generating tasks:', error);
      return [];
    }
  }
}

async function getSkillContent(supabaseClient: any, skillId: string): Promise<Response> {
  console.log('Getting skill content for:', skillId);
  
  try {
    // Fetch from unified skill content table
    const { data: unifiedContent, error: unifiedError } = await supabaseClient
      .from('unified_skill_content')
      .select('content_data, metadata, is_complete')
      .eq('skill_id', skillId)
      .maybeSingle();

    if (unifiedError) {
      console.error('Error fetching unified content:', unifiedError);
      throw unifiedError;
    }

    if (!unifiedContent) {
      console.log('No unified content found for skill:', skillId);
      return new Response(
        JSON.stringify({ error: 'Skill content not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const contentData = unifiedContent.content_data as any;
    const metadata = unifiedContent.metadata as any;

    // Structure the response for compatibility with existing code
    const content: SkillContent = {
      theory: contentData.theory || null,
      examples: contentData.examples || [],
      exercises: contentData.exercises || [],
      pedagogical_notes: contentData.pedagogical_notes || null,
      phases: contentData.phases || []
    };

    console.log('Successfully fetched unified skill content');
    
    return new Response(
      JSON.stringify({
        ...content,
        metadata: metadata,
        is_complete: unifiedContent.is_complete
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in getSkillContent:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch skill content' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
}
