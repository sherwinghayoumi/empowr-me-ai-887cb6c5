import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
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
  Wallet,
  TrendingUp,
  Euro,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useMeasures, MEASURE_STATUSES } from "@/hooks/useMeasures";
import { useTeams, useEmployees, useOrgStats } from "@/hooks/useOrgData";

// ─── Types ──────────────────────────────────────────

interface TeamBudget {
  id: string;
  name: string;
  annualBudget: number;
  spent: number;
  planned: number;
  available: number;
  utilization: number;
}

interface MeasureROI {
  id: string;
  title: string;
  cost: number;
  status: string;
  teamName: string;
  linkedGaps: number;
  costPerPoint: number | null;
}

// ─── Component ──────────────────────────────────────

const BudgetPage = () => {
  const { data: measures, isLoading: measuresLoading } = useMeasures();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: stats } = useOrgStats();

  const isLoading = measuresLoading || teamsLoading;

  // ─── Team Budget Calculations ──────────────────────

  const teamBudgets = useMemo<TeamBudget[]>(() => {
    if (!teams || !measures) return [];

    return teams.map((team) => {
      const teamMeasures = measures.filter((m) => m.assigned_team_id === team.id);
      const spent = teamMeasures
        .filter((m) => m.status === "completed")
        .reduce((s, m) => s + (m.cost || 0), 0);
      const planned = teamMeasures
        .filter((m) => m.status === "planned" || m.status === "active")
        .reduce((s, m) => s + (m.cost || 0), 0);
      const annualBudget = (team as any).annual_budget || 0;
      const available = Math.max(0, annualBudget - spent - planned);
      const utilization = annualBudget > 0 ? ((spent + planned) / annualBudget) * 100 : 0;

      return {
        id: team.id,
        name: team.name,
        annualBudget,
        spent,
        planned,
        available,
        utilization: Math.min(utilization, 100),
      };
    });
  }, [teams, measures]);

  // ─── Global Stats ──────────────────────────────────

  const globalStats = useMemo(() => {
    const totalBudget = teamBudgets.reduce((s, t) => s + t.annualBudget, 0);
    const totalSpent = teamBudgets.reduce((s, t) => s + t.spent, 0);
    const totalPlanned = teamBudgets.reduce((s, t) => s + t.planned, 0);
    const completedMeasures = measures?.filter((m) => m.status === "completed") || [];
    const totalLinkedGaps = completedMeasures.reduce(
      (s, m) => s + (m.linked_competency_ids?.length || 0),
      0
    );
    const costPerPoint =
      totalLinkedGaps > 0 && totalSpent > 0
        ? Math.round(totalSpent / totalLinkedGaps)
        : null;
    const budgetUtilization = totalBudget > 0 ? Math.round(((totalSpent + totalPlanned) / totalBudget) * 100) : 0;

    return { totalBudget, totalSpent, totalPlanned, costPerPoint, budgetUtilization, completedCount: completedMeasures.length };
  }, [teamBudgets, measures]);

  // ─── ROI per Measure ───────────────────────────────

  const measureROIs = useMemo<MeasureROI[]>(() => {
    if (!measures) return [];
    return measures
      .filter((m) => m.cost && m.cost > 0)
      .map((m) => {
        const linkedGaps = m.linked_competency_ids?.length || 0;
        const costPerPoint = linkedGaps > 0 ? Math.round(m.cost / linkedGaps) : null;
        const team = teams?.find((t) => t.id === m.assigned_team_id);
        return {
          id: m.id,
          title: m.title,
          cost: m.cost,
          status: m.status,
          teamName: team?.name || "—",
          linkedGaps,
          costPerPoint,
        };
      })
      .sort((a, b) => (a.costPerPoint || Infinity) - (b.costPerPoint || Infinity));
  }, [measures, teams]);

  // ─── Bar Chart Data ────────────────────────────────

  const barChartData = useMemo(() => {
    return teamBudgets.map((t) => ({
      name: t.name.length > 14 ? t.name.slice(0, 14) + "…" : t.name,
      Ausgegeben: t.spent,
      Geplant: t.planned,
      Verfügbar: t.available,
    }));
  }, [teamBudgets]);

  // ─── ROI Comparison Chart ─────────────────────────

  const roiChartData = useMemo(() => {
    return measureROIs
      .filter((m) => m.costPerPoint !== null)
      .slice(0, 10)
      .map((m) => ({
        name: m.title.length > 20 ? m.title.slice(0, 20) + "…" : m.title,
        "€/Kompetenzpunkt": m.costPerPoint,
      }));
  }, [measureROIs]);

  // ─── Loading ───────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card/80 border-border/50">
              <CardContent className="p-5"><Skeleton className="h-16" /></CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card/80 border-border/50"><CardContent className="p-6"><Skeleton className="h-64" /></CardContent></Card>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="text-lg font-semibold text-foreground tracking-tight">Budget & ROI</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Budget-Auslastung pro Team, Kosten-Effizienz und €/Kompetenzpunkt-Analyse
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
        <KpiCard
          label="Gesamtbudget"
          value={globalStats.totalBudget > 0 ? `${globalStats.totalBudget.toLocaleString("de-DE")} €` : "—"}
          icon={Wallet}
          color="text-primary"
          sub={globalStats.totalBudget > 0 ? `${teamBudgets.filter(t => t.annualBudget > 0).length} Teams mit Budget` : "Budget in Team-Settings festlegen"}
          index={0}
        />
        <KpiCard
          label="Ausgegeben"
          value={`${globalStats.totalSpent.toLocaleString("de-DE")} €`}
          icon={Euro}
          color={globalStats.totalSpent > 0 ? "text-[hsl(var(--severity-medium))]" : "text-muted-foreground"}
          sub={`${globalStats.completedCount} abgeschl. Maßnahmen`}
          index={1}
        />
        <KpiCard
          label="Budget verbraucht"
          value={globalStats.totalBudget > 0 ? `${globalStats.budgetUtilization}%` : "—"}
          icon={TrendingUp}
          color={globalStats.budgetUtilization > 80 ? "text-[hsl(var(--severity-critical))]" : globalStats.budgetUtilization > 50 ? "text-[hsl(var(--severity-medium))]" : "text-[hsl(var(--severity-low))]"}
          sub={globalStats.totalBudget > 0 ? `${globalStats.totalPlanned.toLocaleString("de-DE")} € geplant` : undefined}
          index={2}
        />
        <KpiCard
          label="€ / Kompetenzpunkt"
          value={globalStats.costPerPoint !== null ? `${globalStats.costPerPoint.toLocaleString("de-DE")} €` : "—"}
          icon={Target}
          color="text-primary"
          sub={globalStats.costPerPoint !== null ? "Basierend auf abgeschl. Maßnahmen" : "Noch keine abgeschl. Maßnahmen"}
          index={3}
        />
      </div>

      {/* Budget per Team + Utilization */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Stacked Bar Chart */}
        <div className="animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Budget pro Team</CardTitle>
            </CardHeader>
            <CardContent>
              {barChartData.length > 0 && teamBudgets.some(t => t.annualBudget > 0 || t.spent > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barChartData} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 40% 20% / 0.3)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(222 40% 20% / 0.5)", borderRadius: "8px", fontSize: "12px" }}
                      itemStyle={{ color: "hsl(210 40% 98%)" }}
                      formatter={(value: number) => [`${value.toLocaleString("de-DE")} €`]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", color: "hsl(215 20% 60%)" }} />
                    <Bar dataKey="Ausgegeben" fill="hsl(45 75% 50%)" radius={[4, 4, 0, 0]} animationDuration={800} />
                    <Bar dataKey="Geplant" fill="hsl(45 75% 50% / 0.4)" radius={[4, 4, 0, 0]} animationDuration={800} />
                    <Bar dataKey="Verfügbar" fill="hsl(222 40% 25%)" radius={[4, 4, 0, 0]} animationDuration={800} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Wallet className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Legen Sie Budgets in den Team-Settings fest</p>
                  <p className="text-xs mt-1">und erstellen Sie Maßnahmen mit Kosten</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Budget Utilization Progress Bars */}
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-base">Budget-Auslastung</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamBudgets.length > 0 ? (
                  teamBudgets.map((team) => {
                    const hasData = team.annualBudget > 0;
                    const spentPct = hasData ? Math.min((team.spent / team.annualBudget) * 100, 100) : 0;
                    const plannedPct = hasData ? Math.min((team.planned / team.annualBudget) * 100, 100 - spentPct) : 0;
                    const isOverBudget = team.spent + team.planned > team.annualBudget && team.annualBudget > 0;
                    return (
                      <div key={team.id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-foreground">{team.name}</span>
                          <div className="flex items-center gap-2">
                            {isOverBudget && (
                              <Badge className="bg-[hsl(var(--severity-critical))]/15 text-[hsl(var(--severity-critical))] border-[hsl(var(--severity-critical))]/30 text-[10px]">
                                Überbudget
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {hasData
                                ? `${team.spent.toLocaleString("de-DE")} / ${team.annualBudget.toLocaleString("de-DE")} €`
                                : "Kein Budget"}
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 rounded-full bg-muted overflow-hidden flex">
                          <div
                            className="h-full bg-primary rounded-l-full animate-progress-fill"
                            style={{ width: `${spentPct}%` }}
                          />
                          <div
                            className="h-full bg-primary/30"
                            style={{ width: `${plannedPct}%` }}
                          />
                        </div>
                        <div className="flex gap-4 text-[10px] text-muted-foreground">
                          <span>Ausgegeben: {team.spent.toLocaleString("de-DE")} €</span>
                          <span>Geplant: {team.planned.toLocaleString("de-DE")} €</span>
                          {hasData && <span>Verfügbar: {team.available.toLocaleString("de-DE")} €</span>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Keine Teams vorhanden</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ROI Section */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* ROI Table */}
        <div className="animate-fade-in-up" style={{ animationDelay: "260ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">ROI pro Maßnahme</CardTitle>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  €/Kompetenzpunkt
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {measureROIs.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/30 hover:bg-transparent">
                      <TableHead className="text-xs">Maßnahme</TableHead>
                      <TableHead className="text-xs text-right">Kosten</TableHead>
                      <TableHead className="text-xs text-center">Gaps</TableHead>
                      <TableHead className="text-xs text-right">€/Punkt</TableHead>
                      <TableHead className="text-xs text-center">Effizienz</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measureROIs.slice(0, 12).map((m) => (
                      <TableRow key={m.id} className="border-border/20">
                        <TableCell className="text-sm py-2.5">
                          <div>
                            <span className="font-medium">{m.title}</span>
                            <p className="text-[10px] text-muted-foreground">{m.teamName}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-mono tabular-nums text-right py-2.5">
                          {m.cost.toLocaleString("de-DE")} €
                        </TableCell>
                        <TableCell className="text-sm text-center py-2.5 tabular-nums">
                          {m.linkedGaps || "—"}
                        </TableCell>
                        <TableCell className="text-sm font-mono tabular-nums text-right py-2.5">
                          {m.costPerPoint !== null ? (
                            <span className={
                              m.costPerPoint < 500 ? "text-[hsl(var(--severity-low))]" :
                              m.costPerPoint < 1500 ? "text-[hsl(var(--severity-medium))]" :
                              "text-[hsl(var(--severity-critical))]"
                            }>
                              {m.costPerPoint.toLocaleString("de-DE")} €
                            </span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-center py-2.5">
                          {m.costPerPoint !== null ? (
                            m.costPerPoint < 500 ? (
                              <ArrowUpRight className="w-4 h-4 text-[hsl(var(--severity-low))] inline" />
                            ) : m.costPerPoint < 1500 ? (
                              <Minus className="w-4 h-4 text-[hsl(var(--severity-medium))] inline" />
                            ) : (
                              <ArrowDownRight className="w-4 h-4 text-[hsl(var(--severity-critical))] inline" />
                            )
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-6">
                  <Target className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Keine Maßnahmen mit Kosten vorhanden</p>
                  <p className="text-xs mt-1">Erstellen Sie Maßnahmen mit Kosten und verknüpfen Sie Skill-Gaps</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ROI Comparison Bar Chart */}
        <div className="animate-fade-in-up" style={{ animationDelay: "320ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base">ROI-Vergleich</CardTitle>
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Niedrigere €/Punkt = besser
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {roiChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={roiChartData} layout="vertical" barSize={16}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 40% 20% / 0.3)" horizontal={false} />
                    <XAxis
                      type="number"
                      tick={{ fill: "hsl(215 20% 60%)", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `${v} €`}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "hsl(215 20% 60%)", fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={130}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(222 47% 11%)", border: "1px solid hsl(222 40% 20% / 0.5)", borderRadius: "8px", fontSize: "12px" }}
                      itemStyle={{ color: "hsl(210 40% 98%)" }}
                      formatter={(value: number) => [`${value.toLocaleString("de-DE")} €`, "€/Kompetenzpunkt"]}
                    />
                    <Bar
                      dataKey="€/Kompetenzpunkt"
                      fill="hsl(45 75% 50%)"
                      radius={[0, 4, 4, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm">Verknüpfen Sie Maßnahmen mit Skill-Gaps</p>
                  <p className="text-xs mt-1">um den ROI-Vergleich zu berechnen</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
