import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Brain, ArrowLeft, ArrowRight, Clock, Target, Star, Volume2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Enhanced quiz data with explanations and difficulty levels
const quizQuestions = [
  {
    id: 1,
    topic: "Algebra",
    difficulty: "easy",
    question: "Rozwiąż równanie: 2x + 5 = 13",
    explanation: "Aby rozwiązać równanie, odejmujemy 5 od obu stron: 2x = 8, następnie dzielimy przez 2: x = 4",
    options: [
      { id: "a", text: "x = 4", correct: true },
      { id: "b", text: "x = 6", correct: false },
      { id: "c", text: "x = 8", correct: false },
      { id: "d", text: "x = 9", correct: false }
    ]
  },
  {
    id: 2,
    topic: "Geometria",
    difficulty: "medium",
    question: "Oblicz pole koła o promieniu 3 cm (π ≈ 3.14)",
    options: [
      { id: "a", text: "18.84 cm²", correct: false },
      { id: "b", text: "28.26 cm²", correct: true },
      { id: "c", text: "37.68 cm²", correct: false },
      { id: "d", text: "56.52 cm²", correct: false }
    ]
  },
  {
    id: 3,
    topic: "Funkcje",
    difficulty: "medium",
    question: "Jaka jest wartość funkcji f(x) = 2x² - 3x + 1 dla x = 2?",
    options: [
      { id: "a", text: "3", correct: true },
      { id: "b", text: "5", correct: false },
      { id: "c", text: "7", correct: false },
      { id: "d", text: "9", correct: false }
    ]
  },
  {
    id: 4,
    topic: "Trygonometria",
    difficulty: "medium",
    question: "Czemu równa się sin(30°)?",
    options: [
      { id: "a", text: "1/2", correct: true },
      { id: "b", text: "√2/2", correct: false },
      { id: "c", text: "√3/2", correct: false },
      { id: "d", text: "1", correct: false }
    ]
  },
  {
    id: 5,
    topic: "Logarytmy",
    difficulty: "medium",
    question: "Oblicz log₂(8)",
    options: [
      { id: "a", text: "2", correct: false },
      { id: "b", text: "3", correct: true },
      { id: "c", text: "4", correct: false },
      { id: "d", text: "8", correct: false }
    ]
  },
  {
    id: 6,
    topic: "Statystyka",
    difficulty: "medium",
    question: "Jaka jest mediana zbioru: 3, 7, 2, 9, 5?",
    options: [
      { id: "a", text: "3", correct: false },
      { id: "b", text: "5", correct: true },
      { id: "c", text: "7", correct: false },
      { id: "d", text: "5.2", correct: false }
    ]
  },
  {
    id: 7,
    topic: "Równania kwadratowe",
    difficulty: "hard",
    question: "Ile rozwiązań ma równanie x² - 4x + 4 = 0?",
    options: [
      { id: "a", text: "0", correct: false },
      { id: "b", text: "1", correct: true },
      { id: "c", text: "2", correct: false },
      { id: "d", text: "3", correct: false }
    ]
  },
  {
    id: 8,
    topic: "Ciągi",
    difficulty: "medium",
    question: "Jaki jest następny element ciągu: 2, 6, 18, 54, ...?",
    options: [
      { id: "a", text: "108", correct: false },
      { id: "b", text: "162", correct: true },
      { id: "c", text: "216", correct: false },
      { id: "d", text: "324", correct: false }
    ]
  }
];

export const DiagnosticQuiz = () => {
  const { user } = useAuth();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId: number, optionId: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleTextToSpeech = async (text: string) => {
    try {
      const response = await supabase.functions.invoke('text-to-speech', {
        body: { text }
      });

      if (response.error) throw response.error;

      const audioContent = response.data.audioContent;
      const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
      await audio.play();
      
      toast.success("Odtwarzanie pytania...");
    } catch (error) {
      console.error('Error with text-to-speech:', error);
      toast.error("Błąd podczas odtwarzania audio");
    }
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      const results = calculateResults();
      
      // Save results to database
      for (const result of results) {
        // Find topic by name
        const { data: topics } = await supabase
          .from('topics')
          .select('id')
          .eq('name', result.topic)
          .maybeSingle();
          
        if (topics) {
          await supabase
            .from('skill_mastery')
            .upsert({
              user_id: user.id,
              topic_id: topics.id,
              mastery_percentage: result.mastery
            });
        }
      }
      
      // Mark diagnosis as completed
      await supabase
        .from('profiles')
        .update({ diagnosis_completed: true })
        .eq('user_id', user.id);
        
      toast.success("Wyniki diagnostyki zostały zapisane!");
      setShowResults(true);
    } catch (error) {
      console.error('Error saving quiz results:', error);
      toast.error("Błąd podczas zapisywania wyników");
    }
  };

  const calculateResults = () => {
    const results: Record<string, { correct: number; total: number }> = {};
    
    quizQuestions.forEach(question => {
      const topic = question.topic;
      if (!results[topic]) {
        results[topic] = { correct: 0, total: 0 };
      }
      
      results[topic].total++;
      const userAnswer = selectedAnswers[question.id];
      const correctAnswer = question.options.find(opt => opt.correct)?.id;
      
      if (userAnswer === correctAnswer) {
        results[topic].correct++;
      }
    });

    return Object.entries(results).map(([topic, data]) => ({
      topic,
      mastery: Math.round((data.correct / data.total) * 100),
      correct: data.correct,
      total: data.total
    }));
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const answeredQuestions = Object.keys(selectedAnswers).length;

  if (showResults) {
    const results = calculateResults();
    const overallScore = Math.round((results.reduce((acc, r) => acc + r.mastery, 0) / results.length));

    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-success/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8 shadow-accent">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Diagnoza ukończona!</h2>
            <p className="text-muted-foreground">
              Twój ogólny wynik: <span className="font-semibold text-success">{overallScore}%</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {results.map((result, index) => (
              <Card key={result.topic} className="p-6 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">{result.topic}</h3>
                  <Badge variant={result.mastery >= 50 ? "default" : "destructive"}>
                    {result.mastery}%
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{result.correct}/{result.total} poprawnych</span>
                </div>
                <Progress value={result.mastery} className="mt-2" />
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button size="lg" className="shadow-primary">
              Przejdź do lekcji
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 shadow-card text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">Świetna robota!</h2>
          <p className="text-muted-foreground mb-6">
            Odpowiedziałeś na {answeredQuestions} z {quizQuestions.length} pytań. 
            Kliknij poniżej, aby zobaczyć swoje wyniki i rekomendacje.
          </p>
          <Button onClick={handleSubmit} size="lg" className="shadow-primary">
            Zobacz wyniki
          </Button>
        </Card>
      </div>
    );
  }

  const question = quizQuestions[currentQuestion];
  const selectedAnswer = selectedAnswers[question.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl p-8 shadow-card">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">{question.topic}</Badge>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} z {quizQuestions.length}
            </span>
          </div>
          <Progress value={progress} className="mb-4" />
          <h2 className="text-2xl font-bold mb-2">Test diagnostyczny</h2>
          <p className="text-muted-foreground">
            Odpowiedz na pytania, aby sprawdzić swój poziom wiedzy
          </p>
        </div>

        {/* Question */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">{question.question}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTextToSpeech(question.question)}
              className="flex items-center gap-2 min-h-[44px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Odtwórz pytanie"
            >
              <Volume2 className="w-4 h-4" />
              <span className="sr-only">Odtwórz pytanie audio</span>
              Odtwórz
            </Button>
          </div>
          
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(question.id, option.id)}
                className={`w-full min-h-[48px] p-4 text-left rounded-lg border transition-all touch-target focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  selectedAnswer === option.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selectedAnswer === option.id
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border'
                  }`}>
                    {selectedAnswer === option.id && (
                      <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                    )}
                  </div>
                  <span className="font-medium">{option.id.toUpperCase()}</span>
                  <span>{option.text}</span>
                </div>
              </button>
            ))}

            <div className="pt-2">
              <Button
                variant="ghost"
                onClick={() => handleAnswerSelect(question.id, 'unknown')}
                className="min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Nie znam odpowiedzi"
              >
                Nie wiem
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Poprzednie
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!selectedAnswer}
            className="shadow-primary min-h-[48px] touch-target focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {currentQuestion === quizQuestions.length - 1 ? 'Zakończ' : 'Następne'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
};