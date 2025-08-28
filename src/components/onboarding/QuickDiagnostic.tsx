import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { areAnswersEquivalent, normalizeAnswer } from '@/lib/mathValidation';

interface Question {
  id: string;
  question: string;
  correctAnswer: string;
  level: 'easy' | 'normal' | 'hard';
  explanation: string;
}

const questions: Question[] = [
  {
    id: '1',
    question: 'Rozwiąż równanie: 2x + 5 = 11',
    correctAnswer: '3',
    level: 'easy',
    explanation: '2x = 11 - 5 = 6, więc x = 3'
  },
  {
    id: '2', 
    question: 'Oblicz: (x + 2)² = x² + 4x + ?',
    correctAnswer: '4',
    level: 'normal',
    explanation: '(x + 2)² = x² + 4x + 4'
  },
  {
    id: '3',
    question: 'Znajdź dziedzinę funkcji: f(x) = √(x - 3)',
    correctAnswer: 'x ≥ 3',
    level: 'hard',
    explanation: 'Pod pierwiastkiem musi być liczba nieujemna, więc x - 3 ≥ 0'
  }
];

export function QuickDiagnostic() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<{questionId: string, correct: boolean}[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [level, setLevel] = useState<string>('');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  
  const checkAnswer = () => {
    // Use mathematical validation to handle various answer formats
    const correct = areAnswersEquivalent(userAnswer, question.correctAnswer);
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    setAnswers(prev => [...prev, { questionId: question.id, correct }]);
  };
  
  const handleNext = () => {
    if (isLastQuestion) {
      calculateLevel();
    } else {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
      setShowFeedback(false);
      setIsCorrect(false);
    }
  };
  
  const calculateLevel = async () => {
    const correctAnswers = answers.filter(a => a.correct).length + (isCorrect ? 1 : 0);
    
    // Convert to unified numeric level (1-10 scale)
    let numericLevel = Math.min(Math.max(1, correctAnswers * 3), 10);
    let displayLevel = 'początkujący';
    
    if (correctAnswers === 0) {
      numericLevel = 1;
      displayLevel = 'początkujący';
    } else if (correctAnswers === 1) {
      numericLevel = 4;
      displayLevel = 'podstawowy';
    } else if (correctAnswers === 2) {
      numericLevel = 7;
      displayLevel = 'średnio zaawansowany';
    } else if (correctAnswers === 3) {
      numericLevel = 10;
      displayLevel = 'zaawansowany';
    }
    
    setLevel(displayLevel);
    setCompleted(true);
    
    // Save both formats to database for compatibility
    if (user) {
      await supabase
        .from('profiles')
        .update({ 
          initial_level: displayLevel,
          current_level: numericLevel 
        })
        .eq('user_id', user.id);
    }
  };
  
  const handleComplete = () => {
    navigate('/onboarding/checklist');
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              Gratulacje! 
            </h1>
            <p className="text-lg text-primary font-semibold mb-2">
              Twój poziom startowy: {level}
            </p>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>AI dostosuje lekcje do Twojego poziomu</p>
              <p className="text-xs">
                {level === 'początkujący' && 'Zaczniemy od podstaw z wieloma wyjaśnieniami'}
                {level === 'podstawowy' && 'Skupimy się na podstawowych umiejętnościach'}
                {level === 'średnio zaawansowany' && 'Przejdziemy do bardziej złożonych problemów'}
                {level === 'zaawansowany' && 'Będziemy rozwiązywać trudne zadania z mniejszą pomocą'}
              </p>
            </div>
          </div>
          
          <Button onClick={handleComplete} className="w-full" size="lg">
            Kontynuuj
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-6">
      <Card className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Szybki test diagnostyczny
          </h1>
          <p className="text-muted-foreground mb-4">
            Odpowiedz na {questions.length} pytania, aby AI mogło ustalić Twój poziom startowy
          </p>
          <div className="text-sm text-primary font-medium">
            Pytanie {currentQuestion + 1}/{questions.length}
          </div>
        </div>

        <div className="mb-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-foreground">
              {question.question}
            </h2>
            
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Wpisz odpowiedź..."
              className="text-center text-lg"
              disabled={showFeedback}
              onKeyPress={(e) => e.key === 'Enter' && !showFeedback && checkAnswer()}
            />
          </div>
          
          {showFeedback && (
            <div className={`p-4 rounded-lg mb-4 ${
              isCorrect ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border border-destructive/20'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {isCorrect ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
                <span className={`font-medium ${
                  isCorrect ? 'text-success' : 'text-destructive'
                }`}>
                  {isCorrect ? 'Prawidłowo!' : 'Nieprawidłowo'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {question.explanation}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-center">
          {!showFeedback ? (
            <Button 
              onClick={checkAnswer}
              disabled={!userAnswer.trim()}
              className="flex items-center space-x-2"
            >
              <span>Sprawdź</span>
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex items-center space-x-2">
              <span>{isLastQuestion ? 'Zobacz wynik' : 'Następne pytanie'}</span>
              <ArrowRight size={16} />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}