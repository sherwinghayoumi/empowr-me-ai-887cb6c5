import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type RoleProfile = Tables<'role_profiles'>;
export type Competency = Tables<'competencies'>;
export type CompetencyCluster = Tables<'competency_clusters'>;
export type Subskill = Tables<'subskills'>;

export interface RoleProfileCSVRow {
  role_title: string;
  practice_group: string;
  market_segment: string;
  experience_level: string;
  regions: string;
  last_updated: string;
  competency_cluster: string;
  competency_name: string;
  competency_definition: string;
  demand_weight: string;
  future_demand: string;
  confidence: string;
  subskill: string;
  tools: string;
  artifacts: string;
  status: string;
  future_demand_Q2_2026: string;
  confidence_future_demand_Q2_2026: string;
}

export interface ParsedCSVData {
  roleTitle: string;
  practiceGroup: string;
  marketSegment: string;
  experienceLevel: string;
  regions: string[];
  clusters: {
    name: string;
    competencies: {
      name: string;
      definition: string;
      demandWeight: number | null;
      futureDemand: string | null;
      futureDemandMin: number | null;
      futureDemandMax: number | null;
      confidence: string | null;
      status: string;
      tools: string[];
      artifacts: string[];
      subskills: {
        name: string;
        demandWeight: number | null;
        futureDemand: string | null;
        confidence: string | null;
        status: string;
      }[];
    }[];
  }[];
  totalCompetencies: number;
  totalSubskills: number;
}

export function useRoleProfiles() {
  const queryClient = useQueryClient();

  const { data: roleProfiles, isLoading, error } = useQuery({
    queryKey: ['role_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('role_profiles')
        .select('*')
        .order('year', { ascending: false })
        .order('quarter', { ascending: false })
        .order('role_title', { ascending: true });
      
      if (error) throw error;
      return data as RoleProfile[];
    },
  });

  const { data: competencyCounts } = useQuery({
    queryKey: ['competency_counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('competencies')
        .select('role_profile_id');
      
      if (error) throw error;
      
      // Count competencies per role profile
      const counts: Record<string, number> = {};
      data?.forEach(c => {
        if (c.role_profile_id) {
          counts[c.role_profile_id] = (counts[c.role_profile_id] || 0) + 1;
        }
      });
      return counts;
    },
  });

  const deleteRoleProfile = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('role_profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['role_profiles'] });
      toast.success('Rollenprofil gelöscht');
    },
    onError: (error) => {
      console.error('Error deleting role profile:', error);
      toast.error('Fehler beim Löschen');
    },
  });

  return {
    roleProfiles,
    competencyCounts,
    isLoading,
    error,
    deleteRoleProfile,
  };
}

export function useRoleProfile(id: string | undefined) {
  return useQuery({
    queryKey: ['role_profiles', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('role_profiles')
        .select(`
          *,
          competencies (
            *,
            competency_clusters (*),
            subskills (*)
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

// Detect delimiter (comma or semicolon)
function detectDelimiter(headerLine: string): string {
  const semicolonCount = (headerLine.match(/;/g) || []).length;
  const commaCount = (headerLine.match(/,/g) || []).length;
  return semicolonCount > commaCount ? ';' : ',';
}

// Parse CSV text to rows - handles both comma and semicolon delimiters
export function parseCSV(csvText: string): RoleProfileCSVRow[] {
  // Normalize line endings and handle multi-line quoted values
  const normalizedText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split into records, respecting quoted values with newlines
  const records: string[] = [];
  let currentRecord = '';
  let inQuotes = false;
  
  for (let i = 0; i < normalizedText.length; i++) {
    const char = normalizedText[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentRecord += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentRecord.trim()) {
        records.push(currentRecord);
      }
      currentRecord = '';
    } else {
      currentRecord += char;
    }
  }
  if (currentRecord.trim()) {
    records.push(currentRecord);
  }
  
  if (records.length < 2) return [];
  
  const headerLine = records[0];
  const delimiter = detectDelimiter(headerLine);
  
  // Parse headers - clean up column names
  const headers = parseCSVLine(headerLine, delimiter).map(h => {
    // Remove BOM, quotes, brackets, and normalize header names
    let clean = h.trim()
      .replace(/^\uFEFF/, '') // Remove BOM
      .replace(/"/g, '')
      .replace(/^\[current\]\s*/i, '') // Remove [current] prefix
      .toLowerCase()
      .replace(/\s+/g, '_');
    
    // Map common variations
    if (clean.includes('q1_2026_demand') || clean.includes('q2_2026_demand')) {
      clean = 'demand_weight';
    }
    if (clean === 'future_demand_q2_2026') {
      clean = 'future_demand';
    }
    if (clean === 'confidence_future_demand_q2_2026') {
      clean = 'confidence';
    }
    
    return clean;
  });
  
  const rows: RoleProfileCSVRow[] = [];
  
  // Track inherited values from previous rows (for empty cells)
  let lastRoleTitle = '';
  let lastPracticeGroup = '';
  let lastMarketSegment = '';
  let lastExperienceLevel = '';
  let lastRegions = '';
  let lastUpdated = '';
  
  for (let i = 1; i < records.length; i++) {
    const values = parseCSVLine(records[i], delimiter);
    if (values.length === 0) continue;
    
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      // Clean the value - remove quotes and extra whitespace/newlines
      let value = (values[index] || '').trim().replace(/"/g, '').replace(/\n/g, ' ').trim();
      row[header] = value;
    });
    
    // Inherit values from previous row if empty (common in CSV exports)
    if (!row.role_title && lastRoleTitle) row.role_title = lastRoleTitle;
    if (!row.practice_group && lastPracticeGroup) row.practice_group = lastPracticeGroup;
    if (!row.market_segment && lastMarketSegment) row.market_segment = lastMarketSegment;
    if (!row.experience_level && lastExperienceLevel) row.experience_level = lastExperienceLevel;
    if (!row.regions && lastRegions) row.regions = lastRegions;
    if (!row.last_updated && lastUpdated) row.last_updated = lastUpdated;
    
    // Update last values
    if (row.role_title) lastRoleTitle = row.role_title;
    if (row.practice_group) lastPracticeGroup = row.practice_group;
    if (row.market_segment) lastMarketSegment = row.market_segment;
    if (row.experience_level) lastExperienceLevel = row.experience_level;
    if (row.regions) lastRegions = row.regions;
    if (row.last_updated) lastUpdated = row.last_updated;
    
    rows.push(row as unknown as RoleProfileCSVRow);
  }
  
  return rows;
}

// Parse a single CSV line, handling quoted values
function parseCSVLine(line: string, delimiter: string = ','): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current);
  
  return values;
}

// Parse CSV rows into structured data
export function parseCSVData(rows: RoleProfileCSVRow[]): ParsedCSVData {
  if (rows.length === 0) {
    return {
      roleTitle: '',
      practiceGroup: '',
      marketSegment: '',
      experienceLevel: '',
      regions: [],
      clusters: [],
      totalCompetencies: 0,
      totalSubskills: 0,
    };
  }
  
  const firstRow = rows[0];
  const clustersMap = new Map<string, Map<string, {
    definition: string;
    demandWeight: number | null;
    futureDemand: string | null;
    futureDemandMin: number | null;
    futureDemandMax: number | null;
    confidence: string | null;
    status: string;
    tools: string[];
    artifacts: string[];
    subskills: Map<string, {
      demandWeight: number | null;
      futureDemand: string | null;
      confidence: string | null;
      status: string;
    }>;
  }>>();
  
  let totalSubskills = 0;
  
  for (const row of rows) {
    const clusterName = row.competency_cluster || 'Uncategorized';
    const compName = row.competency_name;
    
    if (!compName) continue;
    
    if (!clustersMap.has(clusterName)) {
      clustersMap.set(clusterName, new Map());
    }
    
    const cluster = clustersMap.get(clusterName)!;
    
    if (!cluster.has(compName)) {
      const futureDemand = row.future_demand_Q2_2026 || row.future_demand;
      let fdMin: number | null = null;
      let fdMax: number | null = null;
      
      if (futureDemand) {
        const match = futureDemand.match(/(\d+)(?:–|-)?(\d+)?/);
        if (match) {
          fdMin = parseInt(match[1]);
          fdMax = match[2] ? parseInt(match[2]) : fdMin;
        }
      }
      
      // Normalize status to lowercase (enum expects 'active', 'emerging', 'deprecated')
      const normalizedStatus = (row.status || 'active').toLowerCase().trim();
      const validStatus = ['active', 'emerging', 'deprecated'].includes(normalizedStatus) 
        ? normalizedStatus 
        : 'active';

      cluster.set(compName, {
        definition: row.competency_definition || '',
        demandWeight: row.demand_weight ? parseFloat(row.demand_weight) : null,
        futureDemand,
        futureDemandMin: fdMin,
        futureDemandMax: fdMax,
        confidence: row.confidence_future_demand_Q2_2026 || row.confidence || null,
        status: validStatus,
        tools: row.tools?.split('|').filter(Boolean) || [],
        artifacts: row.artifacts?.split('|').filter(Boolean) || [],
        subskills: new Map(),
      });
    }
    
    // Add subskill
    if (row.subskill) {
      const comp = cluster.get(compName)!;
      if (!comp.subskills.has(row.subskill)) {
        // Normalize status for subskills too
        const subskillStatus = (row.status || 'active').toLowerCase().trim();
        const validSubskillStatus = ['active', 'emerging', 'deprecated'].includes(subskillStatus) 
          ? subskillStatus 
          : 'active';

        comp.subskills.set(row.subskill, {
          demandWeight: row.demand_weight ? parseFloat(row.demand_weight) : null,
          futureDemand: row.future_demand_Q2_2026 || row.future_demand || null,
          confidence: row.confidence_future_demand_Q2_2026 || row.confidence || null,
          status: validSubskillStatus,
        });
        totalSubskills++;
      }
    }
  }
  
  // Convert to array structure
  const clusters: ParsedCSVData['clusters'] = [];
  let totalCompetencies = 0;
  
  clustersMap.forEach((competencies, clusterName) => {
    const comps: ParsedCSVData['clusters'][0]['competencies'] = [];
    
    competencies.forEach((data, compName) => {
      const subskills: ParsedCSVData['clusters'][0]['competencies'][0]['subskills'] = [];
      
      data.subskills.forEach((subData, subName) => {
        subskills.push({
          name: subName,
          demandWeight: subData.demandWeight,
          futureDemand: subData.futureDemand,
          confidence: subData.confidence,
          status: subData.status,
        });
      });
      
      comps.push({
        name: compName,
        definition: data.definition,
        demandWeight: data.demandWeight,
        futureDemand: data.futureDemand,
        futureDemandMin: data.futureDemandMin,
        futureDemandMax: data.futureDemandMax,
        confidence: data.confidence,
        status: data.status,
        tools: data.tools,
        artifacts: data.artifacts,
        subskills,
      });
      totalCompetencies++;
    });
    
    clusters.push({
      name: clusterName,
      competencies: comps,
    });
  });
  
  return {
    roleTitle: firstRow.role_title || '',
    practiceGroup: firstRow.practice_group || '',
    marketSegment: firstRow.market_segment || '',
    experienceLevel: firstRow.experience_level || '',
    regions: firstRow.regions?.split('|').filter(Boolean) || [],
    clusters,
    totalCompetencies,
    totalSubskills,
  };
}

// Import role profile to database
export async function importRoleProfile(
  parsedData: ParsedCSVData,
  quarter: string,
  year: number,
  userId: string
): Promise<{ success: boolean; roleProfileId?: string; error?: string }> {
  try {
    const roleKey = parsedData.roleTitle.toLowerCase().replace(/\s+/g, '_');
    
    // 1. Create/Update Role Profile
    const { data: roleProfile, error: rpError } = await supabase
      .from('role_profiles')
      .upsert({
        role_key: roleKey,
        role_title: parsedData.roleTitle,
        quarter,
        year,
        practice_group: parsedData.practiceGroup,
        market_segment: parsedData.marketSegment,
        experience_level: parsedData.experienceLevel,
        regions: parsedData.regions,
        is_active: true,
        is_published: false,
        created_by: userId,
      }, { onConflict: 'role_key,quarter,year' })
      .select()
      .single();
    
    if (rpError) throw rpError;
    
    // 2. Process clusters and competencies
    for (const cluster of parsedData.clusters) {
      // Create/Update Cluster
      const { data: clusterData, error: clusterError } = await supabase
        .from('competency_clusters')
        .upsert({
          name: cluster.name,
          quarter,
          year,
        }, { onConflict: 'name,quarter,year' })
        .select()
        .single();
      
      if (clusterError) throw clusterError;
      
      // 3. Process competencies
      for (const comp of cluster.competencies) {
        const { data: compData, error: compError } = await supabase
          .from('competencies')
          .upsert({
            cluster_id: clusterData.id,
            role_profile_id: roleProfile.id,
            name: comp.name,
            definition: comp.definition,
            demand_weight: comp.demandWeight,
            future_demand: comp.futureDemand,
            future_demand_min: comp.futureDemandMin,
            future_demand_max: comp.futureDemandMax,
            confidence: comp.confidence,
            status: comp.status as 'active' | 'emerging' | 'deprecated',
            tools: comp.tools,
            artifacts: comp.artifacts,
          }, { onConflict: 'role_profile_id,name' })
          .select()
          .single();
        
        if (compError) throw compError;
        
        // 4. Process subskills
        for (const sub of comp.subskills) {
          const { error: subError } = await supabase
            .from('subskills')
            .upsert({
              competency_id: compData.id,
              name: sub.name,
              demand_weight: sub.demandWeight,
              future_demand: sub.futureDemand,
              confidence: sub.confidence,
              status: sub.status as 'active' | 'emerging' | 'deprecated',
            }, { onConflict: 'competency_id,name' });
          
          if (subError) throw subError;
        }
      }
    }
    
    // 5. Create Changelog entry
    await supabase
      .from('content_changelog')
      .insert({
        content_type: 'role_profile',
        content_id: roleProfile.id,
        quarter,
        year,
        change_summary: `Role Profile "${parsedData.roleTitle}" für ${quarter} ${year} importiert`,
        changes: {
          clusters: parsedData.clusters.length,
          competencies: parsedData.totalCompetencies,
          subskills: parsedData.totalSubskills,
        },
        created_by: userId,
      });
    
    return { success: true, roleProfileId: roleProfile.id };
  } catch (error) {
    console.error('Import error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Publish role profiles for a quarter
export async function publishRoleProfiles(
  quarter: string,
  year: number,
  userId: string
): Promise<{ success: boolean; affected?: { orgs: number; employees: number }; error?: string }> {
  try {
    // Update all role profiles for this quarter
    const { data: updatedProfiles, error: updateError } = await supabase
      .from('role_profiles')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('quarter', quarter)
      .eq('year', year)
      .eq('is_published', false)
      .select();
    
    if (updateError) throw updateError;
    
    // Count affected organizations and employees
    const { count: orgCount } = await supabase
      .from('organizations')
      .select('*', { count: 'exact', head: true });
    
    const { count: empCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .not('role_profile_id', 'is', null);
    
    // Create changelog entry
    await supabase
      .from('content_changelog')
      .insert({
        content_type: 'quarterly_publish',
        content_id: updatedProfiles?.[0]?.id || '00000000-0000-0000-0000-000000000000',
        quarter,
        year,
        change_summary: `Alle Role Profiles für ${quarter} ${year} veröffentlicht`,
        changes: {
          profiles_published: updatedProfiles?.length || 0,
        },
        affected_organizations: orgCount || 0,
        affected_employees: empCount || 0,
        is_published: true,
        published_at: new Date().toISOString(),
        created_by: userId,
      });
    
    return {
      success: true,
      affected: {
        orgs: orgCount || 0,
        employees: empCount || 0,
      },
    };
  } catch (error) {
    console.error('Publish error:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Propagate published competencies to employees
export async function propagateToEmployees(
  quarter: string,
  year: number
): Promise<{ success: boolean; updated: number; error?: string }> {
  try {
    // Get published role profiles
    const { data: roleProfiles, error: rpError } = await supabase
      .from('role_profiles')
      .select('id, role_key')
      .eq('quarter', quarter)
      .eq('year', year)
      .eq('is_published', true);
    
    if (rpError) throw rpError;
    if (!roleProfiles?.length) {
      return { success: true, updated: 0 };
    }
    
    let totalUpdated = 0;
    
    for (const rp of roleProfiles) {
      // Get competencies for this role profile
      const { data: competencies, error: compError } = await supabase
        .from('competencies')
        .select('id, demand_weight, future_demand_min, future_demand_max')
        .eq('role_profile_id', rp.id);
      
      if (compError) throw compError;
      
      // Get employees with this role profile
      const { data: employees, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('role_profile_id', rp.id);
      
      if (empError) throw empError;
      
      // Update employee_competencies
      for (const emp of employees || []) {
        for (const comp of competencies || []) {
          const { error: upsertError } = await supabase
            .from('employee_competencies')
            .upsert({
              employee_id: emp.id,
              competency_id: comp.id,
              demanded_level: comp.demand_weight,
              future_level: comp.future_demand_max || comp.future_demand_min,
            }, { onConflict: 'employee_id,competency_id' });
          
          if (upsertError) throw upsertError;
          totalUpdated++;
        }
      }
    }
    
    return { success: true, updated: totalUpdated };
  } catch (error) {
    console.error('Propagation error:', error);
    return { success: false, updated: 0, error: (error as Error).message };
  }
}
