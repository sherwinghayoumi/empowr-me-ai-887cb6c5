import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { SkillGapCardDb } from "@/components/SkillGapCardDb";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useEmployees } from "@/hooks/useOrgData";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertTriangle, TrendingUp, Users, FileQuestion,
  Search, X, Target, Sparkles, Loader2,
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
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  weightedGap: number;
}

const GAP_TOLERANCE = 10;

function getSeverityLabel(weightedGap: number, demandedLevel: number): "focus" | "building" | "ontrack" {
  const effectiveGap = Math.max(0, weightedGap - GAP_TOLERANCE);
  const ratio = demandedLevel > 0 ? effectiveGap / demandedLevel : 0;
  if (ratio >= 0.4) return "focus";
  if (ratio >= 0.2) return "building";
  return "ontrack";
}

const severityBadge: Record<string, string> = {
  focus: "bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))]",
  building: "bg-primary/15 text-primary",
  ontrack: "bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))]",
};
const severityLabel: Record<string, string> = { focus: "Potenzial", building: "Wachstum", ontrack: "Stark" };

const SkillGapPage = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterEmployee, setFilterEmployee] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sortKey, setSortKey] = useState<'gap' | 'name' | 'employee'>('gap');
  const [sortAsc, setSortAsc] = useState(false);

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
            employee: emp, competencyId: comp.competency.id, competencyName: comp.competency.name,
            clusterName: comp.competency.cluster?.name || "Sonstige",
            currentLevel: cur, demandedLevel: dem, futureLevel: fut, weightedGap: weighted,
          });
        }
      });
    });
    return gaps;
  }, [employees]);

  const uniqueEmployees = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => m.set(g.employee.id, g.employee.full_name)); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);
  const uniqueRoles = useMemo(() => { const m = new Map<string,string>(); allGaps.forEach(g => { if (g.employee.role_profile) m.set(g.employee.role_profile.id, g.employee.role_profile.role_title); }); return [...m.entries()].sort(([,a],[,b]) => a.localeCompare(b)); }, [allGaps]);

  const filteredGaps = useMemo(() => allGaps.filter(g => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!g.employee.full_name.toLowerCase().includes(q) && !g.competencyName.toLowerCase().includes(q)) return false;
    }
    if (filterSeverity !== "all" && getSeverityLabel(g.weightedGap, g.demandedLevel) !== filterSeverity) return false;
    if (filterEmployee !== "all" && g.employee.id !== filterEmployee) return false;
    if (filterRole !== "all" && g.employee.role_profile?.id !== filterRole) return false;
    return true;
  }).sort((a, b) => {
    let cmp = 0;
    if (sortKey === 'gap') cmp = a.weightedGap - b.weightedGap;
    else if (sortKey === 'name') cmp = a.competencyName.localeCompare(b.competencyName);
    else cmp = a.employee.full_name.localeCompare(b.employee.full_name);
    return sortAsc ? cmp : -cmp;
  }), [allGaps, searchQuery, filterSeverity, filterEmployee, filterRole, sortKey, sortAsc]);

  const hasFilters = filterSeverity !== "all" || filterEmployee !== "all" || filterRole !== "all" || searchQuery !== "";
  const totalGaps = filteredGaps.length;
  const focusCount = filteredGaps.filter(g => getSeverityLabel(g.weightedGap, g.demandedLevel) === "focus").length;
  const affectedCount = new Set(filteredGaps.map(g => g.employee.id)).size;

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
    } catch (err) {
      toast({ title: "Fehler", description: "Beschreibungen konnten nicht generiert werden.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-7 w-40" />
        <div className="grid grid-cols-3 gap-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
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

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <KpiCard label="Entwicklungsbereiche" value={totalGaps} icon={TrendingUp} color="text-primary" index={0} />
        <KpiCard label="Großes Potenzial" value={focusCount} icon={Target} color="text-[hsl(var(--severity-medium))]" index={1} />
        <KpiCard label="Betroffene Mitarbeiter" value={affectedCount} icon={Users} color="text-primary" index={2} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <Input placeholder="Suchen…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-48 h-8 text-xs bg-card/80 border-border/50" />
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-36 h-8 text-xs bg-card/80 border-border/50"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle</SelectItem>
            <SelectItem value="focus">Potenzial</SelectItem>
            <SelectItem value="building">Wachstum</SelectItem>
            <SelectItem value="ontrack">Stark</SelectItem>
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
                  <TableHead className="text-xs text-right">Soll</TableHead>
                  <TableHead className="text-xs text-right cursor-pointer hover:text-primary" onClick={() => toggleSort('gap')}>
                    Gap{sortIndicator('gap')}
                  </TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGaps.slice(0, 100).map((g, i) => {
                  const sev = getSeverityLabel(g.weightedGap, g.demandedLevel);
                  const gap = g.demandedLevel - g.currentLevel;
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
                        {gap > 0 ? <span className="text-[hsl(var(--severity-critical))]">-{gap}</span> : '0'}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant="outline" className={`text-[10px] ${severityBadge[sev]}`}>{severityLabel[sev]}</Badge>
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
            <p className="text-foreground font-medium">{hasFilters ? "Keine Gaps für diese Filter" : "Keine Skill Gaps erkannt"}</p>
            <p className="text-xs text-muted-foreground mt-1">{hasFilters ? "Filter anpassen." : "Alle Mitarbeiter erfüllen ihre Anforderungen."}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground">{totalGaps} Gaps{filteredGaps.length > 100 ? ` (erste 100 angezeigt)` : ''}</p>
    </div>
  );
};

export default SkillGapPage;
