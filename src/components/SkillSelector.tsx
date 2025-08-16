import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Star, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Skill {
  id: string;
  name: string;
  description: string;
  department: string;
  level: string;
  class_level: number;
  estimated_time_minutes: number;
  difficulty_rating: number;
  learning_objectives: any;
  phases: any;
}

interface SkillProgress {
  skill_id: string;
  mastery_level: number;
  is_mastered: boolean;
  last_reviewed_at: string;
}

interface SkillSelectorProps {
  onSkillSelect: (skillId: string) => void;
  selectedDepartment?: string;
  className?: string;
}

export function SkillSelector({ onSkillSelect, selectedDepartment, className = "" }: SkillSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillProgress, setSkillProgress] = useState<Record<string, SkillProgress>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSkills();
  }, [selectedDepartment]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .order('class_level', { ascending: true });

      if (selectedDepartment) {
        query = query.eq('department', selectedDepartment);
      }

      const { data: skillsData, error: skillsError } = await query;

      if (skillsError) throw skillsError;

      setSkills(skillsData || []);

      // Load progress for these skills
      if (skillsData && skillsData.length > 0) {
        const { data: progressData, error: progressError } = await supabase
          .from('skill_progress')
          .select('*')
          .in('skill_id', skillsData.map(s => s.id));

        if (progressError) {
          console.error('Error loading skill progress:', progressError);
        } else {
          const progressMap = (progressData || []).reduce((acc, progress) => {
            acc[progress.skill_id] = progress;
            return acc;
          }, {} as Record<string, SkillProgress>);
          setSkillProgress(progressMap);
        }
      }
    } catch (error) {
      console.error('Error loading skills:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się załadować umiejętności",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (rating: number) => {
    if (rating <= 2) return { label: 'Łatwy', color: 'bg-success' };
    if (rating <= 4) return { label: 'Średni', color: 'bg-warning' };
    return { label: 'Trudny', color: 'bg-destructive' };
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'basic': return 'Podstawowy';
      case 'intermediate': return 'Średniozaawansowany';
      case 'advanced': return 'Zaawansowany';
      default: return level;
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-3 bg-muted rounded w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="h-3 bg-muted rounded w-full mb-2" />
              <div className="h-3 bg-muted rounded w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Wybierz umiejętność do nauki
        </h2>
        {selectedDepartment && (
          <Badge variant="outline" className="capitalize">
            {selectedDepartment.replace('_', ' ')}
          </Badge>
        )}
      </div>

      <div className="grid gap-4">
        {skills.map((skill) => {
          const progress = skillProgress[skill.id];
          const difficulty = getDifficultyLabel(skill.difficulty_rating);
          const objectives = skill.learning_objectives?.objectives || [];
          const phases = Object.keys(skill.phases || {}).length;

          return (
            <Card 
              key={skill.id} 
              className="hover:shadow-md transition-shadow cursor-pointer group"
              onClick={() => onSkillSelect(skill.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 group-hover:text-primary transition-colors">
                      {skill.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {skill.description}
                    </CardDescription>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    Klasa {skill.class_level}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {getLevelLabel(skill.level)}
                  </Badge>
                  <div className={`px-2 py-1 rounded-full text-xs text-white ${difficulty.color}`}>
                    {difficulty.label}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {progress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Postęp</span>
                      <span className="font-medium">
                        {progress.mastery_level}%
                        {progress.is_mastered && (
                          <Star className="inline h-4 w-4 text-warning ml-1" />
                        )}
                      </span>
                    </div>
                    <Progress value={progress.mastery_level} className="h-2" />
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{skill.estimated_time_minutes} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    <span>{phases} faz</span>
                  </div>
                </div>

                {objectives.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      Cele uczenia się:
                    </p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {objectives.slice(0, 2).map((objective: string, index: number) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-primary">•</span>
                          <span>{objective}</span>
                        </li>
                      ))}
                      {objectives.length > 2 && (
                        <li className="text-muted-foreground/70">
                          +{objectives.length - 2} więcej...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  variant={progress?.is_mastered ? "outline" : "default"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkillSelect(skill.id);
                  }}
                >
                  {progress?.is_mastered ? 'Powtórz' : 'Rozpocznij naukę'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {skills.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center py-8">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {selectedDepartment 
                  ? 'Brak dostępnych umiejętności w tej kategorii'
                  : 'Brak dostępnych umiejętności'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}