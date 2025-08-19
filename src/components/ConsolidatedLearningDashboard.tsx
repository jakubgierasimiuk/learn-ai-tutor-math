import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Brain, Zap, Clock, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { useConsolidatedLearning } from '@/hooks/useConsolidatedLearning';

export const ConsolidatedLearningDashboard = () => {
  const {
    learnerData,
    cognitiveLoad,
    flowState,
    fatigueLevel,
    dropoutRisk,
    preferredDifficulty,
    nextStruggles,
    masteryAreas,
    isLoading
  } = useConsolidatedLearning();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!learnerData) return null;

  const getLoadColor = (load: number) => {
    if (load < 0.3) return 'text-success';
    if (load < 0.7) return 'text-warning';
    return 'text-destructive';
  };

  const getFlowColor = (flow: number) => {
    if (flow > 0.7) return 'text-success';
    if (flow > 0.4) return 'text-warning'; 
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Real-time Learning State */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Brain className={`h-5 w-5 ${getLoadColor(cognitiveLoad)}`} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Cognitive Load</p>
                <div className="flex items-center space-x-2">
                  <Progress value={cognitiveLoad * 100} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(cognitiveLoad * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className={`h-5 w-5 ${getFlowColor(flowState)}`} />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Flow State</p>
                <div className="flex items-center space-x-2">
                  <Progress value={flowState * 100} className="flex-1" />
                  <span className="text-sm font-medium">{Math.round(flowState * 100)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Optimal Session</p>
                <p className="text-lg font-semibold">{Math.round(learnerData.optimalSessionLength)} min</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Preferred Difficulty</p>
                <p className="text-lg font-semibold">{preferredDifficulty}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Interventions */}
      <div className="space-y-3">
        {fatigueLevel > 0.6 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Your fatigue level is high ({Math.round(fatigueLevel * 100)}%). Consider taking a break.
            </AlertDescription>
          </Alert>
        )}

        {dropoutRisk > 0.6 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              High dropout risk detected ({Math.round(dropoutRisk * 100)}%). Let's adjust your learning approach.
            </AlertDescription>
          </Alert>
        )}

        {flowState > 0.8 && (
          <Alert className="border-success">
            <Zap className="h-4 w-4 text-success" />
            <AlertDescription className="text-success-foreground">
              You're in an excellent flow state! Great time to tackle challenging content.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Learning Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Struggle Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>Areas Needing Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {nextStruggles.length > 0 ? (
              <div className="space-y-2">
                {nextStruggles.slice(0, 5).map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{area}</span>
                    <Badge variant="outline" className="text-warning border-warning">
                      Priority {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific struggle areas identified. Great job!</p>
            )}
          </CardContent>
        </Card>

        {/* Mastery Areas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <span>Mastery Areas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {masteryAreas.length > 0 ? (
              <div className="space-y-2">
                {masteryAreas.slice(0, 5).map((area, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{area}</span>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      Mastered
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Keep learning to build your mastery areas!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Learning Performance Trends</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{Math.round((learnerData.averageResponseTime || 30000) / 1000)}s</p>
              <p className="text-sm text-muted-foreground">Avg Response Time</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {Math.round(((learnerData.accuracyTrend as number[])?.[0] || 0) * 100)}%
              </p>
              <p className="text-sm text-muted-foreground">Recent Accuracy</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{learnerData.attentionSpan} min</p>
              <p className="text-sm text-muted-foreground">Attention Span</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Patterns */}
      {Object.keys(learnerData.errorPatterns).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Common Error Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(learnerData.errorPatterns)
                .sort(([_, a], [__, b]) => (b as number) - (a as number))
                .slice(0, 5)
                .map(([pattern, count], index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm">{pattern}</span>
                    <Badge variant="outline">{count as number} times</Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};