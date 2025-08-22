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
        
        // Fetch all skills from unified content table
        const { data: unifiedContent, error: unifiedError } = await supabase
          .from('unified_skill_content')
          .select('skill_id, is_complete, metadata');

        if (unifiedError) throw unifiedError;

        // Fetch all skills metadata
        const { data: skills, error: skillsError } = await supabase
          .from('skills')
          .select('id, name, class_level, department')
          .eq('is_active', true);

        if (skillsError) throw skillsError;

        // Create lookup for unified content
        const unifiedLookup = new Map(unifiedContent.map(uc => [uc.skill_id, uc]));

        // Process skills to determine content status
        const processedSkills: SkillContent[] = skills.map(skill => {
          const unifiedData = unifiedLookup.get(skill.id);
          
          return {
            id: skill.id,
            name: skill.name,
            class_level: skill.class_level,
            department: skill.department,
            has_content: unifiedData?.is_complete || false
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