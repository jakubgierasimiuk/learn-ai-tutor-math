import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useReferralV2 } from "@/hooks/useReferralV2";
import { Navigation } from "@/components/Navigation";
import HomePage from "./pages/HomePage";
import NewLandingPage from "./pages/NewLandingPage";
import QuizPage from "./pages/QuizPage";
import { Dashboard } from "@/components/Dashboard";
import DashboardPage from "./pages/DashboardPage";
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
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingChecklist } from "@/components/onboarding/OnboardingChecklist";
import { AITutorial } from "@/components/onboarding/AITutorial";
import { GoalSelection } from "@/components/onboarding/GoalSelection";
import { setupGlobalLogging, setupGlobalInteractionLogging, logEvent } from "@/lib/logger";
import { Seo } from "@/components/Seo";
import { supabase } from "@/integrations/supabase/client";
import { ViralLoopProvider } from "@/components/viral/ViralLoopProvider";
import { ViralPopups } from "@/components/viral/ViralPopups";
import { SMSTriggerManager } from "@/components/SMSTriggerManager";
import { SurveyProvider } from "@/components/SurveyProvider";
import { FoundingLandingPage } from "@/components/FoundingLandingPage";
import FoundingRegistrationPage from "@/pages/FoundingRegistrationPage";
import { LanguageProvider } from "@/hooks/useLanguage";
import { DomainGuard } from "@/components/DomainGuard";

const queryClient = new QueryClient();

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  // Referral processing v2 is handled in useReferralV2 hook via URL params

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
    <ViralLoopProvider>
      <SurveyProvider>
        <div className="min-h-screen bg-background">
          <Navigation />
          <CurriculumSeeder />
          <ViralPopups />
          <SMSTriggerManager />
          <main>
            {children}
          </main>
        </div>
      </SurveyProvider>
    </ViralLoopProvider>
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
  const canonical = `https://mentavo.pl${path}`;
  const map: Record<string, { title: string; description: string }> = {
    
    '/dashboard': { title: 'Panel ucznia – mentavo.ai', description: 'Twoje postępy, aktywność i szybkie skróty.' },
    '/chat': { title: 'mentavo.ai – Chat', description: 'Rozmawiaj z mentavo.ai i rozwiązuj zadania krok po kroku.' },
    '/privacy-policy': { title: 'Polityka Prywatności – mentavo.ai', description: 'Polityka prywatności i plików cookies Mentavo AI.' },
    '/terms-of-service': { title: 'Regulamin – mentavo.ai', description: 'Regulamin aplikacji Mentavo AI.' },
    
    '/materials': { title: 'Materiały ucznia – mentavo.ai', description: 'Dodawaj i analizuj własne materiały do nauki.' },
    '/social': { title: 'Społeczność – mentavo.ai', description: 'Rankingi, aktywność i interakcje społeczne.' },
    '/gamification': { title: 'Gamifikacja – mentavo.ai', description: 'Zdobywaj punkty, odznaki i nagrody.' },
    '/referral': { title: 'Program poleceń – mentavo.ai', description: 'Polecaj znajomym i odbieraj nagrody.' },
    '/ux-test': { title: 'UX Testy – Panel', description: 'Zestaw testów użyteczności i jakości UI.' },
    '/ux-audit': { title: 'UX Audyt – Raport', description: 'Wyniki audytu UX i priorytety działań.' },
    '/study': { title: 'Panel nauki – mentavo.ai', description: 'Twoje umiejętności i ścieżka nauki.' },
    '/ai-logs': { title: 'Logi AI – Rejestr konwersacji', description: 'Szczegółowe logi wszystkich interakcji z AI.' },
    '/founding': { title: 'Dołącz do Founding 100 – Mentavo AI', description: 'Dołącz do pierwszych 100 użytkowników Mentavo AI i otrzymaj darmowy miesiąc Premium.' },
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
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <DomainGuard />
            <LoggingBootstrap />
            <RouteSeo />
            <CurriculumSeeder />
            <Routes>
            <Route path="/" element={<NewLandingPage />} />
            <Route path="/app" element={
              <AuthenticatedLayout>
                <DashboardPage />
              </AuthenticatedLayout>
            } />
            <Route path="/founding" element={<FoundingLandingPage />} />
            <Route path="/founding/register" element={
              <FoundingRegistrationPage />
            } />
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
            <Route path="/onboarding/ai-tutorial" element={
              <AuthenticatedLayout>
                <AITutorial />
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
                <DashboardPage />
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
            
            {/* Admin-only routes - require authentication AND admin role */}
            <Route path="/batch-import" element={
              <AuthenticatedLayout>
                <BatchImportPage />
              </AuthenticatedLayout>
            } />
            
            {/* Real Learning Engine - UNDER DEVELOPMENT - DO NOT USE */}
            {/* <Route path="/real-learning" element={
              <AuthenticatedLayout>
                <RealLearningPage />
              </AuthenticatedLayout>
            } /> */}
            
            <Route path="/study/lesson/:skillId" element={
              <AuthenticatedLayout>
                <StudyLesson />
              </AuthenticatedLayout>
            } />
            
            {/* Legal pages - accessible to everyone */}
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
