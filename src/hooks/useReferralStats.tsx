import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ReferralStats, Reward, TierType } from "@/types";
import { toast } from "sonner";

interface UseReferralStatsReturn {
  stats: ReferralStats | null;
  rewards: Reward[];
  referralCode: string;
  loading: boolean;
  refreshing: boolean;
  loadReferralData: () => Promise<void>;
  loadRewards: () => Promise<void>;
  claimReward: (reward: Reward) => void;
  copyReferralUrl: () => Promise<void>;
  shareReferralUrl: () => Promise<void>;
}

export const useReferralStats = (): UseReferralStatsReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState<string>("");

  // Fetch referral stats with React Query
  const { data: stats, isLoading: statsLoading } = useQuery<ReferralStats | null>({
    queryKey: ['referralStats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("user_referral_stats")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        return {
          ...data,
          current_tier: data.current_tier as TierType
        };
      }
      
      return {
        successful_referrals: 0,
        total_points: 0,
        available_points: 0,
        free_months_earned: 0,
        current_tier: 'beginner' as TierType
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch rewards with React Query
  const { data: rewards = [] } = useQuery({
    queryKey: ['referralRewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards_catalog")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes for rewards (changes less frequently)
  });

  // Fetch referral code
  const { mutate: generateReferralCode, isPending: codeLoading } = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('create-referral-code');
      if (error) throw error;
      return data.code;
    },
    onSuccess: (code) => {
      setReferralCode(code);
    },
    onError: (error) => {
      console.error("Error generating referral code:", error);
      toast.error("Błąd podczas generowania kodu polecającego");
    }
  });

  // Generate referral code on mount
  useEffect(() => {
    if (user && !referralCode) {
      generateReferralCode();
    }
  }, [user, referralCode, generateReferralCode]);

  // Claim reward mutation
  const { mutate: claimReward } = useMutation({
    mutationFn: async (reward: Reward) => {
      if (!stats || stats.available_points < reward.points_required) {
        throw new Error("Nie masz wystarczającej liczby punktów!");
      }

      const { data, error } = await supabase.functions.invoke('claim-reward', {
        body: {
          rewardId: reward.id,
          deliveryInfo: {
            email: user?.email || "",
            name: user?.email?.split("@")[0] || "User"
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Nagroda została zamówiona! Otrzymasz potwierdzenie na email.");
      // Invalidate stats to refresh them
      queryClient.invalidateQueries({ queryKey: ['referralStats'] });
    },
    onError: (error: Error) => {
      console.error("Error claiming reward:", error);
      toast.error(error.message || "Błąd podczas zamawiania nagrody");
    }
  });

  const referralUrl = referralCode ? `https://mentavo.ai?ref=${referralCode}` : "";

  const copyReferralUrl = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      toast.success("Link skopiowany do schowka!");
    } catch (error) {
      toast.error("Błąd podczas kopiowania linku");
    }
  };

  const shareReferralUrl = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Dołącz do mentavo.ai!",
          text: "Ucz się matematyki z AI! Otrzymaj 7 dni darmowo.",
          url: referralUrl,
        });
      } else {
        await copyReferralUrl();
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const loadReferralData = async () => {
    generateReferralCode();
    await queryClient.invalidateQueries({ queryKey: ['referralStats'] });
  };

  const loadRewards = async () => {
    await queryClient.invalidateQueries({ queryKey: ['referralRewards'] });
  };

  return {
    stats,
    rewards,
    referralCode,
    loading: statsLoading || codeLoading,
    refreshing: codeLoading,
    loadReferralData,
    loadRewards,
    claimReward,
    copyReferralUrl,
    shareReferralUrl
  };
};