import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, HelpCircle, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PhaseProgress } from "./PhaseProgress";
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
}

export function PhaseBasedLesson({ skillId, onComplete, className = "" }: PhaseBasedLessonProps) {
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
  const { toast } = useToast();
  const { user } = useAuth();
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSkillData();
  }, [skillId]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [userInput]);

  const loadSkillData = async () => {
    try {
      // Load skill data
      const { data: skillData, error: skillError } = await supabase
        .from('skills')
        .select('*')
        .eq('id', skillId)
        .single();

      if (skillError) throw skillError;
      setSkill(skillData);

      // Load skill phases from unified content
      const { data: unifiedContent, error: unifiedError } = await supabase
        .from('unified_skill_content')
        .select('content_data')
        .eq('skill_id', skillId)
        .maybeSingle();

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
        variant: "destructive",
      });
    }
  };

  const initializeSession = async () => {
    try {
      // Check for existing active session
      const { data: existingSessions, error: sessionError } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('skill_id', skillId)
        .eq('status', 'in_progress')
        .order('started_at', { ascending: false })
        .limit(1);

      if (sessionError) throw sessionError;

      let sessionData;
      if (existingSessions && existingSessions.length > 0) {
        sessionData = existingSessions[0];
        setCurrentPhase(sessionData.current_phase || 1);
      } else {
        // Create new session - get current user first
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (userError || !userData.user) throw new Error('User not authenticated');

        const { data: newSession, error: createError } = await supabase
          .from('study_sessions')
          .insert({
            user_id: userData.user.id,
            skill_id: skillId,
            session_type: 'lesson',
            status: 'in_progress'
          })
          .select()
          .single();

        if (createError) throw createError;
        sessionData = newSession;
        setCurrentPhase(1);
      }

      setSession(sessionData);

      // Load phase progress
      const { data: progressData, error: progressError } = await supabase
        .from('learning_phase_progress')
        .select('*')
        .eq('skill_id', skillId);

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
        variant: "destructive",
      });
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      // For now, start with empty chat history since lesson_steps table was removed
      // In a real implementation, you might want to store chat history in a different way
      // or use the learning_interactions table for this purpose
      setChatHistory([
        {
          role: 'assistant',
          content: 'Witaj! Jestem Twoim AI tutorem. Napisz "Rozpocznij lekcję" aby zacząć naukę tej umiejętności.',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !session || isLoading) return;

    setIsLoading(true);
    const currentResponseTime = Date.now() - startTime;
    setResponseTime(currentResponseTime);

    try {
      // Process through enhanced study-tutor with cognitive analysis
      const { data, error } = await supabase.functions.invoke('study-tutor', {
        body: {
          message: userInput,
          sessionId: session.id,
          skillId: skillId,
          responseTime: currentResponseTime,
          stepType: 'regular',
          currentPhase,
          sessionType: 'phase_based_lesson',
          department: 'mathematics'
        }
      });

      if (error) throw error;

      const aiResponse = data.message || 'Przepraszam, wystąpił problem z odpowiedzią.';
      const isCorrect = data.isCorrect || data.correctAnswer || aiResponse.includes('Poprawnie');

      // Add user message to chat
      setChatHistory(prev => [...prev, {
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString(),
        isCorrect: isCorrect
      }]);

      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString()
      }]);

      // Scroll to bottom after adding messages
      setTimeout(() => {
        if (chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
      }, 100);

      // Update phase progress
      await updatePhaseProgress(isCorrect);

      setUserInput("");
      setStartTime(Date.now());

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się wysłać wiadomości",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePhaseProgress = async (isCorrect: boolean) => {
    if (!session) return;

    try {
      const currentProgress = phaseProgress[currentPhase];
      const newCorrectAttempts = currentProgress?.correct_attempts || 0;
      const newAttemptsCount = (currentProgress?.attempts_count || 0) + 1;
      const newProgressPercentage = Math.min(100, Math.round((newCorrectAttempts + (isCorrect ? 1 : 0)) / newAttemptsCount * 100));

      const updateData = {
        user_id: session.user_id,
        skill_id: skillId,
        phase_number: currentPhase,
        progress_percentage: newProgressPercentage,
        attempts_count: newAttemptsCount,
        correct_attempts: newCorrectAttempts + (isCorrect ? 1 : 0),
        last_attempt_at: new Date().toISOString(),
        status: newProgressPercentage >= 80 ? 'completed' : 'in_progress'
      };

      const { error } = await supabase
        .from('learning_phase_progress')
        .upsert(updateData, {
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
            description: `Przechodzisz do fazy ${currentPhase + 1}`,
          });
        }, 1000);
      }

    } catch (error) {
      console.error('Error updating phase progress:', error);
    }
  };

  const askForHint = async () => {
    if (!session || isLoading) return;

    setIsLoading(true);
    try {
      // Use supabase client instead of direct fetch to ensure proper auth
      const { data, error } = await supabase.functions.invoke('study-tutor', {
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
        variant: "destructive",
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
      const { data, error } = await supabase.functions.invoke('session-summary', {
        body: {
          sessionId: session.id,
          sessionType: 'lesson',
          userId: user.id
        }
      });

      if (error) {
        console.error('Error generating session summary:', error);
      }

      toast({
        title: "Sesja zakończona",
        description: "Sesja została pomyślnie zakończona i zapisana.",
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
    return (
      <div className={`animate-pulse space-y-4 ${className}`}>
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
      </div>
    );
  }

  const currentPhaseData = getCurrentPhaseData();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{skill.name}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {skill.description}
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              {skill.department.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Progress Sidebar */}
        <div className="lg:col-span-1">
          <PhaseProgress 
            phases={getPhaseProgressData()}
            currentPhase={currentPhase}
          />
        </div>

        {/* Main Learning Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Phase Info */}
          {currentPhaseData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Faza {currentPhase}: {currentPhaseData.phase_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {currentPhaseData.estimated_duration_minutes} min
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPhaseData.phase_description}
                </p>
              </CardHeader>
            </Card>
          )}

          {/* Chat Area */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg">Rozmowa z AI Tutorem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History */}
              <div ref={chatScrollRef} className="space-y-3 max-h-80 overflow-y-auto scroll-smooth">
                {chatHistory.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Lightbulb className="h-12 w-12 mx-auto mb-3" />
                    <p>Napisz "Rozpocznij lekcję" aby zacząć</p>
                  </div>
                )}
                
                {chatHistory.map((message, index) => (
                  <div 
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.isHint
                          ? 'bg-warning/10 border border-warning'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === 'assistant' && message.isHint && (
                          <HelpCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                        )}
                        {message.role === 'user' && message.isCorrect !== undefined && (
                          message.isCorrect 
                            ? <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            : <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                        )}
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <div className="space-y-3 border-t pt-4">
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder={chatHistory.length === 0 ? "Napisz 'Rozpocznij lekcję' aby zacząć..." : "Wpisz swoją odpowiedź..."}
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                
                <div className="flex items-center gap-2">
                  {chatHistory.length === 0 ? (
                    <Button 
                      onClick={() => {
                        setUserInput('Rozpocznij lekcję');
                        setTimeout(() => sendMessage(), 100);
                      }}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Rozpoczynam...' : 'Rozpocznij lekcję'}
                    </Button>
                  ) : (
                    <>
                      <Button 
                        onClick={sendMessage}
                        disabled={!userInput.trim() || isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Wysyłam...' : 'Wyślij odpowiedź'}
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={askForHint}
                        disabled={isLoading}
                      >
                        <HelpCircle className="h-4 w-4 mr-2" />
                        Podpowiedź
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={endSession}
                        disabled={isLoading}
                      >
                        Zakończ sesję
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}