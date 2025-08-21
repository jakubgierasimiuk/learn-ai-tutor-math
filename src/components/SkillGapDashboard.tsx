import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  skillGapAnalysis, 
  prioritySummary, 
  gapsByClass, 
  getCriticalGaps,
  getGapsByDepartment,
  getImplementationOrder,
  type SkillGap 
} from '@/lib/skillGapAnalysis';
import { 
  AlertTriangle, 
  TrendingUp, 
  BookOpen, 
  Target,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

const priorityColors = {
  critical: 'destructive',
  high: 'secondary', 
  medium: 'outline',
  low: 'default'
} as const;

const priorityIcons = {
  critical: AlertTriangle,
  high: TrendingUp,
  medium: BookOpen,
  low: Clock
};

export default function SkillGapDashboard() {
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  const filteredGaps = skillGapAnalysis.filter(gap => {
    const classMatch = selectedClass === 'all' || gap.class_level.toString() === selectedClass;
    const priorityMatch = selectedPriority === 'all' || gap.priority === selectedPriority;
    return classMatch && priorityMatch;
  });

  const totalGaps = skillGapAnalysis.length;
  const criticalGaps = getCriticalGaps();
  const implementationOrder = getImplementationOrder();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Plan Uzupełnienia Umiejętności</h1>
        <p className="text-muted-foreground">
          Analiza braków i strategia rozwoju systemu edukacyjnego
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wszystkie Braki</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGaps}</div>
            <p className="text-xs text-muted-foreground">
              umiejętności do dodania
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Krytyczne</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{prioritySummary.critical}</div>
            <p className="text-xs text-muted-foreground">
              najwyższy priorytet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wysokie</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{prioritySummary.high}</div>
            <p className="text-xs text-muted-foreground">
              drugi priorytet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pokrycie</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              obecne pokrycie tematów
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {criticalGaps.length > 0 && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>{criticalGaps.length} umiejętności krytycznych</strong> wymaga natychmiastowej implementacji. 
            Te tematy są fundamentalne dla dalszej nauki i często pojawiają się na maturze.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Przegląd</TabsTrigger>
          <TabsTrigger value="by-class">Według Klas</TabsTrigger>
          <TabsTrigger value="by-priority">Według Priorytetu</TabsTrigger>
          <TabsTrigger value="implementation">Plan Implementacji</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Filters */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={selectedClass === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedClass('all')}
            >
              Wszystkie klasy
            </Button>
            {[1, 2, 3].map(level => (
              <Button 
                key={level}
                variant={selectedClass === level.toString() ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedClass(level.toString())}
              >
                Klasa {level}
              </Button>
            ))}
            <div className="w-px bg-border mx-2" />
            {Object.keys(priorityColors).map(priority => (
              <Button 
                key={priority}
                variant={selectedPriority === priority ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedPriority(priority)}
              >
                {priority === 'critical' && 'Krytyczne'}
                {priority === 'high' && 'Wysokie'}
                {priority === 'medium' && 'Średnie'}
                {priority === 'low' && 'Niskie'}
              </Button>
            ))}
          </div>

          {/* Skills Grid */}
          <div className="grid gap-4">
            {filteredGaps.map((gap, index) => {
              const IconComponent = priorityIcons[gap.priority];
              return (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{gap.skillName}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">Klasa {gap.class_level}</Badge>
                          <Badge variant="outline">{gap.department}</Badge>
                          <Badge variant={priorityColors[gap.priority]}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {gap.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {gap.justification}
                    </p>
                    
                    {gap.prerequisites && gap.prerequisites.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs font-medium text-muted-foreground">Wymaga: </span>
                        <span className="text-xs">{gap.prerequisites.join(', ')}</span>
                      </div>
                    )}
                    
                    {gap.leads_to && gap.leads_to.length > 0 && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Prowadzi do: </span>
                        <span className="text-xs">{gap.leads_to.join(', ')}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="by-class" className="space-y-4">
          {Object.entries(gapsByClass).map(([classKey, gaps]) => {
            const classNumber = classKey.replace('class', '');
            return (
              <Card key={classKey}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Klasa {classNumber}</span>
                    <Badge variant="outline">{gaps.length} umiejętności</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {gaps.map((gap, index) => {
                      const IconComponent = priorityIcons[gap.priority];
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{gap.skillName}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {gap.department} • {gap.justification}
                            </div>
                          </div>
                          <Badge variant={priorityColors[gap.priority]}>
                            <IconComponent className="w-3 h-3 mr-1" />
                            {gap.priority}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="by-priority" className="space-y-4">
          {Object.entries(prioritySummary).map(([priority, count]) => {
            const gapsForPriority = skillGapAnalysis.filter(gap => gap.priority === priority);
            const IconComponent = priorityIcons[priority as keyof typeof priorityIcons];
            
            return (
              <Card key={priority}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    <span className="capitalize">{priority} Priority</span>
                    <Badge variant={priorityColors[priority as keyof typeof priorityColors]}>
                      {count}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {gapsForPriority.map((gap, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium">{gap.skillName}</span>
                          <div className="text-sm text-muted-foreground">
                            Klasa {gap.class_level} • {gap.department}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Rekomendowana Kolejność Implementacji
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {implementationOrder.slice(0, 10).map((gap, index) => {
                  const IconComponent = priorityIcons[gap.priority];
                  return (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{gap.skillName}</div>
                        <div className="text-sm text-muted-foreground">
                          Klasa {gap.class_level} • {gap.department}
                        </div>
                      </div>
                      <Badge variant={priorityColors[gap.priority]}>
                        <IconComponent className="w-3 h-3 mr-1" />
                        {gap.priority}
                      </Badge>
                    </div>
                  );
                })}
                {implementationOrder.length > 10 && (
                  <div className="text-center text-muted-foreground text-sm pt-2">
                    ... i {implementationOrder.length - 10} więcej umiejętności
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}