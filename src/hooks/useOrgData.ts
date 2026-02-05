import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// =====================================================
// EMPLOYEES
// =====================================================

export function useEmployees() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ['employees', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          role_profile:role_profiles!employees_role_profile_id_fkey(id, role_title, role_key),
          team:teams(id, name),
          competencies:employee_competencies(
            id,
            current_level,
            demanded_level,
            future_level,
            gap_to_current,
            competency:competencies(id, name, status, cluster:competency_clusters(name))
          )
        `)
        .eq('organization_id', organization?.id)
        .eq('is_active', true)
        .order('full_name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });
}

export function useEmployee(employeeId: string) {
  return useQuery({
    queryKey: ['employee', employeeId],
    queryFn: async () => {
      // Fetch employee with competencies
      const { data: employee, error } = await supabase
        .from('employees')
        .select(`
          *,
          role_profile:role_profiles!employees_role_profile_id_fkey(*),
          team:teams(id, name),
          competencies:employee_competencies(
            *,
            competency:competencies(
              *,
              subskills:subskills(*),
              cluster:competency_clusters(*)
            )
          ),
          certifications:certifications(*),
          learning_paths:learning_paths(
            *,
            modules:learning_modules(*)
          )
        `)
        .eq('id', employeeId)
        .single();
      
      if (error) throw error;

      // Fetch employee subskills separately and merge
      const { data: employeeSubskills } = await supabase
        .from('employee_subskills')
        .select(`
          id,
          subskill_id,
          current_level,
          evidence,
          rated_at
        `)
        .eq('employee_id', employeeId);

      // Merge subskill ratings into competencies AND calculate competency level from subskills
      if (employee?.competencies && employeeSubskills) {
        const subskillMap = new Map(
          employeeSubskills.map(es => [es.subskill_id, es])
        );

        for (const ec of employee.competencies) {
          if (ec.competency?.subskills) {
            // Get subskill IDs for this competency to calculate average
            const competencySubskillIds = ec.competency.subskills.map(s => s.id);
            
            // Calculate competency level from subskills if not set or is 0
            const subskillRatings = competencySubskillIds
              .map(id => subskillMap.get(id)?.current_level)
              .filter((level): level is number => level !== null && level !== undefined);
            
            if (subskillRatings.length > 0 && (!ec.current_level || ec.current_level === 0)) {
              const avgLevel = Math.round(
                subskillRatings.reduce((sum, level) => sum + level, 0) / subskillRatings.length
              );
              ec.current_level = avgLevel;
            }
            
            // Merge subskill ratings into subskills array
            ec.competency.subskills = ec.competency.subskills.map(subskill => ({
              ...subskill,
              employee_rating: subskillMap.get(subskill.id) || null
            }));
          }
        }
      }

      return employee;
    },
    enabled: !!employeeId
  });
}

// =====================================================
// TEAMS
// =====================================================

export function useTeams() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ['teams', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          members:employees(id, full_name, avatar_url, overall_score, role_profile:role_profiles(role_title))
        `)
        .eq('organization_id', organization?.id)
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });
}

export function useCreateTeam() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ name, description }: { name: string; description: string | null }) => {
      if (!organization?.id) throw new Error('No organization');
      
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name,
          description,
          organization_id: organization.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success('Team erfolgreich erstellt');
    },
    onError: (error) => {
      toast.error('Fehler beim Erstellen des Teams');
    },
  });
}

// =====================================================
// ROLE PROFILES & COMPETENCIES (Zentral)
// =====================================================

export function useRoleProfilesPublished() {
  return useQuery({
    queryKey: ['role-profiles-published'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_profiles')
        .select(`
          *,
          competencies:competencies(
            *,
            subskills:subskills(*),
            cluster:competency_clusters(*)
          )
        `)
        .eq('is_active', true)
        .eq('is_published', true)
        .order('role_key');
      
      if (error) throw error;
      return data;
    }
  });
}

export function useCompetenciesForRole(roleKey: string) {
  return useQuery({
    queryKey: ['competencies', roleKey],
    queryFn: async () => {
      const { data: roleProfile } = await supabase
        .from('role_profiles')
        .select('id')
        .eq('role_key', roleKey)
        .eq('is_active', true)
        .eq('is_published', true)
        .single();
      
      if (!roleProfile) return [];
      
      const { data, error } = await supabase
        .from('competencies')
        .select(`
          *,
          subskills:subskills(*),
          cluster:competency_clusters(*)
        `)
        .eq('role_profile_id', roleProfile.id)
        .order('cluster_id');
      
      if (error) throw error;
      return data;
    },
    enabled: !!roleKey
  });
}

// =====================================================
// QUARTERLY REPORTS (Zentral)
// =====================================================

export function useQuarterlyReports() {
  return useQuery({
    queryKey: ['quarterly-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select('*')
        .eq('is_published', true)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}

export function useLatestReport() {
  return useQuery({
    queryKey: ['latest-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quarterly_reports')
        .select('*')
        .eq('is_published', true)
        .order('year', { ascending: false })
        .order('quarter', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    }
  });
}

// =====================================================
// SKILL GAP ANALYSIS
// =====================================================

interface GapByCompetency {
  totalGap: number;
  employeeCount: number;
  avgGap: number;
}

interface EmployeeGap {
  competency: string;
  gap: number;
  current: number;
  demanded: number;
}

interface EmployeeWithGaps {
  id: string;
  name: string;
  role: string | undefined;
  totalGap: number;
  gaps: EmployeeGap[];
}

interface CriticalGap extends GapByCompetency {
  name: string;
}

interface GapAnalysis {
  byCompetency: Record<string, GapByCompetency>;
  byEmployee: EmployeeWithGaps[];
  criticalGaps: CriticalGap[];
  emergingSkills: unknown[];
}

export function useSkillGapAnalysis() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ['skill-gap', organization?.id],
    queryFn: async () => {
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          full_name,
          role_profile:role_profiles!employees_role_profile_id_fkey(role_key, role_title),
          competencies:employee_competencies(
            current_level,
            demanded_level,
            future_level,
            gap_to_current,
            gap_to_future,
            competency:competencies(id, name, status)
          )
        `)
        .eq('organization_id', organization?.id)
        .eq('is_active', true);
      
      if (error) throw error;
      
      const gapAnalysis: GapAnalysis = {
        byCompetency: {},
        byEmployee: [],
        criticalGaps: [],
        emergingSkills: []
      };
      
      for (const emp of employees || []) {
        let totalGap = 0;
        const empGaps: EmployeeGap[] = [];
        
        for (const comp of emp.competencies || []) {
          const currentLevel = comp.current_level || 0;
          const demandedLevel = comp.demanded_level || 0;
          const gap = demandedLevel - currentLevel;
          const competencyName = comp.competency?.name || 'Unknown';
          
          if (gap > 0) {
            totalGap += gap;
            empGaps.push({
              competency: competencyName,
              gap,
              current: currentLevel,
              demanded: demandedLevel
            });
          }
          
          if (!gapAnalysis.byCompetency[competencyName]) {
            gapAnalysis.byCompetency[competencyName] = {
              totalGap: 0,
              employeeCount: 0,
              avgGap: 0
            };
          }
          gapAnalysis.byCompetency[competencyName].totalGap += Math.max(0, gap);
          gapAnalysis.byCompetency[competencyName].employeeCount++;
        }
        
        gapAnalysis.byEmployee.push({
          id: emp.id,
          name: emp.full_name,
          role: emp.role_profile?.role_title,
          totalGap,
          gaps: empGaps.sort((a, b) => b.gap - a.gap)
        });
      }
      
      for (const [, data] of Object.entries(gapAnalysis.byCompetency)) {
        data.avgGap = data.employeeCount > 0 ? data.totalGap / data.employeeCount : 0;
      }
      
      gapAnalysis.criticalGaps = Object.entries(gapAnalysis.byCompetency)
        .filter(([, data]) => data.avgGap > 20)
        .sort((a, b) => b[1].avgGap - a[1].avgGap)
        .map(([name, data]) => ({ name, ...data }));
      
      return gapAnalysis;
    },
    enabled: !!organization?.id
  });
}

// =====================================================
// ORG STATS
// =====================================================

export function useOrgStats() {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ['org-stats', organization?.id],
    queryFn: async () => {
      const [
        { count: employeeCount },
        { count: teamCount },
        { data: avgScoreData }
      ] = await Promise.all([
        supabase
          .from('employees')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization?.id)
          .eq('is_active', true),
        supabase
          .from('teams')
          .select('*', { count: 'exact', head: true })
          .eq('organization_id', organization?.id),
        supabase
          .from('employees')
          .select('overall_score')
          .eq('organization_id', organization?.id)
          .eq('is_active', true)
      ]);
      
      const avgScore = avgScoreData?.length && avgScoreData.length > 0
        ? avgScoreData.reduce((sum, e) => sum + (e.overall_score || 0), 0) / avgScoreData.length
        : 0;
      
      return {
        employeeCount: employeeCount || 0,
        teamCount: teamCount || 0,
        avgCompetencyLevel: Math.round(avgScore),
        activeLearningPaths: 0
      };
    },
    enabled: !!organization?.id
  });
}
