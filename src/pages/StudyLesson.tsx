import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Clock, 
  HelpCircle, 
  Eye, 
  Send, 
  ArrowLeft, 
  CheckCircle,
  AlertTriangle,
  MessageSquare,
  Upload
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Skill, StudySession, LessonStep } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentMaterialsWizard } from '@/components/StudentMaterialsWizard';
import { Seo } from '@/components/Seo';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { normalizeMath } from '@/lib/markdown';
export default function StudyLesson() {
  const { skillId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [userInput, setUserInput] = useState('');
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pseudoActivityStrikes, setPseudoActivityStrikes] = useState(0);
  const [responseStartTime, setResponseStartTime] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [canRevealSolution, setCanRevealSolution] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const navigate = useNavigate();
  
const messagesEndRef = useRef<HTMLDivElement>(null);
const messagesContainerRef = useRef<HTMLDivElement>(null);
const autoStartedRef = useRef(false);
const [pendingMessage, setPendingMessage] = useState<string | null>(null);
const [optimisticIntro, setOptimisticIntro] = useState<string | null>(null);
const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Function to render AI response with lesson report detection
  const renderAIResponse = (response: string) => {
    // Try to detect JSON lesson report
    const jsonPattern = /```json\s*\n?(\{[\s\S]*?\})\s*\n?```/;
    const match = response.match(jsonPattern);
    
    if (match) {
      try {
        const jsonData = JSON.parse(match[1]);
        if (jsonData.mastered || jsonData.struggled || jsonData.nextSuggested) {
          // Split response into text and JSON parts
          const textPart = response.replace(jsonPattern, '').trim();
          
          return (
            <div className="space-y-4">
              {textPart && (
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {normalizeMath(textPart)}
                  </ReactMarkdown>
                </div>
              )}
              <div className="bg-accent/20 border border-accent rounded-lg p-4">
                <h4 className="font-semibold text-sm mb-3">📋 Raport z lekcji</h4>
                
                {jsonData.mastered && jsonData.mastered.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">
                      ✅ Opanowane umiejętności:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {jsonData.mastered.length} umiejętność(i)
                    </p>
                  </div>
                )}
                
                {jsonData.struggled && jsonData.struggled.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-1">
                      ⚠️ Wymagają powtórzenia:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {jsonData.struggled.length} umiejętność(i)
                    </p>
                  </div>
                )}
                
                {jsonData.nextSuggested && (
                  <div>
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">
                      📚 Następny temat:
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Przygotowana kolejna lekcja
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        }
      } catch (e) {
        // If JSON parsing fails, fall through to default rendering
      }
    }
    
    // Default rendering for regular responses with Markdown + LaTeX
    return (
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {normalizeMath(response)}
        </ReactMarkdown>
      </div>
    );
  };

  // Fetch skill data
  const { data: skill } = useQuery({
    queryKey: ['skill', skillId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();
      
      if (error) throw error;
      return data as Skill;
    },
    enabled: !!skillId,
  });
  // Optimistic first message generator
  const generateIntro = () => {
    if (!skill) return '';
    const levelText = skill.level === 'extended' ? 'rozszerzonej' : 'podstawowej';
    return `### Cel ucznia
Poznać w praktyce kluczowe kroki dla tematu: ${skill.name} (poziom ${levelText}).

### Szybka diagnoza
Zaczniemy od krótkiego, licealnego przykładu i sprawdzimy Twój tok rozumowania.

### Kroki
1. Zidentyfikuj typ zadania i zapis formalny.
2. Wskaż pierwszy sensowny krok przekształcenia.
3. Wykonaj obliczenie i sprawdź wynik.

### Pytanie sprawdzające
Gotów? Jak rozpocząłbyś rozwiązanie w kontekście: ${skill.description || 'tego zagadnienia'}?`;
  };

  // Fetch current session and lesson steps
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ['study-session', skillId, user?.id],
    queryFn: async () => {
      if (!user?.id || !skillId) return null;

      // Try to resume from saved session
      const savedKey = `study_session_${user.id}_${skillId}`;
      const savedId = localStorage.getItem(savedKey);

      let session: StudySession | null = null;
      if (savedId) {
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('id', savedId)
          .eq('user_id', user.id)
          .maybeSingle();
        if (error) throw error;
        session = data as StudySession | null;
      }

      if (!session) {
        // Fallback to latest active session
        const { data, error } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('skill_id', skillId)
          .eq('status', 'in_progress')
          .order('created_at', { ascending: false })
          .maybeSingle();
        if (error) throw error;
        session = data as StudySession | null;
        if (session?.id) localStorage.setItem(savedKey, session.id);
      }

      if (!session) return null;

      // Get lesson steps for this session
      const { data: steps, error: stepsError } = await supabase
        .from('lesson_steps')
        .select('*')
        .eq('session_id', session.id)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;

      return {
        session,
        steps: steps as LessonStep[]
      };
    },
    enabled: !!user?.id && !!skillId,
  });

  // Initialize session if none exists
  const initSessionMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !skillId) throw new Error('Missing user or skill');

      const { data, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          skill_id: skillId,
          session_type: 'lesson',
          status: 'in_progress',
          ai_model_used: 'gpt-4o'
        })
        .select()
        .single();

      if (error) throw error;
      return data as StudySession;
    },
    onSuccess: (session) => {
      setCurrentSession(session);
      setResponseStartTime(Date.now());
      try { localStorage.setItem(`study_session_${user?.id}_${skillId}`, session.id); } catch {}
      queryClient.invalidateQueries({ queryKey: ['study-session', skillId, user?.id] });
      // If user tried to send a message before session existed, send it now
      if (pendingMessage) {
        sendMessageMutation.mutate({
          message: pendingMessage,
          sessionId: session.id
        });
        setPendingMessage(null);
      }
    },
  });

  // Send message to AI tutor
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionId }: { message: string; sessionId: string }) => {
      const responseTime = responseStartTime ? Date.now() - responseStartTime : 0;
      
      const { data, error } = await supabase.functions.invoke('study-tutor', {
        body: {
          message,
          sessionId,
          skillId,
          responseTime,
          stepType: showHint ? 'hint' : 'question'
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setUserInput('');
      setIsLoading(false);
      setResponseStartTime(Date.now());
      setShowHint(false);
      // Show AI response immediately if no steps yet (avoid blank start screen)
      if (((sessionData?.steps?.length || 0) === 0) && data?.message) {
        setOptimisticIntro(data.message);
      }
      // ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['study-session', skillId, user?.id] });
      
      // Handle pseudo-activity detection
      if (data.pseudoActivityDetected) {
        setPseudoActivityStrikes(prev => {
          const newStrikes = prev + 1;
          if (newStrikes >= 3) {
            toast({
              title: "Zwolnij tempo",
              description: "Ważne jest, byś samodzielnie przeanalizował rozwiązanie.",
              variant: "destructive",
            });
          }
          return newStrikes;
        });
      } else if (data.correctAnswer) {
        setPseudoActivityStrikes(prev => Math.max(0, prev - 1));
        setAttemptCount(0);
        setCanRevealSolution(false);
      } else {
        setAttemptCount(prev => {
          const newCount = prev + 1;
          if (newCount >= 2) {
            setCanRevealSolution(true);
          }
          return newCount;
        });
      }

      refetchSession();
    },
    onError: (error) => {
      setIsLoading(false);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości. Spróbuj ponownie.",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    }
  });

  // Handle sending message
  const handleSendMessage = () => {
    const raw = userInput.trim();
    if (!raw || isLoading) return;
    const stepsCount = sessionData?.steps?.length || 0;
    const lower = raw.toLowerCase();
    let msg = raw;
    if (stepsCount === 0 && [
      'zacznij', 'rozpocznij', 'start', 'startuj', 'zacznij lekcję', 'rozpocznij lekcję'
    ].includes(lower)) {
      msg = 'Rozpocznij lekcję';
    }
    if (currentSession) {
      setIsLoading(true);
      sendMessageMutation.mutate({ message: msg, sessionId: currentSession.id });
    } else if (!initSessionMutation.isPending) {
      setIsLoading(true);
      setPendingMessage(msg);
      initSessionMutation.mutate();
    }
  };
  // Handle requesting hint
  const handleRequestHint = () => {
    if (!currentSession || isLoading) return;
    
    setShowHint(true);
    setIsLoading(true);
    sendMessageMutation.mutate({
      message: "Poproszę o podpowiedź",
      sessionId: currentSession.id
    });
  };

  // Handle revealing solution
  const handleRevealSolution = () => {
    if (!currentSession || isLoading) return;
    
    setIsLoading(true);
    sendMessageMutation.mutate({
      message: "Pokaż rozwiązanie",
      sessionId: currentSession.id
    });
  };

  // Manual start lesson
  const handleStartLesson = () => {
    if (isLoading) return;
    autoStartedRef.current = true;
    const hasSteps = (sessionData?.steps?.length || 0) > 0;
    // No optimistic intro – wait for the AI's first response
    if (currentSession) {
      setIsLoading(true);
      sendMessageMutation.mutate({
        message: 'Rozpocznij lekcję',
        sessionId: currentSession.id
      });
    } else if (!initSessionMutation.isPending) {
      setIsLoading(true);
      setPendingMessage('Rozpocznij lekcję');
      initSessionMutation.mutate();
    }
  };

  useEffect(() => {
    console.log('StudyLesson useEffect triggered:', {
      userId: user?.id,
      skillId,
      hasSessionData: !!sessionData?.session,
      isInitPending: initSessionMutation.isPending,
      stepsLength: sessionData?.steps?.length || 0
    });

    if (user?.id && skillId && !sessionData?.session && !initSessionMutation.isPending) {
      console.log('Creating new session...');
      initSessionMutation.mutate();
    } else if (sessionData?.session) {
      console.log('Setting existing session:', sessionData.session.id);
      setCurrentSession(sessionData.session);
      setResponseStartTime(Date.now());
      
      // Start lesson automatically if no steps exist yet (only once)
      if ((sessionData.steps.length === 0) && !autoStartedRef.current && !pendingMessage) {
        console.log('No steps found, starting lesson automatically...');
        autoStartedRef.current = true;
        setTimeout(() => {
          console.log('Sending automatic start lesson message...');
          sendMessageMutation.mutate({
            message: 'Rozpocznij lekcję',
            sessionId: sessionData.session.id
          });
        }, 800);
      } else {
        console.log('Steps already exist:', sessionData.steps.length);
      }
    }
  }, [user?.id, skillId, sessionData?.session, sessionData?.steps?.length]);

  // removed duplicate auto-start effect to prevent double starts

  // Auto-scroll to bottom of messages (container-based to avoid overscroll)
  useEffect(() => {
    const c = messagesContainerRef.current;
    if (!c) return;
    requestAnimationFrame(() => c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' }));
  }, [sessionData?.steps]);

  // Keep newest content visible while AI "pisze"
  useEffect(() => {
    if (!isLoading) return;
    const c = messagesContainerRef.current;
    if (!c) return;
    requestAnimationFrame(() => c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' }));
  }, [isLoading]);

  // When real steps arrive, remove optimistic intro
  useEffect(() => {
    if ((sessionData?.steps?.length || 0) > 0 && optimisticIntro) {
      setOptimisticIntro(null);
    }
  }, [sessionData?.steps?.length]);

  // Auto-focus input after each AI odpowiedź/zmiana stanu
  useEffect(() => {
    if (!isLoading) {
      textareaRef.current?.focus();
    }
  }, [isLoading, sessionData?.steps?.length]);

  if (!skill) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Ładowanie lekcji...</h3>
          </div>
        </div>
      </div>
    );
  }

  const session = sessionData?.session;
  const steps = sessionData?.steps || [];
  const completionPercentage = session ? (session.completed_steps / Math.max(session.total_steps, 1)) * 100 : 0;

  return (
    <div className="container mx-auto px-0 md:px-4 py-2 md:py-6 max-w-6xl">
      <Seo
        title={`Lekcja — ${skill.name}`}
        description={`Study & Learn: ${skill.description || 'Lekcja z tutorem AI'}`}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: `Lekcja — ${skill.name}`,
          description: `Study & Learn: ${skill.description || 'Lekcja z tutorem AI'}`
        }}
      />
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold">{skill.name}</h1>
            <p className="text-muted-foreground">{skill.description}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs md:text-sm">
              <Badge variant="outline">{skill.department}</Badge>
              <Badge variant={skill.level === 'extended' ? 'default' : 'secondary'}>
                {skill.level === 'extended' ? 'Rozszerzona' : 'Podstawa'}
              </Badge>
              <Badge variant="secondary">Klasa {skill.class_level}</Badge>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs">Trudność:</span>
                {[1,2,3,4,5].map(i => (
                  <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= skill.difficulty_rating ? 'bg-primary' : 'bg-muted'}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:gap-2 w-full md:w-auto">
            <Badge variant="outline" className="w-auto">
              <Clock className="w-3 h-3 mr-1" />
              ~{skill.estimated_time_minutes} min
            </Badge>
            <Link to="/chat" className="w-full md:w-auto">
              <Button variant="default" size="sm" className="w-full md:w-auto flex items-center gap-2 shadow-primary" onClick={() => console.log('cta_chat_clicked', { source: 'study-lesson', skillId })}>
                <MessageSquare className="w-4 h-4" /> Zapytaj korepetytora
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="w-full md:w-auto flex items-center gap-2" onClick={() => setMaterialsOpen(true)}>
              <Upload className="w-4 h-4" /> Dodaj materiały
            </Button>
          </div>
        </div>

        {session && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Postęp lekcji</span>
              <span>{session.completed_steps}/{session.total_steps} kroków</span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Pseudo-activity warning (hide at start) */}
      {pseudoActivityStrikes > 0 && (steps.length > 2) && (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Uwaga: {pseudoActivityStrikes}/3 ostrzeżeń za zbyt szybkie odpowiedzi. 
            Poświęć więcej czasu na analizę zadania.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Panel */}
        <div className="lg:col-span-2 w-full">
          <Card className="flex flex-col rounded-none md:rounded-xl border-0 md:border overflow-hidden">
            <CardHeader className="hidden md:block">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Rozmowa z tutorem AI
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-col">
              {/* Messages */}
              <div ref={messagesContainerRef} className="p-3 md:p-6 space-y-6">
                {steps.length === 0 && !isLoading && !optimisticIntro && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Rozpocznij rozmowę, aby rozpocząć lekcję sokratejską
                    </p>
                    <div className="mt-4 flex justify-center">
                      <Button size="sm" onClick={handleStartLesson} disabled={isLoading}>
                        Rozpocznij lekcję
                      </Button>
                    </div>
                  </div>
                )}

                {optimisticIntro && (
                  <div className="flex gap-3">
                    <div className="hidden md:flex w-8 h-8 rounded-full bg-primary items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="bg-muted rounded-2xl p-4 w-full break-words">
                        {renderAIResponse(optimisticIntro)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Krok 1</span>
                        <Badge variant="outline" className="text-xs">Wprowadzenie</Badge>
                      </div>
                    </div>
                  </div>
                )}

                {steps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    {/* Show user input first if it exists */}
                    {step.user_input && (
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="bg-primary rounded-2xl p-4 text-primary-foreground break-words">
                            <p className="whitespace-pre-wrap">{step.user_input}</p>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-end">
                            {step.is_correct === true && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Poprawnie
                              </Badge>
                            )}
                            {step.is_correct === false && (
                              <Badge variant="destructive" className="text-xs">
                                Spróbuj ponownie
                              </Badge>
                            )}
                            {step.response_time_ms && (
                              <span>{(step.response_time_ms / 1000).toFixed(1)}s</span>
                            )}
                          </div>
                        </div>
                        <div className="hidden md:flex w-8 h-8 rounded-full bg-accent items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">Ty</span>
                        </div>
                      </div>
                    )}

                    {/* Show AI response after user input */}
                    {step.ai_response && (
                      <div className="flex gap-3">
                       <div className="hidden md:flex w-8 h-8 rounded-full bg-primary items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-primary-foreground" />
                        </div>
                         <div className="flex-1 min-w-0 space-y-2">
                            <div className="bg-muted rounded-2xl p-4 w-full break-words">
                              {renderAIResponse(step.ai_response)}
                           </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Krok {step.step_number}</span>
                            {step.step_type === 'hint' && (
                              <Badge variant="outline" className="text-xs">
                                Podpowiedź
                              </Badge>
                            )}
                            {step.step_type === 'solution' && (
                              <Badge variant="secondary" className="text-xs">
                                Rozwiązanie
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      <Brain className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="bg-muted p-3 rounded-lg w-full">
                        <div className="flex items-center gap-2">
                          <div className="animate-pulse flex space-x-1">
                            <div className="rounded-full bg-primary h-2 w-2"></div>
                            <div className="rounded-full bg-primary h-2 w-2"></div>
                            <div className="rounded-full bg-primary h-2 w-2"></div>
                          </div>
                          <span className="text-sm text-muted-foreground">Tutor myśli...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-2 md:p-4 border-t border-border pb-[env(safe-area-inset-bottom)] space-y-3">
                <Textarea
                  ref={textareaRef}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Napisz swoją odpowiedź lub zadaj pytanie..."
                  className="min-h-[72px] md:min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  disabled={isLoading}
                />

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRequestHint}
                      disabled={isLoading || showHint}
                    >
                      <HelpCircle className="w-4 h-4 mr-2" />
                      Podpowiedź
                    </Button>

                    {canRevealSolution && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRevealSolution}
                        disabled={isLoading}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Pokaż rozwiązanie
                      </Button>
                    )}
                  </div>

                  <Button
                    onClick={handleSendMessage}
                    disabled={!userInput.trim() || isLoading}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Wyślij
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Panel */}
        <div className="space-y-4">
          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle className="text-base">Statystyki sesji</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {session && (
                <>
                  <div className="flex justify-between text-sm">
                    <span>Wykorzystane wskazówki:</span>
                    <span className="font-medium">{session.hints_used}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Wczesne rozwiązania:</span>
                    <span className="font-medium">{session.early_reveals}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ostrzeżenia:</span>
                    <span className="font-medium">{pseudoActivityStrikes}/3</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span>Tokens użyte:</span>
                    <span className="font-medium">{session.total_tokens_used}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="hidden md:block">
            <CardHeader>
              <CardTitle className="text-base">Informacje o umiejętności</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Dział:</span>
                  <Badge variant="outline">{skill.department}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Poziom:</span>
                  <Badge variant={skill.level === 'extended' ? 'default' : 'secondary'}>
                    {skill.level === 'extended' ? 'Rozszerzona' : 'Podstawa'}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Klasa:</span>
                  <span className="font-medium">{skill.class_level}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Trudność:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i <= skill.difficulty_rating ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {skill.men_code && (
                <>
                  <Separator />
                  <div className="text-xs text-muted-foreground">
                    Kod MEN: {skill.men_code}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={materialsOpen} onOpenChange={setMaterialsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dodaj materiały</DialogTitle>
          </DialogHeader>
          <StudentMaterialsWizard
            onStartLesson={(id) => {
              setMaterialsOpen(false);
              if (id !== skillId) {
                navigate(`/study/lesson/${id}`);
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}