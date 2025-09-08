import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock, AlertCircle } from "lucide-react";
interface PhaseData {
  phase_number: number;
  phase_name: string;
  phase_description: string;
  estimated_duration_minutes: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress_percentage: number;
}
interface PhaseProgressProps {
  phases: PhaseData[];
  currentPhase: number;
  className?: string;
}
export function PhaseProgress({
  phases,
  currentPhase,
  className = ""
}: PhaseProgressProps) {
  const getPhaseIcon = (phase: PhaseData) => {
    switch (phase.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'in_progress':
        return <Circle className="h-5 w-5 text-primary animate-pulse" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };
  const getPhaseVariant = (phase: PhaseData) => {
    switch (phase.status) {
      case 'completed':
        return 'default' as const;
      case 'in_progress':
        return 'default' as const;
      case 'failed':
        return 'destructive' as const;
      default:
        return 'secondary' as const;
    }
  };
  return <div className={`space-y-4 ${className}`}>
      

      <div className="space-y-3">
        {phases.map(phase => <div key={phase.phase_number} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${phase.phase_number === currentPhase ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            {getPhaseIcon(phase)}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-sm text-foreground truncate">
                  {phase.phase_name}
                </h4>
                <Badge variant={getPhaseVariant(phase)} className="ml-2 text-xs">
                  {phase.status === 'not_started' && 'Oczekuje'}
                  {phase.status === 'in_progress' && 'W toku'}
                  {phase.status === 'completed' && 'Ukończone'}
                  {phase.status === 'failed' && 'Nieudane'}
                </Badge>
              </div>
              
              <p className="text-xs text-muted-foreground mb-2">
                {phase.phase_description}
              </p>
              
              {(phase.status === 'in_progress' || phase.status === 'completed') && <div className="space-y-1">
                  <Progress value={phase.progress_percentage} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{phase.progress_percentage}% ukończone</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {phase.estimated_duration_minutes}min
                    </span>
                  </div>
                </div>}
            </div>
          </div>)}
      </div>
    </div>;
}