import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReferralV2 } from "@/hooks/useReferralV2";
import { ConvertibleRewardModal } from "@/components/ConvertibleRewardModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RealTimeCounters } from "@/components/viral/RealTimeCounters";
import { SMSActivationSection } from "@/components/SMSActivationSection";
import { TierType } from "@/types";
import { 
  Copy, 
  Share2, 
  Gift, 
  Trophy, 
  Users, 
  Target,
  Crown,
  Award,
  RefreshCw
} from "lucide-react";

const tierInfo: Record<TierType, { label: string; icon: any; color: string }> = {
  beginner: { label: "Początkujący", icon: Target, color: "bg-gray-500" },
  advocate: { label: "Adwokat", icon: Users, color: "bg-blue-500" },
  promoter: { label: "Promotor", icon: Trophy, color: "bg-green-500" },
  ambassador: { label: "Ambasador", icon: Award, color: "bg-purple-500" },
  legend: { label: "Legenda", icon: Crown, color: "bg-yellow-500" }
};

export default function ReferralPage() {
  const { user } = useAuth();
  const {
    stats,
    referrals,
    rewards,
    referralCode,
    isLoading,
    getReferralUrl,
    copyReferralUrl,
    shareReferralUrl,
    getTierInfo,
    getStageInfo,
    generateCode,
  } = useReferralV2();

  const [selectedReward, setSelectedReward] = useState<any>(null);
  const referralUrl = getReferralUrl();

  // Auto-generate referral code if user doesn't have one
  useEffect(() => {
    if (user && !referralCode && !isLoading) {
      generateCode();
    }
  }, [user, referralCode, isLoading]);

  const currentTier = stats?.current_tier || 'beginner';
  const TierIcon = tierInfo[currentTier]?.icon || Target;


  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleConvertibleReward = (reward: any) => {
    if (reward.kind === 'convertible' && reward.status === 'released') {
      setSelectedReward(reward);
    }
  };


  return (
    <div className="container mx-auto px-3 sm:p-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold gradient-text">System Poleceń</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Zapraszaj znajomych i zdobywaj nagrody za każde skuteczne polecenie!
        </p>
      </div>

      {/* Real-time Counters with Viral Loop */}
      <RealTimeCounters variant="full" showProgress={true} />

      {/* SMS Activation Section */}
      {/* <SMSActivationSection variant="referral" /> */} {/* Tymczasowo wyłączone - problemy z API SMS */}

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Twój Link Polecający
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              value={referralUrl} 
              readOnly 
              className="font-mono text-xs sm:text-sm flex-1"
            />
            <div className="flex gap-2">
              <Button onClick={copyReferralUrl} variant="outline" className="flex-1 sm:flex-initial">
                <Copy className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Kopiuj</span>
              </Button>
              <Button onClick={shareReferralUrl} variant="default" className="flex-1 sm:flex-initial">
                <Share2 className="w-4 h-4 mr-2 sm:mr-0" />
                <span className="sm:hidden">Udostępnij</span>
              </Button>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Udostępnij ten link znajomym. Otrzymują tydzień Premium darmowo, a Ty nagrody za każde skuteczne polecenie!
          </div>
        </CardContent>
      </Card>

      {/* Progress to Next Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Postęp do następnego poziomu</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>2 polecenia → 1 miesiąc darmowy</span>
              <Badge variant={stats?.successful_referrals >= 2 ? "default" : "outline"}>
                {stats?.successful_referrals >= 2 ? "✓" : `${stats?.successful_referrals || 0}/2`}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>5 poleceń → 2 miesiące darmowe</span>
              <Badge variant={stats?.successful_referrals >= 5 ? "default" : "outline"}>
                {stats?.successful_referrals >= 5 ? "✓" : `${stats?.successful_referrals || 0}/5`}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span>10 poleceń → 5 miesięcy + punkty na nagrody</span>
              <Badge variant={stats?.successful_referrals >= 10 ? "default" : "outline"}>
                {stats?.successful_referrals >= 10 ? "✓" : `${stats?.successful_referrals || 0}/10`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ReferralDemo removed — was modifying real database, visible to all users */}

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Dostępne Nagrody</CardTitle>
          <p className="text-sm text-muted-foreground">
            Twoje nagrody za polecenia
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.filter(r => r.status === 'released' && r.kind === 'convertible').map((reward) => (
              <Card key={reward.id} className="border border-border cursor-pointer hover:bg-muted/50" onClick={() => handleConvertibleReward(reward)}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="font-semibold">Nagroda convertible</h3>
                      <p className="text-sm text-muted-foreground">
                        +{reward.meta?.days_amount || 3} dni Premium
                      </p>
                    </div>
                    <Button size="sm" className="w-full">
                      Wykorzystaj
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedReward && (
        <ConvertibleRewardModal
          isOpen={!!selectedReward}
          onClose={() => setSelectedReward(null)}
          reward={selectedReward}
          onRewardConsumed={() => {
            setSelectedReward(null);
          }}
        />
      )}
    </div>
  );
}