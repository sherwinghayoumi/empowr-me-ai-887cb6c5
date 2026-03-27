import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SkillGapCardDb } from "@/components/SkillGapCardDb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEmployees } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle, TrendingUp, Users, FileQuestion,
  Search, X, Folder, FolderOpen,
  ChevronDown, ChevronRight, Target, Sparkles, Loader2, Layers,
} from "lucide-react";

interface DbEmployee {
  id: string;
  full_name: string;
  overall_score: number | null;
  avatar_url: string | null;
  role_profile: { id: string; role_title: string; role_key: string; practice_group: string | null } | null;
  team: { id: string; name: string } | null;
  competencies: Array<{
    id: string;
    current_level: number | null;
    demanded_level: number | null;
    future_level: number | null;
    gap_to_current: number | null;
    is_deprecated: boolean | null;
    competency: {
      id: string;
      name: string;
      status: string | null;
      cluster: { name: string; cluster_category: string | null } | null;
    } | null;
  }>;
}

interface EmployeeGap {
  employee: DbEmployee;
  competencyId: string;
  competencyName: string;
  clusterName: string;
  clusterCategory: string | null;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  weightedGap: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  deal_execution: "Deal Execution & Transaction Management",
  due_diligence: "Due Diligence & Quality Control",
  technical_lawyering: "Technical Lawyering & Negotiation",
  regulatory_clearance: "Regulatory Clearance & Compliance",
  ai_enabled: "AI-Enabled Legal Work",
  legal_tech: "Legal Technology & Automation",
  regulatory_governance: "Regulatory & AI Governance",
  professional_skills: "Professional Skills & Client Delivery",
  leadership: "Leadership & People Management",
  business_development: "Business Development & Strategy",
};

const GAP_TOLERANCE = 10;

function getSeverityLabel(weightedGap: number, demandedLevel: number): "focus" | "building" | "ontrack" {
  const effectiveGap = Math.max(0, weightedGap - GAP_TOLERANCE);
  const ratio = demandedLevel > 0 ? effectiveGap / demandedLevel : 0;
  if (ratio >= 0.4) return "focus";
  if (ratio >= 0.2) return "building";
  return "ontrack";
}

const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const queryClient = useQueryClient();

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);

  const allGaps = useMemo<EmployeeGap[]>(() => {
    if (!employees?.length) return [];
    const gaps: EmployeeGap[] = [];
    (employees as DbEmployee[]).forEach((emp) => {
      (emp.competencies || []).filter(c => !c.is_deprecated).forEach((comp) => {
        const cur = comp.current_level ?? 0;
        const dem = comp.demanded_level ?? 0;
        const fut = comp.future_level ?? 0;
        const weighted = (dem - cur) * 0.4 + (fut - cur) * 0.6;
        if (weighted >= GAP_TOLERANCE && comp.competency) {
          gaps.push({
            employee: emp,
            competencyId: comp.competency.id,
            competencyName: comp.competency.name,
            clusterName: comp.competency.cluster?.name || "Sonstige",
            clusterCategory: comp.competency.cluster?.cluster_category || null,
            currentLevel: cur,
            demandedLevel: dem,
            futureLevel: fut,
            weightedGap: weighted,
          });
        }
      });
    });
    return gaps;
  }, [employees]);

  const uniqueClusters = useMemo(() => {
    if (groupByCategory) {
      const cats = allGaps.map(g => g.clusterCategory ? (CATEGORY_LABELS[g.clusterCategory] || g.clusterCategory) : g.clusterName);
      return [...new Set(cats)].sort();
    }
    return [...new Set(allGaps.map(g => g.clusterName))].sort();
  }, [allGaps, groupByCategory]);
  const uniqueEmployees = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => m.set(g.employee.id, g.employee.full_name)); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);
  const uniqueRoles     = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => { if (g.employee.role_profile) m.set(g.employee.role_profile.id, g.employee.role_profile.role_title); }); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);

  const filteredGaps = useMemo(() => allGaps.filter(g => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!g.employee.full_name.toLowerCase().includes(q) && !g.competencyName.toLowerCase().includes(q)) return false;
    }
    if (filterCluster !== "all") {
      const effectiveCluster = groupByCategory && g.clusterCategory
        ? (CATEGORY_LABELS[g.clusterCategory] || g.clusterCategory)
        : g.clusterName;
      if (effectiveCluster !== filterCluster) return false;
    }
    if (filterSeverity !== "all" && getSeverityLabel(g.weightedGap, g.demandedLevel) !== filterSeverity) return false;
    if (filterEmployee !== "all" && g.employee.id !== filterEmployee) return false;
    if (filterRole     !== "all" && g.employee.role_profile?.id !== filterRole) return false;
    return true;
  }), [allGaps, searchQuery, filterCluster, filterSeverity, filterEmployee, filterRole, groupByCategory]);

  const hasFilters = filterCluster !== "all" || filterSeverity !== "all" || filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";
  const clearFilters = () => { setSearchQuery(""); setFilterCluster("all"); setFilterSeverity("all"); setFilterEmployee("all"); setFilterRole("all"); };

  const totalGaps     = filteredGaps.length;
  const focusCount    = filteredGaps.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "focus").length;
  const affectedCount = new Set(filteredGaps.map(g => g.employee.id)).size;

  const handleGenerateDescriptions = async () => {
    if (!employees?.length) return;
    setIsGenerating(true);
    try {
      const allCompetencyNames = new Set<string>();
      (employees as DbEmployee[]).forEach((emp) => {
        (emp.competencies || []).forEach((comp) => {
          if (comp.competency?.name) allCompetencyNames.add(comp.competency.name);
        });
      });
      const { data: existing } = await supabase.from("competency_descriptions").select("name_key");
      const existingKeys = new Set((existing ?? []).map((e: { name_key: string }) => e.name_key.toLowerCase()));
      const missingCompetencies = [...allCompetencyNames]
        .filter((n) => !existingKeys.has(n.toLowerCase()))
        .map((name) => ({ name, type: "competency" as const }));
      if (missingCompetencies.length === 0) {
        toast({ title: "Alles aktuell", description: "Alle Kompetenzen haben bereits eine Beschreibung." });
        setIsGenerating(false);
        return;
      }
      const BATCH_SIZE = 20;
      let totalGenerated = 0;
      for (let i = 0; i < missingCompetencies.length; i += BATCH_SIZE) {
        const batch = missingCompetencies.slice(i, i + BATCH_SIZE);
        const { data, error: fnError } = await supabase.functions.invoke("generate-competency-descriptions", { body: { competencies: batch } });
        if (fnError) throw fnError;
        totalGenerated += data?.generated ?? 0;
      }
      queryClient.invalidateQueries({ queryKey: ["competency_descriptions"] });
      toast({ title: "Beschreibungen generiert", description: `${totalGenerated} neue Beschreibungen wurden KI-generiert und gespeichert.` });
    } catch (err) {
      console.error("Generierungsfehler:", err);
      toast({ title: "Fehler", description: "Beschreibungen konnten nicht generiert werden.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const groupedByRole = useMemo(() => {
    const roleMap: Record<string, { roleTitle: string; clusters: Record<string, Record<string, EmployeeGap[]>> }> = {};
    filteredGaps.forEach(g => {
      const roleId = g.employee.role_profile?.id ?? "__none__";
      const roleTitle = g.employee.role_profile?.role_title ?? "Ohne Rolle";
      if (!roleMap[roleId]) roleMap[roleId] = { roleTitle, clusters: {} };
      const roleBucket = roleMap[roleId].clusters;
      const clusterKey = groupByCategory && g.clusterCategory ? (CATEGORY_LABELS[g.clusterCategory] || g.clusterCategory) : g.clusterName;
      if (!roleBucket[clusterKey]) roleBucket[clusterKey] = {};
      const clusterBucket = roleBucket[clusterKey];
      if (!clusterBucket[g.competencyId]) clusterBucket[g.competencyId] = [];
      clusterBucket[g.competencyId].push(g);
    });
    Object.values(roleMap).forEach(role => {
      Object.values(role.clusters).forEach(cluster => {
        Object.values(cluster).forEach(arr => arr.sort((a, b) => b.weightedGap - a.weightedGap));
      });
    });
    return roleMap;
  }, [filteredGaps, groupByCategory]);

  const sortedRoles = Object.keys(groupedByRole).sort((a, b) =>
    groupedByRole[a].roleTitle.localeCompare(groupedByRole[b].roleTitle)
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-52 rounded-md" />
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <Card key={i} className="bg-card/80 border-border/50 animate-skeleton-pulse" style={{ animationDelay: `${i * 150}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Skill Gap Analyse</h1>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Keine Mitarbeiter vorhanden</p>
            <p className="text-sm text-muted-foreground mt-1">Legen Sie zuerst Mitarbeiter an.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-start justify-between gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Skill Gap Analyse</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Kompetenzlücken erkennen und gezielte Lernpfade einleiten</p>
        </div>
        <Button
          variant="ai"
          size="sm"
          onClick={handleGenerateDescriptions}
          disabled={isGenerating}
          className="shrink-0 gap-2 h-9"
          title="Prüft alle Kompetenzen und generiert fehlende deutsche Beschreibungen automatisch per KI"
        >
          {isGenerating
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Sparkles className="w-3.5 h-3.5 animate-ai-sparkle-icon" />}
          {isGenerating ? "Generiere..." : "Beschreibungen aktualisieren"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground leading-none tabular-nums">{totalGaps}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Entwicklungsbereiche</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/15">
              <Target className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground leading-none tabular-nums">{focusCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Großes Potenzial</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-3 px-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/15">
              <Users className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground leading-none tabular-nums">{affectedCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Mitarbeiter</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Mitarbeiter oder Kompetenz..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center animate-fade-in-up" style={{ animationDelay: '130ms' }}>
        <Button
          variant={groupByCategory ? "default" : "outline"}
          size="sm"
          className="h-8 text-xs"
          onClick={() => { setGroupByCategory(!groupByCategory); setFilterCluster("all"); }}
        >
          <Layers className="w-3 h-3 mr-1" />
          {groupByCategory ? "Kategorie-Gruppierung" : "Cluster-Gruppierung"}
        </Button>

        <Select value={filterCluster} onValueChange={setFilterCluster}>
          <SelectTrigger className="h-8 w-40 text-xs"><SelectValue placeholder="Cluster" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Cluster</SelectItem>
            {uniqueClusters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Entwicklungsstand" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="focus">Großes Potenzial</SelectItem>
            <SelectItem value="building">Im Wachstum</SelectItem>
            <SelectItem value="ontrack">Gut aufgestellt</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Mitarbeiter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Mitarbeiter</SelectItem>
            {uniqueEmployees.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="h-8 w-44 text-xs"><SelectValue placeholder="Rolle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Rollen</SelectItem>
            {uniqueRoles.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
          </SelectContent>
        </Select>

        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-3 h-3" />zurücksetzen
          </button>
        )}

        <span className="text-xs text-muted-foreground ml-auto tabular-nums">{totalGaps} Gaps</span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-primary/50 inline-block" />Ist-Niveau</span>
        <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-foreground/50 inline-block" />Soll</span>
        <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-primary inline-block" />Ziel</span>
      </div>

      {/* Role-folder view */}
      <div className="space-y-3">
        {sortedRoles.map((roleId) => {
          const roleData = groupedByRole[roleId];
          if (!roleData) return null;
          const { roleTitle, clusters } = roleData;
          const sortedRoleClusters = Object.keys(clusters).sort();
          const allRoleGapItems = Object.values(clusters).flatMap(c => Object.values(c).flat());
          const totalRoleGaps = allRoleGapItems.length;
          const roleCountFocus    = allRoleGapItems.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "focus").length;
          const roleCountBuilding = allRoleGapItems.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "building").length;
          const roleCountOntrack  = allRoleGapItems.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "ontrack").length;
          const isRoleOpen = openFolders[`role-${roleId}`] ?? false;

          return (
            <Collapsible
              key={roleId}
              open={isRoleOpen}
              onOpenChange={(v) => setOpenFolders(prev => ({ ...prev, [`role-${roleId}`]: v }))}
            >
              <CollapsibleTrigger asChild>
                <Card className="bg-card/80 border-border/50 cursor-pointer hover-lift border-primary/20">
                  <CardContent className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-md bg-primary/15 shrink-0">
                        <FolderOpen className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{roleTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {sortedRoleClusters.length} Cluster · {totalRoleGaps} Kompetenzen
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {roleCountFocus > 0 && (
                          <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-500 border-amber-500/25">
                            {roleCountFocus}× Potenzial
                          </Badge>
                        )}
                        {roleCountBuilding > 0 && (
                          <Badge variant="outline" className="text-xs bg-sky-500/15 text-sky-400 border-sky-500/25">
                            {roleCountBuilding}× Wachstum
                          </Badge>
                        )}
                        {roleCountOntrack > 0 && (
                          <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-500 border-emerald-500/25">
                            {roleCountOntrack}× Stark
                          </Badge>
                        )}
                      </div>
                      {isRoleOpen
                        ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                        : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="mt-2 ml-5 space-y-2 border-l border-border/40 pl-4">
                  {sortedRoleClusters.map((clusterName) => {
                    const byComp = clusters[clusterName];
                    const clusterGaps = Object.values(byComp).flat();
                    const clusterFocus    = clusterGaps.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "focus").length;
                    const clusterBuilding = clusterGaps.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "building").length;
                    const clusterOntrack  = clusterGaps.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "ontrack").length;
                    const isClusterOpen = openFolders[`cluster-${roleId}-${clusterName}`] ?? false;

                    return (
                      <Collapsible
                        key={clusterName}
                        open={isClusterOpen}
                        onOpenChange={(v) => setOpenFolders(prev => ({ ...prev, [`cluster-${roleId}-${clusterName}`]: v }))}
                      >
                        <CollapsibleTrigger asChild>
                          <Card className="bg-card/80 border-border/50 cursor-pointer hover-lift">
                            <CardContent className="py-2.5 px-4">
                              <div className="flex items-center gap-3">
                                <Folder className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                <span className="text-sm text-foreground flex-1 truncate">{clusterName}</span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {clusterFocus > 0 && (
                                    <Badge variant="outline" className="text-xs bg-amber-500/15 text-amber-500 border-amber-500/25">
                                      {clusterFocus}× Potenzial
                                    </Badge>
                                  )}
                                  {clusterBuilding > 0 && (
                                    <Badge variant="outline" className="text-xs bg-sky-500/15 text-sky-400 border-sky-500/25">
                                      {clusterBuilding}× Wachstum
                                    </Badge>
                                  )}
                                  {clusterOntrack > 0 && (
                                    <Badge variant="outline" className="text-xs bg-emerald-500/15 text-emerald-500 border-emerald-500/25">
                                      {clusterOntrack}× Stark
                                    </Badge>
                                  )}
                                </div>
                                {isClusterOpen
                                  ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                  : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                              </div>
                            </CardContent>
                          </Card>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="mt-2 ml-4 space-y-4 border-l border-border/30 pl-4">
                            {Object.entries(byComp).map(([compId, gaps]) => {
                              const compName = gaps[0]?.competencyName ?? "";
                              return (
                                <div key={compId} className="space-y-2">
                                  <p className="text-xs font-medium text-muted-foreground">
                                    {compName}
                                    <span className="ml-1 opacity-50">({gaps.length})</span>
                                  </p>
                                  <ScrollArea className="w-full whitespace-nowrap">
                                    <div className="flex gap-3 pb-3">
                                      {gaps.map((gap, idx) => (
                                        <SkillGapCardDb
                                          key={`${gap.employee.id}-${gap.competencyId}`}
                                          employee={{ id: gap.employee.id, full_name: gap.employee.full_name, role_profile: gap.employee.role_profile }}
                                          competency={{ id: gap.competencyId, name: gap.competencyName, currentLevel: gap.currentLevel, demandedLevel: gap.demandedLevel, futureLevel: gap.futureLevel }}
                                          delay={idx * 30}
                                        />
                                      ))}
                                    </div>
                                    <ScrollBar orientation="horizontal" />
                                  </ScrollArea>
                                </div>
                              );
                            })}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>

      {/* Empty state */}
      {totalGaps === 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">
              {hasFilters ? "Keine Gaps für diese Filter" : "Keine Skill Gaps erkannt"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {hasFilters ? "Filter anpassen oder zurücksetzen." : "Alle Mitarbeiter erfüllen ihre Kompetenzanforderungen."}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={clearFilters}>
                <X className="w-3 h-3" />Filter zurücksetzen
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SkillGapPage;
