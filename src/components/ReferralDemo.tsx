import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Play, 
  Users, 
  Clock, 
  CheckCircle, 
  Gift,
  Zap,
  TrendingUp
} from "lucide-react";

export const ReferralDemo = () => {
  const { user } = useAuth();
  const [isSimulating, setIsSimulating] = useState(false);
  const [demoReferralCode, setDemoReferralCode] = useState("");

  const simulateReferralProcess = async () => {
    if (!user) return;
    
    setIsSimulating(true);
    
    try {
      // Step 1: Create demo referral code
      const { data: codeData, error: codeError } = await supabase.functions.invoke('create-referral-code');
      if (codeError) throw codeError;
      
      setDemoReferralCode(codeData.code);
      toast.success("🎯 Krok 1: Kod polecający utworzony!", { duration: 2000 });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 2: Simulate friend registration
      toast.info("👥 Krok 2: Znajomy rejestruje się z Twoim kodem...", { duration: 2000 });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 3: Simulate trial start
      toast.info("⏰ Krok 3: Znajomy rozpoczyna 7-dniowy okres próbny...", { duration: 2000 });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Step 4: Simulate subscription purchase
      toast.success("💎 Krok 4: Znajomy kupuje subskrypcję - polecenie zaliczone!", { duration: 3000 });
      
      // Step 5: Add demo reward
      await supabase
        .from("user_referral_stats")
        .upsert({
          user_id: user.id,
          successful_referrals: 1,
          total_points: 0,
          available_points: 0,
          free_months_earned: 1,
          current_tier: 'advocate'
        });
      
      toast.success("🎉 Gratulacje! Otrzymałeś 1 miesiąc darmowy!", { duration: 4000 });
      
    } catch (error) {
      console.error("Demo simulation error:", error);
      toast.error("Błąd podczas symulacji");
    } finally {
      setIsSimulating(false);
    }
  };

  const resetDemo = async () => {
    if (!user) return;
    
    try {
      // Reset user stats
      await supabase
        .from("user_referral_stats")
        .upsert({
          user_id: user.id,
          successful_referrals: 0,
          total_points: 0,
          available_points: 0,
          free_months_earned: 0,
          current_tier: 'beginner'
        });
      
      setDemoReferralCode("");
      toast.success("Demo zresetowane!");
    } catch (error) {
      console.error("Reset error:", error);
      toast.error("Błąd podczas resetowania");
    }
  };

  if (!user) {
    return (
      <Card className="border-2 border-dashed border-muted">
        <CardContent className="p-6 text-center">
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Zaloguj się, aby zobaczyć demo systemu poleceń</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Demo: System Poleceń w Akcji
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Zobacz jak działają polecenia krok po kroku
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Demo Controls */}
        <div className="flex flex-wrap gap-3">
          <Button 
            onClick={simulateReferralProcess}
            disabled={isSimulating}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {isSimulating ? "Symulacja..." : "Uruchom Demo"}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetDemo}
            disabled={isSimulating}
          >
            Reset Demo
          </Button>
        </div>

        {/* Demo Code Display */}
        {demoReferralCode && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Twój kod demo:</p>
            <div className="flex gap-2">
              <Input 
                value={`${window.location.origin}?ref=${demoReferralCode}`}
                readOnly 
                className="font-mono text-xs"
              />
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}?ref=${demoReferralCode}`)}
              >
                Kopiuj
              </Button>
            </div>
          </div>
        )}

        {/* Process Steps */}
        <div className="space-y-3">
          <h4 className="font-medium">Proces polecenia:</h4>
          
          <div className="grid gap-3">
            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">1. Udostępnij kod polecający</p>
                <p className="text-xs text-muted-foreground">Znajomy klika w Twój link</p>
              </div>
              <Badge variant="secondary">Instant</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
              <div className="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">2. Znajomy się rejestruje</p>
                <p className="text-xs text-muted-foreground">Otrzymuje 7 dni darmowo</p>
              </div>
              <Badge variant="secondary">7 dni trial</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
              <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">3. Znajomy kupuje subskrypcję</p>
                <p className="text-xs text-muted-foreground">Po okresie próbnym</p>
              </div>
              <Badge variant="default">Polecenie zaliczone!</Badge>
            </div>

            <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-primary/20">
              <div className="w-8 h-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">4. Otrzymujesz nagrodę</p>
                <p className="text-xs text-muted-foreground">Darmowe miesiące lub punkty</p>
              </div>
              <Badge className="bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Nagroda!
              </Badge>
            </div>
          </div>
        </div>

        {/* Rewards Info */}
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Schemat nagród:
          </h4>
          <div className="text-sm space-y-1">
            <p>• <strong>2 polecenia:</strong> 1 miesiąc darmowy</p>
            <p>• <strong>5 poleceń:</strong> 2 miesiące darmowe</p>
            <p>• <strong>10 poleceń:</strong> 5 miesięcy + punkty na nagrody</p>
            <p>• <strong>Powyżej 10:</strong> Karty podarunkowe (Spotify, Netflix, Steam...)</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};