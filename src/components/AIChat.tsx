import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Send, Brain, Settings, Crown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { TokenUsageProgress } from '@/components/TokenUsageProgress';
import { UpgradePrompts } from '@/components/UpgradePrompts';
import { ConversionPrompts } from '@/components/ConversionPrompts';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { useMathSymbols } from '@/hooks/useMathSymbols';
import MathSymbolPanel from '@/components/MathSymbolPanel';
import { useLanguage } from '@/hooks/useLanguage';
import { ExampleQuestions } from '@/components/chat/ExampleQuestions';
import { DiagnosticChoices } from '@/components/chat/DiagnosticChoices';
import { TipsPanel } from '@/components/chat/TipsPanel';
interface DiagnosticChoice {
  label: string;
  value: string;
  icon: string;
  description?: string;
}

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  quickReplies?: string[];
  diagnosticOptions?: {
    question: string;
    choices: DiagnosticChoice[];
  };
  messageType?: 'welcome' | 'diagnostic' | 'standard' | 'coaching';
}
export const AIChat = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Check if this is first time user
  const isFirstTime = !localStorage.getItem('mentavo_welcome_completed');
  
  const [messages, setMessages] = useState<Message[]>([{
    id: '1',
    content: isFirstTime 
      ? '👋 Cześć! Jestem Twoim AI nauczycielem matematyki.\n\nMożesz zapytać mnie o cokolwiek - od podstaw do matury.\nNie ma głupich pytań, tylko nieodkryte odpowiedzi! 💡'
      : 'Witaj z powrotem! O czym dziś porozmawiamy?',
    role: 'assistant',
    timestamp: new Date(),
    messageType: isFirstTime ? 'welcome' : 'standard',
    quickReplies: isFirstTime ? [] : undefined // Will be populated by ExampleQuestions component
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sequenceNumber, setSequenceNumber] = useState(0);
  const [enrichedContext, setEnrichedContext] = useState(false);
  const [hasShownTokenExhaustedMessage, setHasShownTokenExhaustedMessage] = useState(false);

  // CLARIFICATION CONTEXT STATE
  const [clarificationContext, setClarificationContext] = useState<{
    isWaitingForResponse: boolean;
    candidates: Array<{
      id: string;
      name: string;
      department: string;
    }>;
    originalMessage: string;
  } | null>(null);
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const {
    shouldShowSoftPaywall,
    getRemainingTokens,
    getUsagePercentage
  } = useTokenUsage();
  const {
    quickSymbols,
    getSymbolsForText,
    detectUIHelpRequest
  } = useMathSymbols();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  
  // Dynamic bottom padding to ensure last message is visible above the sticky input
  const [bottomPadding, setBottomPadding] = useState<number>(120);
  const [contextualSymbols, setContextualSymbols] = useState<string[]>([]);
  const [showSuccessPrompt, setShowSuccessPrompt] = useState(false);
  // Add one-time message when tokens are exhausted
  useEffect(() => {
    if (shouldShowSoftPaywall() && !hasShownTokenExhaustedMessage && messages.length > 1) {
      const exhaustedMessage: Message = {
        id: `exhausted-${Date.now()}`,
        content: 'Twój darmowy okres zakończył się! 🎓 Aby kontynuować naukę z Mentavo AI, ulepsz swój plan. Dzięki Premium będziesz mieć nieograniczony dostęp do wszystkich funkcji i 24/7 wsparcie w nauce matematyki.',
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, exhaustedMessage]);
      setHasShownTokenExhaustedMessage(true);
    }
  }, [shouldShowSoftPaywall, hasShownTokenExhaustedMessage, messages.length]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
    };

    // Immediate scroll + delayed scroll to handle dynamic content
    scrollToBottom();
    const timeoutId = setTimeout(scrollToBottom, 200);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Keep messages above the input by tracking the input container height
  useEffect(() => {
    const el = inputContainerRef.current;
    if (!el) return;

    const updatePadding = () => {
      const h = el.getBoundingClientRect().height || 0;
      setBottomPadding(h + 16); // add a small safety gap
    };

    updatePadding();
    const ro = new ResizeObserver(updatePadding);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Auto-close session on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (sessionId && user?.id) {
        // Auto-close session in background
        supabase.functions.invoke('auto-close-session', {
          body: {
            sessionId: sessionId,
            sessionType: 'chat',
            userId: user.id
          }
        }).catch(error => {
          console.error('Error auto-closing session:', error);
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, user?.id]);

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
      const {
        data: existingSessions,
        error: sessionError
      } = await supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('session_type', 'chat').eq('status', 'in_progress').order('started_at', {
        ascending: false
      }).limit(1);
      if (sessionError) throw sessionError;
      let currentSession;
      if (existingSessions && existingSessions.length > 0) {
        currentSession = existingSessions[0];
        // Load existing chat history
        await loadChatHistory(currentSession.id);
      } else {
        // Create new session
        const {
          data: newSession,
          error: createError
        } = await supabase.from('study_sessions').insert({
          user_id: user.id,
          skill_id: null,
          // No skill required for general chat
          session_type: 'chat',
          status: 'in_progress'
        }).select().single();
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
      const {
        data: interactions,
        error
      } = await supabase.from('learning_interactions').select('*').eq('session_id', sessionId).order('sequence_number', {
        ascending: true
      });
      if (error) throw error;
      if (interactions && interactions.length > 0) {
        // Convert interactions to messages format
        const historyMessages = interactions.flatMap(interaction => {
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
      await supabase.from('learning_interactions').insert({
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
      sequence: 0,
      // Will be handled in backend
      tokens_estimate: Math.ceil(msg.content.length / 4) // Rough estimate
    }));
  };
  let userMessageTime = Date.now();
  const sendMessage = async () => {
    if (!input.trim() || isLoading || !sessionId || !user?.id) return;

    // Check if user needs help with UI/symbols before processing
    const helpRequest = detectUIHelpRequest(input.trim());
    if (helpRequest.needsHelp) {
      let helpMessage = "Symbole matematyczne znajdziesz w panelu 'Symbole' poniżej ⬇️";
      if (helpRequest.symbolRequested === 'pierwiastek') {
        helpMessage = "Symbol pierwiastka √ znajdziesz w panelu 'Symbole' → zakładka 'Potęgi' ⬇️";
      } else if (helpRequest.symbolRequested === 'delta') {
        helpMessage = "Symbol delta Δ znajdziesz w panelu 'Symbole' → zakładka 'Greckie' ⬇️";
      } else if (helpRequest.symbolRequested === 'sinus') {
        helpMessage = "Symbol sinus sin znajdziesz w panelu 'Symbole' → zakładka 'Funkcje' ⬇️";
      } else if (helpRequest.symbolRequested === 'potęga') {
        helpMessage = "Symbole potęg (², ³, ⁿ) znajdziesz w panelu 'Symbole' → zakładka 'Potęgi' ⬇️";
      }
      toast({
        title: "Pomoc z symbolami",
        description: helpMessage,
        duration: 4000
      });
      setInput('');
      return;
    }

    // Block sending when tokens exhausted - no toast, just silent block
    if (shouldShowSoftPaywall()) {
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
        console.log('Processed clarification response:', {
          skill_id,
          skill_name
        });
      } else {
        // Step 1: Normal skill recognition
        console.log('Calling skill-recognition for:', userInput);
        const {
          data: skillRecognition,
          error: recognitionError
        } = await supabase.functions.invoke('skill-recognition', {
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
      const {
        data: chatData,
        error: chatError
      } = await supabase.functions.invoke('study-tutor', {
        body: {
          message: userInput,
          skillId: skill_id,
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
      
      // Check for token limit exceeded error (429)
      if (chatError || (chatData?.error === 'Token limit exceeded')) {
        console.error('Chat error details:', JSON.stringify(chatError || chatData, null, 2));
        
        // Special handling for token limit errors
        if (chatData?.error === 'Token limit exceeded') {
          throw new Error(chatData.message || 'Osiągnięto limit tokenów. Ulepsz plan, aby kontynuować naukę.');
        }
        
        throw new Error('Wystąpił problem podczas rozmowy z AI.');
      }
      if (!chatData) {
        console.error('No chatData received');
        throw new Error('Brak odpowiedzi z AI.');
      }
      const aiResponseContent = chatData.message || chatData || 'Rozpocznijmy naukę tej umiejętności!';
      
      // Parse response - support both plain string and structured response
      let assistantMessage: Message;
      if (typeof chatData === 'object' && chatData.diagnosticOptions) {
        // Structured response with diagnostic options
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: chatData.message,
          role: 'assistant',
          timestamp: new Date(),
          diagnosticOptions: chatData.diagnosticOptions,
          messageType: 'diagnostic'
        };
      } else {
        // Plain text response
        assistantMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponseContent,
          role: 'assistant',
          timestamp: new Date()
        };
      }
      setMessages(prev => [...prev, assistantMessage]);

      // Check for success moments and trigger conversion prompts
      const isPositiveResponse = aiResponseContent.includes('Świetnie!') || 
                                aiResponseContent.includes('Brawo!') || 
                                aiResponseContent.includes('Doskonale!') ||
                                aiResponseContent.includes('Bardzo dobrze!') ||
                                aiResponseContent.includes('Poprawnie!') ||
                                aiResponseContent.includes('Excellent!') ||
                                aiResponseContent.includes('Great job!');
      
      if (isPositiveResponse) {
        setTimeout(() => setShowSuccessPrompt(true), 2000); // Show after 2 seconds
      }

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
    const {
      candidates
    } = clarificationContext;
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
      return {
        candidate,
        score
      };
    });

    // Sort by score and log results
    candidateScores.sort((a, b) => b.score - a.score);
    console.log('Candidate scores:', candidateScores.map(cs => ({
      name: cs.candidate.name,
      score: cs.score
    })));

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
      setIsEndingSession(true);

      // Generate session summary
      const {
        data,
        error
      } = await supabase.functions.invoke('session-summary', {
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
        content: 'Cześć! Jestem mentavo.ai. Mogę pomóc Ci z matematyką, wytłumaczyć pojęcia i rozwiązać zadania. W czym mogę Ci dzisiaj pomóc?',
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
        description: "Rozpoczęto nową sesję. Poprzednia sesja została zapisana."
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zakończyć sesji",
        variant: "destructive"
      });
    } finally {
      setIsEndingSession(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  const handleSymbolSelect = (symbol: string) => {
    setInput(prev => prev + symbol);
  };

  // Update contextual symbols when input changes
  useEffect(() => {
    if (input.trim()) {
      const suggestedSymbols = getSymbolsForText(input);
      setContextualSymbols(suggestedSymbols);
    } else {
      setContextualSymbols([]);
    }
  }, [input, getSymbolsForText]);
  const handleSkillSelection = (skillId: string) => {
    // Navigate to the selected skill lesson
    navigate(`/study/lesson/${skillId}`);
  };
  return <div className="min-h-screen bg-background flex flex-col relative">
      {/* Tips Panel - floating in top right */}
      <div className="fixed top-4 right-4 z-20">
        <TipsPanel />
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 w-full max-w-full md:max-w-4xl md:mx-auto md:px-4 py-2 md:py-6 flex flex-col">
        {/* Token Usage & Upgrade Prompts */}
        <div className="mb-4 space-y-2">
          <UpgradePrompts context="chat" compact />
          <TokenUsageProgress />
          
          {/* Success Moment Conversion Prompts */}
          {showSuccessPrompt && (
            <ConversionPrompts 
              context="success_moment" 
              onClose={() => setShowSuccessPrompt(false)} 
            />
          )}
        </div>
        
        {/* Messages Container */}
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto scroll-smooth pb-[200px] md:pb-6">
          <div className="space-y-4 md:space-y-6">
            {messages.map((message, index) => {
            const prevMessage = messages[index - 1];
            const showTimestamp = !prevMessage || new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000; // 5 minutes

            return <div key={message.id}>
                  {showTimestamp && <div className="text-center mb-4">
                      <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                        {message.timestamp.toLocaleDateString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                      </span>
                    </div>}
                  
                  <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`${message.role === 'user' ? 'max-w-[90%] md:max-w-[85%] text-right' : 'w-full md:max-w-[85%] text-left'}`}>
                       <div className={`${message.role === 'user' ? 'inline-block ml-auto bg-primary text-primary-foreground' : 'block w-full bg-muted/50 border border-border/50'} px-3 md:px-4 py-2 md:py-3 rounded-2xl`}>
                         <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap break-words">
                           {message.content}
                         </p>
                         
                         {/* Example Questions for welcome message */}
                         {message.messageType === 'welcome' && message.role === 'assistant' && (
                           <ExampleQuestions onSelect={(question) => {
                             setInput(question);
                             localStorage.setItem('mentavo_welcome_completed', 'true');
                             setTimeout(() => sendMessage(), 100);
                           }} />
                         )}
                         
                         {/* Diagnostic Choices */}
                         {message.diagnosticOptions && message.role === 'assistant' && (
                           <DiagnosticChoices
                             question={message.diagnosticOptions.question}
                             choices={message.diagnosticOptions.choices}
                             onSelect={(value) => {
                               const choiceText = message.diagnosticOptions!.choices.find(c => c.value === value)?.label || value;
                               setInput(choiceText);
                               setTimeout(() => sendMessage(), 100);
                             }}
                           />
                         )}
                       </div>
                    </div>
                  </div>
                </div>;
          })}
            
            {isLoading && <div className="flex justify-start">
                <div className="w-full md:max-w-[85%]">
                  <div className="block w-full bg-muted/50 border border-border/50 px-4 py-3 rounded-2xl">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-75"></div>
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-150"></div>
                    </div>
                  </div>
                </div>
              </div>}
          </div>
        </div>

        {/* Clarification Options */}
        {clarificationContext && clarificationContext.candidates && <div className="mb-4 bg-accent/30 border border-accent/50 rounded-xl p-4">
            <p className="text-sm font-medium mb-3 text-accent-foreground">
              Sprecyzuj, o której umiejętności chodzi:
            </p>
            <div className="grid gap-2">
              {clarificationContext.candidates.map((skill: any, index: number) => <button key={index} onClick={() => handleSkillSelection(skill.id)} className="text-left p-3 bg-background hover:bg-accent/50 rounded-lg border border-border/50 transition-all duration-200 hover:border-accent/50">
                  <span className="font-medium text-sm">{skill.name}</span>
                  {skill.description && <span className="block text-muted-foreground text-xs mt-1">
                      {skill.description}
                    </span>}
                </button>)}
            </div>
          </div>}

        {/* Fixed Input Area or Lock Banner */}
        <div ref={inputContainerRef} className="fixed md:relative bottom-0 left-0 right-0 bg-background border-t md:border-t-0 p-3 md:p-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:pb-4 z-10">
          {shouldShowSoftPaywall() ? (
            // Show lock banner when tokens exhausted
            <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-red-50 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <Brain className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-orange-800">
                        Okres darmowy zakończony
                      </p>
                      <p className="text-sm text-orange-600">
                        Ulepsz plan, aby kontynuować rozmowę z AI
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={async () => {
                      try {
                        const { data, error } = await supabase.functions.invoke('create-checkout', {
                          body: { plan: 'paid' }
                        });
                        if (error) throw error;
                        if (data?.url) {
                          try { (window.top || window).location.href = data.url; } catch { window.location.href = data.url; }
                        }
                      } catch (error) {
                        console.error('Upgrade error:', error);
                      }
                    }}
                    size="sm" 
                    className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Ulepsz plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Normal input area when tokens available
            <>
              <div className="mb-3">
                <MathSymbolPanel quickSymbols={contextualSymbols.length > 0 ? contextualSymbols : quickSymbols} onSymbolSelect={handleSymbolSelect} />
              </div>
              <div className="flex items-end gap-2 md:gap-3 p-2 md:p-3 bg-muted/30 border-2 border-border/50 focus-within:border-primary/50 rounded-2xl transition-colors">
                <Input 
                  type="text" 
                  placeholder={t.chatPlaceholder} 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  onKeyPress={handleKeyPress} 
                  disabled={isLoading} 
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 text-base" 
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !input.trim()} 
                  size="sm" 
                  className="h-9 w-9 md:h-10 md:w-10 p-0 rounded-xl flex-shrink-0"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center justify-start pt-2 px-1">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <button 
                    onClick={endSession} 
                    disabled={isEndingSession}
                    className="hover:text-foreground transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isEndingSession && (
                      <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    )}
                    Zakończ sesję
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>;
};