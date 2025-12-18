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
  Sparkles
} from "lucide-react";

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

interface GrowthJourneyChartProps {
  variant: "employee" | "admin";
  employeeName?: string;
  className?: string;
  // Employee data
  employeeMilestones?: JourneyMilestone[];
  // Admin/Company data
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

  const completedCount = milestones.filter(m => m.isCompleted).length;
  const totalCount = milestones.length;
  const progressPercentage = Math.round((completedCount / totalCount) * 100);

  // Get the 3 most recent/important milestones for preview
  const previewMilestones = milestones.slice(-3).reverse();

  return (
    <div className={className}>
      {/* Compact Preview */}
      <div className="relative">
        {/* Header with Progress */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              {variant === "employee" ? (
                <Sparkles className="w-4 h-4 text-primary" />
              ) : (
                <Building2 className="w-4 h-4 text-primary" />
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-foreground">
                {variant === "employee" ? "Your Journey" : "Company Growth"}
              </span>
              <p className="text-xs text-muted-foreground">
                {completedCount}/{totalCount} Milestones
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-primary">
              <AnimatedCounter value={progressPercentage} suffix="%" duration={1000} />
            </span>
          </div>
        </div>

        {/* Mini Road Visualization */}
        <div className="relative py-4">
          {/* Road Path */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20" />
          
          {/* Preview Milestones */}
          <div className="space-y-4 pl-10 relative">
            {previewMilestones.map((milestone, index) => {
              const Icon = MILESTONE_ICONS[milestone.type] || Flag;
              const color = MILESTONE_COLORS[milestone.type] || "hsl(var(--primary))";
              
              return (
                <div 
                  key={milestone.id}
                  className="relative flex items-center gap-3 group"
                >
                  {/* Milestone Dot on Road */}
                  <div 
                    className={`absolute -left-10 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      milestone.isCompleted 
                        ? 'bg-primary border-primary' 
                        : 'bg-background border-muted-foreground/30'
                    }`}
                    style={{ 
                      borderColor: milestone.isCompleted ? color : undefined,
                      backgroundColor: milestone.isCompleted ? color : undefined
                    }}
                  >
                    {milestone.isCompleted && (
                      <Icon className="w-2.5 h-2.5 text-primary-foreground" />
                    )}
                  </div>

                  {/* Milestone Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      milestone.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {milestone.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{milestone.date}</p>
                  </div>

                  {/* Status Badge */}
                  {milestone.isCompleted ? (
                    <Badge variant="secondary" className="text-xs shrink-0 bg-primary/10 text-primary">
                      Done
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs shrink-0">
                      Next
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* More Indicator */}
          {milestones.length > 3 && (
            <div className="pl-10 mt-2">
              <span className="text-xs text-muted-foreground">
                +{milestones.length - 3} weitere Meilensteine
              </span>
            </div>
          )}
        </div>

        {/* Expand Button */}
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-3 group"
          onClick={() => setIsDetailOpen(true)}
        >
          <span>Vollständige Journey anzeigen</span>
          <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
        </Button>
      </div>

      {/* Slide-out Detail Panel */}
      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              {variant === "employee" ? (
                <>
                  <Sparkles className="w-5 h-5 text-primary" />
                  {employeeName ? `${employeeName}s Journey` : "Deine Entwicklungs-Journey"}
                </>
              ) : (
                <>
                  <Building2 className="w-5 h-5 text-primary" />
                  Unternehmens-ROI Journey
                </>
              )}
            </SheetTitle>
            <SheetDescription>
              {variant === "employee" 
                ? "Alle erreichten Meilensteine und kommende Ziele"
                : "Unternehmensweite Erfolge und Investitionsrendite"
              }
            </SheetDescription>
          </SheetHeader>

          {/* Progress Summary */}
          <div className="mt-6 p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Gesamtfortschritt</span>
              <span className="text-lg font-bold text-primary">{progressPercentage}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>{completedCount} abgeschlossen</span>
              <span>{totalCount - completedCount} ausstehend</span>
            </div>
          </div>

          {/* Full Road/Path Visualization */}
          <div className="mt-6 relative">
            {/* Road Path */}
            <div className="absolute left-6 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-muted-foreground/20 rounded-full" />
            
            {/* All Milestones */}
            <div className="space-y-6 pl-14 relative py-4">
              {milestones.map((milestone, index) => {
                const Icon = MILESTONE_ICONS[milestone.type] || Flag;
                const color = MILESTONE_COLORS[milestone.type] || "hsl(var(--primary))";
                const isLast = index === milestones.length - 1;
                
                return (
                  <div 
                    key={milestone.id}
                    className={`relative animate-fade-in`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Milestone Node */}
                    <div 
                      className={`absolute -left-14 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md ${
                        milestone.isCompleted 
                          ? 'border-transparent' 
                          : 'bg-background border-muted-foreground/30'
                      }`}
                      style={{ 
                        backgroundColor: milestone.isCompleted ? color : undefined,
                      }}
                    >
                      <Icon className={`w-4 h-4 ${
                        milestone.isCompleted ? 'text-primary-foreground' : 'text-muted-foreground'
                      }`} />
                    </div>

                    {/* Milestone Card */}
                    <div className={`p-4 rounded-lg border transition-all duration-300 ${
                      milestone.isCompleted 
                        ? 'bg-secondary/50 border-border/50 hover:border-primary/30' 
                        : 'bg-muted/30 border-dashed border-muted-foreground/30'
                    }`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-medium ${
                              milestone.isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            }`}>
                              {milestone.title}
                            </h4>
                            {isLast && !milestone.isCompleted && (
                              <Badge className="bg-primary/20 text-primary text-xs">
                                Nächstes Ziel
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {milestone.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span>{milestone.date}</span>
                            {"value" in milestone && milestone.value !== undefined && (
                              <Badge variant="outline" className="text-xs">
                                {milestone.value}{milestone.unit || ""}
                              </Badge>
                            )}
                            {"progress" in milestone && milestone.progress !== undefined && (
                              <span className="text-primary font-medium">
                                {milestone.progress}% Fortschritt
                              </span>
                            )}
                          </div>
                        </div>
                        {milestone.isCompleted && (
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: color }}
                          >
                            <Trophy className="w-3 h-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* End Flag */}
              <div className="relative">
                <div className="absolute -left-14 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Flag className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-dashed border-muted-foreground/30 text-center">
                  <p className="text-sm text-muted-foreground">
                    {variant === "employee" 
                      ? "Weitere Meilensteine werden freigeschaltet..."
                      : "Wachstum geht weiter..."
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
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
      title: "Durchschnittsniveau +12%",
      description: "Unternehmensweites Kompetenzniveau von 58% auf 70% gestiegen",
      date: "Okt 2024",
      type: "roi",
      value: 12,
      unit: "%",
      isCompleted: true,
    },
    {
      id: "4",
      title: "15 Zertifizierungen",
      description: "Mitarbeiter haben branchenrelevante Zertifikate erworben",
      date: "Nov 2024",
      type: "certification",
      value: 15,
      isCompleted: true,
    },
    {
      id: "5",
      title: "Skill Gap -30%",
      description: "Unternehmensweite Kompetenzlücken signifikant reduziert",
      date: "Dez 2024",
      type: "goal",
      value: 30,
      unit: "%",
      isCompleted: false,
    },
    {
      id: "6",
      title: "ROI-Ziel 150%",
      description: "Return on Investment der Weiterbildungsinvestition erreichen",
      date: "Q2 2025",
      type: "roi",
      value: 150,
      unit: "%",
      isCompleted: false,
    },
  ];
}

// Export data generators for dynamic usage
export { generateEmployeeMilestones, generateCompanyMilestones };
