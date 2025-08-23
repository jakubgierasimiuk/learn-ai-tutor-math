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

    // Create skills map for quick lookups
    const skillsMap = new Map(skills.map(skill => [skill.id, skill]));

    // Create a simplified skills list for AI (name + department only for shorter prompt)
    const simplifiedSkills = skillsList.map(skill => `${skill.name} (${skill.department})`).join(', ');

    // Prepare prompt for OpenAI - much shorter and focused
    const systemPrompt = `Jesteś systemem rozpoznawania umiejętności matematycznych dla polskiej aplikacji edukacyjnej.

Dostępne umiejętności: ${simplifiedSkills}

Zadanie: Przeanalizuj wiadomość ucznia i określ, której umiejętności potrzebuje.

Odpowiedz JSON:
{
  "stage": "direct" | "clarification",
  "skillId": "exact-skill-id" | null,
  "skillName": "skill-name" | null,
  "confidence": 0.0-1.0,
  "candidates": ["skill-name-1", "skill-name-2", ...] | null,
  "clarificationQuestion": "question for student" | null,
  "reasoning": "brief explanation"
}

ZASADY:
- Jeśli pewność ≥ 0.75: stage="direct", podaj skillId
- Jeśli pewność < 0.75: stage="clarification", podaj candidates (1-15 najlepszych) + empatyczne pytanie po polsku
- Pytanie MUSI być zrozumiałe dla ucznia, używaj prostego języka
- W pytaniu zawsze dodaj: "Chciałbyś zacząć od podstaw czy od trudniejszych przykładów?"
- Jeśli brak dopasowania: stage="direct", skillId=null`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_completion_tokens: 500,
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
      console.log('Raw AI response:', aiResponse.choices[0].message.content);
      console.log('Parsed recognition result:', recognitionResult);

      // If stage is clarification, prepare candidates with their IDs
      if (recognitionResult.stage === 'clarification' && recognitionResult.candidates) {
        const candidatesWithIds = recognitionResult.candidates.map((candidateName: string) => {
          const skill = skills.find(s => s.name === candidateName);
          return skill ? { id: skill.id, name: skill.name, department: skill.department } : null;
        }).filter(Boolean);

        recognitionResult.candidatesWithIds = candidatesWithIds;
        console.log('Candidates with IDs:', candidatesWithIds);
      }

      // Validate confidence level
      if (recognitionResult.confidence !== undefined && recognitionResult.confidence < 0.75 && recognitionResult.stage === 'direct') {
        console.log('Confidence below threshold, but stage is direct. Switching to clarification.');
        recognitionResult.stage = 'clarification';
        recognitionResult.skillId = null;
      }

    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Raw response was:', aiResponse.choices[0].message.content);
      return new Response(JSON.stringify({ 
        stage: 'direct',
        skillId: null, 
        skillName: null, 
        confidence: 0,
        reasoning: 'Failed to parse skill recognition - AI response was malformed'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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