import { TaskDefinition } from './UniversalInterfaces';
import { supabase } from '@/integrations/supabase/client';

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Unified Task Definition Manager - handles task storage and retrieval
 */
export class TaskDefinitionManager {
  private static taskCache = new Map<string, TaskDefinition>();

  /**
   * Store task definition in database
   */
  public static async storeTask(task: TaskDefinition): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_definitions')
        .insert({
          id: task.id,
          skill_id: null, // Will be set if linked to specific skill
          department: task.department,
          skill_name: task.skillName,
          micro_skill: task.microSkill,
          difficulty: task.difficulty,
          latex_content: task.latex,
          expected_answer: task.expectedAnswer,
          misconception_map: task.misconceptionMap,
          source_type: 'generator'
        });

      if (error) {
        console.error('Error storing task:', error);
        return false;
      }

      // Cache the task
      this.taskCache.set(task.id, task);
      return true;
    } catch (error) {
      console.error('Error in storeTask:', error);
      return false;
    }
  }

  /**
   * Retrieve task by ID
   */
  public static async getTask(taskId: string): Promise<TaskDefinition | null> {
    // Check cache first
    if (this.taskCache.has(taskId)) {
      return this.taskCache.get(taskId)!;
    }

    try {
      const { data: task, error } = await supabase
        .from('task_definitions')
        .select('*')
        .eq('id', taskId)
        .eq('is_active', true)
        .single();

      if (error || !task) {
        console.error('Error fetching task:', error);
        return null;
      }

      // Convert to TaskDefinition format
      const taskDefinition: TaskDefinition = {
        id: task.id,
        department: task.department,
        skillName: task.skill_name,
        microSkill: task.micro_skill,
        difficulty: task.difficulty,
        latex: task.latex_content,
        expectedAnswer: task.expected_answer,
        misconceptionMap: this.parseJsonSafely(task.misconception_map) || {}
      };

      // Cache it
      this.taskCache.set(taskId, taskDefinition);
      return taskDefinition;
    } catch (error) {
      console.error('Error in getTask:', error);
      return null;
    }
  }

  /**
   * Find tasks by criteria
   */
  public static async findTasks(criteria: {
    department?: string;
    difficulty?: number;
    microSkill?: string;
    skillId?: string;
    limit?: number;
  }): Promise<TaskDefinition[]> {
    try {
      let query = supabase
        .from('task_definitions')
        .select('*')
        .eq('is_active', true);

      if (criteria.department) {
        query = query.eq('department', criteria.department);
      }
      if (criteria.difficulty) {
        query = query.eq('difficulty', criteria.difficulty);
      }
      if (criteria.microSkill) {
        query = query.eq('micro_skill', criteria.microSkill);
      }
      if (criteria.skillId) {
        query = query.eq('skill_id', criteria.skillId);
      }

      query = query.limit(criteria.limit || 10);

      const { data: tasks, error } = await query;

      if (error) {
        console.error('Error finding tasks:', error);
        return [];
      }

      return (tasks || []).map(task => ({
        id: task.id,
        department: task.department,
        skillName: task.skill_name,
        microSkill: task.micro_skill,
        difficulty: task.difficulty,
        latex: task.latex_content,
        expectedAnswer: task.expected_answer,
        misconceptionMap: this.parseJsonSafely(task.misconception_map) || {}
      }));
    } catch (error) {
      console.error('Error in findTasks:', error);
      return [];
    }
  }

  /**
   * Update task definition
   */
  public static async updateTask(taskId: string, updates: Partial<TaskDefinition>): Promise<boolean> {
    try {
      const updateData: any = {};
      
      if (updates.department) updateData.department = updates.department;
      if (updates.skillName) updateData.skill_name = updates.skillName;
      if (updates.microSkill) updateData.micro_skill = updates.microSkill;
      if (updates.difficulty !== undefined) updateData.difficulty = updates.difficulty;
      if (updates.latex) updateData.latex_content = updates.latex;
      if (updates.expectedAnswer) updateData.expected_answer = updates.expectedAnswer;
      if (updates.misconceptionMap) updateData.misconception_map = updates.misconceptionMap;

      const { error } = await supabase
        .from('task_definitions')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        return false;
      }

      // Clear from cache to force refresh
      this.taskCache.delete(taskId);
      return true;
    } catch (error) {
      console.error('Error in updateTask:', error);
      return false;
    }
  }

  /**
   * Deactivate task (soft delete)
   */
  public static async deactivateTask(taskId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('task_definitions')
        .update({ is_active: false })
        .eq('id', taskId);

      if (error) {
        console.error('Error deactivating task:', error);
        return false;
      }

      this.taskCache.delete(taskId);
      return true;
    } catch (error) {
      console.error('Error in deactivateTask:', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  public static clearCache(): void {
    this.taskCache.clear();
  }

  /**
   * Parse JSON safely with proper typing
   */
  private static parseJsonSafely(json: Json): { [incorrectAnswer: string]: { type: string; feedback: string; } } {
    if (!json || typeof json !== 'object' || Array.isArray(json)) {
      return {};
    }
    return json as { [incorrectAnswer: string]: { type: string; feedback: string; } };
  }

  /**
   * Get cache statistics
   */
  public static getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.taskCache.size,
      keys: Array.from(this.taskCache.keys())
    };
  }
}