import { MathTaskGenerator } from './generators/MathTaskGenerator';
import { UniversalAnswerValidator } from './UniversalAnswerValidator';
import { UniversalDifficultyController } from './UniversalDifficultyController';
import { ContentTaskManager } from './ContentTaskManager';
import { TaskDefinition } from './UniversalInterfaces';
import { unifiedValidation } from './UnifiedValidationSystem';
import { SmartLearningOrchestrator } from './SmartLearningOrchestrator';
import { UnifiedLearningController } from './UnifiedLearningController';

/**
 * Enhanced AI Chat Controller - Unified task generation and validation
 */
export class EnhancedAIChatController {
  private static taskGenerator = new MathTaskGenerator();
  private static validator = new UniversalAnswerValidator();
  private static contentManager = new ContentTaskManager();
  private static orchestrator = new SmartLearningOrchestrator();

  /**
   * Generate task using SmartLearningOrchestrator for consistent decision-making
   */
  public static async generateTaskForChat(params: {
    department: string;
    difficulty: number;
    userContext?: string;
    targetMisconception?: string;
    skillId?: string;
    useContentFirst?: boolean;
    userId?: string;
    sessionType?: 'ai_chat' | 'study_learn' | 'diagnostic';
  }): Promise<TaskDefinition> {
    try {
      // Use SmartLearningOrchestrator for intelligent task selection
      if (params.userId) {
        const adaptationDecision = await this.orchestrator.orchestrateLearning({
          userId: params.userId,
          currentSkill: params.skillId,
          sessionType: params.sessionType || 'ai_chat',
          userResponse: '', // No response yet for initial task
          isCorrect: undefined,
          responseTime: 0,
          confidence: 0.5,
          hintsUsed: 0,
          department: params.department
        });

        if (adaptationDecision.nextTask) {
          return adaptationDecision.nextTask;
        }
      }

      // Fallback to content-first approach if requested
      if (params.useContentFirst && params.skillId) {
        const contentTasks = await this.contentManager.getInitialTasks(params.skillId, params.difficulty);
        if (contentTasks.length > 0) {
          return contentTasks[0];
        }
      }

      // Generate task using task generator
      if (params.targetMisconception) {
        return this.taskGenerator.generateMisconceptionTask(params.department, params.targetMisconception);
      }

      // Standard task generation
      return this.taskGenerator.generateTask({
        department: params.department,
        difficulty: params.difficulty,
        microSkill: 'default'
      });
    } catch (error) {
      console.error('Error generating task for chat:', error);
      // Fallback task
      return this.taskGenerator.generateTask({
        department: params.department,
        difficulty: Math.max(1, Math.min(10, params.difficulty)),
        microSkill: 'default'
      });
    }
  }

  /**
   * Validate answer using UnifiedValidationSystem
   */
  public static async validateUserAnswer(
    userAnswer: string, 
    task: TaskDefinition,
    context?: {
      userId?: string;
      sessionType?: 'ai_chat' | 'study_learn' | 'diagnostic';
      responseTime?: number;
      hints_used?: number;
      sessionId?: string;
    }
  ) {
    return await unifiedValidation.validateAnswer(userAnswer, task, {
      userId: context?.userId,
      sessionType: context?.sessionType || 'ai_chat',
      responseTime: context?.responseTime,
      hints_used: context?.hints_used,
      sessionId: context?.sessionId
    });
  }

  /**
   * Adapt difficulty using SmartLearningOrchestrator
   */
  public static async adaptDifficulty(
    userId: string,
    currentLevel: number, 
    isCorrect: boolean, 
    responseTime: number, 
    confidence: number,
    skillId?: string
  ): Promise<number> {
    try {
      const decision = await this.orchestrator.orchestrateLearning({
        userId,
        currentSkill: skillId,
        sessionType: 'ai_chat',
        userResponse: '',
        isCorrect,
        responseTime,
        confidence,
        hintsUsed: 0,
        department: 'mathematics'
      });

      return decision.newDifficulty;
    } catch (error) {
      console.error('Error adapting difficulty:', error);
      return UniversalDifficultyController.getNextDifficulty(
        currentLevel,
        isCorrect,
        responseTime,
        confidence
      );
    }
  }

  public static getSupportedDepartments(): string[] {
    return this.taskGenerator.getSupportedDepartments();
  }

  public static getMicroSkills(department: string): string[] {
    return this.taskGenerator.getMicroSkills(department);
  }

  public static generateProgressiveTask(department: string, currentLevel: number): TaskDefinition {
    return this.taskGenerator.generateProgressiveTask(department, currentLevel);
  }

  public static async generateMisconceptionTask(department: string, misconception: string): Promise<TaskDefinition> {
    return this.taskGenerator.generateMisconceptionTask(department, misconception);
  }

  public static async getFallbackTask(skillId: string, targetDifficulty: number): Promise<TaskDefinition | null> {
    return await this.contentManager.getFallbackTask(skillId, targetDifficulty);
  }

  public static async getContentForPhase(skillId: string, phase: number) {
    return await this.contentManager.getContentForPhase(skillId, phase);
  }
}