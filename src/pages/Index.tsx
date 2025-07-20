import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { DiagnosticQuiz } from "@/components/DiagnosticQuiz";
import { Dashboard } from "@/components/Dashboard";
import { AIChat } from "@/components/AIChat";
import { AuthPage } from "@/components/AuthPage";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

type AppView = 'home' | 'quiz' | 'dashboard' | 'chat';

const Index = () => {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'quiz':
        return <DiagnosticQuiz />;
      case 'dashboard':
        return <Dashboard />;
      case 'chat':
        return <AIChat />;
      default:
        return (
          <>
            <Hero />
            <Features />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Demo Navigation - In real app this would be handled by router */}
      {currentView === 'home' && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
          <button
            onClick={() => setCurrentView('quiz')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-primary hover:scale-105 transition-all text-sm"
          >
            📊 Demo: Quiz
          </button>
          <button
            onClick={() => setCurrentView('dashboard')}
            className="bg-accent text-accent-foreground px-4 py-2 rounded-lg shadow-accent hover:scale-105 transition-all text-sm"
          >
            📈 Demo: Dashboard
          </button>
          <button
            onClick={() => setCurrentView('chat')}
            className="bg-success text-success-foreground px-4 py-2 rounded-lg shadow-card hover:scale-105 transition-all text-sm"
          >
            🤖 Demo: AI Chat
          </button>
        </div>
      )}

      {/* Back button for demo views */}
      {currentView !== 'home' && (
        <button
          onClick={() => setCurrentView('home')}
          className="fixed top-20 left-6 z-50 bg-card text-card-foreground px-4 py-2 rounded-lg shadow-card hover:scale-105 transition-all text-sm border border-border"
        >
          ← Powrót do strony głównej
        </button>
      )}

      {renderView()}
    </div>
  );
};

export default Index;
