# PROMPT DLA ChatGPT: Executable Task Generator dla Ciągów Arytmetycznych

## INSTRUKCJA GŁÓWNA
Dostarcz **kompletny, executable TypeScript kod** dla generatora zadań z ciągów arytmetycznych z misconception targeting. NIE CHCĘ dokumentacji JSON - chcę działający kod który mogę wkleić do projektu.

## CO MUSISZ DOSTARCZYĆ (EXECUTABLE CODE):

### 1. CORE INTERFACES (TypeScript)
```typescript
// Przykład struktury - rozwiń to:
interface TaskDefinition {
  id: string;
  skillName: string;
  microSkill: string;
  taskType: string;
  difficulty: number; // 0.1-10.0
  latex: string;
  expectedAnswer: string | number;
  solution: {
    steps: string[];
    explanation: string;
    commonMistakes: string[];
  };
  misconceptionMap?: {
    [incorrectAnswer: string]: {
      misconceptionType: string;
      feedback: string;
      remediation: string[];
    };
  };
  distractorAnswers?: string[];
  metadata: {
    estimatedTime: number;
    prerequisites: string[];
    nextTopics: string[];
  };
}
```

### 2. TASK GENERATOR CLASS (kompletna implementacja)
```typescript
class ArithmeticSequenceTaskGenerator {
  // MUSISZ ZAIMPLEMENTOWAĆ:
  generateTask(params: TaskGenerationParams): TaskDefinition
  generateMisconceptionTask(targetMisconception: string): TaskDefinition
  generateProgressiveTask(currentLevel: number): TaskDefinition
  // + inne metody
}
```

### 3. MISCONCEPTION DATABASE (executable)
- Kompletna lista 8-10 najczęstszych błędów w ciągach arytmetycznych
- Dla każdego błędu: **algoritm generowania trap task**
- **Konkretne przykłady zadań** które wywołują błąd
- **Detection patterns** - jak rozpoznać błąd z odpowiedzi ucznia

### 4. DIFFICULTY PROGRESSION LOGIC (konkretny algorytm)
```typescript
// Nie chcę levels 1-10, chcę konkretny algorytm:
class DifficultyController {
  calculateNextDifficulty(
    currentLevel: number,
    isCorrect: boolean,
    responseTime: number,
    confidence: number
  ): number {
    // KONKRETNY ALGORYTM TUTAJ
  }
}
```

### 5. SEED-BASED GENERATION (deterministyczny)
```typescript
// Aby te same parametry dawały te same zadania:
generateTaskWithSeed(seed: string, params: TaskParams): TaskDefinition
```

### 6. ANSWER VALIDATION ENGINE
```typescript
class AnswerValidator {
  validateAnswer(userAnswer: string, task: TaskDefinition): ValidationResult
  detectMisconception(userAnswer: string, task: TaskDefinition): string | null
  // Konkretne algorytmy sprawdzania różnych typów odpowiedzi
}
```

## WYMAGANIA TECHNICZNE:

### ✅ MUSI BYĆ:
- **Kompletny TypeScript kod** - żadnych placeholder'ów
- **Działające algorytmy** - nie "// TODO: implement"
- **Konkretne przykłady** zadań dla każdego typu
- **Deterministyczne generowanie** - ten sam seed = to samo zadanie
- **Error handling** - co jeśli parametry są błędne
- **Type safety** - pełne typy TypeScript

### ✅ KONKRETNE ALGORITHMY DLA:
1. **Generowanie liczb**: Jak wybierać a₁, r, n aby zadanie miało określoną trudność
2. **Trap tasks**: Konkretne zadania które wywołują każdy błąd
3. **Validation**: Jak sprawdzać czy "23" to poprawna odpowiedź na "jaki jest 7. wyraz"
4. **Progression**: Matematyczny wzór na następny poziom trudności

### ✅ PRAKTYCZNE PRZYKŁADY:
```typescript
// Chcę móc zrobić:
const generator = new ArithmeticSequenceTaskGenerator();
const task = generator.generateTask({
  difficulty: 3.5,
  microSkill: "nth_term_calculation",
  targetMisconception: "confuses_nth_term_with_sum"
});
console.log(task.latex); // "Oblicz 7. wyraz ciągu..."
console.log(task.expectedAnswer); // "23"
```

## STRUKTURA ODPOWIEDZI:

1. **Interfaces.ts** - Wszystkie interfejsy TypeScript
2. **ArithmeticSequenceTaskGenerator.ts** - Główna klasa generatora  
3. **MisconceptionDatabase.ts** - Baza błędów z algorytmami
4. **AnswerValidator.ts** - Walidacja odpowiedzi
5. **DifficultyController.ts** - Logika trudności
6. **TaskExamples.ts** - Konkretne przykłady użycia

## ❌ NIE CHCĘ:
- Dokumentacji JSON
- Opisów "jak to powinno działać"  
- TODOs czy placeholder'ów
- Ogólnych zasad - chcę kod

## ✅ CHCĘ:
- **Działający kod który mogę skopiować**
- **Konkretne algorytmy i wzory**
- **Wszystkie edge case'y obsłużone**
- **Gotowe do integracji z systemem AI tutora**

---

**ROZPOCZNIJ OD:** Interfaces.ts i pokaż mi kompletny kod każdego pliku osobno.