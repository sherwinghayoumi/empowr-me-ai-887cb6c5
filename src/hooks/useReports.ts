import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Report = Tables<'quarterly_reports'>;
export type ReportInsert = TablesInsert<'quarterly_reports'>;
export type ReportUpdate = TablesUpdate<'quarterly_reports'>;

export interface ReportFormData {
  quarter: string;
  year: number;
  title: string;
  practice_group: string;
  regions: string[];
  executive_summary: string;
  full_report_markdown?: string;
}

export function useReports() {
  const queryClient = useQueryClient();

  const { data: reports, isLoading, error } = useQuery({
    queryKey: ['quarterly_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select('*')
        .order('year', { ascending: false })
        .order('quarter', { ascending: false });
      
      if (error) throw error;
      return data as Report[];
    },
  });

  const createReport = useMutation({
    mutationFn: async (report: ReportInsert) => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .insert(report)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly_reports'] });
      toast.success('Report erfolgreich erstellt');
    },
    onError: () => {
      toast.error('Fehler beim Erstellen des Reports');
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: ReportUpdate }) => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly_reports'] });
      toast.success('Report erfolgreich aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Reports');
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quarterly_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly_reports'] });
      toast.success('Report erfolgreich gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Reports');
    },
  });

  const publishReport = useMutation({
    mutationFn: async ({ reportId, quarter, year }: { reportId: string; quarter: string; year: number }) => {
      // Update report to published
      const { error: updateError } = await supabase
        .from('quarterly_reports')
        .update({
          is_published: true,
          published_at: new Date().toISOString(),
        })
        .eq('id', reportId);
      
      if (updateError) throw updateError;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Create changelog entry
      const { error: changelogError } = await supabase
        .from('content_changelog')
        .insert({
          content_type: 'quarterly_report',
          content_id: reportId,
          quarter,
          year,
          change_summary: `Neuer Quarterly Report für ${quarter} ${year} veröffentlicht`,
          is_published: true,
          published_at: new Date().toISOString(),
          created_by: user?.id,
        });

      if (changelogError) throw changelogError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly_reports'] });
      toast.success('Report erfolgreich veröffentlicht');
    },
    onError: () => {
      toast.error('Fehler beim Veröffentlichen des Reports');
    },
  });

  const unpublishReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quarterly_reports')
        .update({
          is_published: false,
          published_at: null,
        })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quarterly_reports'] });
      toast.success('Report zurückgezogen');
    },
    onError: () => {
      toast.error('Fehler beim Zurückziehen des Reports');
    },
  });

  return {
    reports,
    isLoading,
    error,
    createReport,
    updateReport,
    deleteReport,
    publishReport,
    unpublishReport,
  };
}

export function useReport(id: string | undefined) {
  return useQuery({
    queryKey: ['quarterly_reports', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Report;
    },
    enabled: !!id,
  });
}

export function useReportChangelog(reportId: string | undefined) {
  return useQuery({
    queryKey: ['content_changelog', reportId],
    queryFn: async () => {
      if (!reportId) return [];
      
      const { data, error } = await supabase
        .from('content_changelog')
        .select('*')
        .eq('content_id', reportId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!reportId,
  });
}

export async function uploadReportFile(file: File, quarter: string, year: number): Promise<string | null> {
  const filePath = `${year}/${quarter}/${Date.now()}_${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('reports')
    .upload(filePath, file);
  
  if (error) {
    toast.error('Fehler beim Hochladen der Datei');
    return null;
  }
  
  return data?.path || null;
}

export async function getReportFileUrl(path: string): Promise<string | null> {
  const { data } = supabase.storage
    .from('reports')
    .getPublicUrl(path);
  
  return data?.publicUrl || null;
}

export async function downloadReportFile(path: string): Promise<Blob | null> {
  const { data, error } = await supabase.storage
    .from('reports')
    .download(path);
  
  if (error) {
    toast.error('Fehler beim Herunterladen der Datei');
    return null;
  }
  
  return data;
}
