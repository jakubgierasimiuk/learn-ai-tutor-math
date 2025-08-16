import { TaskDefinition, TaskGenerationParams, SeededRandom } from '../UniversalInterfaces';

export class AlgebraicExpressionsTaskGenerator {
  private microSkills: string[] = [
    "algebra_short_multiplication_formulas",
    "algebra_polynomial_addition",
    "algebra_polynomial_multiplication",
    "algebra_factoring_polynomials",
    "algebra_rational_simplification",
    "algebra_rational_addition_subtraction",
    "algebra_rational_multiplication_division"
  ];

  private microSkillGenerators = {
    'algebra_short_multiplication_formulas': this.generateShortMultiplication.bind(this),
    'algebra_polynomial_addition': this.generatePolynomialAddition.bind(this),
    'algebra_polynomial_multiplication': this.generatePolynomialMultiplication.bind(this),
    'algebra_factoring_polynomials': this.generateFactoring.bind(this),
    'algebra_rational_simplification': this.generateRationalSimplification.bind(this),
    'algebra_rational_addition_subtraction': this.generateRationalAddition.bind(this),
    'algebra_rational_multiplication_division': this.generateRationalMultiplication.bind(this)
  };

  generateTask(difficulty: number, microSkill?: string, rand?: SeededRandom): TaskDefinition {
    const ms = microSkill || this.microSkills[0]; // default to first if none specified
    
    const generator = this.microSkillGenerators[ms];
    if (!generator) {
      throw new Error(`Unknown micro-skill: ${ms}`);
    }

    const taskData = generator(difficulty, rand);
    
    return {
      id: `algebraic_expressions_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      department: 'algebraic_expressions',
      skillName: 'Wyrażenia algebraiczne',
      microSkill: ms,
      difficulty: difficulty,
      latex: taskData.problemText,
      expectedAnswer: taskData.correctAnswer,
      misconceptionMap: this.getMisconceptionMap(ms)
    };
  }

  generateMisconceptionTask(targetMisconception: string, rand?: SeededRandom): TaskDefinition {
    const misconceptionMap = {
      "square_sum_missing_term": () => ({
        problemText: "Rozwiń wyrażenie: (x + 3)^2",
        correctAnswer: "x^2 + 6x + 9",
        microSkill: "algebra_short_multiplication_formulas"
      }),
      "square_diff_missing_term": () => ({
        problemText: "Rozwiń wyrażenie: (x - 4)^2",
        correctAnswer: "x^2 - 8x + 16",
        microSkill: "algebra_short_multiplication_formulas"
      }),
      "polynomial_subtraction_sign": () => ({
        problemText: "Oblicz: (x^2 - 3x) - (x^2 - x)",
        correctAnswer: "-2x",
        microSkill: "algebra_polynomial_addition"
      }),
      "missing_terms_foiling": () => ({
        problemText: "Oblicz: (x+2)(x+3)",
        correctAnswer: "x^2 + 5x + 6",
        microSkill: "algebra_polynomial_multiplication"
      }),
      "wrong_power_multiply": () => ({
        problemText: "Oblicz: x^2 * x^3",
        correctAnswer: "x^5",
        microSkill: "algebra_polynomial_multiplication"
      }),
      "factoring_common_factor": () => ({
        problemText: "Rozłóż na czynniki: 4x^2 + 2x",
        correctAnswer: "2x(2x + 1)",
        microSkill: "algebra_factoring_polynomials"
      }),
      "factoring_sign_error": () => ({
        problemText: "Rozłóż na czynniki: x^2 - x - 6",
        correctAnswer: "(x - 3)(x + 2)",
        microSkill: "algebra_factoring_polynomials"
      }),
      "cancel_terms_in_sum": () => ({
        problemText: "Skróć ułamek: (x+2)/(x+5)",
        correctAnswer: "nie można skrócić",
        microSkill: "algebra_rational_simplification"
      }),
      "add_denominators": () => ({
        problemText: "Dodaj: 1/(x+2) + 1/(x+3)",
        correctAnswer: "(2x+5)/((x+2)(x+3))",
        microSkill: "algebra_rational_addition_subtraction"
      }),
      "no_reciprocal": () => ({
        problemText: "Oblicz: (1/2) : (3/4)",
        correctAnswer: "2/3",
        microSkill: "algebra_rational_multiplication_division"
      })
    };

    const generator = misconceptionMap[targetMisconception];
    if (!generator) {
      // Fallback default
      const taskData = {
        problemText: "Oblicz: (x+1)^2",
        correctAnswer: "x^2 + 2x + 1",
        microSkill: "algebra_short_multiplication_formulas"
      };
      
      return {
        id: `misconception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        department: 'algebraic_expressions',
        skillName: 'Wyrażenia algebraiczne',
        microSkill: taskData.microSkill,
        difficulty: 5,
        latex: taskData.problemText,
        expectedAnswer: taskData.correctAnswer,
        misconceptionMap: this.getMisconceptionMap(taskData.microSkill)
      };
    }

    const taskData = generator();
    
    return {
      id: `misconception_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      department: 'algebraic_expressions',
      skillName: 'Wyrażenia algebraiczne',
      microSkill: taskData.microSkill,
      difficulty: 5,
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

  // Helper to format polynomial from coefficients array (highest power first)
  private formatPolynomial(coeffs: number[]): string {
    let str = "";
    const deg = coeffs.length - 1;
    coeffs.forEach((coeff, index) => {
      if (coeff === 0) return;
      const exp = deg - index;
      // Sign
      if (str === "") {
        if (coeff < 0) str += "-";
      } else {
        str += coeff < 0 ? " - " : " + ";
      }
      const absCoeff = Math.abs(coeff);
      // Coefficient
      if (exp === 0) {
        str += absCoeff.toString();
      } else {
        if (absCoeff !== 1) str += absCoeff.toString();
        str += "x";
        if (exp !== 1) str += "^" + exp;
      }
    });
    return str !== "" ? str : "0";
  }

  // Helper gcd for factoring coefficients
  private gcd(a: number, b: number): number {
    if (b === 0) return Math.abs(a);
    return this.gcd(b, a % b);
  }

  // Individual micro-skill generators
  private generateShortMultiplication(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 3) {
      // Expand (x ± a)^2
      const a = this.randInt(1, 5, rand);
      const plus = this.randInt(0, 1, rand) === 1;
      problemText = `Rozwiń wyrażenie: (x ${plus ? "+" : "-"} ${a})^2`;
      // Use formula: (x ± a)^2 = x^2 ± 2ax + a^2
      const term = plus ? "+" : "-";
      const middleCoeff = plus ? 2 * a : -2 * a;
      correctAnswer = `x^2 ${middleCoeff >= 0 ? "+ " : "- "} ${Math.abs(middleCoeff)}x + ${a * a}`;
    } else if (difficulty <= 5) {
      // Expand (x + a)(x - a) = x^2 - a^2
      const a = this.randInt(1, 5, rand);
      problemText = `Rozwiń wyrażenie: (x + ${a})(x - ${a})`;
      correctAnswer = `x^2 - ${a * a}`;
    } else {
      // Expand (x ± a)^3
      const a = this.randInt(1, 4, rand);
      const plus = this.randInt(0, 1, rand) === 1;
      problemText = `Rozwiń wyrażenie: (x ${plus ? "+" : "-"} ${a})^3`;
      // (x + a)^3 = x^3 + 3a x^2 + 3a^2 x + a^3
      // (x - a)^3 = x^3 - 3a x^2 + 3a^2 x - a^3
      const sign = plus ? 1 : -1;
      const c1 = 3 * a * sign;
      const c2 = 3 * a * a;
      const c3 = a * a * a * sign;
      correctAnswer = `x^3 ${c1 >= 0 ? "+ " : "- "} ${Math.abs(c1)}x^2 ${plus ? "+ " : "- "} ${c2}x ${c3 >= 0 ? "+ " : "- "} ${Math.abs(c3)}`;
    }

    return { problemText, correctAnswer };
  }

  private generatePolynomialAddition(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 2) {
      // Add polynomials (deg1 or deg2)
      const deg = difficulty === 1 ? 1 : 2;
      // First polynomial coefficients
      const coeffs1 = Array.from({ length: deg + 1 }, () => this.randInt(-5, 5, rand));
      coeffs1[0] = coeffs1[0] === 0 ? this.randInt(1, 5, rand) : coeffs1[0]; // ensure leading not 0
      // Second polynomial coefficients
      const coeffs2 = Array.from({ length: deg + 1 }, () => this.randInt(-5, 5, rand));
      coeffs2[0] = coeffs2[0] === 0 ? this.randInt(1, 5, rand) : coeffs2[0];
      problemText = `Oblicz: (${this.formatPolynomial(coeffs1)}) + (${this.formatPolynomial(coeffs2)})`;
      // Sum coefficients
      const resultCoeffs: number[] = coeffs1.map((c, i) => c + coeffs2[i]);
      correctAnswer = this.formatPolynomial(resultCoeffs);
    } else {
      // Subtract polynomials (deg2)
      const coeffs1 = [this.randInt(1, 5, rand), this.randInt(-5, 5, rand), this.randInt(-5, 5, rand)]; // deg2 polynomial
      const coeffs2 = [this.randInt(1, 5, rand), this.randInt(-5, 5, rand), this.randInt(-5, 5, rand)];
      problemText = `Oblicz: (${this.formatPolynomial(coeffs1)}) - (${this.formatPolynomial(coeffs2)})`;
      const resultCoeffs = coeffs1.map((c, i) => c - coeffs2[i]);
      correctAnswer = this.formatPolynomial(resultCoeffs);
    }

    return { problemText, correctAnswer };
  }

  private generatePolynomialMultiplication(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 3) {
      // Monomial * polynomial
      const monCoef = this.randInt(1, 5, rand);
      const polyDeg = difficulty === 1 ? 1 : 2;
      const polyCoefs = Array.from({ length: polyDeg + 1 }, (_, i) => this.randInt(-5, 5, rand));
      polyCoefs[0] = polyCoefs[0] === 0 ? this.randInt(1, 5, rand) : polyCoefs[0];
      problemText = `Oblicz: ${monCoef}x * (${this.formatPolynomial(polyCoefs)})`;
      // Multiply each term by monCoef*x -> result degree polyDeg+1
      const resDeg = polyCoefs.length;
      const resultCoeffs = new Array(resDeg + 1).fill(0);
      polyCoefs.forEach((coeff, index) => {
        // multiply coefficient and shift power by 1
        resultCoeffs[index] += monCoef * coeff;
      });
      correctAnswer = this.formatPolynomial(resultCoeffs);
    } else {
      // Binomial * binomial
      const a = this.randInt(1, 5, rand);
      const b = this.randInt(-5, 5, rand);
      const c = this.randInt(1, 5, rand);
      const d = this.randInt(-5, 5, rand);
      problemText = `Oblicz: (${this.formatPolynomial([a, b])}) * (${this.formatPolynomial([c, d])})`;
      // Multiply (ax + b)*(cx + d)
      const coeff_x2 = a * c;
      const coeff_x = a * d + b * c;
      const coeff_const = b * d;
      correctAnswer = this.formatPolynomial([coeff_x2, coeff_x, coeff_const]);
    }

    return { problemText, correctAnswer };
  }

  private generateFactoring(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    // Factor out common factor
    const useNumericOnly = this.randInt(0, 1, rand) === 1;
    
    if (useNumericOnly) {
      // One term without x, factor numeric
      const R = this.randInt(2, 5, rand);
      const a = this.randInt(1, 5, rand);
      const b = this.randInt(1, 5, rand);
      // polynomial: R*a*x^n + R*b (take n >= 1)
      const n = this.randInt(1, 2, rand);
      const term1 = `${R * a}x${n === 1 ? "" : "^" + n}`;
      const term2 = `${R * b}`;
      const polyStr = `${term1} + ${term2}`;
      // common factor: R
      const factorStr = `${R}`;
      // inside: a*x^n + b
      const insideTerm1 = `${a}${n === 1 ? "x" : "x^" + n}`;
      const insideTerm2 = `${b}`;
      correctAnswer = `${factorStr}(${insideTerm1} + ${insideTerm2})`;
      problemText = `Rozłóż na czynniki: ${polyStr}`;
    } else {
      // Both terms have x
      const R = this.randInt(2, 5, rand);
      const a = this.randInt(1, 5, rand);
      const b = this.randInt(1, 5, rand);
      const e1 = this.randInt(1, 2, rand);
      const e2 = this.randInt(1, 2, rand);
      // polynomial: R*a*x^e1 + R*b*x^e2
      const term1 = `${R * a}x${e1 === 1 ? "" : "^" + e1}`;
      const term2 = `${R * b}x${e2 === 1 ? "" : "^" + e2}`;
      const polyStr = `${term1} + ${term2}`;
      // common factor: R * x^min(e1,e2)
      const minExp = Math.min(e1, e2);
      const factorStr = `${R}${minExp > 0 ? "x" : ""}${minExp > 1 ? "^" + minExp : ""}`;
      // inside terms: divide each original term by factor
      const c1 = a;
      const c2 = b;
      const remExp1 = e1 - minExp;
      const remExp2 = e2 - minExp;
      const inside1 = c1 + (remExp1 > 0 ? "x" + (remExp1 > 1 ? "^" + remExp1 : "") : "");
      const inside2 = c2 + (remExp2 > 0 ? "x" + (remExp2 > 1 ? "^" + remExp2 : "") : "");
      correctAnswer = `${factorStr}(${inside1} + ${inside2})`;
      problemText = `Rozłóż na czynniki: ${polyStr}`;
    }

    return { problemText, correctAnswer };
  }

  private generateRationalSimplification(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    // Simplify rational expression by canceling common factor
    const A = this.randInt(1, 5, rand);
    const B = this.randInt(1, 5, rand);
    let C = this.randInt(1, 5, rand);
    if (C === A) C += 1; // ensure A, C distinct
    // Expression: (x + A)(x + B) / (x + A)(x + C)
    // Expand numerator and denominator
    const numCoeffs = [1, (A + B), A * B]; // (x^2 + (A+B)x + A*B)
    const denCoeffs = [1, (A + C), A * C];
    problemText = `Skróć ułamek: (${this.formatPolynomial(numCoeffs)}) / (${this.formatPolynomial(denCoeffs)})`;
    // After cancel (x+A): result = (x+B)/(x+C)
    correctAnswer = `(${this.formatPolynomial([1, B])})/(${this.formatPolynomial([1, C])})`;

    return { problemText, correctAnswer };
  }

  private generateRationalAddition(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty < 8) {
      // e.g. 1/(x+p) + 1/(x+q)
      const p = this.randInt(1, 5, rand);
      let q = this.randInt(1, 5, rand);
      if (q === p) q += 1;
      problemText = `Dodaj: 1/(x+${p}) + 1/(x+${q})`;
      // Result = ( (x+q) + (x+p) ) / ((x+p)(x+q)) = (2x + (p+q)) / ((x+p)(x+q))
      const numCoeff_x = 2;
      const numConst = p + q;
      correctAnswer = `(${numCoeff_x !== 1 ? numCoeff_x : ""}x${numConst >= 0 ? " + " : " - "}${Math.abs(numConst)})/((x+${p})(x+${q}))`;
    } else {
      // e.g. 2/(x+p) + 3/(x+q)
      const p = this.randInt(1, 5, rand);
      let q = this.randInt(1, 5, rand);
      if (q === p) q += 1;
      const A = this.randInt(1, 5, rand);
      const B = this.randInt(1, 5, rand);
      problemText = `Dodaj: ${A}/(x+${p}) + ${B}/(x+${q})`;
      // Result numerator: A*(x+q) + B*(x+p) = (A+B)x + (A*q + B*p)
      const coeffX = A + B;
      const constTerm = A * q + B * p;
      correctAnswer = `(${coeffX !== 1 ? coeffX : ""}x${constTerm >= 0 ? " + " : " - "}${Math.abs(constTerm)})/((x+${p})(x+${q}))`;
    }

    return { problemText, correctAnswer };
  }

  private generateRationalMultiplication(difficulty: number, rand?: SeededRandom) {
    let problemText: string;
    let correctAnswer: string;

    if (difficulty <= 6) {
      // Multiply fractions with common factor
      const A = this.randInt(1, 5, rand);
      const B = this.randInt(1, 5, rand);
      let C = this.randInt(1, 5, rand);
      if (C === B) C += 1;
      // (x+A)/(x+B) * (x+B)/(x+C) = (x+A)/(x+C)
      problemText = `Pomnóż: (x+${A})/(x+${B}) * (x+${B})/(x+${C})`;
      correctAnswer = `(x+${A})/(x+${C})`;
    } else {
      // Division with common factor
      const A = this.randInt(1, 5, rand);
      const B = this.randInt(1, 5, rand);
      let C = this.randInt(1, 5, rand);
      if (C === A) C += 1;
      // (x+A)/(x+B) : (x+A)/(x+C) = (x+A)/(x+B) * (x+C)/(x+A) = (x+C)/(x+B)
      problemText = `Podziel: (x+${A})/(x+${B}) : (x+${A})/(x+${C})`;
      correctAnswer = `(x+${C})/(x+${B})`;
    }

    return { problemText, correctAnswer };
  }

  private getMisconceptionMap(microSkill: string): { [incorrectAnswer: string]: { type: string; feedback: string } } {
    const misconceptionMaps: { [key: string]: { [incorrectAnswer: string]: { type: string; feedback: string } } } = {
      "algebra_short_multiplication_formulas": {
        "x^2 + 9": { 
          type: "square_sum_missing_term", 
          feedback: "Pamiętaj o środkowym wyrazie przy rozwijaniu (a+b)²: (x+3)² = x² + 2·x·3 + 3² = x² + 6x + 9" 
        },
        "x^2 - 16": { 
          type: "square_diff_missing_term", 
          feedback: "To nie jest wzór (a-b)(a+b). Przy (x-4)² mamy: x² - 2·x·4 + 4² = x² - 8x + 16" 
        }
      },
      "algebra_polynomial_addition": {
        "-4x": { 
          type: "polynomial_subtraction_sign", 
          feedback: "Przy odejmowaniu wielomianów zmieniaj znaki wszystkich składników odjemnika: (x²-3x) - (x²-x) = x²-3x-x²+x = -2x" 
        }
      },
      "algebra_polynomial_multiplication": {
        "x^2 + 6": { 
          type: "missing_terms_foiling", 
          feedback: "Przy mnożeniu (x+2)(x+3) musisz pomnożyć każdy składnik pierwszego nawiasu przez każdy z drugiego: x·x + x·3 + 2·x + 2·3 = x² + 5x + 6" 
        },
        "x^6": { 
          type: "wrong_power_multiply", 
          feedback: "Przy mnożeniu potęg o tej samej podstawie dodajesz wykładniki: x² · x³ = x^(2+3) = x⁵" 
        }
      },
      "algebra_factoring_polynomials": {
        "x(4x + 2)": { 
          type: "factoring_common_factor", 
          feedback: "Wyłącz pełny wspólny czynnik. Tu 4x² + 2x = 2x(2x + 1), bo największy wspólny czynnik to 2x" 
        },
        "(x + 3)(x - 2)": { 
          type: "factoring_sign_error", 
          feedback: "Sprawdź znaki: szukamy dwóch liczb, które dają iloczyn -6 i sumę -1. To -3 i +2, więc (x-3)(x+2)" 
        }
      },
      "algebra_rational_simplification": {
        "2/5": { 
          type: "cancel_terms_in_sum", 
          feedback: "Nie można skracać przez pojedyncze składniki sumy. (x+2)/(x+5) nie ma wspólnych czynników do skrócenia" 
        }
      },
      "algebra_rational_addition_subtraction": {
        "2/(2x+5)": { 
          type: "add_denominators", 
          feedback: "Nie dodajesz mianowników! Sprowadź do wspólnego mianownika: 1/(x+2) + 1/(x+3) = [(x+3)+(x+2)]/[(x+2)(x+3)] = (2x+5)/[(x+2)(x+3)]" 
        }
      },
      "algebra_rational_multiplication_division": {
        "3/8": { 
          type: "no_reciprocal", 
          feedback: "Przy dzieleniu przez ułamek mnożysz przez jego odwrotność: (1/2) : (3/4) = (1/2) · (4/3) = 4/6 = 2/3" 
        }
      }
    };

    return misconceptionMaps[microSkill] || {};
  }
}