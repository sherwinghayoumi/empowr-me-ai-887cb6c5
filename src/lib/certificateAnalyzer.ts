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
    throw new Error(error.message || 'Fehler bei der Zertifikat-Bild-Analyse');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as CertificateUpdateResult;
}

/**
 * Converts a File to a base64 string (without the data URL prefix).
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Entferne den "data:image/png;base64," Prefix
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

/**
 * Gets the MIME type from a File, with fallback based on extension.
 */
export function getMimeType(file: File): string {
  if (file.type) return file.type;
  const ext = file.name.toLowerCase().split('.').pop();
  const mimeTypes: Record<string, string> = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'pdf': 'application/pdf'
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}
