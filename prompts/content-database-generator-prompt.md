# PROMPT FOR ChatGPT: Complete Content Database Generator for AI Math Tutor

## CONTEXT & SYSTEM OVERVIEW

You are creating a **Content Database** for an AI-powered math tutoring system in Poland. This system already has:

### Existing Components:
- **Dynamic Task Generator**: `MathTaskGenerator` with methods like `generateTask()`, `generateMisconceptionTask()`, `generateProgressiveTask()`
- **Answer Validator**: `UniversalAnswerValidator` for checking student responses
- **Difficulty Controller**: Adaptive system that adjusts task difficulty based on performance
- **Skills Database**: 192 mapped skills covering grades 4-8 of Polish MEN curriculum

### Your Mission:
Create **curated, high-quality content** that serves as:
1. **Canonical foundation** - guaranteed correct, curriculum-aligned content
2. **Fallback mechanism** - when AI generator fails or produces weird results
3. **Marketing proof** - "100% MEN curriculum coverage" with verified content
4. **Teaching structure** - pedagogically sound lesson flows

## REQUIRED JSON OUTPUT FORMAT

```json
{
  "contentDatabase": {
    "skills": [
      {
        "skillId": "skill_001",
        "skillName": "Dodawanie liczb naturalnych do 100",
        "grade": 4,
        "department": "arithmetic",
        "generatorParams": {
          "microSkill": "addition_basic",
          "difficultyRange": [1.0, 2.5],
          "fallbackTrigger": "when examples < 3 remaining"
        },
        "teachingFlow": [
          "theory",
          "example_guided", 
          "example_independent",
          "practice_easy",
          "practice_medium"
        ],
        "content": {
          "theory": {
            "introduction": "Krótkie wprowadzenie do tematu (max 100 słów)",
            "keyFormulas": ["$a + b = c$", "$12 + 5 = 17$"],
            "visualAids": ["Opis wizualizacji na kosteczkach/obrazkach"],
            "mnemonics": "Łatwe do zapamiętania tricki"
          },
          "examples": [
            {
              "id": "example_1",
              "type": "guided",
              "problem": "$15 + 23 = ?$",
              "solution": {
                "steps": [
                  "Zapisz liczby w słupku: jednostki pod jednostkami",
                  "Dodaj jednostki: $5 + 3 = 8$", 
                  "Dodaj dziesiątki: $1 + 2 = 3$",
                  "Wynik: $38$"
                ],
                "visualAids": "Opis manipulatyw/rysunków",
                "commonMistakes": ["Błędne ustawienie w słupku", "Pomylenie cyfr"]
              }
            },
            {
              "id": "example_2", 
              "type": "independent",
              "problem": "$27 + 19 = ?$",
              "expectedAnswer": "46",
              "hints": ["Pamiętaj o przeniesieniu", "Sprawdź czy dobrze dodałeś jednostki"]
            }
          ],
          "practiceExercises": [
            {
              "id": "practice_1",
              "difficulty": "easy",
              "problem": "$14 + 12 = ?$",
              "expectedAnswer": "26",
              "timeEstimate": 60,
              "scaffoldingQuestions": [
                {
                  "question": "Ile to jest $4 + 2$?",
                  "tag": "step_1_easy",
                  "purpose": "units_addition"
                }
              ]
            }
          ]
        },
        "pedagogicalNotes": {
          "prerequisiteCheck": {
            "skillRef": "skill_000",
            "description": "Uczeń musi znać cyfry 0-9 i ich wartość"
          },
          "nextTopicConnection": {
            "skillRef": "skill_002", 
            "description": "Prowadzi do odejmowania liczb naturalnych"
          },
          "scaffoldingQuestions": [
            {
              "question": "Ile palców masz na rękach?",
              "tag": "warm_up_easy",
              "purpose": "activate_prior_knowledge"
            },
            {
              "question": "Co się dzieje gdy dodajesz $9 + 3$?",
              "tag": "transition_medium", 
              "purpose": "prepare_for_carrying"
            }
          ],
          "differentiationStrategies": [
            "Dla uczniów z trudnościami: użyj manipulatyw (kostki, palce)",
            "Dla zdolnych: wprowadź dodawanie trzech liczb jednocześnie"
          ],
          "estimatedTime": 15,
          "learningObjectives": [
            "Uczeń potrafi dodać dwie liczby dwucyfrowe",
            "Uczeń rozumie pojęcie przeniesienia"
          ]
        },
        "misconceptionPatterns": [
          {
            "pattern": "uczeń dodaje cyfry niezależnie bez przeniesienia",
            "exampleError": "$29 + 15 = 314$ zamiast $44$",
            "explanation": "Uczeń traktuje dodawanie jako sklejanie cyfr",
            "remediation": "Pokazać na manipulatywach wartość pozycyjną",
            "detectionRegex": "^[0-9]{3,}$"
          }
        ],
        "realWorldApplications": [
          {
            "context": "Zakupy w sklepie", 
            "problem": "Masz 15 zł, kupiłeś zabawkę za 23 zł. Ile musisz dopłacić?",
            "ageGroup": "4-6",
            "difficulty": "medium"
          }
        ],
        "assessmentRubric": {
          "mastery": "Rozwiązuje 8/10 zadań bez błędu w czasie < 30s każde",
          "approaching": "Rozwiązuje 6/10 zadań, czasem potrzebuje pomocy",
          "developing": "Rozwiązuje 4/10 zadań, wymaga stałego wsparcia"
        }
      }
    ]
  }
}
```

## CRITICAL TECHNICAL SPECIFICATIONS

### 1. Generator Integration
- **generatorParams.microSkill** MUST match existing generator methods:
  - `real_numbers_basic_operations`, `algebraic_expressions_simplify`, `geometry_area_perimeter`, etc.
- **difficultyRange** must be numeric [min, max] compatible with `0.1-10.0` scale
- **fallbackTrigger** defines when to switch from content to generator

### 2. LaTeX Requirements (CRITICAL)
- **ONLY inline math**: `$formula$` - NO display math `$$formula$$`
- **Max 50 characters** per LaTeX string
- **No nested structures**: avoid `$a + \frac{b}{c} + d$`, split to `$a + b/c + d$`
- **Test compatibility**: must work with `react-markdown` + `rehype-katex`
- **Examples**: `$2x + 3 = 7$`, `$a^2 + b^2 = c^2$`, `$\frac{1}{2} + \frac{1}{3}$`

### 3. Teaching Flow Structure
- **Sequence MUST follow**: `["theory", "example_guided", "example_independent", "practice_easy", "practice_medium"]`
- **Purpose**: Implements "I do → We do → You do" pedagogy
- **AI Tutor** will follow this exact sequence during lessons

### 4. Pedagogical Notes Enhancement
- **prerequisiteCheck.skillRef**: MUST reference another skill ID from the system
- **scaffoldingQuestions.tag**: Use format `step_X_difficulty` or `purpose_difficulty`
- **nextTopicConnection.skillRef**: Link to logical next skill in learning progression

### 5. Misconception Patterns (Advanced)
- **pattern**: Describe the logical error, not just wrong answer
- **detectionRegex**: Pattern to catch similar errors programmatically
- **remediation**: Specific teaching strategy to fix the misconception

### 6. Real World Applications (Age-Appropriate)
- **Grades 4-6**: Concrete, familiar contexts (pocket money, school supplies, sports)
- **Grades 7-8**: More abstract, career-related (business, science, technology)
- **ageGroup** and **difficulty** tags for AI to choose appropriately

## CONTENT CREATION METHODOLOGY

### 1. Skill Selection (20 Skills Total)
Create content for **4 skills per grade** (4, 5, 6, 7, 8), focusing on:
- **Core foundational skills** that other skills depend on
- **High-frequency topics** that appear in Polish standardized tests
- **Common struggle areas** where students typically make mistakes

### 2. Quality Standards
- **Theory**: Max 100 words, conversational tone, avoid academic jargon
- **Examples**: 2-4 per skill, increasing difficulty, step-by-step solutions
- **Practice**: 3-5 exercises per skill, varied difficulty, 30-120 seconds each
- **Real-world**: 2-3 applications per skill, culturally relevant to Poland

### 3. Curriculum Alignment
- **Follow MEN standards** for each grade level
- **Use Polish mathematical terminology** 
- **Include topics from popular textbooks**: "Matematyka z plusem", "Nowa Era"
- **Match assessment criteria** used in Polish schools

## SKILL PRIORITY LIST (Create these 20)

### Grade 4 (4 skills):
- `skill_001`: Dodawanie liczb naturalnych do 100
- `skill_002`: Odejmowanie liczb naturalnych do 100
- `skill_003`: Mnożenie tabliczki 1-10
- `skill_004`: Figury geometryczne podstawowe

### Grade 5 (4 skills):
- `skill_005`: Ułamki zwykłe - pojęcie i porównywanie
- `skill_006`: Działania na ułamkach dziesiętnych
- `skill_007`: Pole i obwód prostokąta
- `skill_008`: Procenty - pojęcie i podstawowe obliczenia

### Grade 6 (4 skills):
- `skill_009`: Równania liniowe z jedną niewiadomą
- `skill_010`: Współrzędności na płaszczyźnie
- `skill_011`: Bryły geometryczne - objętość
- `skill_012`: Proporcjonalność prosta

### Grade 7 (4 skills):
- `skill_013`: Liczby wymierne - działania
- `skill_014`: Wyrażenia algebraiczne - upraszczanie
- `skill_015`: Funkcja liniowa - wykres i własności
- `skill_016`: Twierdzenie Pitagorasa

### Grade 8 (4 skills):
- `skill_017`: Równania kwadratowe
- `skill_018`: Funkcja kwadratowa - podstawy
- `skill_019`: Statystyka opisowa
- `skill_020`: Prawdopodobieństwo klasyczne

## VALIDATION & QUALITY ASSURANCE

### Mandatory Checks:
1. **LaTeX validation**: All formulas must render in KaTeX online tester
2. **Curriculum verification**: Each skill matches MEN basic curriculum requirements
3. **Difficulty progression**: Practice exercises increase logically in complexity
4. **Cross-references**: All skillRef links point to valid skills in the set
5. **Language consistency**: Polish mathematical terminology throughout
6. **Time estimates**: Realistic for target age group (30-120 seconds per task)

### Error Prevention:
- **No placeholder text**: Every field must have real, usable content
- **No English**: Everything in Polish except technical field names
- **No broken LaTeX**: Test every formula before including
- **Consistent IDs**: skill_001, skill_002, etc. with zero-padding

## DELIVERABLE

Provide **complete, production-ready JSON** with all 20 skills following the exact format above. Each skill must be:
- ✅ Complete (no TODOs or placeholders)
- ✅ Curriculum-accurate for Polish schools
- ✅ Pedagogically sound (proper learning progression)
- ✅ Technically compatible (LaTeX, generator params)
- ✅ Quality-assured (realistic timing, appropriate difficulty)

**START WITH THE JSON BLOCK - NO INTRODUCTION OR EXPLANATION NEEDED.**