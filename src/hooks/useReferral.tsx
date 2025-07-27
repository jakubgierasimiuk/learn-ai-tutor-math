import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useReferral = () => {
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check for referral code in URL when component mounts
    const urlParams = new URLSearchParams(window.location.search);
    const referralCode = urlParams.get('ref');
    
    if (referralCode && user) {
      processReferralFromUrl(referralCode);
    }
  }, [user]);

  const processReferralFromUrl = async (referralCode: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Process the referral registration
      const { data, error } = await supabase.functions.invoke('process-referral', {
        body: {
          referralCode,
          action: 'register'
        }
      });

      if (error) {
        console.error("Referral processing error:", error);
        // Don't show error toast for invalid codes to avoid spam
        return;
      }

      // Show success message
      toast.success("Zostałeś pomyślnie polecony! Otrzymasz 7 dni darmowego dostępu.", {
        duration: 5000,
      });

      // Clean up URL
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());

    } catch (error) {
      console.error("Error processing referral:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const processTrialStart = async () => {
    if (!user) return;

    try {
      // Get referral code from user's registration
      const { data: referralData } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referred_user_id", user.id)
        .eq("status", "pending")
        .single();

      if (referralData?.referral_code) {
        await supabase.functions.invoke('process-referral', {
          body: {
            referralCode: referralData.referral_code,
            action: 'start_trial'
          }
        });
      }
    } catch (error) {
      console.error("Error starting trial:", error);
    }
  };

  const processSubscriptionComplete = async () => {
    if (!user) return;

    try {
      // Get referral code from user's registration
      const { data: referralData } = await supabase
        .from("referrals")
        .select("referral_code")
        .eq("referred_user_id", user.id)
        .eq("status", "trial")
        .single();

      if (referralData?.referral_code) {
        const { error } = await supabase.functions.invoke('process-referral', {
          body: {
            referralCode: referralData.referral_code,
            action: 'complete_subscription'
          }
        });

        if (!error) {
          toast.success("Gratulacje! Polecenie zostało zaliczone.", {
            duration: 5000,
          });
        }
      }
    } catch (error) {
      console.error("Error completing subscription:", error);
    }
  };

  return {
    isProcessing,
    processTrialStart,
    processSubscriptionComplete
  };
};