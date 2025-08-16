// Enhanced Diagnostic Integration with Universal Task System
import { MathTaskGenerator } from '@/lib/generators/MathTaskGenerator';
import { UniversalAnswerValidator } from '@/lib/UniversalAnswerValidator';
import { getMisconceptionsByDepartment } from '@/lib/UniversalMisconceptionDB';
import { TaskDefinition } from '@/lib/UniversalInterfaces';

export class EnhancedDiagnosticController {
  private taskGenerator = new MathTaskGenerator();
  private validator = new UniversalAnswerValidator();

  public generateDiagnosticTask(
    department: string,
    difficulty: number,
    phase: 'fundamentals' | 'topics' | 'advanced'
  ): TaskDefinition {
    // Select appropriate microSkill based on phase
    const microSkills = this.taskGenerator.getMicroSkills(department);
    const microSkill = phase === 'fundamentals' 
      ? microSkills[0] 
      : microSkills[Math.floor(Math.random() * microSkills.length)];

    return this.taskGenerator.generateTask({
      department,
      difficulty,
      microSkill
    });
  }

  public generateMisconceptionTest(department: string): TaskDefinition[] {
    const misconceptions = getMisconceptionsByDepartment(department);
    const tasks: TaskDefinition[] = [];

    // Generate one task for each major misconception
    Object.keys(misconceptions).slice(0, 3).forEach(misconceptionType => {
      try {
        const task = this.taskGenerator.generateMisconceptionTask(department, misconceptionType);
        tasks.push(task);
      } catch (error) {
        console.warn(`Could not generate misconception task for ${misconceptionType}:`, error);
      }
    });

    return tasks;
  }

  public analyzeUserResponses(responses: Array<{
    task: TaskDefinition;
    userAnswer: string;
    responseTime: number;
  }>) {
    const analysis = {
      masteredSkills: [] as string[],
      struggledAreas: [] as string[],
      detectedMisconceptions: [] as string[],
      recommendedDifficulty: 3,
      nextFocus: '' as string
    };

    let correctCount = 0;
    let totalTime = 0;
    let avgConfidence = 0;

    responses.forEach(({ task, userAnswer, responseTime }) => {
      const validation = this.validator.validateAnswer(userAnswer, task);
      
      if (validation.isCorrect) {
        correctCount++;
        analysis.masteredSkills.push(task.microSkill);
      } else {
        analysis.struggledAreas.push(task.microSkill);
        if (validation.detectedMisconception) {
          analysis.detectedMisconceptions.push(validation.detectedMisconception);
        }
      }

      totalTime += responseTime;
      avgConfidence += validation.confidence;
    });

    const successRate = correctCount / responses.length;
    const avgResponseTime = totalTime / responses.length;
    avgConfidence = avgConfidence / responses.length;

    // Calculate recommended difficulty
    if (successRate > 0.8 && avgResponseTime < 30000) {
      analysis.recommendedDifficulty = 7;
    } else if (successRate > 0.6) {
      analysis.recommendedDifficulty = 5;
    } else if (successRate > 0.4) {
      analysis.recommendedDifficulty = 3;
    } else {
      analysis.recommendedDifficulty = 2;
    }

    // Determine next focus area
    if (analysis.detectedMisconceptions.length > 0) {
      analysis.nextFocus = analysis.detectedMisconceptions[0];
    } else if (analysis.struggledAreas.length > 0) {
      analysis.nextFocus = analysis.struggledAreas[0];
    } else {
      analysis.nextFocus = 'advanced_topics';
    }

    return analysis;
  }
}