import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Play, RotateCcw, CheckCircle2 } from "lucide-react";

export const ReferralTestScenarios = () => {
  const [running, setRunning] = useState(false);
  const { toast } = useToast();

  const runScenario = async (scenario: string) => {
    setRunning(true);
    toast({
      title: "Test rozpoczęty",
      description: `Uruchamiam scenariusz: ${scenario}`
    });
    
    try {
      // Add test implementation here
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Test zakończony",
        description: "Sprawdź panel Referrals aby zweryfikować wyniki"
      });
    } catch (error: any) {
      toast({
        title: "Błąd testu",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setRunning(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenariusze Testowe - Referrals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => runScenario('Happy Path')}
            disabled={running}
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            Test: Happy Path
          </Button>
          
          <Button
            onClick={() => runScenario('Quick Purchase')}
            disabled={running}
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            Test: Quick Purchase
          </Button>
          
          <Button
            onClick={() => runScenario('Ladder Rewards')}
            disabled={running}
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            Test: Ladder Rewards
          </Button>
          
          <Button
            onClick={() => runScenario('Duplicate Prevention')}
            disabled={running}
            variant="outline"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Test: Duplicate Prevention
          </Button>
        </div>
        
        <div className="pt-4 border-t">
          <p className="text-sm text-muted-foreground mb-3">
            Automatyczne testy są w fazie development. Zobacz docs/referral-testing-guide.md dla manualnych testów.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};