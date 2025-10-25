import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb } from 'lucide-react';
import { useState, useEffect } from 'react';

export const TipsPanel = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user dismissed tips recently (within 7 days)
    const dismissedAt = localStorage.getItem('mentavo_tips_dismissed_at');
    if (dismissedAt) {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (parseInt(dismissedAt) > weekAgo) {
        // Recently dismissed, don't auto-show
        return;
      }
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('mentavo_tips_dismissed_at', Date.now().toString());
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10"
          title="Wskazówki"
        >
          <Lightbulb className="h-5 w-5 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Jak najlepiej uczyć się z AI?
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-120px)] mt-6 pr-4">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Pytaj nawet o rzeczy "oczywiste"</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="text-success">✅</span> "Czym w ogóle jest delta?"
              </p>
              <p className="text-sm text-muted-foreground">
                Nie krępuj się - zaczynam od Twojego poziomu!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. Jeśli coś niejasne - poproś inaczej:</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
                <li>"Wyjaśnij prościej"</li>
                <li>"Pokaż to na przykładzie"</li>
                <li>"Rozłóż to krok po kroku"</li>
                <li>"Zacznij od podstaw"</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Opisuj CO DOKŁADNIE nie rozumiesz:</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="text-success">✅</span> "Nie wiem dlaczego delta = b²-4ac"
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="text-destructive">❌</span> "Nie rozumiem delty"
              </p>
              <p className="text-sm text-muted-foreground">
                Im bardziej konkretne pytanie, tym lepiej pomogę!
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4. Błędy są super! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                Każdy błąd to szansa żeby zrozumieć DLACZEGO. Nie oceniam - pomagam zrozumieć.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5. Pytaj wielokrotnie jeśli trzeba:</h3>
              <p className="text-sm text-muted-foreground">
                Jeśli po moim wyjaśnieniu coś nadal nie gra - pytaj ponownie! Czasem trzeba usłyszeć to samo na kilka sposobów.
              </p>
            </div>

            <div className="border-t pt-4 mt-6">
              <p className="text-sm text-muted-foreground">
                💬 Potrzebujesz pomocy? Napisz <span className="font-mono text-primary">"jak mam pytać?"</span> w każdej chwili!
              </p>
            </div>

            <Button onClick={handleClose} className="w-full mt-4">
              Rozumiem
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
