# System Architecture Map - AI Learning Platform

**AUTOR**: AI Assistant (Lovable)  
**WERSJA**: 1.0  
**DATA**: 2025-01-21  
**CEL**: Kompletna mapa architektury systemu dla łatwej nawigacji i spójnych zmian

---

## 🎯 **STATUS SYSTEMÓW**

### ✅ **AKTYWNE SYSTEMY**
- **Study Tutor** - Główny system AI tutoringu (FUNKCJONALNY)
- **Curriculum Management** - Zarządzanie treścią (FUNKCJONALNY)
- **User Profiles** - Profile użytkowników (FUNKCJONALNY)

### 🚫 **NIEAKTYWNE SYSTEMY**
- **Real Learning Engine** - W ROZWOJU (NIE UŻYWAĆ)
- **Advanced Analytics** - Zaplanowane na przyszłość

---

## 📊 **STRUKTURA BAZY DANYCH**

### **GŁÓWNE TABELE**

#### **1. UMIEJĘTNOŚCI (Skills)**
```
skills
├── id (uuid)
├── name (text)
├── department (text)
├── description (text)
├── difficulty_level (integer)
├── prerequisites (text[])
└── metadata (jsonb)
```

#### **2. FAZY UMIEJĘTNOŚCI (Skill Phases)**
```
skill_phases
├── id (uuid)
├── skill_id (uuid → skills.id)
├── phase_number (integer)
├── title (text)
├── content_data (jsonb)
└── generator_params (jsonb)
```

#### **3. ĆWICZENIA (Practice Exercises)**
```
skill_practice_exercises
├── id (uuid)
├── skill_id (uuid → skills.id)
├── exercise_data (jsonb)
├── difficulty (integer)
└── exercise_type (text)
```

#### **4. PROFILE UŻYTKOWNIKÓW (User Profiles)**
```
profiles
├── user_id (uuid)
├── email (text)
├── name (text)
├── total_points (integer)
├── learner_profile (jsonb)
└── created_at (timestamp)
```

#### **5. SESJE NAUKI (Learning Sessions)**
```
unified_learning_sessions
├── id (uuid)
├── user_id (uuid)
├── session_type (text)
├── skill_focus (text)
├── department (text)
├── started_at (timestamp)
├── completed_at (timestamp)
├── engagement_score (decimal)
├── learning_momentum (decimal)
├── difficulty_level (integer)
└── concepts_learned (jsonb)
```

#### **6. INTERAKCJE UCZENIA (Learning Interactions)**
```
learning_interactions
├── id (uuid)
├── session_id (uuid)
├── user_id (uuid)
├── interaction_type (text)
├── task_data (jsonb)
├── user_response (text)
├── ai_feedback (text)
├── response_time_seconds (decimal)
├── difficulty_adjustment (decimal)
└── misconceptions_detected (jsonb)
```

#### **7. BAZA BŁĘDÓW (Misconception Database)**
```
misconception_database
├── id (uuid)
├── skill_name (text)
├── misconception_pattern (text)
├── description (text)
├── corrective_strategy (text)
├── examples (jsonb)
└── frequency_score (integer)
```

---

## 🔄 **PRZEPŁYW DANYCH**

### **1. SESJA NAUKI - GŁÓWNY PRZEPŁYW**
```
User Request → Study Tutor Function → AI Processing → Response
     ↓              ↓                      ↓           ↓
Profile Update → Session Logging → Misconception → Feedback
                                   Detection
```

### **2. SZCZEGÓŁOWY PRZEPŁYW SESJI**
1. **Rozpoczęcie** (`PhaseBasedLesson.tsx`)
   - Pobranie umiejętności z tabeli `skills`
   - Stworzenie rekordu w `unified_learning_sessions`
   
2. **Generowanie zadania** (`study-tutor` function)
   - Analiza profilu kognitywnego użytkownika
   - Wybór odpowiedniej fazy nauki
   - Generowanie zadania przez AI
   
3. **Odpowiedź ucznia** (`PhaseBasedLesson.tsx`)
   - Zapis interakcji do `learning_interactions`
   - Wywołanie `study-tutor` z odpowiedzią
   
4. **Analiza AI** (`study-tutor` function)
   - Klasyfikacja błędu (`MathErrorClassifier`)
   - Wykrycie błędnych przekonań
   - Generowanie feedbacku
   
5. **Aktualizacja profilu** (trigger functions)
   - Aktualizacja `learner_profile` w `profiles`
   - Kalkulacja nowych metryk kognitywnych

---

## 🧩 **KOMPONENTY I POWIĄZANIA**

### **FRONTEND KOMPONENTY**

#### **1. Główne komponenty nauki**
- `PhaseBasedLesson.tsx` → **study-tutor** function
- `AIChat.tsx` → **study-tutor** function  
- `StudyDashboard.tsx` → tabele: `skills`, `profiles`, `user_lesson_progress`

#### **2. Komponenty zarządzania treścią**
- `ContentImportPage.tsx` → **seed-curriculum** function
- `AutoImportRunner.tsx` → **seed-curriculum** function
- `StudentMaterialsWizard.tsx` → **analyze-student-materials** function

#### **3. Komponenty społecznościowe**
- `SocialPage.tsx` → tabele: `challenges`, `leaderboards`, `study_groups`
- `ReferralPage.tsx` → **create-referral-code**, **process-referral** functions

### **NIEAKTYWNE KOMPONENTY (DO IGNOROWANIA)**
```
❌ RealLearningInterface.tsx - NIE UŻYWAĆ (brak backend)
❌ RealLearningPage.tsx - NIE UŻYWAĆ (brak backend)
❌ useRealLearning.tsx - NIE UŻYWAĆ (brak backend)
```

---

## ⚡ **EDGE FUNCTIONS MAPOWANIE**

### **✅ AKTYWNE FUNKCJE**

#### **1. study-tutor** (GŁÓWNA FUNKCJA AI)
- **Lokalizacja**: `supabase/functions/study-tutor/`
- **Używane przez**: `PhaseBasedLesson.tsx`, `AIChat.tsx`, `RealLearningInterface.tsx`
- **Funkcjonalności**:
  - Generowanie zadań AI
  - Klasyfikacja błędów
  - Analiza kognitywna
  - Adaptacyjna pedagogika

#### **2. seed-curriculum**
- **Lokalizacja**: `supabase/functions/seed-curriculum/`
- **Używane przez**: `ContentImportPage.tsx`, `AutoImportRunner.tsx`
- **Funkcjonalności**:
  - Import treści umiejętności
  - Tworzenie faz nauki
  - Generowanie ćwiczeń

#### **3. analyze-student-materials**
- **Lokalizacja**: `supabase/functions/analyze-student-materials/`
- **Używane przez**: `StudentMaterialsWizard.tsx`

#### **4. text-to-speech**
- **Lokalizacja**: `supabase/functions/text-to-speech/`
- **Status**: Zaimplementowane

### **❌ NIEISTNIEJĄCE FUNKCJE**
```
❌ real-learning-engine - NIE ISTNIEJE (błąd w kodzie)
```

---

## 🔧 **KLUCZOWE PROCESY**

### **1. SESJA NAUKI - KROK PO KROKU**

#### **Inicjalizacja** (`PhaseBasedLesson.tsx` linie 70-120)
```typescript
// 1. Pobranie umiejętności
const { data: skills } = await supabase
  .from('skills')
  .select('*')
  .eq('id', skillId);

// 2. Utworzenie sesji
const { data: session } = await supabase
  .from('unified_learning_sessions')
  .insert({ user_id, skill_focus: skillId });
```

#### **Generowanie zadania** (`study-tutor` function)
```typescript
// 1. Analiza profilu (cognitiveAnalysis.ts)
const cognitiveLoad = calculateCognitiveLoad(profile);
const flowState = calculateFlowState(responseTime, profile);

// 2. Wybór strategii pedagogicznej
const strategy = selectPedagogicalStrategy(responsePattern, profile);

// 3. Generowanie zadania przez AI
const task = await generateTaskWithAI(skill, difficulty, strategy);
```

#### **Przetwarzanie odpowiedzi** (`study-tutor` function)
```typescript
// 1. Klasyfikacja błędu
const error = MathErrorClassifier.classifyError(
  userAnswer, 
  expectedAnswer, 
  skillName, 
  responseTime
);

// 2. Wykrycie błędnych przekonań
const misconception = detectMethodMisconception(
  userAnswer, 
  expectedAnswer, 
  profile
);

// 3. Generowanie feedbacku
const feedback = generateMicroFeedback(
  isCorrect, 
  responseTime, 
  phase, 
  studentModel
);
```

### **2. KLASYFIKACJA BŁĘDÓW**

#### **Typy błędów** (`MathErrorClassifier.ts`)
```
CALCULATION - błędy obliczeniowe
CONCEPTUAL - błędy pojęciowe  
PROCEDURAL - błędy proceduralne
CARELESS - błędy z nieuwagi
INCOMPLETE - niekompletne odpowiedzi
SYNTAX - błędy składniowe
```

#### **Proces klasyfikacji**
1. Sprawdzenie błędów z nieuwagi (czas < 10s)
2. Porównanie z bazą błędnych przekonań
3. Analiza różnic numerycznych
4. Klasyfikacja typu błędu
5. Generowanie strategii naprawczej

### **3. AKTUALIZACJA PROFILU KOGNITYWNEGO**

#### **Metryki śledzone** (`profiles.learner_profile`)
```json
{
  "cognitive_load": 0.7,
  "processing_speed": 85,
  "working_memory_span": 6,
  "attention_span_minutes": 25,
  "learning_momentum": 0.8,
  "confidence_level": 0.6,
  "error_patterns": ["calculation", "careless"],
  "preferred_difficulty": 3,
  "session_count": 42,
  "total_time_minutes": 1240
}
```

#### **Trigger aktualizacji** (`update_learner_profile_from_session()`)
```sql
-- Automatyczna aktualizacja po każdej sesji
UPDATE universal_learner_profiles 
SET 
  total_learning_time_minutes = total_learning_time_minutes + session_duration,
  sessions_completed = sessions_completed + 1,
  concepts_mastered = concepts_mastered + new_concepts
```

---

## 🎮 **SYSTEMY GAMIFIKACJI**

### **Punkty i osiągnięcia**
- `achievements` - definicje osiągnięć
- `user_achievements` - osiągnięcia użytkowników
- `points_history` - historia punktów
- `user_streaks` - serie uczenia

### **Rankingi**
- `leaderboards` - tygodniowe/miesięczne rankingi
- Aktualizacja przez funkcję `update_leaderboard()`

---

## 📈 **ANALITYKA I MONITORING**

### **Metryki śledzone**
1. **Czas odpowiedzi** - dla oceny trudności
2. **Typy błędów** - dla personalizacji
3. **Momentum nauki** - dla motywacji
4. **Obciążenie kognitywne** - dla dostosowania trudności

### **Tabele analityczne**
- `learning_interactions` - szczegółowe interakcje
- `unified_learning_sessions` - podsumowania sesji
- `daily_stats` - statystyki dzienne

---

## 🚨 **WAŻNE OSTRZEŻENIA DLA PRZYSZŁYCH ZMIAN**

### **❗ ZAWSZE SPRAWDŹ:**
1. **Czy funkcja Edge istnieje** - nie wywołuj nieistniejących funkcji
2. **Czy tabela ma dane** - niektóre tabele mogą być puste
3. **Czy komponent jest aktywny** - Real Learning Engine = NIE UŻYWAĆ
4. **Czy routing jest poprawny** - sprawdź App.tsx

### **❗ PRZED KAŻDĄ ZMIANĄ:**
1. Przeczytaj tę mapę
2. Sprawdź powiązane komponenty
3. Zweryfikuj funkcje Edge
4. Przetestuj pełen przepływ

### **❗ TYPOWE BŁĘDY DO UNIKANIA:**
- Wywoływanie `real-learning-engine` (nie istnieje)
- Używanie `RealLearningInterface` (nie działa)
- Zapomnienie o aktualizacji profilu kognitywnego
- Pomijanie klasyfikacji błędów

---

## 🔄 **PLAN ROZWOJU**

### **Krótkoterminowo (Study Tutor)**
- ✅ Ukrycie Real Learning Engine
- 🔄 Uzupełnienie treści umiejętności  
- 🔄 Dodanie wizualizacji matematycznych
- 🔄 Rozszerzenie typów zadań

### **Średnioterminowo**
- 📋 Implementacja Real Learning Engine backend
- 📋 Połączenie systemów
- 📋 Zaawansowana analityka

### **Długoterminowo**
- 📋 Rozpoznawanie pisma odręcznego
- 📋 Integracja z zewnętrznymi narzędziami
- 📋 Rozszerzona gamifikacja

---

**KONIEC MAPY ARCHITEKTURY**

*Ta mapa powinna być aktualizowana przy każdej znaczącej zmianie w systemie.*