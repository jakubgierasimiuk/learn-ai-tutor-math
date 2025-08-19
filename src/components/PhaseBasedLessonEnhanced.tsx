import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle, Clock, HelpCircle, Lightbulb, BookOpen } from "lucide-react";
import { unifiedValidation } from '@/lib/UnifiedValidationSystem';
import { TaskDefinitionManager } from '@/lib/TaskDefinitionManager';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PhaseProgress } from "./PhaseProgress";
import { SmartResume } from "./SmartResume";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useUnifiedLearning } from "@/hooks/useUnifiedLearning";

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

interface LessonContent {
  content_data: any;
  generator_params: any;
  teaching_flow: any;
  misconception_patterns: any[];
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
  const [lessonContent, setLessonContent] = useState<LessonContent | null>(null);
  const [currentPhase, setCurrentPhase] = useState(1);
  const [phaseProgress, setPhaseProgress] = useState<Record<number, any>>({});
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [responseTime, setResponseTime] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [showSmartResume, setShowSmartResume] = useState(true);
  const [skillProgress, setSkillProgress] = useState<any>(null);
  const { toast } = useToast();

  // Unified Learning System Integration
  const {
    learnerProfile,
    currentSession: unifiedSession,
    isLoading: unifiedLoading,
    startSession,
    processLearningStep,
    completeSession,
    getRecommendations
  } = useUnifiedLearning();

  useEffect(() => {
    loadSkillData();
    checkSkillProgress();
  }, [skillId]);

  useEffect(() => {
    setStartTime(Date.now());
  }, [userInput]);

  const loadSkillData = async () => {
    try {
      // Load skill data and lesson content
      const [skillResult, lessonResult] = await Promise.all([
        supabase
          .from('skills')
          .select('*')
          .eq('id', skillId)
          .single(),
        supabase
          .from('lessons')
          .select('content_data, generator_params, teaching_flow, misconception_patterns')
          .eq('topic_id', parseInt(skillId))
          .eq('is_active', true)
          .limit(1)
          .maybeSingle()
      ]);

      if (skillResult.error) throw skillResult.error;
      setSkill(skillResult.data);

      if (lessonResult.data) {
        setLessonContent({
          content_data: lessonResult.data.content_data,
          generator_params: lessonResult.data.generator_params,
          teaching_flow: lessonResult.data.teaching_flow,
          misconception_patterns: Array.isArray(lessonResult.data.misconception_patterns) 
            ? lessonResult.data.misconception_patterns 
            : []
        });
      }

      // Load skill phases
      const { data: phasesData, error: phasesError } = await supabase
        .from('skill_phases')
        .select('*')
        .eq('skill_id', skillId)
        .eq('is_active', true)
        .order('phase_number');

      if (phasesError) throw phasesError;
      setPhases(phasesData || []);

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

  const checkSkillProgress = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const { data: progress, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('skill_id', skillId)
        .maybeSingle();

      if (error) {
        console.error('Error loading skill progress:', error);
        return;
      }

      setSkillProgress(progress);
      
      // If user has no progress or wants to see resume, show Smart Resume
      setShowSmartResume(true);
    } catch (error) {
      console.error('Error checking skill progress:', error);
    }
  };

  const handleResumeChoice = (startOver: boolean = false) => {
    setShowSmartResume(false);
    if (startOver && session) {
      // Reset session progress if starting over
      resetSession();
    }
  };

  const resetSession = async () => {
    if (!session) return;
    
    try {
      // Mark current session as completed and create new one
      await supabase
        .from('study_sessions')
        .update({ status: 'completed' })
        .eq('id', session.id);
      
      // Reinitialize
      await initializeSession();
      setChatHistory([]);
      setCurrentPhase(1);
      
      toast({
        title: "Sesja zresetowana",
        description: "Rozpoczynasz od początku",
      });
    } catch (error) {
      console.error('Error resetting session:', error);
    }
  };

  const initializeSession = async () => {
    try {
      // Start unified learning session for Study & Learn
      const unifiedSessionId = await startSession('study_learn', skillId, 'mathematics');
      
      // Check for existing active session in legacy table
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

      // Load phase progress using unified system
      if (learnerProfile) {
        const skillProgress = learnerProfile.skill_mastery_map?.[skillId];
        if (skillProgress) {
          setPhaseProgress({
            [currentPhase]: {
              progress_percentage: skillProgress.mastery_level,
              attempts_count: skillProgress.total_attempts,
              correct_attempts: skillProgress.correct_attempts
            }
          });
        }
      }

      // Load chat history if session exists
      if (sessionData) {
        loadChatHistory(sessionData.id);
      }

    } catch (error) {
      console.error('Error initializing unified session:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się zainicjować sesji",
        variant: "destructive",
      });
    }
  };

  const loadChatHistory = async (sessionId: string) => {
    try {
      const { data: steps, error } = await supabase
        .from('lesson_steps')
        .select('*')
        .eq('session_id', sessionId)
        .order('step_number');

      if (error) throw error;

      const history = (steps || []).flatMap(step => {
        const messages = [];
        if (step.ai_response) {
          messages.push({
            role: 'assistant',
            content: step.ai_response,
            timestamp: step.created_at
          });
        }
        if (step.user_input) {
          messages.push({
            role: 'user',
            content: step.user_input,
            timestamp: step.created_at,
            isCorrect: step.is_correct
          });
        }
        return messages;
      });

      setChatHistory(history);
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const renderContentSection = (content: any) => {
    if (!content) return null;
    
    return (
      <div className="space-y-4">
        {content.theory && (
          <Card className="p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Teoria
            </h4>
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
              className="prose prose-sm max-w-none text-sm"
            >
              {content.theory.introduction}
            </ReactMarkdown>
            {content.theory.keyConceptsLaTex && (
              <div className="mt-3 p-2 bg-accent/10 rounded">
                <div className="text-xs font-medium text-muted-foreground mb-1">Kluczowe wzory:</div>
                {content.theory.keyConceptsLaTex.map((concept: string, index: number) => (
                  <ReactMarkdown
                    key={index}
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    className="text-sm"
                  >
                    {concept}
                  </ReactMarkdown>
                ))}
              </div>
            )}
          </Card>
        )}
        
        {content.examples && content.examples.length > 0 && (
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Przykłady</h4>
            {content.examples.map((example: any, index: number) => (
              <div key={index} className="mb-4 p-3 border rounded">
                <h5 className="font-medium text-sm">{example.title}</h5>
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  className="text-sm mt-1"
                >
                  {example.problem}
                </ReactMarkdown>
                {example.solution && example.solution.steps && (
                  <div className="mt-2 space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Rozwiązanie:</div>
                    {example.solution.steps.map((step: any, stepIndex: number) => (
                      <div key={stepIndex} className="text-xs bg-muted p-2 rounded">
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                        >
                          {step.explanation}
                        </ReactMarkdown>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Czas: {Math.round(example.timeEstimate / 60)} min
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    );
  };

  const getTeachingFlowPhase = () => {
    if (!lessonContent?.teaching_flow) return null;
    const phaseKey = `phase${currentPhase}`;
    return lessonContent.teaching_flow[phaseKey];
  };

  const sendMessage = async () => {
    if (!userInput.trim() || !session || isLoading) return;

    setIsLoading(true);
    const currentResponseTime = Date.now() - startTime;
    setResponseTime(currentResponseTime);

    try {
      // Process learning step with unified system
      const learningContext = {
        userId: session.user_id,
        currentSkill: skillId,
        department: 'mathematics',
        sessionType: 'study_learn' as const,
        userResponse: userInput,
        responseTime: currentResponseTime,
        confidence: 0.7, // Could be enhanced with user input
        isCorrect: undefined // Will be determined by AI
      };

      // Process through unified system first
      const adaptationDecision = await processLearningStep(learningContext);

      const response = await supabase.functions.invoke('study-tutor', {
        body: {
          message: userInput,
          sessionId: session.id,
          skillId: skillId,
          responseTime: currentResponseTime,
          stepType: 'question',
          currentPhase: currentPhase,
          // Enhanced unified system data
          unifiedSessionId: unifiedSession,
          learnerProfile: learnerProfile,
          adaptationDecision: adaptationDecision
        }
      });

      if (response.error) {
        throw response.error;
      }

      const data = response.data;

      // Add user message to chat
      setChatHistory(prev => [...prev, {
        role: 'user',
        content: userInput,
        timestamp: new Date().toISOString(),
        isCorrect: data.isCorrect
      }]);

      // Add AI response to chat
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString()
      }]);

      // Update phase progress with unified system
      await updatePhaseProgress(data.isCorrect);

      // Apply adaptation decisions
      if (adaptationDecision) {
        if (adaptationDecision.recommendedAction === 'advance' && currentPhase < phases.length) {
          setCurrentPhase(prev => prev + 1);
        } else if (adaptationDecision.recommendedAction === 'review' && currentPhase > 1) {
          setCurrentPhase(prev => prev - 1);
        }
      }

      setUserInput("");
      setStartTime(Date.now());

    } catch (error) {
      console.error('Error sending unified message:', error);
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
      const response = await supabase.functions.invoke('study-tutor', {
        body: {
          message: "Poproś o podpowiedź",
          sessionId: session.id,
          skillId: skillId,
          responseTime: 0,
          stepType: 'hint',
          currentPhase: currentPhase
        }
      });

      if (response.error) throw response.error;

      const data = response.data;

      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toISOString(),
        isHint: true
      }]);

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

  if (!skill || phases.length === 0) {
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
  const teachingFlowPhase = getTeachingFlowPhase();

  // Show Smart Resume before lesson starts
  if (showSmartResume && skill) {
    return (
      <div className={`space-y-6 ${className}`}>
        <SmartResume
          skillId={skillId}
          skillName={skill.name}
          onContinue={() => handleResumeChoice(false)}
          onStartOver={() => handleResumeChoice(true)}
        />
      </div>
    );
  }

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
                {lessonContent?.generator_params?.microSkill && (
                  <span className="ml-2">
                    • MicroSkill: {lessonContent.generator_params.microSkill}
                  </span>
                )}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-sm">
                {skill.department.replace('_', ' ')}
              </Badge>
              {lessonContent && (
                <Badge variant="secondary" className="text-sm">Content DB</Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Phase Progress Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <PhaseProgress 
            phases={getPhaseProgressData()}
            currentPhase={currentPhase}
          />
          
          {/* Structured Content Display */}
          {lessonContent?.content_data && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Materiały do nauki</CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                {renderContentSection(lessonContent.content_data)}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Learning Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Phase Info */}
          {currentPhaseData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Faza {currentPhase}: {teachingFlowPhase?.name || currentPhaseData.phase_name}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {Math.round((teachingFlowPhase?.duration || currentPhaseData.estimated_duration_minutes * 60) / 60)} min
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPhaseData.phase_description}
                </p>
                {teachingFlowPhase?.activities && (
                  <div className="flex gap-1 flex-wrap mt-2">
                    {teachingFlowPhase.activities.map((activity: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs capitalize">
                        {activity.replace('_', ' ')}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
            </Card>
          )}

          {/* Misconception Patterns */}
          {lessonContent?.misconception_patterns && lessonContent.misconception_patterns.length > 0 && (
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-orange-800">Częste błędy</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {lessonContent.misconception_patterns.slice(0, 2).map((pattern: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-orange-50 rounded">
                      <div className="font-medium text-orange-900">{pattern.description}</div>
                      <div className="text-orange-700">{pattern.feedback}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Chat Area */}
          <Card className="min-h-[400px]">
            <CardHeader>
              <CardTitle className="text-lg">Rozmowa z AI Tutorem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Chat History */}
              <div className="space-y-3 max-h-80 overflow-y-auto">
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
                        <ReactMarkdown
                          remarkPlugins={[remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          className="text-sm whitespace-pre-wrap prose prose-sm max-w-none"
                        >
                          {message.content}
                        </ReactMarkdown>
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
                  placeholder="Wpisz swoją odpowiedź lub pytanie..."
                  className="min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={askForHint}
                    disabled={isLoading}
                  >
                    <HelpCircle className="h-4 w-4 mr-2" />
                    Podpowiedź
                  </Button>
                  
                  <Button 
                    onClick={sendMessage}
                    disabled={!userInput.trim() || isLoading}
                  >
                    {isLoading ? "Wysyłanie..." : "Wyślij"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}