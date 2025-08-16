import { TaskDefinition, TaskGenerationParams, SeededRandom } from '../UniversalInterfaces';

export class RealNumbersTaskGenerator {
  private microSkills: string[] = [
    "numbers_addition_subtraction",
    "numbers_multiplication_division",
    "numbers_order_of_operations",
    "numbers_absolute_value",
    "numbers_exponentiation_roots",
    "numbers_logarithms",
    "numbers_compound_interest",
    "numbers_interval_notation"
  ];

  private microSkillRanges: { [id: string]: [number, number] } = {
    "numbers_addition_subtraction": [1, 5],
    "numbers_multiplication_division": [1, 5],
    "numbers_order_of_operations": [2, 6],
    "numbers_absolute_value": [1, 4],
    "numbers_exponentiation_roots": [2, 6],
    "numbers_logarithms": [3, 8],
    "numbers_compound_interest": [2, 7],
    "numbers_interval_notation": [1, 4]
  };

  private microSkillGenerators = {
    'numbers_addition_subtraction': this.generateAdditionSubtraction.bind(this),
    'numbers_multiplication_division': this.generateMultiplicationDivision.bind(this),
    'numbers_order_of_operations': this.generateOrderOperations.bind(this),
    'numbers_absolute_value': this.generateAbsoluteValue.bind(this),
    'numbers_exponentiation_roots': this.generateExponentiationRoots.bind(this),
    'numbers_logarithms': this.generateLogarithms.bind(this),
    'numbers_compound_interest': this.generateCompoundInterest.bind(this),
    'numbers_interval_notation': this.generateIntervalNotation.bind(this)
  };

  generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    // Choose micro-skill if not specified, matching difficulty range if possible
    let chosenMicro: string;
    if (microSkill) {
      chosenMicro = microSkill;
    } else {
      // Filter microSkills by difficulty range
      let possible = this.microSkills.filter(ms => {
        const [min, max] = this.microSkillRanges[ms];
        return difficulty >= min && difficulty <= max;
      });
      if (possible.length === 0) {
        // If none fits, adjust difficulty into range and pick again
        if (difficulty > 9) difficulty = 9;
        if (difficulty < 1) difficulty = 1;
        possible = this.microSkills.filter(ms => {
          const [min, max] = this.microSkillRanges[ms];
          return difficulty >= min && difficulty <= max;
        });
        if (possible.length === 0) possible = [...this.microSkills]; // fallback to any
      }
      // Pick a random microSkill from possible
      const r = rand ? rand.nextDouble() : Math.random();
      chosenMicro = possible[Math.floor(r * possible.length)];
    }

    const generator = this.microSkillGenerators[chosenMicro];
    if (!generator) {
      throw new Error(`Unknown micro-skill: ${chosenMicro}`);
    }

    const taskData = generator(difficulty, rand);
    
    return {
      id: `real_numbers_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      department: 'real_numbers',
      skillName: 'Liczby rzeczywiste',
      microSkill: chosenMicro,
      difficulty: difficulty,
      latex: taskData.problemText,
      expectedAnswer: taskData.correctAnswer,
      misconceptionMap: this.getMisconceptionMap(chosenMicro)
    };
  }

  generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    const misconceptionMap = {
      "subtract_negative": () => this.generateSubtractNegativeMisconception(rand),
      "adding_negatives": () => this.generateAddingNegativesMisconception(rand),
      "multiply_negatives": () => this.generateMultiplyNegativesMisconception(rand),
      "divide_by_fraction": () => this.generateDivideByFractionMisconception(rand),
      "ignore_priority": () => this.generateIgnorePriorityMisconception(rand),
      "abs_as_negation": () => this.generateAbsNegationMisconception(rand),
      "multiply_exponents_error": () => this.generateMultiplyExponentsMisconception(rand),
      "log_sum_instead_of_product": () => this.generateLogSumMisconception(rand),
      "percent_to_decimal": () => this.generatePercentDecimalMisconception(rand),
      "open_closed_confusion": () => this.generateOpenClosedMisconception(rand)
    };

    const generator = misconceptionMap[targetMisconception];
    if (!generator) {
      // Fallback default
      const taskData = {
        problemText: "Oblicz: 1 - (-2)",
        correctAnswer: "3",
        microSkill: "numbers_addition_subtraction"
      };
      
      return {
        id: `misconception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        department: 'real_numbers',
        skillName: 'Liczby rzeczywiste',
        microSkill: taskData.microSkill,
        difficulty: 3,
        latex: taskData.problemText,
        expectedAnswer: taskData.correctAnswer,
        misconceptionMap: this.getMisconceptionMap(taskData.microSkill)
      };
    }

    const taskData = generator();
    
    return {
      id: `misconception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      department: 'real_numbers',
      skillName: 'Liczby rzeczywiste',
      microSkill: taskData.microSkill,
      difficulty: 3,
      latex: taskData.problemText,
      expectedAnswer: taskData.correctAnswer,
      misconceptionMap: this.getMisconceptionMap(taskData.microSkill)
    };
  }

  generateProgressiveTask(currentLevel: number): TaskDefinition {
    const nextDifficulty = Math.min(10, currentLevel + 1);
    return this.generateTask(nextDifficulty);
  }

  generateTaskWithSeed(seed: string, params: { difficulty: number; microSkill?: string; targetMisconception?: string }): TaskDefinition {
    const rng = new SeededRandom(seed);
    if (params.targetMisconception) {
      return this.generateMisconceptionTask(params.targetMisconception, rng);
    } else {
      return this.generateTask(params.difficulty, params.microSkill, rng);
    }
  }

  // Helper for random integer
  private randInt(min: number, max: number, rand?: SeededRandom): number {
    const r = rand ? rand.nextDouble() : Math.random();
    return Math.floor(r * (max - min + 1)) + min;
  }

  // Helper: greatest common divisor
  private gcd(a: number, b: number): number {
    if (b === 0) return Math.abs(a);
    return this.gcd(b, a % b);
  }

  // Individual micro-skill generators
  private generateAdditionSubtraction(difficulty: number, rand?: SeededRandom) {
    const useSubtraction = this.randInt(0, 1, rand) === 1;
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 2) {
      // Small integers, ensure non-negative result for diff1
      let a = this.randInt(1, difficulty === 1 ? 20 : 50, rand);
      let b = this.randInt(1, difficulty === 1 ? 20 : 50, rand);
      if (useSubtraction) {
        if (difficulty === 1 && b > a) [a, b] = [b, a]; // avoid negative result for easiest level
        problemText = `Oblicz: ${a} - ${b}`;
        correctAnswer = (a - b).toString();
      } else {
        problemText = `Oblicz: ${a} + ${b}`;
        correctAnswer = (a + b).toString();
      }
    } else if (difficulty <= 3) {
      // Include negative integers
      const a = this.randInt(-20, 20, rand);
      const b = this.randInt(-20, 20, rand);
      if (useSubtraction) {
        problemText = `Oblicz: ${a} - ${b}`;
        correctAnswer = (a - b).toString();
      } else {
        problemText = `Oblicz: ${a} + ${b}`;
        correctAnswer = (a + b).toString();
      }
    } else {
      // Use fraction addition/subtraction for higher difficulty
      const a_num = this.randInt(1, 9, rand);
      const a_den = this.randInt(2, 9, rand);
      const b_num = this.randInt(1, 9, rand);
      const b_den = this.randInt(2, 9, rand);
      const useSub = useSubtraction;
      problemText = `Oblicz: ${a_num}/${a_den} ${useSub ? "-" : "+"} ${b_num}/${b_den}`;
      
      // Calculate correct sum or difference
      const lcm = (a_den * b_den) / this.gcd(a_den, b_den);
      const sum_num = useSub
        ? a_num * (lcm / a_den) - b_num * (lcm / b_den)
        : a_num * (lcm / a_den) + b_num * (lcm / b_den);
      
      // Simplify result
      let gcdRes = this.gcd(Math.abs(sum_num), lcm);
      let res_num = sum_num / gcdRes;
      let res_den = lcm / gcdRes;
      if (res_den < 0) { res_den = -res_den; res_num = -res_num; }
      if (res_den === 1) {
        correctAnswer = res_num.toString();
      } else {
        correctAnswer = `${res_num}/${res_den}`;
      }
    }

    return { problemText, correctAnswer };
  }

  private generateMultiplicationDivision(difficulty: number, rand?: SeededRandom) {
    const useDivision = this.randInt(0, 1, rand) === 1;
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 3) {
      if (!useDivision) {
        // Multiplication of integers
        const a = this.randInt(difficulty === 1 ? 1 : -12, 12, rand);
        const b = this.randInt(difficulty === 1 ? 1 : -12, 12, rand);
        problemText = `Oblicz: ${a} * ${b}`;
        correctAnswer = (a * b).toString();
      } else {
        // Division by integer (ensure no remainder for simplicity)
        const divisor = this.randInt(1, 10, rand);
        const quotient = this.randInt(1, 10, rand) * (this.randInt(0, 1, rand) ? 1 : -1);
        const dividend = divisor * quotient;
        problemText = `Oblicz: ${dividend} / ${divisor}`;
        correctAnswer = quotient.toString();
      }
    } else {
      // Division by fraction
      const numerator = this.randInt(1, 9, rand);
      let fracNum: number, fracDen: number;
      if (difficulty === 4) {
        fracNum = 1;
        fracDen = this.randInt(2, 5, rand);
      } else {
        fracNum = this.randInt(1, 5, rand);
        fracDen = this.randInt(2, 5, rand);
      }
      problemText = `Oblicz: ${numerator} / (${fracNum}/${fracDen})`;
      
      // Compute result: numerator * (fracDen/fracNum)
      const resNum = numerator * fracDen;
      const resDen = fracNum;
      
      // Simplify
      const g = this.gcd(resNum, resDen);
      let nres = resNum / g;
      let dres = resDen / g;
      if (dres < 0) { dres = -dres; nres = -nres; }
      if (dres === 1) {
        correctAnswer = nres.toString();
      } else {
        correctAnswer = `${nres}/${dres}`;
      }
    }

    return { problemText, correctAnswer };
  }

  private generateOrderOperations(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 3) {
      // Expression with one addition/sub and one multiplication/div
      const A = this.randInt(1, 9, rand);
      const B = this.randInt(1, 9, rand);
      const C = this.randInt(1, 9, rand);
      const addOp = this.randInt(0, 1, rand) === 1 ? "+" : "-";
      const multOp = this.randInt(0, 1, rand) === 1 ? "*" : "/";
      let expr: string;
      let result: number;
      
      if (multOp === "/") {
        // ensure divisible
        const product = B * C;
        expr = `${A} ${addOp} ${product} / ${C}`;
        result = addOp === "+" ? A + (product / C) : A - (product / C);
      } else {
        expr = `${A} ${addOp} ${B} * ${C}`;
        result = addOp === "+" ? A + B * C : A - B * C;
      }
      problemText = `Oblicz: ${expr}`;
      correctAnswer = result.toString();
    } else {
      // Expression with two plus/minus and one multiply
      const A = this.randInt(1, 5, rand);
      const B = this.randInt(1, 5, rand);
      const C = this.randInt(1, 5, rand);
      const D = this.randInt(1, 5, rand);
      const firstNeg = this.randInt(0, 1, rand) === 1;
      const secondNeg = this.randInt(0, 1, rand) === 1;
      const sign1 = firstNeg ? "-" : "+";
      const sign2 = secondNeg ? "-" : "+";
      problemText = `Oblicz: ${A} ${sign1} ${B} * ${C} ${sign2} ${D}`;
      
      // Compute correct result using operator precedence
      const product = B * C;
      let temp = firstNeg ? A - product : A + product;
      let result = secondNeg ? temp - D : temp + D;
      correctAnswer = result.toString();
    }

    return { problemText, correctAnswer };
  }

  private generateAbsoluteValue(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 2) {
      // Absolute of a single number
      const val = this.randInt(-20, -1, rand);
      problemText = `Oblicz: |${val}|`;
      correctAnswer = Math.abs(val).toString();
    } else {
      // Absolute of an expression like |a - b|
      let a = this.randInt(0, 20, rand);
      let b = this.randInt(0, 20, rand);
      // ensure a - b is negative to test understanding
      if (a >= b) [a, b] = [b, a];
      problemText = `Oblicz: |${a} - ${b}|`;
      correctAnswer = Math.abs(a - b).toString();
    }

    return { problemText, correctAnswer };
  }

  private generateExponentiationRoots(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 3) {
      if (this.randInt(0, 1, rand) === 0) {
        // Evaluate simple power
        const base = this.randInt(2, 5, rand);
        const exp = this.randInt(2, 4, rand);
        problemText = `Oblicz: ${base}^${exp}`;
        correctAnswer = Math.pow(base, exp).toString();
      } else {
        // Evaluate simple square root
        const r = this.randInt(2, 10, rand);
        problemText = `Oblicz: √(${r * r})`;
        correctAnswer = r.toString();
      }
    } else if (difficulty <= 5) {
      if (this.randInt(0, 1, rand) === 0) {
        // Multiply powers with same base
        const base = this.randInt(2, 5, rand);
        const e1 = this.randInt(2, 4, rand);
        const e2 = this.randInt(2, 4, rand);
        problemText = `Oblicz: ${base}^${e1} * ${base}^${e2}`;
        const resExp = e1 + e2;
        correctAnswer = Math.pow(base, resExp).toString();
      } else {
        // Divide powers with same base
        const base = this.randInt(2, 5, rand);
        let e1 = this.randInt(3, 6, rand);
        let e2 = this.randInt(1, 4, rand);
        if (e2 > e1) [e1, e2] = [e2, e1];
        problemText = `Oblicz: ${base}^${e1} / ${base}^${e2}`;
        const resExp = e1 - e2;
        correctAnswer = Math.pow(base, resExp).toString();
      }
    } else {
      // Power of a power
      const base = this.randInt(2, 4, rand);
      const e1 = this.randInt(2, 3, rand);
      const e2 = this.randInt(2, 3, rand);
      problemText = `Oblicz: (${base}^${e1})^${e2}`;
      const resExp = e1 * e2;
      correctAnswer = Math.pow(base, resExp).toString();
    }

    return { problemText, correctAnswer };
  }

  private generateLogarithms(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 4) {
      // Evaluate simple log
      const baseOptions = [2, 3, 10];
      const base = baseOptions[this.randInt(0, baseOptions.length - 1, rand)];
      const exp = this.randInt(1, 4, rand);
      const value = Math.pow(base, exp);
      problemText = `Oblicz: log${base}(${value})`;
      correctAnswer = exp.toString();
    } else if (difficulty <= 6) {
      // Sum or difference of logs
      const baseOptions = [2, 10];
      const base = baseOptions[this.randInt(0, baseOptions.length - 1, rand)];
      const plus = this.randInt(0, 1, rand) === 0;
      if (plus) {
        // log(a) + log(b) = log(ab)
        const a = this.randInt(2, 5, rand);
        const b = this.randInt(2, 5, rand);
        problemText = `Uprość: log${base}(${a}) + log${base}(${b})`;
        correctAnswer = `log${base}(${a * b})`;
      } else {
        // log(a) - log(b) = log(a/b)
        const b = this.randInt(2, 5, rand);
        const c = this.randInt(2, 5, rand);
        const a = b * c;
        problemText = `Uprość: log${base}(${a}) - log${base}(${b})`;
        correctAnswer = `log${base}(${c})`;
      }
    } else {
      // Coefficient times log: e.g. 3*log2(5) = log2(125)
      const base = this.randInt(0, 1, rand) ? 2 : 10;
      const coeff = this.randInt(2, 3, rand);
      const x = this.randInt(2, 5, rand);
      problemText = `Uprość: ${coeff} * log${base}(${x})`;
      const powerResult = Math.pow(x, coeff);
      correctAnswer = `log${base}(${powerResult})`;
    }

    return { problemText, correctAnswer };
  }

  private generateCompoundInterest(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    // Generate a simple interest problem (compound interest formula)
    const initial = this.randInt(10, 50, rand) * 100; // initial capital in zł
    const rate = this.randInt(1, 2, rand) * 5; // 5% or 10%
    const years = this.randInt(1, 5, rand);
    const yearsLabel = years === 1 ? "roku" : (years >= 2 && years <= 4 ? "lata" : "lat");
    
    if (difficulty <= 4) {
      // Compute final amount
      problemText = `Kapitał ${initial} zł ulokowano na ${rate}% rocznie na okres ${years} ${yearsLabel}. Oblicz stan konta po ${years} ${yearsLabel}.`;
      const finalAmount = initial * Math.pow(1 + rate / 100, years);
      correctAnswer = finalAmount.toFixed(2);
    } else {
      // Compute required initial given final
      const final = this.randInt(10, 50, rand) * 100;
      problemText = `Po ${years} ${yearsLabel} otrzymano ${final} zł (oprocentowanie ${rate}% rocznie). Oblicz początkowy kapitał.`;
      const presentValue = final / Math.pow(1 + rate / 100, years);
      correctAnswer = presentValue.toFixed(2);
    }

    return { problemText, correctAnswer };
  }

  private generateIntervalNotation(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty % 2 === 1) {
      // inequality to interval
      const a = this.randInt(-5, 5, rand);
      const type = this.randInt(0, 3, rand); // 0: >, 1: >=, 2: <, 3: <=
      let inequality: string;
      let interval: string;
      
      switch (type) {
        case 0:
          inequality = `x > ${a}`;
          interval = `(${a}, ∞)`;
          break;
        case 1:
          inequality = `x ≥ ${a}`;
          interval = `[${a}, ∞)`;
          break;
        case 2:
          inequality = `x < ${a}`;
          interval = `(-∞, ${a})`;
          break;
        case 3:
        default:
          inequality = `x ≤ ${a}`;
          interval = `(-∞, ${a}]`;
          break;
      }
      problemText = `Podaj przedział odpowiadający warunkowi: ${inequality}.`;
      correctAnswer = interval;
    } else {
      // interval to inequality
      const useFinite = this.randInt(0, 1, rand) === 1;
      let interval: string;
      let inequality: string;
      
      if (useFinite) {
        // finite interval [a, b], (a, b), etc.
        let a = this.randInt(-5, 3, rand);
        let b = a + this.randInt(1, 5, rand);
        const leftClosed = this.randInt(0, 1, rand) === 1;
        const rightClosed = this.randInt(0, 1, rand) === 1;
        interval = `${leftClosed ? "[" : "("}${a}, ${b}${rightClosed ? "]" : ")"}`;
        const leftIneq = leftClosed ? "≥" : ">";
        const rightIneq = rightClosed ? "≤" : "<";
        inequality = `${a} ${leftIneq} x ${rightIneq} ${b}`;
      } else {
        // half-infinite interval
        const a = this.randInt(-4, 4, rand);
        if (this.randInt(0, 1, rand) === 0) {
          // (a, ∞) or [a, ∞)
          const closed = this.randInt(0, 1, rand) === 1;
          interval = `${closed ? "[" : "("}${a}, ∞)`;
          inequality = `x ${closed ? "≥" : ">"} ${a}`;
        } else {
          // (-∞, a) or (-∞, a]
          const closed = this.randInt(0, 1, rand) === 1;
          interval = `(-∞, ${a}${closed ? "]" : ")"}`;
          inequality = `x ${closed ? "≤" : "<"} ${a}`;
        }
      }
      problemText = `Podaj nierówność odpowiadającą przedziałowi: ${interval}.`;
      correctAnswer = inequality;
    }

    return { problemText, correctAnswer };
  }

  // Misconception task generators
  private generateSubtractNegativeMisconception(rand?: SeededRandom) {
    const a = 5 + this.randInt(0, 5, rand);
    const b = 3 + this.randInt(0, 5, rand);
    return {
      problemText: `Oblicz: ${a} - (${-b})`,
      correctAnswer: (a - (-b)).toString(),
      microSkill: "numbers_addition_subtraction"
    };
  }

  private generateAddingNegativesMisconception(rand?: SeededRandom) {
    const x = -2 - this.randInt(0, 4, rand);
    const y = -3 - this.randInt(0, 3, rand);
    return {
      problemText: `Oblicz: ${x} + ${y}`,
      correctAnswer: (x + y).toString(),
      microSkill: "numbers_addition_subtraction"
    };
  }

  private generateMultiplyNegativesMisconception(rand?: SeededRandom) {
    return {
      problemText: `Oblicz: (-4) * (-2)`,
      correctAnswer: "8",
      microSkill: "numbers_multiplication_division"
    };
  }

  private generateDivideByFractionMisconception(rand?: SeededRandom) {
    return {
      problemText: `Oblicz: 6 / (1/2)`,
      correctAnswer: "12",
      microSkill: "numbers_multiplication_division"
    };
  }

  private generateIgnorePriorityMisconception(rand?: SeededRandom) {
    return {
      problemText: `Oblicz: 2 + 3 * 4`,
      correctAnswer: "14",
      microSkill: "numbers_order_of_operations"
    };
  }

  private generateAbsNegationMisconception(rand?: SeededRandom) {
    return {
      problemText: `Oblicz: | -5 |`,
      correctAnswer: "5",
      microSkill: "numbers_absolute_value"
    };
  }

  private generateMultiplyExponentsMisconception(rand?: SeededRandom) {
    return {
      problemText: `Oblicz: 2^3 * 2^4`,
      correctAnswer: "128",
      microSkill: "numbers_exponentiation_roots"
    };
  }

  private generateLogSumMisconception(rand?: SeededRandom) {
    return {
      problemText: `Uprość: log10(2) + log10(3)`,
      correctAnswer: `log10(6)`,
      microSkill: "numbers_logarithms"
    };
  }

  private generatePercentDecimalMisconception(rand?: SeededRandom) {
    return {
      problemText: `Cena towaru 100 zł wzrosła o 5%. Oblicz nową cenę.`,
      correctAnswer: "105",
      microSkill: "numbers_compound_interest"
    };
  }

  private generateOpenClosedMisconception(rand?: SeededRandom) {
    return {
      problemText: `Podaj przedział odpowiadający warunkowi: x > 3.`,
      correctAnswer: "(3, ∞)",
      microSkill: "numbers_interval_notation"
    };
  }

  private getMisconceptionMap(microSkill: string): { [incorrectAnswer: string]: { type: string; feedback: string } } {
    const misconceptionMaps: { [key: string]: { [incorrectAnswer: string]: { type: string; feedback: string } } } = {
      "numbers_addition_subtraction": {
        "2": { 
          type: "subtract_negative", 
          feedback: "Pamiętaj: odejmowanie liczby ujemnej to dodawanie liczby dodatniej. 5 - (-3) = 5 + 3 = 8" 
        },
        "-5": { 
          type: "adding_negatives", 
          feedback: "Gdy dodajesz dwie liczby ujemne, dodajesz ich wartości bezwzględne i stawiasz znak minus." 
        }
      },
      "numbers_multiplication_division": {
        "-8": { 
          type: "multiply_negatives", 
          feedback: "Iloczyn dwóch liczb ujemnych jest dodatni: (-) × (-) = (+)" 
        },
        "3": { 
          type: "divide_by_fraction", 
          feedback: "Dzielenie przez ułamek to mnożenie przez odwrotność: 6 ÷ (1/2) = 6 × 2 = 12" 
        }
      },
      "numbers_order_of_operations": {
        "20": { 
          type: "ignore_priority", 
          feedback: "Pamiętaj o kolejności działań: najpierw mnożenie, potem dodawanie. 2 + 3 × 4 = 2 + 12 = 14" 
        }
      },
      "numbers_absolute_value": {
        "-5": { 
          type: "abs_as_negation", 
          feedback: "Wartość bezwzględna zawsze daje wynik nieujemny: |-5| = 5" 
        }
      },
      "numbers_exponentiation_roots": {
        "4096": { 
          type: "multiply_exponents_error", 
          feedback: "Przy mnożeniu potęg o tej samej podstawie dodajesz wykładniki: 2³ × 2⁴ = 2⁷ = 128" 
        }
      },
      "numbers_logarithms": {
        "log10(5)": { 
          type: "log_sum_instead_of_product", 
          feedback: "Suma logarytmów to logarytm iloczynu: log₁₀(2) + log₁₀(3) = log₁₀(2×3) = log₁₀(6)" 
        }
      },
      "numbers_compound_interest": {
        "600": { 
          type: "percent_to_decimal", 
          feedback: "5% to 0,05, więc zwiększenie o 5% oznacza pomnożenie przez 1,05: 100 × 1,05 = 105 zł" 
        }
      },
      "numbers_interval_notation": {
        "[3, ∞)": { 
          type: "open_closed_confusion", 
          feedback: "x > 3 oznacza, że 3 nie jest włączone do przedziału, więc używamy nawiasu okrągłego: (3, ∞)" 
        }
      }
    };

    return misconceptionMaps[microSkill] || {};
  }
}