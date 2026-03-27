import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  TrendingUp,
  AlertTriangle,
  Wallet,
  Target,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  useEmployees,
  useTeams,
  useOrgStats,
  useSkillGapAnalysis,
} from "@/hooks/useOrgData";
import { useMeasures } from "@/hooks/useMeasures";
import { useAuth } from "@/contexts/AuthContext";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";

// ─── Helpers ────────────────────────────────────────

function severityClass(gap: number) {
  if (gap >= 20) return "text-[hsl(var(--severity-critical))]";
  if (gap >= 10) return "text-[hsl(var(--severity-medium))]";
  return "text-[hsl(var(--severity-low))]";
}

function severityBadge(gap: number) {
  if (gap >= 20)
    return (
      <Badge className="bg-[hsl(var(--severity-critical))]/15 text-[hsl(var(--severity-critical))] border-[hsl(var(--severity-critical))]/30 text-xs">
        Kritisch
      </Badge>
    );
  if (gap >= 10)
    return (
      <Badge className="bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/30 text-xs">
        Mittel
      </Badge>
    );
  return (
    <Badge className="bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/30 text-xs">
      Gering
    </Badge>
  );
}

// ─── Component ──────────────────────────────────────

const AdminDashboard = () => {
  const { organization } = useAuth();
  const { data: stats, isLoading: statsLoading } = useOrgStats();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: gapAnalysis, isLoading: gapsLoading } = useSkillGapAnalysis();
  const { data: measures } = useMeasures();

  // ─── Derived data ──────────────────────────────────

  const criticalGapCount = useMemo(() => {
    if (!gapAnalysis) return 0;
    return gapAnalysis.criticalGaps.length;
  }, [gapAnalysis]);

  // Top 10 employees sorted by total gap (desc)
  const top10 = useMemo(() => {
    if (!gapAnalysis) return [];
    return [...gapAnalysis.byEmployee]
      .filter((e) => e.totalGap > 0)
      .sort((a, b) => b.totalGap - a.totalGap)
      .slice(0, 10);
  }, [gapAnalysis]);

  // Gap distribution for donut chart
  const gapDistribution = useMemo(() => {
    if (!gapAnalysis) return [];
    let critical = 0;
    let medium = 0;
    let low = 0;
    for (const emp of gapAnalysis.byEmployee) {
      for (const g of emp.gaps) {
        if (g.gap >= 20) critical++;
        else if (g.gap >= 10) medium++;
        else if (g.gap > 0) low++;
      }
    }
    return [
      { name: "Kritisch", value: critical, fill: "hsl(0 84% 60%)" },
      { name: "Mittel", value: medium, fill: "hsl(45 75% 50%)" },
      { name: "Gering", value: low, fill: "hsl(142 71% 45%)" },
    ].filter((d) => d.value > 0);
  }, [gapAnalysis]);

  // Budget from measures data
  const budgetData = useMemo(() => {
    if (!teams || !measures) return { perTeam: [], totalSpent: 0, totalBudget: 0, costPerPoint: null as number | null, utilization: "—" };
    const perTeam = teams.map((t) => {
      const tm = measures.filter((m) => m.assigned_team_id === t.id);
      const spent = tm.filter((m) => m.status === "completed").reduce((s, m) => s + (m.cost || 0), 0);
      const planned = tm.filter((m) => m.status === "planned" || m.status === "active").reduce((s, m) => s + (m.cost || 0), 0);
      const budget = (t as any).annual_budget || 0;
      return { name: t.name.length > 12 ? t.name.slice(0, 12) + "…" : t.name, spent, planned, available: Math.max(0, budget - spent - planned) };
    });
    const totalSpent = perTeam.reduce((s, t) => s + t.spent, 0);
    const totalBudget = teams.reduce((s, t) => s + ((t as any).annual_budget || 0), 0);
    const completedWithGaps = measures.filter((m) => m.status === "completed" && m.linked_competency_ids?.length > 0);
    const totalGaps = completedWithGaps.reduce((s, m) => s + (m.linked_competency_ids?.length || 0), 0);
    const costPerPoint = totalGaps > 0 && totalSpent > 0 ? Math.round(totalSpent / totalGaps) : null;
    const utilization = totalBudget > 0 ? `${Math.round(((totalSpent + perTeam.reduce((s, t) => s + t.planned, 0)) / totalBudget) * 100)}%` : "—";
    return { perTeam, totalSpent, totalBudget, costPerPoint, utilization };
  }, [teams, measures]);

  // Alerts
  const alerts = useMemo(() => {
    const items: { text: string; severity: "critical" | "medium" | "low" }[] = [];

    // Employees without competency data
    const noProfile = employees?.filter(
      (e) => !e.competencies || e.competencies.length === 0
    );
    if (noProfile && noProfile.length > 0) {
      items.push({
        text: `${noProfile.length} Anwält${noProfile.length === 1 ? "" : "e"} ohne Kompetenzprofil`,
        severity: noProfile.length >= 3 ? "critical" : "medium",
      });
    }

    if (criticalGapCount > 0) {
      items.push({
        text: `${criticalGapCount} kritische Kompetenzlücke${criticalGapCount === 1 ? "" : "n"} identifiziert`,
        severity: "critical",
      });
    }

    return items;
  }, [employees, criticalGapCount]);

  // ─── Loading ───────────────────────────────────────

  const isLoading = statsLoading || employeesLoading || gapsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-card/80 border-border/50">
              <CardContent className="p-5">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-card/80 border-border/50">
              <CardContent className="p-6">
                <Skeleton className="h-64" />
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card/80 border-border/50">
            <CardContent className="p-6">
              <Skeleton className="h-64" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── KPI Data ──────────────────────────────────────

  const kpis = [
    {
      label: "Anwälte",
      value: stats?.employeeCount || 0,
      icon: Users,
      color: "text-primary",
    },
    {
      label: "Ø Kompetenzlevel",
      value: `${stats?.avgCompetencyLevel || 0}%`,
      icon: TrendingUp,
      color: "text-[hsl(var(--severity-low))]",
    },
    {
      label: "Kritische Gaps",
      value: criticalGapCount,
      icon: AlertTriangle,
      color: criticalGapCount > 0 ? "text-[hsl(var(--severity-critical))]" : "text-muted-foreground",
      pulse: criticalGapCount > 0,
    },
    {
      label: "Budget verbraucht",
      value: "—",
      icon: Wallet,
      color: "text-muted-foreground",
      sublabel: "ab Schritt 4",
    },
    {
      label: "€ / Kompetenzpunkt",
      value: "—",
      icon: Target,
      color: "text-muted-foreground",
      sublabel: "ab Schritt 4",
    },
  ];

  // ─── Render ────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="animate-fade-in-up space-y-2">
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${
                alert.severity === "critical"
                  ? "bg-[hsl(var(--severity-critical))]/10 border-[hsl(var(--severity-critical))]/30"
                  : alert.severity === "medium"
                    ? "bg-[hsl(var(--severity-medium))]/10 border-[hsl(var(--severity-medium))]/30"
                    : "bg-[hsl(var(--severity-low))]/10 border-[hsl(var(--severity-low))]/30"
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 shrink-0 ${
                  alert.severity === "critical"
                    ? "text-[hsl(var(--severity-critical))]"
                    : alert.severity === "medium"
                      ? "text-[hsl(var(--severity-medium))]"
                      : "text-[hsl(var(--severity-low))]"
                } ${alert.severity === "critical" ? "animate-pulse-subtle" : ""}`}
              />
              <span className="text-sm text-foreground">{alert.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="animate-fade-in-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <Card className="bg-card/80 border-border/50 hover-lift">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {kpi.label}
                    </span>
                    <Icon className={`w-4 h-4 ${kpi.color}`} />
                  </div>
                  <p
                    className={`text-2xl font-bold tabular-nums ${kpi.color} ${
                      kpi.pulse ? "animate-pulse-subtle" : ""
                    }`}
                  >
                    {kpi.value}
                  </p>
                  {kpi.sublabel && (
                    <p className="text-[10px] text-muted-foreground mt-1">{kpi.sublabel}</p>
                  )}
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {/* Main Row: Top 10 + Gap Donut */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Top 10 Handlungsbedarf */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">
                  Top 10 Handlungsbedarf
                </CardTitle>
                <Link
                  to="/admin/skill-gaps"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Alle anzeigen <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {top10.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs">Anwalt</TableHead>
                      <TableHead className="text-xs">Rolle</TableHead>
                      <TableHead className="text-xs text-right">Gap-Score</TableHead>
                      <TableHead className="text-xs text-right">Schwere</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top10.map((emp) => (
                      <TableRow
                        key={emp.id}
                        className="border-border/20 cursor-pointer hover:bg-muted/30"
                      >
                        <TableCell className="font-medium text-sm py-3">
                          <Link
                            to={`/admin/employees`}
                            className="hover:text-primary transition-colors"
                          >
                            {emp.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground py-3">
                          {emp.role || "—"}
                        </TableCell>
                        <TableCell
                          className={`text-sm font-mono text-right tabular-nums py-3 ${severityClass(emp.totalGap)}`}
                        >
                          {Math.round(emp.totalGap)}
                        </TableCell>
                        <TableCell className="text-right py-3">
                          {severityBadge(emp.totalGap)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Target className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Keine Kompetenzlücken erkannt</p>
                  <p className="text-xs mt-1">Laden Sie Assessments hoch, um Gaps zu analysieren</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gap Distribution Donut */}
        <div className="animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Gap-Verteilung</CardTitle>
            </CardHeader>
            <CardContent>
              {gapDistribution.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={gapDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        animationDuration={800}
                      >
                        {gapDistribution.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} stroke="transparent" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(222 47% 11%)",
                          border: "1px solid hsl(222 40% 20% / 0.5)",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                        itemStyle={{ color: "hsl(210 40% 98%)" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {gapDistribution.map((d) => (
                      <div key={d.name} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: d.fill }}
                        />
                        <span className="text-muted-foreground">{d.name}</span>
                        <span className="font-medium tabular-nums text-foreground">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Keine Gap-Daten</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row: Budget per Team + Trend */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Budget per Team */}
        <div className="animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">Budget pro Team</CardTitle>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Verfügbar ab Schritt 3
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {budgetPerTeam.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={budgetPerTeam} barGap={2}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(222 40% 20% / 0.3)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(222 47% 11%)",
                        border: "1px solid hsl(222 40% 20% / 0.5)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      itemStyle={{ color: "hsl(210 40% 98%)" }}
                    />
                    <Bar
                      dataKey="spent"
                      name="Ausgegeben"
                      fill="hsl(45 75% 50%)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                    <Bar
                      dataKey="planned"
                      name="Geplant"
                      fill="hsl(45 75% 50% / 0.4)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                    <Bar
                      dataKey="available"
                      name="Verfügbar"
                      fill="hsl(222 40% 25%)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wallet className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Keine Teams angelegt</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Competency Level Trend */}
        <div className="animate-fade-in-up" style={{ animationDelay: "500ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">
                  Ø Kompetenzlevel Trend
                </CardTitle>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Quartals-Verlauf
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart
                  data={[
                    { quarter: "Aktuell", level: stats?.avgCompetencyLevel || 0 },
                  ]}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(222 40% 20% / 0.3)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="quarter"
                    tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(222 47% 11%)",
                      border: "1px solid hsl(222 40% 20% / 0.5)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    itemStyle={{ color: "hsl(210 40% 98%)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="level"
                    name="Ø Level"
                    stroke="hsl(45 75% 50%)"
                    fill="hsl(45 75% 50% / 0.15)"
                    strokeWidth={2}
                    animationDuration={800}
                    dot={{ fill: "hsl(45 75% 50%)", r: 4 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground text-center mt-2">
                Weitere Quartale werden nach dem nächsten Assessment-Zyklus sichtbar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Team Competency Radar placeholder */}
      {teams && teams.length > 0 && (
        <div className="animate-fade-in-up" style={{ animationDelay: "600ms" }}>
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">
                Team-Übersicht
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {teams.map((team) => (
                  <div
                    key={team.id}
                    className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm text-foreground">{team.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {team.member_count || 0} Mitglieder
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary animate-progress-fill"
                          style={{
                            width: `${Math.min(team.average_score || 0, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono tabular-nums text-foreground">
                        {Math.round(team.average_score || 0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
