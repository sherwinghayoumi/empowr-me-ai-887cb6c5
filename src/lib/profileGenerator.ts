import { supabase } from '@/integrations/supabase/client';
import { GeneratedProfile } from '@/types/profileGeneration';

/**
 * Generiert ein Kompetenzprofil basierend auf CV, Self-Assessment und Manager-Assessment
 * durch Aufruf der Edge Function, die sicher mit der Claude API kommuniziert.
 * 
 * Das Kompetenz-Schema in der Edge Function enthält alle exakten Kompetenz- und Subskill-Namen,
 * die mit der Supabase-Datenbank übereinstimmen müssen.
 */
export async function generateProfile(
  documents: { cvText: string; selfText: string; managerText: string },
  roleTitle: string
): Promise<GeneratedProfile> {
  const { data, error } = await supabase.functions.invoke('generate-profile', {
    body: {
      cvText: documents.cvText,
      selfText: documents.selfText,
      managerText: documents.managerText,
      roleTitle,
    },
  });

  if (error) {
    throw new Error(error.message || 'Fehler bei der Profilgenerierung');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as GeneratedProfile;
}
