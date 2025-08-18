# Content Database Generator for AI Math Tutor - Production Prompt

## System Context

You are generating a comprehensive content database for an AI Math Tutor platform used in Polish schools. This system serves grades 4-8 with adaptive pedagogy and real-time misconception detection.

### Existing System Integration

The platform uses:
- **Universal Task Generators** with specific microSkills
- **Adaptive Difficulty Controller** (levels 1-10)
- **Misconception Detection** via string pattern matching
- **Phase-Based Learning** (3 phases: Introduction, Practice, Mastery)
- **LaTeX Rendering** for mathematical expressions
- **Time Analytics** in seconds for performance tracking

## Required JSON Output Format

Generate a complete `contentDatabase` object with exactly 20 skills (4 from each grade 4-8):

```json
{
  "contentDatabase": [
    {
      "skillId": "uuid-string",
      "skillName": "string (max 60 chars)",
      "class_level": 4,
      "department": "mathematics",
      "generatorParams": {
        "microSkill": "string from whitelist OR 'default'",
        "difficultyRange": [1, 5],
        "fallbackTrigger": "string pattern"
      },
      "teachingFlow": {
        "phase1": {
          "name": "Wprowadzenie",
          "duration": 900,
          "activities": ["theory", "guided_examples"]
        },
        "phase2": {
          "name": "Ćwiczenia",
          "duration": 1200,
          "activities": ["practice", "feedback"]
        },
        "phase3": {
          "name": "Utrwalanie", 
          "duration": 600,
          "activities": ["mastery_tasks", "assessment"]
        }
      },
      "content": {
        "theory": {
          "introduction": "string (max 100 words)",
          "keyConceptsLaTex": ["$inline$ (max 50 chars each)"],
          "visualAids": ["description (max 30 words each)"]
        },
        "examples": [
          {
            "title": "string (max 40 chars)",
            "problem": "string with $inline LaTeX$ (max 80 chars)",
            "solution": {
              "steps": [
                {
                  "step": "string (max 25 words)",
                  "latex": "$inline$ (max 50 chars)",
                  "explanation": "string (max 50 words)"
                }
              ]
            },
            "timeEstimate": 120
          }
        ],
        "practiceExercises": [
          {
            "exerciseId": "string",
            "difficulty": 1,
            "problem": "string with $inline LaTeX$ (max 80 chars)",
            "expectedAnswer": "string",
            "hints": [
              {
                "level": 1,
                "hint": "string (max 40 words)",
                "timeEstimate": 60
              }
            ],
            "timeEstimate": 180
          }
        ]
      },
      "pedagogicalNotes": {
        "commonMistakes": ["string (max 50 words each)"],
        "teachingTips": ["string (max 60 words each)"],
        "prerequisites": ["skillRef or topic"],
        "estimatedTime": 2700,
        "difficultyProgression": "string (max 80 words)"
      },
      "misconceptionPatterns": [
        {
          "pattern": "incorrect_answer_string",
          "description": "string (max 60 words)",
          "feedback": "string (max 80 words)",
          "remediation": "string (max 100 words)"
        }
      ],
      "realWorldApplications": [
        {
          "context": "string (age-appropriate, max 40 words)",
          "example": "string (max 80 words)",
          "practicalUse": "string (max 60 words)"
        }
      ],
      "assessmentRubric": {
        "scope": "Ocena zestawu 10 zadań testowych",
        "criteria": [
          {
            "skill": "string",
            "beginner": "string (max 40 words)",
            "intermediate": "string (max 40 words)", 
            "advanced": "string (max 40 words)"
          }
        ]
      }
    }
  ]
}
```

## Critical Technical Specifications

### 1. Generator Integration (MANDATORY)

**MicroSkill Whitelist** (use EXACTLY these values or "default"):
```
Algebra: ["linear_equations", "quadratic_equations", "factoring", "default"]
Geometry: ["area_perimeter", "angles", "transformations", "default"]
Real Numbers: ["basic_operations", "fractions", "decimals", "default"]
Functions: ["linear_functions", "graphing", "domain_range", "default"]
Sequences: ["arithmetic", "geometric", "patterns", "default"]
Trigonometry: ["basic_ratios", "unit_circle", "identities", "default"]
Calculus: ["derivatives", "integrals", "applications", "default"]
Statistics: ["probability", "descriptive", "combinatorics", "default"]
```

**Validation Rules:**
- If microSkill not in whitelist → use "default"
- difficultyRange: [min, max] where 1 ≤ min < max ≤ 10
- fallbackTrigger: simple string (NO regex patterns)

### 2. LaTeX Formatting (CRITICAL)

**Strict Rules:**
- ONLY inline LaTeX: `$expression$` 
- NO display math: `$$expression$$` or `\[expression\]`
- Maximum 50 characters per LaTeX expression
- NO nested LaTeX expressions
- NO complex commands (only basic: +, -, *, /, ^, _, \frac, \sqrt)

**Examples:**
✅ CORRECT: `$2x + 3 = 7$`, `$\frac{1}{2}$`, `$x^2$`
❌ WRONG: `$$\int_0^1 x dx$$`, `$\frac{\sqrt{x+1}}{2x^2-\frac{1}{3}}$`

### 3. Time Standardization (MANDATORY)

**All times in SECONDS:**
- theory.timeEstimate: 60-300 seconds
- examples[].timeEstimate: 60-180 seconds  
- practiceExercises[].timeEstimate: 120-300 seconds
- hints[].timeEstimate: 30-120 seconds
- pedagogicalNotes.estimatedTime: total for skill (1800-3600 seconds)
- teachingFlow phases duration: seconds

### 4. Content Length Limits (ENFORCED)

**Word Limits:**
- theory.introduction: max 100 words
- solution.steps[].step: max 25 words
- solution.steps[].explanation: max 50 words
- commonMistakes[]: max 50 words each
- teachingTips[]: max 60 words each

### 5. Error Prevention (CRITICAL)

**Misconception Patterns:**
- Use simple string matching (NO regex)
- pattern: exact incorrect answer string
- If uncertain → use empty string ""

**Fallback Strategy:**
- If content generation fails → provide minimal valid structure
- Always include "default" microSkill option
- Empty arrays better than invalid data

## Content Creation Methodology

### Skill Selection Criteria

Choose skills that are:
1. **Core Curriculum Aligned** - Essential for Polish math standards
2. **Misconception Rich** - Common student errors identifiable
3. **Progressively Structured** - Clear difficulty levels
4. **Generator Compatible** - Match existing microSkills

### Quality Standards

**Theory Section:**
- Clear, concise explanations in Polish
- Age-appropriate language and examples
- Visual aid descriptions for complex concepts
- Key concepts highlighted with LaTeX

**Examples:**
- Step-by-step solutions with clear reasoning
- Polish mathematical terminology
- Increasing complexity within each skill
- Time estimates based on average student performance

**Practice Exercises:**
- Varied problem types testing different aspects
- Clear, unambiguous problem statements
- Realistic time estimates for completion
- Progressive difficulty levels

### Pedagogical Enhancement

**Common Mistakes:**
- Research-based frequent errors
- Clear explanations of why mistakes occur
- Polish-specific mathematical misconceptions
- Age-appropriate error patterns

**Teaching Tips:**
- Evidence-based pedagogical strategies
- Polish classroom context awareness
- Differentiation suggestions for various learners
- Technology integration tips

**Real World Applications:**
- Polish cultural context and examples
- Age-appropriate scenarios and interests
- Practical applications students can relate to
- Career connections where appropriate

## Priority Skills List (4 per grade)

### Grade 4 (class_level: 4)
1. **Podstawowe działania na liczbach naturalnych** (department: "real_numbers")
2. **Ułamki zwykłe - wprowadzenie** (department: "real_numbers") 
3. **Figury geometryczne i ich właściwości** (department: "geometry")
4. **Jednostki miary i ich przeliczanie** (department: "real_numbers")

### Grade 5 (class_level: 5)
1. **Ułamki dziesiętne** (department: "real_numbers")
2. **Pole i obwód prostokąta** (department: "geometry")
3. **Równania z jedną niewiadomą** (department: "algebra")
4. **Proporcjonalność** (department: "algebra")

### Grade 6 (class_level: 6)
1. **Liczby ujemne** (department: "real_numbers")
2. **Procenty** (department: "real_numbers")
3. **Kąty i ich miary** (department: "geometry")
4. **Wyrażenia algebraiczne** (department: "algebra")

### Grade 7 (class_level: 7)
1. **Funkcja liniowa** (department: "functions")
2. **Przekształcenia geometryczne** (department: "geometry")
3. **Równania liniowe z jedną niewiadomą** (department: "algebra")
4. **Prawdopodobieństwo** (department: "statistics")

### Grade 8 (class_level: 8)
1. **Funkcja kwadratowa** (department: "functions")
2. **Twierdzenie Pitagorasa** (department: "geometry")
3. **Układy równań liniowych** (department: "algebra")
4. **Statystyka opisowa** (department: "statistics")

## Mandatory Checks

### Before Submission
1. ✅ All 20 skills present (4 per grade)
2. ✅ All microSkills from whitelist or "default"
3. ✅ All LaTeX expressions inline and < 50 chars
4. ✅ All times in seconds
5. ✅ Word limits respected
6. ✅ No regex patterns in misconceptionPatterns
7. ✅ Valid JSON syntax
8. ✅ Polish language throughout
9. ✅ class_level field used (not grade)
10. ✅ All required fields present

### Error Prevention
- Validate JSON structure before returning
- Check LaTeX syntax (basic expressions only)
- Verify time values are integers in seconds
- Ensure misconception patterns are simple strings
- Confirm all arrays contain valid objects
- Test that content meets length requirements

## Final Deliverable

Return ONLY the complete JSON object with all 20 skills. No additional text, explanations, or formatting. The JSON must be production-ready and immediately usable by the system.

**Remember:** This content will be used by real students and teachers. Quality, accuracy, and Polish curriculum alignment are essential.