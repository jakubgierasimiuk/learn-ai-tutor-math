import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface EngagementData {
  interactionCount: number;
  totalTimeMinutes: number;
  sessionCount: number;
  averageTokensPerInteraction: number;
  averageEngagementScore: number;
  lastActivityAt: string | null;
}

export type EngagementLevel = 'nierozpoczeta' | 'poczatki_nauki' | 'aktywna_nauka' | 'intensywna_nauka';

export interface EngagementLevelInfo {
  level: EngagementLevel;
  label: string;
  description: string;
  color: string;
  icon: string;
  progressPercentage: number;
}

const calculateEngagementLevel = (data: EngagementData): EngagementLevelInfo => {
  const { interactionCount, totalTimeMinutes } = data;

  // Calculate composite engagement score
  const timeScore = Math.min(totalTimeMinutes / 120, 1); // Max at 120 minutes
  const interactionScore = Math.min(interactionCount / 40, 1); // Max at 40 interactions
  const compositeScore = (interactionScore * 0.7 + timeScore * 0.3) * 100;

  if (interactionCount === 0) {
    return {
      level: 'nierozpoczeta',
      label: 'Nierozpoczęta',
      description: 'Jeszcze nie rozpocząłeś nauki tej umiejętności',
      color: 'text-muted-foreground',
      icon: 'Play',
      progressPercentage: 0
    };
  } else if (interactionCount <= 5 || totalTimeMinutes < 15) {
    return {
      level: 'poczatki_nauki',
      label: 'Początki nauki',
      description: `${interactionCount} interakcji, ${Math.round(totalTimeMinutes)} min`,
      color: 'text-blue-600',
      icon: 'BookOpen',
      progressPercentage: Math.min(compositeScore, 25)
    };
  } else if (interactionCount <= 39 || totalTimeMinutes < 120) {
    return {
      level: 'aktywna_nauka',
      label: 'Aktywna nauka',
      description: `${interactionCount} interakcji, ${Math.round(totalTimeMinutes)} min`,
      color: 'text-orange-600',
      icon: 'Target',
      progressPercentage: Math.min(compositeScore, 70)
    };
  } else {
    return {
      level: 'intensywna_nauka',
      label: 'Intensywna nauka',
      description: `${interactionCount} interakcji, ${Math.round(totalTimeMinutes)} min`,
      color: 'text-green-600',
      icon: 'Trophy',
      progressPercentage: Math.min(compositeScore, 100)
    };
  }
};

export const useSkillEngagement = (skillId: string) => {
  const { user } = useAuth();
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id || !skillId) {
      setEngagementData(null);
      return;
    }

    const fetchEngagementData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get all sessions for this skill
        const { data: sessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('id, started_at, completed_at')
          .eq('user_id', user.id)
          .eq('skill_id', skillId);

        if (sessionsError) throw sessionsError;

        if (!sessions || sessions.length === 0) {
          setEngagementData({
            interactionCount: 0,
            totalTimeMinutes: 0,
            sessionCount: 0,
            averageTokensPerInteraction: 0,
            averageEngagementScore: 0,
            lastActivityAt: null
          });
          return;
        }

        // Get all interactions for these sessions
        const sessionIds = sessions.map(s => s.id);
        const { data: interactions, error: interactionsError } = await supabase
          .from('learning_interactions')
          .select('*')
          .in('session_id', sessionIds);

        if (interactionsError) throw interactionsError;

        // Calculate engagement metrics
        const interactionCount = interactions?.length || 0;
        const totalTimeMinutes = sessions.reduce((total, session) => {
          if (session.completed_at && session.started_at) {
            const duration = new Date(session.completed_at).getTime() - new Date(session.started_at).getTime();
            return total + (duration / (1000 * 60)); // Convert to minutes
          }
          return total;
        }, 0);

        const averageTokensPerInteraction = interactionCount > 0 
          ? (interactions?.reduce((sum, i) => sum + (i.total_tokens || 0), 0) || 0) / interactionCount
          : 0;

        const averageEngagementScore = interactionCount > 0
          ? (interactions?.reduce((sum, i) => sum + (i.engagement_score || 0), 0) || 0) / interactionCount
          : 0;

        const lastActivityAt = interactions && interactions.length > 0
          ? interactions.sort((a, b) => new Date(b.interaction_timestamp).getTime() - new Date(a.interaction_timestamp).getTime())[0].interaction_timestamp
          : null;

        setEngagementData({
          interactionCount,
          totalTimeMinutes,
          sessionCount: sessions.length,
          averageTokensPerInteraction,
          averageEngagementScore,
          lastActivityAt
        });

      } catch (err) {
        console.error('Error fetching engagement data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch engagement data');
      } finally {
        setLoading(false);
      }
    };

    fetchEngagementData();
  }, [user?.id, skillId]);

  const engagementLevel = engagementData ? calculateEngagementLevel(engagementData) : null;

  return {
    engagementData,
    engagementLevel,
    loading,
    error
  };
};