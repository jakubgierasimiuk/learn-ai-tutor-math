import { useState, useEffect } from 'react';
import { ConsolidatedLearningEngine } from '@/lib/ConsolidatedLearningEngine';
import { useAuth } from './useAuth';

export const useConsolidatedLearning = () => {
  const { user } = useAuth();
  const [engine] = useState(() => ConsolidatedLearningEngine.getInstance());
  const [learnerData, setLearnerData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<any>(null);

  // Load learner data on user change
  useEffect(() => {
    if (user?.id) {
      loadLearnerData();
    }
  }, [user?.id]);

  const loadLearnerData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const data = await engine.getConsolidatedLearnerData(user.id);
      setLearnerData(data);
    } catch (error) {
      console.error('Error loading learner data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processInteraction = async (context: {
    sessionType: 'ai_chat' | 'study_learn' | 'diagnostic';
    userResponse?: string;
    isCorrect?: boolean;
    responseTime?: number;
    currentSkill?: string;
    department: string;
  }) => {
    if (!user?.id) return null;

    try {
      setIsLoading(true);
      const decision = await engine.makeAdaptiveDecision(user.id, context);
      setCurrentDecision(decision);
      setLearnerData(decision.learnerData);
      return decision;
    } catch (error) {
      console.error('Error processing interaction:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await loadLearnerData();
  };

  return {
    learnerData,
    currentDecision,
    isLoading,
    processInteraction,
    refreshData,
    
    // Quick access to key metrics
    cognitiveLoad: learnerData?.currentCognitiveLoad || 0,
    flowState: learnerData?.flowState || 0,
    fatigueLevel: learnerData?.fatigueLevel || 0,
    dropoutRisk: learnerData?.dropoutRisk || 0,
    preferredDifficulty: learnerData?.preferredDifficulty || 5,
    nextStruggles: learnerData?.nextStruggleAreas || [],
    masteryAreas: Object.entries(learnerData?.masteryReadiness || {})
      .filter(([_, score]) => (score as number) > 0.8)
      .map(([skill, _]) => skill)
  };
};