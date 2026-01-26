import { CertificateUpdateResult } from '@/types/certificateUpdate';
import { GeneratedProfile } from '@/types/profileGeneration';
import { supabase } from '@/integrations/supabase/client';

/**
 * Analyzes a certificate document (text content) and returns rating updates.
 * Uses the analyze-certificate Edge Function for secure AI processing.
 */
export async function analyzeCertificate(
  currentProfile: GeneratedProfile,
  documentContent: string,
  fileName: string
): Promise<CertificateUpdateResult> {
  const { data, error } = await supabase.functions.invoke('analyze-certificate', {
    body: {
      type: 'text',
      currentProfile,
      documentContent,
      fileName,
    },
  });

  if (error) {
    console.error('Certificate analysis error:', error);
    throw new Error(error.message || 'Fehler bei der Zertifikat-Analyse');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as CertificateUpdateResult;
}

/**
 * Analyzes a certificate image (scan/photo) and returns rating updates.
 * Uses the analyze-certificate Edge Function for secure AI processing.
 */
export async function analyzeCertificateImage(
  currentProfile: GeneratedProfile,
  imageBase64: string,
  mimeType: string,
  fileName: string
): Promise<CertificateUpdateResult> {
  const { data, error } = await supabase.functions.invoke('analyze-certificate', {
    body: {
      type: 'image',
      currentProfile,
      imageBase64,
      mimeType,
      fileName,
    },
  });

  if (error) {
    console.error('Certificate image analysis error:', error);
    throw new Error(error.message || 'Fehler bei der Zertifikat-Bild-Analyse');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as CertificateUpdateResult;
}
