import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

export const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Cześć! Jestem Twoim AI korepetytorem. Mogę pomóc Ci z matematyką, wytłumaczyć pojęcia i rozwiązać zadania. W czym mogę Ci dzisiaj pomóc?',
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Step 1: Recognize skill from user message
      const { data: skillRecognition, error: recognitionError } = await supabase.functions.invoke('skill-recognition', {
        body: { 
          message: userInput
        }
      });

      if (recognitionError) {
        console.error('Skill recognition error:', recognitionError);
        throw new Error('Nie mogłem rozpoznać umiejętności z Twojego pytania.');
      }

      let skillId = skillRecognition?.skillId;
      let skillName = skillRecognition?.skillName;

      // If no skill recognized, ask for clarification
      if (!skillId || skillRecognition.confidence < 0.6) {
        const clarificationMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: `Nie jestem pewien, z której umiejętności matematycznej potrzebujesz pomocy. Czy możesz być bardziej konkretny? Na przykład: "potrzebuję pomocy z równaniami kwadratowymi" lub "mam problemy z pochodnymi".`,
          role: 'assistant',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, clarificationMessage]);
        setIsLoading(false);
        return;
      }

      console.log(`Rozpoznana umiejętność: ${skillName} (${skillId})`);

      // Step 2: Start chat with recognized skill  
      console.log('Calling study-tutor with endpoint /chat, skillId:', skillId);
      
      const { data: chatData, error: chatError } = await supabase.functions.invoke('study-tutor', {
        body: { 
          message: userInput,
          skillId: skillId,
          endpoint: 'chat' // Add endpoint parameter instead of URL path
        }
      });

      if (chatError) {
        console.error('Chat error:', chatError);
        throw new Error('Wystąpił problem podczas rozmowy z AI.');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: chatData.message || 'Rozpocznijmy naukę tej umiejętności!',
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Nie mogę się połączyć z AI. Spróbuj ponownie.';
      
      toast({
        title: "Błąd",
        description: errorMessage,
        variant: "destructive"
      });

      // Remove user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          AI Korepetytor
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex gap-2 max-w-[80%] ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {message.role === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString('pl-PL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Zadaj pytanie o matematykę..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || isLoading}
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};