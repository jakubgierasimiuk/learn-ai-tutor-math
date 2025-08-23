import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
        max_completion_tokens: 150,
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
    
    if (!supabaseUrl || !supabaseKey) {
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

    // Verify user authentication
    const { data: user, error: userError } = await supabaseClient.auth.getUser(jwt)
    if (userError || !user) {
      console.error('Invalid user token:', userError)
      return new Response(JSON.stringify({ error: 'Invalid authentication' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log('Authenticated user:', user.user?.id)

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

    // Create AI prompt for phase-based learning
    const prompt = `Jesteś pomocnym nauczycielem matematyki prowadzącym lekcję na temat: "${skillData.name}".

Uczeń napisał: "${message}"

Odpowiedz w przyjazny i zachęcający sposób. Jeśli uczeń chce rozpocząć lekcję, zacznij od podstawowych pojęć związanych z "${skillData.name}". 

Wskazówki:
- Odpowiadaj po polsku
- Bądź cierpliwy i zachęcający
- Zadawaj pytania, które pomogą uczniowi zrozumieć temat
- Nie podawaj od razu odpowiedzi, ale prowadź ucznia do odkrycia
- Ogranicz odpowiedź do 100 słów
- Jeśli uczeń pyta o podpowiedź, daj subtelną wskazówkę

Rozpocznij lekcję!`

    // Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: 'Jesteś pomocnym nauczycielem matematyki. Odpowiadaj zawsze po polsku.' },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 200,
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

serve(async (req) => {
  const { pathname } = new URL(req.url)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (pathname === '/tutor') {
    return handleTutor(req)
  } else if (pathname === '/get-tasks') {
    return handleGetTasks(req)
  } else if (pathname === '/get-skill-content') {
    return handleGetSkillContent(req)
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
