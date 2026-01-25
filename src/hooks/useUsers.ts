import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type UserProfile = Tables<'user_profiles'>;
export type UserRole = 'super_admin' | 'org_admin' | 'employee';

export interface UserWithOrg extends Omit<UserProfile, 'is_super_admin'> {
  organizations: { name: string; id?: string } | null;
  is_super_admin: boolean | null;
}

export function useUsers() {
  const queryClient = useQueryClient();

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['super-admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organizations (id, name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserWithOrg[];
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TablesUpdate<'user_profiles'> }) => {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      toast.success('Benutzer aktualisiert');
    },
    onError: (error) => {
      console.error('Error updating user:', error);
      toast.error('Fehler beim Aktualisieren');
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      // We don't actually delete from auth, just mark as inactive or delete profile
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-users'] });
      toast.success('Benutzer gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting user:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  return {
    users,
    isLoading,
    error,
    updateUser,
    deleteUser,
  };
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user_profile', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          organizations (id, name, slug)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug')
        .order('name');
      
      if (error) throw error;
      return data;
    },
  });
}

export function useUserGDPRRequests(userId: string | undefined) {
  return useQuery({
    queryKey: ['gdpr_requests', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Find the employee linked to this user
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('employee_id')
        .eq('id', userId)
        .single();
      
      if (!profile?.employee_id) return [];
      
      const { data, error } = await supabase
        .from('gdpr_requests')
        .select('*')
        .eq('employee_id', profile.employee_id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

// Impersonation helpers
const IMPERSONATE_KEY = 'impersonate_original_user';

export function startImpersonation(originalUserId: string, originalUserName: string) {
  sessionStorage.setItem(IMPERSONATE_KEY, JSON.stringify({
    id: originalUserId,
    name: originalUserName,
    startedAt: new Date().toISOString(),
  }));
}

export function getImpersonationInfo(): { id: string; name: string; startedAt: string } | null {
  const data = sessionStorage.getItem(IMPERSONATE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function endImpersonation() {
  sessionStorage.removeItem(IMPERSONATE_KEY);
}

export function isImpersonating(): boolean {
  return sessionStorage.getItem(IMPERSONATE_KEY) !== null;
}
