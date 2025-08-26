import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type AppRole = 'user' | 'admin';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by: string | null;
  assigned_at: string;
}

interface UseRolesResult {
  userRoles: AppRole[];
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  assignRole: (userId: string, role: AppRole) => Promise<{ error: string | null }>;
  removeRole: (userId: string, role: AppRole) => Promise<{ error: string | null }>;
  refreshRoles: () => Promise<void>;
}

export const useRoles = (): UseRolesResult => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = async () => {
    if (!user) {
      setUserRoles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      const roles = data?.map(item => item.role as AppRole) || [];
      setUserRoles(roles);
      setError(null);
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
      setUserRoles([]);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          assigned_by: user?.id
        });

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions_log')
        .insert({
          admin_id: user?.id,
          action_type: 'assign_role',
          target_user_id: userId,
          details: { role }
        });

      await refreshRoles();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to assign role';
      console.error('Error assigning role:', err);
      return { error: errorMessage };
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions_log')
        .insert({
          admin_id: user?.id,
          action_type: 'remove_role',
          target_user_id: userId,
          details: { role }
        });

      await refreshRoles();
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove role';
      console.error('Error removing role:', err);
      return { error: errorMessage };
    }
  };

  const refreshRoles = async () => {
    await fetchUserRoles();
  };

  useEffect(() => {
    fetchUserRoles();
  }, [user]);

  const isAdmin = userRoles.includes('admin');

  return {
    userRoles,
    isAdmin,
    loading,
    error,
    assignRole,
    removeRole,
    refreshRoles
  };
};