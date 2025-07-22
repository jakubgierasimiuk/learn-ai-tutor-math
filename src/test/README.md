# Testy Automatyczne - AI Tutor

## Przegląd

Ten katalog zawiera kompleksowy system testów automatycznych dla aplikacji AI Tutor. Testy są zorganizowane w kategorie pokrywające wszystkie kluczowe funkcjonalności aplikacji.

## Struktura Testów

### 🧪 Testy Jednostkowe (`__tests__/`)
- **Navigation.test.tsx** - Nawigacja i menu
- **DiagnosticQuiz.test.tsx** - Quiz diagnostyczny
- **AIChat.test.tsx** - Chat z AI
- **Hero.test.tsx** - Sekcja hero strony głównej
- **useAuth.test.tsx** - Hook autoryzacji

### 🔄 Testy Integracyjne (`integration/`)
- **auth-flow.test.tsx** - Przepływ autoryzacji
- **quiz-flow.test.tsx** - Kompletny przepływ quizu

### 🛠️ Narzędzia Testowe (`utils/`, `mocks/`)
- **test-utils.tsx** - Niestandardowe funkcje renderowania
- **supabase.ts** - Mock Supabase
- **auth.ts** - Mock systemu autoryzacji

## Uruchamianie Testów

```bash
# Uruchom wszystkie testy
npm run test

# Uruchom testy z interfejsem UI
npm run test:ui

# Uruchom testy jednokrotnie
npm run test:run

# Uruchom testy z pokryciem kodu
npm run test:coverage

# Uruchom testy w trybie watch
npm run test:watch
```

## Konfiguracja

### Vitest Config (`vitest.config.ts`)
- Środowisko: jsdom (dla testów React)
- Setup: `src/test/setup.ts`
- Aliasy: `@` wskazuje na `./src`

### Setup Testów (`setup.ts`)
- Konfiguracja @testing-library/jest-dom
- Mock'owanie API przeglądarki (ResizeObserver, MediaDevices, etc.)
- Konfiguracja localStorage
- Mock'owanie Audio API dla testów TTS

## Pokrycie Testów

### ✅ Komponenty Testowane
- [x] Navigation - Menu i nawigacja
- [x] DiagnosticQuiz - Quiz diagnostyczny
- [x] AIChat - Chat z AI
- [x] Hero - Sekcja hero
- [x] useAuth - Hook autoryzacji

### ✅ Funkcjonalności Testowane
- [x] Autoryzacja użytkowników
- [x] Quiz diagnostyczny (kompletny przepływ)
- [x] Chat AI z obsługą głosu
- [x] Nawigacja i routing
- [x] Responsywność (podstawowe testy)
- [x] Accessibility (ARIA, keyboard navigation)

### ✅ Scenariusze Testowane
- [x] Logowanie/wylogowanie użytkownika
- [x] Ukończenie quizu diagnostycznego
- [x] Wysyłanie wiadomości w czacie AI
- [x] Obsługa błędów (sieć, API, baza danych)
- [x] Text-to-Speech i Voice-to-Text
- [x] Touch interactions (mobile)

## Best Practices

### 🎯 Testowanie Komponentów
```typescript
// Używaj customowego render z providerami
import { render, screen } from '@/test/utils/test-utils'

// Testuj zachowanie, nie implementację
expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()

// Używaj user-event dla interakcji
await user.click(submitButton)
```

### 🔧 Mock'owanie
```typescript
// Mock Supabase w każdym teście
beforeEach(() => {
  vi.clearAllMocks()
  mockSupabase.from.mockReturnValue(/* mock response */)
})

// Mock'uj tylko to, co potrzebne
mockSupabase.functions.invoke.mockResolvedValue({
  data: { response: 'AI response' },
  error: null
})
```

### ♿ Testowanie Accessibility
```typescript
// Testuj etykiety ARIA
expect(button).toHaveAttribute('aria-label', 'Expected label')

// Testuj nawigację klawiaturą
await user.tab()
expect(document.activeElement).toBe(expectedElement)

// Testuj screen reader compatibility
expect(screen.getByRole('button')).toBeInTheDocument()
```

## Debugowanie Testów

### 🐛 Przydatne Narzędzia
```typescript
// Wypisz aktualny DOM
screen.debug()

// Znajdź elementy po tekście
screen.getByText(/partial text/i)

// Czekaj na asynchroniczne operacje
await waitFor(() => {
  expect(screen.getByText('Expected text')).toBeInTheDocument()
})
```

### 📊 Analiza Pokrycia
```bash
# Uruchom testy z raportem pokrycia
npm run test:coverage

# Raport zostanie wygenerowany w folderze coverage/
```

## Rozszerzanie Testów

### 🆕 Dodawanie Nowych Testów
1. Utwórz plik `*.test.tsx` w odpowiednim katalogu
2. Zaimportuj narzędzia testowe: `@/test/utils/test-utils`
3. Użyj mock'ów: `@/test/mocks/*`
4. Dodaj testy dla happy path i edge cases
5. Sprawdź accessibility i mobile compatibility

### 📋 Checklist Nowego Testu
- [ ] Renderowanie komponentu
- [ ] Interakcje użytkownika
- [ ] Obsługa błędów
- [ ] Loading states
- [ ] Accessibility (ARIA, keyboard)
- [ ] Mobile/touch compatibility
- [ ] API calls (mock'owane)

## Continuous Integration

Testy są uruchamiane automatycznie przy każdym:
- Push do głównej gałęzi
- Pull Request
- Deploy na produkcję

Wszystkie testy muszą przejść przed merged do głównej gałęzi.

## Metryki Jakości

### 🎯 Cele Pokrycia
- **Komponentów**: > 90%
- **Linii kodu**: > 85%
- **Funkcji**: > 90%
- **Branchy**: > 80%

### 📈 Monitorowanie
- Pokrycie testów jest sprawdzane w CI/CD
- Raporty są generowane dla każdego build'a
- Regresje w pokryciu blokują deployment