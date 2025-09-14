import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { logBugReport } from '@/lib/logger';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface BugReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BugReportModal = ({ open, onOpenChange }: BugReportModalProps) => {
  const [description, setDescription] = useState('');
  const [whatHappened, setWhatHappened] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [severity, setSeverity] = useState<'blocking' | 'hindering' | 'cosmetic'>('hindering');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !whatHappened.trim()) {
      toast({
        title: "Wypełnij wymagane pola",
        description: "Opisz co próbowałeś zrobić i co się stało zamiast tego.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await logBugReport(
        description.trim(),
        whatHappened.trim(),
        reproductionSteps.trim(),
        severity
      );
      
      if (result) {
        toast({
          title: "Zgłoszenie zostało wysłane",
          description: "Dziękujemy za zgłoszenie błędu. Nasz zespół zajmie się tym jak najszybciej.",
        });
        
        // Reset form
        setDescription('');
        setWhatHappened('');
        setReproductionSteps('');
        setSeverity('hindering');
        onOpenChange(false);
      } else {
        throw new Error('Failed to submit bug report');
      }
    } catch (error) {
      toast({
        title: "Błąd podczas wysyłania",
        description: "Nie udało się wysłać zgłoszenia. Spróbuj ponownie lub skontaktuj się z nami bezpośrednio.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDescription('');
    setWhatHappened('');
    setReproductionSteps('');
    setSeverity('hindering');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Zgłoś problem
          </DialogTitle>
          <DialogDescription>
            Pomóż nam poprawić aplikację - opisz napotkany problem. Automatycznie dołączamy informacje techniczne.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Co próbowałeś zrobić? *
            </Label>
            <Textarea
              id="description"
              placeholder="np. Chciałem rozwiązać zadanie z równań kwadratowych..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-20 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatHappened" className="text-sm font-medium">
              Co się stało zamiast tego? *
            </Label>
            <Textarea
              id="whatHappened"
              placeholder="np. Aplikacja się zawiesiła, nie można było kliknąć przycisku, pojawił się błąd..."
              value={whatHappened}
              onChange={(e) => setWhatHappened(e.target.value)}
              className="min-h-20 resize-none"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reproductionSteps" className="text-sm font-medium">
              Jak można to powtórzyć? (opcjonalnie)
            </Label>
            <Textarea
              id="reproductionSteps"
              placeholder="np. 1. Wejdź na stronę X 2. Kliknij przycisk Y 3. Wpisz tekst Z..."
              value={reproductionSteps}
              onChange={(e) => setReproductionSteps(e.target.value)}
              className="min-h-16 resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Jak bardzo to przeszkodziło?</Label>
            <RadioGroup value={severity} onValueChange={(value) => setSeverity(value as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="blocking" id="blocking" />
                <Label htmlFor="blocking" className="flex-1 cursor-pointer">
                  <span className="font-medium text-red-600">Blokuje naukę</span>
                  <span className="text-sm text-muted-foreground ml-2">- nie mogę kontynuować</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hindering" id="hindering" />
                <Label htmlFor="hindering" className="flex-1 cursor-pointer">
                  <span className="font-medium text-orange-600">Utrudnia naukę</span>
                  <span className="text-sm text-muted-foreground ml-2">- mogę obejść, ale to denerwujące</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cosmetic" id="cosmetic" />
                <Label htmlFor="cosmetic" className="flex-1 cursor-pointer">
                  <span className="font-medium text-blue-600">Problem kosmetyczny</span>
                  <span className="text-sm text-muted-foreground ml-2">- nie wpływa na funkcjonalność</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={handleReset}>
              Wyczyść formularz
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Anuluj
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Wysyłanie..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Wyślij zgłoszenie
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};