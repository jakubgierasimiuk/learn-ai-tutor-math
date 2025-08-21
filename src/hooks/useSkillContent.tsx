import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SkillTheory {
  id: string;
  theory_text: string;
  key_formulas: any; // JSONB from database
  time_estimate: number;
  difficulty_level: number;
}

export interface SkillExample {
  id: string;
  example_code: string;
  problem_statement: string;
  solution_steps: any; // JSONB from database
  final_answer: string;
  explanation: string;
  time_estimate: number;
  difficulty_level: number;
}

export interface SkillExercise {
  id: string;
  exercise_code: string;
  problem_statement: string;
  expected_answer: string;
  difficulty_level: number;
  time_estimate: number;
  misconception_map: any; // JSONB from database
}

export interface SkillMisconception {
  id: string;
  pattern_code: string;
  description: string;
  example_error: string;
  intervention_strategy: string;
}

export interface SkillContent {
  theory: SkillTheory | null;
  examples: SkillExample[];
  exercises: SkillExercise[];
  misconceptions: SkillMisconception[];
  applications: Array<{
    id: string;
    context: string;
    problem_description: string;
    age_group: string;
    connection_explanation: string;
  }>;
}

export const useSkillContent = (skillId: string | null) => {
  const [content, setContent] = useState<SkillContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!skillId) {
      setContent(null);
      return;
    }

    const fetchSkillContent = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all content in parallel
        const [theoryRes, examplesRes, exercisesRes, misconceptionsRes, applicationsRes] = await Promise.all([
          supabase
            .from('skill_theory_content')
            .select('*')
            .eq('skill_id', skillId)
            .eq('is_active', true)
            .maybeSingle(),
          
          supabase
            .from('skill_examples')
            .select('*')
            .eq('skill_id', skillId)
            .eq('is_active', true)
            .order('difficulty_level', { ascending: true }),
          
          supabase
            .from('skill_practice_exercises')
            .select('*')
            .eq('skill_id', skillId)
            .eq('is_active', true)
            .order('difficulty_level', { ascending: true }),
          
          supabase
            .from('skill_misconception_patterns')
            .select('*')
            .eq('skill_id', skillId)
            .eq('is_active', true),
          
          supabase
            .from('skill_real_world_applications')
            .select('*')
            .eq('skill_id', skillId)
            .eq('is_active', true)
        ]);

        // Check for errors
        if (theoryRes.error) throw theoryRes.error;
        if (examplesRes.error) throw examplesRes.error;
        if (exercisesRes.error) throw exercisesRes.error;
        if (misconceptionsRes.error) throw misconceptionsRes.error;
        if (applicationsRes.error) throw applicationsRes.error;

        setContent({
          theory: theoryRes.data,
          examples: (examplesRes.data || []).map(ex => ({
            ...ex,
            solution_steps: Array.isArray(ex.solution_steps) ? ex.solution_steps : []
          })),
          exercises: (exercisesRes.data || []).map(ex => ({
            ...ex,
            misconception_map: Array.isArray(ex.misconception_map) ? ex.misconception_map : []
          })),
          misconceptions: misconceptionsRes.data || [],
          applications: applicationsRes.data || []
        });

      } catch (err) {
        console.error('Error fetching skill content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch skill content');
      } finally {
        setLoading(false);
      }
    };

    fetchSkillContent();
  }, [skillId]);

  return { content, loading, error };
};

// Helper hook to get exercises by difficulty
export const useSkillExercisesByDifficulty = (skillId: string | null, difficulty: number) => {
  const { content, loading, error } = useSkillContent(skillId);
  
  const exercises = content?.exercises.filter(ex => ex.difficulty_level === difficulty) || [];
  
  return { exercises, loading, error };
};

// Helper hook to get theory content
export const useSkillTheory = (skillId: string | null) => {
  const { content, loading, error } = useSkillContent(skillId);
  
  return { theory: content?.theory, loading, error };
};