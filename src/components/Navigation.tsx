import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Brain, BookOpen, MessageCircle, LogOut, Upload, TrendingUp, Database, Clock, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { logEvent } from "@/lib/logger";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleCtaClick = (action: string) => {
    logEvent('landing_cta_click', { action });
  };

  return (
    <nav className="z-50 bg-background/80 backdrop-blur-md border-b border-border md:sticky md:top-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-12 md:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">AI Tutor</span>
          </Link>

          {user ? (
            <>
              {/* Desktop Navigation - Logged In */}
              <div className="hidden md:flex items-center gap-8">
                <Link 
                  to="/study" 
                  className={`flex items-center gap-2 transition-smooth ${
                    isActive('/study') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  Study & Learn
                </Link>
                <Link 
                  to="/postepy" 
                  className={`flex items-center gap-2 transition-smooth ${
                    isActive('/postepy') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Postępy
                </Link>
                <Link 
                  to="/ai-logs" 
                  className={`flex items-center gap-2 transition-smooth ${
                    isActive('/ai-logs') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
                  }`}
                >
                  <Database className="w-4 h-4" />
                  AI Logs
                </Link>
                <Link 
                  to="/sessions" 
                  className={`flex items-center gap-2 transition-smooth ${
                    isActive('/sessions') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  Sesje
                </Link>
                <Button asChild size="sm" className="shadow-primary" onClick={() => logEvent('cta_click', { source: 'nav' })}>
                  <Link to="/chat">
                    <span className="inline-flex items-center"><MessageCircle className="w-4 h-4 mr-2" />AI Korepetytor</span>
                  </Link>
                </Button>
              </div>

              {/* User Info & Logout */}
              <div className="hidden md:flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {user?.email}
                </span>
                <Button asChild variant="ghost" size="sm">
                  <Link to="/account" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Konto
                  </Link>
                </Button>
                <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Desktop Navigation - Not Logged In */}
              <div className="hidden md:flex items-center gap-4">
                <Link to="/auth">
                  <Button variant="outline" className="hover-lift">
                    Zaloguj się
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button className="shadow-primary hover-lift" onClick={() => handleCtaClick('header_signup')}>
                    Rozpocznij za darmo
                  </Button>
                </Link>
              </div>
            </>
          )}

          {/* Mobile menu button */}
          <button 
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`w-5 h-0.5 bg-foreground transition-all ${isOpen ? 'rotate-45 translate-y-1' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-foreground transition-all mt-1 ${isOpen ? 'opacity-0' : ''}`}></span>
              <span className={`w-5 h-0.5 bg-foreground transition-all mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`}></span>
            </div>
          </button>
        </div>

          {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fadeIn">
            {user ? (
              <>
                <div className="flex flex-col gap-4">
                  <Link 
                    to="/study" 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                      isActive('/study') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Brain className="w-4 h-4" />
                    Study & Learn
                  </Link>
                  <Link 
                    to="/chat" 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                      isActive('/chat') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <MessageCircle className="w-4 h-4" />
                    AI Korepetytor
                  </Link>
                  <Link 
                    to="/ai-logs" 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                      isActive('/ai-logs') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Database className="w-4 h-4" />
                    AI Logs
                  </Link>
                  <Link 
                    to="/sessions" 
                    className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                      isActive('/sessions') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Clock className="w-4 h-4" />
                    Sesje
                  </Link>
                </div>
                <div className="flex flex-col gap-2 pt-4 border-t border-border">
                  <span className="text-sm text-muted-foreground px-2">
                    {user?.email}
                  </span>
                  <Button asChild variant="ghost" className="w-full flex items-center gap-2" onClick={() => setIsOpen(false)}>
                    <Link to="/account">
                      <Settings className="w-4 h-4" />
                      Konto
                    </Link>
                  </Button>
                  <Button variant="outline" onClick={signOut} className="w-full flex items-center gap-2">
                    <LogOut className="w-4 h-4" />
                    Wyloguj
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <Button asChild variant="outline" className="w-full" onClick={() => setIsOpen(false)}>
                  <Link to="/auth">
                    Zaloguj się
                  </Link>
                </Button>
                <Button asChild className="w-full" onClick={() => { setIsOpen(false); handleCtaClick('mobile_signup'); }}>
                  <Link to="/auth">
                    Rozpocznij za darmo
                  </Link>
                </Button>
              </div>
            )}
            </div>
        )}
      </div>
    </nav>
  );
};
