import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from '@supabase/supabase-js'

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

    const url = 'https://api.openai.com/v1/completions'
    const init = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'text-davinci-003',
        prompt: prompt,
        temperature: 0.7,
        max_tokens: 150,
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
    const explanation = json.choices[0].text.trim()

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

serve(async (req) => {
  const { pathname } = new URL(req.url)

  if (pathname === '/tutor') {
    return handleTutor(req)
  } else if (pathname === '/get-tasks') {
    return handleGetTasks(req)
  } else if (pathname === '/get-skill-content') {
    return handleGetSkillContent(req)
  } else {
    return new Response('Not Found', { status: 404 })
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
