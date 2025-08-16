import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class StatisticsTaskGenerator {
  private microSkills: string[] = [
    'probability',
    'descriptive',
    'combinatorics'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'statistics',
      skillName: 'Statistics - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'probability': {
        task.latex = 'Rzucamy symetryczną kostką sześcienną. Jakie jest prawdopodobieństwo otrzymania wyniku większego niż 4?';
        task.expectedAnswer = '1/3';
        task.misconceptionMap['1/2'] = {
          type: 'outcome_count_error',
          feedback: 'Błędnie policzono liczbę korzystnych wyników (wliczono wynik 4)'
        };
        break;
      }
      case 'descriptive': {
        const x = rand ? rand.nextInt(1, 10) : Math.floor(Math.random() * 10) + 1;
        const y = rand ? rand.nextInt(1, 10) : Math.floor(Math.random() * 10) + 1;
        let z = rand ? rand.nextInt(1, 10) : Math.floor(Math.random() * 10) + 1;
        const sumMod = (x + y + z) % 3;
        z = (z + (3 - sumMod)) % 10 || 3;
        const numbers = [x, y, z];
        task.latex = `Dane są liczby: ${numbers.join(', ')}. Oblicz ich średnią arytmetyczną.`;
        const sum = x + y + z;
        const mean = sum / 3;
        task.expectedAnswer = `${mean}`;
        task.misconceptionMap[`${sum}`] = {
          type: 'missing_division',
          feedback: 'Nie podzielono sumy przez liczbę elementów (obliczono tylko sumę)'
        };
        break;
      }
      case 'combinatorics': {
        const n = 5, k = 2;
        task.latex = `Ile jest sposobów wybrania ${k} osób z grupy ${n} osób?`;
        task.expectedAnswer = '10';
        task.misconceptionMap['20'] = {
          type: 'perm_instead_comb',
          feedback: 'Użyto permutacji zamiast kombinacji (kolejność uwzględniono błędnie)'
        };
        break;
      }
    }
    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'perm_instead_comb': {
        const task: TaskDefinition = {
          id: 'stat_perm_vs_comb',
          department: 'statistics',
          skillName: 'Statistics - combinatorics',
          microSkill: 'combinatorics',
          difficulty: 4.0,
          latex: 'Ile jest sposobów ustawić w kolejności 2 wybrane osoby spośród 5?',
          expectedAnswer: '20',
          misconceptionMap: {
            '10': {
              type: 'comb_instead_perm',
              feedback: 'Pomyłka: obliczono kombinacje zamiast permutacji (kolejność pominięta)'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(3.0, 'probability', rand);
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