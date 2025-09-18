import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { AlertCircle, CheckCircle, Clock, HelpCircle, Lightbulb, Send, Bot, User, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PhaseProgress } from "./PhaseProgress";
import { useMathSymbols } from "@/hooks/useMathSymbols";
import MathSymbolPanel from "@/components/MathSymbolPanel";
import { useTokenUsage } from "@/hooks/useTokenUsage";
interface PhaseData {
  id: string;
  phase_number: number;
  phase_name: string;
  phase_description: string;
  ai_instructions: string;
  success_criteria: any;
  estimated_duration_minutes: number;
}
interface SkillData {
  id: string;
  name: string;
  description: string;
  department: string;
  phases: any;
}
interface SessionData {
  id: string;
  user_id: string;
  skill_id: string;
  current_phase: number;
  status: string;
  started_at: string;
}
interface PhaseBasedLessonProps {
  skillId: string;
  onComplete?: () => void;
  className?: string;
  resumeContext?: {
    previousInteractions?: any[];
    summary?: string;
  };
}
export function PhaseBasedLesson({
  skillId,
  onComplete,
  className = "",
  resumeContext
}: PhaseBasedLessonProps) {
  const [skill, setSkill] = useState<SkillData | null>(null);
  const [phases, setPhases] = useState<PhaseData[]>([]);
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseProgress, setPhaseProgress] = useState<Record<number, any>>({});
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [contextualSymbols, setContextualSymbols] = useState<string[]>([]);
  const [isFirstInteraction, setIsFirstInteraction] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [loadingStep, setLoadingStep] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const { quickSymbols, getSymbolsForText } = useMathSymbols(skillId);
  const { shouldShowSoftPaywall } = useTokenUsage();
  const chatScrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    loadSkillData();
  }, [skillId]);
  // Initialize startTime when chat history changes (new AI message)
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage.role === 'assistant') {
        setStartTime(Date.now());
      }
    }
  }, [chatHistory.length]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatScrollRef.current && chatHistory.length > 0) {
      const scrollElement = chatScrollRef.current;
      scrollElement.scrollTop = scrollElement.scrollHeight;
    }
  }, [chatHistory]);

  // Auto-close session on page unload
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (session?.id && user?.id) {
        // Auto-close session in background
        supabase.functions.invoke('auto-close-session', {
          body: {
            sessionId: session.id,
            sessionType: 'lesson',
            userId: user.id
          }
        }).catch(error => {
          console.error('Error auto-closing lesson session:', error);
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [session?.id, user?.id]);
  const loadSkillData = async () => {
    try {
      // Load skill data
      const {
        data: skillData,
        error: skillError
      } = await supabase.from('skills').select('*').eq('id', skillId).single();
      if (skillError) throw skillError;
      setSkill(skillData);

      // Load skill phases from unified content
      const {
        data: unifiedContent,
        error: unifiedError
      } = await supabase.from('unified_skill_content').select('content_data').eq('skill_id', skillId).maybeSingle();
      if (unifiedError) throw unifiedError;
      const contentData = unifiedContent?.content_data as any;
      const phases = contentData?.phases || [];
      setPhases(phases);

      // Check for existing session or create new one
      await initializeSession();
    } catch (error) {
      console.error('Error loading skill data:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować danych umiejętności",
        variant: "destructive"
      });
    }
  };
  const initializeSession = async () => {
    try {
      // Get current user first
      const {
        data: userData,
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('User not authenticated');

      // Check for existing active session - MUST filter by user_id
      const {
        data: existingSessions,
        error: sessionError
      } = await supabase.from('study_sessions')
        .select('*')
        .eq('skill_id', skillId)
        .eq('user_id', userData.user.id) // SECURITY FIX: Filter by user_id
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1);
        
      if (sessionError) throw sessionError;
      
      let sessionData;
      if (existingSessions && existingSessions.length > 0) {
        sessionData = existingSessions[0];
        setCurrentPhase(sessionData.current_phase || 1);
      } else {
        // Create new session
        const {
          data: newSession,
          error: createError
        } = await supabase.from('study_sessions').insert({
          user_id: userData.user.id,
          skill_id: skillId,
          session_type: 'lesson',
          status: 'in_progress'
        }).select().single();
        if (createError) throw createError;
        sessionData = newSession;
        setCurrentPhase(1);
      }
      setSession(sessionData);

      // Load phase progress - MUST filter by user_id
      const {
        data: progressData,
        error: progressError
      } = await supabase.from('learning_phase_progress')
        .select('*')
        .eq('skill_id', skillId)
        .eq('user_id', userData.user.id); // SECURITY FIX: Filter by user_id
        
      if (progressError) {
        console.error('Error loading phase progress:', progressError);
      } else {
        const progressMap = (progressData || []).reduce((acc, progress) => {
          acc[progress.phase_number] = progress;
          return acc;
        }, {} as Record<number, any>);
        setPhaseProgress(progressMap);
      }

      // Load chat history if session exists
      if (sessionData) {
        loadChatHistory(sessionData.id);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zainicjować sesji",
        variant: "destructive"
      });
    }
  };
  const loadChatHistory = async (sessionId: string) => {
    try {
      // Initialize chat with resume context if available
      const initialMessage = resumeContext?.summary ? `Witaj ponownie! Kontynuujemy naukę. Oto krótkie podsumowanie Twojego postępu:\n\n${resumeContext.summary}\n\nMożesz kontynuować naukę, zadać pytanie o wcześniejszy materiał, lub poprosić o powtórzenie trudniejszych fragmentów.` : 'Witaj! Jestem Mentavo AI. Napisz "Rozpocznij lekcję" aby zacząć naukę tej umiejętności.';
      
      const initialHistory = [{
        role: 'assistant',
        content: initialMessage,
        timestamp: new Date().toISOString()
      }];

      // Add token exhaustion message if needed
      if (shouldShowSoftPaywall()) {
        initialHistory.push({
          role: 'assistant',
          content: '⚠️ Twój darmowy okres się skończył. Aby kontynuować naukę, ulepsz swój plan do wersji Premium i odblokuj nieograniczony dostęp do zaawansowanych funkcji nauki.',
          timestamp: new Date().toISOString()
        });
      }

      setChatHistory(initialHistory);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };
  const sendMessage = async () => {
    if (!userInput.trim() || !session || isLoading) return;
    
    setIsLoading(true);
    const currentResponseTime = Date.now() - startTime;
    setResponseTime(currentResponseTime);
    
    // Set first interaction flag before processing
    const wasFirstInteraction = isFirstInteraction;
    if (isFirstInteraction) {
      setIsFirstInteraction(false);
    }
    
    try {
      // Process through enhanced study-tutor with cognitive analysis
      const {
        data,
        error
      } = await supabase.functions.invoke('study-tutor', {
        body: {
          message: userInput,
          sessionId: session.id,
          skillId: skillId,
          responseTime: currentResponseTime,
          stepType: 'regular',
          currentPhase,
          sessionType: 'phase_based_lesson',
          department: 'mathematics',
          resumeContext: resumeContext
        }
      });
      if (error) throw error;
      const aiResponse = data.message || 'Przepraszam, wystąpił problem z odpowiedzią.';
      const isCorrect = data.isCorrect || data.correctAnswer || aiResponse.includes('Poprawnie');

      // Add both user message and AI response at once to prevent double renders
      setChatHistory(prev => [...prev, 
        {
          role: 'user',
          content: userInput,
          timestamp: new Date().toISOString(),
          isCorrect: isCorrect
        },
        {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        }
      ]);

      // Update phase progress
      await updatePhaseProgress(isCorrect);
      setUserInput("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const updatePhaseProgress = async (isCorrect: boolean) => {
    if (!session) return;
    try {
      // Get current user for security
      const {
        data: userData,
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !userData.user) throw new Error('User not authenticated');

      const currentProgress = phaseProgress[currentPhase];
      const newCorrectAttempts = currentProgress?.correct_attempts || 0;
      const newAttemptsCount = (currentProgress?.attempts_count || 0) + 1;
      const newProgressPercentage = Math.min(100, Math.round((newCorrectAttempts + (isCorrect ? 1 : 0)) / newAttemptsCount * 100));
      const updateData = {
        user_id: userData.user.id, // SECURITY FIX: Use authenticated user ID
        skill_id: skillId,
        phase_number: currentPhase,
        progress_percentage: newProgressPercentage,
        attempts_count: newAttemptsCount,
        correct_attempts: newCorrectAttempts + (isCorrect ? 1 : 0),
        last_attempt_at: new Date().toISOString(),
        status: newProgressPercentage >= 80 ? 'completed' : 'in_progress'
      };
      const {
        error
      } = await supabase.from('learning_phase_progress').upsert(updateData, {
        onConflict: 'user_id,skill_id,phase_number'
      });
      if (error) throw error;

      // Update local state
      setPhaseProgress(prev => ({
        ...prev,
        [currentPhase]: {
          ...currentProgress,
          ...updateData
        }
      }));

      // Check if phase is completed and advance
      if (newProgressPercentage >= 80 && currentPhase < phases.length) {
        setTimeout(() => {
          setCurrentPhase(prev => prev + 1);
          toast({
            title: "Faza ukończona!",
            description: `Przechodzisz do fazy ${currentPhase + 1}`
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Error updating phase progress:', error);
    }
  };
  const handleSymbolSelect = (symbol: string) => {
    setUserInput(prev => prev + symbol);
  };

  // Update contextual symbols when input changes
  useEffect(() => {
    if (userInput.trim()) {
      const suggestedSymbols = getSymbolsForText(userInput);
      setContextualSymbols(suggestedSymbols);
    } else {
      setContextualSymbols([]);
    }
  }, [userInput, getSymbolsForText]);

  // Handle loading messages for first interaction
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading && isFirstInteraction) {
      const messages = [
        "Przygotowuję materiały do lekcji",
        "Tworzę spersonalizowany plan lekcji...",
        "Finalizuję przygotowania...",
        "⚡ Pracuję nad najlepszym planem dla Ciebie...\nSystemy AI potrzebują czasem więcej czasu na stworzenie idealnej lekcji.\nDziękuję za cierpliwość!"
      ];
      
      setLoadingStep(0);
      setLoadingMessage(messages[0]);
      
      timer = setInterval(() => {
        setLoadingStep(prev => {
          const nextStep = prev + 1;
          if (nextStep < messages.length) {
            setLoadingMessage(messages[nextStep]);
            return nextStep;
          }
          return prev;
        });
      }, 7000); // Change message every 7 seconds
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading, isFirstInteraction]);
  const askForHint = async () => {
    if (!session || isLoading) return;
    setIsLoading(true);
    try {
      // Use supabase client instead of direct fetch to ensure proper auth
      const {
        data,
        error
      } = await supabase.functions.invoke('study-tutor', {
        body: {
          message: "Poproś o podpowiedź",
          sessionId: session.id,
          skillId: skillId,
          responseTime: 0,
          stepType: 'hint',
          currentPhase: currentPhase
        }
      });
      if (error) throw error;
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.message || 'Przepraszam, nie mogę teraz udzielić podpowiedzi.',
        timestamp: new Date().toISOString(),
        isHint: true
      }]);

      // Scroll to bottom after adding hint
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error getting hint:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się pobrać podpowiedzi",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const endSession = async () => {
    if (!session || !user?.id) return;
    try {
      setIsLoading(true);

      // Generate session summary
      const {
        data,
        error
      } = await supabase.functions.invoke('session-summary', {
        body: {
          sessionId: session.id,
          sessionType: 'lesson',
          userId: user.id
        }
      });
      if (error) {
        console.error('Error generating session summary:', error);
      }

      // Mark first lesson as completed for onboarding
      await supabase.from('profiles').update({
        first_lesson_completed: true
      }).eq('user_id', user.id);
      toast({
        title: "Sesja zakończona",
        description: "Sesja została pomyślnie zakończona i zapisana."
      });

      // Navigate back or to sessions page
      if (onComplete) {
        onComplete();
      } else {
        window.history.back();
      }
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
  const getCurrentPhaseData = () => {
    return phases.find(p => p.phase_number === currentPhase);
  };
  const getPhaseProgressData = () => {
    return phases.map(phase => ({
      ...phase,
      status: phaseProgress[phase.phase_number]?.status || 'not_started',
      progress_percentage: phaseProgress[phase.phase_number]?.progress_percentage || 0
    }));
  };
  if (!skill) {
    return <div className={`animate-pulse space-y-4 ${className}`}>
        <Card>
          <CardHeader>
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </CardContent>
        </Card>
      </div>;
  }
  const currentPhaseData = getCurrentPhaseData();
  return <div className={`min-h-screen bg-background flex flex-col ${className}`}>
      {/* Fixed Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="font-semibold text-lg">{skill.name}</h1>
                
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={askForHint} disabled={isLoading} variant="ghost" size="sm" className="text-xs">
                <HelpCircle className="w-4 h-4 mr-1" />
                Podpowiedź
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Phase Progress */}
        
        
        {/* Messages Container */}
        <div ref={chatScrollRef} className="flex-1 overflow-y-auto scroll-smooth pb-4">
          {chatHistory.length === 0 ? <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Gotowy na naukę?</h3>
                <p className="text-muted-foreground mb-4">
                  Napisz "Rozpocznij lekcję" aby zacząć
                </p>
                {currentPhaseData && <div className="max-w-md mx-auto p-4 bg-muted/30 border border-border/50 rounded-xl">
                    <h4 className="font-medium text-sm mb-2">{currentPhaseData.phase_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {currentPhaseData.phase_description}
                    </p>
                  </div>}
              </div>
            </div> : <div className="space-y-6">
              {chatHistory.map((message, index) => {
            const prevMessage = chatHistory[index - 1];
            const showTimestamp = !prevMessage || new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime() > 300000; // 5 minutes

            return <div key={index}>
                    {showTimestamp && <div className="text-center mb-4">
                        <span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border">
                          {new Date(message.timestamp).toLocaleDateString('pl-PL', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                        </span>
                      </div>}
                    
                    <div className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        {message.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-primary" />}
                      </div>
                      
                      <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <div className={`inline-block px-4 py-3 rounded-2xl ${message.role === 'user' ? 'bg-primary text-primary-foreground ml-auto' : message.isHint ? 'bg-accent/30 border border-accent/50' : 'bg-muted/50 border border-border/50'}`}>
                          <div className="flex items-start gap-2">
                            {message.role === 'assistant' && message.isHint && <HelpCircle className="h-4 w-4 text-accent-foreground mt-0.5 flex-shrink-0" />}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>;
          })}
              
              {isLoading && <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block bg-muted/50 border border-border/50 px-4 py-3 rounded-2xl">
                      {isFirstInteraction ? (
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            <span className="text-sm font-medium text-foreground">{loadingMessage}</span>
                          </div>
                          {loadingStep >= 3 && (
                            <div className="text-xs text-muted-foreground mt-2 leading-relaxed">
                              Systemy AI potrzebują czasem więcej czasu na stworzenie idealnej lekcji.
                              <br />
                              Dziękuję za cierpliwość!
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse"></div>
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-75"></div>
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-pulse delay-150"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>}
            </div>}
        </div>

        {/* Fixed Input Area */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm pt-4">
          <div className="mb-3">
            <MathSymbolPanel quickSymbols={contextualSymbols.length > 0 ? contextualSymbols : quickSymbols} onSymbolSelect={handleSymbolSelect} />
          </div>
          
          {shouldShowSoftPaywall() ? (
            // Token exhausted - show upgrade banner
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <Crown className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-orange-800">
                      Okres darmowy zakończony
                    </p>
                    <p className="text-sm text-orange-600">
                      Ulepsz plan, aby kontynuować rozmowę w Study & Learn
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
                        window.location.href = data.url;
                      }
                    } catch (error) {
                      toast({
                        title: "Błąd",
                        description: "Nie udało się rozpocząć procesu upgrade'u",
                        variant: "destructive"
                      });
                    }
                  }}
                  size="sm"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Ulepsz plan
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-3 p-4 bg-muted/30 border border-border/50 rounded-2xl">
              <Input type="text" value={userInput} onChange={e => setUserInput(e.target.value)} placeholder={chatHistory.length === 0 ? "Napisz 'Rozpocznij lekcję' aby zacząć..." : "Wpisz swoją odpowiedź..."} className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60" onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }} />
              
              {chatHistory.length === 0 ? <Button onClick={() => {
              setUserInput('Rozpocznij lekcję');
              setTimeout(() => sendMessage(), 100);
            }} disabled={isLoading} size="sm" className="h-10 px-4 rounded-xl">
                  {isLoading ? 'Rozpoczynam...' : 'Rozpocznij'}
                </Button> : <Button onClick={sendMessage} disabled={!userInput.trim() || isLoading} size="sm" className="h-10 w-10 p-0 rounded-xl">
                  {isLoading ? <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>}
            </div>
          )}
          
          <div className="flex items-center justify-between pt-3 px-1">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <button onClick={endSession} className="hover:text-foreground transition-colors duration-200 font-medium">
                Zakończ sesję
              </button>
            </div>
            
          </div>
        </div>
      </div>
    </div>;
}