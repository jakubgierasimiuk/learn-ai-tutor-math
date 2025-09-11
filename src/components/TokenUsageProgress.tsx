import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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

  // Only show for free accounts
  if (loading || !subscription || subscription.subscription_type !== 'free') return null;

  const tokensUsed = subscription?.tokens_used_total || 0;
  const hardLimit = subscription?.token_limit_hard || 25000;
  const percentage = (tokensUsed / hardLimit) * 100;
  const status = getTokenStatus();
  const getProgressColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-500';
      case 'warning':
        return 'bg-orange-500';
      case 'moderate':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };
  const getStatusBadgeColor = () => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Wykorzystanie tokenów</span>
          </div>
          <Badge className={getStatusBadgeColor()}>
            {tokensUsed.toLocaleString()} / {hardLimit.toLocaleString()}
          </Badge>
        </div>
        
        <Progress 
          value={percentage} 
          className="mb-2 h-2"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex-1">{getStatusMessage()}</span>
          {(status === 'critical' || status === 'warning') && (
            <AlertTriangle className={`w-4 h-4 ml-2 ${status === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};