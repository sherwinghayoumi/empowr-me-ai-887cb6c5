import type { User } from '@supabase/supabase-js';

export type UserRole = 'super_admin' | 'org_admin' | 'employee';

export type SubscriptionStatus = 'trial' | 'active' | 'paused' | 'cancelled';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  organization_id: string | null;
  employee_id: string | null;
  is_super_admin: boolean;
  gdpr_consent_given_at: string | null;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_status: SubscriptionStatus;
  max_employees: number;
  settings: Record<string, unknown> | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  organization: Organization | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
}
