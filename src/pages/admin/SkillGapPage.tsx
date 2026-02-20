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
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEmployees } from "@/hooks/useOrgData";
import {
  AlertTriangle, TrendingDown, Users, FileQuestion, Search, X,
  Folder, LayoutGrid, List, Columns2, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// DB Employee Type (from useEmployees hook)
interface DbEmployee {
  id: string;
  full_name: string;
  overall_score: number | null;
  avatar_url: string | null;
  role_profile: {
    id: string;
    role_title: string;
    role_key: string;
  } | null;
  team: {
    id: string;
    name: string;
  } | null;
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
      cluster: {
        name: string;
      } | null;
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

type ViewMode = "folder" | "grid2" | "grid4" | "list";

function getSeverityLabel(weightedGap: number) {
  if (weightedGap >= 30) return "critical";
  if (weightedGap >= 15) return "high";
  return "moderate";
}

const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>("folder");
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({});

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCluster, setFilterCluster] = useState("all");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterRole, setFilterRole] = useState("all");

  // Calculate all skill gaps
  const allGaps = useMemo<EmployeeGap[]>(() => {
    if (!employees || employees.length === 0) return [];
    const gaps: EmployeeGap[] = [];

    (employees as DbEmployee[]).forEach((emp) => {
      (emp.competencies || []).forEach((comp) => {
        const currentLevel = comp.current_level || 0;
        const demandedLevel = comp.demanded_level || 0;
        const futureLevel = comp.future_level || 0;
        const currentGap = demandedLevel - currentLevel;
        const futureGap = futureLevel - currentLevel;
        const weightedGap = currentGap * 0.4 + futureGap * 0.6;

        if (weightedGap >= 10 && comp.competency) {
          gaps.push({
            employee: emp,
            competencyId: comp.competency.id,
            competencyName: comp.competency.name,
            clusterName: comp.competency.cluster?.name || "Other",
            currentLevel,
            demandedLevel,
            futureLevel,
            weightedGap,
          });
        }
      });
    });

    return gaps;
  }, [employees]);

  // Unique filter options
  const uniqueClusters = useMemo(() => [...new Set(allGaps.map(g => g.clusterName))].sort(), [allGaps]);
  const uniqueEmployees = useMemo(() => {
    const map = new Map<string, string>();
    allGaps.forEach(g => map.set(g.employee.id, g.employee.full_name));
    return [...map.entries()].sort(([, a], [, b]) => a.localeCompare(b));
  }, [allGaps]);
  const uniqueRoles = useMemo(() => {
    const map = new Map<string, string>();
    allGaps.forEach(g => {
      if (g.employee.role_profile) map.set(g.employee.role_profile.id, g.employee.role_profile.role_title);
    });
    return [...map.entries()].sort(([, a], [, b]) => a.localeCompare(b));
  }, [allGaps]);

  // Filtered gaps
  const filteredGaps = useMemo(() => {
    return allGaps.filter(g => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!g.employee.full_name.toLowerCase().includes(q) && !g.competencyName.toLowerCase().includes(q)) return false;
      }
      if (filterCluster !== "all" && g.clusterName !== filterCluster) return false;
      if (filterSeverity !== "all" && getSeverityLabel(g.weightedGap) !== filterSeverity) return false;
      if (filterEmployee !== "all" && g.employee.id !== filterEmployee) return false;
      if (filterRole !== "all" && g.employee.role_profile?.id !== filterRole) return false;
      return true;
    });
  }, [allGaps, searchQuery, filterCluster, filterSeverity, filterEmployee, filterRole]);

  const hasActiveFilters = filterCluster !== "all" || filterSeverity !== "all" || filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";
  const clearFilters = () => {
    setSearchQuery("");
    setFilterCluster("all");
    setFilterSeverity("all");
    setFilterEmployee("all");
    setFilterRole("all");
  };

  // Stats (of filtered)
  const totalGaps = filteredGaps.length;
  const criticalGaps = filteredGaps.filter(g => g.weightedGap >= 30).length;
  const affectedEmployees = new Set(filteredGaps.map(g => g.employee.id)).size;

  // Group by cluster
  const gapsByCategory = useMemo(() => {
    const grouped: Record<string, EmployeeGap[]> = {};
    filteredGaps.forEach(g => {
      if (!grouped[g.clusterName]) grouped[g.clusterName] = [];
      grouped[g.clusterName].push(g);
    });
    Object.keys(grouped).forEach(cat => grouped[cat].sort((a, b) => b.weightedGap - a.weightedGap));
    return grouped;
  }, [filteredGaps]);

  const sortedCategories = Object.keys(gapsByCategory).sort();

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <Skeleton className="h-10 w-64 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-80 rounded-xl" />)}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <p className="text-foreground">Fehler beim Laden der Daten</p>
              <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
            </GlassCardContent>
          </GlassCard>
        </main>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────────
  if (!employees || employees.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <main className="container py-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />Skill Gap Detector
          </h1>
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <FileQuestion className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground font-medium">Keine Mitarbeiter vorhanden</p>
              <p className="text-sm text-muted-foreground mt-2">Fügen Sie zuerst Mitarbeiter hinzu, um Skill-Gaps zu analysieren.</p>
            </GlassCardContent>
          </GlassCard>
        </main>
      </div>
    );
  }

  const viewButtons: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: "folder", icon: <Folder className="w-4 h-4" />, label: "Ordner (nach Cluster)" },
    { mode: "grid2", icon: <Columns2 className="w-4 h-4" />, label: "2 pro Reihe" },
    { mode: "grid4", icon: <LayoutGrid className="w-4 h-4" />, label: "4 pro Reihe" },
    { mode: "list", icon: <List className="w-4 h-4" />, label: "Kompakte Liste" },
  ];

  const renderGapCards = (gaps: EmployeeGap[], wrapperClass = "") => (
    <div className={wrapperClass}>
      {gaps.map((gap, idx) => (
        <SkillGapCardDb
          key={`${gap.employee.id}-${gap.competencyId}`}
          employee={{ id: gap.employee.id, full_name: gap.employee.full_name, role_profile: gap.employee.role_profile }}
          competency={{ id: gap.competencyId, name: gap.competencyName, currentLevel: gap.currentLevel, demandedLevel: gap.demandedLevel, futureLevel: gap.futureLevel }}
          delay={idx * 50}
        />
      ))}
    </div>
  );

  // Compact row card for list view
  const CompactGapRow = ({ gap }: { gap: EmployeeGap }) => {
    const severity = getSeverityLabel(gap.weightedGap);
    const severityClass = severity === "critical"
      ? "bg-destructive/20 text-destructive border-destructive/30"
      : severity === "high"
      ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";

    return (
      <GlassCard className="hover-lift">
        <GlassCardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
              {gap.employee.full_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0 grid grid-cols-3 gap-2 items-center">
              <div className="min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{gap.employee.full_name}</p>
                <p className="text-xs text-muted-foreground truncate">{gap.employee.role_profile?.role_title || "—"}</p>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-foreground truncate">{gap.competencyName}</p>
                <p className="text-xs text-muted-foreground truncate">{gap.clusterName}</p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <Badge variant="outline" className={cn("text-xs", severityClass)}>
                  {severity === "critical" ? "Kritisch" : severity === "high" ? "Hoch" : "Moderat"}
                </Badge>
                <span className="text-xs font-semibold text-destructive">-{Math.round(gap.weightedGap)}%</span>
              </div>
            </div>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />
      <main className="container py-8">
        {/* Title */}
        <ScrollReveal>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3 mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
            Skill Gap Detector
          </h1>
        </ScrollReveal>

        {/* Stats Overview */}
        <ScrollReveal delay={80}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <GlassCard>
              <GlassCardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-destructive/20">
                  <TrendingDown className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalGaps}</p>
                  <p className="text-sm text-muted-foreground">Skill Gaps gesamt</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            <GlassCard>
              <GlassCardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-orange-500/20">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{criticalGaps}</p>
                  <p className="text-sm text-muted-foreground">Kritische Gaps</p>
                </div>
              </GlassCardContent>
            </GlassCard>
            <GlassCard>
              <GlassCardContent className="py-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{affectedEmployees}</p>
                  <p className="text-sm text-muted-foreground">Betroffene Mitarbeiter</p>
                </div>
              </GlassCardContent>
            </GlassCard>
          </div>
        </ScrollReveal>

        {/* Search + View Switcher */}
        <ScrollReveal delay={120}>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Suchen nach Mitarbeiter oder Kompetenz..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {/* View mode buttons */}
            <div className="flex gap-1 bg-secondary/30 rounded-lg p-1">
              {viewButtons.map(({ mode, icon, label }) => (
                <TooltipProvider key={mode}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === mode ? "default" : "ghost"}
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => setViewMode(mode)}
                      >
                        {icon}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>{label}</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Filters */}
        <ScrollReveal delay={150}>
          <div className="flex flex-wrap gap-2 mb-6">
            <Select value={filterCluster} onValueChange={setFilterCluster}>
              <SelectTrigger className="w-48 h-8 text-xs">
                <SelectValue placeholder="Cluster" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Cluster</SelectItem>
                {uniqueClusters.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Schweregrad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Schweregrade</SelectItem>
                <SelectItem value="critical">Kritisch (≥30)</SelectItem>
                <SelectItem value="high">Hoch (15–29)</SelectItem>
                <SelectItem value="moderate">Moderat (&lt;15)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterEmployee} onValueChange={setFilterEmployee}>
              <SelectTrigger className="w-52 h-8 text-xs">
                <SelectValue placeholder="Mitarbeiter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Mitarbeiter</SelectItem>
                {uniqueEmployees.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-52 h-8 text-xs">
                <SelectValue placeholder="Rolle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Rollen</SelectItem>
                {uniqueRoles.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs text-muted-foreground" onClick={clearFilters}>
                <X className="w-3 h-3" />Filter zurücksetzen
              </Button>
            )}

            <span className="text-xs text-muted-foreground self-center ml-auto">
              {totalGaps} Gaps
            </span>
          </div>
        </ScrollReveal>

        {/* Legend */}
        <ScrollReveal delay={170}>
          <div className="flex flex-wrap gap-4 mb-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-primary/60" />
              <span className="text-muted-foreground">Aktuelles Niveau</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-foreground/70" />
              <span className="text-muted-foreground">Gefordert</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-primary" />
              <span className="text-muted-foreground">Zukünftig gefordert</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Folder View (by cluster/competency) ───────────────────────────── */}
        {viewMode === "folder" && (
          <div className="space-y-3">
            {sortedCategories.map((category) => {
              const categoryGaps = gapsByCategory[category];
              if (!categoryGaps?.length) return null;

              const byCompetency: Record<string, EmployeeGap[]> = {};
              categoryGaps.forEach(g => {
                if (!byCompetency[g.competencyId]) byCompetency[g.competencyId] = [];
                byCompetency[g.competencyId].push(g);
              });

              const isOpen = openFolders[category] ?? false;
              const critCount = categoryGaps.filter(g => g.weightedGap >= 30).length;

              return (
                <Collapsible
                  key={category}
                  open={isOpen}
                  onOpenChange={(v) => setOpenFolders(prev => ({ ...prev, [category]: v }))}
                >
                  <CollapsibleTrigger asChild>
                    <GlassCard className="cursor-pointer hover-lift">
                      <GlassCardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Folder className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-foreground">{category}</p>
                            <p className="text-xs text-muted-foreground">
                              {categoryGaps.length} Gaps · {Object.keys(byCompetency).length} Kompetenzen
                            </p>
                          </div>
                          {critCount > 0 && (
                            <Badge variant="outline" className="text-xs bg-destructive/20 text-destructive border-destructive/30">
                              {critCount} kritisch
                            </Badge>
                          )}
                          <Badge variant="secondary">{categoryGaps.length}</Badge>
                          {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="mt-3 ml-6 space-y-4">
                      {Object.entries(byCompetency).map(([competencyId, gaps]) => {
                        const firstGap = gaps[0];
                        if (!firstGap) return null;
                        return (
                          <div key={competencyId} className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground pl-2">
                              {firstGap.competencyName} <span className="opacity-60">({gaps.length} Gaps)</span>
                            </h3>
                            <ScrollArea className="w-full whitespace-nowrap">
                              <div className="flex gap-4 pb-4">
                                {gaps.map((gap, idx) => (
                                  <SkillGapCardDb
                                    key={`${gap.employee.id}-${gap.competencyId}`}
                                    employee={{ id: gap.employee.id, full_name: gap.employee.full_name, role_profile: gap.employee.role_profile }}
                                    competency={{ id: gap.competencyId, name: gap.competencyName, currentLevel: gap.currentLevel, demandedLevel: gap.demandedLevel, futureLevel: gap.futureLevel }}
                                    delay={idx * 50}
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

        {/* ── Grid 2 View ─────────────────────────────────────────────────────── */}
        {viewMode === "grid2" && renderGapCards(filteredGaps, "grid md:grid-cols-2 gap-4")}

        {/* ── Grid 4 View ─────────────────────────────────────────────────────── */}
        {viewMode === "grid4" && renderGapCards(filteredGaps, "grid sm:grid-cols-2 lg:grid-cols-4 gap-3")}

        {/* ── List View ────────────────────────────────────────────────────────── */}
        {viewMode === "list" && (
          <div className="space-y-2">
            {filteredGaps.map(gap => (
              <CompactGapRow key={`${gap.employee.id}-${gap.competencyId}`} gap={gap} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {totalGaps === 0 && (
          <GlassCard>
            <GlassCardContent className="py-12 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-foreground">Keine signifikanten Skill Gaps erkannt</p>
              <p className="text-sm text-muted-foreground mt-2">
                {hasActiveFilters ? "Keine Gaps entsprechen den gewählten Filtern." : "Alle Mitarbeiter erfüllen oder übertreffen ihre Kompetenzanforderungen"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" className="mt-4" onClick={clearFilters}>
                  <X className="w-3 h-3 mr-2" />Filter zurücksetzen
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
