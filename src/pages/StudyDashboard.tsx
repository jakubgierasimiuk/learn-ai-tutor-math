import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Brain, Clock, TrendingUp, Play, Trophy, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Skill, SkillProgress, DepartmentProgress } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentMaterialsWizard } from '@/components/StudentMaterialsWizard';
import { Upload } from 'lucide-react';
import { Seo } from '@/components/Seo';

export default function StudyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [materialsOpen, setMaterialsOpen] = useState(false);

  // Fetch skills with progress
  const { data: skillsWithProgress, isLoading } = useQuery({
    queryKey: ['study-dashboard', user?.id],
    queryFn: async () => {
      console.log('Fetching skills for user:', user?.id);
      
      if (!user?.id) {
        console.log('No user ID available');
        return [];
      }

      // Get all skills (only high school topics)
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('*')
        .eq('is_active', true)
        .eq('school_type', 'liceum')
        .eq('is_hidden', false)
        .order('department', { ascending: true })
        .order('class_level_text', { ascending: true });

      console.log('Skills fetched:', skills);
      if (skillsError) {
        console.error('Skills error:', skillsError);
        throw skillsError;
      }

      // Get user progress for all skills
      const { data: progressData, error: progressError } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', user.id);

      console.log('Progress data fetched:', progressData);
      if (progressError) {
        console.error('Progress error:', progressError);
        throw progressError;
      }

      // Combine skills with progress data
      const result = skills.map(skill => ({
        ...skill,
        progress: progressData.find(p => p.skill_id === skill.id) || null
      }));
      
      console.log('Final skills with progress:', result);
      return result;
    },
    enabled: !!user?.id,
  });

  // Calculate department statistics
  const departmentStats: DepartmentProgress[] = React.useMemo(() => {
    console.log('Calculating department stats for:', skillsWithProgress);
    if (!skillsWithProgress) return [];

    const departments = [...new Set(skillsWithProgress.map(s => s.department))];
    console.log('Found departments:', departments);
    
    const stats = departments.map(dept => {
      const deptSkills = skillsWithProgress.filter(s => s.department === dept);
      const masteredSkills = deptSkills.filter(s => s.progress?.is_mastered).length;
      const inProgressSkills = deptSkills.filter(s => s.progress && !s.progress.is_mastered).length;
      
      return {
        department: dept,
        total_skills: deptSkills.length,
        mastered_skills: masteredSkills,
        in_progress_skills: inProgressSkills,
        mastery_percentage: deptSkills.length > 0 ? Math.round((masteredSkills / deptSkills.length) * 100) : 0
      };
    });
    
    console.log('Department stats calculated:', stats);
    return stats;
  }, [skillsWithProgress]);

  // Get available class levels
  const classLevels = React.useMemo(() => {
    if (!skillsWithProgress) return [];
    const levels = [...new Set(skillsWithProgress.map(s => s.class_level_text).filter(Boolean))];
    return levels.sort();
  }, [skillsWithProgress]);

  const filteredSkills = React.useMemo(() => {
    let filtered = skillsWithProgress || [];
    
    if (selectedClass) {
      filtered = filtered.filter(s => s.class_level_text === selectedClass);
    }
    
    if (selectedDepartment) {
      filtered = filtered.filter(s => s.department === selectedDepartment);
    }
    
    return filtered;
  }, [skillsWithProgress, selectedClass, selectedDepartment]);

  const startLesson = (skillId: string) => {
    navigate(`/study/lesson/${skillId}`);
  };

  const getDepartmentIcon = (department: string) => {
    const icons: Record<string, React.ReactNode> = {
      algebra: <Brain className="h-5 w-5" />,
      geometry: <Target className="h-5 w-5" />,
      trigonometry: <TrendingUp className="h-5 w-5" />,
      calculus: <BookOpen className="h-5 w-5" />,
      statistics: <Trophy className="h-5 w-5" />,
      sequences: <Play className="h-5 w-5" />,
      funkcje: <TrendingUp className="h-5 w-5" />
    };
    return icons[department] || <BookOpen className="h-5 w-5" />;
  };

  const getDepartmentName = (department: string) => {
    const names: Record<string, string> = {
      algebra: 'Algebra',
      analiza_matematyczna: 'Analiza matematyczna',
      calculus: 'Analiza matematyczna',
      'Rachunek różniczkowy i całkowy': 'Analiza matematyczna',
      geometry: 'Geometria',
      functions: 'Funkcje',
      funkcje: 'Funkcje',
      funkcje_elementarne: 'Funkcje elementarne',
      sequences: 'Ciągi',
      real_numbers: 'Liczby rzeczywiste',
      mathematics: 'Matematyka'
    };
    return names[department] || department;
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'basic':
        return 'Podstawowy';
      case 'intermediate':
        return 'Średniozaawansowany';
      case 'advanced':
        return 'Zaawansowany';
      case 'extended':
        return 'Rozszerzony';
      case 'expert':
        return 'Ekspercki';
      default:
        return 'Podstawowy';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <Seo
        title="Study & Learn — Korepetycje z matematyki"
        description="Rozpocznij naukę matematyki: ścieżki, postępy i szybkie starty."
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: "Study & Learn — Korepetycje z matematyki",
          description: "Rozpocznij naukę matematyki: ścieżki, postępy i szybkie starty."
        }}
      />
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Study & Learn</h1>
          <p className="text-muted-foreground">
            Interaktywny tutor matematyki - ucz się w swoim tempie z metodą sokratejską
          </p>
        </div>
        <div className="w-full md:w-auto flex items-center gap-2 flex-wrap md:flex-nowrap md:justify-end">
          <Link to="/chat">
            <Button size="sm" className="w-full md:w-auto flex items-center gap-2 shadow-primary" onClick={() => console.log('cta_chat_clicked', { source: 'study-dashboard' })}>
              <Brain className="w-4 h-4" /> Zapytaj korepetytora
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="w-full md:w-auto flex items-center gap-2" onClick={() => setMaterialsOpen(true)}>
            <Upload className="w-4 h-4" /> Dodaj materiały
          </Button>
        </div>
      </div>


      {/* Filters */}
      <div className="space-y-4">
        {/* Class Level Filter - Main Element */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h3 className="text-sm font-medium">Wybierz klasę:</h3>
            <Button
              variant={selectedClass === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedClass(null)}
            >
              Wszystkie klasy
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {classLevels.map(classLevel => (
              <Button
                key={classLevel}
                variant={selectedClass === classLevel ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedClass(classLevel)}
              >
                {classLevel}
              </Button>
            ))}
          </div>
        </div>

        {/* Department Filter - Secondary */}
        <div>
          <h3 className="text-sm font-medium mb-2">Filtruj po dziale:</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDepartment === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDepartment(null)}
            >
              Wszystkie działy
            </Button>
            {departmentStats.map(dept => (
              <Button
                key={dept.department}
                variant={selectedDepartment === dept.department ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDepartment(dept.department)}
                className="flex items-center gap-2"
              >
                {getDepartmentIcon(dept.department)}
                {getDepartmentName(dept.department)}
                <Badge variant="secondary" className="ml-1">
                  {dept.mastery_percentage}%
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills?.map(skill => {
          const progress = skill.progress;
          const masteryPercentage = progress ? (progress.mastery_level / 5) * 100 : 0;
          
          return (
            <Card key={skill.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base leading-tight">{skill.name}</CardTitle>
                  </div>
                  {getDepartmentIcon(skill.department)}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {skill.class_level_text || `Klasa ${skill.class_level}`}
                  </Badge>
                  <Badge variant={skill.level === 'extended' ? 'default' : 'secondary'} className="text-xs">
                    {skill.level === 'extended' ? 'Rozszerzony' : getLevelLabel(skill.level)}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    ~{skill.estimated_time_minutes} min
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {progress ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Postęp</span>
                      <span className="font-medium">{masteryPercentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={masteryPercentage} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{progress.correct_attempts}/{progress.total_attempts} poprawnych</span>
                      {progress.is_mastered && (
                        <Badge variant="default" className="text-xs">
                          <Trophy className="w-3 h-3 mr-1" />
                          Opanowane
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-muted-foreground mb-2">
                      Nie rozpoczęto jeszcze nauki
                    </p>
                    <Badge variant="outline">Nowa umiejętność</Badge>
                  </div>
                )}

                <Button 
                  onClick={() => startLesson(skill.id)} 
                  className="w-full"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {progress ? 'Kontynuuj naukę' : 'Rozpocznij lekcję'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredSkills?.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Brak umiejętności</h3>
            <p className="text-muted-foreground text-center">
              Nie znaleziono umiejętności w wybranym dziale.
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={materialsOpen} onOpenChange={setMaterialsOpen}>
        <DialogContent className="w-[95vw] sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dodaj materiały</DialogTitle>
          </DialogHeader>
          <StudentMaterialsWizard
            onStartLesson={(id) => { setMaterialsOpen(false); startLesson(id); }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}