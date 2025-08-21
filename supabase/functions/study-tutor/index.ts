import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { evaluateAnswer, MathContext } from './mathValidation.ts';
import { analyzeStudentAnswer, StudentProfile, TeachingMoment, FlowStateIndicators } from './adaptivePedagogy.ts';
import { validateAIResponse, extractMathEquation } from './aiValidation.ts';
import { 
  calculateFlowState, 
  calculateZPDAlignment, 
  selectPedagogicalStrategy,
  calculateDifficultyAdjustment,
  shouldTakeMicroBreak,
  calculateOptimalSessionLength 
} from './cognitiveAnalysis.ts';
import { buildCognitiveProfile } from './profileBuilder.ts';
import { buildPedagogicalInstructions } from './instructionBuilder.ts';
import { updateLearnerProfileWithCognition } from './profileUpdater.ts';

// Token estimation and budget control
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4); // Rough approximation: 4 chars = 1 token
}

const INPUT_BUDGET = 1200;
const RECENT_WINDOW_DEFAULT = 6;
const COMPACT_MAX_TOKENS = 180;
const CLAMP_COMPACT_TOKENS = 120;

// Enhanced token monitoring
function logTokenUsage(sessionId: string, inputTokens: number, outputTokens: number, windowPairs: number, compactLen: number) {
  console.log(`[TokenMonitor] Session: ${sessionId}, Input: ${inputTokens}, Output: ${outputTokens}, Window: ${windowPairs}, Compact: ${compactLen}`);
  
  // Alerts
  if (inputTokens > 1400) {
    console.warn(`[TokenAlert] Input tokens exceed 1400: ${inputTokens}`);
  }
  if (compactLen > 200) {
    console.warn(`[TokenAlert] Compact summary too long: ${compactLen} tokens`);
  }
}

// Intelligent budget cutting
function clampCompact(text: string, maxTokens: number): string {
  const tokens = estimateTokens(text);
  if (tokens <= maxTokens) return text;
  
  const ratio = maxTokens / tokens;
  const targetLength = Math.floor(text.length * ratio * 0.9); // 10% buffer
  return text.substring(0, targetLength) + "...";
}

function minifySystemPrompts(skillContext: string, pedagogicalInstructions: string): { skill: string, pedagogy: string } {
  return {
    skill: skillContext.split('\n')[0] + " (skrócone)",
    pedagogy: pedagogicalInstructions.split('\n')[0] + " (auto)"
  };
}

// Session Summary Types
interface SessionSummaryState {
  session_id: string;
  student_id: string;
  skill_focus: string[];
  phase: string;
  difficulty_pref: number;
  last_difficulty: number;
  progress: {
    attempts: number;
    correct_streak: number;
    errors_total: number;
    hint_uses: number;
    early_reveal: number;
  };
  misconceptions: Array<{code: string, count: number}>;
  mastered: string[];
  struggled: string[];
  spaced_repetition: {
    due_cards: number;
    review_ratio: number;
  };
  affect: {
    pace: string;
    pseudo_activity_strikes: number;
  };
  last_window_digest: string;
  next_recommendation: {
    skill_uuid: string;
    rationale: string;
  } | null;
  updated_at: string;
}

interface MessagePair {
  user?: string;
  assistant?: string;
  sequence: number;
  tokens_estimate?: number;
}

// Session Summarization Functions
// Enhanced summarization triggers
async function needsResummarization(supabaseClient: any, sessionId: string, predictedInputTokens?: number): Promise<boolean> {
  const { data: session } = await supabaseClient
    .from('study_sessions')
    .select('last_summarized_sequence, summary_updated_at, status, session_type')
    .eq('id', sessionId)
    .single();

  const { data: interactions } = await supabaseClient
    .from('learning_interactions')
    .select('sequence_number')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: false })
    .limit(1);

  const lastSequence = interactions?.[0]?.sequence_number || 0;
  const lastSummarized = session?.last_summarized_sequence || 0;
  const sequencesSince = lastSequence - lastSummarized;
  
  const summaryAge = session?.summary_updated_at ? 
    Date.now() - new Date(session.summary_updated_at).getTime() : 
    Infinity;

  // Enhanced triggers
  const reasons = [];
  
  if (sequencesSince >= 8) reasons.push('8_turns');
  if (summaryAge > 24 * 60 * 60 * 1000) reasons.push('24_hours');
  if (predictedInputTokens && predictedInputTokens > 900) reasons.push('token_budget');
  if (session?.status === 'completed') reasons.push('lesson_end');
  if (sequencesSince >= 2 && session?.session_type !== session?.last_summarized_session_type) reasons.push('phase_change');
  
  if (reasons.length > 0) {
    console.log(`[Summarization] Triggered by: ${reasons.join(', ')}`);
    return true;
  }
  
  return false;
}

// Build dynamic pedagogical instructions based on session state
function buildPedagogicalInstructions(summaryState: SessionSummaryState | null): string {
  if (!summaryState) return "INSTRUKCJE_PEDAGOGICZNE: Standardowe tempo, brak specjalnych adaptacji";
  
  const { progress, affect, misconceptions } = summaryState;
  const instructions: string[] = [];
  
  // Pace adjustment
  if (affect.pace === 'fast') {
    instructions.push("TEMPO: Zwiększ trudność");
  } else if (affect.pace === 'slow') {
    instructions.push("TEMPO: Zwolnij, dodaj wyjaśnienia");
  }
  
  // Pseudo-activity detection
  if (affect.pseudo_activity_strikes >= 2) {
    instructions.push("PSEUDO-AKTYWNOŚĆ: Wymagaj szczegółowych wyjaśnień");
  }
  
  // Top misconception
  const topMisconception = misconceptions?.[0]?.code;
  if (topMisconception && misconceptions[0].count >= 2) {
    instructions.push(`GŁÓWNY_BŁĄD: ${topMisconception} (${misconceptions[0].count}x)`);
  }
  
  // Success streak
  if (progress.correct_streak >= 3) {
    instructions.push("SUKCES: Można zwiększyć trudność");
  } else if (progress.errors_total > progress.attempts * 0.6) {
    instructions.push("BŁĘDY: Potrzebne wsparcie i uproszczenie");
  }
  
  return instructions.length > 0 
    ? `INSTRUKCJE_PEDAGOGICZNE: ${instructions.join('; ')}`
    : "INSTRUKCJE_PEDAGOGICZNE: Kontynuuj standardowo";
}

function detectMisconceptions(messages: Array<{role: string, content: string}>): Array<{code: string, count: number}> {
  const codes: Record<string, number> = {};
  const push = (c: string) => (codes[c] = (codes[c] || 0) + 1);
  
  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const text = msg.content.toLowerCase();
    
    if (/\bdelta\b|Δ|b\^2-4ac/.test(text)) push('discriminant_error');
    if (/zmian[aey] znak|minus na plus|plus na minus/.test(text)) push('equation_sign_flip');
    if (/pierwiastk|sqrt/.test(text) && /błąd|error/.test(text)) push('root_selection_error');
  }
  
  return Object.entries(codes)
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
}

// Enhanced session summary with complete state tracking
async function updateSessionSummary(supabaseClient: any, sessionId: string): Promise<void> {
  console.log('[Summarization] Starting summary update for session:', sessionId);
  
  try {
    const { data: session } = await supabaseClient
      .from('study_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    const { data: interactions } = await supabaseClient
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .gt('sequence_number', session?.last_summarized_sequence || 0)
      .order('sequence_number', { ascending: true });

    if (!interactions?.length) return;

    // Build conversation pairs for analysis
    const messages = interactions
      .filter(i => i.user_input || i.ai_response)
      .flatMap(i => [
        i.user_input ? { role: 'user', content: i.user_input } : null,
        i.ai_response ? { role: 'assistant', content: i.ai_response } : null
      ])
      .filter(Boolean);

    // Enhanced analytics
    const misconceptions = detectMisconceptions(messages);
    const totalAttempts = interactions.filter(i => i.user_input).length;
    const correctAttempts = interactions.filter(i => i.correctness_level === 1).length;
    const hintUses = interactions.filter(i => i.interaction_type === 'hint_request').length;
    const earlyReveals = interactions.filter(i => i.assistant_flags?.early_reveal).length;
    
    // Calculate streaks and struggles
    let correctStreak = 0;
    let consecutiveErrors = 0;
    const mastered: string[] = [];
    const struggled: string[] = [];
    
    for (let i = interactions.length - 1; i >= 0; i--) {
      if (interactions[i].correctness_level === 1) {
        correctStreak++;
        consecutiveErrors = 0;
      } else {
        consecutiveErrors++;
        if (correctStreak > 0) break; // End of streak
      }
    }

    // Determine mastered/struggled skills
    const skillAccuracy = correctAttempts / Math.max(totalAttempts, 1);
    if (skillAccuracy >= 0.8 && correctStreak >= 3) {
      mastered.push(session.skill_id);
    } else if (skillAccuracy < 0.5 || consecutiveErrors >= 3) {
      struggled.push(session.skill_id);
    }

    // Enhanced affect detection
    const avgResponseTime = interactions
      .filter(i => i.response_time_ms)
      .reduce((sum, i) => sum + i.response_time_ms, 0) / Math.max(interactions.filter(i => i.response_time_ms).length, 1);
    
    const pace = avgResponseTime < 30000 ? 'fast' : avgResponseTime > 120000 ? 'slow' : 'normal';
    const pseudoActivityStrikes = interactions.filter(i => i.assistant_flags?.pseudo_fast).length;

    // Spaced repetition metrics (simplified)
    const dueCards = Math.max(0, 5 - correctStreak);
    const reviewRatio = correctAttempts / Math.max(totalAttempts, 1);

    // Build comprehensive summary state
    const summaryState: SessionSummaryState = {
      session_id: sessionId,
      student_id: session.user_id,
      skill_focus: [session.skill_id],
      phase: session.session_type || 'wprowadzenie_podstaw',
      difficulty_pref: session.difficulty_level || 3,
      last_difficulty: session.difficulty_level || 3,
      progress: {
        attempts: totalAttempts,
        correct_streak: correctStreak,
        errors_total: totalAttempts - correctAttempts,
        hint_uses: hintUses,
        early_reveal: earlyReveals
      },
      misconceptions,
      mastered,
      struggled,
      spaced_repetition: { 
        due_cards: dueCards, 
        review_ratio: reviewRatio 
      },
      affect: {
        pace,
        pseudo_activity_strikes: pseudoActivityStrikes
      },
      last_window_digest: `Ostatnie ${Math.min(interactions.length, 6)} interakcji: ${correctAttempts}/${totalAttempts} poprawnych`,
      next_recommendation: mastered.length > 0 ? {
        skill_uuid: 'next_skill_uuid',
        rationale: 'Skill mastered, ready for next level'
      } : null,
      updated_at: new Date().toISOString()
    };

    // Generate compact summary with token control
    const compactSummary = generateCompactSummary(summaryState);
    
    // Save summary to database
    const lastSequence = interactions[interactions.length - 1]?.sequence_number || 0;
    
    await supabaseClient
      .from('study_sessions')
      .update({
        summary_compact: compactSummary,
        summary_state: summaryState,
        last_summarized_sequence: lastSequence,
        summary_updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    console.log('[Summarization] Enhanced summary updated successfully');
  } catch (error) {
    console.error('[Summarization] Error updating summary:', error);
  }
}

// Enhanced compact summary generation with token control
function generateCompactSummary(state: SessionSummaryState): string {
  const { progress, misconceptions, affect, spaced_repetition } = state;
  const topMisconception = misconceptions[0]?.code || 'brak';
  const accuracy = progress.attempts > 0 ? 
    Math.round((progress.attempts - progress.errors_total) / progress.attempts * 100) : 0;

  let summary = [
    `[SESJA] ${state.phase}, Focus: ${state.skill_focus[0] || 'nieznana umiejętność'}`,
    `[UCZEŃ] Preferuje trudność ${state.difficulty_pref}, tempo: ${affect.pace}`,
    `[POSTĘP] Próby ${progress.attempts}, streak ${progress.correct_streak}, celność ${accuracy}%, podpowiedzi ${progress.hint_uses}×`,
    `[STATUS] Błędy: ${topMisconception}, pseudo-aktywność: ${affect.pseudo_activity_strikes}`,
    `[DALEJ] Kontynuuj z trudnością ${state.last_difficulty}`
  ].join('\n');
  
  // Ensure it fits within token budget
  return clampCompact(summary, COMPACT_MAX_TOKENS);
}

// Enhanced recent window with better edge case handling
async function getRecentWindow(supabaseClient: any, sessionId: string, pairs: number = 6): Promise<MessagePair[]> {
  const { data: interactions } = await supabaseClient
    .from('learning_interactions')
    .select('sequence_number, user_input, ai_response, tokens_estimate')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: false })
    .limit(pairs * 2); // Get more to filter properly

  const filtered = (interactions || [])
    .filter(i => i.user_input || i.ai_response) // Only complete interactions
    .slice(0, pairs)
    .reverse()
    .map(i => {
      // Handle multiple assistant responses by joining them
      const assistantContent = typeof i.ai_response === 'string' && i.ai_response.includes('\n\n---\n\n')
        ? i.ai_response.split('\n\n---\n\n')[0] // Take first part if multiple
        : i.ai_response;
        
      return {
        user: i.user_input,
        assistant: assistantContent,
        sequence: i.sequence_number,
        tokens_estimate: i.tokens_estimate || 0
      };
    });

  return filtered;
}

// Enhanced layered context with intelligent budget management
async function buildLayeredContext(supabaseClient: any, sessionId: string, userMessage: string): Promise<{ messages: any[], tokenStats: any }> {
  // Pre-calculate estimated input tokens to trigger summarization if needed
  const estimatedUserTokens = estimateTokens(userMessage);
  const predictedInputTokens = estimatedUserTokens + 800; // Base system prompts + context
  
  // Check if summarization is needed (including token budget trigger)
  if (await needsResummarization(supabaseClient, sessionId, predictedInputTokens)) {
    await updateSessionSummary(supabaseClient, sessionId);
  }

  // Get summary and recent window
  const { data: session } = await supabaseClient
    .from('study_sessions')
    .select('summary_compact, summary_state, skill_id')
    .eq('id', sessionId)
    .single();

  let recentWindow = await getRecentWindow(supabaseClient, sessionId, RECENT_WINDOW_DEFAULT);
  
  // Get skill context
  const skillContext = session?.skill_id 
    ? `KONTEKST_UMIEJĘTNOŚCI: Matematyka - umiejętność ${session.skill_id}` 
    : 'KONTEKST_UMIEJĘTNOŚCI: Matematyka - poziom licealny';
  
  // Build dynamic pedagogical instructions
  const pedagogicalInstructions = buildPedagogicalInstructions(session?.summary_state);

  // Build layered messages
  const messages: any[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'system', content: skillContext },
    { role: 'system', content: pedagogicalInstructions }
  ];

  // Add compact summary if exists
  if (session?.summary_compact) {
    messages.push({
      role: 'system',
      content: `SESSION_SUMMARY:\n${session.summary_compact}`
    });
  }

  // Add recent conversation window
  for (const pair of recentWindow) {
    if (pair.user) messages.push({ role: 'user', content: pair.user });
    if (pair.assistant) messages.push({ role: 'assistant', content: pair.assistant });
  }

  // Add current user message
  messages.push({ role: 'user', content: userMessage });

  let currentTokens = estimateTokens(messages.map(m => m.content).join('\n'));
  
  // Intelligent budget cutting
  while (currentTokens > INPUT_BUDGET && recentWindow.length > 4) {
    recentWindow = recentWindow.slice(1);
    
    // Use minified prompts for extreme budget pressure
    const minified = minifySystemPrompts(skillContext, pedagogicalInstructions);
    
    const compactMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'system', content: minified.skill },
      { role: 'system', content: minified.pedagogy }
    ];

    if (session?.summary_compact) {
      const clampedSummary = clampCompact(session.summary_compact, CLAMP_COMPACT_TOKENS);
      compactMessages.push({
        role: 'system',
        content: `SESSION_SUMMARY:\n${clampedSummary}`
      });
    }

    for (const pair of recentWindow) {
      if (pair.user) compactMessages.push({ role: 'user', content: pair.user });
      if (pair.assistant) compactMessages.push({ role: 'assistant', content: pair.assistant });
    }

    compactMessages.push({ role: 'user', content: userMessage });
    
    currentTokens = estimateTokens(compactMessages.map(m => m.content).join('\n'));
    
    if (currentTokens <= INPUT_BUDGET) {
      const stats = {
        inputTokens: currentTokens,
        windowPairs: recentWindow.length,
        compactLen: session?.summary_compact ? estimateTokens(session.summary_compact) : 0,
        minified: true
      };
      return { messages: compactMessages, tokenStats: stats };
    }
  }

  const stats = {
    inputTokens: currentTokens,
    windowPairs: recentWindow.length,
    compactLen: session?.summary_compact ? estimateTokens(session.summary_compact) : 0,
    minified: false
  };
  
  return { messages, tokenStats: stats };
}

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

// Helper function to get skill ID from skill code  
async function getSkillIdFromCode(supabaseClient: any, skillCode: string): Promise<string> {
  try {
    // Try to find skill by name or department first
    const { data: skills, error } = await supabaseClient
      .from('skills')
      .select('id, name, department')
      .eq('is_active', true)
      .or(`name.ilike.%${skillCode}%, department.eq.${skillCode}`);
    
    if (error) {
      console.error('Error fetching skill by code:', error);
      return await getDefaultSkill(supabaseClient);
    }
    
    if (skills && skills.length > 0) {
      return skills[0].id;
    }
    
    // Fallback to default skill
    return await getDefaultSkill(supabaseClient);
  } catch (error) {
    console.error('Error in getSkillIdFromCode:', error);
    return await getDefaultSkill(supabaseClient);
  }
}

async function getDefaultSkill(supabaseClient: any): Promise<string> {
  try {
    const { data: skills, error } = await supabaseClient
      .from('skills')
      .select('id, name')
      .eq('is_active', true)
      .eq('department', 'real_numbers')
      .limit(1);
    
    if (error || !skills || skills.length === 0) {
      console.warn('No active skills found, using fallback');
      return 'default_skill';
    }
    
    return skills[0].id;
  } catch (error) {
    console.error('Error fetching skills:', error);
    return 'default_skill';
  }
}

// Get skill content from new tables
async function getSkillContent(supabaseClient: any, skillId: string) {
  try {
    // Get theory content
    const { data: theory } = await supabaseClient
      .from('skill_theory_content')
      .select('*')
      .eq('skill_id', skillId)
      .eq('is_active', true)
      .single();

    // Get examples  
    const { data: examples } = await supabaseClient
      .from('skill_examples')
      .select('*')
      .eq('skill_id', skillId)
      .eq('is_active', true);

    // Get practice exercises
    const { data: exercises } = await supabaseClient
      .from('skill_practice_exercises')
      .select('*')
      .eq('skill_id', skillId)
      .eq('is_active', true);

    // Get misconception patterns
    const { data: misconceptions } = await supabaseClient
      .from('skill_misconception_patterns')
      .select('*')
      .eq('skill_id', skillId)
      .eq('is_active', true);

    return {
      theory,
      examples: examples || [],
      exercises: exercises || [],
      misconceptions: misconceptions || []
    };
  } catch (error) {
    console.error('Error fetching skill content:', error);
    return null;
  }
}

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

    const { 
      message, 
      sessionId, 
      skillId, 
      responseTime, 
      stepType, 
      currentPhase,
      actionType,
      sessionType,
      department,
      userAnswer,
      expectedAnswer
    } = await req.json();

    // Handle different action types with flexible validation
    const isProfileAction = actionType === 'get_profile' || message === 'get_profile';
    const isSessionAction = actionType === 'start_session' || message === 'start_session';
    const isTaskAction = actionType === 'generate_task' || message === 'generate_task';
    const isChatAction = actionType === 'chat_message' || (!sessionId && !skillId && message);
    
    // Flexible validation based on action type
    if (!isProfileAction && !isSessionAction && !isTaskAction && !isChatAction && (!message || !sessionId || !skillId)) {
      throw new Error('Missing required parameters');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('User not authenticated');
    }

    // Handle different action types
    if (isProfileAction) {
      return await handleGetProfile(supabaseClient, user.id);
    }
    
    if (isSessionAction) {
      // Get default skill if none provided
      const targetSkillId = skillId || await getDefaultSkill(supabaseClient);
      return await handleStartSession(supabaseClient, user.id, sessionType || 'adaptive_practice', targetSkillId);
    }
    
    if (isTaskAction) {
      // Get default skill if none provided
      const targetSkillId = skillId || await getDefaultSkill(supabaseClient);
      return await handleGenerateTask(supabaseClient, sessionId, targetSkillId);
    }
    
    if (isChatAction) {
      return await handleChatMessage(supabaseClient, user.id, message, department || 'mathematics');
    }

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

    // Get previous conversation history from learning_interactions
    const { data: previousSteps, error: stepsError } = await supabaseClient
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('interaction_timestamp', { ascending: true });

    if (stepsError) {
      console.error('Error fetching interactions:', stepsError);
      // Continue without history rather than failing
    }

    // Calculate average response time for pseudo-activity detection (skip for initial/start steps)
    const userSteps = previousSteps?.filter(step => step.response_time_ms) || [];
    const averageResponseTime = userSteps.length > 0 
      ? userSteps.reduce((sum, step) => sum + (step.response_time_ms || 0), 0) / userSteps.length
      : 5000; // Default 5 seconds
    const minResponseTime = Math.max(averageResponseTime * 0.4, 2000); // Minimum 2 seconds
    const startKeywords = ['rozpocznij', 'zacznij', 'start'];
    const isStartLike = typeof message === 'string' && startKeywords.some(k => message.toLowerCase().includes(k));
    const hasEnoughHistory = (previousSteps?.length || 0) >= 2;
    const isPseudoActivity = hasEnoughHistory && !isStartLike && responseTime > 0 && responseTime < minResponseTime;

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

    // Get enhanced user profile with cognitive data
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('level, learner_profile')
      .eq('user_id', session.user_id)
      .single();

    // Get advanced cognitive intelligence data (NEW)
    const { data: learnerIntelligence } = await supabaseClient
      .from('learner_intelligence')
      .select('*')
      .eq('user_id', session.user_id)
      .single();
      
    const { data: emotionalStates } = await supabaseClient
      .from('emotional_learning_states')
      .select('*')
      .eq('user_id', session.user_id)
      .order('detected_at', { ascending: false })
      .limit(5);
      
    const { data: metacognitiveData } = await supabaseClient
      .from('metacognitive_development')
      .select('*')
      .eq('user_id', session.user_id)
      .single();
      
    const { data: misconceptionNetworks } = await supabaseClient
      .from('misconception_networks')
      .select('*')
      .eq('user_id', session.user_id)
      .order('last_manifested', { ascending: false })
      .limit(10);

    // Build enhanced cognitive profile from ALL stored data
    const cognitiveProfile = buildCognitiveProfile(
      profile, 
      skillProgress, 
      diagnosticSession,
      learnerIntelligence,
      emotionalStates,
      metacognitiveData,
      misconceptionNetworks
    );

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
    // Build layered context with session summaries and token control
    console.log('[LayeredContext] Building layered context for session:', sessionId);
    const contextResult = await buildLayeredContext(supabaseClient, sessionId, message);
    const messages = contextResult.messages;
    const tokenStats = contextResult.tokenStats;
    
    // Log token usage for monitoring
    logTokenUsage(
      sessionId, 
      tokenStats.inputTokens, 
      0, // outputTokens - will be set after AI response
      tokenStats.windowPairs,
      tokenStats.compactLen
    );

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

    // Add tokens estimation for the current interaction
    const currentTokens = estimateTokens(message);
    
    console.log('[LayeredContext] Built context with', messages.length, 'messages');
    console.log('[LayeredContext] Estimated tokens for current message:', currentTokens);
    
    // Build context for MathValidation
    const mathContext: MathContext = {
      currentEquation,
      expectedAnswerType: 'number',
      stepNumber: turnNumber,
      previousSteps: previousSteps?.map(s => s.user_input).filter(Boolean) || []
    };

    let validationResult = null;
    let analysisResult = null;
    
    // Enhanced analysis for math answers using unified system
    const containsNumber = /\d/.test(message);
    const isMathAnswer = containsNumber && currentEquation && !message.toLowerCase().includes('nie rozumiem');
    
    if (isMathAnswer) {
      console.log('[StudyTutor] Validating math answer with unified analysis');
      try {
        // Math validation
        validationResult = await evaluateAnswer(
          message,
          currentEquation,
          mathContext
        );
        
        // Enhanced cognitive analysis
        analysisResult = analyzeStudentAnswer(
          message,
          validationResult?.normalizedAnswer || '',
          responseTime || 0,
          cognitiveProfile
        );
        
        // Calculate flow state indicators
        const recentSteps = previousSteps?.slice(-5) || [];
        const flowState = calculateFlowState(responseTime || 0, cognitiveProfile);
        
        // Update learner profile with cognitive insights
        await updateLearnerProfileWithCognition(supabaseClient, user.id, {
          flowState,
          cognitiveProfile,
          sessionAnalytics: {
            responseTime: responseTime || 0,
            isCorrect: analysisResult.isCorrect,
            pedagogicalStrategy: analysisResult.teachingMoment.pedagogicalStrategy,
            difficultyAdjustment: 0 // Will be calculated by adaptive system
          }
        });
        
        console.log('[StudyTutor] Enhanced analysis complete:', {
          mathValid: validationResult?.isCorrect,
          cognitivePattern: analysisResult.responsePattern,
          flowEngagement: flowState.engagementLevel,
          teachingMoment: analysisResult.teachingMoment.type
        });
        
      } catch (error) {
        console.error('[StudyTutor] Enhanced analysis error:', error);
        // Continue without enhanced analysis
      }
    }

    // Build enhanced pedagogical instructions using unified system
    let pedagogicalInstructions = '';
    if (analysisResult && validationResult) {
      // Use enhanced cognitive analysis results
      const flowState = calculateFlowState(responseTime || 0, cognitiveProfile);
      const zpd_alignment = calculateZPDAlignment(analysisResult.responsePattern, cognitiveProfile);
      const pedagogicalStrategy = selectPedagogicalStrategy(analysisResult.responsePattern, cognitiveProfile);
      const difficultyAdjustment = calculateDifficultyAdjustment(analysisResult.responsePattern, cognitiveProfile, flowState);
      
      pedagogicalInstructions = buildPedagogicalInstructions({
        mathValidation: validationResult,
        cognitiveAnalysis: analysisResult,
        flowState,
        cognitiveProfile,
        sessionContext: {
          turnNumber,
          targetDifficulty,
          isPseudoActivity,
          isFirstMessage,
          skillId,
          department: department || 'mathematics'
        },
        adaptiveRecommendations: {
          pedagogicalStrategy,
          difficultyAdjustment,
          zpd_alignment,
          shouldTakeBreak: shouldTakeMicroBreak(
            (responseTime || 0) / 1000 / 60, // convert to minutes
            cognitiveProfile,
            flowState
          )
        }
      });
    } else if (validationResult) {
      // Fallback to basic instructions when we have validation but no analysis
      pedagogicalInstructions = `
INSTRUKCJE_PEDAGOGICZNE dla aktualnego kroku:
- Odpowiedź ucznia: ${validationResult.isCorrect ? 'POPRAWNA' : 'NIEPOPRAWNA'}
- Pewność walidacji: ${(validationResult.confidence * 100).toFixed(0)}%
- Wykryte błędne rozumienie: ${validationResult.detectedMisconception || 'brak'}
- Feedback dla ucznia: ${validationResult.feedback || 'standardowy'}
- Trudność docelowa: ${targetDifficulty}
- Pseudo-aktywność: ${isPseudoActivity ? 'TAK - zwróć uwagę na to!' : 'nie'}

REAKCJA: ${validationResult.isCorrect ? 
  'Pochwal i przejdź do następnego kroku lub zwiększ trudność.' : 
  'Skoryguj błąd, wyjaśnij problem i daj kolejną szansę.'}
      `.trim();
    } else {
      // Basic fallback instructions when no validation available
      pedagogicalInstructions = `
INSTRUKCJE_PEDAGOGICZNE:
- Krok sesji: ${turnNumber}
- Trudność docelowa: ${targetDifficulty}
- To ${turnNumber === 1 ? 'PIERWSZE' : 'kolejne'} pytanie w sesji
- Pseudo-aktywność: ${isPseudoActivity ? 'TAK - zwróć uwagę na jakość odpowiedzi!' : 'nie'}
- Profil ucznia: ${cognitiveProfile.ageGroup || 'nieznany'} (${cognitiveProfile.cognitiveStyle || 'standardowy'})

WSKAZÓWKI:
${turnNumber === 1 ? 
  '- To pierwsza wiadomość - przedstaw zadanie i sprawdź zrozumienie' :
  '- Kontynuuj zgodnie z metodą I do → We do → You do'
}
- Dostosuj komunikację do poziomu ${skillContext.class_level || 'podstawowego'}
- Używaj metody sokratejskiej - pytaj zamiast od razu wyjaśniać
      `.trim();
    }

    // Layered context already handles message limits and pedagogical instructions

    // CRITICAL DEBUGGING: Log complete context being sent to AI
    console.log('[AI CONTEXT DEBUG] Complete message structure:');
    console.log(`[AI CONTEXT] Total messages: ${messages.length}`);
    
    messages.forEach((msg, index) => {
      const contentPreview = msg.content.substring(0, 200) + (msg.content.length > 200 ? '...' : '');
      console.log(`[AI CONTEXT ${index}] ${msg.role}: ${contentPreview}`);
    });
    
    console.log('[AI CONTEXT] Skill context summary:', {
      skillName: skillContext.skill_name,
      department: skillContext.department,
      phase: `${skillContext.current_phase} - ${skillContext.phase_name}`,
      targetDifficulty: skillContext.target_difficulty,
      stepNumber: skillContext.step_number,
      hasHistory: (previousSteps?.length || 0) > 0,
      historyLength: previousSteps?.length || 0,
      hasPedagogicalInstructions: !!pedagogicalInstructions,
      cognitiveProfile: cognitiveProfile.ageGroup || 'unknown'
    });

    // Call OpenAI API with GPT-5 parameters
    console.log('Calling OpenAI API with GPT-4o-mini...');
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
    
    // Enhanced token tracking
    const aiResponseUsage = usedFallback ? null : (await openAIResponse.json()).usage;
    const promptTokens = aiResponseUsage?.prompt_tokens || tokenStats.inputTokens;
    const completionTokens = aiResponseUsage?.completion_tokens || 0;
    const totalTokens = aiResponseUsage?.total_tokens || (promptTokens + completionTokens);

    // Log final token usage
    logTokenUsage(sessionId, promptTokens, completionTokens, tokenStats.windowPairs, tokenStats.compactLen);

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

    // Save lesson step with fallback tracking and full context
    const stepData = {
      session_id: sessionId,
      step_number: nextStepNumber,
      step_type: usedFallback ? 'fallback' : (stepType || 'question'),
      ai_prompt: JSON.stringify({
        system_context: skillContext,
        pedagogical_instructions: pedagogicalInstructions || 'basic',
        message_count: messages.length,
        has_history: (previousSteps?.length || 0) > 0
      }),
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
    
    // Enhanced assistant flags for event tracking
    const assistantFlags: any = {};
    
    if (stepType === 'hint') assistantFlags.hint = true;
    if (evaluation.pseudoActivity) assistantFlags.pseudo_fast = true;
    if (message.toLowerCase().includes('pokaż rozwiązanie')) assistantFlags.early_reveal = true;
    if (usedFallback) assistantFlags.fallback_used = true;
    if (tokenStats.minified) assistantFlags.budget_pressure = true;
    if (analysisResult?.teachingMoment?.type === 'diagnostic') assistantFlags.diagnostic = true;
    
    // Save interaction to learning_interactions with enhanced tracking
    const { error: interactionError } = await supabaseClient
      .from('learning_interactions')
      .insert({
        user_id: session.user_id,
        session_id: sessionId,
        interaction_type: 'user_answer',
        sequence_number: nextStepNumber,
        content_id: skillId,
        difficulty_level: targetDifficulty === 'hard' ? 7 : 5,
        response_time_ms: responseTime,
        correctness_level: isCorrect ? 1 : 0,
        confidence_level: evaluation.confidence || 0.5,
        // CRITICAL: Store actual conversation content for future history
        user_input: message,
        ai_response: aiMessage,
        // Enhanced token tracking
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        // Assistant flags for clean event tracking
        assistant_flags: assistantFlags
      });

    if (interactionError) {
      console.error('Error saving interaction:', interactionError);
    } else {
      // CRITICAL: Update skill progress after saving interaction
      await updateSkillProgress(supabaseClient, session.user_id, skillId, isCorrect, responseTime);
      
      // Trigger background cognitive analysis (non-blocking)
      EdgeRuntime.waitUntil(analyzeSessionInBackground(supabaseClient, sessionId, session.user_id));
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
      total_tokens_used: session.total_tokens_used + totalTokens,
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

    // Enhanced daily token tracking
    const today = new Date().toISOString().split('T')[0];
    const { error: dailyLimitError } = await supabaseClient
      .from('user_daily_limits')
      .upsert({
        user_id: session.user_id,
        date: today,
        tokens_used: totalTokens,
        sessions_count: 1
      }, {
        onConflict: 'user_id,date',
        ignoreDuplicates: false
      });

    if (dailyLimitError) {
      console.error('Error updating daily limits:', dailyLimitError);
    }

    // Enhanced response with token breakdown
    const responseData: any = {
      message: aiMessage,
      tokensUsed: totalTokens,
      tokenBreakdown: {
        prompt: promptTokens,
        completion: completionTokens,
        total: totalTokens
      },
      stepNumber: nextStepNumber,
      pseudoActivityDetected: evaluation.pseudoActivity || false,
      correctAnswer: isCorrect,
      hints: newHintsUsed,
      strikes: newStrikes,
      budgetStats: {
        inputTokens: tokenStats.inputTokens,
        windowPairs: tokenStats.windowPairs,
        compactLength: tokenStats.compactLen,
        minified: tokenStats.minified
      }
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

// Handler functions for different action types
async function handleGetProfile(supabaseClient: any, userId: string) {
  try {
    console.log('[Profile] Getting user profile for:', userId);
    
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('level, learner_profile')
      .eq('user_id', userId)
      .single();

    return new Response(JSON.stringify({
      profile: profile?.learner_profile || {},
      level: profile?.level || 1,
      current_energy_level: profile?.learner_profile?.current_energy_level || 0.75,
      confidence_level: profile?.learner_profile?.confidence_level || 0.65
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Profile] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to load profile' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleStartSession(supabaseClient: any, userId: string, sessionType: string, skillId: string) {
  try {
    console.log('[Session] Starting session for user:', userId, 'type:', sessionType, 'skill:', skillId);
    
    // Create new study session
    const { data: session, error: sessionError } = await supabaseClient
      .from('study_sessions')
      .insert({
        user_id: userId,
        skill_id: skillId,
        session_type: sessionType,
        status: 'in_progress'
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    return new Response(JSON.stringify({
      sessionId: session.id,
      message: `Started ${sessionType} session for ${skillId}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Session] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to start session' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleGenerateTask(supabaseClient: any, sessionId: string, skillId: string) {
  try {
    console.log('[Task] Generating task for session:', sessionId, 'skill:', skillId);
    
    // Get content from skill
    const skillContent = await contentManager.fetchSkillContent(supabaseClient, skillId);
    
    let task = null;
    if (skillContent?.practiceExercises?.length) {
      const exercise = skillContent.practiceExercises[Math.floor(Math.random() * skillContent.practiceExercises.length)];
      task = {
        id: `task_${Date.now()}`,
        problem: exercise.problem,
        expectedAnswer: exercise.answer,
        difficulty: exercise.difficulty || 5,
        estimatedTime: '5-10',
        hints: exercise.hints || []
      };
    } else {
      // Fallback task
      task = {
        id: `fallback_${Date.now()}`,
        problem: "Rozwiąż równanie: $2x + 3 = 11$",
        expectedAnswer: "4",
        difficulty: 3,
        estimatedTime: '3-5',
        hints: ["Przenieś 3 na prawą stronę", "Podziel obie strony przez 2"]
      };
    }

    return new Response(JSON.stringify({ task }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Task] Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate task' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleChatMessage(supabaseClient: any, userId: string, message: string, department: string) {
  try {
    console.log('[Chat] Processing chat message for user:', userId);
    
    // Create or get chat session
    let { data: session } = await supabaseClient
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('session_type', 'chat')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!session) {
      const { data: newSession } = await supabaseClient
        .from('study_sessions')
        .insert({
          user_id: userId,
          skill_id: await getDefaultSkill(supabaseClient), // Use actual skill ID
          session_type: 'chat',
          status: 'in_progress'
        })
        .select()
        .single();
      session = newSession;
    }

    // Get user profile for context
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('level, learner_profile')
      .eq('user_id', userId)
      .single();

    // Simple AI chat prompt
    const chatPrompt = `Jesteś pomocnym korepetytorem matematyki. Odpowiadaj po polsku, konkretnie i pomocnie. 
Poziom ucznia: ${profile?.level || 1}. 
Pytanie ucznia: ${message}`;

    // Call OpenAI for chat response
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: chatPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    let aiMessage = "Przepraszam, nie mogę odpowiedzieć w tej chwili. Spróbuj ponownie.";
    
    if (openAIResponse.ok) {
      const aiResponse = await openAIResponse.json();
      aiMessage = aiResponse.choices?.[0]?.message?.content || aiMessage;
    }

    // Save chat interaction
    const { error: interactionError } = await supabaseClient
      .from('learning_interactions')
      .insert({
        user_id: userId,
        session_id: session.id,
        interaction_type: 'chat_message',
        sequence_number: 1,
        response_time_ms: 0,
        confidence_level: 0.8
      });

    if (interactionError) {
      console.error('[Chat] Error saving interaction:', interactionError);
    }

    return new Response(JSON.stringify({ 
      message: aiMessage,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Chat] Error:', error);
    return new Response(JSON.stringify({ error: 'Chat failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

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

// BACKGROUND: Cognitive analysis function (silent AI call)
async function analyzeSessionInBackground(supabaseClient: any, sessionId: string, userId: string) {
  try {
    console.log(`[CognitiveAnalysis] Starting background analysis for session ${sessionId}`);
    
    // Get all interactions from this session
    const { data: interactions } = await supabaseClient
      .from('learning_interactions')
      .select('*')
      .eq('session_id', sessionId)
      .order('sequence_number', { ascending: true });
    
    if (!interactions || interactions.length < 3) return; // Need minimum data
    
    // Build analysis prompt for AI (SILENT - user won't see this)
    const analysisPrompt = buildCognitiveAnalysisPrompt(interactions);
    
    // Silent AI call for cognitive analysis
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: `Jesteś ekspertem od analizy kognitywnej ucznia. Analizuj dane sesji i zwróć strukturę JSON z dokładnymi wartościami dla tabel: learner_intelligence, emotional_learning_states, metacognitive_development, misconception_networks. ZWRÓĆ TYLKO VALID JSON bez dodatkowego tekstu.` 
          },
          { role: 'user', content: analysisPrompt }
        ],
        max_completion_tokens: 1500,
      }),
    });
    
    if (!response.ok) {
      console.error('[CognitiveAnalysis] AI request failed:', await response.text());
      return;
    }
    
    const aiResult = await response.json();
    const cognitiveData = JSON.parse(aiResult.choices[0].message.content);
    
    // Update all 4 advanced tables with AI analysis
    await updateAdvancedCognitiveTables(supabaseClient, userId, cognitiveData, interactions);
    
    console.log('[CognitiveAnalysis] Background analysis completed successfully');
  } catch (error) {
    console.error('[CognitiveAnalysis] Error in background analysis:', error);
  }
}

// Build comprehensive analysis prompt for AI
function buildCognitiveAnalysisPrompt(interactions: any[]): string {
  const responses = interactions.map(i => ({
    user_input: i.user_input,
    response_time_ms: i.response_time_ms,
    correctness_level: i.correctness_level,
    confidence_level: i.confidence_level,
    interaction_type: i.interaction_type,
    misconceptions_activated: i.misconceptions_activated,
    cognitive_strategies_used: i.cognitive_strategies_used
  }));
  
  return `
Przeanalizuj pełną sesję uczenia i zwróć JSON z kognitywnymi analizami:

DANE SESJI:
${JSON.stringify(responses, null, 2)}

ZWRÓĆ JSON W FORMACIE:
{
  "learner_intelligence": {
    "cognitive_load_capacity": number(3-9),
    "processing_speed_percentile": number(1-100),
    "working_memory_span": number(3-9), 
    "attention_span_minutes": number(5-45),
    "learning_velocity": {"math": number(0.1-2.0)},
    "emotional_state": {"baseline_arousal": number(0-1), "stress_threshold": number(0-1)},
    "metacognitive_skills": {"planning": number(1-5), "monitoring": number(1-5), "evaluating": number(1-5)}
  },
  "emotional_learning_states": [
    {
      "detected_emotion": "frustration|confidence|confusion|flow",
      "emotion_intensity": number(0-1),
      "emotion_duration_seconds": number,
      "regulation_strategies_needed": ["pause", "encouragement", "simplification"]
    }
  ],
  "metacognitive_development": {
    "planning_skills": {"goal_setting": number(1-5), "strategy_selection": number(1-5)},
    "monitoring_skills": {"progress_awareness": number(1-5), "difficulty_recognition": number(1-5)},
    "strategy_effectiveness": {"worked": ["strategy1"], "failed": ["strategy2"]}
  },
  "misconception_networks": [
    {
      "misconception_cluster_id": "string",
      "strength": number(0-1),
      "context_triggers": ["trigger1", "trigger2"],
      "connected_misconceptions": ["misc1", "misc2"]
    }
  ]
}`;
}

// Update all 4 advanced cognitive tables with AI analysis
async function updateAdvancedCognitiveTables(supabaseClient: any, userId: string, cognitiveData: any, interactions: any[]) {
  try {
    // 1. Update learner_intelligence
    if (cognitiveData.learner_intelligence) {
      await supabaseClient
        .from('learner_intelligence')
        .upsert({
          user_id: userId,
          ...cognitiveData.learner_intelligence,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
    
    // 2. Insert emotional_learning_states (multiple records)
    if (cognitiveData.emotional_learning_states?.length) {
      const emotionalRecords = cognitiveData.emotional_learning_states.map(emotion => ({
        user_id: userId,
        interaction_id: interactions[0]?.id, // Link to first interaction
        ...emotion,
        detected_at: new Date().toISOString()
      }));
      
      await supabaseClient
        .from('emotional_learning_states')
        .insert(emotionalRecords);
    }
    
    // 3. Update metacognitive_development  
    if (cognitiveData.metacognitive_development) {
      await supabaseClient
        .from('metacognitive_development')
        .upsert({
          user_id: userId,
          ...cognitiveData.metacognitive_development,
          last_assessed: new Date().toISOString()
        }, { onConflict: 'user_id' });
    }
    
    // 4. Insert misconception_networks (multiple records)
    if (cognitiveData.misconception_networks?.length) {
      const misconceptionRecords = cognitiveData.misconception_networks.map(misc => ({
        user_id: userId,
        ...misc,
        last_manifested: new Date().toISOString(),
        created_at: new Date().toISOString()
      }));
      
      await supabaseClient
        .from('misconception_networks')
        .insert(misconceptionRecords);
    }
    
    console.log('[CognitiveUpdate] All 4 advanced tables updated successfully');
  } catch (error) {
    console.error('[CognitiveUpdate] Error updating advanced tables:', error);
  }
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