import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class TrigonometryTaskGenerator {
  private microSkills: string[] = [
    'basic_trig',
    'triangle_solving',
    'unit_circle'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'trigonometry',
      skillName: 'Trigonometry - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'basic_trig': {
        const angleOptions = [30, 60];
        const angle = angleOptions[rand ? rand.nextInt(0, angleOptions.length - 1) : Math.floor(Math.random() * angleOptions.length)];
        const useSin = rand ? (rand.nextInt(0, 1) === 0) : Math.random() < 0.5;
        if (useSin) {
          task.latex = `Oblicz wartość $\\sin ${angle}^{\\circ}$.`;
          if (angle === 30) {
            task.expectedAnswer = '1/2';
            task.misconceptionMap['√3/2'] = {
              type: 'sine_cosine_confusion',
              feedback: 'Pomyliłeś sinus z cosinusem dla kąta 30°'
            };
          } else {
            task.expectedAnswer = '√3/2';
            task.misconceptionMap['1/2'] = {
              type: 'sine_cosine_confusion',
              feedback: 'Pomyliłeś sinus z cosinusem dla kąta 60°'
            };
          }
        } else {
          task.latex = `Oblicz wartość $\\cos ${angle}^{\\circ}$.`;
          if (angle === 30) {
            task.expectedAnswer = '√3/2';
            task.misconceptionMap['1/2'] = {
              type: 'sine_cosine_confusion',
              feedback: 'Pomyliłeś cosinus z sinusem dla kąta 30°'
            };
          } else {
            task.expectedAnswer = '1/2';
            task.misconceptionMap['√3/2'] = {
              type: 'sine_cosine_confusion',
              feedback: 'Pomyliłeś cosinus z sinusem dla kąta 60°'
            };
          }
        }
        break;
      }
      case 'triangle_solving': {
        const angle = difficulty < 7 ? 30 : 60;
        const hyp = 10;
        task.latex = `W trójkącie prostokątnym przeciwprostokątna ma długość $${hyp}$, a jeden z kątów ostrych ma miarę $${angle}^{\\circ}$. Oblicz długość przeciwległego boku.`;
        if (angle === 30) {
          task.expectedAnswer = '5';
          task.misconceptionMap['8.66'] = {
            type: 'trig_ratio_confusion',
            feedback: 'Użyto cosinusa zamiast sinusa dla kąta 30°'
          };
        } else {
          task.expectedAnswer = '8.66';
          task.misconceptionMap['5'] = {
            type: 'trig_ratio_confusion',
            feedback: 'Użyto cosinusa zamiast sinusa dla kąta 60°'
          };
        }
        break;
      }
      case 'unit_circle': {
        const angle = 210;
        task.latex = `Oblicz $\\sin ${angle}^{\\circ}$.`;
        task.expectedAnswer = '-1/2';
        task.misconceptionMap['1/2'] = {
          type: 'sign_quadrant_error',
          feedback: 'Znak wyniku jest niepoprawny (sin 210° jest ujemny)'
        };
        break;
      }
    }
    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'sine_cosine_confusion': {
        const task: TaskDefinition = {
          id: 'tri_sin_cos_confusion',
          department: 'trigonometry',
          skillName: 'Trigonometry - basic_trig',
          microSkill: 'basic_trig',
          difficulty: 1.0,
          latex: 'Oblicz wartość $\\sin 30^{\\circ}$.',
          expectedAnswer: '1/2',
          misconceptionMap: {
            '√3/2': {
              type: 'sine_cosine_confusion',
              feedback: 'Pomyliłeś sinus z cosinusem dla kąta 30°'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(3.0, 'basic_trig', rand);
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