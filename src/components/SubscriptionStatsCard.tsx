import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Users, CreditCard, UserX, Clock, Zap, RefreshCw } from "lucide-react";
import { useSubscriptionStats } from "@/hooks/useSubscriptionStats";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

export const SubscriptionStatsCard = () => {
  const { stats, loading, error, refreshStats } = useSubscriptionStats();
  const [migrationLoading, setMigrationLoading] = useState(false);

  const runMigration = async () => {
    try {
      setMigrationLoading(true);
      const { data, error } = await supabase.functions.invoke('migrate-trial-dates');
      
      if (error) throw error;
      
      toast.success(`Migracja zakończona: ${data.migrated} kont przetworzonych`);
      refreshStats();
    } catch (err) {
      console.error('Migration error:', err);
      toast.error('Błąd podczas migracji');
    } finally {
      setMigrationLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statystyki Subskrypcji</CardTitle>
          <CardDescription>Ładowanie...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Statystyki Subskrypcji</CardTitle>
          <CardDescription className="text-destructive">Błąd: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Konta Darmowe</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.freeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              Aktywne trialy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Limity Przekroczone</CardTitle>
            <Zap className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.tokenLimitExceeded}</div>
            <p className="text-xs text-muted-foreground">
              Wymagają reklasyfikacji
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wygasłe Triale</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trialExpired}</div>
            <p className="text-xs text-muted-foreground">
              Do przeniesienia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ograniczone</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.limitedFreeAccounts}</div>
            <p className="text-xs text-muted-foreground">
              1000 tokenów/miesiąc
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Płatne</CardTitle>
            <CreditCard className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paidAccounts}</div>
            <p className="text-xs text-muted-foreground">
              10M tokenów/miesiąc
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trial Days Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Rozkład Dni Pozostałych w Trialu</CardTitle>
          <CardDescription>Liczba kont wg dni pozostałych do końca triala</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-4">
            {Object.entries(stats.trialDaysBreakdown).map(([day, count]) => (
              <div key={day} className="text-center">
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {day.replace('day', 'Dzień ')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Migration Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Narzędzia Migracji</CardTitle>
          <CardDescription>Zarządzanie migracją i naprawą statusów kont</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Migracja dat trialu</p>
              <p className="text-sm text-muted-foreground">
                Ustawi trial_end_date dla istniejących kont i przeniesie stare konta do limited_free
              </p>
            </div>
            <Button 
              onClick={runMigration}
              disabled={migrationLoading}
              variant="outline"
            >
              {migrationLoading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Uruchom Migrację
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Odśwież statystyki</p>
              <p className="text-sm text-muted-foreground">
                Pobierz najnowsze dane o kontach i subskrypcjach
              </p>
            </div>
            <Button 
              onClick={refreshStats}
              disabled={loading}
              variant="outline"
            >
              {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Odśwież
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Podsumowanie Statusów</CardTitle>
          <CardDescription>Całkowity przegląd wszystkich typów kont</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Całkowita liczba kont</span>
              <Badge variant="outline">{stats.totalAccounts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Aktywne darmowe trialy</span>
              <Badge variant="default">{stats.freeAccounts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Płatne subskrypcje</span>
              <Badge variant="default" className="bg-green-500">{stats.paidAccounts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Konta ograniczone</span>
              <Badge variant="secondary">{stats.limitedFreeAccounts}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Konta wygasłe</span>
              <Badge variant="destructive">{stats.expiredAccounts}</Badge>
            </div>
          </div>
          
          {(stats.tokenLimitExceeded > 0 || stats.trialExpired > 0) && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-medium text-amber-800">
                ⚠️ Wymagana interwencja: {stats.tokenLimitExceeded} kont przekroczyło limity, {stats.trialExpired} triali wygasło
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};