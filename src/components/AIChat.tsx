import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Brain, Settings } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TokenUsageProgress } from '@/components/TokenUsageProgress';
import { UpgradePrompts } from '@/components/UpgradePrompts';
import { useTokenUsage } from '@/hooks/useTokenUsage';

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
  const [enrichedContext, setEnrichedContext] = useState(false);
  
  // CLARIFICATION CONTEXT STATE
  const [clarificationContext, setClarificationContext] = useState<{
    isWaitingForResponse: boolean;
    candidates: Array<{ id: string; name: string; department: string }>;
    originalMessage: string;
  } | null>(null);
  
  const { toast } = useToast();
  const { user } = useAuth();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
      }
    };

    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

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

    // Check token limits before sending
    const { shouldShowSoftPaywall } = useTokenUsage();
    if (shouldShowSoftPaywall()) {
      toast({
        title: "Brak tokenów",
        description: "Wykorzystałeś wszystkie tokeny w tym miesiącu. Ulepsz plan, aby kontynuować.",
        variant: "destructive"
      });
      return;
    }

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
      let skill_id: string | null = null;
      let skill_name: string | null = null;

      // Check if we're responding to clarification
      if (clarificationContext?.isWaitingForResponse) {
        skill_id = await processClarificationResponse(userInput);
        skill_name = clarificationContext.candidates.find(c => c.id === skill_id)?.name || null;
        setClarificationContext(null); // Clear context
        console.log('Processed clarification response:', { skill_id, skill_name });
      } else {
        // Step 1: Normal skill recognition
        console.log('Calling skill-recognition for:', userInput);
        const { data: skillRecognition, error: recognitionError } = await supabase.functions.invoke('skill-recognition', {
          body: { 
            message: userInput
          }
        });

        if (recognitionError) {
          console.error('Skill recognition error:', recognitionError);
          throw new Error('Nie mogłem rozpoznać umiejętności z Twojego pytania.');
        }

        console.log('Skill recognition result:', skillRecognition);

        // Handle two-stage recognition system
        if (skillRecognition?.stage === 'clarification' && skillRecognition.clarificationQuestion) {
          // AI needs clarification - show empathetic question and save context
          const clarificationMessage: Message = {
            id: (Date.now() + 1).toString(),
            content: skillRecognition.clarificationQuestion,
            role: 'assistant',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, clarificationMessage]);
          
          // Save clarification context for next message
          setClarificationContext({
            isWaitingForResponse: true,
            candidates: skillRecognition.candidatesWithIds || [],
            originalMessage: userInput
          });
          
          setIsLoading(false);
          return; // Wait for user's clarification response
        }

        skill_id = skillRecognition?.skill_id;
        skill_name = skillRecognition?.skill_name;
      }

      console.log(`Rozpoznana umiejętność: ${skill_name} (${skill_id})`);

      // Step 2: Start chat with recognized skill (using snake_case)
      console.log('Calling study-tutor with endpoint /chat, skill_id:', skill_id);
      
      // Prepare message history and context
      const messageHistory = getMessageHistory();
      
      const { data: chatData, error: chatError } = await supabase.functions.invoke('study-tutor', {
        body: { 
          message: userInput,
          skill_id: skill_id, // Use snake_case consistently
          sessionId: sessionId,
          messages: messageHistory,
          enrichedContext: enrichedContext,
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
      await saveInteraction(userInput, aiResponseContent, skill_id);

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

  // Enhanced clarification response processing with advanced fuzzy matching
  const processClarificationResponse = async (userResponse: string): Promise<string | null> => {
    if (!clarificationContext?.candidates) return null;
    
    const normalizedResponse = userResponse.toLowerCase().trim();
    const { candidates } = clarificationContext;
    
    console.log('Processing clarification response:', userResponse);
    console.log('Available candidates:', candidates.map(c => c.name));
    
    // Scoring system for candidate matching
    const candidateScores = candidates.map(candidate => {
      let score = 0;
      const candidateName = candidate.name.toLowerCase();
      const candidateWords = candidateName.split(' ').filter(word => word.length > 2);
      const responseWords = normalizedResponse.split(' ').filter(word => word.length > 2);
      
      // 1. Exact name match (highest priority)
      if (normalizedResponse.includes(candidateName) || candidateName.includes(normalizedResponse)) {
        score += 100;
      }
      
      // 2. Word-by-word matching (simplified without fuzzy tolerance)
      candidateWords.forEach(candidateWord => {
        responseWords.forEach(responseWord => {
          if (candidateWord === responseWord) {
            score += 50; // Exact word match
          } else if (candidateWord.includes(responseWord) || responseWord.includes(candidateWord)) {
            score += 30; // Partial word match
          }
        });
      });
      
      // 3. Department matching
      if (normalizedResponse.includes(candidate.department.toLowerCase())) {
        score += 20;
      }
      
      // 4. Synonym and concept matching
      const synonyms = {
        'pochodne': ['derivative', 'różniczkowanie', 'tangent'],
        'całki': ['integration', 'całkowanie', 'pole'],
        'równania': ['equation', 'rozwiązywanie', 'solve'],
        'funkcje': ['function', 'wykres', 'f(x)'],
        'geometria': ['triangle', 'circle', 'area', 'volume']
      };
      
      Object.entries(synonyms).forEach(([concept, conceptSynonyms]) => {
        if (candidateName.includes(concept)) {
          conceptSynonyms.forEach(synonym => {
            if (normalizedResponse.includes(synonym)) {
              score += 15;
            }
          });
        }
      });
      
      return { candidate, score };
    });
    
    // Sort by score and log results
    candidateScores.sort((a, b) => b.score - a.score);
    console.log('Candidate scores:', candidateScores.map(cs => ({ name: cs.candidate.name, score: cs.score })));
    
    // Try to match by number if user selected option by number
    const numberMatch = normalizedResponse.match(/^(\d+)[\s\.\)]*$/);
    if (numberMatch) {
      const selectedIndex = parseInt(numberMatch[1]) - 1;
      if (selectedIndex >= 0 && selectedIndex < candidates.length) {
        console.log(`User selected option ${numberMatch[1]} -> ${candidates[selectedIndex].name}`);
        return candidates[selectedIndex].id;
      }
    }
    
    // Return highest scoring candidate if score is above threshold
    if (candidateScores[0].score > 15) {
      console.log(`Matched candidate: ${candidateScores[0].candidate.name} (score: ${candidateScores[0].score})`);
      return candidateScores[0].candidate.id;
    }
    
    // Fallback: return first candidate if no good matches
    console.log('No good matches found, using first candidate as fallback');
    return candidates.length > 0 ? candidates[0].id : null;
  };

  const endSession = async () => {
    if (!sessionId || !user?.id) return;

    try {
      setIsLoading(true);
      
      // Generate session summary
      const { data, error } = await supabase.functions.invoke('session-summary', {
        body: {
          sessionId: sessionId,
          sessionType: 'chat',
          userId: user.id
        }
      });

      if (error) {
        console.error('Error generating session summary:', error);
      }

      // Reset chat state for new session
      setMessages([{
        id: '1',
        content: 'Cześć! Jestem Twoim AI korepetytorem. Mogę pomóc Ci z matematyką, wytłumaczyć pojęcia i rozwiązać zadania. W czym mogę Ci dzisiaj pomóc?',
        role: 'assistant',
        timestamp: new Date()
      }]);
      setSessionId(null);
      setSequenceNumber(0);
      setClarificationContext(null);

      // Initialize new session
      await initializeSession();

      toast({
        title: "Sesja zakończona",
        description: "Rozpoczęto nową sesję. Poprzednia sesja została zapisana.",
      });

    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zakończyć sesji",
        variant: "destructive"
      });
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
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            AI Korepetytor
          </div>
          <div className="flex items-center gap-2 text-sm font-normal">
            <Brain className="h-4 w-4" />
            <Label htmlFor="enriched-context" className="text-sm">
              Bogaty kontekst
            </Label>
            <Switch
              id="enriched-context"
              checked={enrichedContext}
              onCheckedChange={setEnrichedContext}
            />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col flex-1 gap-4">
        {/* Token Usage & Upgrade Prompts */}
        <UpgradePrompts context="chat" compact />
        <TokenUsageProgress />
        
        <ScrollArea ref={scrollAreaRef} className="flex-1 pr-4">
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
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                clarificationContext?.isWaitingForResponse 
                  ? "Wybierz jedną z opcji powyżej..." 
                  : "Zadaj pytanie o matematykę..."
              }
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
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={endSession}
              disabled={isLoading}
              className="flex-1"
            >
              Zakończ sesję
            </Button>
          </div>
        </div>
        
        {clarificationContext?.isWaitingForResponse && (
          <div className="text-xs text-muted-foreground text-center mt-2">
            💡 Wybierz jedną z opcji powyżej lub opisz konkretnie, czego potrzebujesz
          </div>
        )}
      </CardContent>
    </Card>
  );
};