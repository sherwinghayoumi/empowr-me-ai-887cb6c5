import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle, TrendingUp, Users, FileQuestion,
  Search, X, Target, Sparkles, Loader2, ShieldAlert, Info, CheckCircle2,
  LayoutList, Layers, ChevronDown, Briefcase,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────

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

interface CurrentGapRow {
  employee: DbEmployee;
  competencyId: string;
  competencyName: string;
  clusterName: string;
  currentLevel: number;
  demandedLevel: number;
  gap: number;
}

interface FutureRiskRow {
  employee: DbEmployee;
  competencyId: string;
  competencyName: string;
  clusterName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  risk: number;
}

const GAP_TOLERANCE = 10;

// ─── Severity helpers ───────────────────────────────

type GapSeverity = "critical" | "watch" | "minor";
type RiskSeverity = "high" | "medium" | "low";

function getGapSeverity(gap: number): GapSeverity {
  if (gap >= 40) return "critical";
  if (gap >= 20) return "watch";
  return "minor";
}

function getRiskSeverity(risk: number): RiskSeverity {
  if (risk >= 40) return "high";
  if (risk >= 20) return "medium";
  return "low";
}

const gapBadgeClass: Record<GapSeverity, string> = {
  critical: "bg-[hsl(var(--severity-critical))]/15 text-[hsl(var(--severity-critical))]",
  watch: "bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]",
  minor: "bg-primary/15 text-primary",
};
const gapLabel: Record<GapSeverity, string> = { critical: "Handlungsbedarf", watch: "Fokus", minor: "Auf Kurs" };

const riskBadgeClass: Record<RiskSeverity, string> = {
  high: "bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]",
  medium: "bg-[hsl(45,75%,50%)]/15 text-[hsl(45,75%,50%)]",
  low: "bg-primary/15 text-primary",
};
const riskLabel: Record<RiskSeverity, string> = { high: "Hohes Risiko", medium: "Mittleres Risiko", low: "Geringes Risiko" };

// ─── Component ──────────────────────────────────────

const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterPracticeGroup, setFilterPracticeGroup] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("gaps");
  const [gapSortKey, setGapSortKey] = useState<'gap' | 'name' | 'employee'>('gap');
  const [gapSortAsc, setGapSortAsc] = useState(false);
  const [riskSortKey, setRiskSortKey] = useState<'risk' | 'name' | 'employee'>('risk');
  const [riskSortAsc, setRiskSortAsc] = useState(false);
  const [groupedView, setGroupedView] = useState(false);
  const [pgSummaryOpen, setPgSummaryOpen] = useState(false);

  // ─── Compute current gaps and future risks separately ─────

  const { currentGaps, futureRisks } = useMemo(() => {
    if (!employees?.length) return { currentGaps: [], futureRisks: [] };
    const gaps: CurrentGapRow[] = [];
    const risks: FutureRiskRow[] = [];

    (employees as DbEmployee[]).forEach((emp) => {
      (emp.competencies || []).filter(c => !c.is_deprecated && c.competency).forEach((comp) => {
        const cur = comp.current_level ?? 0;
        const dem = comp.demanded_level ?? 0;
        const fut = comp.future_level ?? 0;
        const currentGap = dem - cur;
        const futureRisk = fut - cur;

        if (currentGap > GAP_TOLERANCE) {
          gaps.push({
            employee: emp, competencyId: comp.competency!.id, competencyName: comp.competency!.name,
            clusterName: comp.competency!.cluster?.name || "Sonstige",
            currentLevel: cur, demandedLevel: dem, gap: currentGap,
          });
        }

        if (futureRisk > GAP_TOLERANCE && fut > dem && currentGap <= GAP_TOLERANCE) {
          risks.push({
            employee: emp, competencyId: comp.competency!.id, competencyName: comp.competency!.name,
            clusterName: comp.competency!.cluster?.name || "Sonstige",
            currentLevel: cur, demandedLevel: dem, futureLevel: fut, risk: futureRisk,
          });
        }
      });
    });
    return { currentGaps: gaps, futureRisks: risks };
  }, [employees]);

  // ─── Unique filter options ────────────────────────────────

  const allItems = useMemo(() => [...currentGaps.map(g => g.employee), ...futureRisks.map(r => r.employee)], [currentGaps, futureRisks]);
  const uniqueEmployees = useMemo(() => { const m = new Map<string,string>(); allItems.forEach(e => m.set(e.id, e.full_name)); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allItems]);
  const uniqueRoles = useMemo(() => { const m = new Map<string,string>(); allItems.forEach(e => { if (e.role_profile) m.set(e.role_profile.id, e.role_profile.role_title); }); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allItems]);
  const uniquePracticeGroups = useMemo(() => {
    const s = new Set<string>();
    (employees as DbEmployee[] | undefined)?.forEach(e => {
      if (e.role_profile?.practice_group) s.add(e.role_profile.practice_group);
    });
    return [...s].sort();
  }, [employees]);

  // ─── Filter helper ────────────────────────────────────────

  const matchesFilters = (emp: DbEmployee, compName: string) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!emp.full_name.toLowerCase().includes(q) && !compName.toLowerCase().includes(q)) return false;
    }
    if (filterEmployee !== "all" && emp.id !== filterEmployee) return false;
    if (filterRole !== "all" && emp.role_profile?.id !== filterRole) return false;
    if (filterPracticeGroup !== "all" && emp.role_profile?.practice_group !== filterPracticeGroup) return false;
    return true;
  };

  // ─── Filtered + sorted ───────────────────────────────────

  const filteredGaps = useMemo(() => {
    return currentGaps
      .filter(g => matchesFilters(g.employee, g.competencyName))
      .sort((a, b) => {
        let cmp = 0;
        if (gapSortKey === 'gap') cmp = a.gap - b.gap;
        else if (gapSortKey === 'name') cmp = a.competencyName.localeCompare(b.competencyName);
        else cmp = a.employee.full_name.localeCompare(b.employee.full_name);
        return gapSortAsc ? cmp : -cmp;
      });
  }, [currentGaps, searchQuery, filterEmployee, filterRole, filterPracticeGroup, gapSortKey, gapSortAsc]);

  const filteredRisks = useMemo(() => {
    return futureRisks
      .filter(r => matchesFilters(r.employee, r.competencyName))
      .sort((a, b) => {
        let cmp = 0;
        if (riskSortKey === 'risk') cmp = a.risk - b.risk;
        else if (riskSortKey === 'name') cmp = a.competencyName.localeCompare(b.competencyName);
        else cmp = a.employee.full_name.localeCompare(b.employee.full_name);
        return riskSortAsc ? cmp : -cmp;
      });
  }, [futureRisks, searchQuery, filterEmployee, filterRole, filterPracticeGroup, riskSortKey, riskSortAsc]);

  // ─── Grouped by practice group ────────────────────────────

  const groupedGaps = useMemo(() => {
    const map = new Map<string, CurrentGapRow[]>();
    filteredGaps.forEach(g => {
      const pg = g.employee.role_profile?.practice_group || "Ohne Practice Group";
      if (!map.has(pg)) map.set(pg, []);
      map.get(pg)!.push(g);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredGaps]);

  const groupedRiskRows = useMemo(() => {
    const map = new Map<string, FutureRiskRow[]>();
    filteredRisks.forEach(r => {
      const pg = r.employee.role_profile?.practice_group || "Ohne Practice Group";
      if (!map.has(pg)) map.set(pg, []);
      map.get(pg)!.push(r);
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [filteredRisks]);

  // ─── Practice Group Summary ───────────────────────────────

  const pgSummary = useMemo(() => {
    const map = new Map<string, { employees: Set<string>; totalCur: number; totalDem: number; countCur: number; gaps: number; risks: number }>();
    const ensure = (pg: string) => {
      if (!map.has(pg)) map.set(pg, { employees: new Set(), totalCur: 0, totalDem: 0, countCur: 0, gaps: 0, risks: 0 });
      return map.get(pg)!;
    };
    currentGaps.forEach(g => {
      const pg = g.employee.role_profile?.practice_group || "Ohne Practice Group";
      const s = ensure(pg);
      s.employees.add(g.employee.id);
      s.totalCur += g.currentLevel;
      s.totalDem += g.demandedLevel;
      s.countCur++;
      s.gaps++;
    });
    futureRisks.forEach(r => {
      const pg = r.employee.role_profile?.practice_group || "Ohne Practice Group";
      const s = ensure(pg);
      s.employees.add(r.employee.id);
      if (!s.countCur) { s.totalCur += r.currentLevel; s.totalDem += r.demandedLevel; s.countCur++; }
      s.risks++;
    });
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([pg, s]) => ({
      practiceGroup: pg,
      employeeCount: s.employees.size,
      avgCurrent: s.countCur ? Math.round(s.totalCur / s.countCur) : 0,
      avgDemanded: s.countCur ? Math.round(s.totalDem / s.countCur) : 0,
      gaps: s.gaps,
      risks: s.risks,
    }));
  }, [currentGaps, futureRisks]);

  // ─── KPI stats ────────────────────────────────────────────

  const gapStats = useMemo(() => ({
    total: filteredGaps.length,
    critical: filteredGaps.filter(g => getGapSeverity(g.gap) === "critical").length,
    affected: new Set(filteredGaps.map(g => g.employee.id)).size,
  }), [filteredGaps]);

  const riskStats = useMemo(() => ({
    total: filteredRisks.length,
    high: filteredRisks.filter(r => getRiskSeverity(r.risk) === "high").length,
    affected: new Set(filteredRisks.map(r => r.employee.id)).size,
  }), [filteredRisks]);

  const hasFilters = filterEmployee !== "all" || filterRole !== "all" || filterPracticeGroup !== "all" || searchQuery !== "";

  // ─── Sort helpers ─────────────────────────────────────────

  const toggleGapSort = (key: typeof gapSortKey) => {
    if (gapSortKey === key) setGapSortAsc(!gapSortAsc);
    else { setGapSortKey(key); setGapSortAsc(key !== 'gap'); }
  };
  const gapSortIndicator = (key: typeof gapSortKey) => gapSortKey === key ? (gapSortAsc ? ' ↑' : ' ↓') : '';

  const toggleRiskSort = (key: typeof riskSortKey) => {
    if (riskSortKey === key) setRiskSortAsc(!riskSortAsc);
    else { setRiskSortKey(key); setRiskSortAsc(key !== 'risk'); }
  };
  const riskSortIndicator = (key: typeof riskSortKey) => riskSortKey === key ? (riskSortAsc ? ' ↑' : ' ↓') : '';

  // ─── Avg severity for a group ─────────────────────────────

  const getAvgGapSeverity = (rows: CurrentGapRow[]): GapSeverity => {
    if (!rows.length) return "minor";
    const avg = rows.reduce((s, r) => s + r.gap, 0) / rows.length;
    return getGapSeverity(avg);
  };

  const getAvgRiskSeverity = (rows: FutureRiskRow[]): RiskSeverity => {
    if (!rows.length) return "low";
    const avg = rows.reduce((s, r) => s + r.risk, 0) / rows.length;
    return getRiskSeverity(avg);
  };

  // ─── Generate descriptions ────────────────────────────────

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
      const missingCompetencies = [...allCompetencyNames].filter((n) => !existingKeys.has(n.toLowerCase())).map((name) => ({ name, type: "competency" as const }));
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
      toast({ title: "Beschreibungen generiert", description: `${totalGenerated} neue Beschreibungen.` });
    } catch {
      toast({ title: "Fehler", description: "Beschreibungen konnten nicht generiert werden.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearFilters = () => { setSearchQuery(""); setFilterEmployee("all"); setFilterRole("all"); setFilterPracticeGroup("all"); };

  // ─── Render helpers ───────────────────────────────────────

  const renderGapRow = (g: CurrentGapRow, i: number) => {
    const sev = getGapSeverity(g.gap);
    return (
      <TableRow key={`${g.employee.id}-${g.competencyId}`} className="border-border/30 hover:bg-muted/30 animate-fade-in-up opacity-0" style={{ animationDelay: `${Math.min(i, 20) * 0.02}s` }}>
        <TableCell className="text-xs py-2 font-medium">
          {g.employee.full_name}
          {g.employee.role_profile?.practice_group && (
            <Badge variant="outline" className="ml-1.5 text-[9px] text-muted-foreground border-border/40 py-0 px-1">{g.employee.role_profile.practice_group}</Badge>
          )}
        </TableCell>
        <TableCell className="text-xs py-2 text-muted-foreground">{g.employee.role_profile?.role_title || '—'}</TableCell>
        <TableCell className="text-xs py-2">{g.competencyName}</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums">{g.currentLevel}%</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums">{g.demandedLevel}%</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums font-semibold">
          <span className="text-[hsl(var(--severity-critical))]">-{g.gap}</span>
        </TableCell>
        <TableCell className="py-2">
          <Badge variant="outline" className={`text-[10px] ${gapBadgeClass[sev]}`}>{gapLabel[sev]}</Badge>
        </TableCell>
      </TableRow>
    );
  };

  const renderRiskRow = (r: FutureRiskRow, i: number) => {
    const sev = getRiskSeverity(r.risk);
    return (
      <TableRow key={`${r.employee.id}-${r.competencyId}`} className="border-border/30 hover:bg-muted/30 animate-fade-in-up opacity-0" style={{ animationDelay: `${Math.min(i, 20) * 0.02}s` }}>
        <TableCell className="text-xs py-2 font-medium">
          {r.employee.full_name}
          {r.employee.role_profile?.practice_group && (
            <Badge variant="outline" className="ml-1.5 text-[9px] text-muted-foreground border-border/40 py-0 px-1">{r.employee.role_profile.practice_group}</Badge>
          )}
        </TableCell>
        <TableCell className="text-xs py-2 text-muted-foreground">{r.employee.role_profile?.role_title || '—'}</TableCell>
        <TableCell className="text-xs py-2">{r.competencyName}</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums">{r.currentLevel}%</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums">{r.demandedLevel}%</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums">{r.futureLevel}%</TableCell>
        <TableCell className="text-xs py-2 text-right tabular-nums font-semibold">
          <span className="text-[hsl(var(--severity-medium))]">+{r.risk}</span>
        </TableCell>
        <TableCell className="py-2">
          <Badge variant="outline" className={`text-[10px] ${riskBadgeClass[sev]}`}>{riskLabel[sev]}</Badge>
        </TableCell>
      </TableRow>
    );
  };

  const gapTableHeader = (
    <TableHeader>
      <TableRow className="border-border/50">
        <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleGapSort('employee')}>Mitarbeiter{gapSortIndicator('employee')}</TableHead>
        <TableHead className="text-xs">Rolle</TableHead>
        <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleGapSort('name')}>Kompetenz{gapSortIndicator('name')}</TableHead>
        <TableHead className="text-xs text-right">Ist-Level</TableHead>
        <TableHead className="text-xs text-right">Soll-Level</TableHead>
        <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleGapSort('gap')}>Entwicklungsfeld{gapSortIndicator('gap')}</TableHead>
        <TableHead className="text-xs">Status</TableHead>
      </TableRow>
    </TableHeader>
  );

  const riskTableHeader = (
    <TableHeader>
      <TableRow className="border-border/50">
        <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleRiskSort('employee')}>Mitarbeiter{riskSortIndicator('employee')}</TableHead>
        <TableHead className="text-xs">Rolle</TableHead>
        <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleRiskSort('name')}>Kompetenz{riskSortIndicator('name')}</TableHead>
        <TableHead className="text-xs text-right">Ist-Level</TableHead>
        <TableHead className="text-xs text-right">Soll-Level</TableHead>
        <TableHead className="text-xs text-right">Zukunfts-Level</TableHead>
        <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleRiskSort('risk')}>Risiko{riskSortIndicator('risk')}</TableHead>
        <TableHead className="text-xs">Status</TableHead>
      </TableRow>
    </TableHeader>
  );

  const emptyState = (hasF: boolean, type: "gap" | "risk") => (
    <Card className="bg-card/80 border-border/50">
      <CardContent className="py-12 text-center">
        <CheckCircle2 className="w-10 h-10 text-[hsl(var(--severity-low))] mx-auto mb-3" />
        <p className="text-foreground font-medium">
          {hasF ? (type === "gap" ? "Keine Entwicklungsfelder in diesem Filter" : "Keine Risiken in diesem Filter") : (type === "gap" ? "Keine aktuellen Entwicklungsfelder" : "Keine Zukunftsrisiken erkannt")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {hasF ? "Das Team ist für die aktuellen Rollenanforderungen gut aufgestellt." : (type === "gap" ? "Alle Mitarbeiter erfüllen ihre aktuellen Anforderungen." : "Keine Kompetenzen mit steigendem Zukunftsbedarf über dem Ist-Niveau.")}
        </p>
      </CardContent>
    </Card>
  );

  // ─── Loading / Error / Empty ──────────────────────────────

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-3 gap-3">{[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}</div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-12 text-center">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
            <p className="text-foreground font-medium">Fehler beim Laden</p>
            <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!employees?.length) {
    return (
      <div className="p-4">
        <Card className="bg-card/80 border-border/50">
          <CardContent className="py-12 text-center">
            <FileQuestion className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium">Keine Mitarbeiter vorhanden</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between animate-fade-in">
        <h1 className="text-lg font-semibold">Entwicklungsfelder</h1>
        <Button variant="outline" size="sm" onClick={handleGenerateDescriptions} disabled={isGenerating} className="h-8 text-xs gap-1.5">
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isGenerating ? "Generiere..." : "Beschreibungen"}
        </Button>
      </div>

      {/* Context Note */}
      <Card className="bg-primary/5 border-primary/20 animate-fade-in">
        <CardContent className="py-2.5 px-3 flex items-start gap-2">
          <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Entwicklungsfelder sind normal und Teil jedes professionellen Wachstumspfads. Die Bewertung zeigt, wo gezieltes Coaching und Maßnahmen den größten Impact haben — nicht eine Gesamtbewertung der Mitarbeiter.
          </p>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Suchen…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-48 h-8 text-xs bg-card/80 border-border/50" />
        <Select value={filterEmployee} onValueChange={setFilterEmployee}>
          <SelectTrigger className="w-44 h-8 text-xs bg-card/80 border-border/50"><SelectValue placeholder="Mitarbeiter" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {uniqueEmployees.map(([id, name]) => <SelectItem key={id} value={id}>{name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-44 h-8 text-xs bg-card/80 border-border/50"><SelectValue placeholder="Rolle" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            {uniqueRoles.map(([id, title]) => <SelectItem key={id} value={id}>{title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterPracticeGroup} onValueChange={setFilterPracticeGroup}>
          <SelectTrigger className="w-52 h-8 text-xs bg-card/80 border-border/50"><SelectValue placeholder="Practice Group" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Practice Groups</SelectItem>
            {uniquePracticeGroups.map(pg => <SelectItem key={pg} value={pg}>{pg}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          variant={groupedView ? "default" : "outline"}
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={() => setGroupedView(!groupedView)}
        >
          {groupedView ? <Layers className="w-3.5 h-3.5" /> : <LayoutList className="w-3.5 h-3.5" />}
          {groupedView ? "Gruppiert" : "Liste"}
        </Button>
        {hasFilters && (
          <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />zurücksetzen
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="gaps" className="text-xs h-7 px-3 gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Aktuelle Entwicklungsfelder
            {gapStats.total > 0 && <span className="ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full tabular-nums">{gapStats.total}</span>}
          </TabsTrigger>
          <TabsTrigger value="risks" className="text-xs h-7 px-3 gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Zukunftsrisiken
            {riskStats.total > 0 && <span className="ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full tabular-nums">{riskStats.total}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Current Gaps ─────────────────────────── */}
        <TabsContent value="gaps" className="mt-4 space-y-4">
          <div className={`grid gap-3 ${filterPracticeGroup !== "all" ? "grid-cols-4" : "grid-cols-3"}`}>
            <KpiCard label="Entwicklungsfelder" value={gapStats.total} icon={TrendingUp} color="text-primary" index={0} />
            <KpiCard label="Handlungsbedarf" value={gapStats.critical} icon={AlertTriangle} color="text-[hsl(var(--severity-critical))]" index={1} />
            <KpiCard label="Betroffene Mitarbeiter" value={gapStats.affected} icon={Users} color="text-primary" index={2} />
            {filterPracticeGroup !== "all" && (
              <KpiCard label={`${filterPracticeGroup}`} value={`${gapStats.affected} MA, ${gapStats.total} Felder`} icon={Briefcase} color="text-primary" index={3} />
            )}
          </div>

          {filteredGaps.length > 0 ? (
            groupedView ? (
              <div className="space-y-3">
                {groupedGaps.map(([pg, rows]) => (
                  <Card key={pg} className="bg-card/80 border-border/50">
                    <div className="sticky top-0 z-10 bg-card border-b border-border/50 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{pg}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{rows.length} Entwicklungsfelder</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${gapBadgeClass[getAvgGapSeverity(rows)]}`}>{gapLabel[getAvgGapSeverity(rows)]}</Badge>
                    </div>
                    <CardContent className="p-0">
                      <Table>
                        {gapTableHeader}
                        <TableBody>{rows.slice(0, 50).map((g, i) => renderGapRow(g, i))}</TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/80 border-border/50">
                <CardContent className="p-0">
                  <Table>
                    {gapTableHeader}
                    <TableBody>{filteredGaps.slice(0, 100).map((g, i) => renderGapRow(g, i))}</TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          ) : emptyState(hasFilters, "gap")}
          {!groupedView && filteredGaps.length > 100 && <p className="text-xs text-muted-foreground">Erste 100 von {filteredGaps.length} angezeigt</p>}
        </TabsContent>

        {/* ── Tab 2: Future Risks ─────────────────────────── */}
        <TabsContent value="risks" className="mt-4 space-y-4">
          <div className={`grid gap-3 ${filterPracticeGroup !== "all" ? "grid-cols-4" : "grid-cols-3"}`}>
            <KpiCard label="Zukunftsrisiken" value={riskStats.total} icon={ShieldAlert} color="text-[hsl(var(--severity-medium))]" index={0} />
            <KpiCard label="Hohes Risiko" value={riskStats.high} icon={AlertTriangle} color="text-[hsl(var(--severity-critical))]" index={1} />
            <KpiCard label="Betroffene Mitarbeiter" value={riskStats.affected} icon={Users} color="text-primary" index={2} />
            {filterPracticeGroup !== "all" && (
              <KpiCard label={`${filterPracticeGroup}`} value={`${riskStats.affected} MA, ${riskStats.total} Risiken`} icon={Briefcase} color="text-primary" index={3} />
            )}
          </div>

          {filteredRisks.length > 0 ? (
            groupedView ? (
              <div className="space-y-3">
                {groupedRiskRows.map(([pg, rows]) => (
                  <Card key={pg} className="bg-card/80 border-border/50">
                    <div className="sticky top-0 z-10 bg-card border-b border-border/50 px-3 py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold">{pg}</span>
                        <span className="text-[10px] text-muted-foreground tabular-nums">{rows.length} Risiken</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${riskBadgeClass[getAvgRiskSeverity(rows)]}`}>{riskLabel[getAvgRiskSeverity(rows)]}</Badge>
                    </div>
                    <CardContent className="p-0">
                      <Table>
                        {riskTableHeader}
                        <TableBody>{rows.slice(0, 50).map((r, i) => renderRiskRow(r, i))}</TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-card/80 border-border/50">
                <CardContent className="p-0">
                  <Table>
                    {riskTableHeader}
                    <TableBody>{filteredRisks.slice(0, 100).map((r, i) => renderRiskRow(r, i))}</TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          ) : emptyState(hasFilters, "risk")}
          {!groupedView && filteredRisks.length > 100 && <p className="text-xs text-muted-foreground">Erste 100 von {filteredRisks.length} angezeigt</p>}
        </TabsContent>
      </Tabs>

      {/* Practice Group Summary Table */}
      {pgSummary.length > 0 && (
        <Collapsible open={pgSummaryOpen} onOpenChange={setPgSummaryOpen}>
          <Card className="bg-card/80 border-border/50">
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-muted/30 transition-colors">
                <span className="text-xs font-semibold">Practice Group Übersicht</span>
                <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${pgSummaryOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="p-0 border-t border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs">Practice Group</TableHead>
                      <TableHead className="text-xs text-right">Mitarbeiter</TableHead>
                      <TableHead className="text-xs text-right">Ø Ist-Level</TableHead>
                      <TableHead className="text-xs text-right">Ø Soll-Level</TableHead>
                      <TableHead className="text-xs text-right">Lücken</TableHead>
                      <TableHead className="text-xs text-right">Risiken</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pgSummary.map(row => (
                      <TableRow key={row.practiceGroup} className="border-border/30 hover:bg-muted/30">
                        <TableCell className="text-xs py-2 font-medium">{row.practiceGroup}</TableCell>
                        <TableCell className="text-xs py-2 text-right tabular-nums">{row.employeeCount}</TableCell>
                        <TableCell className="text-xs py-2 text-right tabular-nums">{row.avgCurrent}%</TableCell>
                        <TableCell className="text-xs py-2 text-right tabular-nums">{row.avgDemanded}%</TableCell>
                        <TableCell className="text-xs py-2 text-right tabular-nums">{row.gaps}</TableCell>
                        <TableCell className="text-xs py-2 text-right tabular-nums">{row.risks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  );
};

export default SkillGapPage;
