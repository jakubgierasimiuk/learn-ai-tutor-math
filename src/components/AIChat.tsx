import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Brain, Send, ThumbsUp, ThumbsDown, RotateCcw, User, Bot } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'assistant_review';
  content: string;
  timestamp: Date;
}

const mockLessonData = {
  topic: "Twierdzenie Pitagorasa",
  description: "Poznaj związek między długościami boków w trójkącie prostokątnym"
};

const initialMessage: Message = {
  id: '1',
  role: 'assistant',
  content: `Cześć! Dziś poznamy **Twierdzenie Pitagorasa** 📐

Twierdzenie Pitagorasa to fundamentalna reguła w geometrii. Mówi ono, że w trójkącie prostokątnym:

**a² + b² = c²**

Gdzie:
- a i b to długości przyprostokątnych
- c to długość przeciwprostokątnej (najdłuższego boku)

Na przykład, jeśli mamy trójkąt prostokątny o bokach 3 i 4, to najdłuższy bok będzie miał długość 5, ponieważ: 3² + 4² = 9 + 16 = 25 = 5²

Czy rozumiesz to wyjaśnienie?`,
  timestamp: new Date()
};

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showUnderstanding, setShowUnderstanding] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateAIResponse = (userInput: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = "";
      
      if (userInput.toLowerCase().includes("nie rozumiem") || userInput.includes("wytłumacz ponownie")) {
        // Reviewer AI response
        response = `Rozumiem, że to może być trudne! 😊 Spróbujmy jeszcze raz, prostszymi słowami:

Wyobraź sobie, że masz prostokątny kawałek papieru. Jeśli zgibniesz go po przekątnej, otrzymasz trójkąt prostokątny.

Twierdzenie Pitagorasa to jak "magiczna formula" dla takich trójkątów:
- Weź długości dwóch krótszych boków
- Podnieś każdą do kwadratu (pomnóż przez siebie)
- Dodaj te kwadraty
- Rezultat to kwadrat najdłuższego boku!

**Prosty przykład:** Trójkąt o bokach 3, 4, ? 
3×3 + 4×4 = 9 + 16 = 25
√25 = 5 ← To jest długość najdłuższego boku!

Czy teraz jest jaśniejsze?`;
      } else if (userInput.toLowerCase().includes("tak") || userInput.toLowerCase().includes("rozumiem")) {
        response = `Świetnie! 🎉 Teraz przejdźmy do praktyki!

**Zadanie:** W trójkącie prostokątnym jedna przyprostokątna ma długość 6 cm, a druga 8 cm. Jaka jest długość przeciwprostokątnej?

Spróbuj rozwiązać to samodzielnie! Pamiętaj o wzorze: a² + b² = c²

Napisz swoje rozwiązanie, a ja je sprawdzę 😊`;
        setShowUnderstanding(false);
      } else if (userInput.includes("6") && userInput.includes("8") && userInput.includes("10")) {
        response = `Doskonale! 🌟 Twoja odpowiedź jest poprawna!

6² + 8² = 36 + 64 = 100
√100 = 10 cm

Świetnie rozwiązałeś to zadanie! Widzę, że rozumiesz Twierdzenie Pitagorasa.

**Podsumowanie lekcji:**
✅ Poznałeś wzór a² + b² = c²
✅ Rozumiesz, co to są przyprostokątne i przeciwprostokątna
✅ Potrafisz zastosować twierdzenie w praktyce

Gratulacje! Ukończyłeś lekcję o Twierdzeniu Pitagorasa! 🎊`;
      } else {
        response = `Interesujące pytanie! Pozwól, że odpowiem na nie w kontekście Twierdzenia Pitagorasa.

${userInput.length > 10 ? 'Twoje pytanie dotyczy ważnego aspektu geometrii.' : ''} 

Czy chciałbyś, żebym wyjaśnił coś konkretnego odnośnie wzoru a² + b² = c²?`;
      }

      const aiMessage: Message = {
        id: Date.now().toString(),
        role: userInput.toLowerCase().includes("nie rozumiem") ? 'assistant_review' : 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setShowUnderstanding(true);
    }, 1500 + Math.random() * 1000); // Simulate typing delay
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: newMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    simulateAIResponse(newMessage);
    setNewMessage("");
    setShowUnderstanding(false);
  };

  const handleQuickResponse = (response: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    simulateAIResponse(response);
    setShowUnderstanding(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-accent/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{mockLessonData.topic}</h1>
              <p className="text-muted-foreground">{mockLessonData.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-2 w-fit">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            AI Tutor aktywny
          </Badge>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col shadow-card">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role !== 'user' && (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant_review' 
                        ? 'bg-warning/10 text-warning' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      <Bot className="w-5 h-5" />
                    </div>
                  )}
                  
                  <div className={`max-w-[70%] ${message.role === 'user' ? 'order-2' : ''}`}>
                    <div className={`rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground ml-auto'
                        : message.role === 'assistant_review'
                        ? 'bg-warning/10 border border-warning/20'
                        : 'bg-muted'
                    }`}>
                      {message.role === 'assistant_review' && (
                        <div className="flex items-center gap-2 mb-2 text-warning text-sm font-medium">
                          <RotateCcw className="w-4 h-4" />
                          Reviewer AI - Uproszczone wyjaśnienie
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">
                        {message.content.split('**').map((part, index) => 
                          index % 2 === 1 ? <strong key={index}>{part}</strong> : part
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 px-2">
                      {message.timestamp.toLocaleTimeString('pl-PL', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>

                  {message.role === 'user' && (
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex gap-4 justify-start">
                  <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {showUnderstanding && !isTyping && (
              <div className="p-4 border-t border-border bg-muted/30">
                <p className="text-sm text-muted-foreground mb-3">Czy rozumiesz wyjaśnienie?</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickResponse("Tak, rozumiem")}
                    className="flex items-center gap-2"
                  >
                    <ThumbsUp className="w-4 h-4" />
                    Tak, rozumiem
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickResponse("Nie rozumiem, wytłumacz ponownie")}
                    className="flex items-center gap-2"
                  >
                    <ThumbsDown className="w-4 h-4" />
                    Nie rozumiem
                  </Button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-3">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Zadaj pytanie lub napisz swoją odpowiedź..."
                  className="flex-1"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isTyping}
                  className="shadow-primary"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};