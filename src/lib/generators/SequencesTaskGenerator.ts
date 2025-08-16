import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class SequencesTaskGenerator {
  private microSkills: string[] = [
    'arithmetic_sequence',
    'arithmetic_sequence_sum',
    'geometric_sequence'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'sequences',
      skillName: 'Sequences - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'arithmetic_sequence': {
        const a1 = rand ? rand.nextInt(1, 10) : Math.floor(Math.random() * 10) + 1;
        let d = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        if (difficulty >= 6 && (rand ? rand.nextInt(0, 1) === 0 : Math.random() < 0.3)) {
          d = -d;
        }
        const n = rand ? rand.nextInt(5, 10) : Math.floor(Math.random() * 6) + 5;
        const an = a1 + (n - 1) * d;
        task.latex = `Dany jest ciąg arytmetyczny o pierwszym wyrazie $a_1 = ${a1}$ i różnicy $r = ${d}$. Oblicz $a_{${n}}$.`;
        task.expectedAnswer = `${an}`;
        const wrong_an = a1 + n * d;
        task.misconceptionMap[`${wrong_an}`] = {
          type: 'off_by_one',
          feedback: 'Wzór zastosowano niepoprawnie: użyto n zamiast (n-1) przy obliczaniu wyrazu'
        };
        break;
      }
      case 'arithmetic_sequence_sum': {
        const a1 = rand ? rand.nextInt(1, 10) : Math.floor(Math.random() * 10) + 1;
        const d = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        const n = rand ? rand.nextInt(4, 8) : Math.floor(Math.random() * 5) + 4;
        const an = a1 + (n - 1) * d;
        const sum = (a1 + an) * n / 2;
        task.latex = `Dany jest ciąg arytmetyczny o $a_1 = ${a1}$ i $r = ${d}$. Oblicz sumę $S_{${n}}$ – pierwszych ${n} wyrazów.`;
        task.expectedAnswer = `${sum}`;
        const wrongSum = (a1 + an) * n;
        task.misconceptionMap[`${wrongSum}`] = {
          type: 'no_half_factor',
          feedback: 'Zapomniano podzielić sumę przez 2 w formule sumy ciągu'
        };
        break;
      }
      case 'geometric_sequence': {
        const a1 = rand ? rand.nextInt(1, 5) : Math.floor(Math.random() * 5) + 1;
        let q = rand ? rand.nextInt(2, 4) : Math.floor(Math.random() * 3) + 2;
        if (difficulty >= 9 && (rand ? rand.nextInt(0, 1) === 0 : Math.random() < 0.5)) {
          q = -q;
        }
        const n = rand ? rand.nextInt(4, 7) : Math.floor(Math.random() * 4) + 4;
        const an = a1 * Math.pow(q, n - 1);
        task.latex = `Dany jest ciąg geometryczny o $a_1 = ${a1}$ i ilorazie $q = ${q}$. Oblicz $a_{${n}}$.`;
        task.expectedAnswer = `${an}`;
        const wrong_an = a1 + (n - 1) * q;
        task.misconceptionMap[`${wrong_an}`] = {
          type: 'arithmetic_instead_geometric',
          feedback: 'Pomyłka: zastosowano wzór ciągu arytmetycznego zamiast geometrycznego'
        };
        break;
      }
    }

    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'off_by_one': {
        const task: TaskDefinition = {
          id: 'seq_off_by_one',
          department: 'sequences',
          skillName: 'Sequences - arithmetic_sequence',
          microSkill: 'arithmetic_sequence',
          difficulty: 3.0,
          latex: 'W ciągu arytmetycznym $a_1 = 2$, $r = 3$. Oblicz $a_5$.',
          expectedAnswer: '14',
          misconceptionMap: {
            '17': {
              type: 'off_by_one',
              feedback: 'Policzono $a_5$ jako $a_1 + 5r$ zamiast $a_1 + 4r$'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(4.0, 'arithmetic_sequence', rand);
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