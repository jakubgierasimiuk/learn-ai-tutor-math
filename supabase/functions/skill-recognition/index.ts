import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseKey || !openaiApiKey) {
      console.error('Missing environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get all active skills from the database
    const { data: skills, error: skillsError } = await supabase
      .from('skills')
      .select('id, name, department, description')
      .eq('is_active', true);

    if (skillsError) {
      console.error('Error fetching skills:', skillsError);
      return new Response(JSON.stringify({ error: 'Failed to fetch skills' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create a simplified skills list for AI
    const skillsList = skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      department: skill.department,
      description: skill.description
    }));

    // Prepare prompt for OpenAI
    const systemPrompt = `You are a skill recognition system for a Polish math tutoring app. 
Your task is to analyze a student's message and identify which mathematical skill they need help with.

Available skills:
${skillsList.map(skill => `- ${skill.name} (${skill.department}): ${skill.description}`).join('\n')}

Respond with a JSON object containing:
- skillId: the exact ID of the best matching skill (or null if no good match)
- skillName: the name of the matched skill
- confidence: a number between 0 and 1 indicating how confident you are
- reasoning: brief explanation of why you chose this skill

If confidence is below 0.6, set skillId to null.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      return new Response(JSON.stringify({ error: 'AI service unavailable' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResponse = await response.json();
    
    let recognitionResult;
    try {
      recognitionResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(JSON.stringify({ 
        skillId: null, 
        skillName: null, 
        confidence: 0,
        reasoning: 'Failed to parse skill recognition'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Skill recognition result:', recognitionResult);

    return new Response(JSON.stringify(recognitionResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in skill recognition:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});