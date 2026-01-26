import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { capLevel } from "@/lib/utils";

export interface EmployeeSubskill {
  id: string;
  current_level: number | null;
  subskill: {
    id: string;
    name: string;
    name_de: string | null;
    competency_id: string | null;
  };
}

export interface EmployeeCompetency {
  id: string;
  current_level: number | null;
  demanded_level: number | null;
  future_level: number | null;
  competency: {
    id: string;
    name: string;
    cluster: {
      id: string;
      name: string;
      name_de: string | null;
    } | null;
    subskills: {
      id: string;
      name: string;
      name_de: string | null;
    }[];
  };
}

export interface EmployeeWithSkills {
  id: string;
  full_name: string;
  overall_score: number | null;
  role_profile: {
    id: string;
    role_key: string;
    role_title: string;
  } | null;
  employee_competencies: EmployeeCompetency[];
  employee_subskills: EmployeeSubskill[];
}

// Transform competencies into UI-friendly format grouped by cluster
export interface ClusterGroup {
  clusterId: string;
  clusterName: string;
  clusterNameDe: string | null;
  competencies: {
    competencyId: string;
    competencyName: string;
    currentLevel: number;
    demandedLevel: number;
    futureLevel: number;
    subskills: {
      id: string;
      name: string;
      description: string | null;
      currentLevel: number | null;
      evidence?: string;
    }[];
  }[];
  avgLevel: number;
}

export interface SkillsForRadar {
  skillId: string;
  skillName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel?: number;
}

export function useEmployeeSkills() {
  const { profile } = useAuth();
  const employeeId = profile?.employee_id;

  return useQuery({
    queryKey: ["employee-skills", employeeId],
    queryFn: async (): Promise<EmployeeWithSkills | null> => {
      if (!employeeId) return null;

      const { data, error } = await supabase
        .from("employees")
        .select(`
          id,
          full_name,
          overall_score,
          role_profile:role_profiles(id, role_key, role_title),
          employee_competencies(
            id,
            current_level,
            demanded_level,
            future_level,
            competency:competencies(
              id,
              name,
              cluster:competency_clusters(id, name, name_de),
              subskills(id, name, name_de)
            )
          ),
          employee_subskills(
            id,
            current_level,
            subskill:subskills(id, name, name_de, competency_id)
          )
        `)
        .eq("id", employeeId)
        .single();

      if (error) {
        console.error("Error fetching employee skills:", error);
        throw error;
      }

      return data as unknown as EmployeeWithSkills;
    },
    enabled: !!employeeId,
  });
}

// Helper to group competencies by cluster
export function groupByCluster(
  employeeCompetencies: EmployeeCompetency[],
  employeeSubskills: EmployeeSubskill[]
): ClusterGroup[] {
  const clusterMap = new Map<string, ClusterGroup>();

  // Build a map of subskill ratings by subskill_id
  const subskillRatings = new Map<string, number | null>();
  employeeSubskills.forEach((es) => {
    if (es.subskill) {
      subskillRatings.set(es.subskill.id, es.current_level);
    }
  });

  employeeCompetencies.forEach((ec) => {
    if (!ec.competency) return;

    const cluster = ec.competency.cluster;
    const clusterId = cluster?.id || "uncategorized";
    const clusterName = cluster?.name || "Uncategorized";
    const clusterNameDe = cluster?.name_de || null;

    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, {
        clusterId,
        clusterName,
        clusterNameDe,
        competencies: [],
        avgLevel: 0,
      });
    }

    const group = clusterMap.get(clusterId)!;

    // Map subskills with their ratings
    const subskillsWithRatings = (ec.competency.subskills || []).map((ss) => ({
      id: ss.id,
      name: ss.name,
      description: ss.name_de,
      currentLevel: subskillRatings.get(ss.id) ?? null,
      evidence: undefined,
    }));

    group.competencies.push({
      competencyId: ec.competency.id,
      competencyName: ec.competency.name,
      currentLevel: capLevel(ec.current_level),
      demandedLevel: capLevel(ec.demanded_level, 100) || 70,
      futureLevel: capLevel(ec.future_level, 100) || 80,
      subskills: subskillsWithRatings,
    });
  });

  // Calculate average level per cluster
  clusterMap.forEach((group) => {
    if (group.competencies.length > 0) {
      const sum = group.competencies.reduce((acc, c) => acc + c.currentLevel, 0);
      group.avgLevel = Math.round(sum / group.competencies.length);
    }
  });

  return Array.from(clusterMap.values());
}

// Transform for radar chart
export function transformForRadar(
  employeeCompetencies: EmployeeCompetency[]
): SkillsForRadar[] {
  return employeeCompetencies.map((ec) => ({
    skillId: ec.competency?.id || ec.id,
    skillName: ec.competency?.name || "Unknown",
    currentLevel: capLevel(ec.current_level),
    demandedLevel: capLevel(ec.demanded_level, 100) || 70,
    futureLevel: capLevel(ec.future_level),
  }));
}
