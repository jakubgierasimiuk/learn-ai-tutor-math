import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";
import { AdminPanel } from "@/components/AdminPanel";
import { Seo } from "@/components/Seo";
import { useRoles } from "@/hooks/useRoles";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const { isAdmin } = useRoles();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user) {
        setCheckingOnboarding(false);
        return;
      }

      try {
        const { data } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('user_id', user.id)
          .single();

        if (data && !data.onboarding_completed) {
          navigate('/onboarding/checklist', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      }

      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, [user, navigate]);

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Seo 
        title="Dashboard - Twój postęp w nauce"
        description="Śledź swój postęp w nauce matematyki, sprawdzaj osiągnięcia i kontynuuj naukę tam, gdzie skończyłeś."
      />
      
      {isAdmin ? (
        <div className="min-h-screen bg-background p-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="admin">Panel Zarządczy</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="admin">
              <div className="mt-6">
                <AdminPanel />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <Dashboard />
      )}
    </>
  );
};

export default DashboardPage;