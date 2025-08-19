import { MathTaskGenerator } from '@/lib/generators/MathTaskGenerator';
import { UniversalAnswerValidator } from '@/lib/UniversalAnswerValidator';
import { UniversalDifficultyController } from '@/lib/UniversalDifficultyController';
import { TaskDefinition, TaskGenerationParams } from '@/lib/UniversalInterfaces';
import { ContentTaskManager } from '@/lib/ContentTaskManager';
import { TaskDefinitionManager } from '@/lib/TaskDefinitionManager';

// Enhanced AI Chat integration with Universal Task System
export class EnhancedAIChatController {
  private taskGenerator = new MathTaskGenerator();
  private validator = new UniversalAnswerValidator();
  private contentManager = new ContentTaskManager();

  public async generateTaskForChat(params: {
    department: string;
    difficulty: number;
    userContext?: string;
    targetMisconception?: string;
    skillId?: string;
    useContentFirst?: boolean;
  }): Promise<TaskDefinition> {
    // Step 1: Try to use existing tasks from database first
    if (params.useContentFirst || params.skillId) {
      try {
        // Look for existing tasks matching criteria
        const existingTasks = await TaskDefinitionManager.findTasks({
          department: params.department,
          difficulty: params.difficulty,
          skillId: params.skillId,
          limit: 5
        });

        if (existingTasks.length > 0) {
          console.log('Using existing task from database');
          return existingTasks[0];
        }

        // Try content-based tasks if skill specified
        if (params.skillId) {
          const contentTasks = await this.contentManager.getInitialTasks(params.skillId);
          if (contentTasks.length > 0) {
            console.log('Using content task from database');
            // Store it for future use
            await TaskDefinitionManager.storeTask(contentTasks[0]);
            return contentTasks[0];
          }
        }
      } catch (error) {
        console.error('Database task fetch failed, falling back to generator:', error);
      }
    }

    // Step 2: Generate new task
    const taskParams: TaskGenerationParams = {
      department: params.department,
      difficulty: params.difficulty,
      targetMisconception: params.targetMisconception
    };

    const newTask = this.taskGenerator.generateTask(taskParams);
    
    // Store the generated task for future use
    try {
      await TaskDefinitionManager.storeTask(newTask);
    } catch (error) {
      console.error('Failed to store generated task:', error);
    }

    return newTask;
  }

  public validateUserAnswer(userAnswer: string, task: TaskDefinition) {
    return this.validator.validateAnswer(userAnswer, task);
  }

  public adaptDifficulty(
    currentLevel: number,
    isCorrect: boolean,
    responseTime: number,
    confidence: number
  ): number {
    return UniversalDifficultyController.getNextDifficulty(
      currentLevel,
      isCorrect,
      responseTime,
      confidence
    );
  }

  public getSupportedDepartments(): string[] {
    return this.taskGenerator.getSupportedDepartments();
  }

  public getMicroSkills(department: string): string[] {
    return this.taskGenerator.getMicroSkills(department);
  }

  public generateProgressiveTask(department: string, currentLevel: number): TaskDefinition {
    return this.taskGenerator.generateProgressiveTask(department, currentLevel);
  }

  public async generateMisconceptionTask(department: string, misconception: string): Promise<TaskDefinition> {
    return this.taskGenerator.generateMisconceptionTask(department, misconception);
  }

  public async getFallbackTask(skillId: string, targetDifficulty: number): Promise<TaskDefinition | null> {
    return this.contentManager.getFallbackTask(skillId, targetDifficulty);
  }

  public async getContentForPhase(skillId: string, phase: number) {
    return this.contentManager.getContentForPhase(skillId, phase);
  }
}