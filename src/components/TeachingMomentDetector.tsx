// Phase 3: Teaching Moment Detection Component
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface TeachingMomentProps {
  type: 'praise' | 'correction' | 'hint' | 'encouragement' | 'prerequisite_check' | 'checkpoint';
  message: string;
  nextAction: 'continue' | 'increase_difficulty' | 'practice_more' | 'review_basics' | 'end_session';
  focusAreas?: string[];
  onActionSelect?: (action: string) => void;
  checkpointOptions?: Array<{action: string; label: string; description: string}>;
}

const TeachingMoment: React.FC<TeachingMomentProps> = ({
  type,
  message,
  nextAction,
  focusAreas,
  onActionSelect,
  checkpointOptions
}) => {
  const getIcon = () => {
    switch (type) {
      case 'praise': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'correction': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'hint': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'encouragement': return <HelpCircle className="w-5 h-5 text-purple-600" />;
      case 'prerequisite_check': return <HelpCircle className="w-5 h-5 text-orange-600" />;
      case 'checkpoint': return <CheckCircle className="w-5 h-5 text-indigo-600" />;
      default: return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'praise': return 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800';
      case 'correction': return 'bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800';
      case 'hint': return 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800';
      case 'encouragement': return 'bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800';
      case 'prerequisite_check': return 'bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800';
      case 'checkpoint': return 'bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800';
      default: return 'bg-muted';
    }
  };

  if (type === 'checkpoint' && checkpointOptions) {
    return (
      <Card className={`${getBackgroundColor()} mb-4`}>
        <CardContent className="pt-4">
          <div className="flex items-start gap-3 mb-4">
            {getIcon()}
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-2">Punkt kontrolny</h4>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Co chcesz robić dalej?</p>
            {checkpointOptions.map((option) => (
              <Button
                key={option.action}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto p-3"
                onClick={() => onActionSelect?.(option.action)}
              >
                <div>
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getBackgroundColor()} mb-4`}>
      <CardContent className="pt-4">
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <p className="text-sm">{message}</p>
            
            {focusAreas && focusAreas.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {focusAreas.map((area) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            )}
            
            {onActionSelect && nextAction !== 'continue' && (
              <Button
                variant="default"
                size="sm"
                className="mt-3"
                onClick={() => onActionSelect(nextAction)}
              >
                {nextAction === 'increase_difficulty' && 'Podwyższ poziom'}
                {nextAction === 'practice_more' && 'Więcej ćwiczeń'}
                {nextAction === 'review_basics' && 'Powtórz podstawy'}
                {nextAction === 'end_session' && 'Zakończ lekcję'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeachingMoment;