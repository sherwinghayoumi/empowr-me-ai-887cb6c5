import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle, TrendingUp, Users, FileQuestion,
  Search, X, Target, Sparkles, Loader2, ShieldAlert, Clock,
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

interface GapRow {
  employee: DbEmployee;
  competencyId: string;
  competencyName: string;
  clusterName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  currentGap: number;   // demanded - current
  futureRisk: number;   // future - current
}

const GAP_TOLERANCE = 10;

type GapTab = "current" | "future";

function getSeverity(gap: number, target: number): "kritisch" | "mittel" | "gering" {
  const ratio = target > 0 ? gap / target : 0;
  if (ratio >= 0.4) return "kritisch";
  if (ratio >= 0.2) return "mittel";
  return "gering";
}

const severityBadge: Record<string, string> = {
  kritisch: "bg-[hsl(var(--severity-critical))]/15 text-[hsl(var(--severity-critical))]",
  mittel: "bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]",
  gering: "bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]",
};
const futureBadge: Record<string, string> = {
  kritisch: "bg-amber-500/15 text-amber-400",
  mittel: "bg-amber-500/10 text-amber-300",
  gering: "bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]",
};

const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<GapTab>("current");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortKey, setSortKey] = useState<'gap' | 'name' | 'employee'>('gap');
  const [sortAsc, setSortAsc] = useState(false);

  // Build unified gap rows
  const allRows = useMemo<GapRow[]>(() => {
    if (!employees?.length) return [];
    const rows: GapRow[] = [];
    (employees as DbEmployee[]).forEach((emp) => {
      (emp.competencies || []).filter(c => !c.is_deprecated).forEach((comp) => {
        if (!comp.competency) return;
        const cur = comp.current_level ?? 0;
        const dem = comp.demanded_level ?? 0;
        const fut = comp.future_level ?? 0;
        const currentGap = Math.max(0, dem - cur);
        const futureRisk = Math.max(0, fut - cur);
        if (currentGap >= GAP_TOLERANCE || futureRisk >= GAP_TOLERANCE) {
          rows.push({
            employee: emp, competencyId: comp.competency.id, competencyName: comp.competency.name,
            clusterName: comp.competency.cluster?.name || "Sonstige",
            currentLevel: cur, demandedLevel: dem, futureLevel: fut, currentGap, futureRisk,
          });
        }
      });
    });
    return rows;
  }, [employees]);

  // Split by tab
  const tabRows = useMemo(() => {
    if (tab === "current") return allRows.filter(r => r.currentGap >= GAP_TOLERANCE);
    return allRows.filter(r => r.futureRisk >= GAP_TOLERANCE);
  }, [allRows, tab]);

  const uniqueEmployees = useMemo(() => {
    const m = new Map<string,string>();
    tabRows.forEach(g => m.set(g.employee.id, g.employee.full_name));
    return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b));
  }, [tabRows]);

  const uniqueRoles = useMemo(() => {
    const m = new Map<string,string>();
    tabRows.forEach(g => { if (g.employee.role_profile) m.set(g.employee.role_profile.id, g.employee.role_profile.role_title); });
    return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b));
  }, [tabRows]);

  const filteredGaps = useMemo(() => tabRows.filter(g => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!g.employee.full_name.toLowerCase().includes(q) && !g.competencyName.toLowerCase().includes(q)) return false;
    }
    const gapVal = tab === "current" ? g.currentGap : g.futureRisk;
    const target = tab === "current" ? g.demandedLevel : g.futureLevel;
    const sev = getSeverity(gapVal, target);
    if (filterSeverity !== "all" && sev !== filterSeverity) return false;
    if (filterEmployee !== "all" && g.employee.id !== filterEmployee) return false;
    if (filterRole !== "all" && g.employee.role_profile?.id !== filterRole) return false;
    return true;
  }).sort((a, b) => {
    const gapA = tab === "current" ? a.currentGap : a.futureRisk;
    const gapB = tab === "current" ? b.currentGap : b.futureRisk;
    let cmp = 0;
    if (sortKey === 'gap') cmp = gapA - gapB;
    else if (sortKey === 'name') cmp = a.competencyName.localeCompare(b.competencyName);
    else cmp = a.employee.full_name.localeCompare(b.employee.full_name);
    return sortAsc ? cmp : -cmp;
  }), [tabRows, searchQuery, filterSeverity, filterEmployee, filterRole, sortKey, sortAsc, tab]);

  const hasFilters = filterSeverity !== "all" || filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";
  const totalGaps = filteredGaps.length;
  const kritischCount = filteredGaps.filter(g => {
    const gapVal = tab === "current" ? g.currentGap : g.futureRisk;
    const target = tab === "current" ? g.demandedLevel : g.futureLevel;
    return getSeverity(gapVal, target) === "kritisch";
  }).length;
  const affectedCount = new Set(filteredGaps.map(g => g.employee.id)).size;

  // Counts for tab badges
  const currentCount = allRows.filter(r => r.currentGap >= GAP_TOLERANCE).length;
  const futureCount = allRows.filter(r => r.futureRisk >= GAP_TOLERANCE).length;

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(key === 'name' || key === 'employee'); }
  };
  const sortIndicator = (key: typeof sortKey) => sortKey === key ? (sortAsc ? ' ↑' : ' ↓') : '';

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

  const isCurrent = tab === "current";
  const badgeStyles = isCurrent ? severityBadge : futureBadge;

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

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => { setTab(v as GapTab); setFilterSeverity("all"); }}>
        <TabsList className="bg-card/80 border border-border/50">
          <TabsTrigger value="current" className="text-xs gap-1.5 data-[state=active]:bg-[hsl(var(--severity-critical))]/15">
            <ShieldAlert className="w-3.5 h-3.5" />
            Aktuelle Gaps
            <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">{currentCount}</Badge>
          </TabsTrigger>
          <TabsTrigger value="future" className="text-xs gap-1.5 data-[state=active]:bg-amber-500/15">
            <Clock className="w-3.5 h-3.5" />
            Zukunftsrisiken
            <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0">{futureCount}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard
          label={isCurrent ? "Aktuelle Gaps" : "Zukunftsrisiken"}
          value={totalGaps}
          icon={isCurrent ? ShieldAlert : Clock}
          color={isCurrent ? "text-[hsl(var(--severity-critical))]" : "text-amber-400"}
          index={0}
        />
        <KpiCard label="Kritisch" value={kritischCount} icon={Target} color={isCurrent ? "text-[hsl(var(--severity-critical))]" : "text-amber-400"} index={1} />
        <KpiCard label="Betroffene MA" value={affectedCount} icon={Users} color="text-primary" index={2} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Suchen…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-48 h-8 text-xs bg-card/80 border-border/50" />
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36 h-8 text-xs bg-card/80 border-border/50"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="kritisch">Kritisch</SelectItem>
            <SelectItem value="mittel">Mittel</SelectItem>
            <SelectItem value="gering">Gering</SelectItem>
          </SelectContent>
        </Select>
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
          <button onClick={() => { setSearchQuery(""); setFilterSeverity("all"); setFilterEmployee("all"); setFilterRole("all"); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="w-3 h-3" />zurücksetzen
          </button>
        )}
      </div>

      {/* Table */}
      {totalGaps > 0 ? (
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50">
                  <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleSort('employee')}>
                    Mitarbeiter{sortIndicator('employee')}
                  </TableHead>
                  <TableHead className="text-xs">Rolle</TableHead>
                  <TableHead className="text-xs cursor-pointer hover:text-primary" onClick={() => toggleSort('name')}>
                    Kompetenz{sortIndicator('name')}
                  </TableHead>
                  <TableHead className="text-xs text-right">Ist</TableHead>
                  <TableHead className="text-xs text-right">{isCurrent ? "Soll" : "Zukunft"}</TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleSort('gap')}>
                    {isCurrent ? "Gap" : "Risiko"}{sortIndicator('gap')}
                  </TableHead>
                  <TableHead className="text-xs">Severity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGaps.slice(0, 100).map((g, i) => {
                  const gapVal = isCurrent ? g.currentGap : g.futureRisk;
                  const target = isCurrent ? g.demandedLevel : g.futureLevel;
                  const sev = getSeverity(gapVal, target);
                  return (
                    <TableRow
                      key={`${g.employee.id}-${g.competencyId}-${tab}`}
                      className="border-border/30 hover:bg-muted/30 animate-fade-in-up opacity-0"
                      style={{ animationDelay: `${Math.min(i, 20) * 0.02}s` }}
                    >
                      <TableCell className="text-xs py-2 font-medium">{g.employee.full_name}</TableCell>
                      <TableCell className="text-xs py-2 text-muted-foreground">{g.employee.role_profile?.role_title || '—'}</TableCell>
                      <TableCell className="text-xs py-2">{g.competencyName}</TableCell>
                      <TableCell className="text-xs py-2 text-right tabular-nums">{g.currentLevel}%</TableCell>
                      <TableCell className="text-xs py-2 text-right tabular-nums">{target}%</TableCell>
                      <TableCell className="text-xs py-2 text-right tabular-nums font-semibold">
                        <span className={sev === "kritisch" ? (isCurrent ? "text-[hsl(var(--severity-critical))]" : "text-amber-400") : "text-foreground"}>
                          -{gapVal}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={`text-[10px] ${badgeStyles[sev]}`}>{sev === "kritisch" ? "Kritisch" : sev === "mittel" ? "Mittel" : "Gering"}</Badge>
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
            <p className="text-foreground font-medium">{hasFilters ? "Keine Einträge für diese Filter" : (isCurrent ? "Keine aktuellen Gaps erkannt" : "Keine Zukunftsrisiken erkannt")}</p>
            <p className="text-xs text-muted-foreground mt-1">{hasFilters ? "Filter anpassen." : "Alle Mitarbeiter erfüllen die Anforderungen."}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{totalGaps} {isCurrent ? "Gaps" : "Risiken"}{filteredGaps.length > 100 ? ` (erste 100 angezeigt)` : ''}</p>
    </div>
  );
};

export default SkillGapPage;
