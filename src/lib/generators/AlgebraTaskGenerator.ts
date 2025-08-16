import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class AlgebraTaskGenerator {
  private microSkills: string[] = [
    'linear_equations',
    'quadratic_equations',
    'system_of_equations'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'algebra',
      skillName: 'Algebra - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'linear_equations': {
        const a = rand ? rand.nextInt(2, 8) : Math.floor(Math.random() * 7) + 2;
        const b = rand ? rand.nextInt(1, 12) : Math.floor(Math.random() * 12) + 1;
        const x = rand ? rand.nextInt(1, 10) : Math.floor(Math.random() * 10) + 1;
        const rhs = a * x + b;
        task.latex = `Rozwiąż równanie: $${a}x + ${b} = ${rhs}$`;
        task.expectedAnswer = `${x}`;
        task.misconceptionMap[`${rhs - b}`] = {
          type: 'forgot_to_divide',
          feedback: 'Nie podzielono przez współczynnik przy x'
        };
        break;
      }
      case 'quadratic_equations': {
        const r1 = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const r2 = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const b = -(r1 + r2);
        const c = r1 * r2;
        task.latex = `Rozwiąż równanie: $x^2 ${b >= 0 ? '+' : ''}${b}x ${c >= 0 ? '+' : ''}${c} = 0$`;
        task.expectedAnswer = `${Math.min(r1, r2)}, ${Math.max(r1, r2)}`;
        break;
      }
      case 'system_of_equations': {
        const x = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const y = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const a1 = rand ? rand.nextInt(1, 3) : Math.floor(Math.random() * 3) + 1;
        const b1 = rand ? rand.nextInt(1, 3) : Math.floor(Math.random() * 3) + 1;
        const c1 = a1 * x + b1 * y;
        const a2 = rand ? rand.nextInt(1, 3) : Math.floor(Math.random() * 3) + 1;
        const b2 = rand ? rand.nextInt(1, 3) : Math.floor(Math.random() * 3) + 1;
        const c2 = a2 * x + b2 * y;
        task.latex = `Rozwiąż układ równań:\\n$${a1}x + ${b1}y = ${c1}$\\n$${a2}x + ${b2}y = ${c2}$`;
        task.expectedAnswer = `x=${x}, y=${y}`;
        break;
      }
    }
    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'forgot_to_divide': {
        const task: TaskDefinition = {
          id: 'alg_forgot_divide',
          department: 'algebra',
          skillName: 'Algebra - linear_equations',
          microSkill: 'linear_equations',
          difficulty: 3.0,
          latex: 'Rozwiąż równanie: $3x + 5 = 14$',
          expectedAnswer: '3',
          misconceptionMap: {
            '9': {
              type: 'forgot_to_divide',
              feedback: 'Nie podzielono przez współczynnik przy x (14-5=9, ale trzeba jeszcze podzielić przez 3)'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(3.0, 'linear_equations', rand);
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