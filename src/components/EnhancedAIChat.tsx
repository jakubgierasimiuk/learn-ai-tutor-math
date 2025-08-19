import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, Target, TrendingUp } from 'lucide-react';
import { useLearningAcceleration } from '@/hooks/useLearningAcceleration';
import { useAuth } from '@/hooks/useAuth';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  learningInsights?: {
    cognitiveLoad: number;
    flowState: number;
    masteryProgress: number;
    predictedStruggles: string[];
  };
}

export const EnhancedAIChat = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [learningMetrics, setLearningMetrics] = useState<any>(null);
  
  const {
    processLearningStep,
    generateAdaptiveTask,
    getLearningPredictions,
    isLoading: accelerationLoading
  } = useLearningAcceleration();

  useEffect(() => {
    if (user?.id) {
      initializeSession();
    }
  }, [user?.id]);

  const initializeSession = async () => {
    try {
      // Generate initial adaptive task
      const task = await generateAdaptiveTask({
        userId: user?.id || '',
        sessionType: 'ai_chat',
        department: 'mathematics'
      });
      setCurrentTask(task);

      // Get learning predictions
      const predictions = await getLearningPredictions();
      setLearningMetrics(predictions);
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user?.id) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Process learning step with enhanced AI
      const startTime = Date.now();
      const adaptation = await processLearningStep({
        userId: user.id,
        sessionType: 'ai_chat',
        userResponse: input,
        responseTime: Date.now() - startTime,
        department: 'mathematics'
      });

      if (adaptation) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: adaptation.feedbackMessage,
          timestamp: new Date(),
          learningInsights: {
            cognitiveLoad: adaptation.cognitiveLoadOptimization?.currentLoad || 0,
            flowState: adaptation.cognitiveLoadOptimization?.flowStateProbability || 0,
            masteryProgress: adaptation.neuroplasticityRecommendations?.masteryLevel || 0,
            predictedStruggles: adaptation.neuroplasticityRecommendations?.strugglingAreas || []
          }
        };

        setMessages(prev => [...prev, aiMessage]);

        // Update current task if recommended
        if (adaptation.nextTask) {
          setCurrentTask(adaptation.nextTask);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Przepraszam, wystąpił błąd. Spróbuj ponownie.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Learning Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Cognitive Load</p>
                <p className="text-lg font-semibold">
                  {learningMetrics?.cognitiveLoad ? `${Math.round(learningMetrics.cognitiveLoad * 100)}%` : 'N/A'}
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
                  {learningMetrics?.flowState ? `${Math.round(learningMetrics.flowState * 100)}%` : 'N/A'}
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
                <p className="text-sm text-muted-foreground">Mastery</p>
                <p className="text-lg font-semibold">
                  {learningMetrics?.masteryProgress ? `${Math.round(learningMetrics.masteryProgress * 100)}%` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Velocity</p>
                <p className="text-lg font-semibold">
                  {learningMetrics?.learningVelocity ? `${learningMetrics.learningVelocity.toFixed(1)}x` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Task Display */}
      {currentTask && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{currentTask.skillName}</p>
                <p className="text-sm text-muted-foreground">{currentTask.latex}</p>
              </div>
              <Badge variant="outline">
                Difficulty: {currentTask.difficulty}/10
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Chat Messages */}
      <Card className="flex-1">
        <CardContent className="p-4">
          <div className="h-96 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  {message.learningInsights && (
                    <div className="mt-2 pt-2 border-t border-border/20">
                      <div className="flex space-x-2 text-xs">
                        <span>Load: {Math.round(message.learningInsights.cognitiveLoad * 100)}%</span>
                        <span>Flow: {Math.round(message.learningInsights.flowState * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted px-4 py-2 rounded-lg">
                  <p className="text-sm">AI thinks...</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about math..."
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={isLoading || accelerationLoading || !input.trim()}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};