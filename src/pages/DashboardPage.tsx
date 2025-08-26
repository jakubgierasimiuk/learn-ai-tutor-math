import { Dashboard } from "@/components/Dashboard";
import { AdminRoleAssignment } from "@/components/AdminRoleAssignment";
import { Seo } from "@/components/Seo";
import { SystemMigrationPanel } from "@/components/SystemMigrationPanel";
import { useRoles } from "@/hooks/useRoles";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  const { isAdmin } = useRoles();

  return (
    <>
      <Seo 
        title="Dashboard - Twój postęp w nauce"
        description="Śledź swój postęp w nauce matematyki, sprawdzaj osiągnięcia i kontynuuj naukę tam, gdzie skończyłeś."
      />
      
      {isAdmin ? (
        <div className="min-h-screen bg-background p-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="admin">Zarządzanie</TabsTrigger>
              <TabsTrigger value="migration">System Migration</TabsTrigger>
            </TabsList>
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="admin">
              <div className="mt-6">
                <AdminRoleAssignment />
              </div>
            </TabsContent>
            <TabsContent value="migration">
              <div className="mt-6">
                <SystemMigrationPanel />
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