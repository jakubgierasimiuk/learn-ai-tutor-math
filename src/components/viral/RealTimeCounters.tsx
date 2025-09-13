import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useReferralV2 } from '@/hooks/useReferralV2';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Trophy, 
  Gift, 
  TrendingUp,
  Clock,
  Star,
  Target,
  Zap
} from 'lucide-react';

interface RealTimeCountersProps {
  variant?: 'full' | 'compact' | 'mini';
  showProgress?: boolean;
}

export const RealTimeCounters: React.FC<RealTimeCountersProps> = ({ 
  variant = 'full',
  showProgress = true 
}) => {
  const { user } = useAuth();
  const { stats, isLoading } = useReferralV2();
  const [weeklyReferrals, setWeeklyReferrals] = useState(0);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [nextRewardProgress, setNextRewardProgress] = useState(0);

  useEffect(() => {
    if (!user) return;

    const fetchWeeklyData = async () => {
      try {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        const { data: weeklyData } = await supabase
          .from('referrals')
          .select('id, created_at')
          .eq('referrer_id', user.id)
          .gte('created_at', weekAgo.toISOString())
          .order('created_at', { ascending: false });

        setWeeklyReferrals(weeklyData?.length || 0);

        // Get recent activity
        const { data: activityData } = await supabase
          .from('referral_events')
          .select('*')
          .eq('payload->>referrer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentActivity(activityData || []);
      } catch (error) {
        console.log('Error fetching real-time data:', error);
      }
    };

    fetchWeeklyData();

    // Set up real-time subscription for new referrals
    const channel = supabase
      .channel('referral-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'referrals',
          filter: `referrer_id=eq.${user.id}`
        },
        (payload) => {
          console.log('New referral activity:', payload);
          fetchWeeklyData(); // Refresh data
          
          // Show notification popup
          if (payload.eventType === 'INSERT') {
            window.dispatchEvent(new CustomEvent('show-viral-popup', {
              detail: {
                trigger: 'new_referral',
                details: { referral: payload.new }
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    // Calculate progress to next reward
    const currentReferrals = stats?.successful_referrals || 0;
    let nextMilestone = 2;
    
    if (currentReferrals >= 10) nextMilestone = 20;
    else if (currentReferrals >= 5) nextMilestone = 10;
    else if (currentReferrals >= 2) nextMilestone = 5;

    const progress = (currentReferrals / nextMilestone) * 100;
    setNextRewardProgress(Math.min(progress, 100));
  }, [stats]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  const renderMiniCounters = () => (
    <div className="flex gap-2">
      <Badge variant="outline" className="gap-1">
        <Users className="w-3 h-3" />
        {stats?.successful_referrals || 0}
      </Badge>
      <Badge variant="outline" className="gap-1">
        <TrendingUp className="w-3 h-3" />
        {weeklyReferrals}
      </Badge>
      <Badge variant="outline" className="gap-1">
        <Gift className="w-3 h-3" />
        {stats?.available_points || 0}
      </Badge>
    </div>
  );

  const renderCompactCounters = () => (
    <div className="grid grid-cols-2 gap-2">
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          <div>
            <div className="text-sm font-semibold">{stats?.successful_referrals || 0}</div>
            <div className="text-xs text-muted-foreground">Polecenia</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-green-500" />
          <div>
            <div className="text-sm font-semibold">{weeklyReferrals}</div>
            <div className="text-xs text-muted-foreground">Ten tydzień</div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderFullCounters = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 text-center">
            <Users className="w-6 h-6 mx-auto mb-1 text-primary" />
            <div className="text-lg font-bold">{stats?.successful_referrals || 0}</div>
            <div className="text-xs text-muted-foreground">Skuteczne polecenia</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 text-center">
            <TrendingUp className="w-6 h-6 mx-auto mb-1 text-green-500" />
            <div className="text-lg font-bold">{weeklyReferrals}</div>
            <div className="text-xs text-muted-foreground">W tym tygodniu</div>
            {weeklyReferrals > 0 && (
              <Badge variant="outline" className="text-xs mt-1">
                <Zap className="w-2 h-2 mr-1" />
                Aktywny
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 text-center">
            <Gift className="w-6 h-6 mx-auto mb-1 text-purple-500" />
            <div className="text-lg font-bold">{stats?.available_points || 0}</div>
            <div className="text-xs text-muted-foreground">Dostępne punkty</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-1 text-yellow-500" />
            <div className="text-lg font-bold">{stats?.free_months_earned || 0}</div>
            <div className="text-xs text-muted-foreground">Darmowe miesiące</div>
          </CardContent>
        </Card>
      </div>

      {showProgress && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Postęp do następnej nagrody</span>
              <Badge variant="outline">
                {Math.round(nextRewardProgress)}%
              </Badge>
            </div>
            <Progress value={nextRewardProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{stats?.successful_referrals || 0} poleceń</span>
              <span>Następny cel: 2 polecenia</span>
            </div>
          </CardContent>
        </Card>
      )}

      {recentActivity.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Ostatnia aktywność
            </h4>
            <div className="space-y-2">
              {recentActivity.slice(0, 3).map((activity, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span className="text-muted-foreground">
                    {activity.event_type === 'referral_signed_up' && 'Nowa rejestracja'}
                    {activity.event_type === 'referral_activated' && 'Aktywacja polecenia'}
                    {activity.event_type === 'referral_converted' && 'Konwersja do płatnej'}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  switch (variant) {
    case 'mini':
      return renderMiniCounters();
    case 'compact':
      return renderCompactCounters();
    default:
      return renderFullCounters();
  }
};