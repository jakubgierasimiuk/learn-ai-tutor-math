import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ReferralDemo } from "@/components/ReferralDemo";
import { toast } from "sonner";
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

interface ReferralStats {
  successful_referrals: number;
  total_points: number;
  available_points: number;
  free_months_earned: number;
  current_tier: string;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  points_required: number;
  category: string;
  image_url?: string;
}

const tierInfo = {
  beginner: { label: "Początkujący", icon: Target, color: "bg-gray-500" },
  advocate: { label: "Adwokat", icon: Users, color: "bg-blue-500" },
  promoter: { label: "Promotor", icon: Trophy, color: "bg-green-500" },
  ambassador: { label: "Ambasador", icon: Award, color: "bg-purple-500" },
  legend: { label: "Legenda", icon: Crown, color: "bg-yellow-500" }
};

export default function ReferralPage() {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const referralUrl = referralCode ? `${window.location.origin}?ref=${referralCode}` : "";

  useEffect(() => {
    if (user) {
      loadReferralData();
      loadRewards();
    }
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    try {
      setRefreshing(true);
      
      // Get or create referral code
      const { data: codeData, error: codeError } = await supabase.functions.invoke('create-referral-code');
      
      if (codeError) throw codeError;
      
      setReferralCode(codeData.code);

      // Get user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_referral_stats")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      if (statsData) {
        setStats(statsData);
      } else {
        // Initialize stats if not found
        setStats({
          successful_referrals: 0,
          total_points: 0,
          available_points: 0,
          free_months_earned: 0,
          current_tier: 'beginner'
        });
      }

    } catch (error) {
      console.error("Error loading referral data:", error);
      toast.error("Błąd podczas ładowania danych poleceń");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase
        .from("rewards_catalog")
        .select("*")
        .eq("is_active", true)
        .order("points_required", { ascending: true });

      if (error) throw error;
      setRewards(data || []);
    } catch (error) {
      console.error("Error loading rewards:", error);
      toast.error("Błąd podczas ładowania nagród");
    }
  };

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
          title: "Dołącz do AI Tutora!",
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

  const claimReward = async (reward: Reward) => {
    if (!stats || stats.available_points < reward.points_required) {
      toast.error("Nie masz wystarczającej liczby punktów!");
      return;
    }

    try {
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

      toast.success("Nagroda została zamówiona! Otrzymasz potwierdzenie na email.");
      loadReferralData(); // Refresh stats
    } catch (error) {
      console.error("Error claiming reward:", error);
      toast.error("Błąd podczas zamawiania nagrody");
    }
  };

  if (loading) {
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

  const currentTier = stats?.current_tier || 'beginner';
  const TierIcon = tierInfo[currentTier as keyof typeof tierInfo]?.icon || Target;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold gradient-text">System Poleceń</h1>
        <p className="text-muted-foreground">
          Zapraszaj znajomych i zdobywaj nagrody za każde skuteczne polecenie!
        </p>
      </div>

      {/* Current Tier and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 rounded-full ${tierInfo[currentTier as keyof typeof tierInfo]?.color} flex items-center justify-center mx-auto mb-2`}>
              <TierIcon className="w-6 h-6 text-white" />
            </div>
            <p className="text-sm text-muted-foreground">Twój status</p>
            <p className="font-semibold">{tierInfo[currentTier as keyof typeof tierInfo]?.label}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Skuteczne polecenia</p>
            <p className="text-2xl font-bold">{stats?.successful_referrals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Dostępne punkty</p>
            <p className="text-2xl font-bold">{stats?.available_points || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Darmowe miesiące</p>
            <p className="text-2xl font-bold">{stats?.free_months_earned || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Twój Link Polecający
            <Button
              variant="outline"
              size="sm"
              onClick={loadReferralData}
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralUrl} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button onClick={copyReferralUrl} variant="outline">
              <Copy className="w-4 h-4" />
            </Button>
            <Button onClick={shareReferralUrl} variant="default">
              <Share2 className="w-4 h-4" />
              Udostępnij
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">
            Udostępnij ten link znajomym. Otrzymują 7 dni darmowo, a Ty nagrody za każde skuteczne polecenie!
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

      {/* Demo Section */}
      <ReferralDemo />

      {/* Rewards Section */}
      <Card>
        <CardHeader>
          <CardTitle>Sklep z Nagrodami</CardTitle>
          <p className="text-sm text-muted-foreground">
            Wymień punkty na atrakcyjne nagrody (dostępne po 10 poleceniach)
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((reward) => (
              <Card key={reward.id} className="border border-border">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="text-center">
                      <h3 className="font-semibold">{reward.name}</h3>
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">
                        {reward.points_required} pkt
                      </Badge>
                      <Button
                        size="sm"
                        onClick={() => claimReward(reward)}
                        disabled={!stats || stats.available_points < reward.points_required}
                      >
                        {!stats || stats.available_points < reward.points_required ? "Za mało punktów" : "Wymień"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}