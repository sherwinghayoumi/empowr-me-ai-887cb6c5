import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, Organization, UserProfile } from '@/types/auth';

/**
 * Returns the current user's role
 */
export function useRole(): UserRole | null {
  const { profile } = useAuth();
  return profile?.role ?? null;
}

/**
 * Returns the current organization
 */
export function useOrganization(): Organization | null {
  const { organization } = useAuth();
  return organization;
}

/**
 * Returns the current user profile
 */
export function useProfile(): UserProfile | null {
  const { profile } = useAuth();
  return profile;
}

/**
 * Returns true if the current user is a super admin
 */
export function useIsSuperAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.is_super_admin === true || profile?.role === 'super_admin';
}


/**
 * Returns true if the current user is an org admin (or super admin)
 */
export function useIsOrgAdmin(): boolean {
  const { profile } = useAuth();
  return profile?.role === 'org_admin' || profile?.role === 'super_admin' || profile?.is_super_admin === true;
}

/**
 * Returns true if the user has one of the specified roles
 */
export function useHasRole(allowedRoles: UserRole[]): boolean {
  const { profile } = useAuth();
  
  return useMemo(() => {
    if (!profile) return false;
    
    // Super admins always have access
    if (profile.is_super_admin || profile.role === 'super_admin') {
      return true;
    }
    
    return allowedRoles.includes(profile.role);
  }, [profile, allowedRoles]);
}

/**
 * Returns true if the user can access admin features
 */
export function useCanAccessAdmin(): boolean {
  return useIsOrgAdmin();
}

/**
 * Returns true if the user belongs to an organization
 */
export function useHasOrganization(): boolean {
  const { profile } = useAuth();
  return !!profile?.organization_id;
}
