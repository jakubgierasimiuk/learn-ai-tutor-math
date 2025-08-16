import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class CalculusTaskGenerator {
  private microSkills: string[] = [
    'derivatives',
    'integrals',
    'applications'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'calculus',
      skillName: 'Calculus - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'derivatives': {
        task.latex = 'Dana jest funkcja $f(x) = 2x^3 + 7$. Wyznacz $f\'(x)$.';
        task.expectedAnswer = '6x^2';
        task.misconceptionMap['6x^3'] = {
          type: 'incorrect_power_rule',
          feedback: 'Niepoprawne użycie reguły potęgowej przy różniczkowaniu ($d/dx(2x^3)$ policzono jako $6x^3$)'
        };
        task.misconceptionMap['6x^2+7'] = {
          type: 'constant_term_included',
          feedback: 'Błędnie dodano stałą 7 do pochodnej (pochodna stałej jest 0)'
        };
        break;
      }
      case 'integrals': {
        task.latex = '$\\int 3x^2 \\, dx$';
        task.expectedAnswer = 'x^3 + C';
        task.misconceptionMap['x^3'] = {
          type: 'no_constant',
          feedback: 'Zapomniano o stałej C przy całkowaniu'
        };
        task.misconceptionMap['3x^3 + C'] = {
          type: 'integral_no_division',
          feedback: 'Nie podzielono przez 3 przy całkowaniu (wynik 3x^3 + C zamiast x^3 + C)'
        };
        break;
      }
      case 'applications': {
        task.latex = 'Dana jest funkcja $f(x) = (x-1)^2 + 2$. Znajdź $x$, dla którego funkcja osiąga minimum.';
        task.expectedAnswer = '1';
        task.misconceptionMap['2'] = {
          type: 'value_vs_arg_confusion',
          feedback: 'Podano minimalną wartość funkcji zamiast argumentu (x), dla którego jest ona osiągana'
        };
        break;
      }
    }
    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'no_constant': {
        const task: TaskDefinition = {
          id: 'calc_no_C',
          department: 'calculus',
          skillName: 'Calculus - integrals',
          microSkill: 'integrals',
          difficulty: 3.0,
          latex: '$\\int 5x \\, dx$',
          expectedAnswer: '2.5x^2 + C',
          misconceptionMap: {
            '2.5x^2': {
              type: 'no_constant',
              feedback: 'Zapomniano o stałej C przy całkowaniu'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(4.0, 'derivatives', rand);
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