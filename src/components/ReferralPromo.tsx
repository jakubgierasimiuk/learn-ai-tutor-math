import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useReferralStats } from "@/hooks/useReferralStats";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Trophy, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { TierType } from "@/types";

export const ReferralPromo = () => {
  const { user } = useAuth();
  const { stats, loading } = useReferralStats();

  if (loading) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-10 bg-muted rounded w-1/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTierColor = (tier: TierType) => {
    switch (tier) {
      case 'legend': return 'bg-yellow-500';
      case 'ambassador': return 'bg-purple-500';
      case 'promoter': return 'bg-green-500';
      case 'advocate': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTierLabel = (tier: TierType) => {
    switch (tier) {
      case 'legend': return 'Legenda';
      case 'ambassador': return 'Ambasador';
      case 'promoter': return 'Promotor';
      case 'advocate': return 'Adwokat';
      default: return 'Początkujący';
    }
  };

  if (!user) {
    return (
      <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">System Poleceń</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Zapraszaj znajomych i zdobywaj nagrody! Darmowe miesiące aplikacji i karty podarunkowe.
              </p>
              <Badge variant="secondary" className="text-xs">
                Dostępne po zalogowaniu
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Gift className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">System Poleceń</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={`text-xs text-primary-foreground ${getTierColor(stats?.current_tier || 'beginner')}`}>
                  {getTierLabel(stats?.current_tier || 'beginner')}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {stats?.successful_referrals || 0} poleceń
                </span>
              </div>
            </div>
          </div>
          <Link to="/referral">
            <Button size="sm" variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Zarządzaj
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="w-4 h-4 text-primary mr-1" />
              <span className="font-semibold">{stats?.successful_referrals || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Polecenia</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Trophy className="w-4 h-4 text-primary mr-1" />
              <span className="font-semibold">{stats?.free_months_earned || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Darmowe mies.</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Gift className="w-4 h-4 text-primary mr-1" />
              <span className="font-semibold">{stats?.available_points || 0}</span>
            </div>
            <p className="text-xs text-muted-foreground">Punkty</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p className="mb-2">🎯 <strong>Jak to działa:</strong></p>
          <ul className="text-xs space-y-1 pl-4">
            <li>• Udostępnij swój link polecający</li>
            <li>• Znajomi otrzymują 7 dni darmowo</li>
            <li>• Ty dostajesz nagrody za każde polecenie</li>
          </ul>
        </div>

        <Link to="/referral" className="block mt-4">
          <Button className="w-full" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Zacznij polecać
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};