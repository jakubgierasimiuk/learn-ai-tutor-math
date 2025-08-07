import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
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
  MessageSquare
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { Skill, StudySession, LessonStep } from '@/types';

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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Fetch current session and lesson steps
  const { data: sessionData, refetch: refetchSession } = useQuery({
    queryKey: ['study-session', skillId, user?.id],
    queryFn: async () => {
      if (!user?.id || !skillId) return null;

      // Get current active session
      const { data: session, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('skill_id', skillId)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })
        .maybeSingle();

      if (error) throw error;

      if (!session) return null;

      // Get lesson steps for this session
      const { data: steps, error: stepsError } = await supabase
        .from('lesson_steps')
        .select('*')
        .eq('session_id', session.id)
        .order('step_number', { ascending: true });

      if (stepsError) throw stepsError;

      return {
        session: session as StudySession,
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
      queryClient.invalidateQueries({ queryKey: ['study-session', skillId, user?.id] });
      
      // Start lesson automatically after session creation
      setTimeout(() => {
        sendMessageMutation.mutate({
          message: "Rozpocznij lekcję",
          sessionId: session.id
        });
      }, 1000);
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
    if (!userInput.trim() || !currentSession || isLoading) return;
    
    setIsLoading(true);
    sendMessageMutation.mutate({
      message: userInput.trim(),
      sessionId: currentSession.id
    });
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

  // Start session on component mount
  useEffect(() => {
    if (user?.id && skillId && !sessionData?.session && !initSessionMutation.isPending) {
      initSessionMutation.mutate();
    } else if (sessionData?.session) {
      setCurrentSession(sessionData.session);
      setResponseStartTime(Date.now());
      
      // Start lesson automatically if no steps exist yet
      if (sessionData.steps.length === 0) {
        setTimeout(() => {
          sendMessageMutation.mutate({
            message: "Rozpocznij lekcję",
            sessionId: sessionData.session.id
          });
        }, 1000);
      }
    }
  }, [user?.id, skillId, sessionData]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [sessionData?.steps]);

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
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Powrót
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{skill.name}</h1>
            <p className="text-muted-foreground">{skill.description}</p>
          </div>
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />
            ~{skill.estimated_time_minutes} min
          </Badge>
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

      {/* Pseudo-activity warning */}
      {pseudoActivityStrikes > 0 && (
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
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Rozmowa z tutorem AI
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4">
                {steps.length === 0 && !isLoading && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Rozpocznij rozmowę, aby rozpocząć lekcję sokratejską
                    </p>
                  </div>
                )}

                {steps.map((step, index) => (
                  <div key={step.id} className="space-y-2">
                    {step.ai_response && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                          <Brain className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="whitespace-pre-wrap">{step.ai_response}</p>
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

                    {step.user_input && (
                      <div className="flex gap-3 justify-end">
                        <div className="flex-1 max-w-sm space-y-2">
                          <div className="bg-primary p-3 rounded-lg text-primary-foreground">
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
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-medium">Ty</span>
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
                      <div className="bg-muted p-3 rounded-lg">
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
              <div className="space-y-3">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Napisz swoją odpowiedź lub zadaj pytanie..."
                  className="min-h-[80px]"
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
          <Card>
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

          <Card>
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
    </div>
  );
}