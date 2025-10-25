import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface DiagnosticChoice {
  label: string;
  value: string;
  icon: string;
  description?: string;
}

interface DiagnosticChoicesProps {
  question: string;
  choices: DiagnosticChoice[];
  onSelect: (value: string) => void;
}

export const DiagnosticChoices = ({ question, choices, onSelect }: DiagnosticChoicesProps) => {
  return (
    <Card className="mt-3 border-warning/30 bg-warning/5">
      <CardContent className="pt-4">
        <p className="text-sm font-medium mb-3">{question}</p>
        <div className="flex flex-col gap-2">
          {choices.map((choice) => (
            <Button
              key={choice.value}
              variant="outline"
              className="justify-start text-left h-auto py-3 px-4 hover:bg-warning/10 hover:border-warning transition-all"
              onClick={() => onSelect(choice.value)}
            >
              <span className="mr-2">{choice.icon}</span>
              <div className="flex flex-col">
                <span className="font-medium">{choice.label}</span>
                {choice.description && (
                  <span className="text-xs text-muted-foreground mt-0.5">
                    {choice.description}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
