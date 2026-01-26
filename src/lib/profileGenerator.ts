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
  console.log('Calling generate-profile Edge Function with role:', roleTitle);
  console.log('Document lengths - CV:', documents.cvText.length, 'Self:', documents.selfText.length, 'Manager:', documents.managerText.length);

  const { data, error } = await supabase.functions.invoke('generate-profile', {
    body: {
      cvText: documents.cvText,
      selfText: documents.selfText,
      managerText: documents.managerText,
      roleTitle,
    },
  });

  if (error) {
    console.error('Profile generation error:', error);
    throw new Error(error.message || 'Fehler bei der Profilgenerierung');
  }

  if (data?.error) {
    console.error('Profile generation API error:', data.error);
    throw new Error(data.error);
  }

  // Logging für Debugging
  console.log('Generated Profile received');
  console.log('Clusters:', data.competencyProfile?.clusters?.map((c: { clusterName: string }) => c.clusterName));
  console.log('Overall Score:', data.analysis?.overallScore);
  console.log('GDPR Verified:', data.compliance?.gdprConsentVerified);

  return data as GeneratedProfile;
}
