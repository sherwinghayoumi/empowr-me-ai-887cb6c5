import { useState } from "react";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardTitle } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSkillById } from "@/data/mockData";
import { getCompetencyById, generateSubSkillRatings } from "@/data/competenciesData";
import { CertificationModal } from "./CertificationModal";
import { AlertTriangle, TrendingDown, GraduationCap, ChevronRight } from "lucide-react";

interface EmployeeSkillGapCardProps {
  skillId: string;
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
        bar: "bg-destructive",
        icon: "text-destructive",
        label: "Critical",
        border: "border-l-destructive",
      };
    case "high":
      return {
        badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        bar: "bg-orange-500",
        icon: "text-orange-400",
        label: "High Priority",
        border: "border-l-orange-500",
      };
    case "moderate":
      return {
        badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        bar: "bg-yellow-500",
        icon: "text-yellow-400",
        label: "Moderate",
        border: "border-l-yellow-500",
      };
  }
}

export function EmployeeSkillGapCard({ 
  skillId, 
  currentLevel, 
  demandedLevel, 
  futureLevel, 
  employeeName,
  delay = 0 
}: EmployeeSkillGapCardProps) {
  const [showCertModal, setShowCertModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  // Animate in
  useState(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  });

  const skill = getSkillById(skillId);
  const competency = getCompetencyById(skillId);

  if (!skill || !competency) return null;

  const severity = getGapSeverity(currentLevel, demandedLevel, futureLevel);
  const styles = getSeverityStyles(severity);
  
  const currentGap = demandedLevel - currentLevel;
  const futureGap = futureLevel - currentLevel;

  // Generate problematic sub-skills (those below 50% rating)
  const subSkillRatings = generateSubSkillRatings(currentLevel, competency.subSkills.length);
  const problematicSubSkills = competency.subSkills
    .map((ss, idx) => ({ ...ss, rating: subSkillRatings[idx] }))
    .filter((ss) => ss.rating < 50)
    .sort((a, b) => a.rating - b.rating);

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
                {competency.name}
              </GlassCardTitle>
              <p className="text-xs text-muted-foreground">{skill.category}</p>
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
              <span className="text-muted-foreground">Your Current Level</span>
              <span className="text-foreground font-medium">{currentLevel}%</span>
            </div>
            <div className="relative h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className="absolute h-full bg-primary/60 rounded-full transition-all duration-700"
                style={{ width: `${currentLevel}%` }}
              />
              {/* Demanded marker */}
              <div
                className="absolute top-0 h-full w-1 bg-foreground/70 rounded"
                style={{ left: `${demandedLevel}%` }}
              />
              {/* Future marker */}
              <div
                className="absolute top-0 h-full w-1 bg-primary rounded"
                style={{ left: `${futureLevel}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-foreground/70 rounded-sm" />
                <span className="text-muted-foreground">Required Now: {demandedLevel}%</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-primary rounded-sm" />
                <span className="text-muted-foreground">Future Target: {futureLevel}%</span>
              </div>
            </div>
          </div>

          {/* Gap Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Current Gap</p>
              <p className={`text-xl font-bold ${currentGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
                {currentGap > 0 ? `-${currentGap}%` : `+${Math.abs(currentGap)}%`}
              </p>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3 text-center">
              <p className="text-xs text-muted-foreground mb-1">Future Gap</p>
              <p className={`text-xl font-bold ${futureGap > 0 ? "text-destructive" : "text-emerald-400"}`}>
                {futureGap > 0 ? `-${futureGap}%` : `+${Math.abs(futureGap)}%`}
              </p>
            </div>
          </div>

          {/* Problematic Sub-Skills */}
          {problematicSubSkills.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3" />
                Skills to Improve
              </p>
              <div className="space-y-1">
                {problematicSubSkills.slice(0, 4).map((ss) => (
                  <div
                    key={ss.id}
                    className="flex items-center justify-between text-sm bg-destructive/10 rounded px-3 py-1.5"
                  >
                    <span className="text-foreground/80 truncate flex-1">{ss.name}</span>
                    <span className="text-destructive font-medium ml-2">{ss.rating}%</span>
                  </div>
                ))}
                {problematicSubSkills.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{problematicSubSkills.length - 4} more areas
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Recommendation Button */}
          <Button
            variant="default"
            size="sm"
            className="w-full group"
            onClick={() => setShowCertModal(true)}
          >
            <GraduationCap className="w-4 h-4 mr-2" />
            View Learning Recommendations
            <ChevronRight className="w-4 h-4 ml-auto transition-transform group-hover:translate-x-1" />
          </Button>
        </GlassCardContent>
      </GlassCard>

      <CertificationModal
        open={showCertModal}
        onOpenChange={setShowCertModal}
        competencyId={skillId}
        employeeName={employeeName}
        gapPercentage={Math.max(currentGap, futureGap)}
      />
    </>
  );
}