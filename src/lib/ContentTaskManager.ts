import { TaskDefinition } from './UniversalInterfaces';
import { supabase } from '@/integrations/supabase/client';

interface ContentTask {
  id: string;
  latex: string;
  expectedAnswer: string;
  difficulty: number;
  microSkill: string;
}

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

export class ContentTaskManager {
  private contentCache = new Map<string, SkillContent>();
  private isClient = typeof window !== 'undefined';

  async getInitialTasks(skillId: string): Promise<TaskDefinition[]> {
    try {
      const content = await this.fetchSkillContent(skillId);
      if (!content) return [];

      const tasks: TaskDefinition[] = [];

      // Convert practice exercises to TaskDefinitions
      if (content.practiceExercises) {
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

      // Convert solved examples to tasks (without giving away the solution)
      if (content.examples?.solved) {
        content.examples.solved.slice(0, 1).forEach((example, index) => {
          tasks.push({
            id: `example_${skillId}_${index}`,
            department: 'content_based',
            skillName: 'Example Task',
            microSkill: 'example',
            difficulty: example.difficulty || 3,
            latex: example.problem,
            expectedAnswer: '', // Keep solution hidden for now
            misconceptionMap: {}
          });
        });
      }

      return tasks;
    } catch (error) {
      console.error('Failed to get initial tasks from content:', error);
      return [];
    }
  }

  async getFallbackTask(skillId: string, targetDifficulty: number): Promise<TaskDefinition | null> {
    try {
      const content = await this.fetchSkillContent(skillId);
      if (!content?.practiceExercises) return null;

      // Find exercise matching difficulty
      const fallbackExercise = content.practiceExercises
        .filter(ex => Math.abs((ex.difficulty || 3) - targetDifficulty) <= 1)
        .shift();

      if (!fallbackExercise) return null;

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
      console.error('Failed to get fallback task:', error);
      return null;
    }
  }

  private async fetchSkillContent(skillId: string): Promise<SkillContent | null> {
    if (this.contentCache.has(skillId)) {
      return this.contentCache.get(skillId)!;
    }

    try {
      console.log(`Fetching content for skill: ${skillId}`);
      
      // For edge functions, we can't use the client directly, so return null
      if (!this.isClient) {
        console.log('Running in edge function context, returning null');
        return null;
      }

      // Fetch from Supabase skills table using new content_structure column
      const { data: skill, error } = await supabase
        .from('skills')
        .select('content_structure, content_data')
        .eq('id', skillId)
        .single();

      if (error) {
        console.error('Error fetching skill from Supabase:', error);
        return null;
      }

      // Use content_structure first, fallback to content_data
      const contentSource = skill?.content_structure || skill?.content_data;
      if (!contentSource) {
        console.log(`No content found for skill ${skillId}`);
        return {
          theory: { sections: [] },
          examples: { solved: [] },
          practiceExercises: []
        };
      }

      // Parse content as SkillContent with type checking
      const content = contentSource as unknown as SkillContent;
      this.contentCache.set(skillId, content);
      
      console.log(`Successfully fetched content for skill ${skillId}:`, {
        theorySections: content.theory?.sections?.length || 0,
        solvedExamples: content.examples?.solved?.length || 0,
        practiceExercises: content.practiceExercises?.length || 0
      });

      return content;
    } catch (error) {
      console.error('Error fetching skill content:', error);
      return null;
    }
  }

  async getContentForPhase(skillId: string, phase: number): Promise<{
    theory?: string[];
    examples?: string[];
    exercises?: TaskDefinition[];
  }> {
    const content = await this.fetchSkillContent(skillId);
    if (!content) return {};

    const result: any = {};

    // Extract theory for this phase
    if (content.theory?.sections) {
      result.theory = content.theory.sections
        .slice(0, phase)
        .map(section => `**${section.title}**\n${section.content}`);
    }

    // Extract examples for this phase
    if (content.examples?.solved) {
      result.examples = content.examples.solved
        .slice(0, phase)
        .map(ex => `**Problem:** ${ex.problem}\n**Solution:** ${ex.solution}`);
    }

    // Extract exercises for this phase
    if (content.practiceExercises) {
      const exercises = content.practiceExercises
        .filter(ex => (ex.difficulty || 3) <= phase + 2)
        .slice(0, phase * 2);
      
      result.exercises = exercises.map((ex, index) => ({
        id: `phase_${skillId}_${phase}_${index}`,
        department: 'content_based',
        skillName: 'Phase Task',
        microSkill: `phase_${phase}`,
        difficulty: ex.difficulty || 3,
        latex: ex.problem,
        expectedAnswer: ex.answer,
        misconceptionMap: {}
      }));
    }

    return result;
  }
}