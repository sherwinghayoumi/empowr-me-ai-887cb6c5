import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { SeverityBadge } from "@/components/SeverityBadge";
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
  Clock,
  ExternalLink,
} from "lucide-react";
import {
  useEmployees,
  useTeams,
  useOrgStats,
  useSkillGapAnalysis,
} from "@/hooks/useOrgData";
import { useAlerts } from "@/hooks/useAlerts";
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

const TOOLTIP_STYLE = {
  contentStyle: { background: 'hsl(222 47% 11%)', border: '1px solid hsl(222 40% 18%)', borderRadius: '6px', fontSize: '11px' },
  itemStyle: { color: 'hsl(210 40% 98%)' },
};

function severityLevel(gap: number): "kritisch" | "mittel" | "gering" {
  if (gap >= 20) return "kritisch";
  if (gap >= 10) return "mittel";
  return "gering";
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

  const currentGapCount = gapAnalysis?.currentGapCount || 0;
  const futureRiskCount = gapAnalysis?.futureRiskCount || 0;

  // Top 10 employees sorted by currentGapTotal (desc)
  const top10 = useMemo(() => {
    if (!gapAnalysis) return [];
    return [...gapAnalysis.byEmployee]
      .filter((e) => e.currentGapTotal > 0)
      .sort((a, b) => b.currentGapTotal - a.currentGapTotal)
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
        const gap = g.gap; // current gap (demanded - current)
        if (gap >= 30) critical++;
        else if (gap >= 15) medium++;
        else if (gap > 0) low++;
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

  // Alerts from centralized hook
  const { alerts, quarterInfo } = useAlerts();

  // ─── Loading ───────────────────────────────────────

  const isLoading = statsLoading || employeesLoading || gapsLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="bg-card/80 border-border/50 px-4 py-3">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-7 w-12" />
            </Card>
          ))}
        </div>
        <Card className="bg-card/80 border-border/50">
          <CardContent className="p-4">
            <Skeleton className="h-48" />
          </CardContent>
        </Card>
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
      label: "Aktuelle Gaps",
      value: currentGapCount,
      icon: AlertTriangle,
      color: currentGapCount > 0 ? "text-[hsl(var(--severity-critical))]" : "text-muted-foreground",
      pulse: currentGapCount > 5,
    },
    {
      label: "Budget verbraucht",
      value: budgetData.utilization,
      icon: Wallet,
      color: budgetData.utilization !== "—" ? "text-primary" : "text-muted-foreground",
    },
    {
      label: "€ / Kompetenzpunkt",
      value: budgetData.costPerPoint !== null ? `${budgetData.costPerPoint.toLocaleString("de-DE")} €` : "—",
      icon: Target,
      color: budgetData.costPerPoint !== null ? "text-primary" : "text-muted-foreground",
    },
  ];

  // ─── Render ────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="animate-fade-in-up space-y-2">
          {alerts.map((alert) => {
            const severityStyles =
              alert.severity === "critical"
                ? "bg-[hsl(var(--severity-critical))]/10 border-[hsl(var(--severity-critical))]/30"
                : alert.severity === "medium"
                  ? "bg-[hsl(var(--severity-medium))]/10 border-[hsl(var(--severity-medium))]/30"
                  : "bg-[hsl(var(--severity-low))]/10 border-[hsl(var(--severity-low))]/30";
            const iconColor =
              alert.severity === "critical"
                ? "text-[hsl(var(--severity-critical))]"
                : alert.severity === "medium"
                  ? "text-[hsl(var(--severity-medium))]"
                  : "text-[hsl(var(--severity-low))]";
            const Icon = alert.category === "quarter" ? Clock : AlertCircle;

            const content = (
              <div className={`flex items-center gap-3 px-3 py-2 rounded border ${severityStyles} ${alert.link ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}`}>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${iconColor} ${alert.severity === "critical" ? "animate-pulse-subtle" : ""}`} />
                <span className="text-xs text-foreground flex-1">{alert.text}</span>
                {alert.link && <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0" />}
              </div>
            );

            return alert.link ? (
              <Link key={alert.id} to={alert.link}>{content}</Link>
            ) : (
              <div key={alert.id}>{content}</div>
            );
          })}
        </div>
      )}

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((kpi, i) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={kpi.value}
            icon={kpi.icon}
            color={kpi.color}
            pulse={kpi.pulse}
            index={i}
          />
        ))}
      </div>

      <div className="grid lg:grid-cols-4 gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <Card className="lg:col-span-3 bg-card/80 border-border/50 transition-shadow duration-200 hover:shadow-lg hover:shadow-primary/5">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Top 10 Handlungsbedarf</CardTitle>
                <Link
                  to="/admin/skill-gaps"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Alle anzeigen <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {top10.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50">
                      <TableHead className="text-xs">Anwalt</TableHead>
                      <TableHead className="text-xs">Rolle</TableHead>
                      <TableHead className="text-xs text-right">Gap-Score</TableHead>
                      <TableHead className="text-xs">Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {top10.map((emp, i) => (
                      <TableRow
                        key={emp.id}
                        className="border-border/30 cursor-pointer hover:bg-muted/30 transition-colors duration-150 animate-fade-in-up opacity-0"
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        <TableCell className="text-xs py-2 font-medium">
                          <Link to="/admin/employees" className="hover:text-primary transition-colors">
                            {emp.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs py-2 text-muted-foreground">{emp.role || "—"}</TableCell>
                        <TableCell className="text-xs py-2 text-right tabular-nums font-semibold severity-critical">
                          {Math.round(emp.currentGapTotal)}
                        </TableCell>
                        <TableCell className="py-2">
                          <SeverityBadge severity={severityLevel(emp.currentGapTotal)} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Target className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-xs">Keine Kompetenzlücken erkannt</p>
                </div>
              )}
            </CardContent>
          </Card>

        {/* Gap Distribution Donut */}
          <Card className="bg-card/80 border-border/50">
            <CardHeader className="py-3 px-4">
              <CardTitle className="text-sm font-medium">Gap-Verteilung</CardTitle>
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
                      <Tooltip {...TOOLTIP_STYLE} />
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

      {/* Bottom Row: Budget per Team + Trend */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/80 border-border/50">
            <CardHeader className="py-3 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">Budget pro Team</CardTitle>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Verfügbar ab Schritt 3
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {budgetData.perTeam.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={budgetData.perTeam} barGap={2}>
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

        {/* Competency Level Trend */}
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

      {/* Team-Übersicht */}
      {teams && teams.length > 0 && (
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-sm font-medium">
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
      )}
    </div>
  );
};

export default AdminDashboard;
