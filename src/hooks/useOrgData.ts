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
          role_profile:role_profiles!employees_role_profile_id_fkey(id, role_title, role_key, practice_group),
          team:teams(id, name),
          competencies:employee_competencies(
            id,
            current_level,
            demanded_level,
            future_level,
            gap_to_current,
            is_deprecated,
            competency:competencies(id, name, status, cluster:competency_clusters(name, cluster_category))
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

export function useTeams(includeArchived = false) {
  const { organization } = useAuth();
  
  return useQuery({
    queryKey: ['teams', organization?.id, includeArchived],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          *,
          members:employees(id, full_name, avatar_url, overall_score, team_role, role_profile:role_profiles!employees_role_profile_id_fkey(role_title))
        `)
        .eq('organization_id', organization?.id)
        .order('priority', { ascending: false })
        .order('name');
      
      if (!includeArchived) {
        query = query.eq('is_archived', false);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });
}

interface CreateTeamData {
  name: string;
  description: string | null;
  color?: string;
  icon?: string;
  tags?: string[];
  priority?: number;
  members?: { employeeId: string; role: string }[];
}

export function useCreateTeam() {
  const { organization } = useAuth();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateTeamData) => {
      if (!organization?.id) throw new Error('No organization');
      
      // Create team
      const { data: team, error } = await supabase
        .from('teams')
        .insert({
          name: data.name,
          description: data.description,
          color: data.color || '#6366f1',
          icon: data.icon || 'Users',
          tags: data.tags || [],
          priority: data.priority || 0,
          organization_id: organization.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Assign members if provided
      if (data.members && data.members.length > 0) {
        const memberUpdates = data.members.map(m => 
          supabase
            .from('employees')
            .update({ team_id: team.id, team_role: m.role || null })
            .eq('id', m.employeeId)
        );
        await Promise.all(memberUpdates);
      }
      
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Team erfolgreich erstellt');
    },
    onError: () => {
      toast.error('Fehler beim Erstellen des Teams');
    },
  });
}

interface UpdateTeamData extends CreateTeamData {
  id: string;
  isArchived?: boolean;
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: UpdateTeamData) => {
      // Update team
      const { data: team, error } = await supabase
        .from('teams')
        .update({
          name: data.name,
          description: data.description,
          color: data.color,
          icon: data.icon,
          tags: data.tags,
          priority: data.priority,
          is_archived: data.isArchived || false,
        })
        .eq('id', data.id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Remove current members from this team
      await supabase
        .from('employees')
        .update({ team_id: null, team_role: null })
        .eq('team_id', data.id);
      
      // Assign new members
      if (data.members && data.members.length > 0) {
        const memberUpdates = data.members.map(m => 
          supabase
            .from('employees')
            .update({ team_id: team.id, team_role: m.role || null })
            .eq('id', m.employeeId)
        );
        await Promise.all(memberUpdates);
      }
      
      return team;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Team erfolgreich aktualisiert');
    },
    onError: () => {
      toast.error('Fehler beim Aktualisieren des Teams');
    },
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (teamId: string) => {
      // Remove members from team first
      await supabase
        .from('employees')
        .update({ team_id: null, team_role: null })
        .eq('team_id', teamId);
      
      // Delete team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Team erfolgreich gelöscht');
    },
    onError: () => {
      toast.error('Fehler beim Löschen des Teams');
    },
  });
}

export function useArchiveTeam() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ teamId, archive }: { teamId: string; archive: boolean }) => {
      const { error } = await supabase
        .from('teams')
        .update({ is_archived: archive })
        .eq('id', teamId);
      
      if (error) throw error;
    },
    onSuccess: (_, { archive }) => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast.success(archive ? 'Team archiviert' : 'Team wiederhergestellt');
    },
    onError: () => {
      toast.error('Fehler bei der Archivierung');
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

interface EmployeeGap {
  competency: string;
  competencyId: string;
  gap: number;
  current: number;
  demanded: number;
  future: number;
}

interface EmployeeWithGaps {
  id: string;
  name: string;
  role: string | undefined;
  practiceGroup: string | undefined;
  currentGapTotal: number;
  futureRiskTotal: number;
  gaps: EmployeeGap[];
}

interface CompetencyGapEntry {
  name: string;
  avgCurrentGap: number;
  avgFutureRisk: number;
  employeeCount: number;
}

export interface GapAnalysis {
  byEmployee: EmployeeWithGaps[];
  currentGapCount: number;
  futureRiskCount: number;
  criticalCurrentGaps: CompetencyGapEntry[];
  criticalFutureRisks: CompetencyGapEntry[];
}

const GAP_THRESHOLD = 10; // ignore gaps below this

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
          role_profile:role_profiles!employees_role_profile_id_fkey(role_key, role_title, practice_group),
          competencies:employee_competencies(
            current_level,
            demanded_level,
            future_level,
            is_deprecated,
            competency:competencies(id, name, status)
          )
        `)
        .eq('organization_id', organization?.id)
        .eq('is_active', true);
      
      if (error) throw error;
      
      const compAgg: Record<string, { currentGaps: number[]; futureRisks: number[]; count: number }> = {};
      const byEmployee: EmployeeWithGaps[] = [];
      let currentGapCount = 0;
      let futureRiskCount = 0;
      
      for (const emp of employees || []) {
        let currentGapTotal = 0;
        let futureRiskTotal = 0;
        const empGaps: EmployeeGap[] = [];
        
        for (const comp of emp.competencies || []) {
          if (comp.is_deprecated) continue;
          const cur = comp.current_level || 0;
          const dem = comp.demanded_level || 0;
          const fut = comp.future_level || 0;
          const currentGap = Math.max(0, dem - cur);
          const futureRisk = Math.max(0, fut - cur);
          const competencyName = comp.competency?.name || 'Unknown';
          const competencyId = comp.competency?.id || '';
          
          // Track aggregation
          if (!compAgg[competencyName]) compAgg[competencyName] = { currentGaps: [], futureRisks: [], count: 0 };
          compAgg[competencyName].count++;
          if (currentGap >= GAP_THRESHOLD) compAgg[competencyName].currentGaps.push(currentGap);
          if (futureRisk >= GAP_THRESHOLD) compAgg[competencyName].futureRisks.push(futureRisk);
          
          if (currentGap >= GAP_THRESHOLD || futureRisk >= GAP_THRESHOLD) {
            empGaps.push({ competency: competencyName, competencyId, gap: currentGap, current: cur, demanded: dem, future: fut });
          }
          if (currentGap >= GAP_THRESHOLD) { currentGapTotal += currentGap; currentGapCount++; }
          if (futureRisk >= GAP_THRESHOLD) { futureRiskTotal += futureRisk; futureRiskCount++; }
        }
        
        byEmployee.push({
          id: emp.id,
          name: emp.full_name,
          role: emp.role_profile?.role_title,
          practiceGroup: emp.role_profile?.practice_group ?? undefined,
          currentGapTotal,
          futureRiskTotal,
          gaps: empGaps.sort((a, b) => b.gap - a.gap),
        });
      }
      
      const criticalCurrentGaps: CompetencyGapEntry[] = Object.entries(compAgg)
        .filter(([, d]) => d.currentGaps.length > 0)
        .map(([name, d]) => ({
          name,
          avgCurrentGap: d.currentGaps.reduce((s, v) => s + v, 0) / d.currentGaps.length,
          avgFutureRisk: d.futureRisks.length > 0 ? d.futureRisks.reduce((s, v) => s + v, 0) / d.futureRisks.length : 0,
          employeeCount: d.currentGaps.length,
        }))
        .sort((a, b) => b.avgCurrentGap - a.avgCurrentGap);
      
      const criticalFutureRisks: CompetencyGapEntry[] = Object.entries(compAgg)
        .filter(([, d]) => d.futureRisks.length > 0)
        .map(([name, d]) => ({
          name,
          avgCurrentGap: d.currentGaps.length > 0 ? d.currentGaps.reduce((s, v) => s + v, 0) / d.currentGaps.length : 0,
          avgFutureRisk: d.futureRisks.reduce((s, v) => s + v, 0) / d.futureRisks.length,
          employeeCount: d.futureRisks.length,
        }))
        .sort((a, b) => b.avgFutureRisk - a.avgFutureRisk);
      
      return { byEmployee, currentGapCount, futureRiskCount, criticalCurrentGaps, criticalFutureRisks } as GapAnalysis;
    },
    enabled: !!organization?.id,
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
