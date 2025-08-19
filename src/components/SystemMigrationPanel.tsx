import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface MigrationStatus {
  profiles: { migrated: number; total: number; complete: boolean };
  sessions: { migrated: number; total: number; complete: boolean };
  content: { updated: number; total: number; complete: boolean };
  edgeFunctions: { complete: boolean };
}

export const SystemMigrationPanel = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<MigrationStatus>({
    profiles: { migrated: 0, total: 0, complete: false },
    sessions: { migrated: 0, total: 0, complete: false },
    content: { updated: 0, total: 0, complete: false },
    edgeFunctions: { complete: false }
  });
  const [isRunning, setIsRunning] = useState(false);

  const runMigration = async (action: string) => {
    if (!user) return;
    
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('system-migration', {
        body: { action }
      });

      if (error) throw error;

      // Update status based on response
      if (action === 'migrate_profiles') {
        setStatus(prev => ({
          ...prev,
          profiles: { ...data, complete: true }
        }));
      } else if (action === 'migrate_sessions') {
        setStatus(prev => ({
          ...prev,
          sessions: { ...data, complete: true }
        }));
      } else if (action === 'sync_content_structure') {
        setStatus(prev => ({
          ...prev,
          content: { 
            updated: data.updated || 0,
            total: data.total || 0,
            complete: true 
          }
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          edgeFunctions: { complete: true }
        }));
      }

      toast.success(`${action} completed successfully`);
    } catch (error) {
      console.error(`Migration error:`, error);
      toast.error(`Migration failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runFullMigration = async () => {
    setIsRunning(true);
    try {
      // Run all migrations in sequence
      await runMigration('migrate_profiles');
      await runMigration('migrate_sessions');
      await runMigration('sync_content_structure');
      await runMigration('update_edge_functions');
      
      toast.success('Full system migration completed!');
    } catch (error) {
      toast.error('Migration failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const getProgressPercentage = (item: { migrated?: number; updated?: number; total: number }) => {
    const completed = item.migrated || item.updated || 0;
    return item.total > 0 ? Math.round((completed / item.total) * 100) : 0;
  };

  const allComplete = Object.values(status).every(item => 
    typeof item === 'object' && 'complete' in item ? item.complete : item
  );

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          System Migration to Unified Learning
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Migration Steps */}
        <div className="space-y-4">
          
          {/* Profiles Migration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">Profile Migration</h3>
              <p className="text-sm text-muted-foreground">
                Migrate existing profiles to unified learning system
              </p>
              {status.profiles.total > 0 && (
                <Progress 
                  value={getProgressPercentage(status.profiles)} 
                  className="mt-2 w-full" 
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              {status.profiles.complete ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete ({status.profiles.migrated}/{status.profiles.total})
                </Badge>
              ) : (
                <Button 
                  onClick={() => runMigration('migrate_profiles')}
                  disabled={isRunning}
                  size="sm"
                >
                  Migrate Profiles
                </Button>
              )}
            </div>
          </div>

          {/* Sessions Migration */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">Sessions Migration</h3>
              <p className="text-sm text-muted-foreground">
                Migrate recent study sessions to unified format
              </p>
              {status.sessions.total > 0 && (
                <Progress 
                  value={getProgressPercentage(status.sessions)} 
                  className="mt-2 w-full" 
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              {status.sessions.complete ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete ({status.sessions.migrated}/{status.sessions.total})
                </Badge>
              ) : (
                <Button 
                  onClick={() => runMigration('migrate_sessions')}
                  disabled={isRunning}
                  size="sm"
                >
                  Migrate Sessions
                </Button>
              )}
            </div>
          </div>

          {/* Content Structure Sync */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">Content Structure Sync</h3>
              <p className="text-sm text-muted-foreground">
                Update skills with standardized content structure
              </p>
              {status.content.total > 0 && (
                <Progress 
                  value={getProgressPercentage(status.content)} 
                  className="mt-2 w-full" 
                />
              )}
            </div>
            <div className="flex items-center gap-2">
              {status.content.complete ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete ({status.content.updated}/{status.content.total})
                </Badge>
              ) : (
                <Button 
                  onClick={() => runMigration('sync_content_structure')}
                  disabled={isRunning}
                  size="sm"
                >
                  Sync Content
                </Button>
              )}
            </div>
          </div>

          {/* Edge Functions Update */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">Edge Functions Integration</h3>
              <p className="text-sm text-muted-foreground">
                Update edge functions to use unified system
              </p>
            </div>
            <div className="flex items-center gap-2">
              {status.edgeFunctions.complete ? (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Complete
                </Badge>
              ) : (
                <Button 
                  onClick={() => runMigration('update_edge_functions')}
                  disabled={isRunning}
                  size="sm"
                >
                  Update Functions
                </Button>
              )}
            </div>
          </div>

        </div>

        {/* Global Actions */}
        <div className="flex gap-4 pt-4 border-t">
          <Button 
            onClick={runFullMigration}
            disabled={isRunning || allComplete}
            className="flex-1"
            size="lg"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Running Migration...
              </>
            ) : allComplete ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Migration Complete
              </>
            ) : (
              'Run Full Migration'
            )}
          </Button>

          {allComplete && (
            <Badge variant="outline" className="bg-green-50 text-green-700 p-2">
              <CheckCircle className="w-4 h-4 mr-1" />
              All systems updated and ready!
            </Badge>
          )}
        </div>

      </CardContent>
    </Card>
  );
};