import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Zap, Crown, Trophy, Calculator, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTokenUsage } from '@/hooks/useTokenUsage';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ConversionPromptsProps {
  context?: 'success_moment' | 'chat';
  onClose?: () => void;
}

export const ConversionPrompts = ({ context = 'chat', onClose }: ConversionPromptsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscription } = useTokenUsage();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [showSavingsCalculator, setShowSavingsCalculator] = useState(false);

  // Check how many times savings calculator was shown - SAFE localStorage access
  const getSavingsCalculatorCount = () => {
    if (typeof window === 'undefined') return 0;
    try {
      const count = localStorage.getItem('mentavo_savings_shown');
      return count ? parseInt(count) : 0;
    } catch {
      return 0;
    }
  };

  const incrementSavingsCalculatorCount = () => {
    if (typeof window === 'undefined') return;
    try {
      const currentCount = getSavingsCalculatorCount();
      localStorage.setItem('mentavo_savings_shown', (currentCount + 1).toString());
    } catch {
      // Silent fail - localStorage not available
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    
    setIsUpgrading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { plan: 'paid' }
      });

      if (error) throw error;
      
       if (data?.url) {
         try { (window.top || window).location.href = data.url; } catch { window.location.href = data.url; }
       }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się rozpocząć procesu upgrade'u",
        variant: "destructive"
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const showSavingsCalculatorPrompt = () => {
    const count = getSavingsCalculatorCount();
    if (count >= 3) return false; // Max 3 times during trial
    
    setShowSavingsCalculator(true);
    incrementSavingsCalculatorCount();
  };

  // Success moment trigger
  if (context === 'success_moment') {
    return (
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-800">
                  🎉 Świetna robota! Właśnie zaoszczędziłeś czas i pieniądze.
                </p>
                <p className="text-sm text-green-600">
                  Mentavo AI kosztuje 49,99 PLN/mies vs 560 PLN za tradycyjne korepetycje. Oszczędzasz 510 PLN miesięcznie!
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => showSavingsCalculatorPrompt()}
                disabled={getSavingsCalculatorCount() >= 3}
              >
                <Calculator className="w-4 h-4 mr-2" />
                Oblicz oszczędności
              </Button>
              <Button size="sm" onClick={handleUpgrade} disabled={isUpgrading}>
                <Crown className="w-4 h-4 mr-2" />
                Upgrade za 49,99 PLN
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Savings Calculator Modal */}
      <Dialog open={showSavingsCalculator} onOpenChange={setShowSavingsCalculator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-primary" />
                Kalkulator Oszczędności
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSavingsCalculator(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-4">Zobacz ile oszczędzisz!</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-medium">Tradycyjne korepetycje</p>
                <p className="text-lg font-bold text-red-800">8h × 70 PLN = 560 PLN/miesiąc</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">Mentavo AI Premium</p>
                <p className="text-lg font-bold text-green-800">49,99 PLN/miesiąc</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Twoje oszczędności</p>
                <p className="text-2xl font-bold text-blue-800">510 PLN/miesiąc</p>
                <p className="text-xs text-blue-600">To 6120 PLN rocznie!</p>
              </div>
            </div>

            <Button 
              onClick={handleUpgrade} 
              disabled={isUpgrading}
              className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Crown className="w-4 h-4 mr-2" />
              Zacznij oszczędzać - 49,99 PLN/mies
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};