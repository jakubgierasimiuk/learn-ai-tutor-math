# Mentavo - AI Math Tutor

## Jak rozmawiać z Jakubem (właścicielem projektu)

- **Mów po polsku** — Jakub komunikuje się po polsku
- **Prowadź za rękę** — Jakub uczy się CLI i narzędzi deweloperskich. Dawaj konkretne komendy do wklejenia, nie zakładaj że zna flagi/opcje. Ale uczy się szybko — raz pokazane, drugi raz pamięta
- **Bądź bezpośredni** — Jakub nie lubi gdy Claude "się zastanawia" albo szuka czegoś w kółko. Podawaj ścieżki wprost, nie szukaj gdy wiesz
- **Nie pytaj o oczywiste** — Jak mówi "wejdź do folderu X" to po prostu wejdź, nie szukaj po całym dysku
- **Jakub pracuje z Lovable** — Wiele commitów pochodzi z `gpt-engineer-app[bot]` (Lovable). Claude Code jest używany do bardziej zaawansowanych zmian i fixów
- **Styl commitów** — Jakub lubi conventional commits: `fix(scope):`, `feat(scope):`, `style(scope):`

## Project Info

- **URL produkcyjna:** mentavo.pl
- **Lovable project:** https://lovable.dev/projects/bb3407cf-bda6-4450-86ba-6536ea0a1375
- **GitHub:** https://github.com/jakubgierasimiuk/learn-ai-tutor-math
- **Repozytorium lokalne:** `C:\Users\K\learn-ai-tutor-math`

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite (port 8080) + TailwindCSS + shadcn/ui
- **Backend:** Supabase (47 Edge Functions, Deno) — region: North EU (Stockholm)
- **AI Model:** Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`)
- **Mobile:** Capacitor (iOS/Android)
- **Math rendering:** KaTeX + remark-math + rehype-katex
- **TTS:** ElevenLabs (@11labs/react)
- **Email:** Resend
- **Deploy:** Push na `main` → auto-deploy via Lovable

## Supabase Configuration

- **Project Ref:** `rfcjhdxsczcwbpknudyy`
- **Dashboard:** https://supabase.com/dashboard/project/rfcjhdxsczcwbpknudyy
- **Supabase CLI:** `C:\Users\K\bin\supabase.exe`
- **Access Token:** `sbp_a1a40e747101a1135f6596fe4d57cbf2d21e5460`

### Quick Commands
```powershell
$env:SUPABASE_ACCESS_TOKEN = "sbp_a1a40e747101a1135f6596fe4d57cbf2d21e5460"
C:\Users\K\bin\supabase.exe functions list --project-ref rfcjhdxsczcwbpknudyy
C:\Users\K\bin\supabase.exe secrets list --project-ref rfcjhdxsczcwbpknudyy
C:\Users\K\bin\supabase.exe secrets set KEY=value --project-ref rfcjhdxsczcwbpknudyy
```

### API Testing
```powershell
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"
$url = "https://rfcjhdxsczcwbpknudyy.supabase.co/functions/v1/study-tutor"
$body = '{"endpoint":"chat","message":"test","messages":[]}'
$headers = @{"Authorization"="Bearer $token";"Content-Type"="application/json"}
Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body $body
```

## Kluczowe pliki

### Frontend
| Plik | Opis |
|------|------|
| `src/components/AIChat.tsx` (647 linii) | Główny komponent czatu — smart context, token paywall, sesje |
| `src/components/chat/ChatHeader.tsx` | Header czatu z licznikiem tokenów i upgrade button |
| `src/components/home/MainActionCards.tsx` | Dashboard: kontynuuj naukę, postęp, zapytaj AI |
| `src/components/home/WeeklyTracker.tsx` | 7-dniowy tracker aktywności ze streakiem |
| `src/components/home/WelcomeHeader.tsx` | Powitanie zależne od pory dnia |
| `src/components/Navigation.tsx` | Nawigacja z sekcjami: NAUKA, SPOŁECZNOŚĆ, KONTO |
| `src/components/FoundingLandingPage.tsx` | Landing page founding members |
| `src/components/LandingPage.tsx` | Główny landing z FAQ i demo czatu |
| `src/components/onboarding/` | Flow onboardingu nowych użytkowników |

### Backend (Edge Functions — najważniejsze)
| Funkcja | Opis |
|---------|------|
| `study-tutor/index.ts` (1763 linii) | Główny silnik AI — 4 endpointy: chat, tutor, get-tasks, phase-based lesson |
| `create-checkout/` | Stripe checkout dla płatnych planów |
| `process-referral-v2/` | System poleceń (3-etapowy z fraud scoring) |
| `founding-registration/` | Rejestracja founding members |
| `delete-account/` | Usuwanie konta użytkownika |
| `session-summary/` | Podsumowanie sesji nauki |
| `voice-to-text/`, `text-to-speech/` | Funkcje głosowe |

### Dokumentacja
| Plik | Opis |
|------|------|
| `docs/system-architecture-map.md` | Mapa architektury, schematy DB, data flow |
| `docs/referral-rewards-explained.md` | System poleceń — 3 etapy, milestone bonusy |
| `docs/skill-gap-analysis-summary.md` | Analiza luk w programie (217 skilli, brakuje nierówności) |
| `prompts/` | Prompty do generowania treści curriculum przez ChatGPT |

## Co zostało zrobione (chronologicznie)

### Faza 1 (do sty 2026) — Fundament
- Migracja z OpenAI na Claude Sonnet 4.5 (`af418e7`)
- System founding members na stronie głównej
- Responsywność, SEO, basic analytics
- Integracja Resend (email), Stripe (płatności)
- System poleceń (referral) z fraud prevention

### Faza 2 (lut 2026-02-03..05) — AI Tutor v2
- Nowy system prompt dla tutora (metoda sokratyczna, model GADIE)
- Fix utraty kontekstu w długich rozmowach — smart context: first 3 + last 12 par (`c66c5c3`)
- RLS policies, rate limiting na founding-registration
- Uproszczenie chat flow

### Faza 3 (lut 2026-02-06) — UX Overhaul (sesja z Claude Code)
- **TASK 1.1:** Usuwanie konta (AccountPage)
- **TASK 1.2:** Dedykowana strona cennikowa (PricingPage)
- **TASK 1.3:** Tabs zamiast Collapsible na auth
- **TASK 1.4:** Nawigacja w czacie
- **TASK 1.6:** Fix bugu 108271 min w study sessions
- **TASK 1.7:** Tłumaczenie strony 404 na polski
- **TASK 2.2+2.3:** Ukrycie paneli admina, ujednolicenie polskich nazw
- **TASK 3.1:** Onboarding redirect dla nowych użytkowników
- **TASK 3.2+3.3:** Update powitania czatu i komunikatów referral
- **TASK 3.4:** Auto-generowane opisy skilli
- **TASK 3.6:** Migracja kolorów orange → brand teal/purple
- **TASK 3.7:** Shared Navigation na Founding page
- **UX-2.1:** Landing page z metodą sokratyczną, FAQ, demo czatu
- **UX-2.4:** Sekcje w mobile menu (NAUKA, SPOŁECZNOŚĆ, KONTO)
- **Ostatni commit:** Uproszczenie welcome message w czacie (`c5cafe0`)

## Stan repozytorium (2026-02-07)

### Aktualny branch: `main` (up to date z origin)

### Niezacommitowane pliki (untracked):
- `src/components/chat/ChatHeader.tsx` — header czatu z tokenami (NOWY)
- `src/components/home/MainActionCards.tsx` — karty dashboard (NOWY)
- `src/components/home/WeeklyTracker.tsx` — tracker tygodniowy (NOWY)
- `src/components/home/WelcomeHeader.tsx` — powitanie (NOWY)
- `src/components/home/index.ts` — barrel exports (NOWY)
- `supabase/.temp/` — pliki tymczasowe

### Stash:
- `stash@{0}`: WIP z brancha `feature/mentavo-v2-prompt` — zmiany w AIChat.tsx, HomePage.tsx, package-lock.json. Prawdopodobnie stara wersja refactoru home page.

### Inne branche:
- `fix/ux-audit-full` — ma dodatkowe zmiany w AIChat.tsx (12 linii) vs main. Prawdopodobnie niedokończony UX audit.
- `feature/mentavo-v2-prompt` — merged do main (remote only)
- `feature/ui-mockup-redesign` — merged do main (PR #1)

## Potencjalne problemy i ryzyka

### 1. Niezacommitowane pliki home/
Nowe komponenty `ChatHeader`, `MainActionCards`, `WeeklyTracker`, `WelcomeHeader` są untracked. Wygląda na niedokończony refactor HomePage — **prawdopodobnie nie są jeszcze zaimportowane w HomePage.tsx**. Trzeba zdecydować: commitować czy dokończyć.

### 2. Branch `fix/ux-audit-full` rozbieżny z main
Ma zmiany w AIChat.tsx które nie są na main. Może być nieaktualny po fali commitów z 2026-02-06. **Do rozwiązania:** merge albo usunięcie.

### 3. Stash z WIP
Stash zawiera zmiany w AIChat.tsx i HomePage.tsx. Mogą kolidować z obecnym stanem. **Rekomendacja:** sprawdzić czy stash jest jeszcze potrzebny.

### 4. study-tutor/index.ts ma 1763 linii
Plik jest ogromny — 4 endpointy w jednym pliku. Trudny w utrzymaniu. Przy następnej okazji warto rozdzielić na moduły.

### 5. RealLearningInterface.tsx — martwy kod
Komponent istnieje ale nie ma backendu (edge function `RealLearningEngine` nie istnieje). Oznaczony w docs jako "NOT IN USE". Do usunięcia lub implementacji w przyszłości.

### 6. Dużo komponentów "batch import" / "testing"
`BatchImportRunner`, `FixedBatchImportRunner`, `NewBatchImportRunner`, `AutoImportRunner` — wiele wersji. Plus `testing/` folder. Prawdopodobnie devtools które nie powinny trafiać na produkcję.

### 7. Token limit hardcoded: 25,000
Free tier ma hardcoded 25k tokenów w `study-tutor`. Jeśli się zmieni polityka cenowa, trzeba to zmienić w edge function.

### 8. Brak testów
Vitest jest skonfigurowany ale nie widać testów w projekcie. `vitest.config.ts` istnieje, ale brak plików `*.test.ts`.

### 9. Luki w curriculum
Wg `docs/skill-gap-analysis-summary.md`: brakuje nierówności, wartości bezwzględnej, całek, zaawansowanej trygonometrii. 5 krytycznych skilli do dodania.

## Troubleshooting

### "AI response failed"
1. Sprawdź klucz API: https://console.anthropic.com
2. `supabase secrets list --project-ref rfcjhdxsczcwbpknudyy`
3. `supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref rfcjhdxsczcwbpknudyy`

### Deploy nie działa
- Push na `main` → auto-deploy Lovable
- Dashboard: https://lovable.dev/projects/bb3407cf-bda6-4450-86ba-6536ea0a1375

### Edge function nie działa
```powershell
C:\Users\K\bin\supabase.exe functions list --project-ref rfcjhdxsczcwbpknudyy
# Sprawdź logi:
C:\Users\K\bin\supabase.exe functions logs study-tutor --project-ref rfcjhdxsczcwbpknudyy
```
