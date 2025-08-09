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
import { setupGlobalLogging, logEvent } from "@/lib/logger";

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
      <main>
        {children}
      </main>
    </div>
  );
};

function LoggingBootstrap() {
  const location = useLocation();
  useEffect(() => {
    const cleanup = setupGlobalLogging();
    logEvent('app_loaded');
    return cleanup;
  }, []);
  useEffect(() => {
    logEvent('route_change', { path: location.pathname });
  }, [location.pathname]);
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
          <Routes>
            <Route path="/" element={
              <AuthenticatedLayout>
                <HomePage />
              </AuthenticatedLayout>
            } />
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
