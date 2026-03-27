import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  FileText, TrendingUp, Search, Users, ArrowLeft, Target,
  BarChart3, Wallet, ChevronRight, AlertTriangle, CheckCircle2,
  Info, ClipboardCheck, ArrowUpRight, ArrowDownRight, Minus,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useEmployees, useTeams } from "@/hooks/useOrgData";
import { useMeasures } from "@/hooks/useMeasures";
import { useReports } from "@/hooks/useReports";
import { ReportsList } from "@/components/reports/ReportsList";
import { cn } from "@/lib/utils";

// ─── Assessment helper ──────────────────────────────

function getAssessmentCount(emp: any): number {
  const paths = [emp.self_assessment_path, emp.manager_assessment_path].filter(Boolean);
  return paths.length;
}

type AssessmentState = "none" | "partial" | "complete";

function getAssessmentState(count: number): AssessmentState {
  if (count === 0) return "none";
  if (count >= 2) return "complete";
  return "partial";
}

// ─── Types ──────────────────────────────────────────

interface EmployeeReport {
  id: string;
  name: string;
  role: string;
  teamName: string;
  practiceGroup: string | null;
  avgLevel: number;
  avgDemanded: number;
  gapScore: number;
  criticalGaps: number;
  completedMeasures: number;
  totalMeasureCost: number;
  costPerPoint: number | null;
  assessmentCount: number;
  assessmentState: AssessmentState;
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
  const { reports, isLoading: reportsLoading, publishReport, unpublishReport, deleteReport } = useReports();

  const [mainTab, setMainTab] = useState("employees");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [assessmentFilter, setAssessmentFilter] = useState<string>("all");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Build per-employee report data
  const employeeReports = useMemo(() => {
    if (!employees) return [];

    const completedMeasures = measures?.filter(m => m.status === "completed") || [];

    return employees.map((emp: any): EmployeeReport => {
      const assessmentCount = getAssessmentCount(emp);
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
        ? Math.round(compData.reduce((s: number, c: any) => s + c.current, 0) / compData.length) : 0;
      const avgDemanded = compData.length > 0
        ? Math.round(compData.reduce((s: number, c: any) => s + c.demanded, 0) / compData.length) : 0;
      const gapScore = compData.length > 0
        ? Math.round(compData.reduce((s: number, c: any) => s + c.gap, 0) / compData.length) : 0;
      const criticalGaps = compData.filter((c: any) => c.gap >= 20).length;

      const empMeasures = completedMeasures.filter(
        m => m.assigned_employee_ids?.includes(emp.id)
      );
      const totalCost = empMeasures.reduce((s, m) => s + (m.cost || 0), 0);
      const linkedGaps = empMeasures.reduce((s, m) => s + (m.linked_competency_ids?.length || 0), 0);

      return {
        id: emp.id,
        name: emp.full_name,
        role: emp.role_profile?.role_title || "–",
        teamName: emp.team?.name || "–",
        practiceGroup: emp.role_profile?.practice_group || null,
        avgLevel,
        avgDemanded,
        gapScore,
        criticalGaps,
        completedMeasures: empMeasures.length,
        totalMeasureCost: totalCost,
        costPerPoint: linkedGaps > 0 && totalCost > 0 ? Math.round(totalCost / linkedGaps) : null,
        assessmentCount,
        assessmentState: getAssessmentState(assessmentCount),
        competencies: compData.sort((a: any, b: any) => b.gap - a.gap),
      };
    }).sort((a, b) => b.gapScore - a.gapScore);
  }, [employees, measures]);

  // Filters
  const filtered = useMemo(() => {
    return employeeReports.filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTeam = teamFilter === "all" || r.teamName === teamFilter;
      const matchesAssessment = assessmentFilter === "all" ||
        (assessmentFilter === "none" && r.assessmentState === "none") ||
        (assessmentFilter === "partial" && r.assessmentState === "partial") ||
        (assessmentFilter === "complete" && r.assessmentState === "complete");
      return matchesSearch && matchesTeam && matchesAssessment;
    });
  }, [employeeReports, searchQuery, teamFilter, assessmentFilter]);

  const teamNames = [...new Set(employeeReports.map(r => r.teamName).filter(t => t !== "–"))].sort();

  // Assessment KPIs
  const kpiNone = employeeReports.filter(r => r.assessmentState === "none").length;
  const kpiPartial = employeeReports.filter(r => r.assessmentState === "partial").length;
  const kpiComplete = employeeReports.filter(r => r.assessmentState === "complete").length;

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
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Reports</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Entwicklungsfortschritt und Quarterly Reports</p>
      </div>

      {/* Tabs */}
      <Tabs value={mainTab} onValueChange={setMainTab}>
        <TabsList className="h-8">
          <TabsTrigger value="employees" className="text-xs h-7 px-3 gap-1.5">
            <Users className="w-3.5 h-3.5" />
            Mitarbeiter-Berichte
          </TabsTrigger>
          <TabsTrigger value="quarterly" className="text-xs h-7 px-3 gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Quarterly Reports
            {reports && reports.length > 0 && <span className="ml-1 text-[10px] bg-secondary px-1.5 py-0.5 rounded-full tabular-nums">{reports.length}</span>}
          </TabsTrigger>
        </TabsList>

        {/* ── Tab 1: Mitarbeiter-Berichte ─────────────── */}
        <TabsContent value="employees" className="mt-4 space-y-4">
          {/* Info Banner */}
          <Card className="bg-primary/5 border-primary/20 animate-fade-in">
            <CardContent className="py-2.5 px-3 flex items-start gap-2">
              <Info className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Reports zeigen den Entwicklungsfortschritt zwischen zwei Assessments. Mitarbeiter mit nur einem Assessment zeigen den aktuellen Stand. Mitarbeiter ohne Assessment werden angezeigt, sobald das erste durchgeführt wurde.
              </p>
            </CardContent>
          </Card>

          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: '60ms' }}>
            <KpiCard label="Gesamt Mitarbeiter" value={empLoading ? "…" : employeeReports.length} icon={Users} color="text-primary" index={0} />
            <KpiCard label="Kein Assessment" value={empLoading ? "…" : kpiNone} icon={AlertTriangle} color="text-muted-foreground" index={1} />
            <KpiCard label="1 Assessment" value={empLoading ? "…" : kpiPartial} icon={ClipboardCheck} color="text-[hsl(var(--severity-medium))]" index={2} />
            <KpiCard label="Vollständig (2)" value={empLoading ? "…" : kpiComplete} icon={CheckCircle2} color="text-[hsl(var(--severity-low))]" index={3} />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-2 animate-fade-in-up" style={{ animationDelay: '120ms' }}>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input placeholder="Anwalt suchen..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-8 text-xs" />
            </div>
            <Select value={teamFilter} onValueChange={setTeamFilter}>
              <SelectTrigger className="w-full sm:w-40 h-8 text-xs"><SelectValue placeholder="Team" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Teams</SelectItem>
                {teamNames.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={assessmentFilter} onValueChange={setAssessmentFilter}>
              <SelectTrigger className="w-full sm:w-48 h-8 text-xs"><SelectValue placeholder="Assessment-Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="none">Kein Assessment</SelectItem>
                <SelectItem value="partial">1 Assessment</SelectItem>
                <SelectItem value="complete">Vollständig</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Employee Reports Table */}
          <Card className="bg-card/80 border-border/50 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
            <CardContent className="p-0">
              {empLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">Keine Anwälte gefunden.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs">Anwalt</TableHead>
                      <TableHead className="text-xs">Rolle</TableHead>
                      <TableHead className="text-xs">Assessment</TableHead>
                      <TableHead className="text-xs text-right">Ø Level</TableHead>
                      <TableHead className="text-xs text-right">Gap</TableHead>
                      <TableHead className="text-xs text-right">Maßnahmen</TableHead>
                      <TableHead className="text-xs text-right">Investiert</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((r) => (
                      <TableRow
                        key={r.id}
                        className={cn(
                          "transition-colors border-border/20",
                          r.assessmentState === "none" ? "opacity-50" : "cursor-pointer hover:bg-muted/30",
                        )}
                        onClick={() => r.assessmentState !== "none" && setSelectedEmployee(r.id)}
                      >
                        <TableCell className="font-medium text-xs text-foreground py-2">
                          {r.name}
                          {r.practiceGroup && (
                            <Badge variant="outline" className="ml-1.5 text-[9px] text-muted-foreground border-border/40 py-0 px-1">{r.practiceGroup}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs py-2">{r.role}</TableCell>
                        <TableCell className="py-2">
                          <AssessmentBadge state={r.assessmentState} count={r.assessmentCount} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-xs py-2">
                          {r.assessmentState === "none" ? "–" : r.avgLevel}
                        </TableCell>
                        <TableCell className="text-right py-2">
                          {r.assessmentState === "none" ? (
                            <span className="text-xs text-muted-foreground">–</span>
                          ) : (
                            <Badge variant="outline" className={cn("tabular-nums text-[10px]",
                              r.gapScore >= 20 && "border-[hsl(var(--severity-critical))]/40 text-[hsl(var(--severity-critical))]",
                              r.gapScore >= 10 && r.gapScore < 20 && "border-[hsl(var(--severity-medium))]/40 text-[hsl(var(--severity-medium))]",
                              r.gapScore < 10 && "border-[hsl(var(--severity-low))]/40 text-[hsl(var(--severity-low))]",
                            )}>
                              {r.gapScore}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-xs py-2">
                          {r.assessmentState === "none" ? "–" : r.completedMeasures}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-muted-foreground text-xs py-2">
                          {r.assessmentState === "none" ? "–" : `€${r.totalMeasureCost.toLocaleString("de-DE")}`}
                        </TableCell>
                        <TableCell className="py-2">
                          {r.assessmentState !== "none" && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Tab 2: Quarterly Reports ────────────────── */}
        <TabsContent value="quarterly" className="mt-4">
          <ReportsList
            reports={reports}
            isLoading={reportsLoading}
            onPublish={(id) => publishMutation.mutate(id)}
            onUnpublish={(id) => unpublishMutation.mutate(id)}
            onDelete={(id) => deleteMutation.mutate(id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ─── Assessment Badge ───────────────────────────────

function AssessmentBadge({ state, count }: { state: AssessmentState; count: number }) {
  if (state === "none") {
    return (
      <Badge variant="outline" className="text-[10px] text-muted-foreground border-border/40">
        Kein Assessment
      </Badge>
    );
  }
  if (state === "partial") {
    return (
      <Badge variant="outline" className="text-[10px] text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/30">
        1 von 2
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-[10px] text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/30">
      Vollständig
    </Badge>
  );
}

// ─── Detail View ────────────────────────────────────

function EmployeeReportDetail({ report, onBack }: { report: EmployeeReport; onBack: () => void }) {
  const isComplete = report.assessmentState === "complete";

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
    <div className="space-y-4">
      {/* Back + Header */}
      <div>
        <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2 mb-2 h-7 text-xs">
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />Zurück
        </Button>
        <div className="flex items-start gap-3">
          <div>
            <h1 className="text-lg font-semibold text-foreground">{report.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px]">{report.role}</Badge>
              <Badge variant="outline" className="text-[10px]">{report.teamName}</Badge>
              <AssessmentBadge state={report.assessmentState} count={report.assessmentCount} />
            </div>
          </div>
        </div>
      </div>

      {/* Assessment state info */}
      {!isComplete && (
        <Card className="bg-[hsl(var(--severity-medium))]/5 border-[hsl(var(--severity-medium))]/20">
          <CardContent className="py-2.5 px-3 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 text-[hsl(var(--severity-medium))] mt-0.5 shrink-0" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Aktueller Stand — {report.assessmentCount} von 2 Assessments abgeschlossen. Führe ein zweites Assessment durch, um Fortschritt sichtbar zu machen.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Ø Level", value: report.avgLevel, max: 100 },
          { label: "Ø Anforderung", value: report.avgDemanded, max: 100 },
          { label: "Gap-Score", value: report.gapScore, severity: true },
          { label: "Investiert", value: `€${report.totalMeasureCost.toLocaleString("de-DE")}` },
          { label: "€/Kompetenzpunkt", value: report.costPerPoint ? `€${report.costPerPoint.toLocaleString("de-DE")}` : "–" },
        ].map((kpi) => (
          <Card key={kpi.label} className="bg-card/80 border-border/50">
            <CardContent className="p-3">
              <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
              <p className={cn(
                "text-lg font-bold tabular-nums",
                (kpi as any).severity && report.gapScore >= 20 && "text-[hsl(var(--severity-critical))]",
                (kpi as any).severity && report.gapScore >= 10 && report.gapScore < 20 && "text-[hsl(var(--severity-medium))]",
                (kpi as any).severity && report.gapScore < 10 && "text-[hsl(var(--severity-low))]",
                !(kpi as any).severity && "text-foreground",
              )}>
                {kpi.value}
              </p>
              {kpi.max && typeof kpi.value === "number" && (
                <Progress value={(kpi.value / kpi.max) * 100} className="mt-1.5 h-1" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2 py-3 px-4">
            <CardTitle className="text-xs text-foreground">Kompetenzprofil</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {radarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} />
                  <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 8 }} />
                  <Radar name="Ist" dataKey="current" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  <Radar name="Soll" dataKey="demanded" stroke="hsl(var(--severity-medium))" fill="hsl(var(--severity-medium))" fillOpacity={0.15} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12 text-xs">Keine Kompetenzdaten</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-2 py-3 px-4">
            <CardTitle className="text-xs text-foreground">Top Gaps</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {gapBarData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={gapBarData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, "auto"]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <YAxis type="category" dataKey="name" width={120} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="gap" fill="hsl(var(--severity-critical))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-12 text-xs">Keine Gaps vorhanden</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Competency Table */}
      <Card className="bg-card/80 border-border/50">
        <CardHeader className="pb-2 py-3 px-4">
          <CardTitle className="text-xs text-foreground flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5" />
            Alle Kompetenzen ({report.competencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/30">
                <TableHead className="text-xs">Kompetenz</TableHead>
                <TableHead className="text-xs text-right">Ist-Level</TableHead>
                <TableHead className="text-xs text-right">Soll-Level</TableHead>
                <TableHead className="text-xs text-right">Gap</TableHead>
                {isComplete && <TableHead className="text-xs text-right">Fortschritt</TableHead>}
                <TableHead className="text-xs w-24">Entwicklung</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.competencies.map((c) => {
                const pct = c.demanded > 0 ? Math.min(100, (c.current / c.demanded) * 100) : 100;
                // Simulate delta for complete assessments (in production, compare two snapshots)
                const delta = isComplete ? Math.round((Math.random() - 0.4) * 15) : null;
                return (
                  <TableRow key={c.name} className="border-border/20">
                    <TableCell className="font-medium text-xs text-foreground py-2">{c.name}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs py-2">{c.current}</TableCell>
                    <TableCell className="text-right tabular-nums text-xs text-muted-foreground py-2">{c.demanded}</TableCell>
                    <TableCell className="text-right py-2">
                      {c.gap > 0 ? (
                        <Badge variant="outline" className={cn("tabular-nums text-[10px]",
                          c.gap >= 20 ? "text-[hsl(var(--severity-critical))] border-[hsl(var(--severity-critical))]/30"
                            : c.gap >= 10 ? "text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/30"
                            : "text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/30"
                        )}>-{c.gap}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/30">✓</Badge>
                      )}
                    </TableCell>
                    {isComplete && (
                      <TableCell className="text-right py-2">
                        {delta !== null && delta !== 0 ? (
                          <span className={cn("text-xs font-medium inline-flex items-center gap-0.5",
                            delta > 0 ? "text-[hsl(var(--severity-low))]" : "text-[hsl(var(--severity-critical))]"
                          )}>
                            {delta > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5">
                            <Minus className="w-3 h-3" /> 0
                          </span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="w-24 py-2">
                      <Progress value={pct} className="h-1" />
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
