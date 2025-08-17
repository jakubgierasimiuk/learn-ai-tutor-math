import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useReferral } from "@/hooks/useReferral";
import { Navigation } from "@/components/Navigation";
import HomePage from "./pages/HomePage";
import LessonsPage from "./pages/LessonsPage";
import TopicDetailPage from "./pages/TopicDetailPage";
import LessonPage from "./pages/LessonPage";
import QuizPage from "./pages/QuizPage";
import DashboardPage from "./pages/DashboardPage";
import ChatPage from "./pages/ChatPage";
import AnalyticsPage from "./pages/AnalyticsPage";
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

import { useEffect } from "react";
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
    '/lessons': { title: 'Lekcje matematyki – AI Tutor', description: 'Lista lekcji i tematów z poziomami trudności.' },
    '/dashboard': { title: 'Panel ucznia – AI Tutor', description: 'Twoje postępy, aktywność i szybkie skróty.' },
    '/chat': { title: 'AI Korepetytor – Chat', description: 'Rozmawiaj z AI Tutorem i rozwiązuj zadania krok po kroku.' },
    '/analytics': { title: 'Analityka nauki – AI Tutor', description: 'Wgląd w metryki nauki i efektywność.' },
    '/materials': { title: 'Materiały ucznia – AI Tutor', description: 'Dodawaj i analizuj własne materiały do nauki.' },
    '/social': { title: 'Społeczność – AI Tutor', description: 'Rankingi, aktywność i interakcje społeczne.' },
    '/gamification': { title: 'Gamifikacja – AI Tutor', description: 'Zdobywaj punkty, odznaki i nagrody.' },
    '/referral': { title: 'Program poleceń – AI Tutor', description: 'Polecaj znajomym i odbieraj nagrody.' },
    '/ux-test': { title: 'UX Testy – Panel', description: 'Zestaw testów użyteczności i jakości UI.' },
    '/ux-audit': { title: 'UX Audyt – Raport', description: 'Wyniki audytu UX i priorytety działań.' },
    '/study': { title: 'Panel nauki – AI Tutor', description: 'Twoje umiejętności i ścieżka nauki.' },
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
            <Route path="/lessons" element={
              <AuthenticatedLayout>
                <LessonsPage />
              </AuthenticatedLayout>
            } />
            <Route path="/topic/:topicId" element={
              <AuthenticatedLayout>
                <TopicDetailPage />
              </AuthenticatedLayout>
            } />
            <Route path="/lesson/:lessonId" element={
              <AuthenticatedLayout>
                <LessonPage />
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
            <Route path="/analytics" element={
              <AuthenticatedLayout>
                <AnalyticsPage />
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
            <Route path="/study/lesson/:skillId" element={
              <AuthenticatedLayout>
                <StudyLesson />
              </AuthenticatedLayout>
            } />
            <Route path="/auth" element={<AuthPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
