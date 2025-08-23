import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  // Initialize or load session on component mount
  useEffect(() => {
    if (user?.id) {
      initializeSession();
    }
  }, [user]);

  const initializeSession = async () => {
    if (!user?.id) return;

    try {
      // Check for existing active session or create new one
      const { data: existingSessions, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_type', 'chat')
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      let currentSession;
      if (existingSessions && existingSessions.length > 0) {
        currentSession = existingSessions[0];
        // Load existing chat history
        await loadChatHistory(currentSession.id);
      } else {
        // Create new session
        const { data: newSession, error: createError } = await supabase
          .from('study_sessions')
          .insert({
            user_id: user.id,
            skill_id: null, // No skill required for general chat
            session_type: 'chat',
            status: 'in_progress'
          })
          .select()
          .single();

        if (createError) throw createError;
        currentSession = newSession;
      }

      setSessionId(currentSession.id);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      const { data: interactions, error } = await supabase
        .from('learning_interactions')
        .select('*')
        .eq('session_id', sessionId)
        .order('sequence_number', { ascending: true });

      if (error) throw error;

      if (interactions && interactions.length > 0) {
        // Convert interactions to messages format
        const historyMessages = interactions.flatMap((interaction) => {
          const msgs = [];
          if (interaction.user_input) {
            msgs.push({
              id: `${interaction.id}-user`,
              content: interaction.user_input,
              role: 'user' as const,
              timestamp: new Date(interaction.interaction_timestamp)
            });
          }
          if (interaction.ai_response) {
            msgs.push({
              id: `${interaction.id}-assistant`,
              content: interaction.ai_response,
              role: 'assistant' as const,
              timestamp: new Date(interaction.interaction_timestamp)
            });
          }
          return msgs;
        });

        // Keep only the initial greeting and add history
        const initialMessage = messages[0];
        setMessages([initialMessage, ...historyMessages]);
        setSequenceNumber(interactions.length);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const saveInteraction = async (userInput: string, aiResponse: string, skillId?: string) => {
    if (!sessionId || !user?.id) return;

    try {
      await supabase
        .from('learning_interactions')
        .insert({
          user_id: user.id,
          session_id: sessionId,
          sequence_number: sequenceNumber + 1,
          user_input: userInput,
          ai_response: aiResponse,
          interaction_type: 'chat',
          content_id: skillId || null,
          response_time_ms: Date.now() - userMessageTime
        });

      setSequenceNumber(prev => prev + 1);
    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  };

  const getMessageHistory = () => {
    // Get last 8 messages (excluding initial greeting)
    const conversationMessages = messages.slice(1);
    const last8Messages = conversationMessages.slice(-8);
    
    return last8Messages.map(msg => ({
      user: msg.role === 'user' ? msg.content : undefined,
      assistant: msg.role === 'assistant' ? msg.content : undefined,
      sequence: 0, // Will be handled in backend
      tokens_estimate: Math.ceil(msg.content.length / 4) // Rough estimate
    }));
  };

  let userMessageTime = Date.now();

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId || !user?.id) return;

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
    userMessageTime = Date.now();

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
      
      // Prepare message history and context
      const messageHistory = getMessageHistory();
      
      const { data: chatData, error: chatError } = await supabase.functions.invoke('study-tutor', {
        body: { 
          message: userInput,
          skillId: skillId,
          sessionId: sessionId,
          messages: messageHistory,
          endpoint: 'chat'
        }
      });

      // DETAILED DEBUGGING LOGS
      console.log('=== CHAT RESPONSE DEBUG ===');
      console.log('chatError:', chatError);
      console.log('chatData type:', typeof chatData);
      console.log('chatData (full object):', JSON.stringify(chatData, null, 2));
      console.log('chatData.message:', chatData?.message);
      console.log('chatData keys:', chatData ? Object.keys(chatData) : 'no keys');
      console.log('=== END DEBUG ===');

      if (chatError) {
        console.error('Chat error details:', JSON.stringify(chatError, null, 2));
        throw new Error('Wystąpił problem podczas rozmowy z AI.');
      }

      if (!chatData) {
        console.error('No chatData received');
        throw new Error('Brak odpowiedzi z AI.');
      }

      const aiResponseContent = chatData.message || chatData || 'Rozpocznijmy naukę tej umiejętności!';
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponseContent,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      // Save interaction to database
      await saveInteraction(userInput, aiResponseContent, skillId);

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