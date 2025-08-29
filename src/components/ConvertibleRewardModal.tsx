import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Zap, Gift } from 'lucide-react';

interface ConvertibleRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  reward: {
    id: string;
    amount: number;
    meta: {
      days_amount?: number;
      tokens_amount?: number;
      convertible_to?: string[];
    };
  };
  onRewardConsumed: () => void;
}

export const ConvertibleRewardModal: React.FC<ConvertibleRewardModalProps> = ({
  isOpen,
  onClose,
  reward,
  onRewardConsumed
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const daysAmount = reward.meta.days_amount || 3;
  const tokensAmount = reward.meta.tokens_amount || 1000;

  const consumeReward = async (type: 'days' | 'tokens') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('consume-convertible-reward', {
        body: {
          rewardId: reward.id,
          convertTo: type,
        }
      });

      if (error) {
        throw new Error(error.message || 'Błąd podczas wykorzystywania nagrody');
      }

      toast({
        title: "Nagroda wykorzystana",
        description: type === 'days' 
          ? `Dodano ${daysAmount} dni dostępu do konta`
          : `Dodano ${tokensAmount} tokenów do konta`,
      });

      onRewardConsumed();
      onClose();
      
    } catch (error) {
      console.error('Error consuming reward:', error);
      toast({
        title: "Błąd",
        description: error instanceof Error ? error.message : 'Nie udało się wykorzystać nagrody',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Wybierz nagrodę</DialogTitle>
          <DialogDescription className="text-center">
            Możesz wykorzystać swoją nagrodę jako dodatkowe dni dostępu lub tokeny AI. 
            Wybierz jedną opcję - decyzja jest nieodwracalna.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <Card 
            className="cursor-pointer border-2 hover:border-primary/50 transition-colors"
            onClick={() => !loading && consumeReward('days')}
          >
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{daysAmount} dni dostępu</h3>
                <p className="text-sm text-muted-foreground">
                  Przedłuż swój plan o {daysAmount} dni
                </p>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer border-2 hover:border-primary/50 transition-colors"
            onClick={() => !loading && consumeReward('tokens')}
          >
            <CardContent className="flex items-center space-x-4 p-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{tokensAmount} tokenów AI</h3>
                <p className="text-sm text-muted-foreground">
                  Dodatkowe tokeny do wykorzystania z AI
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col space-y-2">
          <p className="text-xs text-center text-muted-foreground">
            💡 <strong>Wskazówka:</strong> Dni dostępu są bardziej wartościowe dla długoterminowego uczenia się, 
            podczas gdy tokeny są przydatne jeśli intensywnie korzystasz z AI
          </p>
          
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full"
          >
            Zdecyduję później
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};