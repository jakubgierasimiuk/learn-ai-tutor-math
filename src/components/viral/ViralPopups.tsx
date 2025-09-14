import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReferralV2 } from '@/hooks/useReferralV2';
import { useToast } from '@/hooks/use-toast';
import { 
  Trophy, 
  Gift, 
  Share2, 
  Users, 
  Target, 
  Sparkles,
  X,
  Copy,
  ExternalLink
} from 'lucide-react';

interface ViralPopupEvent {
  trigger: string;
  details?: any;
  stats?: any;
}

interface SocialProofEvent {
  type: 'testimonial' | 'local_stats' | 'fomo';
  data: any;
}

export const ViralPopups: React.FC = () => {
  const [activePopup, setActivePopup] = useState<ViralPopupEvent | null>(null);
  const [socialProof, setSocialProof] = useState<SocialProofEvent | null>(null);
  const [lastDismissed, setLastDismissed] = useState<number>(0);
  const { getReferralUrl, copyReferralUrl, shareReferralUrl } = useReferralV2();
  const { toast } = useToast();

  // Check user preferences for showing popups
  const getPopupPreference = (type: string): boolean => {
    try {
      const prefs = localStorage.getItem('popup-preferences');
      if (!prefs) return true;
      const parsed = JSON.parse(prefs);
      return parsed[type] !== false;
    } catch {
      return true;
    }
  };

  const setPopupPreference = (type: string, show: boolean) => {
    try {
      const prefs = localStorage.getItem('popup-preferences');
      const parsed = prefs ? JSON.parse(prefs) : {};
      parsed[type] = show;
      localStorage.setItem('popup-preferences', JSON.stringify(parsed));
    } catch {
      // Silent fail
    }
  };

  const shouldShowPopup = (): boolean => {
    const now = Date.now();
    const cooldownPeriod = 10 * 60 * 1000; // 10 minutes
    return now - lastDismissed > cooldownPeriod;
  };

  useEffect(() => {
    const handleViralPopup = (event: CustomEvent<ViralPopupEvent>) => {
      const { trigger } = event.detail;
      
      // Check cooldown and user preferences
      if (!shouldShowPopup() || !getPopupPreference('viral-popups') || !getPopupPreference(trigger)) {
        return;
      }
      
      setActivePopup(event.detail);
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        setActivePopup(null);
      }, 10000);
    };

    const handleSocialProof = (event: CustomEvent<SocialProofEvent>) => {
      const { type } = event.detail;
      
      // Check cooldown and user preferences  
      if (!shouldShowPopup() || !getPopupPreference('social-proof') || !getPopupPreference(type)) {
        return;
      }
      
      setSocialProof(event.detail);
      
      // Auto-hide after 6 seconds
      setTimeout(() => {
        setSocialProof(null);
      }, 6000);
    };

    window.addEventListener('show-viral-popup', handleViralPopup as EventListener);
    window.addEventListener('show-social-proof', handleSocialProof as EventListener);

    return () => {
      window.removeEventListener('show-viral-popup', handleViralPopup as EventListener);
      window.removeEventListener('show-social-proof', handleSocialProof as EventListener);
    };
  }, []);

  const handleShare = async () => {
    try {
      await shareReferralUrl();
      toast({ title: "Link udostępniony!", description: "Twój link polecający został udostępniony" });
      setActivePopup(null);
    } catch (error) {
      copyReferralUrl();
      toast({ title: "Link skopiowany!", description: "Link polecający został skopiowany do schowka" });
    }
  };

  const renderSuccessPopup = (popup: ViralPopupEvent) => {
    const { trigger, details, stats } = popup;

    let title = "";
    let message = "";
    let icon = <Sparkles className="w-6 h-6 text-primary" />;
    let showShareButton = true;

    switch (trigger) {
      case 'lesson_completed':
        title = "Świetnie! 🎉";
        message = "Właśnie ukończyłeś lekcję! Poleć znajomemu i obaj dostaniecie bonus.";
        icon = <Trophy className="w-6 h-6 text-yellow-500" />;
        break;
      case 'correct_answer':
        title = "Brawo! ✨";
        message = "Kolejna poprawna odpowiedź! Udostępnij swój sukces znajomym.";
        icon = <Target className="w-6 h-6 text-green-500" />;
        break;
      case 'milestone_reached':
        title = "Osiągnięcie odblokowane! 🏆";
        message = `Właśnie osiągnąłeś: ${details?.milestone || 'nowy poziom'}! Twoi znajomi też mogą to osiągnąć.`;
        icon = <Trophy className="w-6 h-6 text-purple-500" />;
        break;
      case 'streak_bonus':
        title = "Passa trwa! 🔥";
        message = `${details?.days || 0} dni z rzędu! Podziel się swoim sukcesem z znajomymi.`;
        icon = <Sparkles className="w-6 h-6 text-orange-500" />;
        break;
      default:
        showShareButton = false;
    }

    if (!showShareButton) return null;

    return (
      <Card className="border-primary/50 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              {icon}
              <div className="space-y-1">
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{message}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => {
              setLastDismissed(Date.now());
              setActivePopup(null);
            }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button size="sm" onClick={handleShare} className="flex-1">
              <Share2 className="w-3 h-3 mr-1" />
              Udostępnij
            </Button>
            <Button size="sm" variant="outline" onClick={() => {
              setLastDismissed(Date.now());
              setActivePopup(null);
            }}>
              Później
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setPopupPreference('viral-popups', false);
              setLastDismissed(Date.now());
              setActivePopup(null);
              toast({ title: "Popup-y wyłączone", description: "Nie będziemy już pokazywać popup-ów z poleceniami" });
            }}>
              Nie pokazuj więcej
            </Button>
          </div>

          {stats && (
            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
              <span>{stats.successful_referrals || 0} poleceń</span>
              <span>{stats.available_points || 0} punktów</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderSocialProof = (proof: SocialProofEvent) => {
    const { type, data } = proof;

    let content = null;

    switch (type) {
      case 'testimonial':
        content = (
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm">
              <strong>{data.name}</strong> poprawił wynik z {data.subject} o {data.improvement}%!
            </span>
          </div>
        );
        break;
      case 'local_stats':
        content = (
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm">
              W Twoim mieście <strong>{data.count}</strong> uczniów już korzysta z Mentavo AI
            </span>
          </div>
        );
        break;
      case 'fomo':
        content = (
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-500" />
            <span className="text-sm">
              <strong>Tylko dzisiaj:</strong> {data.message}
            </span>
            <Badge variant="outline" className="text-xs">
              {data.timeLeft}
            </Badge>
          </div>
        );
        break;
    }

    if (!content) return null;

    return (
      <Card className="border-muted shadow-sm bg-background/80 backdrop-blur-sm">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            {content}
            <Button variant="ghost" size="sm" onClick={() => {
              setLastDismissed(Date.now());
              setSocialProof(null);
            }}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {activePopup && renderSuccessPopup(activePopup)}
      {socialProof && renderSocialProof(socialProof)}
    </div>
  );
};