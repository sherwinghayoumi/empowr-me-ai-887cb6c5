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
  AlertTriangle, TrendingDown, Users, FileQuestion,
  Search, X, Folder, FolderOpen, LayoutGrid, List, Columns2,
  ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

type ViewMode = "role-folder" | "folder" | "grid2" | "grid4" | "list";

function getSeverityLabel(weightedGap: number): "critical" | "high" | "moderate" {
  if (weightedGap >= 30) return "critical";
  if (weightedGap >= 15) return "high";
  return "moderate";
}

const severityMeta = {
  critical: { label: "Kritisch", dot: "bg-destructive", badge: "bg-destructive/15 text-destructive border-destructive/25" },
  high:     { label: "Hoch",     dot: "bg-orange-500", badge: "bg-orange-500/15 text-orange-400 border-orange-500/25" },
  moderate: { label: "Moderat",  dot: "bg-yellow-500", badge: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25" },
};

// ── Compact list row ──────────────────────────────────────────────────────────
function GapListRow({ gap }: { gap: EmployeeGap }) {
  const sev = getSeverityLabel(gap.weightedGap);
  const meta = severityMeta[sev];
  return (
    <GlassCard>
      <GlassCardContent className="px-4 py-3">
        <div className="flex items-center gap-4">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
            {gap.employee.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <div className="flex-1 min-w-0 grid grid-cols-3 gap-x-4 items-center">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{gap.employee.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{gap.employee.role_profile?.role_title || "—"}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-foreground truncate">{gap.competencyName}</p>
              <p className="text-xs text-muted-foreground truncate">{gap.clusterName}</p>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <Badge variant="outline" className={cn("text-xs shrink-0", meta.badge)}>
                <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", meta.dot)} />
                {meta.label}
              </Badge>
              <span className="text-xs font-semibold text-destructive shrink-0">−{Math.round(gap.weightedGap)}%</span>
            </div>
          </div>
        </div>
      </GlassCardContent>
    </GlassCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();

  const [viewMode, setViewMode] = useState<ViewMode>("role-folder");
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
  const uniqueClusters   = useMemo(() => [...new Set(allGaps.map(g => g.clusterName))].sort(), [allGaps]);
  const uniqueEmployees  = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => m.set(g.employee.id, g.employee.full_name)); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);
  const uniqueRoles      = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => { if (g.employee.role_profile) m.set(g.employee.role_profile.id, g.employee.role_profile.role_title); }); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);

  const filteredGaps = useMemo(() => allGaps.filter(g => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!g.employee.full_name.toLowerCase().includes(q) && !g.competencyName.toLowerCase().includes(q)) return false;
    }
    if (filterCluster  !== "all" && g.clusterName !== filterCluster) return false;
    if (filterSeverity !== "all" && getSeverityLabel(g.weightedGap) !== filterSeverity) return false;
    if (filterEmployee !== "all" && g.employee.id !== filterEmployee) return false;
    if (filterRole     !== "all" && g.employee.role_profile?.id !== filterRole) return false;
    return true;
  }), [allGaps, searchQuery, filterCluster, filterSeverity, filterEmployee, filterRole]);

  const hasFilters = filterCluster !== "all" || filterSeverity !== "all" || filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";
  const clearFilters = () => { setSearchQuery(""); setFilterCluster("all"); setFilterSeverity("all"); setFilterEmployee("all"); setFilterRole("all"); };

  // Stats (live on filtered)
  const totalGaps        = filteredGaps.length;
  const criticalCount    = filteredGaps.filter(g => g.weightedGap >= 30).length;
  const affectedCount    = new Set(filteredGaps.map(g => g.employee.id)).size;

  // Group by cluster (for "folder" view)
  const grouped = useMemo(() => {
    const map: Record<string, EmployeeGap[]> = {};
    filteredGaps.forEach(g => { (map[g.clusterName] ??= []).push(g); });
    Object.values(map).forEach(arr => arr.sort((a, b) => b.weightedGap - a.weightedGap));
    return map;
  }, [filteredGaps]);
  const sortedClusters = Object.keys(grouped).sort();

  // Group by role → cluster → competency (for "role-folder" view)
  // Each role shows only gaps for employees with that role.
  // Clusters that appear in multiple roles are duplicated per role.
  const groupedByRole = useMemo(() => {
    // roleId -> { roleTitle, clusters: { clusterName -> { compId -> EmployeeGap[] } } }
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

    // Sort competency gaps within each cluster by weightedGap desc
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

  // ── States ────────────────────────────────────────────────────────────────
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

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "role-folder", icon: <FolderOpen className="w-3.5 h-3.5" />, label: "Rollen" },
    { mode: "folder",      icon: <Folder className="w-3.5 h-3.5" />,     label: "Cluster" },
    { mode: "grid2",       icon: <Columns2 className="w-3.5 h-3.5" />,   label: "2 Spalten" },
    { mode: "grid4",       icon: <LayoutGrid className="w-3.5 h-3.5" />, label: "4 Spalten" },
    { mode: "list",        icon: <List className="w-3.5 h-3.5" />,       label: "Liste" },
  ];

  const renderCards = (gaps: EmployeeGap[], cls: string) => (
    <div className={cls}>
      {gaps.map((gap, idx) => (
        <SkillGapCardDb
          key={`${gap.employee.id}-${gap.competencyId}`}
          employee={{ id: gap.employee.id, full_name: gap.employee.full_name, role_profile: gap.employee.role_profile }}
          competency={{ id: gap.competencyId, name: gap.competencyName, currentLevel: gap.currentLevel, demandedLevel: gap.demandedLevel, futureLevel: gap.futureLevel }}
          delay={idx * 30}
        />
      ))}
    </div>
  );

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
                <div className="p-2 rounded-lg bg-destructive/15">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{totalGaps}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Gaps gesamt</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            <GlassCard>
              <GlassCardContent className="py-3 px-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/15">
                  <AlertTriangle className="w-4 h-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground leading-none">{criticalCount}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Kritisch</p>
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

        {/* ── Search + View switcher ── */}
        <ScrollReveal delay={100}>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Mitarbeiter oder Kompetenz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            {/* View buttons */}
            <div className="flex gap-0.5 bg-secondary/30 rounded-lg p-1 h-9 shrink-0">
              {viewButtons.map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  title={label}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 rounded-md text-xs font-medium transition-colors",
                    viewMode === mode
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
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
              <SelectTrigger className="h-8 w-36 text-xs"><SelectValue placeholder="Schweregrad" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="critical">Kritisch ≥30</SelectItem>
                <SelectItem value="high">Hoch 15–29</SelectItem>
                <SelectItem value="moderate">Moderat &lt;15</SelectItem>
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

        {/* ── Legend (compact) ── */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded bg-primary/50 inline-block" />Ist-Niveau</span>
          <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-foreground/50 inline-block" />Soll</span>
          <span className="flex items-center gap-1.5"><span className="w-px h-3 bg-primary inline-block" />Ziel</span>
        </div>

        {/* ── Content ── */}

        {/* Role-folder view (Rolle → Cluster → Kompetenz) */}
        {viewMode === "role-folder" && (
          <div className="space-y-3">
            {sortedRoles.map((roleId) => {
              const roleData = groupedByRole[roleId];
              if (!roleData) return null;
              const { roleTitle, clusters } = roleData;
              const sortedRoleClusters = Object.keys(clusters).sort();
              const totalRoleGaps = Object.values(clusters).flatMap(c => Object.values(c).flat()).length;
              const critRoleGaps  = Object.values(clusters).flatMap(c => Object.values(c).flat()).filter(g => g.weightedGap >= 30).length;
              const isRoleOpen = openFolders[`role-${roleId}`] ?? false;

              return (
                <Collapsible
                  key={roleId}
                  open={isRoleOpen}
                  onOpenChange={(v) => setOpenFolders(prev => ({ ...prev, [`role-${roleId}`]: v }))}
                >
                  {/* Role header */}
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
                              {sortedRoleClusters.length} Cluster · {totalRoleGaps} Gaps
                            </p>
                          </div>
                          {critRoleGaps > 0 && (
                            <Badge variant="outline" className="text-xs bg-destructive/15 text-destructive border-destructive/25 shrink-0">
                              {critRoleGaps}× kritisch
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs shrink-0">{totalRoleGaps}</Badge>
                          {isRoleOpen
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </CollapsibleTrigger>

                  {/* Role content: cluster sub-folders */}
                  <CollapsibleContent>
                    <div className="mt-2 ml-5 space-y-2 border-l border-border/40 pl-4">
                      {sortedRoleClusters.map((clusterName) => {
                        const byComp = clusters[clusterName];
                        const clusterGaps = Object.values(byComp).flat();
                        const critInCluster = clusterGaps.filter(g => g.weightedGap >= 30).length;
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
                                    {critInCluster > 0 && (
                                      <Badge variant="outline" className="text-xs bg-destructive/15 text-destructive border-destructive/25">
                                        {critInCluster}× kritisch
                                      </Badge>
                                    )}
                                    <Badge variant="secondary" className="text-xs">{clusterGaps.length}</Badge>
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
        )}

        {/* Cluster-folder view */}
        {viewMode === "folder" && (
          <div className="space-y-2">
            {sortedClusters.map((cluster) => {
              const clusterGaps = grouped[cluster] || [];
              if (!clusterGaps.length) return null;

              // group by competency inside cluster
              const byComp: Record<string, EmployeeGap[]> = {};
              clusterGaps.forEach(g => { (byComp[g.competencyId] ??= []).push(g); });

              const isOpen = openFolders[cluster] ?? false;
              const critInCluster = clusterGaps.filter(g => g.weightedGap >= 30).length;

              return (
                <Collapsible
                  key={cluster}
                  open={isOpen}
                  onOpenChange={(v) => setOpenFolders(prev => ({ ...prev, [cluster]: v }))}
                >
                  <CollapsibleTrigger asChild>
                    <GlassCard className="cursor-pointer hover-lift">
                      <GlassCardContent className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Folder className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-medium text-foreground text-sm flex-1">{cluster}</span>
                          {critInCluster > 0 && (
                            <Badge variant="outline" className="text-xs bg-destructive/15 text-destructive border-destructive/25">
                              {critInCluster}× kritisch
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">{clusterGaps.length}</Badge>
                          {isOpen
                            ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                            : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />}
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-2 ml-5 space-y-4 border-l border-border/40 pl-4">
                      {Object.entries(byComp).map(([compId, gaps]) => {
                        const name = gaps[0]?.competencyName ?? "";
                        return (
                          <div key={compId} className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">
                              {name}
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
        )}

        {/* Grid 2 */}
        {viewMode === "grid2" && renderCards(filteredGaps, "grid md:grid-cols-2 gap-3")}

        {/* Grid 4 */}
        {viewMode === "grid4" && renderCards(filteredGaps, "grid sm:grid-cols-2 lg:grid-cols-4 gap-3")}

        {/* List */}
        {viewMode === "list" && (
          <div className="space-y-1.5">
            {filteredGaps.map(gap => (
              <GapListRow key={`${gap.employee.id}-${gap.competencyId}`} gap={gap} />
            ))}
          </div>
        )}

        {/* Empty */}
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
