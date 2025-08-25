import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useReferral } from "@/hooks/useReferral";
import { Navigation } from "@/components/Navigation";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import { Dashboard } from "@/components/Dashboard";
import ChatPage from "./pages/ChatPage";

import AuthPage from "./pages/AuthPage";
import SmartRecommendations from "./pages/SmartRecommendations";
import SocialPage from "./pages/SocialPage";
import GamificationPage from "./pages/GamificationPage";
import NotFound from "./pages/NotFound";
import UXTestPage from "./pages/UXTestPage";
import ReferralPage from "./pages/ReferralPage";
import StudyDashboard from "./pages/StudyDashboard";
import StudyLesson from "./pages/StudyLesson";
import MaterialsPage from "./pages/MaterialsPage";
import UXAuditPage from "./pages/UXAuditPage";
import ProgressPage from "./pages/ProgressPage";
import { RealLearningPage } from "./pages/RealLearningPage";
import BatchImportPage from "./pages/BatchImportPage";
import AILogsPage from "./pages/AILogsPage";
import SessionsPage from "./pages/SessionsPage";
import AccountPage from "./pages/AccountPage";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { QuickDiagnostic } from "@/components/onboarding/QuickDiagnostic";
import { GoalSelection } from "@/components/onboarding/GoalSelection";
import { setupGlobalLogging, setupGlobalInteractionLogging, logEvent } from "@/lib/logger";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  useReferral(); // Initialize referral processing

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CurriculumSeeder />
      <main>
        {children}
      </main>
    </div>
  );
};

function LoggingBootstrap() {
  const location = useLocation();
  useEffect(() => {
    const cleanupErrors = setupGlobalLogging();
    const cleanupInteractions = setupGlobalInteractionLogging();
    logEvent('app_loaded');
    return () => {
      cleanupErrors?.();
      cleanupInteractions?.();
    };
  }, []);
  useEffect(() => {
    logEvent('route_change', { path: location.pathname });
  }, [location.pathname]);
  return null;
}

function RouteSeo() {
  const location = useLocation();
  const path = location.pathname;
  const canonical = typeof window !== 'undefined' ? `${window.location.origin}${path}` : undefined;
  const map: Record<string, { title: string; description: string }> = {
    
    '/dashboard': { title: 'Panel ucznia – AI Tutor', description: 'Twoje postępy, aktywność i szybkie skróty.' },
    '/chat': { title: 'AI Korepetytor – Chat', description: 'Rozmawiaj z AI Tutorem i rozwiązuj zadania krok po kroku.' },
    
    '/materials': { title: 'Materiały ucznia – AI Tutor', description: 'Dodawaj i analizuj własne materiały do nauki.' },
    '/social': { title: 'Społeczność – AI Tutor', description: 'Rankingi, aktywność i interakcje społeczne.' },
    '/gamification': { title: 'Gamifikacja – AI Tutor', description: 'Zdobywaj punkty, odznaki i nagrody.' },
    '/referral': { title: 'Program poleceń – AI Tutor', description: 'Polecaj znajomym i odbieraj nagrody.' },
    '/ux-test': { title: 'UX Testy – Panel', description: 'Zestaw testów użyteczności i jakości UI.' },
    '/ux-audit': { title: 'UX Audyt – Raport', description: 'Wyniki audytu UX i priorytety działań.' },
    '/study': { title: 'Panel nauki – AI Tutor', description: 'Twoje umiejętności i ścieżka nauki.' },
    '/ai-logs': { title: 'Logi AI – Rejestr konwersacji', description: 'Szczegółowe logi wszystkich interakcji z AI.' },
  };
  if (path === '/' || path.startsWith('/postepy')) return null;
  const match = Object.entries(map).find(([k]) => path === k || path.startsWith(k + '/'))?.[1];
  if (!match) return null;
  return <Seo title={match.title} description={match.description} canonical={canonical} />;
}

function CurriculumSeeder() {
  useEffect(() => {
    const key = 'curriculumSeededV1';
    if (typeof window === 'undefined') return;
    if (localStorage.getItem(key)) return;
    const run = async () => {
      try {
        await supabase.functions.invoke('seed-curriculum', { body: { phase: '1' } });
        await supabase.functions.invoke('seed-curriculum', { body: { phase: '2' } });
        await supabase.functions.invoke('seed-curriculum', { body: { phase: '3' } });
        localStorage.setItem(key, '1');
        logEvent('curriculum_seeded', { phases: [1,2,3] });
      } catch (err) {
        console.error('Curriculum seeding failed', err);
      }
    };
    run();
  }, []);
  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LoggingBootstrap />
          <RouteSeo />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            {/* Onboarding routes - accessible to authenticated users */}
            <Route path="/onboarding/welcome" element={
              <AuthenticatedLayout>
                <OnboardingWelcome />
              </AuthenticatedLayout>
            } />
            <Route path="/onboarding/checklist" element={
              <AuthenticatedLayout>
                <OnboardingChecklist />
              </AuthenticatedLayout>
            } />
            <Route path="/onboarding/quick-diagnostic" element={
              <AuthenticatedLayout>
                <QuickDiagnostic />
              </AuthenticatedLayout>
            } />
            <Route path="/onboarding/goal-selection" element={
              <AuthenticatedLayout>
                <GoalSelection />
              </AuthenticatedLayout>
            } />
            
            <Route path="/recommendations" element={
              <AuthenticatedLayout>
                <SmartRecommendations />
              </AuthenticatedLayout>
            } />
            <Route path="/quiz" element={
              <AuthenticatedLayout>
                <QuizPage />
              </AuthenticatedLayout>
            } />
            <Route path="/dashboard" element={
              <AuthenticatedLayout>
                <Dashboard />
              </AuthenticatedLayout>
            } />
            <Route path="/chat" element={
              <AuthenticatedLayout>
                <ChatPage />
              </AuthenticatedLayout>
            } />
            <Route path="/materials" element={
              <AuthenticatedLayout>
                <MaterialsPage />
              </AuthenticatedLayout>
            } />
            <Route path="/social" element={
              <AuthenticatedLayout>
                <SocialPage />
              </AuthenticatedLayout>
            } />
            <Route path="/gamification" element={
              <AuthenticatedLayout>
                <GamificationPage />
              </AuthenticatedLayout>
            } />
            <Route path="/referral" element={
              <AuthenticatedLayout>
                <ReferralPage />
              </AuthenticatedLayout>
            } />
            <Route path="/ux-test" element={
              <AuthenticatedLayout>
                <UXTestPage />
              </AuthenticatedLayout>
            } />
            <Route path="/ux-audit" element={
              <AuthenticatedLayout>
                <UXAuditPage />
              </AuthenticatedLayout>
            } />
            <Route path="/postepy" element={
              <AuthenticatedLayout>
                <ProgressPage />
              </AuthenticatedLayout>
            } />
            <Route path="/study" element={
              <AuthenticatedLayout>
                <StudyDashboard />
              </AuthenticatedLayout>
            } />
            <Route path="/ai-logs" element={
              <AuthenticatedLayout>
                <AILogsPage />
              </AuthenticatedLayout>
            } />
            <Route path="/sessions" element={
              <AuthenticatedLayout>
                <SessionsPage />
              </AuthenticatedLayout>
            } />
            <Route path="/account" element={
              <AuthenticatedLayout>
                <AccountPage />
              </AuthenticatedLayout>
            } />
            {/* Real Learning Engine - UNDER DEVELOPMENT - DO NOT USE */}
            {/* <Route path="/real-learning" element={
              <AuthenticatedLayout>
                <RealLearningPage />
              </AuthenticatedLayout>
            } /> */}
            
            <Route path="/batch-import" element={<BatchImportPage />} />
            <Route path="/study/lesson/:skillId" element={
              <AuthenticatedLayout>
                <StudyLesson />
              </AuthenticatedLayout>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
