import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Clock, Trophy } from "lucide-react";

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
        .select("current_streak")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const items = useMemo(() => [
    {
      icon: <Flame className="w-4 h-4" />, label: "Streak", value: streak?.current_streak ?? 0, suffix: "dni",
    },
    {
      icon: <Clock className="w-4 h-4" />, label: "Dziś", value: todayStats?.total_time_minutes ?? 0, suffix: "min",
    },
    {
      icon: <Trophy className="w-4 h-4" />, label: "Lekcje", value: todayStats?.lessons_completed ?? 0, suffix: "",
    },
  ], [streak, todayStats]);

  return (
    <div className="container mx-auto px-6 py-4">
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        {items.map((it, idx) => (
          <Card key={idx} className="shadow-sm">
            <CardContent className="flex items-center justify-between py-3 px-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                {it.icon}
                <span className="text-xs md:text-sm">{it.label}</span>
              </div>
              <div className="text-sm md:text-base font-semibold">
                {it.value}{it.suffix ? ` ${it.suffix}` : ""}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
