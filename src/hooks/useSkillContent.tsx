import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Unified skill content interfaces
export interface UnifiedSkillTheory {
  theory_text: string;
  key_formulas: any[];
  time_estimate: number;
  difficulty_level: number;
  created_at: string;
}

export interface UnifiedSkillExample {
  example_code: string;
  problem_statement: string;
  solution_steps: any;
  final_answer: string;
  explanation: string;
  difficulty_level: number;
  time_estimate: number;
}

export interface UnifiedSkillExercise {
  exercise_code: string;
  problem_statement: string;
  expected_answer: string;
  difficulty_level: number;
  time_estimate: number;
  misconception_map: any;
  hints: any[];
}

export interface UnifiedPedagogicalNotes {
  scaffolding_questions: any[];
  teaching_flow: any[];
  estimated_total_time: number;
  prerequisite_description: string;
  next_topic_description: string;
}

export interface UnifiedAssessmentRubric {
  mastery_threshold: number;
  skill_levels: any;
  total_questions: number;
  scope_description: string;
}

export interface UnifiedSkillPhase {
  phase_number: number;
  phase_name: string;
  phase_description: string;
  ai_instructions: string;
  success_criteria: any;
  estimated_duration_minutes: number;
}

export interface SkillContent {
  theory: UnifiedSkillTheory | null;
  examples: UnifiedSkillExample[];
  exercises: UnifiedSkillExercise[];
  pedagogical_notes: UnifiedPedagogicalNotes | null;
  assessment_rubric: UnifiedAssessmentRubric | null;
  phases: UnifiedSkillPhase[];
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

    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from unified skill content table
        const { data: unifiedContent, error: unifiedError } = await supabase
          .from('unified_skill_content')
          .select('content_data, metadata, is_complete')
          .eq('skill_id', skillId)
          .maybeSingle();

        if (unifiedError) throw unifiedError;

        if (!unifiedContent) {
          setContent({
            theory: null,
            examples: [],
            exercises: [],
            pedagogical_notes: null,
            assessment_rubric: null,
            phases: []
          });
          return;
        }

        const contentData = unifiedContent.content_data;
        
        setContent({
          theory: contentData.theory && Object.keys(contentData.theory).length > 0 ? contentData.theory : null,
          examples: contentData.examples || [],
          exercises: contentData.exercises || [],
          pedagogical_notes: contentData.pedagogical_notes && Object.keys(contentData.pedagogical_notes).length > 0 ? contentData.pedagogical_notes : null,
          assessment_rubric: contentData.assessment_rubric && Object.keys(contentData.assessment_rubric).length > 0 ? contentData.assessment_rubric : null,
          phases: contentData.phases || []
        });
      } catch (err) {
        console.error('Error fetching skill content:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch skill content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
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