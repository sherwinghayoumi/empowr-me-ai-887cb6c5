import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Wallet, TrendingUp, Euro, Target, ArrowUpRight, ArrowDownRight, Minus, Pencil, PiggyBank,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useMeasures, MEASURE_TYPES } from "@/hooks/useMeasures";
import { useTeams, useOrgStats } from "@/hooks/useOrgData";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

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
  measureType: string;
  cost: number;
  status: string;
  teamName: string;
  linkedGaps: number;
  costPerPoint: number | null;
}

// ─── Inline Budget Edit Dialog ──────────────────────

function BudgetEditDialog({ open, onOpenChange, teamId, teamName, currentBudget }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  teamId: string;
  teamName: string;
  currentBudget: number;
}) {
  const [value, setValue] = useState(currentBudget || "");
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const handleSave = async () => {
    setSaving(true);
    const numVal = value === "" ? null : Number(value);
    const { error } = await supabase
      .from("teams")
      .update({ annual_budget: numVal })
      .eq("id", teamId);
    setSaving(false);
    if (error) {
      toast.error("Fehler beim Speichern des Budgets");
    } else {
      toast.success(`Budget für ${teamName} aktualisiert`);
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">Budget festlegen</DialogTitle>
          <DialogDescription className="text-xs">{teamName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="budget-input" className="text-xs">Jahresbudget (€)</Label>
          <Input
            id="budget-input"
            type="number"
            min="0"
            step="1000"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="z.B. 50000"
            className="h-8 text-sm"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Speichern…" : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Component ──────────────────────────────────────

const BudgetPage = () => {
  const { data: measures, isLoading: measuresLoading } = useMeasures();
  const { data: teams, isLoading: teamsLoading } = useTeams();
  const { data: stats } = useOrgStats();
  const [editTeam, setEditTeam] = useState<{ id: string; name: string; budget: number } | null>(null);

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
      const annualBudget = team.annual_budget || 0;
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

  const hasBudgetData = teamBudgets.some((t) => t.annualBudget > 0);

  // ─── Global Stats ──────────────────────────────────

  const globalStats = useMemo(() => {
    const totalBudget = teamBudgets.reduce((s, t) => s + t.annualBudget, 0);
    const totalSpent = teamBudgets.reduce((s, t) => s + t.spent, 0);
    const totalPlanned = teamBudgets.reduce((s, t) => s + t.planned, 0);
    const totalAvailable = Math.max(0, totalBudget - totalSpent - totalPlanned);
    const completedMeasures = measures?.filter((m) => m.status === "completed") || [];
    const totalLinkedGaps = completedMeasures.reduce(
      (s, m) => s + (m.linked_competency_ids?.length || 0), 0
    );
    const costPerPoint = totalLinkedGaps > 0 && totalSpent > 0 ? Math.round(totalSpent / totalLinkedGaps) : null;
    const budgetUtilization = totalBudget > 0 ? Math.round(((totalSpent + totalPlanned) / totalBudget) * 100) : 0;

    return { totalBudget, totalSpent, totalPlanned, totalAvailable, costPerPoint, budgetUtilization, completedCount: completedMeasures.length };
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
          measureType: m.measure_type,
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
    return teamBudgets
      .filter((t) => t.annualBudget > 0 || t.spent > 0)
      .map((t) => ({
        name: t.name.length > 14 ? t.name.slice(0, 14) + "…" : t.name,
        Ausgegeben: t.spent,
        Geplant: t.planned,
        Verfügbar: t.available,
      }));
  }, [teamBudgets]);

  // ─── Helpers ───────────────────────────────────────

  const fmt = (v: number) => v.toLocaleString("de-DE");
  const getMeasureTypeLabel = (type: string) => MEASURE_TYPES.find((t) => t.value === type)?.label || type;

  const getUtilizationColor = (pct: number) => {
    if (pct > 90) return "text-[hsl(var(--severity-critical))]";
    if (pct > 70) return "text-[hsl(var(--severity-medium))]";
    return "text-[hsl(var(--severity-low))]";
  };

  const getUtilizationBarClass = (pct: number) => {
    if (pct > 90) return "bg-[hsl(var(--severity-critical))]";
    if (pct > 70) return "bg-[hsl(var(--severity-medium))]";
    return "bg-primary";
  };

  const getCostColor = (cpp: number | null) => {
    if (cpp === null) return "";
    if (cpp > 500) return "text-[hsl(var(--severity-critical))]";
    if (cpp >= 200) return "text-[hsl(var(--severity-medium))]";
    return "text-[hsl(var(--severity-low))]";
  };

  // ─── Loading ───────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card/80 border-border/50">
              <CardContent className="p-5"><Skeleton className="h-16" /></CardContent>
            </Card>
          ))}
        </div>
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
          value={globalStats.totalBudget > 0 ? `${fmt(globalStats.totalBudget)} €` : "—"}
          icon={Wallet}
          color="text-primary"
          sub={globalStats.totalBudget > 0 ? `${teamBudgets.filter(t => t.annualBudget > 0).length} Teams mit Budget` : "Budget in Teams festlegen"}
          index={0}
        />
        <KpiCard
          label="Verbraucht"
          value={`${fmt(globalStats.totalSpent)} €`}
          icon={Euro}
          color={globalStats.totalSpent > 0 ? "text-[hsl(var(--severity-medium))]" : "text-muted-foreground"}
          sub={`${globalStats.completedCount} abgeschl. Maßnahmen`}
          index={1}
        />
        <KpiCard
          label="Geplant"
          value={`${fmt(globalStats.totalPlanned)} €`}
          icon={TrendingUp}
          color="text-primary"
          sub={globalStats.totalBudget > 0 ? `${globalStats.budgetUtilization}% Auslastung` : undefined}
          index={2}
        />
        <KpiCard
          label="Verfügbar"
          value={globalStats.totalBudget > 0 ? `${fmt(globalStats.totalAvailable)} €` : "—"}
          icon={PiggyBank}
          color={globalStats.totalAvailable > 0 ? "text-[hsl(var(--severity-low))]" : "text-muted-foreground"}
          sub={globalStats.costPerPoint !== null ? `Ø ${fmt(globalStats.costPerPoint)} €/Kompetenzpunkt` : "Noch keine ROI-Daten"}
          index={3}
        />
      </div>

      {/* Empty State */}
      {!hasBudgetData && (
        <Card className="bg-card/80 border-border/50 animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
            <p className="text-sm font-medium text-foreground mb-1">Noch kein Budget definiert</p>
            <p className="text-xs text-muted-foreground max-w-md">
              Gehe zu Einstellungen → Teams, um Jahresbudgets festzulegen. Oder setze Budgets direkt in der Tabelle unten.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Budget per Team Table + Chart */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Budget Table with inline edit */}
        <div className="animate-fade-in-up" style={{ animationDelay: "140ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm">Budget pro Team</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">Team</TableHead>
                    <TableHead className="text-xs text-right">Budget</TableHead>
                    <TableHead className="text-xs text-right">Verbraucht</TableHead>
                    <TableHead className="text-xs text-right">Auslastung</TableHead>
                    <TableHead className="text-xs w-8"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamBudgets.map((t) => (
                    <TableRow key={t.id} className="border-border/20">
                      <TableCell className="text-xs py-2 font-medium">{t.name}</TableCell>
                      <TableCell className="text-xs py-2 text-right tabular-nums">
                        {t.annualBudget > 0 ? `${fmt(t.annualBudget)} €` : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right tabular-nums">
                        {fmt(t.spent)} €
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right">
                        {t.annualBudget > 0 ? (
                          <div className="flex items-center gap-2 justify-end">
                            <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                              <div className={`h-full rounded-full ${getUtilizationBarClass(t.utilization)}`} style={{ width: `${t.utilization}%` }} />
                            </div>
                            <span className={`tabular-nums ${getUtilizationColor(t.utilization)}`}>
                              {Math.round(t.utilization)}%
                            </span>
                          </div>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => setEditTeam({ id: t.id, name: t.name, budget: t.annualBudget })}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Stacked Bar Chart */}
        <div className="animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          <Card className="bg-card/80 border-border/50 h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-foreground text-sm">Budget-Verteilung</CardTitle>
            </CardHeader>
            <CardContent>
              {barChartData.length > 0 ? (
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
                  <p className="text-xs">Noch kein Budget definiert</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ROI Section */}
      <div className="animate-fade-in-up" style={{ animationDelay: "260ms" }}>
        <Card className="bg-card/80 border-border/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground text-sm">ROI pro Maßnahme</CardTitle>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Sortiert nach €/Kompetenzpunkt (beste zuerst)
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {measureROIs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-xs">Maßnahme</TableHead>
                    <TableHead className="text-xs">Typ</TableHead>
                    <TableHead className="text-xs text-right">Kosten</TableHead>
                    <TableHead className="text-xs text-center">Gaps</TableHead>
                    <TableHead className="text-xs text-right">€/Punkt</TableHead>
                    <TableHead className="text-xs text-center">Effizienz</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measureROIs.slice(0, 15).map((m) => (
                    <TableRow key={m.id} className="border-border/20">
                      <TableCell className="text-xs py-2">
                        <div>
                          <span className="font-medium">{m.title}</span>
                          <p className="text-[10px] text-muted-foreground">{m.teamName}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs py-2">
                        <Badge variant="outline" className="text-[10px]">
                          {getMeasureTypeLabel(m.measureType)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs py-2 text-right tabular-nums font-mono">
                        {fmt(m.cost)} €
                      </TableCell>
                      <TableCell className="text-xs py-2 text-center tabular-nums">
                        {m.linkedGaps > 0 ? m.linkedGaps : "—"}
                      </TableCell>
                      <TableCell className={`text-xs py-2 text-right tabular-nums font-mono ${getCostColor(m.costPerPoint)}`}>
                        {m.costPerPoint !== null ? `${fmt(m.costPerPoint)} €` : "—"}
                      </TableCell>
                      <TableCell className="text-center py-2">
                        {m.costPerPoint !== null ? (
                          m.costPerPoint < 200 ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-[hsl(var(--severity-low))] inline" />
                          ) : m.costPerPoint <= 500 ? (
                            <Minus className="w-3.5 h-3.5 text-[hsl(var(--severity-medium))] inline" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-[hsl(var(--severity-critical))] inline" />
                          )
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-6">
                <Target className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs">Keine Maßnahmen mit Kosten vorhanden</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Inline Budget Edit Dialog */}
      {editTeam && (
        <BudgetEditDialog
          open={!!editTeam}
          onOpenChange={(o) => !o && setEditTeam(null)}
          teamId={editTeam.id}
          teamName={editTeam.name}
          currentBudget={editTeam.budget}
        />
      )}
    </div>
  );
};

export default BudgetPage;
