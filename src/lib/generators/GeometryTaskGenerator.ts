import { TaskDefinition } from '../UniversalInterfaces';
import { SeededRandom } from '../UniversalInterfaces';

export class GeometryTaskGenerator {
  private microSkills: string[] = [
    'area_calculation',
    'pythagorean_theorem',
    'circle_measurements'
  ];

  public generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    if (!microSkill || !this.microSkills.includes(microSkill)) {
      const idx = rand ? rand.nextInt(0, this.microSkills.length - 1) : Math.floor(Math.random() * this.microSkills.length);
      microSkill = this.microSkills[idx];
    }
    const id = microSkill + '_' + Math.floor((rand ? rand.nextDouble() : Math.random()) * 100000);
    let task: TaskDefinition = {
      id,
      department: 'geometry',
      skillName: 'Geometry - ' + microSkill,
      microSkill,
      difficulty,
      latex: '',
      expectedAnswer: '',
      misconceptionMap: {}
    };

    switch (microSkill) {
      case 'area_calculation': {
        const base = rand ? rand.nextInt(4, 12) : Math.floor(Math.random() * 9) + 4;
        const height = rand ? rand.nextInt(3, 10) : Math.floor(Math.random() * 8) + 3;
        const area = (base * height) / 2;
        task.latex = `Oblicz pole trójkąta o podstawie $${base}$ cm i wysokości $${height}$ cm.`;
        task.expectedAnswer = `${area}`;
        task.misconceptionMap[`${base * height}`] = {
          type: 'no_half_factor',
          feedback: 'Zapomniano podzielić przez 2 (pole trójkąta to ½ × podstawa × wysokość)'
        };
        task.misconceptionMap[`${base + height}`] = {
          type: 'addition_instead_multiplication',
          feedback: 'Dodano wymiary zamiast je pomnożyć'
        };
        break;
      }
      case 'pythagorean_theorem': {
        const a = rand ? rand.nextInt(3, 8) : Math.floor(Math.random() * 6) + 3;
        const b = rand ? rand.nextInt(3, 8) : Math.floor(Math.random() * 6) + 3;
        const c = Math.sqrt(a * a + b * b);
        task.latex = `W trójkącie prostokątnym przyprostokątne mają długości $${a}$ cm i $${b}$ cm. Oblicz długość przeciwprostokątnej.`;
        task.expectedAnswer = `${c.toFixed(2)}`;
        task.misconceptionMap[`${a + b}`] = {
          type: 'addition_instead_pythagorean',
          feedback: 'Dodano długości boków zamiast zastosować twierdzenie Pitagorasa'
        };
        break;
      }
      case 'circle_measurements': {
        const r = rand ? rand.nextInt(2, 8) : Math.floor(Math.random() * 7) + 2;
        const area = Math.PI * r * r;
        task.latex = `Oblicz pole koła o promieniu $${r}$ cm. Wynik podaj z dokładnością do dwóch miejsc po przecinku.`;
        task.expectedAnswer = `${area.toFixed(2)}`;
        task.misconceptionMap[`${(Math.PI * r).toFixed(2)}`] = {
          type: 'radius_not_squared',
          feedback: 'Nie podniesiono promienia do kwadratu (wzór: πr²)'
        };
        task.misconceptionMap[`${(2 * Math.PI * r).toFixed(2)}`] = {
          type: 'circumference_instead_area',
          feedback: 'Obliczono obwód koła zamiast pola'
        };
        break;
      }
    }
    return task;
  }

  public generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    switch (targetMisconception) {
      case 'addition_instead_pythagorean': {
        const task: TaskDefinition = {
          id: 'geo_pythagoras_add',
          department: 'geometry',
          skillName: 'Geometry - pythagorean_theorem',
          microSkill: 'pythagorean_theorem',
          difficulty: 4.0,
          latex: 'W trójkącie prostokątnym przyprostokątne mają długości 3 cm i 4 cm. Oblicz długość przeciwprostokątnej.',
          expectedAnswer: '5',
          misconceptionMap: {
            '7': {
              type: 'addition_instead_pythagorean',
              feedback: 'Dodano długości boków (3+4=7) zamiast zastosować twierdzenie Pitagorasa'
            }
          }
        };
        return task;
      }
      default: {
        return this.generateTask(4.0, 'pythagorean_theorem', rand);
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