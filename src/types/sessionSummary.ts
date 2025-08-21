export type Phase = 'wprowadzenie_podstaw' | 'utrwalanie' | 'matura' | 'diagnoza';

export interface Misconception {
  code: string;
  count: number;
}

export interface ProgressCounters {
  attempts: number;
  correct_streak: number;
  errors_total: number;
  hint_uses: number;
  early_reveal: number;
}

export interface SpacedRepetitionState {
  due_cards: number;
  review_ratio: number;
}

export interface AffectState {
  pace: 'fast' | 'normal' | 'slow';
  pseudo_activity_strikes: number;
}

export interface NextRecommendation {
  skill_uuid: string;
  rationale: string;
}

export interface SessionSummaryState {
  session_id: string;
  student_id: string;
  skill_focus: string[];
  phase: Phase;
  difficulty_pref: number;
  last_difficulty: number;
  progress: ProgressCounters;
  misconceptions: Misconception[];
  mastered: string[];
  struggled: string[];
  spaced_repetition: SpacedRepetitionState;
  affect: AffectState;
  last_window_digest: string;
  next_recommendation: NextRecommendation | null;
  updated_at: string;
}

export interface MessagePair {
  user?: string;
  assistant?: string;
  sequence: number;
  tokens_estimate?: number;
}