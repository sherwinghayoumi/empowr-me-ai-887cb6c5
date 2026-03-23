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
    sortOrder?: number;
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
    onError: () => {
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
      sortOrder: clusters.length + 1,
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

// Detect file format (JSON or CSV)
export function detectFileFormat(content: string): 'json' | 'csv' {
  const trimmed = content.trim();
  if (trimmed.startsWith('{')) return 'json';
  return 'csv';
}

// Parse FUTURA JSON Role Profile into ParsedCSVData
export function parseJSONRoleProfile(jsonString: string): ParsedCSVData {
  let json: any;
  try {
    json = JSON.parse(jsonString);
  } catch (e) {
    throw new Error(`Ungültiges JSON: ${(e as Error).message}`);
  }

  if (!json.role_profile) {
    throw new Error('JSON fehlt das Feld "role_profile"');
  }
  if (!Array.isArray(json.clusters) || json.clusters.length === 0) {
    throw new Error('JSON fehlt das Feld "clusters" oder es ist leer');
  }

  const rp = json.role_profile;

  let totalCompetencies = 0;
  let totalSubskills = 0;

  const clusters: ParsedCSVData['clusters'] = json.clusters.map((cluster: any) => {
    if (!cluster.name) {
      throw new Error('Ein Cluster hat keinen Namen');
    }
    if (!Array.isArray(cluster.competencies) || cluster.competencies.length === 0) {
      throw new Error(`Cluster "${cluster.name}" hat keine Kompetenzen`);
    }

    const competencies = cluster.competencies.map((comp: any) => {
      if (!comp.name) {
        throw new Error(`Eine Kompetenz in Cluster "${cluster.name}" hat keinen Namen`);
      }
      if (comp.demand_weight == null) {
        throw new Error(`Kompetenz "${comp.name}" hat kein demand_weight`);
      }

      totalCompetencies++;

      const normalizedStatus = (comp.status || 'active').toLowerCase().trim();
      const validStatus = ['active', 'emerging', 'deprecated'].includes(normalizedStatus)
        ? normalizedStatus
        : 'active';

      const subskills = (comp.subskills || []).map((sub: any) => {
        totalSubskills++;
        const subStatus = (sub.status || 'active').toLowerCase().trim();
        return {
          name: sub.name || '',
          demandWeight: sub.demand_weight ?? null,
          futureDemand: sub.future_demand ?? null,
          confidence: sub.confidence ?? null,
          status: ['active', 'emerging', 'deprecated'].includes(subStatus) ? subStatus : 'active',
        };
      });

      return {
        name: comp.name,
        definition: comp.definition || '',
        demandWeight: comp.demand_weight ?? null,
        futureDemand: comp.future_demand ?? null,
        futureDemandMin: comp.future_demand_min ?? null,
        futureDemandMax: comp.future_demand_max ?? null,
        confidence: comp.confidence ?? null,
        status: validStatus,
        tools: Array.isArray(comp.tools) ? comp.tools : [],
        artifacts: Array.isArray(comp.artifacts) ? comp.artifacts : [],
        subskills,
      };
    });

    return { name: cluster.name, competencies };
  });

  return {
    roleTitle: rp.role_title || '',
    practiceGroup: rp.practice_group || '',
    marketSegment: rp.market_segment || '',
    experienceLevel: rp.experience_level || '',
    regions: Array.isArray(rp.regions) ? rp.regions : [],
    clusters,
    totalCompetencies,
    totalSubskills,
  };
}

/**
 * Auto-detect cluster_category from cluster name using pattern matching.
 */
function detectClusterCategory(clusterName: string): string | null {
  const name = clusterName.toLowerCase();
  // Practice-specific categories
  if (name.includes('deal execution') || name.includes('transaction management') || name.includes('transaction execution') || name.includes('deal administration'))
    return 'deal_execution';
  if (name.includes('due diligence') || name.includes('quality control') || name.includes('quality oversight'))
    return 'due_diligence';
  if (name.includes('technical lawyering') || (name.includes('negotiation') && !name.includes('stakeholder')))
    return 'technical_lawyering';
  if (name.includes('regulatory clearance') || name.includes('deal compliance') || name.includes('deal strategy'))
    return 'regulatory_clearance';
  // Universal categories
  if (name.includes('ai-enabled')) return 'ai_enabled';
  if (name.includes('legal technology')) return 'legal_tech';
  if (name.includes('regulatory') && name.includes('governance')) return 'regulatory_governance';
  if (name.includes('professional skills')) return 'professional_skills';
  if (name.includes('leadership')) return 'leadership';
  if (name.includes('business development')) return 'business_development';
  return null;
}

// Import role profile to database
export async function importRoleProfile(
  parsedData: ParsedCSVData,
  quarter: string,
  year: number,
  userId: string
): Promise<{ success: boolean; roleProfileId?: string; error?: string }> {
  try {
    const practiceSlug = (parsedData.practiceGroup || 'general')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const roleSlug = parsedData.roleTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');
    const roleKey = `${roleSlug}__${practiceSlug}`;
    
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
          cluster_category: detectClusterCategory(cluster.name),
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
    return { success: false, updated: 0, error: (error as Error).message };
  }
}

/**
 * Migrate employee ratings from a previous quarter to a new quarter.
 * Matches competencies by name (names are stable across quarters).
 * COPIES ratings — does not move or delete old data.
 */
export async function migrateEmployeeRatings(
  oldQuarter: string,
  oldYear: number,
  newQuarter: string,
  newYear: number
): Promise<{
  success: boolean;
  migrated: number;
  unmigrated: string[];
  employeesAffected: number;
  error?: string;
}> {
  try {
    // 1. Get all published role profiles for BOTH quarters
    const { data: oldProfiles, error: oldErr } = await supabase
      .from('role_profiles')
      .select('id, role_key')
      .eq('quarter', oldQuarter)
      .eq('year', oldYear)
      .eq('is_published', true);

    if (oldErr) throw oldErr;

    const { data: newProfiles, error: newErr } = await supabase
      .from('role_profiles')
      .select('id, role_key')
      .eq('quarter', newQuarter)
      .eq('year', newYear)
      .eq('is_published', true);

    if (newErr) throw newErr;
    if (!oldProfiles?.length || !newProfiles?.length) {
      return { success: true, migrated: 0, unmigrated: [], employeesAffected: 0 };
    }

    let totalMigrated = 0;
    const allUnmigrated: string[] = [];
    const affectedEmployeeIds = new Set<string>();

    // 2. For each new profile, find the matching old profile by role_key
    for (const newProfile of newProfiles) {
      const oldProfile = oldProfiles.find(op => op.role_key === newProfile.role_key);
      if (!oldProfile) continue;

      // 3. Load competencies for both profiles
      const { data: oldComps } = await supabase
        .from('competencies')
        .select('id, name')
        .eq('role_profile_id', oldProfile.id);

      const { data: newComps } = await supabase
        .from('competencies')
        .select('id, name')
        .eq('role_profile_id', newProfile.id);

      if (!oldComps?.length || !newComps?.length) continue;

      const newNameToId = new Map(newComps.map(c => [c.name, c.id]));

      // 4. Find employees currently assigned to the OLD profile
      const { data: employees } = await supabase
        .from('employees')
        .select('id')
        .eq('role_profile_id', oldProfile.id);

      if (!employees?.length) continue;

      // 5. For each employee, migrate ratings
      for (const emp of employees) {
        const { data: oldRatings } = await supabase
          .from('employee_competencies')
          .select('competency_id, current_level, self_rating, manager_rating, evidence_summary, rating_confidence')
          .eq('employee_id', emp.id)
          .in('competency_id', oldComps.map(c => c.id))
          .not('current_level', 'is', null);

        if (!oldRatings?.length) continue;

        affectedEmployeeIds.add(emp.id);

        for (const oldRating of oldRatings) {
          const oldComp = oldComps.find(c => c.id === oldRating.competency_id);
          if (!oldComp) continue;

          const newCompId = newNameToId.get(oldComp.name);

          if (newCompId) {
            const { error: upsertErr } = await supabase
              .from('employee_competencies')
              .upsert({
                employee_id: emp.id,
                competency_id: newCompId,
                current_level: oldRating.current_level,
                self_rating: oldRating.self_rating,
                manager_rating: oldRating.manager_rating,
                evidence_summary: oldRating.evidence_summary,
                rating_confidence: oldRating.rating_confidence,
                updated_at: new Date().toISOString(),
              }, { onConflict: 'employee_id,competency_id' });

            if (!upsertErr) totalMigrated++;
          } else {
            if (!allUnmigrated.includes(oldComp.name)) {
              allUnmigrated.push(oldComp.name);
            }
          }
        }

        // 6. Migrate subskill ratings
        for (const oldComp of oldComps) {
          const newCompId = newNameToId.get(oldComp.name);
          if (!newCompId) continue;

          const { data: oldSubskills } = await supabase
            .from('subskills')
            .select('id, name')
            .eq('competency_id', oldComp.id);

          const { data: newSubskills } = await supabase
            .from('subskills')
            .select('id, name')
            .eq('competency_id', newCompId);

          if (!oldSubskills?.length || !newSubskills?.length) continue;

          const newSubMap = new Map(newSubskills.map(s => [s.name, s.id]));

          const { data: oldSubRatings } = await supabase
            .from('employee_subskills')
            .select('subskill_id, current_level, evidence')
            .eq('employee_id', emp.id)
            .in('subskill_id', oldSubskills.map(s => s.id))
            .not('current_level', 'is', null);

          if (!oldSubRatings?.length) continue;

          for (const oldSubRating of oldSubRatings) {
            const oldSub = oldSubskills.find(s => s.id === oldSubRating.subskill_id);
            if (!oldSub) continue;

            const newSubId = newSubMap.get(oldSub.name);
            if (newSubId) {
              await supabase
                .from('employee_subskills')
                .upsert({
                  employee_id: emp.id,
                  subskill_id: newSubId,
                  current_level: oldSubRating.current_level,
                  evidence: oldSubRating.evidence,
                  rated_at: new Date().toISOString(),
                }, { onConflict: 'employee_id,subskill_id' });
            }
          }
        }

        // 8. Mark old competencies that have no Q(new) equivalent as deprecated
        const unmigratedOldCompIds = oldComps
          .filter(oc => !newNameToId.has(oc.name))
          .map(oc => oc.id);

        if (unmigratedOldCompIds.length > 0) {
          await supabase
            .from('employee_competencies')
            .update({ is_deprecated: true })
            .eq('employee_id', emp.id)
            .in('competency_id', unmigratedOldCompIds);
        }
      }
    }

    return {
      success: true,
      migrated: totalMigrated,
      unmigrated: allUnmigrated,
      employeesAffected: affectedEmployeeIds.size,
    };
  } catch (error) {
    return {
      success: false,
      migrated: 0,
      unmigrated: [],
      employeesAffected: 0,
      error: (error as Error).message,
    };
  }
}

/**
 * Reassign employees from Q(old) role profiles to Q(new) role profiles.
 * Matches by role_key. Only reassigns if Q(new) profile is published.
 * MUST run AFTER migrateEmployeeRatings to preserve rating continuity.
 */
export async function reassignEmployeesToNewQuarter(
  oldQuarter: string,
  oldYear: number,
  newQuarter: string,
  newYear: number
): Promise<{
  success: boolean;
  reassigned: number;
  skipped: number;
  error?: string;
}> {
  try {
    const { data: oldProfiles, error: oldErr } = await supabase
      .from('role_profiles')
      .select('id, role_key')
      .eq('quarter', oldQuarter)
      .eq('year', oldYear);

    if (oldErr) throw oldErr;

    const { data: newProfiles, error: newErr } = await supabase
      .from('role_profiles')
      .select('id, role_key')
      .eq('quarter', newQuarter)
      .eq('year', newYear)
      .eq('is_published', true);

    if (newErr) throw newErr;
    if (!oldProfiles?.length || !newProfiles?.length) {
      return { success: true, reassigned: 0, skipped: 0 };
    }

    let totalReassigned = 0;
    let totalSkipped = 0;

    for (const oldProfile of oldProfiles) {
      const newProfile = newProfiles.find(np => np.role_key === oldProfile.role_key);

      if (!newProfile) {
        totalSkipped++;
        continue;
      }

      const { data: updated, error: updateErr } = await supabase
        .from('employees')
        .update({
          role_profile_id: newProfile.id,
          updated_at: new Date().toISOString(),
        })
        .eq('role_profile_id', oldProfile.id)
        .select('id');

      if (updateErr) throw updateErr;
      totalReassigned += updated?.length || 0;
    }

    return { success: true, reassigned: totalReassigned, skipped: totalSkipped };
  } catch (error) {
    return {
      success: false,
      reassigned: 0,
      skipped: 0,
      error: (error as Error).message,
    };
  }
}
