import { useState, useEffect } from "react";
import { GlassCard, GlassCardContent } from "@/components/GlassCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LearningPathGeneratorModal } from "./LearningPathGeneratorModal";
import { AdminNotesModal } from "./AdminNotesModal";
import { Sparkles, StickyNote, Info, Wrench } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useCompetencyDescriptions, resolveDescription } from "@/hooks/useCompetencyDescriptions";

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

type GapSeverity = "focus" | "building" | "ontrack";

function getGapSeverity(currentLevel: number, demandedLevel: number, futureLevel: number): GapSeverity {
  const weightedGap = (demandedLevel - currentLevel) * 0.4 + (futureLevel - currentLevel) * 0.6;
  const ratio = demandedLevel > 0 ? weightedGap / demandedLevel : 0;
  if (ratio >= 0.5) return "focus";
  if (ratio >= 0.25) return "building";
  return "ontrack";
}

const severityConfig: Record<GapSeverity, { badge: string; bar: string; label: string; dot: string }> = {
  focus: {
    badge: "bg-amber-500/15 text-amber-500 border-amber-500/25",
    bar: "bg-amber-500",
    label: "Großes Potenzial",
    dot: "bg-amber-500",
  },
  building: {
    badge: "bg-sky-500/15 text-sky-400 border-sky-500/25",
    bar: "bg-sky-500",
    label: "Im Wachstum",
    dot: "bg-sky-400",
  },
  ontrack: {
    badge: "bg-emerald-500/15 text-emerald-500 border-emerald-500/25",
    bar: "bg-emerald-500",
    label: "Gut aufgestellt",
    dot: "bg-emerald-500",
  },
};

export function SkillGapCardDb({ employee, competency, subskills = [], delay = 0 }: SkillGapCardDbProps) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { data: dbDescriptions } = useCompetencyDescriptions();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const { currentLevel, demandedLevel, futureLevel } = competency;
  const severity = getGapSeverity(currentLevel, demandedLevel, futureLevel);
  const cfg = severityConfig[severity];
  const gap = demandedLevel - currentLevel;

  const problematicSubSkills = subskills
    .filter((ss) => ss.currentLevel !== null && ss.currentLevel < 50)
    .sort((a, b) => (a.currentLevel ?? 0) - (b.currentLevel ?? 0));

  return (
    <>
      <GlassCard
        className={`w-[300px] shrink-0 whitespace-normal transition-all duration-500 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <GlassCardContent className="p-4 space-y-4">

          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm leading-tight truncate">
                {employee.full_name}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {employee.role_profile?.role_title || "Keine Rolle"}
              </p>
            </div>
            <Badge variant="outline" className={`shrink-0 text-xs ${cfg.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block ${cfg.dot}`} />
              {cfg.label}
            </Badge>
          </div>

          {/* Competency + achieved % */}
          {(() => {
            const desc = resolveDescription(competency.name, dbDescriptions, "competency");
            const displayName = desc?.labelDE ?? competency.name;
            return (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground truncate">{displayName}</p>
                  {desc && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                          aria-label="Kompetenz-Info"
                        >
                          <Info className="w-3 h-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 text-sm space-y-3 z-50" side="bottom" align="start">
                        <p className="font-semibold text-foreground">{desc.labelDE}</p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Schwerpunkt</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{desc.focus}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Einsatzbereich</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{desc.usageContext}</p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Relevanz</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{desc.relevance}</p>
                          </div>
                          {desc.tools && desc.tools.length > 0 && (
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <Wrench className="w-3 h-3 text-primary" />
                                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Tools</p>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {desc.tools.map((tool) => (
                                  <span key={tool} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/40">
                                    {tool}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {demandedLevel > 0 ? Math.round((currentLevel / demandedLevel) * 100) : 0}% erreicht
                </span>
              </div>
            );
          })()}

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="relative h-2 bg-secondary/40 rounded-full overflow-visible">
              {/* Current fill */}
              <div
                className="absolute h-full bg-primary/50 rounded-full"
                style={{ width: `${Math.min(currentLevel, 100)}%` }}
              />
              {/* Demanded marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground/50 rounded-full"
                style={{ left: `${Math.min(demandedLevel, 100)}%` }}
              />
              {/* Future marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-primary rounded-full"
                style={{ left: `${Math.min(futureLevel, 100)}%` }}
              />
            </div>
            {/* Labels below bar */}
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Aktuell: {currentLevel}%</span>
              <span>Ziel: {demandedLevel}%</span>
            </div>
          </div>

          {/* Weak subskills (compact) */}
          {problematicSubSkills.length > 0 && (
            <div className="space-y-1">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                Schwache Subskills
              </p>
              {problematicSubSkills.slice(0, 2).map((ss) => (
                <div
                  key={ss.id}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-foreground/70 truncate flex-1">{ss.name}</span>
                  <span className="text-destructive font-medium ml-2 shrink-0">{ss.currentLevel}%</span>
                </div>
              ))}
              {problematicSubSkills.length > 2 && (
                <p className="text-[10px] text-muted-foreground">
                  +{problematicSubSkills.length - 2} weitere
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-8 text-xs gap-1.5"
              onClick={() => setShowAIModal(true)}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Lernpfad
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 shrink-0"
              onClick={() => setShowNotesModal(true)}
              title="Notiz hinzufügen"
            >
              <StickyNote className="w-3.5 h-3.5" />
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
          subskills: problematicSubSkills.map((ss) => ({
            name: ss.name,
            currentLevel: ss.currentLevel ?? 0,
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
