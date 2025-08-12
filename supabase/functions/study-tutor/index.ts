import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Jesteś StudyTutor – wirtualnym nauczycielem matematyki dla polskiej szkoły średniej.
Twój nadrzędny cel: ZROZUMIENIE ucznia i prowadzenie go do samodzielnego rozwiązania.

Zasady absolutne (ściśle przestrzegaj):
1) Poziom licealny: zadania jak w liceum/matura – żadnych trywialnych przykładów typu 2+2, proste tabliczkowe obliczenia itp.
2) Trudność adaptacyjna: korzystaj z target_difficulty ("medium"|"hard"); jeśli niepewność – wybierz "medium"; unikaj "easy".
3) Metoda Sokratesa + polityka 2‑1‑0: pytasz → analizujesz → naprowadzasz. Maks. 2 krótkie podpowiedzi i 1 uogólnienie; pełne rozwiązanie tylko na wyraźną prośbę lub po 3 nieudanych próbach.
4) Struktura odpowiedzi DOMYŚLNIE BEZ PODPOWIEDZI: do 2 krótkich akapitów + lista kroków (KROK 1, KROK 2, …). Zakończ jednym, konkretnym pytaniem do ucznia.
5) Język: polski, poziom B2–C1, precyzyjnie, bez zbędnego żargonu.
6) Notacja: używaj LaTeX inline, np. $\\Delta=b^2-4ac$.
7) Kalibracja: start od średniej trudności; gdy idzie dobrze – podnoś do hard; gdy słabo – upraszczaj, ale w granicach liceum.
8) Weryfikacja rachunków: sprawdzaj swoje obliczenia; jeśli korygujesz – wskaż błąd jednym zdaniem i popraw.
9) Skupienie: trzymaj się bieżącej umiejętności; dygresje odłóż na koniec.
10) Tokeny: odpowiedź ≤ 350 tokenów.
11) Detektor trywialności: jeśli ćwiczenie jest zbyt proste, zastąp je wersją licealną (równania, funkcje, trygonometria, logarytmy, ciągi, geometria analityczna).
12) Off‑topic: przy prośbie spoza matematyki uprzejmie wróć do celu lekcji i zaproponuj 2 opcje kontynuacji w obrębie tematu.
13) A11y (dostosuj treść): screen_reader → krótkie zdania i wyraźne nagłówki; keyboard_only → kolejność kroków; low_vision → numerowane listy i wzory w osobnych liniach; niesłyszący → pełna treść bez odniesień do audio.
14) Checkpointy: co 6–8 tur dodaj krótką „Notatkę nauczyciela” (cel, trudność 1–5, następny krok).

Polityka podpowiedzi (globalna):
- Nigdy nie pokazuj podpowiedzi w pierwszej turze ani domyślnie.
- Podpowiedź udzielaj tylko gdy: (a) uczeń o nią poprosi ("podpowiedź", "pomóż", "nie wiem", "utknąłem") LUB (b) po dwóch nieudanych próbach z rzędu.
- Zanim podasz techniczną wskazówkę, DELIKATNIE sprawdź, czy uczeń zna potrzebną metodę/regułę (np. przenoszenie składników, wzory skróconego mnożenia, logarytmy, wykresy funkcji):
  „Czy kojarzysz zasadę przenoszenia składników na drugą stronę równania (dodajemy/odejmujemy tę samą wartość po obu stronach)?”
  Jeśli nie – daj 2–3‑zdaniowe mikro‑wyjaśnienie z jednym liczbowym mini‑przykładem, bez zdradzania pełnego rozwiązania zadania.
- Podpowiedź ≤ 3–4 linie; dalej prowadź pytaniami.

Domyślna struktura odpowiedzi (bez podpowiedzi):
- Cel ucznia (1 zdanie)
- Kroki (3–5 numerowanych punktów)
- Pytanie sprawdzające (jedno)
- (Co 7 tur) Notatka nauczyciela {cel, trudność 1–5, następny krok}.
`;


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { message, sessionId, skillId, responseTime, stepType } = await req.json();
    
    if (!message || !sessionId || !skillId) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get skill details
    const { data: skill, error: skillError } = await supabaseClient
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError) {
      console.error('Error fetching skill:', skillError);
      throw skillError;
    }

    // Get session details
    const { data: session, error: sessionError } = await supabaseClient
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError) {
      console.error('Error fetching session:', sessionError);
      throw sessionError;
    }

    // Get previous conversation history
    const { data: previousSteps, error: stepsError } = await supabaseClient
      .from('lesson_steps')
      .select('*')
      .eq('session_id', sessionId)
      .order('step_number', { ascending: true });

    if (stepsError) {
      console.error('Error fetching steps:', stepsError);
      throw stepsError;
    }

    // Calculate average response time for pseudo-activity detection (skip for initial/start steps)
    const userSteps = previousSteps?.filter(step => step.user_input && step.response_time_ms) || [];
    const averageResponseTime = userSteps.length > 0 
      ? userSteps.reduce((sum, step) => sum + (step.response_time_ms || 0), 0) / userSteps.length
      : 5000; // Default 5 seconds
    const minResponseTime = Math.max(averageResponseTime * 0.4, 2000); // Minimum 2 seconds
    const startKeywords = ['rozpocznij', 'zacznij', 'start'];
    const isStartLike = typeof message === 'string' && startKeywords.some(k => message.toLowerCase().includes(k));
    const hasEnoughHistory = (previousSteps?.length || 0) >= 2;
    const isPseudoActivity = hasEnoughHistory && !isStartLike && responseTime > 0 && responseTime < minResponseTime;

// Determine target difficulty (never below high-school medium)
const { data: profile } = await supabaseClient
  .from('profiles')
  .select('level')
  .eq('user_id', session.user_id)
  .single();

const recent = (previousSteps || []).slice(-4).filter((s: any) => typeof s.is_correct === 'boolean');
const correctCount = recent.filter((s: any) => s.is_correct).length;
let targetDifficulty: 'medium' | 'hard' = 'medium';
if (profile?.level && profile.level >= 3) targetDifficulty = 'hard';
if (recent.length >= 2) {
  const ratio = correctCount / recent.length;
  if (ratio >= 0.75) targetDifficulty = 'hard';
  if (ratio <= 0.25) targetDifficulty = 'medium';
}

// Build conversation history for OpenAI
    const turnNumber = (previousSteps?.length || 0) + 1;
const runtimeDirectives = `Runtime: tura=${turnNumber}.
- Jeśli tura === 1: ODPOWIEDZ TYLKO w tym formacie i max 6–8 linijek:
Zadanie: [konkretne liczby, zgodne z tematem]
Pytanie: [jedno, konkretne]
Nie dawaj żadnej podpowiedzi.
- Jeśli step_type === "hint": zastosuj „Politykę podpowiedzi (globalna)” ze sprawdzeniem znajomości metody i krótkim mikro‑wyjaśnieniem gdy trzeba.
- Jeśli tura % 7 === 0, dodaj „Notatkę nauczyciela” (cel, trudność 1–5, następny krok).
Stosuj politykę 2‑1‑0. Off‑topic → redirect do celu.`;
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'system',
        content: runtimeDirectives
      }
    ];

// Add context about the skill
const skillContext = {
  skill_id: skillId,
  skill_name: skill.name,
  class_level: skill.class_level,
  level: skill.level,
  department: skill.department,
  description: skill.description,
  target_difficulty: targetDifficulty
};

    // Add previous conversation
    if (previousSteps && previousSteps.length > 0) {
      previousSteps.forEach(step => {
        if (step.ai_response) {
          messages.push({
            role: 'assistant',
            content: step.ai_response
          });
        }
        if (step.user_input) {
          messages.push({
            role: 'user',
            content: `${JSON.stringify(skillContext)}\n${step.user_input}`
          });
        }
      });
    }

// Add current user message with proper handling for lesson start
let userMessage = message;
if (message === "Rozpocznij lekcję" && previousSteps.length === 0) {
  userMessage = `Pierwsza tura: podaj tylko dwie sekcje –\nZadanie: [zawiera konkretne liczby, dotyczy: ${skill.name}]\nPytanie: [jedno, konkretne]\nPoziom: szkoła średnia (${targetDifficulty}). Zero metatekstu. Nie dodawaj podpowiedzi.`;
}
    
const currentContext = JSON.stringify({ ...skillContext, step_type: stepType || 'question', turn_number: turnNumber });
messages.push({
  role: 'user',
  content: `${currentContext}\n${userMessage}`
});

    // Limit conversation history to prevent token overflow
    const maxMessages = 15;
    if (messages.length > maxMessages) {
      const systemMessage = messages[0];
      const recentMessages = messages.slice(-(maxMessages - 1));
      messages.splice(0, messages.length, systemMessage, ...recentMessages);
    }

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        temperature: 0.7,
        max_tokens: 350,
      }),
    });

    if (!openAIResponse.ok) {
      const error = await openAIResponse.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiResponse = await openAIResponse.json();
    const aiMessage = aiResponse.choices[0]?.message?.content;
    
    if (!aiMessage) {
      throw new Error('No response from AI');
    }

    const tokensUsed = aiResponse.usage?.total_tokens || 0;

    // Determine if this is a correct answer (simple heuristic)
    const isCorrect = aiMessage.toLowerCase().includes('poprawnie') || 
                     aiMessage.toLowerCase().includes('świetnie') ||
                     aiMessage.toLowerCase().includes('brawo');

    // Get next step number
    const nextStepNumber = (previousSteps?.length || 0) + 1;

    // Save lesson step
    const { error: stepInsertError } = await supabaseClient
      .from('lesson_steps')
      .insert({
        session_id: sessionId,
        step_number: nextStepNumber,
        step_type: stepType || 'question',
        ai_prompt: JSON.stringify(skillContext),
        ai_response: aiMessage,
        user_input: message,
        is_correct: isCorrect,
        response_time_ms: responseTime,
        tokens_used: tokensUsed
      });

    if (stepInsertError) {
      console.error('Error saving lesson step:', stepInsertError);
    }

    // Update session statistics
    const newHintsUsed = stepType === 'hint' ? session.hints_used + 1 : session.hints_used;
    const newEarlyReveals = message.toLowerCase().includes('pokaż rozwiązanie') ? 
                           session.early_reveals + 1 : session.early_reveals;
    const newStrikes = isPseudoActivity ? session.pseudo_activity_strikes + 1 : 
                      (isCorrect ? Math.max(0, session.pseudo_activity_strikes - 1) : session.pseudo_activity_strikes);

    const { error: sessionUpdateError } = await supabaseClient
      .from('study_sessions')
      .update({
        completed_steps: nextStepNumber,
        total_steps: Math.max(session.total_steps, nextStepNumber),
        hints_used: newHintsUsed,
        early_reveals: newEarlyReveals,
        pseudo_activity_strikes: newStrikes,
        total_tokens_used: session.total_tokens_used + tokensUsed,
        average_response_time_ms: userSteps.length > 0 ? 
          Math.round((session.average_response_time_ms * userSteps.length + responseTime) / (userSteps.length + 1)) :
          responseTime
      })
      .eq('id', sessionId);

    if (sessionUpdateError) {
      console.error('Error updating session:', sessionUpdateError);
    }

    // Update daily token usage
    const today = new Date().toISOString().split('T')[0];
    const { error: dailyLimitError } = await supabaseClient
      .from('user_daily_limits')
      .upsert({
        user_id: session.user_id,
        date: today,
        tokens_used: tokensUsed,
        sessions_count: 1
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });

    if (dailyLimitError) {
      console.error('Error updating daily limits:', dailyLimitError);
    }

    // Return response with metadata
    return new Response(JSON.stringify({
      message: aiMessage,
      tokensUsed: tokensUsed,
      stepNumber: nextStepNumber,
      pseudoActivityDetected: isPseudoActivity,
      correctAnswer: isCorrect,
      hints: newHintsUsed,
      strikes: newStrikes
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in study-tutor function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Wystąpił błąd podczas komunikacji z tutorem AI. Spróbuj ponownie.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});