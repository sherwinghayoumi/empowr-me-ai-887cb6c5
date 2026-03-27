import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle, TrendingUp, Users, FileQuestion,
  Search, X, Target, Sparkles, Loader2, ShieldAlert,
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
const gapLabel: Record<GapSeverity, string> = { critical: "Handlungsbedarf", watch: "Beobachten", minor: "Geringfügig" };

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("gaps");
  const [gapSortKey, setGapSortKey] = useState<'gap' | 'name' | 'employee'>('gap');
  const [gapSortAsc, setGapSortAsc] = useState(false);
  const [riskSortKey, setRiskSortKey] = useState<'risk' | 'name' | 'employee'>('risk');
  const [riskSortAsc, setRiskSortAsc] = useState(false);

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

        // Current gap: demanded > current by more than tolerance
        if (currentGap > GAP_TOLERANCE) {
          gaps.push({
            employee: emp, competencyId: comp.competency!.id, competencyName: comp.competency!.name,
            clusterName: comp.competency!.cluster?.name || "Sonstige",
            currentLevel: cur, demandedLevel: dem, gap: currentGap,
          });
        }

        // Future risk: future > current by more than tolerance AND no significant current gap
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

  // ─── Unique filter options (from both lists) ──────────────

  const allItems = useMemo(() => [...currentGaps.map(g => g.employee), ...futureRisks.map(r => r.employee)], [currentGaps, futureRisks]);
  const uniqueEmployees = useMemo(() => { const m = new Map<string,string>(); allItems.forEach(e => m.set(e.id, e.full_name)); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allItems]);
  const uniqueRoles = useMemo(() => { const m = new Map<string,string>(); allItems.forEach(e => { if (e.role_profile) m.set(e.role_profile.id, e.role_profile.role_title); }); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allItems]);

  // ─── Filter helper ────────────────────────────────────────

  const matchesFilters = (emp: DbEmployee, compName: string) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!emp.full_name.toLowerCase().includes(q) && !compName.toLowerCase().includes(q)) return false;
    }
    if (filterEmployee !== "all" && emp.id !== filterEmployee) return false;
    if (filterRole !== "all" && emp.role_profile?.id !== filterRole) return false;
    return true;
  };

  // ─── Filtered + sorted gaps ───────────────────────────────

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
  }, [currentGaps, searchQuery, filterEmployee, filterRole, gapSortKey, gapSortAsc]);

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
  }, [futureRisks, searchQuery, filterEmployee, filterRole, riskSortKey, riskSortAsc]);

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

  const hasFilters = filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";

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
        <h1 className="text-lg font-semibold">Skill Gap Analyse</h1>
        <Button variant="outline" size="sm" onClick={handleGenerateDescriptions} disabled={isGenerating} className="h-8 text-xs gap-1.5">
          {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
          {isGenerating ? "Generiere..." : "Beschreibungen"}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
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
        {hasFilters && (
          <button onClick={() => { setSearchQuery(""); setFilterEmployee("all"); setFilterRole("all"); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />zurücksetzen
          </button>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="h-8">
          <TabsTrigger value="gaps" className="text-xs h-7 px-3 gap-1.5">
            <Target className="w-3.5 h-3.5" />
            Aktuelle Lücken
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
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="Lücken gesamt" value={gapStats.total} icon={TrendingUp} color="text-primary" index={0} />
            <KpiCard label="Handlungsbedarf (krit.)" value={gapStats.critical} icon={AlertTriangle} color="text-[hsl(var(--severity-critical))]" index={1} />
            <KpiCard label="Betroffene Mitarbeiter" value={gapStats.affected} icon={Users} color="text-primary" index={2} />
          </div>

          {filteredGaps.length > 0 ? (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleGapSort('employee')}>
                        Mitarbeiter{gapSortIndicator('employee')}
                      </TableHead>
                      <TableHead className="text-xs">Rolle</TableHead>
                      <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleGapSort('name')}>
                        Kompetenz{gapSortIndicator('name')}
                      </TableHead>
                      <TableHead className="text-xs text-right">Ist-Level</TableHead>
                      <TableHead className="text-xs text-right">Soll-Level</TableHead>
                      <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleGapSort('gap')}>
                        Lücke{gapSortIndicator('gap')}
                      </TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGaps.slice(0, 100).map((g, i) => {
                      const sev = getGapSeverity(g.gap);
                      return (
                        <TableRow
                          key={`${g.employee.id}-${g.competencyId}`}
                          className="border-border/30 hover:bg-muted/30 animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${Math.min(i, 20) * 0.02}s` }}
                        >
                          <TableCell className="text-xs py-2 font-medium">{g.employee.full_name}</TableCell>
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
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-foreground font-medium">{hasFilters ? "Keine Lücken für diese Filter" : "Keine aktuellen Skill-Lücken"}</p>
                <p className="text-xs text-muted-foreground mt-1">{hasFilters ? "Filter anpassen." : "Alle Mitarbeiter erfüllen ihre aktuellen Anforderungen."}</p>
              </CardContent>
            </Card>
          )}
          {filteredGaps.length > 100 && <p className="text-xs text-muted-foreground">Erste 100 von {filteredGaps.length} angezeigt</p>}
        </TabsContent>

        {/* ── Tab 2: Future Risks ─────────────────────────── */}
        <TabsContent value="risks" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <KpiCard label="Zukunftsrisiken" value={riskStats.total} icon={ShieldAlert} color="text-[hsl(var(--severity-medium))]" index={0} />
            <KpiCard label="Hohes Risiko" value={riskStats.high} icon={AlertTriangle} color="text-[hsl(var(--severity-critical))]" index={1} />
            <KpiCard label="Betroffene Mitarbeiter" value={riskStats.affected} icon={Users} color="text-primary" index={2} />
          </div>

          {filteredRisks.length > 0 ? (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleRiskSort('employee')}>
                        Mitarbeiter{riskSortIndicator('employee')}
                      </TableHead>
                      <TableHead className="text-xs">Rolle</TableHead>
                      <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleRiskSort('name')}>
                        Kompetenz{riskSortIndicator('name')}
                      </TableHead>
                      <TableHead className="text-xs text-right">Ist-Level</TableHead>
                      <TableHead className="text-xs text-right">Soll-Level</TableHead>
                      <TableHead className="text-xs text-right">Zukunfts-Level</TableHead>
                      <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleRiskSort('risk')}>
                        Risiko{riskSortIndicator('risk')}
                      </TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRisks.slice(0, 100).map((r, i) => {
                      const sev = getRiskSeverity(r.risk);
                      return (
                        <TableRow
                          key={`${r.employee.id}-${r.competencyId}`}
                          className="border-border/30 hover:bg-muted/30 animate-fade-in-up opacity-0"
                          style={{ animationDelay: `${Math.min(i, 20) * 0.02}s` }}
                        >
                          <TableCell className="text-xs py-2 font-medium">{r.employee.full_name}</TableCell>
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
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-card/80 border-border/50">
              <CardContent className="py-12 text-center">
                <p className="text-foreground font-medium">{hasFilters ? "Keine Risiken für diese Filter" : "Keine Zukunftsrisiken erkannt"}</p>
                <p className="text-xs text-muted-foreground mt-1">{hasFilters ? "Filter anpassen." : "Keine Kompetenzen mit steigendem Zukunftsbedarf über dem Ist-Niveau."}</p>
              </CardContent>
            </Card>
          )}
          {filteredRisks.length > 100 && <p className="text-xs text-muted-foreground">Erste 100 von {filteredRisks.length} angezeigt</p>}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SkillGapPage;
