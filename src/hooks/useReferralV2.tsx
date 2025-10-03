import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saveReferralCode, getReferralCode, clearReferralCode } from '@/lib/referralStorage';

interface ReferralStatsV2 {
  user_id: string;
  successful_referrals: number;
  activated_referrals: number;
  total_points: number;
  available_points: number;
  free_months_earned: number;
  current_tier: 'beginner' | 'advocate' | 'promoter' | 'ambassador' | 'legend';
  updated_at: string;
}

interface ReferralV2 {
  id: string;
  referrer_id: string;
  referred_user_id: string | null;
  referral_code: string;
  stage: 'invited' | 'activated' | 'converted' | 'blocked';
  risk_score: number;
  activated_at: string | null;
  converted_at: string | null;
  created_at: string;
  notes: any;
}

interface RewardV2 {
  id: string;
  user_id: string;
  kind: 'days' | 'tokens' | 'convertible' | 'points';
  amount: number;
  status: 'pending' | 'released' | 'consumed' | 'revoked';
  source: 'activation' | 'conversion' | 'ladder' | 'shop';
  meta: any;
  created_at: string;
  released_at: string | null;
  consumed_at: string | null;
}

export const useReferralV2 = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState<string>('');

  // Fetch user's referral stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['referral-stats-v2', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_referral_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      // Return default stats if none exist
      return data || {
        user_id: user.id,
        successful_referrals: 0,
        activated_referrals: 0,
        total_points: 0,
        available_points: 0,
        free_months_earned: 0,
        current_tier: 'beginner' as const,
        updated_at: new Date().toISOString(),
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch user's referrals (people they invited)
  const { data: referrals, isLoading: referralsLoading } = useQuery({
    queryKey: ['referrals-v2', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ReferralV2[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch user's rewards
  const { data: rewards, isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards-v2', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RewardV2[];
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Generate referral code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-referral-code');
      if (error) throw error;
      return data.code; // FIX: Changed from data.referral_code to data.code
    },
    onSuccess: (code) => {
      setReferralCode(code);
      toast.success('Kod polecający został wygenerowany!');
    },
    onError: (error) => {
      console.error('Error generating referral code:', error);
      toast.error('Nie udało się wygenerować kodu polecającego');
    },
  });

  // Process referral from URL
  const processReferralMutation = useMutation({
    mutationFn: async ({ referralCode, action }: { referralCode: string; action: string }) => {
      const { data, error } = await supabase.functions.invoke('process-referral-v2', {
        body: { referralCode, action }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['referral-stats-v2'] });
      queryClient.invalidateQueries({ queryKey: ['rewards-v2'] });
    },
  });

  // Consume convertible reward mutation
  const consumeRewardMutation = useMutation({
    mutationFn: async ({ rewardId, convertTo }: { rewardId: string; convertTo: 'days' | 'tokens' }) => {
      const { data, error } = await supabase.functions.invoke('consume-convertible-reward', {
        body: { rewardId, convertTo }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards-v2'] });
      toast.success('Nagroda została wykorzystana!');
    },
    onError: (error) => {
      console.error('Error consuming reward:', error);
      toast.error('Nie udało się wykorzystać nagrody');
    },
  });

  // Get user's own referral code
  useEffect(() => {
    const fetchReferralCode = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .single();

      if (data?.referral_code) {
        setReferralCode(data.referral_code);
      }
    };

    fetchReferralCode();
  }, [user]);

  // Save referral code from URL to localStorage (even if not logged in yet)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode) {
      console.log('[Referral] Found ref code in URL:', refCode);
      saveReferralCode(refCode);

      // If user is already logged in, process immediately
      if (user) {
        processReferralMutation.mutate({ referralCode: refCode, action: 'register' });
        clearReferralCode();
      }
      
      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
  }, [user]);

  // Process referral after user registers/logs in
  useEffect(() => {
    if (!user) return;
    
    const storedRefCode = getReferralCode();
    if (storedRefCode) {
      console.log('[Referral] Processing stored referral code for new user:', storedRefCode);
      processReferralMutation.mutate({ 
        referralCode: storedRefCode, 
        action: 'register' 
      });
      
      // Clear after processing
      clearReferralCode();
    }
  }, [user]);

  // Check activation status
  const checkActivation = async () => {
    if (!user || !referralCode) return;
    
    try {
      await processReferralMutation.mutateAsync({ 
        referralCode, 
        action: 'check_activation' 
      });
    } catch (error) {
      console.error('Error checking activation:', error);
    }
  };

  // Complete conversion (called from payment flow)
  const completeConversion = async () => {
    if (!user || !referralCode) return;
    
    try {
      await processReferralMutation.mutateAsync({ 
        referralCode, 
        action: 'complete_conversion' 
      });
    } catch (error) {
      console.error('Error completing conversion:', error);
    }
  };

  // Utility functions
  const getReferralUrl = () => {
    if (!referralCode) return '';
    return `https://mentavo.pl?ref=${referralCode}`;
  };

  const copyReferralUrl = async () => {
    const url = getReferralUrl();
    if (!url) return false;
    
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link polecający skopiowany!');
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Nie udało się skopiować linku');
      return false;
    }
  };

  const shareReferralUrl = async () => {
    const url = getReferralUrl();
    if (!url) return false;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Dołącz do nauki ze mną!',
          text: 'Rozpocznij naukę matematyki z mentavo.ai i otrzymaj 7 dni za darmo!',
          url: url,
        });
        return true;
      } catch (error) {
        console.error('Error sharing:', error);
        return copyReferralUrl();
      }
    } else {
      return copyReferralUrl();
    }
  };

  // Get tier info
  const getTierInfo = (tier: string) => {
    const tiers = {
      beginner: { label: 'Początkujący', color: 'gray', icon: '🌱' },
      advocate: { label: 'Rzecznik', color: 'blue', icon: '🎯' },
      promoter: { label: 'Promotor', color: 'green', icon: '🚀' },
      ambassador: { label: 'Ambasador', color: 'purple', icon: '👑' },
      legend: { label: 'Legenda', color: 'gold', icon: '⭐' },
    };
    return tiers[tier as keyof typeof tiers] || tiers.beginner;
  };

  // Get stage info
  const getStageInfo = (stage: string) => {
    const stages = {
      invited: { label: 'Zaproszony', color: 'yellow', icon: '📧' },
      activated: { label: 'Aktywowany', color: 'blue', icon: '✅' },
      converted: { label: 'Płacący', color: 'green', icon: '💳' },
      blocked: { label: 'Zablokowany', color: 'red', icon: '🚫' },
    };
    return stages[stage as keyof typeof stages] || stages.invited;
  };

  const isLoading = statsLoading || referralsLoading || rewardsLoading;

  return {
    // Data
    stats: stats as ReferralStatsV2 | null,
    referrals: referrals || [],
    rewards: rewards || [],
    referralCode,
    
    // Loading states  
    isLoading,
    isGeneratingCode: generateCodeMutation.isPending,
    isProcessing: processReferralMutation.isPending,
    isConsuming: consumeRewardMutation.isPending,
    
    // Actions
    generateCode: generateCodeMutation.mutate,
    checkActivation,
    completeConversion,
    consumeReward: consumeRewardMutation.mutate,
    
    // Utilities
    getReferralUrl,
    copyReferralUrl,
    shareReferralUrl,
    getTierInfo,
    getStageInfo,
  };
};