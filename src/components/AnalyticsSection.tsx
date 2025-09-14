import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock, 
  MousePointer, 
  Smartphone,
  Monitor,
  Tablet,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsMetrics {
  totalPageViews: number;
  uniquePageViews: number;
  totalSessions: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  pageViewsChange: string;
  pagesPerSession: number;
}

interface PopularPage {
  route: string;
  pageViews: number;
  uniqueViews: number;
  avgDuration: number;
  bounceRate: number;
}

interface UserBehaviorData {
  deviceTypes: Array<{ device: string; count: number }>;
  entryPages: Array<{ page: string; count: number }>;
  exitPages: Array<{ page: string; count: number }>;
}

export const AnalyticsSection = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [popularPages, setPopularPages] = useState<PopularPage[]>([]);
  const [userBehavior, setUserBehavior] = useState<UserBehaviorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch dashboard metrics
      const { data: metricsData, error: metricsError } = await supabase.functions.invoke('analytics-processor', {
        body: { method: 'getDashboardMetrics', period }
      });

      if (metricsError) throw metricsError;
      setMetrics(metricsData.metrics);

      // Fetch popular pages
      const { data: pagesData, error: pagesError } = await supabase.functions.invoke('analytics-processor', {
        body: { method: 'getPopularPages', period }
      });

      if (pagesError) throw pagesError;
      setPopularPages(pagesData.popularPages);

      // Fetch user behavior
      const { data: behaviorData, error: behaviorError } = await supabase.functions.invoke('analytics-processor', {
        body: { method: 'getUserBehavior', period }
      });

      if (behaviorError) throw behaviorError;
      setUserBehavior(behaviorData);

    } catch (error) {
      console.error('Analytics fetch error:', error);
      toast({
        title: "Błąd Analytics",
        description: "Nie udało się pobrać danych analitycznych",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${Math.round(minutes)}m`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics</h2>
          <RefreshCw className="h-5 w-5 animate-spin" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytics</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {['1d', '7d', '30d', '90d'].map((p) => (
              <Button
                key={p}
                variant={period === p ? "default" : "outline"}
                size="sm"
                onClick={() => setPeriod(p)}
              >
                {p}
              </Button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Wyświetlenia</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics?.totalPageViews || 0)}</div>
            <Badge variant="secondary" className="text-xs">
              {metrics?.pageViewsChange || '+0%'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Unikalni użytkownicy</span>
            </div>
            <div className="text-2xl font-bold">{formatNumber(metrics?.uniqueUsers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.totalSessions || 0} sesji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Średni czas sesji</span>
            </div>
            <div className="text-2xl font-bold">
              {formatDuration(metrics?.averageSessionDuration || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics?.pagesPerSession || 0} stron/sesję
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Bounce Rate</span>
            </div>
            <div className="text-2xl font-bold">{metrics?.bounceRate || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Jednostronne wizyty
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Popularne Strony</TabsTrigger>
          <TabsTrigger value="behavior">Zachowania Użytkowników</TabsTrigger>
        </TabsList>

        <TabsContent value="pages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Stron</CardTitle>
              <CardDescription>
                Najpopularniejsze strony w okresie {period}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {popularPages.length > 0 ? (
                  popularPages.map((page, index) => (
                    <div key={page.route} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{page.route}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(page.pageViews)} wyświetleń • {formatNumber(page.uniqueViews)} unikalnych
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatDuration(page.avgDuration)}</p>
                        <p className="text-xs text-muted-foreground">{page.bounceRate}% bounce</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Brak danych dla wybranego okresu
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {popularPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Wykres Wyświetleń</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={popularPages.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="route" 
                      tick={{ fontSize: 12 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="pageViews" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Device Types */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Urządzenia</CardTitle>
              </CardHeader>
              <CardContent>
                {userBehavior?.deviceTypes && userBehavior.deviceTypes.length > 0 ? (
                  <div className="space-y-3">
                    {userBehavior.deviceTypes.map((device) => (
                      <div key={device.device} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(device.device)}
                          <span className="text-sm capitalize">{device.device}</span>
                        </div>
                        <Badge variant="secondary">{device.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych</p>
                )}
              </CardContent>
            </Card>

            {/* Entry Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Strony Wejściowe</CardTitle>
              </CardHeader>
              <CardContent>
                {userBehavior?.entryPages && userBehavior.entryPages.length > 0 ? (
                  <div className="space-y-3">
                    {userBehavior.entryPages.map((entry) => (
                      <div key={entry.page} className="flex items-center justify-between">
                        <span className="text-sm truncate">{entry.page}</span>
                        <Badge variant="secondary">{entry.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych</p>
                )}
              </CardContent>
            </Card>

            {/* Exit Pages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Strony Wyjściowe</CardTitle>
              </CardHeader>
              <CardContent>
                {userBehavior?.exitPages && userBehavior.exitPages.length > 0 ? (
                  <div className="space-y-3">
                    {userBehavior.exitPages.map((exit) => (
                      <div key={exit.page} className="flex items-center justify-between">
                        <span className="text-sm truncate">{exit.page}</span>
                        <Badge variant="secondary">{exit.count}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Brak danych</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Device Distribution Chart */}
          {userBehavior?.deviceTypes && userBehavior.deviceTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Rozkład Urządzeń</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={userBehavior.deviceTypes}
                      dataKey="count"
                      nameKey="device"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="hsl(var(--primary))"
                      label={({ device, count }) => `${device}: ${count}`}
                    >
                      {userBehavior.deviceTypes.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};