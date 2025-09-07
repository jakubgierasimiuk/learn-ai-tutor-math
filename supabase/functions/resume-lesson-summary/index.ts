import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { skillId, userId } = await req.json();

    console.log('[RESUME-SUMMARY] Starting summary generation for skill:', skillId, 'user:', userId);

    if (!skillId || !userId) {
      throw new Error('skillId and userId are required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all interactions for this skill
    const { data: interactions, error: interactionsError } = await supabase
      .from('learning_interactions')
      .select(`
        *,
        study_sessions!inner(skill_id, user_id)
      `)
      .eq('study_sessions.skill_id', skillId)
      .eq('study_sessions.user_id', userId)
      .order('interaction_timestamp', { ascending: true });

    if (interactionsError) {
      throw interactionsError;
    }

    console.log('[RESUME-SUMMARY] Found interactions:', interactions?.length || 0);

    if (!interactions || interactions.length < 5) {
      return new Response(JSON.stringify({
        summary: "Rozpocząłeś naukę tej umiejętności, ale masz jeszcze mało interakcji. Kontynuuj naukę, aby zobaczyć więcej szczegółów postępu.",
        interactionCount: interactions?.length || 0,
        recommendations: ["Kontynuuj naukę od miejsca przerwania"]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get skill name
    const { data: skill, error: skillError } = await supabase
      .from('skills')
      .select('name, description')
      .eq('id', skillId)
      .single();

    if (skillError) {
      throw skillError;
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Prepare interaction summary for AI
    const interactionSummary = interactions.map((interaction, index) => {
      return `${index + 1}. ${interaction.user_input || 'Brak wejścia'} -> ${interaction.ai_response || 'Brak odpowiedzi'}`;
    }).join('\n');

    const prompt = `Jesteś mentorem matematyki. Przeanalizuj poniższe interakcje ucznia z lekcją na temat "${skill.name}" i stwórz krótkie, motywujące podsumowanie jego postępu.

INTERAKCJE UCZNIA:
${interactionSummary}

Stwórz podsumowanie zawierające:
1. Krótki opis tego, czego uczeń się uczył
2. Jakie postępy poczynił
3. Co wydaje się być dla niego trudne
4. 2-3 konkretne rekomendacje, co może zrobić dalej

Odpowiedz w języku polskim, w ciepłym, motywującym tonie, maksymalnie 150 słów.`;

    console.log('[RESUME-SUMMARY] Sending request to OpenAI');

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Jesteś cierpliwym i motywującym mentorem matematyki. Odpowiadasz po polsku.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('[RESUME-SUMMARY] OpenAI API error:', openAIResponse.status, errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
    }

    const openAIData = await openAIResponse.json();
    const aiSummary = openAIData.choices[0]?.message?.content || 'Nie udało się wygenerować podsumowania.';

    const response = {
      summary: aiSummary,
      interactionCount: interactions.length,
      skillName: skill.name,
      recommendations: [
        "Kontynuuj naukę od miejsca przerwania",
        "Powtórz trudniejsze fragmenty",
        "Zadaj pytanie o niejasne kwestie"
      ]
    };

    console.log('[RESUME-SUMMARY] Summary generated successfully');

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RESUME-SUMMARY] Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: "Wystąpił błąd podczas generowania podsumowania. Spróbuj ponownie.",
      interactionCount: 0,
      recommendations: ["Kontynuuj naukę"]
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});