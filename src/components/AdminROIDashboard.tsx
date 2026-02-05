import { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AnimatedCounter } from "./AnimatedCounter";
import { 
  ChevronRight,
  Target,
  Users,
  Building2,
  ArrowUpRight,
  Zap,
  Clock,
  Euro,
  BarChart3,
  CheckCircle2,
  Calendar,
  AlertCircle
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { useROICalculation } from "@/hooks/useROICalculation";

interface AdminROIDashboardProps {
  className?: string;
}

export function AdminROIDashboard({ className }: AdminROIDashboardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const { metrics, isLoading, isAvailable, daysUntilAvailable } = useROICalculation();

  if (isLoading) {
    return (
      <div className={className}>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  // ROI not yet available - show waiting state
  if (!isAvailable || !metrics) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {/* Waiting State */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-muted/50 via-muted/30 to-transparent p-4 border border-border/50">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                  ROI-Analyse
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-muted-foreground" />
                  <span className="text-lg font-semibold text-foreground">
                    Noch nicht verfügbar
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Die ROI-Berechnung wird nach dem ersten Quartal freigeschaltet.
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-muted-foreground" />
              </div>
            </div>
            
            {daysUntilAvailable !== null && (
              <div className="mt-4 p-3 rounded-lg bg-secondary/30 border border-border/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verfügbar in</span>
                  <Badge variant="outline" className="text-sm">
                    {daysUntilAvailable} Tagen
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground">
              <p>
                Die ROI-Berechnung basiert auf echten Daten Ihrer Organisation und wird nach 
                Abschluss des ersten Quartals automatisch aktiviert.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* ADMIN: Compelling ROI Dashboard Preview */}
      <div className="space-y-4">
        {/* Hero ROI Metric - The Money Shot */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--skill-very-strong))]/20 via-[hsl(var(--skill-very-strong))]/10 to-transparent p-4 border border-[hsl(var(--skill-very-strong))]/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-[hsl(var(--skill-very-strong))] uppercase tracking-wider mb-1">
                ROI – {metrics.monthsActive} Monate
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  <AnimatedCounter value={metrics.roiPercentage} suffix="%" duration={1500} />
                </span>
                <div className="flex items-center gap-1 text-[hsl(var(--skill-very-strong))]">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">+{metrics.productivityGain}% Produktivität</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-[hsl(var(--skill-very-strong))]">
                  €{metrics.totalROI.toLocaleString("de-DE")}
                </span>
                {" "}Wertschöpfung
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center">
              <Euro className="w-6 h-6 text-[hsl(var(--skill-very-strong))]" />
            </div>
          </div>
          
          {/* Mini Trend Chart */}
          {metrics.monthlyTrend.length > 0 && (
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorValueAdmin" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--skill-very-strong))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--skill-very-strong))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--skill-very-strong))" 
                    strokeWidth={2}
                    fill="url(#colorValueAdmin)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Skill Gap Reduction */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Skill Gaps</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                -<AnimatedCounter value={metrics.skillGapReduction} suffix="%" duration={1200} />
              </span>
              <span className="text-xs text-[hsl(var(--skill-very-strong))]">reduziert</span>
            </div>
          </div>

          {/* Industry Benchmark */}
          <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">vs. Branche</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-foreground">
                {metrics.industryBenchmarkComparison}x
              </span>
              <span className="text-xs text-[hsl(var(--skill-very-strong))]">schneller</span>
            </div>
          </div>
        </div>

        {/* Saved Recruiting Costs Highlight */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Recruiting-Kosten gespart</span>
          </div>
          <span className="text-base font-bold text-primary">
            €{metrics.savedRecruitingCosts.toLocaleString("de-DE")}
          </span>
        </div>

        {/* Expand Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group"
          onClick={() => setIsDetailOpen(true)}
        >
          <span>Vollständiger ROI-Report</span>
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Detail Panel */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Unternehmens-ROI Report
            </SheetTitle>
            <SheetDescription>
              Vollständige Analyse der Investitionsrendite ({metrics.monthsActive} Monate)
            </SheetDescription>
          </SheetHeader>

          {/* Hero Section in Detail */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-[hsl(var(--skill-very-strong))]/20 via-[hsl(var(--skill-very-strong))]/10 to-transparent border border-[hsl(var(--skill-very-strong))]/20">
            <p className="text-sm font-medium text-[hsl(var(--skill-very-strong))] uppercase tracking-wider mb-2">
              ROI – {metrics.monthsActive} Monate
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-foreground">
                {metrics.roiPercentage}%
              </span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--skill-very-strong))]/20">
                <ArrowUpRight className="w-4 h-4 text-[hsl(var(--skill-very-strong))]" />
                <span className="text-sm font-medium text-[hsl(var(--skill-very-strong))]">Wachstum</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground mt-2">
              <span className="font-bold text-foreground text-2xl">
                €{metrics.totalROI.toLocaleString("de-DE")}
              </span>
              {" "}Wertschöpfung generiert
            </p>
          </div>

          {/* Trend Chart */}
          {metrics.monthlyTrend.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
              <h4 className="font-medium text-foreground mb-1">Kompetenzniveau-Entwicklung</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Ihr Team vs. Branchendurchschnitt
              </p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.monthlyTrend}>
                    <defs>
                      <linearGradient id="colorValueFull" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--skill-very-strong))" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="hsl(var(--skill-very-strong))" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="hsl(var(--muted-foreground))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      domain={[40, 100]}
                      hide
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="url(#colorBaseline)"
                      name="Branche"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--skill-very-strong))" 
                      strokeWidth={2}
                      fill="url(#colorValueFull)"
                      name="Ihr Team"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="mt-6">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Kosten-Breakdown (Fully Loaded)
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Lizenzgebühren</p>
                  <p className="text-xs text-muted-foreground">{metrics.methodology.directCosts.description}</p>
                </div>
                <span className="font-semibold text-foreground">
                  €{metrics.methodology.directCosts.licenseFees.toLocaleString("de-DE")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Administration</p>
                  <p className="text-xs text-muted-foreground">{metrics.methodology.indirectCosts.description}</p>
                </div>
                <span className="font-semibold text-foreground">
                  €{metrics.methodology.indirectCosts.totalAdminCosts.toLocaleString("de-DE")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-medium text-foreground">Opportunitätskosten</p>
                  <p className="text-xs text-muted-foreground">{metrics.methodology.opportunityCosts.description}</p>
                </div>
                <span className="font-semibold text-foreground">
                  €{metrics.methodology.opportunityCosts.totalOpportunityCosts.toLocaleString("de-DE")}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm font-medium text-foreground">Gesamtkosten</p>
                <span className="font-bold text-primary">
                  €{metrics.methodology.fullyLoadedCosts.toLocaleString("de-DE")}
                </span>
              </div>
            </div>
          </div>

          {/* Benefits Breakdown */}
          <div className="mt-6">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[hsl(var(--skill-very-strong))]" />
              Nutzen-Breakdown (konservativ)
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Fluktuation reduziert</p>
                  <span className="font-semibold text-[hsl(var(--skill-very-strong))]">
                    €{metrics.methodology.benefits.turnover.adjustedSavings.toLocaleString("de-DE")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.methodology.benefits.turnover.savedEmployees} MA gehalten × €{metrics.methodology.benefits.turnover.avgReplacementCost.toLocaleString("de-DE")} × {Math.round(metrics.methodology.benefits.turnover.isolationFactor * 100)}% Isolationsfaktor
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Produktivitätssteigerung</p>
                  <span className="font-semibold text-[hsl(var(--skill-very-strong))]">
                    €{metrics.methodology.benefits.productivity.adjustedValue.toLocaleString("de-DE")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(metrics.methodology.benefits.productivity.productivityImprovementPercent * 100)}% Steigerung × {Math.round(metrics.methodology.benefits.productivity.isolationFactor * 100)}% Isolationsfaktor
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Recruiting-Kosten gespart</p>
                  <span className="font-semibold text-[hsl(var(--skill-very-strong))]">
                    €{metrics.methodology.benefits.recruiting.adjustedSavings.toLocaleString("de-DE")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.methodology.benefits.recruiting.externalHiresAvoided} Intern besetzt × €{metrics.methodology.benefits.recruiting.avgRecruitingCostPerHire.toLocaleString("de-DE")} × {Math.round(metrics.methodology.benefits.recruiting.isolationFactor * 100)}% Isolationsfaktor
                </p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/30">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground">Time-to-Competency</p>
                  <span className="font-semibold text-[hsl(var(--skill-very-strong))]">
                    €{metrics.methodology.benefits.competency.adjustedValue.toLocaleString("de-DE")}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {metrics.methodology.benefits.competency.monthsReduced} Monate schneller × {metrics.methodology.benefits.competency.employeesAffected} MA × {Math.round(metrics.methodology.benefits.competency.isolationFactor * 100)}% Isolationsfaktor
                </p>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--skill-very-strong))]/10 border border-[hsl(var(--skill-very-strong))]/20">
                <p className="text-sm font-medium text-foreground">Gesamtnutzen (adjustiert)</p>
                <span className="font-bold text-[hsl(var(--skill-very-strong))]">
                  €{metrics.methodology.totalAdjustedBenefits.toLocaleString("de-DE")}
                </span>
              </div>
            </div>
          </div>

          {/* Methodology Notes */}
          <div className="mt-6 p-4 rounded-lg bg-muted/30 border border-border/50">
            <h4 className="text-sm font-medium text-foreground mb-2">Methodologie</h4>
            <ul className="space-y-1">
              {metrics.methodology.methodologyNotes.map((note, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {note}
                </li>
              ))}
            </ul>
            <Badge variant="outline" className="mt-3">
              {metrics.methodology.confidenceLevel === 'conservative' ? 'Konservative Schätzung' : 
               metrics.methodology.confidenceLevel === 'moderate' ? 'Moderate Schätzung' : 'Aggressive Schätzung'}
            </Badge>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
