import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = "https://pgbsbvwqjoxqpexoorff.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnYnNidndxam94cXBleG9vcmZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzMjcwNjAsImV4cCI6MjA4NDkwMzA2MH0.cExdXp7KJ0u_97qg4X2BeRRmy5t-6ajEj3xDt9QimkA";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Helper für Auth
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data } = await supabase
    .from('user_profiles')
    .select('*, organization:organizations(*)')
    .eq('id', user.id)
    .single();
  
  return data;
};

// Type Exports für einfachen Import
export type { Database };
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
