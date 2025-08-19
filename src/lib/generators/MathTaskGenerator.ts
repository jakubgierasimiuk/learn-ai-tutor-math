import { TaskDefinition, TaskGenerationParams, SeededRandom } from '../UniversalInterfaces';

export class MathTaskGenerator {
  
  public generateTask(params: TaskGenerationParams): TaskDefinition {
    const { department, difficulty, microSkill } = params;
    
    // Generate a simple math task based on department and difficulty
    return this.generateBasicTask(department, difficulty, microSkill);
  }

  public generateTaskWithSeed(seed: string, params: TaskGenerationParams): TaskDefinition {
    const { department, difficulty, microSkill } = params;
    
    // Generate task with seed for reproducibility
    return this.generateBasicTask(department, difficulty, microSkill, seed);
  }

  private generateBasicTask(department: string, difficulty: number, microSkill?: string, seed?: string): TaskDefinition {
    const taskId = seed || `task_${Date.now()}_${Math.random()}`;
    
    // Simple task generation based on department
    switch (department.toLowerCase()) {
      case 'mathematics':
      case 'algebra':
        return this.generateAlgebraTask(difficulty, microSkill, taskId);
      case 'geometry':
        return this.generateGeometryTask(difficulty, microSkill, taskId);
      default:
        return this.generateAlgebraTask(difficulty, microSkill, taskId);
    }
  }

  private generateAlgebraTask(difficulty: number, microSkill?: string, taskId?: string): TaskDefinition {
    const tasks = [
      {
        id: taskId || `algebra_${Date.now()}`,
        department: 'mathematics',
        skillName: 'Linear Equations',
        microSkill: microSkill || 'linear_equations',
        difficulty: difficulty,
        latex: `${difficulty}x + ${difficulty * 2} = ${difficulty * 5}`,
        expectedAnswer: Math.round(difficulty * 3 / difficulty).toString(),
        misconceptionMap: {
          "wrong": {
            type: "calculation_error",
            feedback: "Sprawdź swoje obliczenia krok po kroku"
          }
        }
      }
    ];
    
    return tasks[0];
  }

  private generateGeometryTask(difficulty: number, microSkill?: string, taskId?: string): TaskDefinition {
    return {
      id: taskId || `geometry_${Date.now()}`,
      department: 'geometry',
      skillName: 'Area Calculation',
      microSkill: microSkill || 'area_calculation',
      difficulty: difficulty,
      latex: `\\text{Pole prostokąta } ${difficulty * 2} \\times ${difficulty * 3}`,
      expectedAnswer: (difficulty * 2 * difficulty * 3).toString(),
      misconceptionMap: {
        "wrong": {
          type: "formula_error",
          feedback: "Pamiętaj: pole prostokąta = długość × szerokość"
        }
      }
    };
  }

  public generateMisconceptionTask(targetMisconception: string): TaskDefinition {
    // Generate task targeting specific misconception
    return {
      id: `misconception_${Date.now()}`,
      department: 'mathematics',
      skillName: 'Misconception Correction',
      microSkill: 'misconception_correction',
      difficulty: 3,
      latex: `\\text{Zadanie sprawdzające: } ${targetMisconception}`,
      expectedAnswer: 'varies',
      misconceptionMap: {
        [targetMisconception]: {
          type: 'target_misconception',
          feedback: 'To jest typowy błąd. Spróbuj ponownie.'
        }
      }
    };
  }

  public validateTaskGeneration(params: TaskGenerationParams): boolean {
    // Basic validation
    if (!params.department || params.difficulty < 1 || params.difficulty > 10) {
      return false;
    }
    return true;
  }

  public getSupportedDepartments(): string[] {
    return ['mathematics', 'algebra', 'geometry'];
  }

  public getSupportedSkills(department: string): string[] {
    switch (department.toLowerCase()) {
      case 'mathematics':
      case 'algebra':
        return ['linear_equations', 'quadratic_equations', 'polynomials'];
      case 'geometry':
        return ['area_calculation', 'volume_calculation', 'trigonometry'];
      default:
        return ['linear_equations'];
    }
  }
}