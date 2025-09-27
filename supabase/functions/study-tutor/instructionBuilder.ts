// Pedagogical Instruction Builder
// Creates comprehensive AI instructions based on cognitive analysis

interface BuildInstructionsParams {
  mathValidation: any;
  cognitiveAnalysis: any;
  flowState: any;
  cognitiveProfile: any;
  sessionContext: {
    turnNumber: number;
    targetDifficulty: string;
    isPseudoActivity: boolean;
    isFirstMessage: boolean;
    skillId: string;
    department: string;
  };
  adaptiveRecommendations: {
    pedagogicalStrategy: string;
    difficultyAdjustment: number;
    zpd_alignment: number;
    shouldTakeBreak: boolean;
  };
}

export function buildPedagogicalInstructions(params: BuildInstructionsParams): string {
  const { 
    mathValidation, 
    cognitiveAnalysis, 
    flowState, 
    cognitiveProfile, 
    sessionContext, 
    adaptiveRecommendations 
  } = params;

  let instructions = "INSTRUKCJE_PEDAGOGICZNE - ADAPTACYJNA REAKCJA:\n\n=== KONTEKST MATEMATYCZNY ===\n- Odpowiedz ucznia: " + (mathValidation.isCorrect ? 'POPRAWNA ✓' : 'NIEPOPRAWNA ✗') + "\n- Pewnosc walidacji: " + Math.round(mathValidation.confidence * 100) + "%\n- Wykryte bledne rozumienie: " + (mathValidation.detectedMisconception || 'brak') + "\n- Feedback matematyczny: " + (mathValidation.feedback || 'standardowy') + "\n\n=== ANALIZA KOGNITYWNA ===\n- Wzorzec odpowiedzi: " + cognitiveAnalysis.responsePattern + "\n- Poziom pewnosci ucznia: " + Math.round(cognitiveAnalysis.confidenceLevel * 100) + "%\n- Moment nauczania: " + cognitiveAnalysis.teachingMoment.type + "\n- Rekomendowana akcja: " + cognitiveAnalysis.teachingMoment.nextAction + "\n\n=== STAN FLOW I ZAANGAZOWANIE ===\n- Poziom zaangazowania: " + Math.round((flowState.engagementLevel || 0.5) * 100) + "%\n- Poziom frustracji: " + Math.round((flowState.frustrationLevel || 0) * 100) + "%\n- Wyzwanie vs. umiejetnosci: " + (flowState.perceivedChallenge || 'srednie') + "\n- ZPD alignment: " + Math.round(adaptiveRecommendations.zpd_alignment * 100) + "%\n";

  
  
  // Strategia pedagogiczna
  const strategy = adaptiveRecommendations.pedagogicalStrategy;
  if (strategy) {
    instructions += "\n\n=== STRATEGIA PEDAGOGICZNA ===\nGlowna strategia: " + strategy.toUpperCase();
    
    switch (strategy) {
      case 'fading':
        instructions += "\nSTRATEGIA FADING: Stopniowo zmniejszaj pomoc. Zacznij od konkretnej wskazowki, potem prowadz pytaniami.";
        break;
      case 'worked_example':
        instructions += "\nSTRATEGIA WORKED EXAMPLE: Najpierw pokaz podobny rozwiazany przyklad, potem popros o analogiczne rozwiazanie.";
        break;
      case 'self_explanation':
        instructions += "\nSTRATEGIA SELF-EXPLANATION: Popros ucznia o wyjasnienie swojego rozumowania wlasnymi slowami.";
        break;
      case 'contrasting_cases':
        instructions += "\nSTRATEGIA CONTRASTING: Pokaz roznice miedzy poprawnym a niepoprawnym podejsciem.";
        break;
      case 'cognitive_conflict':
        instructions += "\nSTRATEGIA COGNITIVE CONFLICT: Zwroc uwage na sprzecznosc w rozumowaniu ucznia.";
        break;
      case 'bridging':
        instructions += "\nSTRATEGIA BRIDGING: Polacz nowa wiedze z tym, co uczen juz wie.";
        break;
      case 'reinforcement':
        instructions += "\nSTRATEGIA REINFORCEMENT: Wzmocnij poprawne rozumienie przez dodatkowe przyklady.";
        break;
      default:
        instructions += "\nUzyj adaptacyjnego podejscia dostosowanego do potrzeb ucznia.";
    }
  }

  // Optymalizacja trudności
  const difficultyAdj = adaptiveRecommendations.difficultyAdjustment;
  if (Math.abs(difficultyAdj) > 0.1) {
    const adjustment = difficultyAdj > 0 ? 'ZWIEKSZ' : 'ZMNIEJSZ';
    instructions += "\n\n=== DOSTOSOWANIE TRUDNOSCI ===\n" + adjustment + " poziom trudnosci o " + Math.abs(difficultyAdj).toFixed(1) + " punkty.";
    
    if (difficultyAdj > 0) {
      instructions += "\nUczen jest gotowy na wieksze wyzwanie. Wprowadz bardziej skomplikowane problemy.";
    } else {
      instructions += "\nUczen moze byc przeciazony. Upros zadania i zapewnij wiecej wsparcia.";
    }
  }

  // Style komunikacji dostosowane do wieku
  if (cognitiveProfile.ageGroup) {
    instructions += "\n\n=== STYL KOMUNIKACJI ===";
    if (cognitiveProfile.ageGroup === 'elementary') {
      instructions += "\nProsty jezyk, krotkie zdania, pozytywne wzmocnienie. Unikaj skomplikowanej terminologii.";
    } else if (cognitiveProfile.ageGroup === 'middle_school') {
      instructions += "\nJasne wyjasnienia z przykladami. Mozesz uzyc podstawowej terminologii matematycznej.";
    } else if (cognitiveProfile.ageGroup === 'high_school') {
      instructions += "\nPrecyzyjny, analityczny jezyk. Uzywaj odpowiedniej terminologii matematycznej.";
    }
  }

  // Rekomendacja przerwy
  if (adaptiveRecommendations.shouldTakeBreak) {
    const breakSuggestion = cognitiveProfile.ageGroup === 'elementary' 
      ? 'Moze czas na krotka przerwe? Mozna sie przeciagnac lub napic wody.'
      : 'Warto zrobic chwile przerwy, zeby lepiej sie skoncentrowac na kolejnym zadaniu.';
    instructions += "\n\n=== REKOMENDACJA PRZERWY ===\n" + breakSuggestion;
  }

  // Ostrzeżenie o pseudo-aktywności
  if (sessionContext.isPseudoActivity) {
    instructions += "\n\n=== UWAGA PSEUDO-AKTYWNOSC ===\nUczen odpowiada zbyt szybko (czas < " + (cognitiveProfile.averageResponseTime * 0.4) + "ms). Popros o dokladniejsze przemyslenie lub wyjasnienie rozumowania.";
  }

  // Kontekst sesji
  instructions += "\n\n=== KONTEKST SESJI ===\n- Numer kroku: " + sessionContext.turnNumber + "\n- Docelowa trudnosc: " + sessionContext.targetDifficulty + "\n- Dzial: " + sessionContext.department + "\n- Pierwsza wiadomosc: " + (sessionContext.isFirstMessage ? 'TAK' : 'NIE');

  // Specjalne instrukcje dla pierwszej wiadomości
  if (sessionContext.isFirstMessage) {
    instructions += "\n\n=== INSTRUKCJE POCZATKOWE ===\nTo pierwsza interakcja w tej sesji. Przywitaj ucznia i przedstaw zadanie w sposob motywujacy.";
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