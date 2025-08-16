import { TaskDefinition, TaskGenerationParams } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';
import { AlgebraTaskGenerator } from './AlgebraTaskGenerator';
import { GeometryTaskGenerator } from './GeometryTaskGenerator';
import { TrigonometryTaskGenerator } from './TrigonometryTaskGenerator';
import { SequencesTaskGenerator } from './SequencesTaskGenerator';
import { StatisticsTaskGenerator } from './StatisticsTaskGenerator';
import { CalculusTaskGenerator } from './CalculusTaskGenerator';
import { FunctionsTaskGenerator } from './FunctionsTaskGenerator';
import { RealNumbersTaskGenerator } from './RealNumbersTaskGenerator';
import { AlgebraicExpressionsTaskGenerator } from './AlgebraicExpressionsTaskGenerator';

export class MathTaskGenerator {
  private algebraGen = new AlgebraTaskGenerator();
  private geometryGen = new GeometryTaskGenerator();
  private trigonometryGen = new TrigonometryTaskGenerator();
  private sequencesGen = new SequencesTaskGenerator();
  private statisticsGen = new StatisticsTaskGenerator();
  private calculusGen = new CalculusTaskGenerator();
  private functionsGen = new FunctionsTaskGenerator();
  private realNumbersGen = new RealNumbersTaskGenerator();
  private algebraicExpressionsGen = new AlgebraicExpressionsTaskGenerator();

  public generateTask(params: TaskGenerationParams): TaskDefinition {
    const { department, difficulty, microSkill, targetMisconception } = params;
    
    const generator = this.getGenerator(department);
    if (!generator) {
      throw new Error(`Unknown department: ${department}`);
    }

    if (targetMisconception) {
      return generator.generateMisconceptionTask(targetMisconception);
    } else {
      return generator.generateTask(difficulty, microSkill);
    }
  }

  public generateTaskWithSeed(seed: string, params: TaskGenerationParams): TaskDefinition {
    const rand = new SeededRandom(seed);
    const { department, difficulty, microSkill, targetMisconception } = params;
    
    const generator = this.getGenerator(department);
    if (!generator) {
      throw new Error(`Unknown department: ${department}`);
    }

    return generator.generateTaskWithSeed(seed, { difficulty, microSkill, targetMisconception });
  }

  public generateProgressiveTask(department: string, currentLevel: number): TaskDefinition {
    const generator = this.getGenerator(department);
    if (!generator) {
      throw new Error(`Unknown department: ${department}`);
    }

    return generator.generateProgressiveTask(currentLevel);
  }

  public generateMisconceptionTask(department: string, targetMisconception: string): TaskDefinition {
    const generator = this.getGenerator(department);
    if (!generator) {
      throw new Error(`Unknown department: ${department}`);
    }

    return generator.generateMisconceptionTask(targetMisconception);
  }

  private getGenerator(department: string) {
    switch (department) {
      case 'algebra': return this.algebraGen;
      case 'geometry': return this.geometryGen;
      case 'trigonometry': return this.trigonometryGen;
      case 'sequences': return this.sequencesGen;
      case 'statistics': return this.statisticsGen;
      case 'calculus': return this.calculusGen;
      case 'functions': return this.functionsGen;
      case 'real_numbers': return this.realNumbersGen;
      case 'algebraic_expressions': return this.algebraicExpressionsGen;
      default: return null;
    }
  }

  public getSupportedDepartments(): string[] {
    return ['algebra', 'geometry', 'trigonometry', 'sequences', 'statistics', 'calculus', 'functions', 'real_numbers', 'algebraic_expressions'];
  }

  public getMicroSkills(department: string): string[] {
    const generator = this.getGenerator(department);
    if (!generator) return [];
    
    // Return microSkills for each department
    switch (department) {
      case 'algebra': return ['linear_equations', 'quadratic_equations', 'system_of_equations'];
      case 'geometry': return ['area_calculation', 'pythagorean_theorem', 'circle_measurements'];
      case 'trigonometry': return ['basic_trig', 'triangle_solving', 'unit_circle'];
      case 'sequences': return ['arithmetic_sequence', 'arithmetic_sequence_sum', 'geometric_sequence'];
      case 'statistics': return ['probability', 'descriptive', 'combinatorics'];
      case 'calculus': return ['derivatives', 'integrals', 'applications'];
      case 'functions': return ['linear_functions', 'quadratic_functions', 'function_composition'];
      case 'real_numbers': return [
        'real_numbers_basic_operations', 'real_numbers_decimal_operations', 'real_numbers_fraction_operations',
        'real_numbers_percentage_calculations', 'real_numbers_rounding', 'real_numbers_comparison',
        'real_numbers_scientific_notation', 'real_numbers_word_problems'
      ];
      case 'algebraic_expressions': return [
        'algebra_short_multiplication_formulas', 'algebra_polynomial_addition', 'algebra_polynomial_multiplication',
        'algebra_factoring_polynomials', 'algebra_rational_simplification', 'algebra_rational_addition_subtraction',
        'algebra_rational_multiplication_division'
      ];
      default: return [];
    }
  }
}