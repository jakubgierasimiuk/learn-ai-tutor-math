// Pedagogical Instruction Builder
// Creates comprehensive AI instructions based on cognitive analysis

import { TeachingMoment, StudentResponsePattern, FlowStateIndicators, StudentProfile } from './adaptivePedagogy.ts';

export function buildPedagogicalInstructions(
  teachingMoment: TeachingMoment,
  responsePattern: StudentResponsePattern,
  flowState: FlowStateIndicators,
  cognitiveProfile: StudentProfile,
  needsMicroBreak: boolean,
  isPseudoActivity: boolean
): string {

  let instructions = `INSTRUKCJE_PEDAGOGICZNE - ADAPTACYJNA REAKCJA:

GŁÓWNA STRATEGIA: ${teachingMoment.pedagogicalStrategy}
${teachingMoment.message}

KONTEKST POZNAWCZY:
- Wzorzec odpowiedzi: ${responsePattern}
- Styl kognitywny: ${cognitiveProfile.cognitiveStyle}
- ZPD alignment: ${Math.round(teachingMoment.zpdAlignment * 100)}%
- Obciążenie poznawcze: ${flowState.perceivedChallenge}/10
- Poziom zaangażowania: ${Math.round(flowState.engagementLevel * 100)}%
- Poziom frustracji: ${Math.round(flowState.frustrationLevel * 100)}%`;

  // Age-appropriate communication style
  if (cognitiveProfile.ageGroup === 'elementary') {
    instructions += `\n\nSTYL KOMUNIKACJI: Prosty język, krótkie zdania, pozytywne wzmocnienie. Unikaj skomplikowanej terminologii.`;
  } else if (cognitiveProfile.ageGroup === 'high_school') {
    instructions += `\n\nSTYL KOMUNIKACJI: Precyzyjny, analityczny. Można używać terminologii matematycznej.`;
  }

  // Specific pedagogical strategy instructions
  switch (teachingMoment.pedagogicalStrategy) {
    case 'fading':
      instructions += `\n\nSTRATEGIA FADING: Stopniowo zmniejszaj pomoc. Zacznij od konkretnej wskazówki, potem prowadź pytaniami.`;
      break;
    case 'example-problem':
      instructions += `\n\nSTRATEGIA WORKED EXAMPLE: Najpierw pokaż podobny rozwiązany przykład, potem poproś o analogiczne rozwiązanie.`;
      break;
    case 'self-explanation':
      instructions += `\n\nSTRATEGIA SELF-EXPLANATION: Poproś ucznia o wyjaśnienie swojego rozumowania własnymi słowami.`;
      break;
    case 'contrasting':
      instructions += `\n\nSTRATEGIA CONTRASTING: Pokaż różnicę między poprawnym a niepoprawnym podejściem.`;
      break;
    case 'cognitive-conflict':
      instructions += `\n\nSTRATEGIA COGNITIVE CONFLICT: Zwróć uwagę na sprzeczność w rozumowaniu ucznia.`;
      break;
    case 'bridging':
      instructions += `\n\nSTRATEGIA BRIDGING: Połącz nową wiedzę z tym, co uczeń już wie.`;
      break;
    case 'reinforcement':
      instructions += `\n\nSTRATEGIA REINFORCEMENT: Wzmocnij poprawne rozumienie przez dodatkowe przykłady.`;
      break;
  }

  // Flow state optimization
  switch (teachingMoment.flowStateOptimization) {
    case 'increase_challenge':
      instructions += `\n\nOPTYMALIZACJA FLOW: Zwiększ wyzwanie - uczeń jest gotowy na trudniejsze zadania.`;
      break;
    case 'decrease_challenge':
      instructions += `\n\nOPTYMALIZACJA FLOW: Obniż poziom trudności - uczeń może być przeciążony.`;
      break;
    case 'micro_break':
      instructions += `\n\nOPTYMALIZACJA FLOW: Zasugeruj krótką przerwę lub zmianę aktywności.`;
      break;
  }

  // Micro-break recommendation
  if (needsMicroBreak) {
    const breakSuggestion = cognitiveProfile.ageGroup === 'elementary' 
      ? 'Może czas na krótką przerwę? Można się przeciągnąć lub napić wody.'
      : 'Warto zrobić chwilę przerwy, żeby lepiej się skoncentrować na kolejnym zadaniu.';
    instructions += `\n\nPRZERWA: ${breakSuggestion}`;
  }

  // Pseudo-activity warning
  if (isPseudoActivity) {
    instructions += `\n\nUWAGA PSEUDO-AKTYWNOŚĆ: Uczeń odpowiada zbyt szybko. Poproś o dokładniejsze przemyślenie lub wyjaśnienie rozumowania.`;
  }

  // Difficulty adjustment
  if (teachingMoment.difficultyAdjustment !== 0) {
    const adjustment = teachingMoment.difficultyAdjustment > 0 ? 'zwiększ' : 'zmniejsz';
    instructions += `\n\nDOSTOSOWANIE TRUDNOŚCI: ${adjustment} poziom trudności o ${Math.abs(teachingMoment.difficultyAdjustment)} punkty.`;
  }

  // Intervention sequence for complex errors
  if (teachingMoment.interventionSequence && teachingMoment.interventionSequence.length > 0) {
    instructions += `\n\nSEKWENCJA INTERWENCJI: ${teachingMoment.interventionSequence.join(' → ')}`;
  }

  return instructions;
}

// Build age-appropriate feedback messages
export function buildAgeFeedback(
  message: string, 
  ageGroup: 'elementary' | 'middle' | 'high_school',
  isPositive: boolean
): string {
  
  if (ageGroup === 'elementary') {
    if (isPositive) {
      return message.replace(/Doskonale|Świetnie/, 'Super!').replace(/poprawnie/, 'dobrze');
    } else {
      return message.replace(/Spróbuj ponownie/, 'Spróbuj jeszcze raz');
    }
  } else if (ageGroup === 'high_school') {
    if (isPositive) {
      return message.replace(/Super!/, 'Doskonała praca');
    }
  }
  
  return message; // middle school uses default
}

// Build misconception-specific intervention
export function buildMisconceptionIntervention(
  misconceptionType: string,
  ageGroup: 'elementary' | 'middle' | 'high_school'
): string[] {
  
  const interventions: Record<string, string[]> = {
    'fraction_addition': [
      ageGroup === 'elementary' 
        ? 'Czy pamiętasz regułę dodawania ułamków? Potrzebujemy takiego samego mianownika.'
        : 'Sprawdź: czy ułamki mają wspólny mianownik przed dodawaniem?',
      'Spróbuj znaleźć wspólny mianownik dla tych ułamków.',
      'Teraz dodaj liczniki, zachowując wspólny mianownik.'
    ],
    'negative_distribution': [
      'Co się dzieje ze znakami, gdy rozkładamy minus przed nawiasem?',
      'Minus zmienia znak każdego składnika w nawiasie.',
      'Przepisz wyrażenie z prawidłowymi znakami.'
    ],
    'equation_balance': [
      'Pamiętaj zasadę równania: co robisz z jedną stroną, musisz zrobić z drugą.',
      'Pokaż mi krok po kroku, jak przeniesiesz tę liczbę na drugą stronę.',
      'Sprawdź swoje rozwiązanie, podstawiając je do pierwotnego równania.'
    ]
  };
  
  return interventions[misconceptionType] || [
    'Przeanalizujmy to zadanie krok po kroku.',
    'Gdzie może być błąd w Twoim rozumowaniu?',
    'Spróbuj innego podejścia do tego problemu.'
  ];
}