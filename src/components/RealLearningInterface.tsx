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
import { useRealLearning } from '@/hooks/useRealLearning';
import { useToast } from '@/hooks/use-toast';

interface TaskState {
  task: any;
  userAnswer: string;
  startTime: number;
  hints: number;
  revisions: number;
}

export const RealLearningInterface = () => {
  const {
    profile,
    currentSession,
    dueReviews,
    isLoading,
    generateAdaptiveTask,
    validateAnswer,
    processLearningInteraction,
    startLearningSession,
    endLearningSession,
    getRecommendations,
    isReady,
    hasActiveSession,
    isHighCognitiveLoad,
    needsBreak,
    hasDueReviews,
    dueReviewCount
  } = useRealLearning();

  const { toast } = useToast();
  const [currentTask, setCurrentTask] = useState<TaskState | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [showHints, setShowHints] = useState(false);
  const [sessionMode, setSessionMode] = useState<'adaptive_practice' | 'spaced_review' | 'mastery_check'>('adaptive_practice');

  const recommendations = getRecommendations();

  // Auto-generate first task when session starts
  useEffect(() => {
    if (hasActiveSession && !currentTask && isReady) {
      generateNewTask();
    }
  }, [hasActiveSession, currentTask, isReady]);

  const startNewSession = async () => {
    try {
      const sessionId = await startLearningSession(sessionMode);
      if (sessionId) {
        toast({
          title: "Session Started",
          description: `Starting ${sessionMode.replace('_', ' ')} session`,
        });
        generateNewTask();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start learning session",
        variant: "destructive"
      });
    }
  };

  const generateNewTask = async () => {
    if (!isReady) return;

    try {
      const task = await generateAdaptiveTask(5, 'basic_arithmetic');
      if (task) {
        setCurrentTask({
          task,
          userAnswer: '',
          startTime: Date.now(),
          hints: 0,
          revisions: 0
        });
        setFeedback('');
        setShowHints(false);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate task",
        variant: "destructive"
      });
    }
  };

  const submitAnswer = async () => {
    if (!currentTask || !currentTask.userAnswer.trim()) return;

    const responseTime = Date.now() - currentTask.startTime;

    try {
      const result = await processLearningInteraction({
        userAnswer: currentTask.userAnswer,
        expectedAnswer: currentTask.task.expectedAnswer,
        skillCode: currentTask.task.skillCode,
        skillNodeId: currentTask.task.metadata?.skillNode || 'default',
        sessionId: currentSession?.id || 'default',
        difficulty: currentTask.task.difficulty,
        responseTime,
        revisionsCount: currentTask.revisions
      });

      if (result) {
        setFeedback(result.feedback);
        
        if (result.validation.isCorrect) {
          toast({
            title: "Correct!",
            description: "Great work! Ready for the next challenge?",
          });
          
          // Auto-generate next task after a delay
          setTimeout(() => {
            generateNewTask();
          }, 2000);
        } else {
          toast({
            title: "Not quite right",
            description: "Try again or ask for a hint",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process answer",
        variant: "destructive"
      });
    }
  };

  const showHint = () => {
    if (currentTask && currentTask.hints < currentTask.task.hints.length) {
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

  if (!isReady) {
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
              <Brain className={`h-5 w-5 ${isHighCognitiveLoad ? 'text-destructive' : 'text-success'}`} />
              <div>
                <p className="text-sm text-muted-foreground">Cognitive Load</p>
                <p className="text-lg font-semibold">
                  {isHighCognitiveLoad ? 'High' : 'Optimal'}
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
                <p className="text-sm text-muted-foreground">Energy Level</p>
                <p className="text-lg font-semibold">
                  {Math.round((profile?.currentEnergyLevel || 0.5) * 100)}%
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
                <p className="text-sm text-muted-foreground">Confidence</p>
                <p className="text-lg font-semibold">
                  {Math.round((profile?.confidenceLevel || 0.5) * 100)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Due Reviews</p>
                <p className="text-lg font-semibold">{dueReviewCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-2">
          {recommendations.map((rec, index) => (
            <Alert key={index} className={
              rec.priority === 'high' ? 'border-destructive' : 
              rec.priority === 'medium' ? 'border-warning' : 'border-info'
            }>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{rec.message}</AlertDescription>
            </Alert>
          ))}
        </div>
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
                disabled={!hasDueReviews}
              >
                <RotateCcw className="h-6 w-6 mb-2" />
                <span>Spaced Review</span>
                <span className="text-xs text-muted-foreground">
                  {dueReviewCount} skills due
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
            
            <Button onClick={startNewSession} className="w-full" size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Session
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
              <Button variant="outline" onClick={endLearningSession}>
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
                      disabled={currentTask.hints >= currentTask.task.hints.length}
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Get Hint ({currentTask.hints}/{currentTask.task.hints.length})
                    </Button>
                    
                    <Button variant="outline" onClick={generateNewTask}>
                      Skip Task
                    </Button>
                  </div>
                </div>

                {/* Hints */}
                {showHints && currentTask.hints > 0 && (
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