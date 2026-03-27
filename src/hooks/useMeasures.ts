import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Measure {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  measure_type: string;
  provider: string | null;
  cost: number;
  duration_hours: number | null;
  status: string;
  assigned_employee_ids: string[];
  assigned_team_id: string | null;
  linked_competency_ids: string[];
  start_date: string | null;
  end_date: string | null;
  completed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined
  team?: { id: string; name: string } | null;
}

export const MEASURE_TYPES = [
  { value: 'seminar', label: 'Seminar' },
  { value: 'mentoring', label: 'Mentoring' },
  { value: 'course', label: 'Online-Kurs' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'conference', label: 'Konferenz' },
  { value: 'certification', label: 'Zertifizierung' },
  { value: 'self-study', label: 'Selbststudium' },
  { value: 'learning-path', label: 'Individueller Lernpfad' },
] as const;

export const MEASURE_STATUSES = [
  { value: 'planned', label: 'Geplant', color: 'hsl(215 20% 60%)' },
  { value: 'active', label: 'Laufend', color: 'hsl(45 75% 50%)' },
  { value: 'completed', label: 'Abgeschlossen', color: 'hsl(142 71% 45%)' },
  { value: 'cancelled', label: 'Abgebrochen', color: 'hsl(0 84% 60%)' },
] as const;

export function useMeasures() {
  const { organization } = useAuth();

  return useQuery({
    queryKey: ['measures', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('measures')
        .select('*, team:teams(id, name)')
        .eq('organization_id', organization?.id!)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Measure[];
    },
    enabled: !!organization?.id,
  });
}

export interface CreateMeasureData {
  title: string;
  description?: string;
  measure_type: string;
  provider?: string;
  cost?: number;
  duration_hours?: number;
  status?: string;
  assigned_employee_ids?: string[];
  assigned_team_id?: string | null;
  linked_competency_ids?: string[];
  start_date?: string;
  end_date?: string;
}

export function useCreateMeasure() {
  const { organization, profile } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateMeasureData) => {
      if (!organization?.id) throw new Error('No organization');
      const { data: measure, error } = await supabase
        .from('measures')
        .insert({
          ...data,
          organization_id: organization.id,
          created_by: profile?.id || null,
        })
        .select('*, team:teams(id, name)')
        .single();

      if (error) throw error;
      return measure;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['measures'] });
      toast.success('Maßnahme erstellt');
    },
    onError: () => toast.error('Fehler beim Erstellen der Maßnahme'),
  });
}

export function useUpdateMeasure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: CreateMeasureData & { id: string }) => {
      const updateData: Record<string, unknown> = { ...data };
      if (data.status === 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      const { data: measure, error } = await supabase
        .from('measures')
        .update(updateData)
        .eq('id', id)
        .select('*, team:teams(id, name)')
        .single();

      if (error) throw error;
      return measure;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['measures'] });
      toast.success('Maßnahme aktualisiert');
    },
    onError: () => toast.error('Fehler beim Aktualisieren'),
  });
}

export function useDeleteMeasure() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('measures').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['measures'] });
      toast.success('Maßnahme gelöscht');
    },
    onError: () => toast.error('Fehler beim Löschen'),
  });
}
