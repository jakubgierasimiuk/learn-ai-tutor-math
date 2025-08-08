export type Device = 'desktop' | 'tablet' | 'mobile';
export type Network = 'good' | 'slow' | 'lossy';
export type A11y = 'none' | 'screen_reader' | 'keyboard_only' | 'low_vision';
export type Persona = 'poczatkujacy' | 'sredniozaawansowany' | 'maturzysta' | 'dyslektyk' | 'nieslyszacy';
export type Status = 'pass' | 'fail' | 'warning';

export interface Scenario {
  id: string;
  component: 'AIChat' | 'DiagnosticQuiz' | 'StudentMaterialsWizard';
  title: string;
  userPersona: Persona;
  device: Device;
  network: Network;
  a11y: A11y;
  prompt?: string; // for AIChat
  steps: string[];
  expected: string;
}

export interface ScenarioResult extends Scenario {
  status: Status;
  finding?: string;
  recommendation?: string;
  priority: 'high' | 'medium' | 'low';
}

const personas: Persona[] = ['poczatkujacy','sredniozaawansowany','maturzysta','dyslektyk','nieslyszacy'];
const devices: Device[] = ['desktop','tablet','mobile'];
const networks: Network[] = ['good','slow','lossy'];
const a11yModes: A11y[] = ['none','screen_reader','keyboard_only','low_vision'];

function pick<T>(arr: T[], i: number) { return arr[i % arr.length]; }

function buildMatrix(baseTitle: string, component: Scenario['component'], seed: number, builder: (i: number) => Partial<Scenario>): Scenario[] {
  const scenarios: Scenario[] = [];
  for (let i = 0; i < 100; i++) {
    const s: Scenario = {
      id: `${component}-${i+1}`,
      component,
      title: `${baseTitle} #${i+1}`,
      userPersona: pick(personas, i + seed),
      device: pick(devices, i + seed*2),
      network: pick(networks, i + seed*3),
      a11y: pick(a11yModes, i + seed*5),
      steps: [],
      expected: ''
    };
    scenarios.push({ ...s, ...builder(i) });
  }
  return scenarios;
}

export function generateAIChatScenarios(): Scenario[] {
  const intents = [
    'wyjaśnienie pojęcia',
    'rozwiązanie zadania krok po kroku',
    'sprawdzenie rozwiązania ucznia',
    'przygotowanie do kartkówki',
    'generowanie zadań o rosnącej trudności',
  ];
  return buildMatrix('AIChat – rozmowa edukacyjna', 'AIChat', 3, (i) => {
    const intent = intents[i % intents.length];
    const prompt = intent === 'wyjaśnienie pojęcia'
      ? 'Wytłumacz twierdzenie Pitagorasa na prostym przykładzie.'
      : intent === 'rozwiązanie zadania krok po kroku'
      ? 'Rozwiąż 2x + 5 = 13 i pokaż każdy krok.'
      : intent === 'sprawdzenie rozwiązania ucznia'
      ? 'Sprawdź czy moje rozwiązanie równania kwadratowego jest poprawne: x^2-4x+4=0.'
      : intent === 'przygotowanie do kartkówki'
      ? 'Przygotuj mnie do kartkówki z funkcji liniowej: definicje + 3 zadania.'
      : 'Daj 5 zadań z geometrii o rosnącej trudności z podpowiedziami.';
    return {
      prompt,
      steps: [
        'Użytkownik formułuje cel i wysyła wiadomość',
        'Asystent odpowiada w 3–6 krokach, sprawdza zrozumienie',
        'Opcjonalnie uruchom TTS i sprawdź dostępność',
      ],
      expected: 'Odpowiedź zgodna z celem, poprawna merytorycznie, z adaptacją do poziomu.'
    };
  });
}

export function generateQuizScenarios(): Scenario[] {
  const actions = ['wybór odpowiedzi','użycie "Nie wiem"','nawigacja wstecz','odtworzenie audio pytania','zakończenie testu'];
  return buildMatrix('Quiz diagnostyczny – interakcje', 'DiagnosticQuiz', 7, (i) => {
    return {
      steps: [
        `Użytkownik wykonuje akcję: ${actions[i % actions.length]}`,
        'Sprawdza stan przycisków (enabled/disabled)',
        'Przechodzi do następnego pytania',
      ],
      expected: 'Interfejs responsywny, focus zarządzany poprawnie, adaptacja trudności działa.'
    };
  });
}

export function generateMaterialsScenarios(): Scenario[] {
  const actions = ['upload 1 zdjęcia','upload 3 zdjęć','upload 5 zdjęć','usuniecie 1 zdjęcia','analiza i start lekcji'];
  return buildMatrix('Materiały ucznia – analiza', 'StudentMaterialsWizard', 11, (i) => {
    return {
      steps: [
        `Użytkownik: ${actions[i % actions.length]}`,
        'Oczekuje postępu, komunikatów i wyniku analizy',
        'Podejmuje akcję CTA (lekcja/mini‑quiz)'
      ],
      expected: 'Limit 5 zdjęć, responsywne podglądy, jasne toasty, wynik z sensownym planem.'
    };
  });
}

export function simulateExecution(scenarios: Scenario[]): ScenarioResult[] {
  return scenarios.map((s, i) => {
    let status: Status = 'pass';
    let finding = '';
    let recommendation = '';
    let priority: 'high' | 'medium' | 'low' = 'low';

    // Heurystyki ustalania wyników na podstawie znanych ryzyk
    if (s.component === 'DiagnosticQuiz' && s.device === 'mobile' && s.steps.join(' ').includes('wybór odpowiedzi')) {
      status = 'warning';
      finding = 'Na małych ekranach cele dotykowe mogą być zbyt małe.';
      recommendation = 'Wymuś min-h 48–52px, spacing 8–12px, test focus ring.';
      priority = 'high';
    }

    if (s.component === 'AIChat' && s.a11y === 'screen_reader') {
      status = 'warning';
      finding = 'TTS/VTT brak opisowych fallbacków dla czytników.';
      recommendation = 'Dodaj aria-live do odpowiedzi i transkrypcje dźwięku.';
      priority = 'medium';
    }

    if (s.component === 'StudentMaterialsWizard' && s.steps[0].includes('upload 5')) {
      status = 'pass';
      finding = 'Limit 5 zdjęć respektowany.';
      recommendation = 'Pokaż licznik pozostałych slotów obok CTA (już jest – weryfikuj kontrast).';
      priority = 'low';
    }

    if (s.network !== 'good') {
      if (s.component === 'AIChat') {
        status = status === 'pass' ? 'warning' : status;
        finding += (finding ? ' ' : '') + 'Brak komunikatu o wolnym łączu przy oczekiwaniu.';
        recommendation += (recommendation ? ' ' : '') + 'Dodaj skeleton/"Łączenie z AI…" + retry.';
        priority = priority === 'low' ? 'medium' : priority;
      }
    }

    return { ...s, status, finding: finding || undefined, recommendation: recommendation || undefined, priority };
  });
}
