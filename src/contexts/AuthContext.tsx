import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { AuthContextType, UserProfile, Organization } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, full_name, avatar_url, role, organization_id, employee_id, is_super_admin, gdpr_consent_given_at, created_at, updated_at, last_login_at')
        .eq('id', userId)
        .single();

      if (error) {
        return null;
      }

      // Map database result to UserProfile type
      const profile: UserProfile = {
        id: data.id,
        email: data.email,
        full_name: data.full_name,
        avatar_url: data.avatar_url,
        role: data.role,
        organization_id: data.organization_id,
        employee_id: data.employee_id,
        is_super_admin: data.is_super_admin ?? false,
        gdpr_consent_given_at: data.gdpr_consent_given_at,
        created_at: data.created_at ?? '',
        updated_at: data.updated_at,
        last_login_at: data.last_login_at,
      };

      return profile;
    } catch {
      return null;
    }
  }, []);

  const fetchOrganization = useCallback(async (orgId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single();

      if (error) {
        return null;
      }

      return data as Organization;
    } catch {
      return null;
    }
  }, []);

  const loadUserData = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setUser(null);
      setProfile(null);
      setOrganization(null);
      setIsLoading(false);
      return;
    }

    setUser(currentUser);

    const userProfile = await fetchProfile(currentUser.id);
    setProfile(userProfile);

    if (userProfile?.organization_id) {
      const org = await fetchOrganization(userProfile.organization_id);
      setOrganization(org);
    } else {
      setOrganization(null);
    }

    setIsLoading(false);
  }, [fetchProfile, fetchOrganization]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setOrganization(null);
          setIsLoading(false);
        } else if (session?.user) {
          // Use setTimeout to avoid blocking the auth callback
          setTimeout(() => {
            loadUserData(session.user);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserData]);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      return { error: null };
    } catch (error) {
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error };
      }

      return { error: null };
    } catch (error) {
      setIsLoading(false);
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setOrganization(null);
    setIsLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      // Refresh profile after update
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      const userProfile = await fetchProfile(user.id);
      setProfile(userProfile);

      if (userProfile?.organization_id) {
        const org = await fetchOrganization(userProfile.organization_id);
        setOrganization(org);
      }
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    organization,
    isLoading,
    isAuthenticated: !!user && !!profile,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
