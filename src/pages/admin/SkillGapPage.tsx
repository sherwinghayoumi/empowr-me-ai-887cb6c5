import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SkillGapCardDb } from "@/components/SkillGapCardDb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEmployees } from "@/hooks/useOrgData";
import {
  AlertTriangle, TrendingUp, Users, FileQuestion,
  Search, X, Folder, FolderOpen,
  ChevronDown, ChevronRight, Target,
} from "lucide-react";

interface DbEmployee {
  id: string;
  full_name: string;
  overall_score: number | null;
  avatar_url: string | null;
  role_profile: { id: string; role_title: string; role_key: string } | null;
  team: { id: string; name: string } | null;
  competencies: Array<{
    id: string;
    current_level: number | null;
    demanded_level: number | null;
    future_level: number | null;
    gap_to_current: number | null;
    competency: {
      id: string;
      name: string;
      status: string | null;
      cluster: { name: string } | null;
    } | null;
  }>;
}

interface EmployeeGap {
  employee: DbEmployee;
  competencyId: string;
  competencyName: string;
  clusterName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  weightedGap: number;
}

function getGapRatio(weightedGap: number, demandedLevel: number): number {
  return demandedLevel > 0 ? weightedGap / demandedLevel : 0;
}

function getSeverityLabel(weightedGap: number, demandedLevel: number): "focus" | "building" | "ontrack" {
  const ratio = getGapRatio(weightedGap, demandedLevel);
  if (ratio >= 0.5) return "focus";
  if (ratio >= 0.25) return "building";
  return "ontrack";
}

// ── Main page ─────────────────────────────────────────────────────────────────
const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();

  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // Build all gaps
  const allGaps = useMemo<EmployeeGap[]>(() => {
    if (!employees?.length) return [];
    const gaps: EmployeeGap[] = [];
    (employees as DbEmployee[]).forEach((emp) => {
      (emp.competencies || []).forEach((comp) => {
        const cur = comp.current_level ?? 0;
        const dem = comp.demanded_level ?? 0;
        const fut = comp.future_level ?? 0;
        const weighted = (dem - cur) * 0.4 + (fut - cur) * 0.6;
        if (weighted >= 10 && comp.competency) {
          gaps.push({
            employee: emp,
            competencyId: comp.competency.id,
            competencyName: comp.competency.name,
            clusterName: comp.competency.cluster?.name || "Sonstige",
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

  // Filter options
  const uniqueClusters  = useMemo(() => [...new Set(allGaps.map(g => g.clusterName))].sort(), [allGaps]);
  const uniqueEmployees = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => m.set(g.employee.id, g.employee.full_name)); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);
  const uniqueRoles     = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => { if (g.employee.role_profile) m.set(g.employee.role_profile.id, g.employee.role_profile.role_title); }); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);

  const filteredGaps = useMemo(() => allGaps.filter(g => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!g.employee.full_name.toLowerCase().includes(q) && !g.competencyName.toLowerCase().includes(q)) return false;
    }
    if (filterCluster  !== "all" && g.clusterName !== filterCluster) return false;
    if (filterSeverity !== "all" && getSeverityLabel(g.weightedGap, g.demandedLevel) !== filterSeverity) return false;
    if (filterEmployee !== "all" && g.employee.id !== filterEmployee) return false;
    if (filterRole     !== "all" && g.employee.role_profile?.id !== filterRole) return false;
    return true;
  }), [allGaps, searchQuery, filterCluster, filterSeverity, filterEmployee, filterRole]);

  const hasFilters = filterCluster !== "all" || filterSeverity !== "all" || filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";
  const clearFilters = () => { setSearchQuery(""); setFilterCluster("all"); setFilterSeverity("all"); setFilterEmployee("all"); setFilterRole("all"); };

  // Stats
  const totalGaps     = filteredGaps.length;
  const focusCount    = filteredGaps.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "focus").length;
  const affectedCount = new Set(filteredGaps.map(g => g.employee.id)).size;

  // Group by role → cluster → competency
  const groupedByRole = useMemo(() => {
    const roleMap: Record<string, {
      roleTitle: string;
      clusters: Record<string, Record<string, EmployeeGap[]>>;
    }> = {};

    filteredGaps.forEach(g => {
      const roleId = g.employee.role_profile?.id ?? "__none__";
      const roleTitle = g.employee.role_profile?.role_title ?? "Ohne Rolle";

      if (!roleMap[roleId]) roleMap[roleId] = { roleTitle, clusters: {} };
      const roleBucket = roleMap[roleId].clusters;

      if (!roleBucket[g.clusterName]) roleBucket[g.clusterName] = {};
      const clusterBucket = roleBucket[g.clusterName];

      if (!clusterBucket[g.competencyId]) clusterBucket[g.competencyId] = [];
      clusterBucket[g.competencyId].push(g);
    });

    Object.values(roleMap).forEach(role => {
      Object.values(role.clusters).forEach(cluster => {
        Object.values(cluster).forEach(arr => arr.sort((a, b) => b.weightedGap - a.weightedGap));
      });
    });

    return roleMap;
  }, [filteredGaps]);

  const sortedRoles = Object.keys(groupedByRole).sort((a, b) =>
    groupedByRole[a].roleTitle.localeCompare(groupedByRole[b].roleTitle)
  );

  // ── Loading / Error / Empty states ───────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8 space-y-6">
          <Skeleton className="h-9 w-56" />
          <div className="grid grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
          <Skeleton className="h-10 w-full max-w-sm" />
          {[1,2].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <GlassCard><GlassCardContent className="py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </GlassCardContent></GlassCard>
        </main>
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <h1 className="text-2xl font-bold text-foreground mb-6">Skill Gap Analyse</h1>
          <GlassCard><GlassCardContent className="py-12 text-center">
            <FileQuestion className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Keine Mitarbeiter vorhanden</p>
            <p className="text-sm text-muted-foreground mt-1">Legen Sie zuerst Mitarbeiter an.</p>
          </GlassCardContent></GlassCard>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8 space-y-6">

        {/* ── Title ── */}
        <ScrollReveal>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Skill Gap Analyse</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Kompetenzlücken erkennen und gezielte Lernpfade einleiten</p>
          </div>
        </ScrollReveal>

        {/* ── Stats ── */}
        <ScrollReveal delay={60}>
          <div className="grid grid-cols-3 gap-3">
            <GlassCard>
              <GlassCardContent className="py-3 px-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/15">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{totalGaps}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Entwicklungsbereiche</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            <GlassCard>
              <GlassCardContent className="py-3 px-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/15">
                  <Target className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{focusCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Großes Potenzial</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            <GlassCard>
              <GlassCardContent className="py-3 px-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/15">
                  <Users className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{affectedCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Mitarbeiter</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </ScrollReveal>

        {/* ── Search ── */}
        <ScrollReveal delay={100}>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Mitarbeiter oder Kompetenz..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </ScrollReveal>

        {/* ── Filters ── */}
        <ScrollReveal delay={130}>
          <div className="flex flex-wrap gap-2 items-center">
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
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3 h-3" />zurücksetzen
              </button>
            )}

            <span className="text-xs text-muted-foreground ml-auto">{totalGaps} Gaps</span>
          </div>
        </ScrollReveal>

        {/* ── Legend ── */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-primary/50 inline-block" />Ist-Niveau</span>
          <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-foreground/50 inline-block" />Soll</span>
          <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-primary inline-block" />Ziel</span>
        </div>

        {/* ── Role-folder view (Rolle → Cluster → Kompetenz) ── */}
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
                  <GlassCard className="cursor-pointer hover-lift border-primary/20">
                    <GlassCardContent className="py-3.5 px-4">
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
                    </GlassCardContent>
                  </GlassCard>
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
                            <GlassCard className="cursor-pointer hover-lift">
                              <GlassCardContent className="py-2.5 px-4">
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
                              </GlassCardContent>
                            </GlassCard>
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

        {/* ── Empty state ── */}
        {totalGaps === 0 && (
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
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
            </GlassCardContent>
          </GlassCard>
        )}
      </main>
    </div>
  );
};

export default SkillGapPage;
