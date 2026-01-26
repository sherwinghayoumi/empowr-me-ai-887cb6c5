import { useState, useEffect } from "react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CertificationModal } from "./CertificationModal";
import { AlertTriangle, GraduationCap, ChevronRight } from "lucide-react";
import { capLevel } from "@/lib/utils";

interface EmployeeSkillGapCardProps {
  skillId: string;
  skillName?: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  employeeName: string;
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
        icon: "text-destructive",
        label: "Kritisch",
        border: "border-l-destructive",
      };
    case "high":
      return {
        badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        icon: "text-orange-400",
        label: "Hohe Priorität",
        border: "border-l-orange-500",
      };
    case "moderate":
      return {
        badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        icon: "text-yellow-400",
        label: "Moderat",
        border: "border-l-yellow-500",
      };
  }
}

export function EmployeeSkillGapCard({ 
  skillId,
  skillName,
  currentLevel: rawCurrentLevel, 
  demandedLevel: rawDemandedLevel, 
  futureLevel: rawFutureLevel, 
  employeeName,
  delay = 0 
}: EmployeeSkillGapCardProps) {
  const [showCertModal, setShowCertModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Cap all levels at 100% for display
  const currentLevel = capLevel(rawCurrentLevel);
  const demandedLevel = capLevel(rawDemandedLevel);
  const futureLevel = capLevel(rawFutureLevel);
  
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const displayName = skillName || skillId;
  const severity = getGapSeverity(currentLevel, demandedLevel, futureLevel);
  const styles = getSeverityStyles(severity);
  
  const currentGap = demandedLevel - currentLevel;
  const futureGap = futureLevel - currentLevel;

  return (
    <>
      <GlassCard 
        className={`border-l-4 ${styles.border} hover-lift transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <GlassCardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <GlassCardTitle className="text-foreground text-lg">
                {displayName}
              </GlassCardTitle>
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
              <span className="text-muted-foreground">Aktuelles Level</span>
              <span className="text-foreground font-medium">{currentLevel}%</span>
            </div>
            <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary/60 rounded-full transition-all duration-700"
                style={{ width: `${currentLevel}%` }}
              />
              <div
                className="absolute top-0 h-full w-1 bg-foreground/70 rounded"
                style={{ left: `${demandedLevel}%` }}
              />
              <div
                className="absolute top-0 h-full w-1 bg-primary rounded"
                style={{ left: `${futureLevel}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-foreground/70 rounded-sm" />
                <span className="text-muted-foreground">Gefordert: {demandedLevel}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-sm" />
                <span className="text-muted-foreground">Zukunft: {futureLevel}%</span>
              </div>
            </div>
          </div>

          {/* Gap Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Aktuelle Lücke</p>
              <p className={`text-xl font-bold ${currentGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
                {currentGap > 0 ? `-${currentGap}%` : `+${Math.abs(currentGap)}%`}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Zukunfts-Lücke</p>
              <p className={`text-xl font-bold ${futureGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
                {futureGap > 0 ? `-${futureGap}%` : `+${Math.abs(futureGap)}%`}
              </p>
            </div>
          </div>

          {/* Recommendation Button */}
          <Button
            variant="default"
            size="sm"
            className="w-full group"
            onClick={() => setShowCertModal(true)}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            Lernempfehlungen anzeigen
            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1" />
          </Button>
        </GlassCardContent>
      </GlassCard>

      <CertificationModal
        open={showCertModal}
        onOpenChange={setShowCertModal}
        competencyId={skillId}
        competencyName={displayName}
        employeeName={employeeName}
        gapPercentage={Math.max(currentGap, futureGap)}
      />
    </>
  );
}
