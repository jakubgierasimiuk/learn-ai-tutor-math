import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, User, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  type: 'user' | 'ai';
  content: string;
  isError?: boolean;
}

const tutorialScenarios = [
  {
    title: "Scenariusz 1: Nie rozumiem wyjaśnienia",
    messages: [
      { type: 'ai', content: 'Rozwiążmy równanie: 2x + 5 = 11. Najpierw odejmujemy 5 z obu stron.' },
      { type: 'user', content: 'Nie rozumiem dlaczego odejmujemy 5. Możesz wyjaśnić?' },
      { type: 'ai', content: 'Oczywiście! Chcemy zostać z samym x. Teraz mamy "2x + 5". Żeby pozbyć się +5, robimy odwrotną operację, czyli odejmujemy 5. Ale żeby równanie było nadal prawdziwe, musimy to zrobić z obu stron. Czy teraz jest jasne?' },
      { type: 'user', content: 'Tak, teraz rozumiem. Co robimy dalej?' }
    ]
  },
  {
    title: "Scenariusz 2: Popełniam błąd",
    messages: [
      { type: 'ai', content: 'Oblicz: (x + 3)²' },
      { type: 'user', content: 'x² + 9', isError: true },
      { type: 'ai', content: 'Widzę błąd! Zapomniałeś o środkowym składniku. (x + 3)² = x² + 2·x·3 + 3² = x² + 6x + 9. Pamiętaj wzór: (a + b)² = a² + 2ab + b². Chcesz, żebym wyjaśnił skąd się bierze ten wzór?' },
      { type: 'user', content: 'Tak, proszę wyjaśnij!' }
    ]
  },
  {
    title: "Scenariusz 3: Proszę o dodatkowe przykłady",
    messages: [
      { type: 'ai', content: 'Świetnie! Rozwiązałeś poprawnie równanie x + 4 = 10.' },
      { type: 'user', content: 'Mogę dostać więcej podobnych przykładów do ćwiczenia?' },
      { type: 'ai', content: 'Oczywiście! Oto kilka podobnych równań: 1) x + 7 = 15, 2) x + 2 = 9, 3) x + 6 = 14. Rozwiąż je krok po kroku, a ja sprawdzę każde.' },
      { type: 'user', content: 'Dziękuję, zaczynam od pierwszego!' }
    ]
  }
];

export function AITutorial() {
  const [currentScenario, setCurrentScenario] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(0);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const scenario = tutorialScenarios[currentScenario];
  const message = scenario.messages[currentMessage];
  const isLastMessage = currentMessage === scenario.messages.length - 1;
  const isLastScenario = currentScenario === tutorialScenarios.length - 1;
  
  const handleNext = () => {
    if (isLastMessage) {
      if (isLastScenario) {
        setCompleted(true);
      } else {
        setCurrentScenario(prev => prev + 1);
        setCurrentMessage(0);
      }
    } else {
      setCurrentMessage(prev => prev + 1);
    }
  };
  
  const handleComplete = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({ ai_tutorial_completed: true })
        .eq('user_id', user.id);
    }
    navigate('/onboarding/checklist');
  };

  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-3 text-foreground">
              Świetnie!
            </h1>
            <p className="text-muted-foreground mb-4">
              Teraz wiesz jak rozmawiać z AI-nauczycielem:
            </p>
            <div className="text-sm text-muted-foreground space-y-2 text-left">
              <p>✓ Pytaj o wszystko czego nie rozumiesz</p>
              <p>✓ AI cierpliwie wyjaśni każdy krok</p>
              <p>✓ Błędy są normalne - AI je naprawi</p>
              <p>✓ Proś o dodatkowe przykłady gdy potrzebujesz</p>
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
      <Card className="w-full max-w-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-foreground">
            Naucz się rozmawiać z AI
          </h1>
          <p className="text-muted-foreground mb-4">
            {scenario.title}
          </p>
          <div className="text-sm text-primary font-medium">
            Scenariusz {currentScenario + 1}/{tutorialScenarios.length}
          </div>
        </div>

        <div className="mb-8">
          {/* Show all messages up to current one */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
            {scenario.messages.slice(0, currentMessage + 1).map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.type === 'ai' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                )}
                
                <div className={`max-w-[80%] p-4 rounded-lg ${
                  msg.type === 'user' 
                    ? `${msg.isError ? 'bg-destructive/10 border border-destructive/20' : 'bg-accent/10'} text-foreground`
                    : 'bg-muted text-foreground'
                }`}>
                  <p className="text-sm">{msg.content}</p>
                  {msg.isError && (
                    <p className="text-xs text-destructive mt-1">✗ Błędna odpowiedź</p>
                  )}
                </div>
                
                {msg.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-accent" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Key learnings for current message */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-sm text-primary mb-2">💡 Co widać w tym przykładzie:</h4>
            <p className="text-xs text-muted-foreground">
              {currentMessage === 0 && "AI zawsze zaczyna od wyjaśnienia"}
              {currentMessage === 1 && message.type === 'user' && "Uczeń pyta gdy czegoś nie rozumie - to świetne!"}
              {currentMessage === 2 && "AI cierpliwie wyjaśnia i pyta czy jest jasne"}
              {currentMessage === 3 && "Uczeń potwierdza zrozumienie i pyta o dalsze kroki"}
              {message.isError && "AI łagodnie koryguje błąd i wyjaśnia prawidłowe rozwiązanie"}
              {message.content.includes("przykład") && "Uczeń prosi o dodatkowe ćwiczenia - AI chętnie je dostarcza"}
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={handleNext} className="flex items-center space-x-2">
            <span>
              {isLastMessage 
                ? (isLastScenario ? 'Zakończ tutorial' : 'Następny scenariusz')
                : 'Następna wiadomość'
              }
            </span>
            <ArrowRight size={16} />
          </Button>
        </div>
      </Card>
    </div>
  );
}