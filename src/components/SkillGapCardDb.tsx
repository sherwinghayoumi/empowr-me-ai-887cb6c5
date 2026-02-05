import { useState, useEffect } from "react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningPathGeneratorModal } from "./LearningPathGeneratorModal";
import { AdminNotesModal } from "./AdminNotesModal";
import { AlertTriangle, TrendingDown, ChevronRight, Sparkles, StickyNote } from "lucide-react";

// Props interface with DB types
interface SkillGapCardDbProps {
  employee: {
    id: string;
    full_name: string;
    role_profile?: { role_title: string } | null;
  };
  competency: {
    id: string;
    name: string;
    currentLevel: number;
    demandedLevel: number;
    futureLevel: number;
  };
  subskills?: Array<{
    id: string;
    name: string;
    currentLevel: number | null;
  }>;
  delay?: number;
}

type GapSeverity = "critical" | "high" | "moderate";

function getGapSeverity(currentLevel: number, demandedLevel: number, futureLevel: number): GapSeverity {
  const currentGap = demandedLevel - currentLevel;
  const futureGap = futureLevel - currentLevel;
  
  // Weight future gap more heavily
  const weightedGap = currentGap * 0.4 + futureGap * 0.6;
  
  if (weightedGap >= 30) return "critical";
  if (weightedGap >= 15) return "high";
  return "moderate";
}

function getSeverityStyles(severity: GapSeverity) {
  switch (severity) {
    case "critical":
      return {
        badge: "bg-destructive/20 text-destructive border-destructive/30",
        bar: "bg-destructive",
        icon: "text-destructive",
        label: "Critical",
      };
    case "high":
      return {
        badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        bar: "bg-orange-500",
        icon: "text-orange-400",
        label: "High",
      };
    case "moderate":
      return {
        badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        bar: "bg-yellow-500",
        icon: "text-yellow-400",
        label: "Moderate",
      };
  }
}

export function SkillGapCardDb({ employee, competency, subskills = [], delay = 0 }: SkillGapCardDbProps) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const { currentLevel, demandedLevel, futureLevel } = competency;
  const severity = getGapSeverity(currentLevel, demandedLevel, futureLevel);
  const styles = getSeverityStyles(severity);
  
  const currentGap = demandedLevel - currentLevel;
  const futureGap = futureLevel - currentLevel;

  // Get problematic sub-skills (those below 50% rating)
  const problematicSubSkills = subskills
    .filter((ss) => ss.currentLevel !== null && ss.currentLevel < 50)
    .sort((a, b) => (a.currentLevel ?? 0) - (b.currentLevel ?? 0));

  return (
    <>
      <GlassCard 
        className={`min-w-[320px] max-w-[360px] hover-lift transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <GlassCardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <GlassCardTitle className="text-foreground text-base truncate">
                {employee.full_name}
              </GlassCardTitle>
              <p className="text-xs text-muted-foreground truncate">{competency.name}</p>
            </div>
            <Badge variant="outline" className={styles.badge}>
              <AlertTriangle className={`w-3 h-3 mr-1 ${styles.icon}`} />
              {styles.label}
            </Badge>
          </div>
        </GlassCardHeader>
        
        <GlassCardContent className="space-y-4">
          {/* Gap Visualization */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current</span>
              <span className="text-foreground font-medium">{currentLevel}%</span>
            </div>
            <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary/60 rounded-full transition-all duration-700"
                style={{ width: `${currentLevel}%` }}
              />
              {/* Demanded marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-foreground/70"
                style={{ left: `${Math.min(demandedLevel, 100)}%` }}
              />
              {/* Future marker */}
              <div
                className="absolute top-0 h-full w-0.5 bg-primary"
                style={{ left: `${Math.min(futureLevel, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-foreground/70 rounded-sm" />
                <span className="text-muted-foreground">Demanded: {demandedLevel}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-sm" />
                <span className="text-muted-foreground">Future: {futureLevel}%</span>
              </div>
            </div>
          </div>

          {/* Gap Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Current Gap</p>
              <p className={`text-lg font-bold ${currentGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
                {currentGap > 0 ? `-${currentGap}%` : `+${Math.abs(currentGap)}%`}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-2 text-center">
              <p className="text-xs text-muted-foreground">Future Gap</p>
              <p className={`text-lg font-bold ${futureGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
                {futureGap > 0 ? `-${futureGap}%` : `+${Math.abs(futureGap)}%`}
              </p>
            </div>
          </div>

          {/* Problematic Sub-Skills */}
          {problematicSubSkills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Weak Sub-Skills
              </p>
              <div className="space-y-1">
                {problematicSubSkills.slice(0, 3).map((ss) => (
                  <div
                    key={ss.id}
                    className="flex items-center justify-between text-xs bg-destructive/10 rounded px-2 py-1"
                  >
                    <span className="text-foreground/80 truncate flex-1">{ss.name}</span>
                    <span className="text-destructive font-medium ml-2">{ss.currentLevel}%</span>
                  </div>
                ))}
                {problematicSubSkills.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{problematicSubSkills.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              variant="default"
              size="sm"
              className="w-full group overflow-hidden"
              onClick={() => setShowAIModal(true)}
            >
              <Sparkles className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">AI Lernpfad</span>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full group overflow-hidden"
              onClick={() => setShowNotesModal(true)}
            >
              <StickyNote className="w-4 h-4 mr-2 shrink-0" />
              <span className="truncate">Notiz</span>
              <ChevronRight className="w-4 h-4 ml-auto shrink-0 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </GlassCardContent>
      </GlassCard>

      <LearningPathGeneratorModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        skillGapInput={{
          competencyId: competency.id,
          competencyName: competency.name,
          competencyDefinition: competency.name,
          subskills: problematicSubSkills.map(ss => ({ 
            name: ss.name, 
            currentLevel: ss.currentLevel ?? 0 
          })),
          currentLevel,
          targetLevel: Math.max(demandedLevel, futureLevel),
          employeeId: employee.id,
          employeeName: employee.full_name,
          employeeRole: employee.role_profile?.role_title,
        }}
      />

      <AdminNotesModal
        open={showNotesModal}
        onOpenChange={setShowNotesModal}
        competencyName={competency.name}
        employeeName={employee.full_name}
        employeeId={employee.id}
        competencyId={competency.id}
      />
    </>
  );
}
