import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Trophy, Target, Clock, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SkillProgress {
  mastery_level: number;
  total_attempts: number;
  correct_attempts: number;
  consecutive_correct: number;
  is_mastered: boolean;
  difficulty_multiplier: number;
  last_reviewed_at: string;
}

interface SmartResumeProps {
  skillId: string;
  skillName: string;
  onContinue: () => void;
  onStartOver: () => void;
}

export function SmartResume({ skillId, skillName, onContinue, onStartOver }: SmartResumeProps) {
  const [skillProgress, setSkillProgress] = useState<SkillProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSkillProgress();
  }, [skillId]);

  const loadSkillProgress = async () => {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) return;

      const { data: progress, error } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('skill_id', skillId)
        .maybeSingle();

      if (error) {
        console.error('Error loading skill progress:', error);
        return;
      }

      setSkillProgress(progress);
    } catch (error) {
      console.error('Error in loadSkillProgress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no progress exists, show start fresh option
  if (!skillProgress) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Nowa umiejętność
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rozpoczynasz naukę: <span className="font-medium text-foreground">{skillName}</span>
          </p>
          <Button onClick={onContinue} className="w-full">
            Rozpocznij naukę
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getDifficultyLevel = (multiplier: number) => {
    if (multiplier >= 1.5) return { label: "Zaawansowany", color: "bg-red-500" };
    if (multiplier >= 1.2) return { label: "Średnio-zaawansowany", color: "bg-orange-500" };
    if (multiplier >= 1.0) return { label: "Średni", color: "bg-yellow-500" };
    return { label: "Podstawowy", color: "bg-green-500" };
  };

  const getLastStudiedText = (lastReviewed: string) => {
    const now = new Date();
    const lastDate = new Date(lastReviewed);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "dzisiaj";
    if (diffDays === 1) return "wczoraj";
    if (diffDays < 7) return `${diffDays} dni temu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} tygodni temu`;
    return `${Math.floor(diffDays / 30)} miesięcy temu`;
  };

  const accuracy = skillProgress.total_attempts > 0 
    ? Math.round((skillProgress.correct_attempts / skillProgress.total_attempts) * 100)
    : 0;

  const difficultyInfo = getDifficultyLevel(skillProgress.difficulty_multiplier);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {skillProgress.is_mastered ? (
            <Trophy className="h-5 w-5 text-yellow-500" />
          ) : (
            <TrendingUp className="h-5 w-5 text-primary" />
          )}
          Kontynuuj naukę
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Postęp w {skillName}</span>
            <Badge 
              variant={skillProgress.is_mastered ? "default" : "secondary"}
              className="flex items-center gap-1"
            >
              {skillProgress.is_mastered && <CheckCircle className="h-3 w-3" />}
              {skillProgress.mastery_level}% opanowanie
            </Badge>
          </div>
          <Progress value={skillProgress.mastery_level} className="h-2" />
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">{skillProgress.total_attempts}</div>
            <div className="text-xs text-muted-foreground">zadań rozwiązanych</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-green-600">{accuracy}%</div>
            <div className="text-xs text-muted-foreground">skuteczność</div>
          </div>
        </div>

        {/* Current Level & Last Study */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Aktualny poziom:</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${difficultyInfo.color}`} />
              {difficultyInfo.label}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Ostatnio:</span>
            <div className="flex items-center gap-1 text-sm">
              <Clock className="h-3 w-3" />
              {getLastStudiedText(skillProgress.last_reviewed_at)}
            </div>
          </div>

          {skillProgress.consecutive_correct > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Seria prawidłowych:</span>
              <Badge variant="outline" className="text-green-600">
                {skillProgress.consecutive_correct} z rzędu
              </Badge>
            </div>
          )}
        </div>

        {/* Resume Message */}
        <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm text-center">
            {skillProgress.is_mastered ? (
              <>
                🎉 <strong>Gratulacje!</strong> Opanowałeś już tę umiejętność. 
                Możesz kontynuować ćwiczenia na poziomie zaawansowanym lub wybrać nową umiejętność.
              </>
            ) : skillProgress.consecutive_correct >= 3 ? (
              <>
                🔥 <strong>Świetna passa!</strong> Masz {skillProgress.consecutive_correct} poprawnych odpowiedzi z rzędu. 
                Kontynuuj na {difficultyInfo.label.toLowerCase()} poziomie.
              </>
            ) : accuracy >= 80 ? (
              <>
                ⭐ <strong>Dobra robota!</strong> Osiągnąłeś {accuracy}% skuteczność. 
                Kontynuujemy na obecnym poziomie.
              </>
            ) : (
              <>
                💪 <strong>Rozwijaj się!</strong> Masz {accuracy}% skuteczność z {skillProgress.total_attempts} zadań. 
                Kontynuujmy pracę nad tym tematem.
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button onClick={onContinue} className="w-full" size="lg">
            {skillProgress.is_mastered 
              ? "Kontynuuj trening zaawansowany" 
              : `Kontynuuj od poziomu ${difficultyInfo.label.toLowerCase()}`
            }
          </Button>
          <Button onClick={onStartOver} variant="outline" className="w-full">
            Zacznij od podstaw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}