import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { evaluateAnswer, MathContext } from './mathValidation.ts';
import { analyzeStudentAnswer, StudentProfile } from './adaptivePedagogy.ts';
import { validateAIResponse, extractMathEquation } from './aiValidation.ts';

// ContentTaskManager for edge functions (simplified version)
interface SkillContent {
  theory: {
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
  examples: {
    solved: Array<{
      problem: string;
      solution: string;
      difficulty: number;
    }>;
  };
  practiceExercises: Array<{
    problem: string;
    answer: string;
    difficulty: number;
    hints?: string[];
  }>;
}

class EdgeContentTaskManager {
  private contentCache = new Map<string, SkillContent>();

  async fetchSkillContent(supabaseClient: any, skillId: string): Promise<SkillContent | null> {
    if (this.contentCache.has(skillId)) {
      return this.contentCache.get(skillId)!;
    }

    try {
      console.log(`[ContentManager] Fetching content for skill: ${skillId}`);
      
      const { data: skill, error } = await supabaseClient
        .from('skills')
        .select('content_structure, content_data')
        .eq('id', skillId)
        .single();

      if (error) {
        console.error('[ContentManager] Error fetching skill:', error);
        return null;
      }

      if (!skill?.content_data) {
        console.log(`[ContentManager] No content_data found for skill ${skillId}`);
        return {
          theory: { sections: [] },
          examples: { solved: [] },
          practiceExercises: []
        };
      }

      const content = skill.content_data as SkillContent;
      this.contentCache.set(skillId, content);
      
      console.log(`[ContentManager] Successfully fetched content:`, {
        theorySections: content.theory?.sections?.length || 0,
        solvedExamples: content.examples?.solved?.length || 0,
        practiceExercises: content.practiceExercises?.length || 0
      });

      return content;
    } catch (error) {
      console.error('[ContentManager] Error fetching skill content:', error);
      return null;
    }
  }

  async getInitialTasks(supabaseClient: any, skillId: string): Promise<any[]> {
    try {
      const content = await this.fetchSkillContent(supabaseClient, skillId);
      if (!content) return [];

      const tasks: any[] = [];

      // Convert practice exercises to tasks
      if (content.practiceExercises?.length > 0) {
        content.practiceExercises.slice(0, 2).forEach((exercise, index) => {
          tasks.push({
            id: `content_${skillId}_${index}`,
            department: 'content_based',
            skillName: 'Content Task',
            microSkill: 'practice',
            difficulty: exercise.difficulty || 3,
            latex: exercise.problem,
            expectedAnswer: exercise.answer,
            misconceptionMap: {}
          });
        });
      }

      // Convert solved examples to tasks
      if (content.examples?.solved?.length > 0) {
        content.examples.solved.slice(0, 1).forEach((example, index) => {
          tasks.push({
            id: `example_${skillId}_${index}`,
            department: 'content_based',
            skillName: 'Example Task',
            microSkill: 'example',
            difficulty: example.difficulty || 3,
            latex: example.problem,
            expectedAnswer: '',
            misconceptionMap: {}
          });
        });
      }

      console.log(`[ContentManager] Generated ${tasks.length} tasks from content`);
      return tasks;
    } catch (error) {
      console.error('[ContentManager] Failed to get initial tasks:', error);
      return [];
    }
  }

  async getFallbackTask(supabaseClient: any, skillId: string, targetDifficulty: number): Promise<any | null> {
    try {
      const content = await this.fetchSkillContent(supabaseClient, skillId);
      if (!content?.practiceExercises?.length) return null;

      const fallbackExercise = content.practiceExercises
        .filter(ex => Math.abs((ex.difficulty || 3) - targetDifficulty) <= 1)
        .shift();

      if (!fallbackExercise) return null;

      console.log(`[ContentManager] Using fallback task with difficulty ${fallbackExercise.difficulty}`);
      
      return {
        id: `fallback_${skillId}_${Date.now()}`,
        department: 'content_based',
        skillName: 'Fallback Task',
        microSkill: 'fallback',
        difficulty: fallbackExercise.difficulty || targetDifficulty,
        latex: fallbackExercise.problem,
        expectedAnswer: fallbackExercise.answer,
        misconceptionMap: {}
      };
    } catch (error) {
      console.error('[ContentManager] Failed to get fallback task:', error);
      return null;
    }
  }
}

const contentManager = new EdgeContentTaskManager();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Jesteś StudyTutor – inteligentnym nauczycielem matematyki z ADAPTACYJNĄ PEDAGOGIKĄ.
Twój nadrzędny cel: REAGUJ na wzorce odpowiedzi ucznia! Czytaj INSTRUKCJE_PEDAGOGICZNE w kontekście.

Model nauczania: I do → We do → You do
- I do: krótkie modelowanie (2–3 zdania + 1 kluczowy wzór), bez pełnego rozwiązania zadania.
- We do: prowadź pytaniami i mikro‑scaffoldingiem (3–5 kroków), sprawdzaj rachunki.
- You do: jedno precyzyjne pytanie sprawdzające na końcu.

Zasady absolutne (ściśle przestrzegaj):
1) Poziom licealny: zadania jak w liceum/matura – żadnych trywialnych przykładów typu 2+2.
2) Trudność adaptacyjna: korzystaj z target_difficulty ("medium"|"hard"); jeśli niepewność – wybierz "medium"; unikaj "easy".
3) Metoda Sokratesa + polityka 2‑1‑0: pytasz → analizujesz → naprowadzasz. Maks. 2 krótkie podpowiedzi i 1 uogólnienie; pełne rozwiązanie tylko na wyraźną prośbę lub po 3 nieudanych próbach.
4) Struktura odpowiedzi DOMYŚLNIE BEZ PODPOWIEDZI: dwa krótkie akapity + lista KROK 1..n. Zakończ jednym pytaniem.
5) Język: polski, precyzyjny, bez żargonu; toleruj literówki/parafrazy; w razie niejasności – jedno pytanie doprecyzowujące.
6) Notacja: LaTeX inline, np. $\\Delta=b^2-4ac$.
7) Kalibracja: start od medium; gdy idzie dobrze – hard; gdy słabo – uprość w granicach liceum.
8) Weryfikacja rachunków: jeśli korygujesz – wskaż błąd jednym zdaniem i popraw.
9) Skupienie: trzymaj się bieżącej umiejętności; dygresje na koniec.
10) Tokeny: odpowiedź ≤ 350 tokenów.
11) Off‑topic: grzecznie wróć do celu lekcji, zaproponuj 2 opcje kontynuacji w temacie.
12) A11y: screen_reader → krótkie zdania; keyboard_only → kolejność; low_vision → numerowane listy; niesłyszący → pełna treść bez audio.
13) Checkpointy: co 7 tur krótka „Notatka nauczyciela” {cel, trudność 1–5, następny krok}.

Polityka podpowiedzi:
- Nigdy w pierwszej turze ani domyślnie.
- Tylko gdy uczeń poprosi lub po dwóch nieudanych próbach.
- Przed wskazówką sprawdź znajomość wymaganej metody krótkim pytaniem; jeśli brak – 2–3‑zdaniowe mikro‑wyjaśnienie z mini‑przykładem.

Struktura odpowiedzi (dla ucznia; bez metadanych):
- Cel ucznia (1 zdanie)
- Kroki (3–5)
- Pytanie sprawdzające (1)
- (co 7 tur) Notatka nauczyciela

Na końcu, tylko gdy masz materiał do mini‑raportu (po domknięciu wątku lub przy checkpointach), dodaj surowy JSON (bez komentarzy), np.:
{ "mastered": ["..."], "struggled": ["..."], "nextSuggested": { "title": "...", "rationale": "..." } }
Bez żadnych komentarzy wokół. Nie powielaj treści odpowiedzi w JSON. JSON jest wyłącznie do użytku systemu.
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

    const { message, sessionId, skillId, responseTime, stepType, currentPhase } = await req.json();
    
    if (!message || !sessionId || !skillId) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get skill details including content_data
    const { data: skill, error: skillError } = await supabaseClient
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .single();

    if (skillError) {
      console.error('Error fetching skill:', skillError);
      throw skillError;
    }

    // Get current phase details
    const { data: phaseData, error: phaseError } = await supabaseClient
      .from('skill_phases')
      .select('*')
      .eq('skill_id', skillId)
      .eq('phase_number', currentPhase || 1)
      .single();

    if (phaseError) {
      console.error('Error fetching phase data:', phaseError);
      // Continue without phase data rather than failing
    }

    // Get skill content for Content → Generator → Fallback workflow
    const skillContent = await contentManager.fetchSkillContent(supabaseClient, skillId);
    console.log('[StudyTutor] Skill content loaded:', {
      hasContent: !!skillContent,
      practiceExercises: skillContent?.practiceExercises?.length || 0,
      examples: skillContent?.examples?.solved?.length || 0
    });


    // Get session details including current_equation and initialized status
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

// Get user profile with diagnostic data and learner profile
const { data: profile } = await supabaseClient
  .from('profiles')
  .select('level, learner_profile')
  .eq('user_id', session.user_id)
  .single();

// Get skill progress for historical performance data
const { data: skillProgress } = await supabaseClient
  .from('skill_progress')
  .select('*')
  .eq('user_id', session.user_id)
  .eq('skill_id', skillId)
  .maybeSingle();

// Get latest diagnostic session for user
const { data: diagnosticSession } = await supabaseClient
  .from('diagnostic_sessions')
  .select('self_ratings, summary, class_level, track, meta')
  .eq('user_id', session.user_id)
  .eq('status', 'completed')
  .order('completed_at', { ascending: false })
  .limit(1)
  .maybeSingle();

// Determine target difficulty using diagnostic data

const recent = (previousSteps || []).slice(-4).filter((s: any) => typeof s.is_correct === 'boolean');
const correctCount = recent.filter((s: any) => s.is_correct).length;

// Enhanced difficulty determination using diagnostic data AND skill progress
let targetDifficulty: 'medium' | 'hard' = 'medium';

// PRIORITY 1: Use historical skill progress if available
if (skillProgress) {
  const masteryLevel = skillProgress.mastery_level || 0;
  const difficultyMultiplier = skillProgress.difficulty_multiplier || 1.0;
  const consecutiveCorrect = skillProgress.consecutive_correct || 0;
  
  console.log(`[Difficulty] Using skill progress: mastery=${masteryLevel}%, multiplier=${difficultyMultiplier}, consecutive=${consecutiveCorrect}`);
  
  // If user is mastered or has high consecutive correct, use hard difficulty
  if (skillProgress.is_mastered || consecutiveCorrect >= 5 || masteryLevel >= 80) {
    targetDifficulty = 'hard';
  } else if (masteryLevel >= 60 || difficultyMultiplier >= 1.3) {
    targetDifficulty = 'hard';
  } else if (masteryLevel < 40 || difficultyMultiplier < 0.8) {
    targetDifficulty = 'medium';
  }
} else {
  // PRIORITY 2: Use diagnostic recommendations if no skill progress
  if (diagnosticSession?.summary?.recommendedDifficulty) {
    targetDifficulty = diagnosticSession.summary.recommendedDifficulty >= 6 ? 'hard' : 'medium';
  } else if (profile?.level && profile.level >= 3) {
    targetDifficulty = 'hard';
  }
}

// PRIORITY 3: Adjust based on recent performance (can override previous)
if (recent.length >= 2) {
  const ratio = correctCount / recent.length;
  if (ratio >= 0.75) targetDifficulty = 'hard';
  if (ratio <= 0.25) targetDifficulty = 'medium';
}

// PRIORITY 4: Consider learner profile preferences (final adjustment)
if (profile?.learner_profile?.preferred_difficulty) {
  const preferredDiff = profile.learner_profile.preferred_difficulty;
  if (preferredDiff >= 7) targetDifficulty = 'hard';
  else if (preferredDiff <= 3) targetDifficulty = 'medium';
}

// Build conversation history for OpenAI
    const turnNumber = (previousSteps?.length || 0) + 1;
const runtimeDirectives = `Runtime: tura=${turnNumber}.
- Jeśli to PIERWSZA WIADOMOŚĆ w sesji (brak poprzednich kroków): ODPOWIEDZ TYLKO w tym formacie i max 6–8 linijek:
Zadanie: [konkretne liczby, zgodne z tematem]
Pytanie: [jedno, konkretne]
Nie dawaj żadnej podpowiedzi.
- Jeśli to kontynuacja sesji: ANALIZUJ odpowiedź ucznia i prowadź go dalej przez to samo zadanie.
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

// Handle session initialization and current equation tracking
let currentEquation = session.current_equation || null;
const isFirstMessage = turnNumber === 1 && message === "Rozpocznij lekcję";

// If this is the first message, mark session as initialized and extract equation from AI response later
if (isFirstMessage && !session.initialized) {
  console.log('First message - initializing session');
}

// For subsequent messages, use the stored equation
if (turnNumber > 1 && !currentEquation && previousSteps && previousSteps.length > 0) {
  // Try to extract equation from first AI response
  const firstResponse = previousSteps[0]?.ai_response || '';
  const equationMatch = firstResponse.match(/([a-z]\s*[+\-=]\s*[^.]*?(?=\s|$|\.|\n))/i);
  currentEquation = equationMatch ? equationMatch[0].trim() : null;
}

// Prepare initial content for AI if this is the first message
let contentContext = '';
if (turnNumber === 1 && skillContent.practiceExercises) {
  const initialExercises = skillContent.practiceExercises.slice(0, 2);
  if (initialExercises.length > 0) {
    contentContext = `\nZADANIA Z BAZY TREŚCI dla ${skill.name}:\n` +
      initialExercises.map((ex, i) => 
        `${i + 1}. ${ex.problem} (Odpowiedź: ${ex.answer})`
      ).join('\n') + '\n\nUżyj jednego z powyższych zadań lub podobnego.';
  }
}

const skillContext = {
  skill_id: skillId,
  skill_name: skill.name,
  class_level: skill.class_level,
  level: skill.level,
  department: skill.department,
  description: skill.description,
  target_difficulty: targetDifficulty,
  current_equation: currentEquation,
  step_number: turnNumber,
  session_initialized: session.initialized || false,
  current_phase: currentPhase || 1,
  phase_name: phaseData?.phase_name || 'Nieznana faza',
  phase_description: phaseData?.phase_description || '',
  phase_ai_instructions: phaseData?.ai_instructions || '',
  phase_success_criteria: phaseData?.success_criteria || {},
  content_context: contentContext,
  has_content: !!skillContent.practiceExercises || !!skillContent.examples,
  // Enhanced diagnostic integration
  diagnostic_profile: {
    has_completed: !!diagnosticSession,
    class_level: diagnosticSession?.class_level || null,
    track: diagnosticSession?.track || 'basic',
    motivation_type: diagnosticSession?.meta?.motivation_type || 'achievement',
    learning_goals: diagnosticSession?.meta?.learning_goals || [],
    self_ratings: diagnosticSession?.self_ratings || {},
    struggled_areas: diagnosticSession?.summary?.struggledAreas || [],
    mastered_skills: diagnosticSession?.summary?.masteredSkills || [],
    recommended_difficulty: diagnosticSession?.summary?.recommendedDifficulty || 3
  },
  learner_profile: profile?.learner_profile || {
    motivation_type: 'achievement',
    preferred_difficulty: 3,
    struggle_areas: [],
    strength_areas: [],
    learning_pace: 'normal'
  },
  // Historical skill progress data
  skill_progress: {
    has_history: !!skillProgress,
    mastery_level: skillProgress?.mastery_level || 0,
    total_attempts: skillProgress?.total_attempts || 0,
    correct_attempts: skillProgress?.correct_attempts || 0,
    consecutive_correct: skillProgress?.consecutive_correct || 0,
    is_mastered: skillProgress?.is_mastered || false,
    difficulty_multiplier: skillProgress?.difficulty_multiplier || 1.0,
    last_reviewed: skillProgress?.last_reviewed_at || null
  }
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
  const contentInstruction = contentContext ? 
    `\n\nUżyj zadania z bazy treści powyżej jako podstawę dla pierwszego ćwiczenia.` : 
    `\n\nBrak zadań w bazie treści - użyj generatora zadań.`;
  
  userMessage = `Pierwsza tura: podaj tylko dwie sekcje –\nZadanie: [zawiera konkretne liczby, dotyczy: ${skill.name}]\nPytanie: [jedno, konkretne]\nPoziom: szkoła średnia (${targetDifficulty}). Zero metatekstu. Nie dodawaj podpowiedzi.${contentInstruction}`;
}

// For now, just add the basic context (we'll analyze after getting AI response)
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

    // Call OpenAI API with GPT-5 parameters
    console.log('Calling OpenAI API with GPT-5...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 350,
        temperature: 0.7,
      }),
    });

    console.log('OpenAI Response status:', openAIResponse.status);
    
    let aiMessage: string;
    let usedFallback = false;

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('[AI Error] OpenAI API error:', errorText);
      
      // Attempt fallback to content-based task
      const fallbackTask = await contentManager.getFallbackTask(supabaseClient, skillId, targetDifficulty === 'hard' ? 4 : 3);
      
      if (fallbackTask) {
        console.log('[Fallback] Using content-based fallback task');
        aiMessage = `Zadanie: ${fallbackTask.latex}

Tym razem pracujemy z zadaniem z naszej bazy danych. Zacznij od przeanalizowania treści i określenia, jaką metodę zastosujemy.

Jak myślisz, od czego należy zacząć rozwiązywanie tego zadania?`;
        usedFallback = true;
      } else {
        console.log('[Fallback] No content available, using generic fallback');
        aiMessage = `Przepraszam, wystąpił problem techniczny. Spróbujmy z prostszym zadaniem.

Oblicz: $2x + 5 = 11$

Jaką metodę zastosujemy, aby rozwiązać to równanie?`;
        usedFallback = true;
      }
    } else {
      const aiResponse = await openAIResponse.json();
      aiMessage = aiResponse.choices?.[0]?.message?.content;
      
      if (!aiMessage) {
        console.error('[AI Error] No AI message in response:', aiResponse);
        // Use fallback here too
        const fallbackTask = await contentManager.getFallbackTask(supabaseClient, skillId, targetDifficulty === 'hard' ? 4 : 3);
        if (fallbackTask) {
          aiMessage = `Zadanie: ${fallbackTask.latex}

Pracujemy z zadaniem z bazy danych.

Od czego zaczniemy?`;
          usedFallback = true;
        } else {
          throw new Error('No response from AI and no fallback available');
        }
      } else {
        // Validate AI response quality
        const isValidResponse = validateAIResponse(aiMessage);
        if (!isValidResponse) {
          console.log('[AI Validation] Response failed validation, using fallback');
          const fallbackTask = await contentManager.getFallbackTask(supabaseClient, skillId, targetDifficulty === 'hard' ? 4 : 3);
          if (fallbackTask) {
            aiMessage = `Zadanie: ${fallbackTask.latex}

Spróbujmy z zadaniem z naszej bazy danych.

Jak podejdziemy do tego zadania?`;
            usedFallback = true;
          }
        }
      }
    }

    const tokensUsed = usedFallback ? 0 : (await openAIResponse.json()).usage?.total_tokens || 0;

    // Generate unique step number to prevent overwriting
    const nextStepNumber = (previousSteps?.length || 0) + 1;

    // Enhanced answer evaluation using dedicated math validation
    const mathContext: MathContext = {
      currentEquation: currentEquation || undefined,
      expectedAnswerType: 'number', // Default - can be enhanced later
      stepNumber: nextStepNumber,
      previousSteps: previousSteps?.map(s => s.user_input || '') || []
    };

    const evaluation = evaluateAnswer(message, aiMessage, mathContext);
    const isCorrect = evaluation.isCorrect;

    // Build student profile from session data
    const studentProfile: StudentProfile = {
      averageResponseTime: session.average_response_time_ms || 5000,
      correctAnswerRate: recent.length > 0 ? correctCount / recent.length : 0.5,
      commonMistakes: [], // Could be enhanced from historical data
      preferredExplanationStyle: 'step_by_step', // Default
      difficultyLevel: profile?.level || 3,
      knowledgeGaps: [], // Could be enhanced
      lastActivity: new Date()
    };

    // Analyze student answer using adaptive pedagogy
    const sessionContext = {
      stepsCompleted: nextStepNumber - 1,
      consecutiveCorrect: getConsecutiveCorrect(previousSteps || []),
      recentPerformance: recent.map(s => ({
        isCorrect: s.is_correct,
        responseTime: s.response_time_ms || 5000,
        confidence: 0.7 // Default confidence
      })),
      currentDifficulty: targetDifficulty === 'hard' ? 7 : 5,
      timeSpent: calculateSessionTime(previousSteps || [])
    };

    // Only analyze for non-first messages (after we have AI response)
    let analysis: any = undefined;
    if (turnNumber > 1) {
      analysis = analyzeStudentAnswer(
        message,
        "dummy_expected", // We don't have expected answer here, using AI evaluation instead
        responseTime || 5000,
        isCorrect,
        studentProfile,
        sessionContext
      );
      
      console.log('Adaptive pedagogy analysis:', {
        pattern: analysis.pattern,
        confidence: analysis.confidence,
        teachingMomentType: analysis.teachingMoment.type,
        nextAction: analysis.teachingMoment.nextAction,
        sessionShouldContinue: analysis.sessionShouldContinue
      });
    }
    
    console.log('Answer evaluation result:', {
      userInput: message,
      isCorrect: evaluation.isCorrect,
      confidence: evaluation.confidence,
      errorType: evaluation.errorType,
      pseudoActivity: evaluation.pseudoActivity
    });
    const stepId = `${sessionId}_${nextStepNumber}_${Date.now()}`;
    
    console.log(`Creating step ${nextStepNumber} for session ${sessionId}`, {
      userMessage: message,
      aiResponse: aiMessage.substring(0, 100) + '...',
      isCorrect,
      stepType: stepType || 'question'
    });

    // Save lesson step with fallback tracking
    const stepData = {
      session_id: sessionId,
      step_number: nextStepNumber,
      step_type: usedFallback ? 'fallback' : (stepType || 'question'),
      ai_prompt: JSON.stringify(skillContext),
      ai_response: aiMessage,
      user_input: message,
      is_correct: isCorrect,
      response_time_ms: responseTime,
      tokens_used: tokensUsed
    };

    // Log fallback usage for monitoring
    if (usedFallback) {
      console.log(`[Fallback Used] Session ${sessionId}, Turn ${nextStepNumber}, Skill ${skillId}`);
    }
    
    console.log('Inserting lesson step:', stepData);
    
    const { error: stepInsertError } = await supabaseClient
      .from('lesson_steps')
      .insert(stepData);

    if (stepInsertError) {
      console.error('Error saving lesson step:', stepInsertError);
    } else {
      // CRITICAL: Update skill progress after saving step
      await updateSkillProgress(supabaseClient, session.user_id, skillId, isCorrect, responseTime);
    }

    // Extract equation from AI response for first message
    let extractedEquation = currentEquation;
    if (isFirstMessage && !extractedEquation) {
      const equationMatch = aiMessage.match(/([a-z]\s*[+\-=]\s*[^.]*?(?=\s|$|\.|\n))/i);
      extractedEquation = equationMatch ? equationMatch[0].trim() : null;
      console.log('Extracted equation from first response:', extractedEquation);
    }

    // Update session statistics
    const newHintsUsed = stepType === 'hint' ? session.hints_used + 1 : session.hints_used;
    const newEarlyReveals = message.toLowerCase().includes('pokaż rozwiązanie') ? 
                           session.early_reveals + 1 : session.early_reveals;
    const newStrikes = evaluation.pseudoActivity ? session.pseudo_activity_strikes + 1 : 
                      (isCorrect ? Math.max(0, session.pseudo_activity_strikes - 1) : session.pseudo_activity_strikes);

    const sessionUpdate: any = {
      completed_steps: nextStepNumber,
      total_steps: Math.max(session.total_steps, nextStepNumber),
      hints_used: newHintsUsed,
      early_reveals: newEarlyReveals,
      pseudo_activity_strikes: newStrikes,
      total_tokens_used: session.total_tokens_used + tokensUsed,
      average_response_time_ms: userSteps.length > 0 ? 
        Math.round((session.average_response_time_ms * userSteps.length + responseTime) / (userSteps.length + 1)) :
        responseTime
    };

    // Mark session as initialized and store current equation  
    if (isFirstMessage) {
      sessionUpdate.initialized = true;
      if (extractedEquation) {
        sessionUpdate.current_equation = extractedEquation;
      }
    }

    console.log('Updating session with:', sessionUpdate);

    const { error: sessionUpdateError } = await supabaseClient
      .from('study_sessions')
      .update(sessionUpdate)
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

    // Return response with enhanced metadata
    const responseData: any = {
      message: aiMessage,
      tokensUsed: tokensUsed,
      stepNumber: nextStepNumber,
      pseudoActivityDetected: evaluation.pseudoActivity || false,
      correctAnswer: isCorrect,
      hints: newHintsUsed,
      strikes: newStrikes
    };

    // Add adaptive pedagogy insights for debugging/monitoring
    if (typeof analysis !== 'undefined') {
      responseData.pedagogyInsights = {
        pattern: analysis.pattern,
        confidence: analysis.confidence,
        teachingMomentType: analysis.teachingMoment.type,
        nextAction: analysis.teachingMoment.nextAction,
        sessionShouldContinue: analysis.sessionShouldContinue,
        difficultyAdjustment: analysis.teachingMoment.difficultyAdjustment
      };
    }

    return new Response(JSON.stringify(responseData), {
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

// Helper functions for adaptive pedagogy
function getConsecutiveCorrect(steps: any[]): number {
  let count = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].is_correct === true) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function getConsecutiveIncorrect(steps: any[]): number {
  let count = 0;
  for (let i = steps.length - 1; i >= 0; i--) {
    if (steps[i].is_correct === false) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

function calculateSessionTime(steps: any[]): number {
  if (steps.length === 0) return 0;
  const firstStep = steps[0];
  const lastStep = steps[steps.length - 1];
  return new Date(lastStep.created_at).getTime() - new Date(firstStep.created_at).getTime();
}

function determineLearningPhase(steps: any[]): string {
  const totalSteps = steps.length;
  const correctRate = steps.filter(s => s.is_correct).length / Math.max(totalSteps, 1);
  
  if (totalSteps < 3) return 'theory';
  if (correctRate < 0.5) return 'guided_practice';
  if (correctRate < 0.8) return 'independent_practice';
  return 'assessment';
}

function calculateResponseVariability(steps: any[]): number {
  if (steps.length < 3) return 0.5;
  
  const responseTimes = steps
    .filter(s => s.response_time_ms)
    .map(s => s.response_time_ms);
    
  if (responseTimes.length < 2) return 0.5;
  
  const mean = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
  const variance = responseTimes.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / responseTimes.length;
  const stdDev = Math.sqrt(variance);
  
  return Math.min(1, stdDev / mean); // Coefficient of variation
}

// CRITICAL: Function to update skill progress after each step
async function updateSkillProgress(supabaseClient: any, userId: string, skillId: string, isCorrect: boolean, responseTime: number) {
  try {
    console.log(`[SkillProgress] Updating progress for user ${userId}, skill ${skillId}, correct: ${isCorrect}`);
    
    // Get current skill progress
    const { data: currentProgress, error: progressError } = await supabaseClient
      .from('skill_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('skill_id', skillId)
      .maybeSingle();

    if (progressError) {
      console.error('[SkillProgress] Error fetching current progress:', progressError);
      return;
    }

    // Calculate new values
    const totalAttempts = (currentProgress?.total_attempts || 0) + 1;
    const correctAttempts = (currentProgress?.correct_attempts || 0) + (isCorrect ? 1 : 0);
    const consecutiveCorrect = isCorrect ? 
      (currentProgress?.consecutive_correct || 0) + 1 : 0;
    
    // Calculate mastery level (percentage correct)
    const masteryLevel = Math.round((correctAttempts / totalAttempts) * 100);
    
    // Calculate difficulty multiplier based on performance
    let difficultyMultiplier = currentProgress?.difficulty_multiplier || 1.0;
    if (isCorrect && consecutiveCorrect >= 3) {
      difficultyMultiplier = Math.min(2.0, difficultyMultiplier + 0.1);
    } else if (!isCorrect) {
      difficultyMultiplier = Math.max(0.5, difficultyMultiplier - 0.05);
    }
    
    // Determine if skill is mastered (80%+ accuracy with at least 5 attempts)
    const isMastered = masteryLevel >= 80 && totalAttempts >= 5;
    
    const progressData = {
      user_id: userId,
      skill_id: skillId,
      mastery_level: masteryLevel,
      total_attempts: totalAttempts,
      correct_attempts: correctAttempts,
      consecutive_correct: consecutiveCorrect,
      difficulty_multiplier: difficultyMultiplier,
      is_mastered: isMastered,
      last_reviewed_at: new Date().toISOString(),
      next_review_at: new Date(Date.now() + (isMastered ? 7 : 1) * 24 * 60 * 60 * 1000).toISOString(), // 7 days if mastered, 1 day if not
      updated_at: new Date().toISOString()
    };

    const { error: upsertError } = await supabaseClient
      .from('skill_progress')
      .upsert(progressData, {
        onConflict: 'user_id,skill_id'
      });

    if (upsertError) {
      console.error('[SkillProgress] Error updating skill progress:', upsertError);
    } else {
      console.log(`[SkillProgress] Updated: mastery=${masteryLevel}%, attempts=${totalAttempts}, consecutive=${consecutiveCorrect}, multiplier=${difficultyMultiplier.toFixed(2)}, mastered=${isMastered}`);
    }

  } catch (error) {
    console.error('[SkillProgress] Unexpected error updating skill progress:', error);
  }
}