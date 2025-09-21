import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Users, 
  Eye, 
  Clock, 
  MousePointer, 
  Smartphone, 
  Monitor,
  TrendingUp,
  RefreshCw,
  Activity,
  Globe
} from "lucide-react";
import { toast } from "sonner";

interface RealTimeMetrics {
  totalPageViews: number;
  uniqueUserCount: number;
  deviceTypes: Record<string, number>;
  popularPages: Record<string, number>;
  hourlyViews: number[];
  currentOnline: number;
  averageSessionDuration: number;
  bounceRate: number;
}

interface LiveSession {
  sessionId: string;
  userId?: string;
  currentPage: string;
  startedAt: string;
  deviceType: string;
  pagesVisited: number;
}

export const RealTimeAnalytics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchRealTimeMetrics = async () => {
    try {
      // Get real-time cache data
      const today = new Date().toISOString().split('T')[0];
      const { data: cacheData, error } = await supabase
        .from('analytics_cache')
        .select('cache_data')
        .eq('cache_key', `realtime_metrics_${today}`)
        .maybeSingle();

      if (error) throw error;

      if (cacheData?.cache_data) {
        const data = cacheData.cache_data as any; // Type assertion for Json type
        setMetrics({
          totalPageViews: data.totalPageViews || 0,
          uniqueUserCount: data.uniqueUserCount || 0,
          deviceTypes: data.deviceTypes || {},
          popularPages: data.popularPages || {},
          hourlyViews: data.hourlyViews || Array(24).fill(0),
          currentOnline: await getCurrentOnlineUsers(),
          averageSessionDuration: await getAverageSessionDuration(),
          bounceRate: await getBounceRate()
        });
      }

      // Get live sessions (active in last 5 minutes)
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);

      const { data: sessions } = await supabase
        .from('user_session_analytics')
        .select('session_id, user_id, exit_page, started_at, device_type, pages_visited')
        .is('ended_at', null)
        .gte('updated_at', fiveMinutesAgo.toISOString())
        .limit(20);

      if (sessions) {
        setLiveSessions(sessions.map(session => ({
          sessionId: session.session_id,
          userId: session.user_id,
          currentPage: session.exit_page || '/',
          startedAt: session.started_at,
          deviceType: session.device_type || 'desktop',
          pagesVisited: session.pages_visited || 1
        })));
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching real-time metrics:', error);
      toast.error('Błąd podczas pobierania danych analytics');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentOnlineUsers = async () => {
    const oneMinuteAgo = new Date();
    oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1);
    
    const { data, error } = await supabase
      .from('app_event_logs')
      .select('user_id')
      .gte('created_at', oneMinuteAgo.toISOString())
      .not('user_id', 'is', null);

    if (error) return 0;
    
    const uniqueUsers = new Set(data.map(log => log.user_id));
    return uniqueUsers.size;
  };

  const getAverageSessionDuration = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('user_session_analytics')
      .select('duration_minutes')
      .gte('started_at', `${today} 00:00:00`)
      .not('duration_minutes', 'is', null);

    if (error || !data.length) return 0;
    
    const totalDuration = data.reduce((sum, session) => sum + (session.duration_minutes || 0), 0);
    return Math.round(totalDuration / data.length * 10) / 10;
  };

  const getBounceRate = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('user_session_analytics')
      .select('is_bounce')
      .gte('started_at', `${today} 00:00:00`)
      .not('is_bounce', 'is', null);

    if (error || !data.length) return 0;
    
    const bounces = data.filter(session => session.is_bounce).length;
    return Math.round((bounces / data.length) * 100 * 10) / 10;
  };

  useEffect(() => {
    if (user) {
      fetchRealTimeMetrics();
      
      // Auto refresh every 30 seconds
      const interval = setInterval(fetchRealTimeMetrics, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 animate-pulse" />
          <h2 className="text-2xl font-bold">Real-time Analytics</h2>
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Brak danych analytics</h3>
        <p className="text-muted-foreground">Dane będą dostępne po pierwszych odwiedzinach strony.</p>
      </div>
    );
  }

  const deviceEntries = Object.entries(metrics.deviceTypes).sort((a, b) => b[1] - a[1]);
  const pageEntries = Object.entries(metrics.popularPages).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const currentHour = new Date().getHours();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <h2 className="text-2xl font-bold">Real-time Analytics</h2>
          <Badge variant="secondary" className="animate-pulse">
            LIVE
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-muted-foreground">
              Aktualizacja: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={fetchRealTimeMetrics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wyświetlenia dziś</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPageViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.hourlyViews[currentHour]} w tej godzinie
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywni użytkownicy</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.currentOnline}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.uniqueUserCount} unikalnych dziś
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Śr. czas sesji</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageSessionDuration}min</div>
            <p className="text-xs text-muted-foreground">
              {metrics.bounceRate}% bounce rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktywne sesje</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{liveSessions.length}</div>
            <p className="text-xs text-muted-foreground">
              ostatnie 5 minut
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="hourly" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hourly">Godzinowe</TabsTrigger>
          <TabsTrigger value="devices">Urządzenia</TabsTrigger>
          <TabsTrigger value="pages">Popularne strony</TabsTrigger>
          <TabsTrigger value="sessions">Live sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Wyświetlenia w ciągu dnia</CardTitle>
              <CardDescription>
                Aktywność użytkowników w poszczególnych godzinach
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {metrics.hourlyViews.map((views, hour) => {
                  const maxViews = Math.max(...metrics.hourlyViews);
                  const percentage = maxViews > 0 ? (views / maxViews) * 100 : 0;
                  const isCurrent = hour === currentHour;
                  
                  return (
                    <div key={hour} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-mono">
                        {hour.toString().padStart(2, '0')}:00
                        {isCurrent && <span className="text-primary"> •</span>}
                      </div>
                      <div className="flex-1">
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm font-medium">
                        {views.toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Typy urządzeń</CardTitle>
              <CardDescription>
                Rozkład odwiedzin według typu urządzenia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {deviceEntries.map(([device, count]) => {
                  const percentage = (count / metrics.totalPageViews) * 100;
                  const Icon = device === 'mobile' ? Smartphone : Monitor;
                  
                  return (
                    <div key={device} className="flex items-center gap-4">
                      <Icon className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium capitalize">{device}</span>
                          <span className="text-sm text-muted-foreground">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Najpopularniejsze strony</CardTitle>
              <CardDescription>
                Strony z największą liczbą wyświetleń dziś
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pageEntries.map(([page, views]) => {
                  const percentage = (views / metrics.totalPageViews) * 100;
                  
                  return (
                    <div key={page} className="flex items-center gap-4">
                      <MousePointer className="h-4 w-4" />
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium font-mono">{page}</span>
                          <span className="text-sm text-muted-foreground">
                            {views} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Aktywne sesje</CardTitle>
              <CardDescription>
                Użytkownicy aktywni w ostatnich 5 minutach
              </CardDescription>
            </CardHeader>
            <CardContent>
              {liveSessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">
                  Brak aktywnych sesji
                </p>
              ) : (
                <div className="space-y-2">
                  {liveSessions.map((session) => {
                    const startTime = new Date(session.startedAt);
                    const duration = Math.round((Date.now() - startTime.getTime()) / 60000);
                    
                    return (
                      <div key={session.sessionId} 
                           className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {session.deviceType === 'mobile' ? 
                            <Smartphone className="h-4 w-4" /> : 
                            <Monitor className="h-4 w-4" />
                          }
                          <div>
                            <div className="text-sm font-medium">
                              {session.userId ? 'Zalogowany' : 'Gość'}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {session.currentPage}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {session.pagesVisited} str.
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {duration}min temu
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};