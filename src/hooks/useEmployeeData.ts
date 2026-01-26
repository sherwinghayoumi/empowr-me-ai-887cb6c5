import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// =====================================================
// CURRENT EMPLOYEE DATA
// =====================================================

export function useMyProfile() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['my-profile', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          role_profile:role_profiles(
            *,
            competencies:competencies(
              *,
              subskills:subskills(*),
              cluster:competency_clusters(*)
            )
          ),
          team:teams(*)
        `)
        .eq('id', profile?.employee_id!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.employee_id
  });
}

export function useMyCompetencies() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['my-competencies', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employee_competencies')
        .select(`
          *,
          competency:competencies(
            *,
            subskills:subskills(*),
            cluster:competency_clusters(*)
          )
        `)
        .eq('employee_id', profile?.employee_id!);
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.employee_id
  });
}

export function useMySubskills(competencyId: string) {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['my-subskills', profile?.employee_id, competencyId],
    queryFn: async () => {
      // First get subskill IDs for this competency
      const { data: subskillIds } = await supabase
        .from('subskills')
        .select('id')
        .eq('competency_id', competencyId);
      
      if (!subskillIds?.length) return [];
      
      const { data, error } = await supabase
        .from('employee_subskills')
        .select(`
          *,
          subskill:subskills(*)
        `)
        .eq('employee_id', profile?.employee_id!)
        .in('subskill_id', subskillIds.map(s => s.id));
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.employee_id && !!competencyId
  });
}

// =====================================================
// LEARNING PATHS
// =====================================================

export function useMyLearningPaths() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['my-learning-paths', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('learning_paths')
        .select(`
          *,
          target_competency:competencies(name),
          modules:learning_modules(*)
        `)
        .eq('employee_id', profile?.employee_id!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.employee_id
  });
}

export function useUpdateModuleProgress() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  
  return useMutation({
    mutationFn: async ({ moduleId, completed }: { moduleId: string; completed: boolean }) => {
      const { error } = await supabase
        .from('learning_modules')
        .update({ 
          is_completed: completed,
          completed_at: completed ? new Date().toISOString() : null
        })
        .eq('id', moduleId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-learning-paths', profile?.employee_id] });
    }
  });
}

// =====================================================
// CERTIFICATIONS
// =====================================================

export function useMyCertifications() {
  const { profile } = useAuth();
  
  return useQuery({
    queryKey: ['my-certifications', profile?.employee_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('certifications')
        .select('*')
        .eq('employee_id', profile?.employee_id!)
        .order('issue_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profile?.employee_id
  });
}

// =====================================================
// SELF ASSESSMENT
// =====================================================

export function useSubmitSelfAssessment() {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (assessments: { competencyId: string; rating: number; notes: string }[]) => {
      for (const assessment of assessments) {
        await supabase
          .from('employee_competencies')
          .update({ 
            self_rating: assessment.rating,
            evidence_summary: assessment.notes 
          })
          .eq('employee_id', profile?.employee_id!)
          .eq('competency_id', assessment.competencyId);
      }
      
      // Audit Log
      await supabase.rpc('log_audit_event', {
        p_action: 'update',
        p_entity_type: 'self_assessment',
        p_entity_id: profile?.employee_id!
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-competencies', profile?.employee_id] });
      toast.success('Self-Assessment gespeichert');
    }
  });
}
