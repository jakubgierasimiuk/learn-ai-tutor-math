import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthenticatedLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
            <Route path="/analytics" element={
              <AuthenticatedLayout>
                <AnalyticsPage />
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
