import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Flame, Clock, Trophy, Target, BookCheck, Calendar } from "lucide-react";

export function ProgressMiniBar() {
  const { user } = useAuth();

  const { data: todayStats } = useQuery({
    queryKey: ["mini-today", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const today = new Date().toISOString().slice(0, 10);
      const { data, error } = await supabase
        .from("daily_stats")
        .select("date,total_time_minutes,lessons_completed")
        .eq("user_id", user.id)
        .eq("date", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: streak } = useQuery({
    queryKey: ["mini-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak,longest_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: weeklyStats } = useQuery({
    queryKey: ["mini-weekly", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { data, error } = await supabase
        .from("daily_stats")
        .select("total_time_minutes,lessons_completed")
        .eq("user_id", user.id)
        .gte("date", weekAgo.toISOString().slice(0, 10));
      if (error) throw error;
      
      const weeklyTime = data.reduce((sum, day) => sum + (day.total_time_minutes || 0), 0);
      const weeklyLessons = data.reduce((sum, day) => sum + (day.lessons_completed || 0), 0);
      const activeDays = data.filter(day => day.total_time_minutes > 0).length;
      
      return { weeklyTime, weeklyLessons, activeDays };
    },
    enabled: !!user?.id,
  });

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  const items = useMemo(() => [
    {
      icon: <Flame className="w-5 h-5" />, 
      title: "Passa", 
      value: streak?.current_streak ?? 0, 
      subtitle: `Najlepsza: ${streak?.longest_streak ?? 0} dni`,
      description: "Dni nauki z rzędu"
    },
    {
      icon: <Clock className="w-5 h-5" />, 
      title: "Dzisiaj", 
      value: formatTime(todayStats?.total_time_minutes ?? 0), 
      subtitle: `Tydzień: ${formatTime(weeklyStats?.weeklyTime ?? 0)}`,
      description: "Czas spędzony na nauce"
    },
    {
      icon: <BookCheck className="w-5 h-5" />, 
      title: "Sesje", 
      value: todayStats?.lessons_completed ?? 0, 
      subtitle: `Tydzień: ${weeklyStats?.weeklyLessons ?? 0}`,
      description: "Ukończone lekcje"
    },
    {
      icon: <Calendar className="w-5 h-5" />, 
      title: "Aktywność", 
      value: `${weeklyStats?.activeDays ?? 0}/7`, 
      subtitle: weeklyStats?.activeDays === 7 ? "Perfekcyjny tydzień!" : "dni w tym tygodniu",
      description: "Regularność nauki"
    },
  ], [streak, todayStats, weeklyStats]);

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Twoje postępy
        </h2>
        <p className="text-center text-muted-foreground mt-1">Śledź swój rozwój w nauce matematyki</p>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item, idx) => (
          <Card key={idx} className="glass-card border border-primary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-muted-foreground">{item.title}</h3>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-2xl font-bold text-primary">{item.value}</div>
                <div className="text-xs text-muted-foreground">{item.subtitle}</div>
                <div className="text-xs text-muted-foreground/80">{item.description}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
