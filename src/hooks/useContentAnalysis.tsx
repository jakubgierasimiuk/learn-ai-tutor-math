import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SkillContent {
  id: string;
  name: string;
  class_level: number;
  department: string;
  has_content: boolean;
}

interface ContentStats {
  total: number;
  withContent: number;
  missingContent: number;
  critical: SkillContent[];
  highPriority: SkillContent[];
  remaining: SkillContent[];
}

export const useContentAnalysis = () => {
  const [stats, setStats] = useState<ContentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContentAnalysis = async () => {
      try {
        setLoading(true);
        
        // Fetch all skills
        const { data: skills, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, class_level, department')
          .eq('is_active', true);

        if (skillsError) throw skillsError;

        // Fetch content from separate tables
        const [theoryData, examplesData, exercisesData] = await Promise.all([
          supabase.from('skill_theory_content').select('skill_id').then(res => res.data || []),
          supabase.from('skill_examples').select('skill_id').then(res => res.data || []),
          supabase.from('skill_practice_exercises').select('skill_id').then(res => res.data || [])
        ]);

        // Create sets for faster lookup
        const skillsWithTheory = new Set(theoryData.map(t => t.skill_id));
        const skillsWithExamples = new Set(examplesData.map(e => e.skill_id));
        const skillsWithExercises = new Set(exercisesData.map(e => e.skill_id));

        // Process skills to determine REAL content status
        const processedSkills: SkillContent[] = skills.map(skill => {
          const hasTheory = skillsWithTheory.has(skill.id);
          const hasExamples = skillsWithExamples.has(skill.id);
          const hasPractice = skillsWithExercises.has(skill.id);

          return {
            id: skill.id,
            name: skill.name,
            class_level: skill.class_level,
            department: skill.department,
            has_content: hasTheory || hasExamples || hasPractice
          };
        });

        // Filter skills missing content
        const missingContent = processedSkills.filter(skill => !skill.has_content);

        // Categorize missing content by priority
        const critical = missingContent.filter(skill => 
          skill.class_level <= 3 && 
          ['analiza_matematyczna', 'geometria', 'algebra'].includes(skill.department)
        );

        const highPriority = missingContent.filter(skill => 
          skill.class_level >= 4 && skill.class_level <= 6 &&
          !critical.some(c => c.id === skill.id)
        );

        const remaining = missingContent.filter(skill => 
          !critical.some(c => c.id === skill.id) && 
          !highPriority.some(h => h.id === skill.id)
        );

        setStats({
          total: processedSkills.length,
          withContent: processedSkills.filter(s => s.has_content).length,
          missingContent: missingContent.length,
          critical,
          highPriority,
          remaining
        });

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchContentAnalysis();
  }, []);

  return { stats, loading, error };
};