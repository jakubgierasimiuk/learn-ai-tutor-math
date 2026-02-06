import { AIChat } from '@/components/AIChat';
import { Seo } from '@/components/Seo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRoles } from '@/hooks/useRoles';
import { Brain, MessageCircle, Gift, Settings, LogOut, Bug, Crown, Database, Clock } from 'lucide-react';
import { logEvent } from '@/lib/logger';
import { BugReportModal } from '@/components/BugReportModal';
import mentavoLogoIcon from '@/assets/mentavo-logo-icon.png';

const ChatPage = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRoles();

  return (
    <>
      <Seo
        title="mentavo.ai - Chat z AI"
        description="Rozmawiaj z mentavo.ai. Zadawaj pytania, uzyskuj wyjaśnienia i rozwiązuj zadania krok po kroku."
      />

      {/* Chat Header */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left - Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Wróć</span>
            </Button>

            {/* Center - Logo */}
            <Link to="/app" className="flex items-center gap-2">
              <img src={mentavoLogoIcon} alt="Mentavo AI" className="w-8 h-8" />
              <span className="font-semibold text-lg">Mentavo AI</span>
            </Link>

            {/* Right - Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 top-full w-64 bg-background border border-border rounded-lg shadow-lg m-2 p-2 animate-in fade-in slide-in-from-top-2">
            <div className="space-y-1">
              {/* NAUKA */}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Nauka
              </div>
              <Link
                to="/chat"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-primary/10 text-primary font-medium"
              >
                <MessageCircle className="w-4 h-4" />
                Czat z AI
              </Link>
              <Link
                to="/study"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <Brain className="w-4 h-4" />
                Lekcje
              </Link>

              {/* SPOŁECZNOŚĆ */}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                Społeczność
              </div>
              <Link
                to="/referral"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <Gift className="w-4 h-4" />
                Poleć znajomym
              </Link>

              {/* KONTO */}
              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-2">
                Konto
              </div>
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4" />
                Ustawienia konta
              </Link>
              <div className="px-3 py-1 text-sm text-muted-foreground truncate">
                {user?.email}
              </div>

              <div className="border-t border-border my-2" />

              <button
                onClick={() => {
                  setIsBugReportOpen(true);
                  setMenuOpen(false);
                  logEvent('bug_report_opened', { source: 'chat_menu' });
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors w-full text-left text-muted-foreground hover:text-primary"
              >
                <Bug className="w-4 h-4" />
                Zgłoś problem
              </button>
              <button
                onClick={() => {
                  signOut();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Wyloguj
              </button>

              {/* ADMIN - tylko dla adminów */}
              {isAdmin && (
                <>
                  <div className="border-t border-border my-2" />
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Admin
                  </div>
                  <Link
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <Crown className="w-4 h-4" />
                    Panel Admina
                  </Link>
                  <Link
                    to="/ai-logs"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    Logi AI
                  </Link>
                  <Link
                    to="/sessions"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <Clock className="w-4 h-4" />
                    Sesje
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Chat Content */}
      <div className="min-h-[calc(100vh-3.5rem)] bg-background p-0 md:p-4">
        <div className="w-full md:container md:mx-auto py-2 md:py-4">
          <AIChat />
        </div>
      </div>

      {/* Bug Report Modal */}
      <BugReportModal open={isBugReportOpen} onOpenChange={setIsBugReportOpen} />
    </>
  );
};

export default ChatPage;