import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Brain, 
  Zap, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskState {
  task: any;
  userAnswer: string;
  startTime: number;
  hints: number;
  revisions: number;
}

export const RealLearningInterface = () => {
  const { toast } = useToast();
  const [currentTask, setCurrentTask] = useState<TaskState | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showHints, setShowHints] = useState(false);
  const [sessionMode, setSessionMode] = useState<'adaptive_practice' | 'spaced_review' | 'mastery_check'>('adaptive_practice');
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [availableSkills, setAvailableSkills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);

  const isReady = true; // Always ready with study-tutor

  // Load user profile and skills on mount
  useEffect(() => {
    loadProfile();
    loadAvailableSkills();
  }, []);

  // Auto-generate first task when session starts
  useEffect(() => {
    if (hasActiveSession && !currentTask) {
      generateNewTask();
    }
  }, [hasActiveSession, currentTask]);

  const loadAvailableSkills = async () => {
    try {
      const { data: skills, error } = await supabase
        .from('skills')
        .select('id, name, department, description')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      setAvailableSkills(skills || []);
      // Set first skill as default
      if (skills && skills.length > 0 && !selectedSkillId) {
        setSelectedSkillId(skills[0].id);
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get enhanced cognitive profile from study-tutor  
      const { data, error } = await supabase.functions.invoke('study-tutor', {
        body: {
          actionType: 'get_profile'
        }
      });

      if (!error && data) {
        setProfile(data.profile || {});
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const startNewSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('study-tutor', {
        body: {
          actionType: 'start_session',
          sessionType: sessionMode,
          skillId: selectedSkillId || availableSkills[0]?.id
        }
      });

      if (error) throw error;

      setSessionId(data?.sessionId);
      setHasActiveSession(true);
      
      toast({
        title: "Session Started",
        description: `Starting ${sessionMode.replace('_', ' ')} session`,
      });
      
      generateNewTask();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start learning session",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewTask = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('study-tutor', {
        body: {
          actionType: 'generate_task',
          sessionId: sessionId,
          skillId: selectedSkillId || availableSkills[0]?.id,
          sessionType: sessionMode
        }
      });

      if (error) throw error;

      if (data?.task) {
        setCurrentTask({
          task: data.task,
          userAnswer: '',
          startTime: Date.now(),
          hints: 0,
          revisions: 0
        });
        setFeedback('');
        setShowHints(false);
        
        // Update profile if cognitive data is returned
        if (data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate task",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitAnswer = async () => {
    if (!currentTask || !currentTask.userAnswer.trim()) return;

    const responseTime = Date.now() - currentTask.startTime;

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('study-tutor', {
        body: {
          actionType: 'practice_answer',
          message: currentTask.userAnswer,
          sessionId: sessionId,
          skillId: selectedSkillId || availableSkills[0]?.id,
          responseTime,
          userAnswer: currentTask.userAnswer,
          expectedAnswer: currentTask.task.expectedAnswer,
          sessionType: sessionMode,
          department: 'mathematics'
        }
      });

      if (error) throw error;

      if (data) {
        setFeedback(data.message || data.feedback || '');
        
        // Update profile with real cognitive data from response
        if (data.profile) {
          setProfile(prev => ({ ...prev, ...data.profile }));
        }
        
        const isCorrect = data.isCorrect || data.correctAnswer || data.message?.includes('Poprawnie') || data.message?.includes('Świetnie');
        
        if (isCorrect) {
          toast({
            title: "Correct!",
            description: data.teachingMoment?.message || "Great work! Ready for the next challenge?",
          });
          
          // Auto-generate next task after a delay
          setTimeout(() => {
            generateNewTask();
          }, 2000);
        } else {
          toast({
            title: "Learning Opportunity",
            description: data.teachingMoment?.message || "Try again or ask for a hint",
            variant: "default"
          });
          
          // Show misconception feedback if detected
          if (data.detectedMisconception) {
            setTimeout(() => {
              setFeedback(prev => prev + '\n\nDetected misconception: ' + data.detectedMisconception);
            }, 1000);
          }
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process answer",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const showHint = () => {
    if (currentTask && currentTask.task.hints && currentTask.hints < currentTask.task.hints.length) {
      setShowHints(true);
      setCurrentTask({
        ...currentTask,
        hints: currentTask.hints + 1
      });
    }
  };

  const updateAnswer = (value: string) => {
    if (currentTask) {
      const revisions = value !== currentTask.userAnswer ? currentTask.revisions + 1 : currentTask.revisions;
      setCurrentTask({
        ...currentTask,
        userAnswer: value,
        revisions
      });
    }
  };

  if (isLoading && !hasActiveSession) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your learning profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header with profile insights */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Cognitive Load</p>
                <p className="text-lg font-semibold">
                  {profile?.cognitiveLoad ? `${Math.round(profile.cognitiveLoad * 100)}%` : 'Calculating...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Flow State</p>
                <p className="text-lg font-semibold">
                  {profile?.flowState ? `${Math.round(profile.flowState * 100)}%` : 'Analyzing...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Mastery Level</p>
                <p className="text-lg font-semibold">
                  {profile?.masteryLevel ? `${Math.round(profile.masteryLevel * 100)}%` : 'Assessing...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Learning Style</p>
                <p className="text-lg font-semibold capitalize">
                  {profile?.pedagogicalStrategy || 'Adaptive'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Skill Selection */}
      {!hasActiveSession && (
        <Card>
          <CardHeader>
            <CardTitle>Select Skill to Practice</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableSkills.map((skill) => (
                <div 
                  key={skill.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedSkillId === skill.id 
                      ? 'border-primary bg-primary/10' 
                      : 'border-muted hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedSkillId(skill.id)}
                >
                  <h4 className="font-medium">{skill.name}</h4>
                  <p className="text-sm text-muted-foreground">{skill.description}</p>
                  <Badge variant="outline" className="mt-2">
                    {skill.department.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Controls */}
      {!hasActiveSession ? (
        <Card>
          <CardHeader>
            <CardTitle>Start Learning Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={sessionMode === 'adaptive_practice' ? 'default' : 'outline'}
                onClick={() => setSessionMode('adaptive_practice')}
                className="h-20 flex flex-col"
              >
                <Brain className="h-6 w-6 mb-2" />
                <span>Adaptive Practice</span>
                <span className="text-xs text-muted-foreground">AI-personalized tasks</span>
              </Button>
              
                <Button
                variant={sessionMode === 'spaced_review' ? 'default' : 'outline'}
                onClick={() => setSessionMode('spaced_review')}
                className="h-20 flex flex-col"
              >
                <RotateCcw className="h-6 w-6 mb-2" />
                <span>Spaced Review</span>
                <span className="text-xs text-muted-foreground">
                  0 skills due
                </span>
              </Button>
              
              <Button
                variant={sessionMode === 'mastery_check' ? 'default' : 'outline'}
                onClick={() => setSessionMode('mastery_check')}
                className="h-20 flex flex-col"
              >
                <Target className="h-6 w-6 mb-2" />
                <span>Mastery Check</span>
                <span className="text-xs text-muted-foreground">Test your skills</span>
              </Button>
            </div>
            
            <Button onClick={startNewSession} className="w-full" size="lg" disabled={!selectedSkillId}>
              <Play className="h-4 w-4 mr-2" />
              Start Session
              {selectedSkillId && availableSkills.find(s => s.id === selectedSkillId) && (
                <span className="ml-2 text-xs opacity-80">
                  ({availableSkills.find(s => s.id === selectedSkillId)?.name})
                </span>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Session */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                {sessionMode.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Session
              </CardTitle>
              <Button variant="outline" onClick={() => setHasActiveSession(false)}>
                <Pause className="h-4 w-4 mr-2" />
                End Session
              </Button>
            </CardHeader>
          </Card>

          {/* Current Task */}
          {currentTask && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Task</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      Difficulty: {currentTask.task.difficulty}/10
                    </Badge>
                    <Badge variant="outline">
                      {currentTask.task.estimatedTime} min
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-lg font-medium">
                  {currentTask.task.problem}
                </div>

                <div className="space-y-4">
                  <Input
                    placeholder="Enter your answer..."
                    value={currentTask.userAnswer}
                    onChange={(e) => updateAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitAnswer()}
                    className="text-lg"
                  />

                  <div className="flex flex-wrap gap-2">
                    <Button onClick={submitAnswer} disabled={!currentTask.userAnswer.trim()}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Submit Answer
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={showHint}
                      disabled={!currentTask.task.hints || currentTask.hints >= currentTask.task.hints.length}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Hint ({currentTask.hints}/{currentTask.task.hints?.length || 0})
                    </Button>
                    
                    <Button variant="outline" onClick={generateNewTask}>
                      Skip Task
                    </Button>
                  </div>
                </div>

                {/* Hints */}
                {showHints && currentTask.hints > 0 && currentTask.task.hints && (
                  <Alert>
                    <Lightbulb className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Hint:</strong> {currentTask.task.hints[currentTask.hints - 1]}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Feedback */}
                {feedback && (
                  <Alert className="border-primary">
                    <Brain className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Feedback:</strong> {feedback}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};