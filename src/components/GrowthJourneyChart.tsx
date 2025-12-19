import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "./AnimatedCounter";
import { 
  Trophy, 
  BookOpen, 
  TrendingUp, 
  Star, 
  Flag, 
  ChevronRight,
  GraduationCap,
  Award,
  Target,
  Users,
  Building2,
  Briefcase,
  Sparkles,
  ArrowUpRight,
  Zap,
  Clock,
  Euro,
  BarChart3,
  CheckCircle2
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  ResponsiveContainer,
  Tooltip
} from "recharts";

// Types for the journey data
interface JourneyMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "skill" | "course" | "certification" | "achievement" | "promotion";
  progress?: number;
  isCompleted: boolean;
  icon?: React.ElementType;
}

interface CompanyMilestone {
  id: string;
  title: string;
  description: string;
  date: string;
  type: "employees" | "training" | "certification" | "roi" | "goal";
  value?: number;
  unit?: string;
  isCompleted: boolean;
  icon?: React.ElementType;
}

// ROI/Impact metrics for compelling visualization
interface ImpactMetrics {
  // For Admin
  totalROI: number; // in EUR
  roiPercentage: number;
  productivityGain: number;
  skillGapReduction: number;
  hoursTrainingCompleted: number;
  certificationsEarned: number;
  employeesUpskilled: number;
  avgCompetencyBefore: number;
  avgCompetencyNow: number;
  costPerEmployee: number;
  savedRecruitingCosts: number;
  timeToCompetency: number; // months reduced
  industryBenchmarkComparison: number; // multiplier
  monthlyTrend: { month: string; value: number; baseline: number }[];
}

interface EmployeeImpactMetrics {
  skillsImproved: number;
  hoursLearned: number;
  coursesCompleted: number;
  certificationsEarned: number;
  competencyGrowth: number;
  rankImprovement: number; // percentile
  careerAcceleration: number; // months
  monthlyProgress: { month: string; competency: number }[];
}

interface GrowthJourneyChartProps {
  variant: "employee" | "admin";
  employeeName?: string;
  className?: string;
  employeeMilestones?: JourneyMilestone[];
  companyMilestones?: CompanyMilestone[];
}

// Icon mapping by type
const MILESTONE_ICONS = {
  skill: TrendingUp,
  course: BookOpen,
  certification: Award,
  achievement: Trophy,
  promotion: Star,
  employees: Users,
  training: GraduationCap,
  roi: Briefcase,
  goal: Target,
};

const MILESTONE_COLORS = {
  skill: "hsl(var(--primary))",
  course: "hsl(var(--skill-strong))",
  certification: "hsl(var(--skill-very-strong))",
  achievement: "hsl(var(--chart-4))",
  promotion: "hsl(var(--chart-5))",
  employees: "hsl(var(--primary))",
  training: "hsl(var(--skill-strong))",
  roi: "hsl(var(--skill-very-strong))",
  goal: "hsl(var(--skill-moderate))",
};

// Generate compelling mock metrics based on Premium-Membership pricing
// Premium: €890 per employee / year (gross) - calculated for LAST 6 MONTHS
function generateAdminMetrics(): ImpactMetrics {
  const employeeCount = 32;
  const pricePerEmployee = 890; // €890/employee/year Premium-Membership
  const monthsCalculated = 6;
  const totalInvestment = Math.round((employeeCount * pricePerEmployee) / 12 * monthsCalculated); // €14.240 for 6 months
  
  // Realistic value creation for 32 employees over 6 months:
  // - Saved recruiting costs: 2 avoided external hires × ~€25.000 = €50.000
  // - Productivity gain from upskilling: ~€12.000
  // - Reduced turnover value: ~€6.000
  const savedRecruiting = 50000;
  const productivityValue = 12000;
  const reducedTurnoverValue = 6000;
  const totalValueCreated = savedRecruiting + productivityValue + reducedTurnoverValue; // €68.000
  
  const roiPercentage = Math.round((totalValueCreated / totalInvestment) * 100); // ~477%
  
  return {
    totalROI: totalValueCreated - totalInvestment, // Net gain
    roiPercentage: roiPercentage,
    productivityGain: 19,
    skillGapReduction: 34,
    hoursTrainingCompleted: 1240,
    certificationsEarned: 18,
    employeesUpskilled: employeeCount,
    avgCompetencyBefore: 54,
    avgCompetencyNow: 72,
    costPerEmployee: Math.round(pricePerEmployee / 12 * monthsCalculated), // 6-month cost per employee
    savedRecruitingCosts: savedRecruiting,
    timeToCompetency: 4,
    industryBenchmarkComparison: 2.3,
    monthlyTrend: [
      { month: "Jul", value: 54, baseline: 50 },
      { month: "Aug", value: 58, baseline: 51 },
      { month: "Sep", value: 63, baseline: 52 },
      { month: "Okt", value: 67, baseline: 53 },
      { month: "Nov", value: 70, baseline: 54 },
      { month: "Dez", value: 72, baseline: 55 },
    ],
  };
}

function generateEmployeeMetrics(): EmployeeImpactMetrics {
  return {
    skillsImproved: 8,
    hoursLearned: 47,
    coursesCompleted: 5,
    certificationsEarned: 2,
    competencyGrowth: 18,
    rankImprovement: 32,
    careerAcceleration: 6,
    monthlyProgress: [
      { month: "Jul", competency: 54 },
      { month: "Aug", competency: 58 },
      { month: "Sep", competency: 63 },
      { month: "Okt", competency: 67 },
      { month: "Nov", competency: 70 },
      { month: "Dez", competency: 72 },
    ],
  };
}

export function GrowthJourneyChart({
  variant,
  employeeName,
  className,
  employeeMilestones,
  companyMilestones,
}: GrowthJourneyChartProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const milestones = variant === "employee" 
    ? (employeeMilestones || generateEmployeeMilestones()) 
    : (companyMilestones || generateCompanyMilestones());

  const adminMetrics = useMemo(() => generateAdminMetrics(), []);
  const employeeMetrics = useMemo(() => generateEmployeeMetrics(), []);

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const totalCount = milestones.length;

  if (variant === "admin") {
    return (
      <div className={className}>
        {/* ADMIN: Compelling ROI Dashboard Preview */}
        <div className="space-y-4">
          {/* Hero ROI Metric - The Money Shot */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[hsl(var(--skill-very-strong))]/20 via-[hsl(var(--skill-very-strong))]/10 to-transparent p-4 border border-[hsl(var(--skill-very-strong))]/20">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[hsl(var(--skill-very-strong))] uppercase tracking-wider mb-1">
                  ROI – Letzte 6 Monate
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">
                    <AnimatedCounter value={adminMetrics.roiPercentage} suffix="%" duration={1500} />
                  </span>
                  <div className="flex items-center gap-1 text-[hsl(var(--skill-very-strong))]">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-sm font-medium">+{adminMetrics.productivityGain}% Produktivität</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-[hsl(var(--skill-very-strong))]">
                  €{adminMetrics.totalROI.toLocaleString("de-DE")}
                  </span>
                  {" "}Wertschöpfung
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-[hsl(var(--skill-very-strong))]/20 flex items-center justify-center">
                <Euro className="w-6 h-6 text-[hsl(var(--skill-very-strong))]" />
              </div>
            </div>
            
            {/* Mini Trend Chart */}
            <div className="mt-3 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adminMetrics.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--skill-very-strong))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--skill-very-strong))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--skill-very-strong))" 
                    strokeWidth={2}
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
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
                  -<AnimatedCounter value={adminMetrics.skillGapReduction} suffix="%" duration={1200} />
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
                  {adminMetrics.industryBenchmarkComparison}x
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
              €{adminMetrics.savedRecruitingCosts.toLocaleString("de-DE")}
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

        {/* Detail Panel for Admin */}
        <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary" />
                Unternehmens-ROI Report
              </SheetTitle>
              <SheetDescription>
                Vollständige Analyse der Investitionsrendite
              </SheetDescription>
            </SheetHeader>

            {/* Hero Section in Detail */}
            <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-[hsl(var(--skill-very-strong))]/20 via-[hsl(var(--skill-very-strong))]/10 to-transparent border border-[hsl(var(--skill-very-strong))]/20">
              <p className="text-sm font-medium text-[hsl(var(--skill-very-strong))] uppercase tracking-wider mb-2">
                ROI – Letzte 6 Monate
              </p>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-foreground">
                  {adminMetrics.roiPercentage}%
                </span>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--skill-very-strong))]/20">
                  <ArrowUpRight className="w-4 h-4 text-[hsl(var(--skill-very-strong))]" />
                  <span className="text-sm font-medium text-[hsl(var(--skill-very-strong))]">Wachstum</span>
                </div>
              </div>
              <p className="text-lg text-muted-foreground mt-2">
                <span className="font-bold text-foreground text-2xl">
                  €{adminMetrics.totalROI.toLocaleString("de-DE")}
                </span>
                {" "}Wertschöpfung generiert
              </p>
            </div>

            {/* Trend Chart */}
            <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
              <h4 className="font-medium text-foreground mb-1">Kompetenzniveau-Entwicklung</h4>
              <p className="text-xs text-muted-foreground mb-4">
                Ihr Team vs. Branchendurchschnitt
              </p>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={adminMetrics.monthlyTrend}>
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
                      domain={[40, 80]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => [
                        `${value}%`, 
                        name === 'value' ? 'Ihr Team' : 'Branche'
                      ]}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="baseline" 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      fill="url(#colorBaseline)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--skill-very-strong))" 
                      strokeWidth={2}
                      fill="url(#colorValueFull)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 bg-[hsl(var(--skill-very-strong))]" />
                  <span className="text-muted-foreground">Ihr Team</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-0.5 border-t border-dashed border-muted-foreground" />
                  <span className="text-muted-foreground">Branchendurchschnitt</span>
                </div>
              </div>
            </div>

            {/* Detailed Metrics */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <MetricCard 
                icon={Target}
                label="Skill Gaps reduziert"
                value={adminMetrics.skillGapReduction}
                suffix="%"
                trend="down"
                comparison="Vorjahr: -12%"
              />
              <MetricCard 
                icon={TrendingUp}
                label="Produktivitätssteigerung"
                value={adminMetrics.productivityGain}
                suffix="%"
                trend="up"
              />
              <MetricCard 
                icon={Clock}
                label="Zeit bis Kompetenz"
                value={adminMetrics.timeToCompetency}
                suffix=" Mon."
                trend="down"
                comparison="Vorher: 8 Mon."
              />
              <MetricCard 
                icon={Users}
                label="Mitarbeiter entwickelt"
                value={adminMetrics.employeesUpskilled}
                suffix=""
                trend="up"
              />
              <MetricCard 
                icon={GraduationCap}
                label="Trainingsstunden"
                value={adminMetrics.hoursTrainingCompleted}
                suffix="h"
                trend="up"
              />
              <MetricCard 
                icon={Award}
                label="Zertifizierungen"
                value={adminMetrics.certificationsEarned}
                suffix=""
                trend="up"
              />
            </div>

            {/* Cost Savings Highlight */}
            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Kostenersparnis</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Recruiting-Kosten gespart</p>
                  <p className="text-lg font-bold text-primary">
                    €{adminMetrics.savedRecruitingCosts.toLocaleString("de-DE")}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Kosten pro Mitarbeiter</p>
                  <p className="text-lg font-bold text-foreground">
                    €{adminMetrics.costPerEmployee.toLocaleString("de-DE")}
                  </p>
                </div>
              </div>
            </div>

            {/* Milestones Timeline */}
            <div className="mt-6">
              <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                Journey-Meilensteine
              </h4>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted-foreground/20" />
                <div className="space-y-4 pl-10">
                  {milestones.map((milestone) => {
                    const Icon = MILESTONE_ICONS[milestone.type] || Flag;
                    const color = MILESTONE_COLORS[milestone.type];
                    return (
                      <div key={milestone.id} className="relative flex items-start gap-3">
                        <div 
                          className={`absolute -left-10 w-6 h-6 rounded-full flex items-center justify-center ${
                            milestone.isCompleted ? '' : 'bg-background border-2 border-muted-foreground/30'
                          }`}
                          style={{ backgroundColor: milestone.isCompleted ? color : undefined }}
                        >
                          {milestone.isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                          ) : (
                            <Icon className="w-3 h-3 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${milestone.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {milestone.title}
                          </p>
                          <p className="text-xs text-muted-foreground">{milestone.date}</p>
                        </div>
                        {milestone.isCompleted && (
                          <Badge variant="secondary" className="text-xs bg-[hsl(var(--skill-very-strong))]/10 text-[hsl(var(--skill-very-strong))]">
                            ✓
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // EMPLOYEE VARIANT
  return (
    <div className={className}>
      {/* Compact Preview for Employee */}
      <div className="space-y-4">
        {/* Personal Growth Hero */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent p-4 border border-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                Dein Wachstum
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">
                  +<AnimatedCounter value={employeeMetrics.competencyGrowth} suffix="%" duration={1500} />
                </span>
                <div className="flex items-center gap-1 text-primary">
                  <ArrowUpRight className="w-4 h-4" />
                  <span className="text-sm font-medium">Kompetenz</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-semibold text-primary">
                  Top {100 - employeeMetrics.rankImprovement}%
                </span>
                {" "}deiner Kollegen
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
          </div>
          
          {/* Mini Progress Chart */}
          <div className="mt-3 h-12">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={employeeMetrics.monthlyProgress}>
                <defs>
                  <linearGradient id="colorCompetency" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="competency" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  fill="url(#colorCompetency)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 text-center">
            <BookOpen className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{employeeMetrics.coursesCompleted}</p>
            <p className="text-[10px] text-muted-foreground">Kurse</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 text-center">
            <Clock className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{employeeMetrics.hoursLearned}h</p>
            <p className="text-[10px] text-muted-foreground">Gelernt</p>
          </div>
          <div className="p-2 rounded-lg bg-secondary/30 border border-border/50 text-center">
            <Award className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold text-foreground">{employeeMetrics.certificationsEarned}</p>
            <p className="text-[10px] text-muted-foreground">Zertifikate</p>
          </div>
        </div>

        {/* Career Acceleration Highlight */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--skill-very-strong))]/10 border border-[hsl(var(--skill-very-strong))]/20">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[hsl(var(--skill-very-strong))]" />
            <span className="text-sm text-muted-foreground">Karriere-Beschleunigung</span>
          </div>
          <span className="text-base font-bold text-[hsl(var(--skill-very-strong))]">
            +{employeeMetrics.careerAcceleration} Monate
          </span>
        </div>

        {/* Expand Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full group"
          onClick={() => setIsDetailOpen(true)}
        >
          <span>Vollständige Journey</span>
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Detail Panel for Employee */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {employeeName ? `${employeeName}s Journey` : "Deine Entwicklungs-Journey"}
            </SheetTitle>
            <SheetDescription>
              Dein persönlicher Wachstumspfad
            </SheetDescription>
          </SheetHeader>

          {/* Hero Growth Section */}
          <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/20">
            <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
              Kompetenzwachstum
            </p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-foreground">
                +{employeeMetrics.competencyGrowth}%
              </span>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/20">
                <ArrowUpRight className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Wachstum</span>
              </div>
            </div>
            <p className="text-muted-foreground mt-2">
              Du gehörst jetzt zu den <span className="font-bold text-foreground">Top {100 - employeeMetrics.rankImprovement}%</span> deiner Kollegen
            </p>
          </div>

          {/* Progress Chart */}
          <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="font-medium text-foreground mb-4">Kompetenzentwicklung</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={employeeMetrics.monthlyProgress}>
                  <defs>
                    <linearGradient id="colorCompetencyFull" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis 
                    domain={[40, 80]}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Kompetenz']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="competency" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    fill="url(#colorCompetencyFull)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <MetricCard 
              icon={TrendingUp}
              label="Skills verbessert"
              value={employeeMetrics.skillsImproved}
              suffix=""
              trend="up"
            />
            <MetricCard 
              icon={Clock}
              label="Lernstunden"
              value={employeeMetrics.hoursLearned}
              suffix="h"
              trend="up"
            />
            <MetricCard 
              icon={BookOpen}
              label="Kurse abgeschlossen"
              value={employeeMetrics.coursesCompleted}
              suffix=""
              trend="up"
            />
            <MetricCard 
              icon={Award}
              label="Zertifizierungen"
              value={employeeMetrics.certificationsEarned}
              suffix=""
              trend="up"
            />
          </div>

          {/* Career Impact */}
          <div className="mt-6 p-4 rounded-xl bg-[hsl(var(--skill-very-strong))]/10 border border-[hsl(var(--skill-very-strong))]/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-[hsl(var(--skill-very-strong))]" />
              <span className="font-medium text-foreground">Karriere-Beschleunigung</span>
            </div>
            <p className="text-2xl font-bold text-[hsl(var(--skill-very-strong))]">
              +{employeeMetrics.careerAcceleration} Monate
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Du erreichst deine Karriereziele schneller als der Durchschnitt
            </p>
          </div>

          {/* Milestones */}
          <div className="mt-6">
            <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
              <Flag className="w-4 h-4 text-primary" />
              Deine Meilensteine
            </h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted-foreground/20" />
              <div className="space-y-4 pl-10">
                {milestones.map((milestone) => {
                  const Icon = MILESTONE_ICONS[milestone.type] || Flag;
                  const color = MILESTONE_COLORS[milestone.type];
                  return (
                    <div key={milestone.id} className="relative flex items-start gap-3">
                      <div 
                        className={`absolute -left-10 w-6 h-6 rounded-full flex items-center justify-center ${
                          milestone.isCompleted ? '' : 'bg-background border-2 border-muted-foreground/30'
                        }`}
                        style={{ backgroundColor: milestone.isCompleted ? color : undefined }}
                      >
                        {milestone.isCompleted ? (
                          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
                        ) : (
                          <Icon className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${milestone.isCompleted ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {milestone.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{milestone.date}</p>
                      </div>
                      {milestone.isCompleted && (
                        <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                          ✓
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Metric Card Component for detail view
interface MetricCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  suffix: string;
  trend: "up" | "down";
  comparison?: string;
}

function MetricCard({ icon: Icon, label, value, suffix, trend, comparison }: MetricCardProps) {
  const trendColor = trend === "up" 
    ? "text-[hsl(var(--skill-very-strong))]" 
    : "text-[hsl(var(--skill-very-strong))]"; // Green for both up/down as both are positive (reducing gaps is good)
  
  return (
    <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-primary" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold text-foreground">
          {trend === "down" && "-"}{value}{suffix}
        </span>
        <ArrowUpRight className={`w-3 h-3 ${trendColor} ${trend === "down" ? "rotate-90" : ""}`} />
      </div>
      {comparison && (
        <p className="text-[10px] text-muted-foreground mt-1">{comparison}</p>
      )}
    </div>
  );
}

// Generate mock employee milestones
function generateEmployeeMilestones(): JourneyMilestone[] {
  return [
    {
      id: "1",
      title: "Onboarding abgeschlossen",
      description: "Einführungsprogramm und Grundlagenschulung erfolgreich absolviert",
      date: "Jul 2024",
      type: "achievement",
      isCompleted: true,
    },
    {
      id: "2",
      title: "Legal Analysis Grundkurs",
      description: "Kurs zur rechtlichen Analyse mit 92% bestanden",
      date: "Aug 2024",
      type: "course",
      progress: 100,
      isCompleted: true,
    },
    {
      id: "3",
      title: "Contract Drafting +15%",
      description: "Kompetenzlevel von 55% auf 70% gesteigert",
      date: "Sep 2024",
      type: "skill",
      isCompleted: true,
    },
    {
      id: "4",
      title: "Legal Tech Zertifikat",
      description: "AI in Legal Operations Zertifizierung erhalten",
      date: "Okt 2024",
      type: "certification",
      isCompleted: true,
    },
    {
      id: "5",
      title: "M&A Structuring Kurs",
      description: "Fortgeschrittener Kurs zu M&A Transaktionen",
      date: "Nov 2024",
      type: "course",
      progress: 65,
      isCompleted: false,
    },
    {
      id: "6",
      title: "Senior Associate Ziel",
      description: "Alle Anforderungen für Beförderung erreichen",
      date: "Q1 2025",
      type: "promotion",
      isCompleted: false,
    },
  ];
}

// Generate mock company milestones
function generateCompanyMilestones(): CompanyMilestone[] {
  return [
    {
      id: "1",
      title: "FUTURA TEAMS Einführung",
      description: "Plattform erfolgreich für alle 25 Mitarbeiter ausgerollt",
      date: "Jul 2024",
      type: "employees",
      value: 25,
      unit: " MA",
      isCompleted: true,
    },
    {
      id: "2",
      title: "100 Lernpfade gestartet",
      description: "Mitarbeiter nutzen aktiv die Weiterbildungsangebote",
      date: "Aug 2024",
      type: "training",
      value: 100,
      isCompleted: true,
    },
    {
      id: "3",
      title: "Durchschnittsniveau +18%",
      description: "Unternehmensweites Kompetenzniveau von 54% auf 72% gestiegen",
      date: "Okt 2024",
      type: "roi",
      value: 18,
      unit: "%",
      isCompleted: true,
    },
    {
      id: "4",
      title: "18 Zertifizierungen",
      description: "Mitarbeiter haben branchenrelevante Zertifikate erworben",
      date: "Nov 2024",
      type: "certification",
      value: 18,
      isCompleted: true,
    },
    {
      id: "5",
      title: "Skill Gap -50%",
      description: "Unternehmensweite Kompetenzlücken halbiert",
      date: "Q1 2025",
      type: "goal",
      value: 50,
      unit: "%",
      isCompleted: false,
    },
    {
      id: "6",
      title: "ROI-Ziel 300%",
      description: "Return on Investment der Weiterbildungsinvestition verdreifachen",
      date: "Q2 2025",
      type: "roi",
      value: 300,
      unit: "%",
      isCompleted: false,
    },
  ];
}

export { generateEmployeeMilestones, generateCompanyMilestones };
