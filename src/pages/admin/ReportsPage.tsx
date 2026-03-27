import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText, TrendingUp, Search, Users, ArrowLeft, Target,
  BarChart3, Wallet, ChevronRight, AlertTriangle, CheckCircle2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useEmployees, useTeams } from "@/hooks/useOrgData";
import { useMeasures } from "@/hooks/useMeasures";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────

interface EmployeeReport {
  id: string;
  name: string;
  role: string;
  teamName: string;
  avgLevel: number;
  avgDemanded: number;
  gapScore: number;
  criticalGaps: number;
  completedMeasures: number;
  totalMeasureCost: number;
  costPerPoint: number | null;
  competencies: {
    name: string;
    current: number;
    demanded: number;
    gap: number;
  }[];
}

// ─── Page ───────────────────────────────────────────

const ReportsPage = () => {
  const { data: employees, isLoading: empLoading } = useEmployees();
  const { data: teams } = useTeams();
  const { data: measures } = useMeasures();

  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Build per-employee report data
  const employeeReports = useMemo(() => {
    if (!employees) return [];

    const completedMeasures = measures?.filter(m => m.status === "completed") || [];

    return employees.map((emp): EmployeeReport => {
      const activeComps = (emp.competencies || []).filter(
        (c: any) => !c.is_deprecated && c.competency?.status === "active"
      );

      const compData = activeComps.map((c: any) => ({
        name: c.competency?.name || "?",
        current: c.current_level || 0,
        demanded: c.demanded_level || 0,
        gap: Math.max(0, (c.demanded_level || 0) - (c.current_level || 0)),
      }));

      const avgLevel = compData.length > 0
        ? Math.round(compData.reduce((s, c) => s + c.current, 0) / compData.length)
        : 0;
      const avgDemanded = compData.length > 0
        ? Math.round(compData.reduce((s, c) => s + c.demanded, 0) / compData.length)
        : 0;
      const gapScore = compData.length > 0
        ? Math.round(compData.reduce((s, c) => s + c.gap, 0) / compData.length)
        : 0;
      const criticalGaps = compData.filter(c => c.gap >= 20).length;

      // Measures assigned to this employee
      const empMeasures = completedMeasures.filter(
        m => m.assigned_employee_ids?.includes(emp.id)
      );
      const totalCost = empMeasures.reduce((s, m) => s + (m.cost || 0), 0);
      const linkedGaps = empMeasures.reduce(
        (s, m) => s + (m.linked_competency_ids?.length || 0), 0
      );

      return {
        id: emp.id,
        name: emp.full_name,
        role: (emp as any).role_profile?.role_title || "–",
        teamName: (emp as any).team?.name || "–",
        avgLevel,
        avgDemanded,
        gapScore,
        criticalGaps,
        completedMeasures: empMeasures.length,
        totalMeasureCost: totalCost,
        costPerPoint: linkedGaps > 0 && totalCost > 0 ? Math.round(totalCost / linkedGaps) : null,
        competencies: compData.sort((a, b) => b.gap - a.gap),
      };
    }).sort((a, b) => b.gapScore - a.gapScore);
  }, [employees, measures]);

  // Filters
  const filtered = useMemo(() => {
    return employeeReports.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = teamFilter === "all" || r.teamName === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [employeeReports, searchQuery, teamFilter]);

  const teamNames = [...new Set(employeeReports.map(r => r.teamName).filter(t => t !== "–"))].sort();

  // Aggregate KPIs
  const totalEmployees = filtered.length;
  const avgGap = totalEmployees > 0
    ? Math.round(filtered.reduce((s, r) => s + r.gapScore, 0) / totalEmployees)
    : 0;
  const totalSpent = filtered.reduce((s, r) => s + r.totalMeasureCost, 0);
  const totalCompleted = filtered.reduce((s, r) => s + r.completedMeasures, 0);

  const selected = selectedEmployee
    ? employeeReports.find(r => r.id === selectedEmployee) || null
    : null;

  if (selected) {
    return <EmployeeReportDetail report={selected} onBack={() => setSelectedEmployee(null)} />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Q-Reports</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Individuelle Kompetenz-Reports pro Anwalt</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
        <KpiCard label="Anwälte" value={empLoading ? "…" : totalEmployees} icon={Users} color="text-primary" index={0} />
        <KpiCard label="Ø Gap-Score" value={empLoading ? "…" : avgGap} icon={Target} color={avgGap >= 15 ? "text-[hsl(var(--severity-critical))]" : "text-[hsl(var(--severity-low))]"} index={1} />
        <KpiCard label="Maßnahmen abgeschl." value={empLoading ? "…" : totalCompleted} icon={CheckCircle2} color="text-[hsl(var(--severity-low))]" index={2} />
        <KpiCard label="Investiert" value={empLoading ? "…" : `€${totalSpent.toLocaleString("de-DE")}`} icon={Wallet} color="text-primary" index={3} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Anwalt suchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-8 text-xs"
          />
        </div>
        <Select value={teamFilter} onValueChange={setTeamFilter}>
          <SelectTrigger className="w-full sm:w-40 h-8 text-xs">
            <SelectValue placeholder="Team" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            {teamNames.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employee Reports Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Individuelle Q-Reports ({filtered.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {empLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p>Keine Anwälte gefunden.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30 hover:bg-transparent">
                  <TableHead className="text-xs">Anwalt</TableHead>
                  <TableHead className="text-xs">Rolle</TableHead>
                  <TableHead className="text-xs text-right">Ø Level</TableHead>
                  <TableHead className="text-xs text-right">Gap-Score</TableHead>
                  <TableHead className="text-xs text-right">Krit. Gaps</TableHead>
                  <TableHead className="text-xs text-right">Maßnahmen</TableHead>
                  <TableHead className="text-xs text-right">Investiert</TableHead>
                  <TableHead className="text-xs text-right">€/Punkt</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/30 transition-colors border-border/20"
                    onClick={() => setSelectedEmployee(r.id)}
                  >
                    <TableCell className="font-medium text-xs text-foreground py-2">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground text-xs py-2">{r.role}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs py-2">{r.avgLevel}</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant="outline"
                        className={cn(
                          "tabular-nums",
                          r.gapScore >= 20 && "border-[hsl(var(--severity-critical))]/40 text-[hsl(var(--severity-critical))]",
                          r.gapScore >= 10 && r.gapScore < 20 && "border-[hsl(var(--severity-medium))]/40 text-[hsl(var(--severity-medium))]",
                          r.gapScore < 10 && "border-[hsl(var(--severity-low))]/40 text-[hsl(var(--severity-low))]",
                        )}
                      >
                        {r.gapScore}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.criticalGaps > 0 ? (
                        <span className="text-[hsl(var(--severity-critical))]">{r.criticalGaps}</span>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">{r.completedMeasures}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">
                      €{r.totalMeasureCost.toLocaleString("de-DE")}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {r.costPerPoint ? `€${r.costPerPoint.toLocaleString("de-DE")}` : "–"}
                    </TableCell>
                    <TableCell>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// ─── Detail View ────────────────────────────────────

function EmployeeReportDetail({ report, onBack }: { report: EmployeeReport; onBack: () => void }) {
  const radarData = report.competencies.slice(0, 8).map(c => ({
    subject: c.name.length > 18 ? c.name.slice(0, 16) + "…" : c.name,
    current: c.current,
    demanded: c.demanded,
  }));

  const gapBarData = report.competencies.filter(c => c.gap > 0).slice(0, 10).map(c => ({
    name: c.name.length > 20 ? c.name.slice(0, 18) + "…" : c.name,
    gap: c.gap,
  }));

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="-ml-2 mb-3">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Zurück zur Übersicht
        </Button>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{report.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{report.role}</Badge>
              <Badge variant="outline" className="text-xs">{report.teamName}</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: "Ø Level", value: report.avgLevel, max: 100 },
          { label: "Ø Anforderung", value: report.avgDemanded, max: 100 },
          { label: "Gap-Score", value: report.gapScore, severity: true },
          { label: "Investiert", value: `€${report.totalMeasureCost.toLocaleString("de-DE")}` },
          { label: "€/Kompetenzpunkt", value: report.costPerPoint ? `€${report.costPerPoint.toLocaleString("de-DE")}` : "–" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card/80 border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className={cn(
                "text-xl font-bold tabular-nums",
                (kpi as any).severity && report.gapScore >= 20 && "text-[hsl(var(--severity-critical))]",
                (kpi as any).severity && report.gapScore >= 10 && report.gapScore < 20 && "text-[hsl(var(--severity-medium))]",
                (kpi as any).severity && report.gapScore < 10 && "text-[hsl(var(--severity-low))]",
                !(kpi as any).severity && "text-foreground",
              )}>
                {kpi.value}
              </p>
              {kpi.max && typeof kpi.value === "number" && (
                <Progress value={(kpi.value / kpi.max) * 100} className="mt-2 h-1.5" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Kompetenzprofil</CardTitle>
          </CardHeader>
          <CardContent>
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Ist" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Soll" dataKey="demanded" stroke="hsl(var(--severity-medium))" fill="hsl(var(--severity-medium))" fillOpacity={0.15} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Keine Kompetenzdaten</p>
            )}
          </CardContent>
        </Card>

        {/* Gap Bar Chart */}
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-foreground">Top Gaps</CardTitle>
          </CardHeader>
          <CardContent>
            {gapBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gapBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, "auto"]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" width={130} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="hsl(var(--severity-critical))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12">Keine Gaps vorhanden</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Competency Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <BarChart3 className="w-4 h-4" />
            Alle Kompetenzen ({report.competencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kompetenz</TableHead>
                <TableHead className="text-right">Ist-Level</TableHead>
                <TableHead className="text-right">Soll-Level</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead>Fortschritt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.competencies.map((c) => {
                const pct = c.demanded > 0 ? Math.min(100, (c.current / c.demanded) * 100) : 100;
                return (
                  <TableRow key={c.name}>
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell className="text-right tabular-nums">{c.current}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{c.demanded}</TableCell>
                    <TableCell className="text-right">
                      {c.gap > 0 ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            "tabular-nums",
                            c.gap >= 20 ? "text-[hsl(var(--severity-critical))] border-[hsl(var(--severity-critical))]/30"
                              : c.gap >= 10 ? "text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/30"
                              : "text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/30"
                          )}
                        >
                          -{c.gap}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/30">✓</Badge>
                      )}
                    </TableCell>
                    <TableCell className="w-32">
                      <Progress value={pct} className="h-1.5" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ReportsPage;
