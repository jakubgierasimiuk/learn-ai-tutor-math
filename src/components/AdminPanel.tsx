import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  DollarSign, 
  BookOpen, 
  Brain, 
  Shield, 
  TrendingUp,
  AlertTriangle,
  Clock,
  Target,
  Zap,
  BarChart3
} from "lucide-react";
import { TokenLimitDashboard } from "@/components/TokenLimitDashboard";
import { AnalyticsSection } from "@/components/AnalyticsSection";

export const AdminPanel = () => {
  const [selectedView, setSelectedView] = useState<"owner" | "admin">("owner");

  // Mock data - replace with real data from hooks/API
  const ownerMetrics = {
    mau: 2850,
    mrr: 142450,
    conversionRate: 18.5,
    churn: 3.2,
    retentionD7: 42.8,
    newRegistrations: 127,
    activeSubscriptions: 2851,
    arpu: 49.99,
    ltv: 899.82
  };

  const adminMetrics = {
    aiResponseTime: 1.2,
    tokenUsageDaily: 45670,
    aiErrors: 23,
    uptime: 99.8,
    pseudoActivity: 12.3,
    contentBlocked: 17
  };

  const topReferrers = [
    { name: "Anna K.", referrals: 23, reward: 1150 },
    { name: "Michał P.", referrals: 19, reward: 950 },
    { name: "Karolina W.", referrals: 16, reward: 800 },
    { name: "Tomasz M.", referrals: 14, reward: 700 },
    { name: "Julia S.", referrals: 12, reward: 600 }
  ];

  const difficultTopics = [
    { topic: "Nierówności kwadratowe", errors: 1247, errorRate: 68.3 },
    { topic: "Funkcje wykładnicze", errors: 1089, errorRate: 61.7 },
    { topic: "Pochodne funkcji", errors: 956, errorRate: 58.9 },
    { topic: "Całki oznaczone", errors: 834, errorRate: 55.2 },
    { topic: "Trygonometria", errors: 789, errorRate: 52.8 }
  ];

  const aiErrors = [
    { type: "Niepoprawne obliczenia", count: 89, trend: "↑" },
    { type: "Błędne wyjaśnienia", count: 67, trend: "↓" },
    { type: "Timeout odpowiedzi", count: 45, trend: "→" },
    { type: "Niewłaściwy format", count: 23, trend: "↑" },
    { type: "Problemy z LaTeX", count: 18, trend: "↓" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel Zarządczy</h1>
          <p className="text-muted-foreground">
            Zarządzanie aplikacją edukacyjną AI
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedView("owner")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === "owner" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Owner View
          </button>
          <button
            onClick={() => setSelectedView("admin")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedView === "admin" 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <Shield className="w-4 h-4 inline mr-2" />
            Admin View
          </button>
        </div>
      </div>

      {/* Alerts */}
      {adminMetrics.pseudoActivity > 20 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Wysoki poziom pseudo-aktywności: {adminMetrics.pseudoActivity}%
          </AlertDescription>
        </Alert>
      )}

      {selectedView === "owner" && (
        <div className="space-y-6">
          {/* Owner KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MAU</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ownerMetrics.mau.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12.5% od ostatniego miesiąca
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">MRR</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ownerMetrics.mrr.toLocaleString()} zł</div>
                <p className="text-xs text-muted-foreground">
                  +8.2% od ostatniego miesiąca
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Konwersja</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ownerMetrics.conversionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Trial → Płatność
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Churn</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ownerMetrics.churn}%</div>
                <p className="text-xs text-muted-foreground">
                  Miesięcznie
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Retencja D7</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ownerMetrics.retentionD7}%</div>
                <p className="text-xs text-muted-foreground">
                  Powrót po 7 dniach
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Owner Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Referrers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Polecający (Refer-a-Friend)</CardTitle>
                <CardDescription>Użytkownicy z największą liczbą poleceń</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topReferrers.map((referrer, index) => (
                    <div key={referrer.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-medium">{referrer.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{referrer.referrals} poleceń</div>
                        <div className="text-sm text-muted-foreground">{referrer.reward} zł</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Financial Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Podsumowanie Finansowe</CardTitle>
                <CardDescription>Kluczowe metryki finansowe</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">ARR</p>
                    <p className="text-2xl font-bold">{(ownerMetrics.mrr * 12).toLocaleString()} zł</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">ARPU</p>
                    <p className="text-2xl font-bold">{ownerMetrics.arpu} zł</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">LTV</p>
                    <p className="text-2xl font-bold">{ownerMetrics.ltv} zł</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Aktywne sub.</p>
                    <p className="text-2xl font-bold">{ownerMetrics.activeSubscriptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Difficult Topics Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Najtrudniejsze Tematy</CardTitle>
              <CardDescription>Tematy z największą liczbą błędów</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {difficultTopics.map((topic) => (
                  <div key={topic.topic} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{topic.topic}</span>
                      <Badge variant="destructive">{topic.errorRate}%</Badge>
                    </div>
                    <Progress value={topic.errorRate} className="h-2" />
                    <p className="text-sm text-muted-foreground">
                      {topic.errors} błędów
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === "admin" && (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Przegląd</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="token-limits">Limity Tokenów</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Admin KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Czas AI</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.aiResponseTime}s</div>
                <p className="text-xs text-muted-foreground">
                  Średni czas odpowiedzi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tokeny</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.tokenUsageDaily.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Dziennie
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Błędy AI</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.aiErrors}</div>
                <p className="text-xs text-muted-foreground">
                  Ostatnie 24h
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.uptime}%</div>
                <p className="text-xs text-muted-foreground">
                  Ostatni miesiąc
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pseudo-aktywność</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.pseudoActivity}%</div>
                <p className="text-xs text-muted-foreground">
                  Za szybkie odpowiedzi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Moderacja</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adminMetrics.contentBlocked}</div>
                <p className="text-xs text-muted-foreground">
                  Treści zablokowane
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Admin Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* AI Errors */}
            <Card>
              <CardHeader>
                <CardTitle>Najczęstsze Błędy AI</CardTitle>
                <CardDescription>Typy błędów w odpowiedziach AI</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {aiErrors.map((error) => (
                    <div key={error.type} className="flex items-center justify-between">
                      <div>
                        <span className="font-medium">{error.type}</span>
                        <p className="text-sm text-muted-foreground">
                          {error.count} wystąpień
                        </p>
                      </div>
                      <Badge variant={error.trend === "↑" ? "destructive" : error.trend === "↓" ? "default" : "secondary"}>
                        {error.trend}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader>
                <CardTitle>Zdrowie Systemu</CardTitle>
                <CardDescription>Kluczowe metryki techniczne</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Wydajność AI</span>
                    <span className="text-sm text-muted-foreground">{adminMetrics.aiResponseTime}s</span>
                  </div>
                  <Progress value={Math.max(0, 100 - (adminMetrics.aiResponseTime * 20))} />
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Stabilność</span>
                    <span className="text-sm text-muted-foreground">{adminMetrics.uptime}%</span>
                  </div>
                  <Progress value={adminMetrics.uptime} />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Zużycie zasobów</span>
                    <span className="text-sm text-muted-foreground">67%</span>
                  </div>
                  <Progress value={67} />
                </div>
              </CardContent>
            </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsSection />
          </TabsContent>
          
          <TabsContent value="token-limits">
            <TokenLimitDashboard />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};