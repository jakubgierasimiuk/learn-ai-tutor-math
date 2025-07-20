import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Brain, BookOpen, BarChart3, Settings, User, LogOut } from "lucide-react";
import { useState } from "react";

export const Navigation = () => {
  const { user, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-hero rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">AI Tutor</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#home" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <BookOpen className="w-4 h-4" />
              Lekcje
            </a>
            <a href="#dashboard" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <BarChart3 className="w-4 h-4" />
              Dashboard
            </a>
            <a href="#profile" className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth">
              <User className="w-4 h-4" />
              Profil
            </a>
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
              <a href="#home" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-smooth">
                <BookOpen className="w-4 h-4" />
                Lekcje
              </a>
              <a href="#dashboard" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-smooth">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </a>
              <a href="#profile" className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-smooth">
                <User className="w-4 h-4" />
                Profil
              </a>
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