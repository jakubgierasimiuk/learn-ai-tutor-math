import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExampleQuestionsProps {
  onSelect: (question: string) => void;
}

const EXAMPLE_QUESTIONS = [
  "Wyjaśnij mi równania kwadratowe od podstaw",
  "Pomóż rozwiązać: 2x + 5 = 13",
  "Co to jest funkcja?"
];

export const ExampleQuestions = ({ onSelect }: ExampleQuestionsProps) => {
  return (
    <div className="flex flex-col gap-2 mt-3 animate-in fade-in duration-500">
      <p className="text-sm text-muted-foreground mb-1">
        Kliknij jedno z poniższych lub napisz swoje pytanie:
      </p>
      {EXAMPLE_QUESTIONS.map((question, index) => (
        <Button
          key={index}
          variant="outline"
          className="justify-start text-left h-auto py-3 px-4 hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:border-primary/50 transition-all"
          onClick={() => onSelect(question)}
        >
          {question}
        </Button>
      ))}
    </div>
  );
};
