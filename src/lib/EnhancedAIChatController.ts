import { MathTaskGenerator } from '@/lib/generators/MathTaskGenerator';
import { UniversalAnswerValidator } from '@/lib/UniversalAnswerValidator';
import { UniversalDifficultyController } from '@/lib/UniversalDifficultyController';
import { TaskDefinition, TaskGenerationParams } from '@/lib/UniversalInterfaces';

// Enhanced AI Chat integration with Universal Task System
export class EnhancedAIChatController {
  private taskGenerator = new MathTaskGenerator();
  private validator = new UniversalAnswerValidator();

  public generateTaskForChat(params: {
    department: string;
    difficulty: number;
    userContext?: string;
    targetMisconception?: string;
  }): TaskDefinition {
    const taskParams: TaskGenerationParams = {
      department: params.department,
      difficulty: params.difficulty,
      targetMisconception: params.targetMisconception
    };

    return this.taskGenerator.generateTask(taskParams);
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

  public generateMisconceptionTask(department: string, misconception: string): TaskDefinition {
    return this.taskGenerator.generateMisconceptionTask(department, misconception);
  }
}