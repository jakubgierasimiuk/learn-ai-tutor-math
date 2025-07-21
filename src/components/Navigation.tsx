import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Brain, BookOpen, BarChart3, MessageCircle, TrendingUp, User, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AI Tutor</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              to="/quiz" 
              className={`flex items-center gap-2 transition-smooth ${
                isActive('/quiz') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Quiz
            </Link>
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 transition-smooth ${
                isActive('/dashboard') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </Link>
            <Link 
              to="/chat" 
              className={`flex items-center gap-2 transition-smooth ${
                isActive('/chat') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              AI Chat
            </Link>
            <Link 
              to="/analytics" 
              className={`flex items-center gap-2 transition-smooth ${
                isActive('/analytics') ? 'text-primary font-medium' : 'text-foreground hover:text-primary'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Analityka
            </Link>
          </div>

          {/* User Info & Logout */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button variant="outline" onClick={signOut} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Wyloguj
            </Button>
          </div>

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
            <div className="flex flex-col gap-4">
              <Link 
                to="/quiz" 
                className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                  isActive('/quiz') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <BookOpen className="w-4 h-4" />
                Quiz
              </Link>
              <Link 
                to="/dashboard" 
                className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                  isActive('/dashboard') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </Link>
              <Link 
                to="/chat" 
                className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                  isActive('/chat') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <MessageCircle className="w-4 h-4" />
                AI Chat
              </Link>
              <Link 
                to="/analytics" 
                className={`flex items-center gap-2 p-2 rounded-lg transition-smooth ${
                  isActive('/analytics') ? 'bg-muted text-primary font-medium' : 'hover:bg-muted'
                }`}
                onClick={() => setIsOpen(false)}
              >
                <TrendingUp className="w-4 h-4" />
                Analityka
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <span className="text-sm text-muted-foreground px-2">
                  {user?.email}
                </span>
                <Button variant="outline" onClick={signOut} className="w-full flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Wyloguj
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};