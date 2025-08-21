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

  let instructions = `INSTRUKCJE_PEDAGOGICZNE - ADAPTACYJNA REAKCJA:

=== KONTEKST MATEMATYCZNY ===
- Odpowiedź ucznia: ${mathValidation.isCorrect ? 'POPRAWNA ✓' : 'NIEPOPRAWNA ✗'}
- Pewność walidacji: ${Math.round(mathValidation.confidence * 100)}%
- Wykryte błędne rozumienie: ${mathValidation.detectedMisconception || 'brak'}
- Feedback matematyczny: ${mathValidation.feedback || 'standardowy'}

=== ANALIZA KOGNITYWNA ===
- Wzorzec odpowiedzi: ${cognitiveAnalysis.responsePattern}
- Poziom pewności ucznia: ${Math.round(cognitiveAnalysis.confidenceLevel * 100)}%
- Moment nauczania: ${cognitiveAnalysis.teachingMoment.type}
- Rekomendowana akcja: ${cognitiveAnalysis.teachingMoment.nextAction}

=== STAN FLOW I ZAANGAŻOWANIE ===
- Poziom zaangażowania: ${Math.round((flowState.engagementLevel || 0.5) * 100)}%
- Poziom frustracji: ${Math.round((flowState.frustrationLevel || 0) * 100)}%
- Wyzwanie vs. umiejętności: ${flowState.perceivedChallenge || 'średnie'}
- ZPD alignment: ${Math.round(adaptiveRecommendations.zpd_alignment * 100)}%

=== PROFIL KOGNITYWNY UCZNIA ===
- Grupa wiekowa: ${cognitiveProfile.ageGroup || 'nieznana'}
- Styl kognitywny: ${cognitiveProfile.cognitiveStyle || 'analityczny'}
- Średni czas odpowiedzi: ${(cognitiveProfile.averageResponseTime || cognitiveProfile.responseTime || 0)}ms
- Wskaźnik poprawności: ${Math.round((cognitiveProfile.correctnessRate || 0.5) * 100)}%
- Pamięć robocza: ${cognitiveProfile.workingMemoryCapacity || 'nieznana'} elementów
- Szybkość przetwarzania: ${cognitiveProfile.processingSpeed || 'nieznana'} percentyl

=== ZAAWANSOWANA INTELIGENCJA UCZNIA ===
- Pojemność kognitywna: ${cognitiveProfile.cognitiveLoadCapacity || 'brak danych'}/${cognitiveProfile.cognitiveLoadThreshold || 7}
- Poziom emocjonalny bazowy: ${cognitiveProfile.emotionalBaseline ? Math.round(cognitiveProfile.emotionalBaseline * 100) + '%' : 'nieznany'}
- Próg stresu: ${cognitiveProfile.stressThreshold ? Math.round(cognitiveProfile.stressThreshold * 100) + '%' : 'nieznany'}
- Umiejętności planowania: ${cognitiveProfile.planningSkills || 'brak danych'}/5
- Umiejętności monitorowania: ${cognitiveProfile.monitoringSkills || 'brak danych'}/5
- Aktywne błędne rozumienia: ${cognitiveProfile.activeMisconceptions?.join(', ') || 'brak'}
- Ostatnie emocje: ${cognitiveProfile.recentEmotions?.join(', ') || 'brak danych'}`;
  
  // Enhanced cognitive guidance based on advanced data
  if (cognitiveProfile.recentEmotions?.includes('frustration')) {
    instructions += `

⚠️ ALERT: Wykryto frustrację - zastosuj strategię uspokojenia i uproszenia`;
  }
  
  if (cognitiveProfile.activeMisconceptions?.length > 0) {
    instructions += `

⚠️ ALERT: Aktywne błędne rozumienia wymagają interwencji: ${cognitiveProfile.activeMisconceptions.join(', ')}`;
  }
  
  
  // Strategia pedagogiczna
  const strategy = adaptiveRecommendations.pedagogicalStrategy;
  if (strategy) {
    instructions += `\n\n=== STRATEGIA PEDAGOGICZNA ===\nGłówna strategia: ${strategy.toUpperCase()}`;
    
    switch (strategy) {
      case 'fading':
        instructions += `\nSTRATEGIA FADING: Stopniowo zmniejszaj pomoc. Zacznij od konkretnej wskazówki, potem prowadź pytaniami.`;
        break;
      case 'worked_example':
        instructions += `\nSTRATEGIA WORKED EXAMPLE: Najpierw pokaż podobny rozwiązany przykład, potem poproś o analogiczne rozwiązanie.`;
        break;
      case 'self_explanation':
        instructions += `\nSTRATEGIA SELF-EXPLANATION: Poproś ucznia o wyjaśnienie swojego rozumowania własnymi słowami.`;
        break;
      case 'contrasting_cases':
        instructions += `\nSTRATEGIA CONTRASTING: Pokaż różnicę między poprawnym a niepoprawnym podejściem.`;
        break;
      case 'cognitive_conflict':
        instructions += `\nSTRATEGIA COGNITIVE CONFLICT: Zwróć uwagę na sprzeczność w rozumowaniu ucznia.`;
        break;
      case 'bridging':
        instructions += `\nSTRATEGIA BRIDGING: Połącz nową wiedzę z tym, co uczeń już wie.`;
        break;
      case 'reinforcement':
        instructions += `\nSTRATEGIA REINFORCEMENT: Wzmocnij poprawne rozumienie przez dodatkowe przykłady.`;
        break;
      default:
        instructions += `\nUżyj adaptacyjnego podejścia dostosowanego do potrzeb ucznia.`;
    }
  }

  // Optymalizacja trudności
  const difficultyAdj = adaptiveRecommendations.difficultyAdjustment;
  if (Math.abs(difficultyAdj) > 0.1) {
    const adjustment = difficultyAdj > 0 ? 'ZWIĘKSZ' : 'ZMNIEJSZ';
    instructions += `\n\n=== DOSTOSOWANIE TRUDNOŚCI ===\n${adjustment} poziom trudności o ${Math.abs(difficultyAdj).toFixed(1)} punkty.`;
    
    if (difficultyAdj > 0) {
      instructions += `\nUczeń jest gotowy na większe wyzwanie. Wprowadź bardziej skomplikowane problemy.`;
    } else {
      instructions += `\nUczeń może być przeciążony. Uprość zadania i zapewnij więcej wsparcia.`;
    }
  }

  // Style komunikacji dostosowane do wieku
  if (cognitiveProfile.ageGroup) {
    instructions += `\n\n=== STYL KOMUNIKACJI ===`;
    if (cognitiveProfile.ageGroup === 'elementary') {
      instructions += `\nProsty język, krótkie zdania, pozytywne wzmocnienie. Unikaj skomplikowanej terminologii.`;
    } else if (cognitiveProfile.ageGroup === 'middle_school') {
      instructions += `\nJasne wyjaśnienia z przykładami. Możesz użyć podstawowej terminologii matematycznej.`;
    } else if (cognitiveProfile.ageGroup === 'high_school') {
      instructions += `\nPrecyzyjny, analityczny język. Używaj odpowiedniej terminologii matematycznej.`;
    }
  }

  // Rekomendacja przerwy
  if (adaptiveRecommendations.shouldTakeBreak) {
    const breakSuggestion = cognitiveProfile.ageGroup === 'elementary' 
      ? 'Może czas na krótką przerwę? Można się przeciągnąć lub napić wody.'
      : 'Warto zrobić chwilę przerwy, żeby lepiej się skoncentrować na kolejnym zadaniu.';
    instructions += `\n\n=== REKOMENDACJA PRZERWY ===\n${breakSuggestion}`;
  }

  // Ostrzeżenie o pseudo-aktywności
  if (sessionContext.isPseudoActivity) {
    instructions += `\n\n=== UWAGA PSEUDO-AKTYWNOŚĆ ===\nUczeń odpowiada zbyt szybko (czas < ${cognitiveProfile.averageResponseTime * 0.4}ms). Poproś o dokładniejsze przemyślenie lub wyjaśnienie rozumowania.`;
  }

  // Kontekst sesji
  instructions += `\n\n=== KONTEKST SESJI ===
- Numer kroku: ${sessionContext.turnNumber}
- Docelowa trudność: ${sessionContext.targetDifficulty}
- Dział: ${sessionContext.department}
- Pierwsza wiadomość: ${sessionContext.isFirstMessage ? 'TAK' : 'NIE'}`;

  // Specjalne instrukcje dla pierwszej wiadomości
  if (sessionContext.isFirstMessage) {
    instructions += `\n\n=== INSTRUKCJE POCZĄTKOWE ===\nTo pierwsza interakcja w tej sesji. Przywitaj ucznia i przedstaw zadanie w sposób motywujący.`;
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