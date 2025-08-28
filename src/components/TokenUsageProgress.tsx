import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { AlertTriangle, Zap } from 'lucide-react';
import { useTokenUsage } from '@/hooks/useTokenUsage';

export const TokenUsageProgress = () => {
  const { 
    subscription, 
    loading, 
    getUsagePercentage, 
    getRemainingTokens, 
    getTokenStatus, 
    getStatusMessage 
  } = useTokenUsage();

  if (loading || !subscription) return null;

  const percentage = getUsagePercentage();
  const remaining = getRemainingTokens();
  const status = getTokenStatus();

  const getProgressColor = () => {
    switch (status) {
      case 'critical': return 'bg-red-500';
      case 'warning': return 'bg-orange-500';
      case 'moderate': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  if (subscription.subscription_type !== 'free') return null;

  return (
    <Card className="p-4 border-l-4 border-l-primary">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Zużycie tokenów AI</span>
        </div>
        <Badge className={getStatusBadgeColor()}>
          {remaining} pozostało
        </Badge>
      </div>
      
      <Progress 
        value={percentage} 
        className="h-2 mb-2"
        style={{ '--progress-foreground': getProgressColor() } as React.CSSProperties}
      />
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{subscription.tokens_used_this_month} / {subscription.monthly_token_limit} użyte</span>
        <span>{Math.round(percentage)}%</span>
      </div>
      
      {status === 'critical' && (
        <div className="flex items-center gap-2 mt-2 text-sm text-orange-600">
          <AlertTriangle className="w-4 h-4" />
          <span>Niski poziom tokenów!</span>
        </div>
      )}
    </Card>
  );
};