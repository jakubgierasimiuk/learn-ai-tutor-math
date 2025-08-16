import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class FunctionsTaskGenerator {
  private microSkills: string[] = [
    'linear_functions',
    'quadratic_functions',
    'function_composition'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'functions',
      skillName: 'Functions - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'linear_functions': {
        const a = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const b = rand ? rand.nextInt(1, 8) : Math.floor(Math.random() * 8) + 1;
        task.latex = `Dana jest funkcja liniowa $f(x) = ${a}x + ${b}$. Jaki jest współczynnik kierunkowy tej funkcji?`;
        task.expectedAnswer = `${a}`;
        task.misconceptionMap[`${b}`] = {
          type: 'slope_intercept_confusion',
          feedback: 'Pomylono współczynnik kierunkowy z wyrazem wolnym'
        };
        break;
      }
      case 'quadratic_functions': {
        const a = rand ? rand.nextInt(1, 3) : Math.floor(Math.random() * 3) + 1;
        const h = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const k = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        task.latex = `Dana jest funkcja kwadratowa $f(x) = ${a}(x-${h})^2 + ${k}$. Podaj współrzędne wierzchołka paraboli.`;
        task.expectedAnswer = `(${h}, ${k})`;
        task.misconceptionMap[`(-${h}, ${k})`] = {
          type: 'vertex_sign_error',
          feedback: 'Błąd znaku przy współrzędnej x wierzchołka'
        };
        break;
      }
      case 'function_composition': {
        const a = rand ? rand.nextInt(2, 4) : Math.floor(Math.random() * 3) + 2;
        const b = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const x = rand ? rand.nextInt(1, 3) : Math.floor(Math.random() * 3) + 1;
        const fx = a * x + b;
        const result = a * fx + b;
        task.latex = `Dana jest funkcja $f(x) = ${a}x + ${b}$. Oblicz $f(f(${x}))$.`;
        task.expectedAnswer = `${result}`;
        task.misconceptionMap[`${fx}`] = {
          type: 'composition_confusion',
          feedback: 'Obliczono f(x) zamiast f(f(x))'
        };
        break;
      }
    }
    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'slope_intercept_confusion': {
        const task: TaskDefinition = {
          id: 'func_slope_confusion',
          department: 'functions',
          skillName: 'Functions - linear_functions',
          microSkill: 'linear_functions',
          difficulty: 2.0,
          latex: 'Dana jest funkcja liniowa $f(x) = 3x + 7$. Jaki jest współczynnik kierunkowy tej funkcji?',
          expectedAnswer: '3',
          misconceptionMap: {
            '7': {
              type: 'slope_intercept_confusion',
              feedback: 'Pomylono współczynnik kierunkowy z wyrazem wolnym'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(3.0, 'linear_functions', rand);
      }
    }
  }

  public generateProgressiveTask(currentLevel: number): TaskDefinition {
    const nextDifficulty = currentLevel + 1;
    return this.generateTask(nextDifficulty > 10 ? 10 : nextDifficulty);
  }

  public generateTaskWithSeed(seed: string, params: { difficulty: number; microSkill?: string; targetMisconception?: string }): TaskDefinition {
    const rand = new SeededRandom(seed);
    if (params.targetMisconception) {
      return this.generateMisconceptionTask(params.targetMisconception, rand);
    } else {
      return this.generateTask(params.difficulty, params.microSkill, rand);
    }
  }
}