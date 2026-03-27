import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

const severityConfig: Record<GapSeverity, { badge: string; label: string }> = {
  focus: { badge: "bg-[hsl(var(--severity-medium))]/15 text-[hsl(var(--severity-medium))] border-[hsl(var(--severity-medium))]/25", label: "Potenzial" },
  building: { badge: "bg-primary/15 text-primary border-primary/25", label: "Wachstum" },
  ontrack: { badge: "bg-[hsl(var(--severity-low))]/15 text-[hsl(var(--severity-low))] border-[hsl(var(--severity-low))]/25", label: "Stark" },
};

export function SkillGapCardDb({ employee, competency, subskills = [], delay = 0 }: SkillGapCardDbProps) {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const { data: dbDescriptions } = useCompetencyDescriptions();

  const { currentLevel, demandedLevel, futureLevel } = competency;
  const severity = getGapSeverity(currentLevel, demandedLevel, futureLevel);
  const cfg = severityConfig[severity];
  const gap = demandedLevel - currentLevel;
  const desc = resolveDescription(competency.name, dbDescriptions, "competency");
  const displayName = desc?.labelDE ?? competency.name;

  const problematicSubSkills = subskills
    .filter((ss) => ss.currentLevel !== null && ss.currentLevel < 50)
    .sort((a, b) => (a.currentLevel ?? 0) - (b.currentLevel ?? 0));

  return (
    <>
      <Card
        className="w-[280px] shrink-0 bg-card/80 border-border/50 animate-fade-in-up opacity-0"
        style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
      >
        <CardContent className="p-3 space-y-2.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{employee.full_name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{employee.role_profile?.role_title || '—'}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] shrink-0 ${cfg.badge}`}>{cfg.label}</Badge>
          </div>

          {/* Competency */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground truncate">{displayName}</p>
              {desc && (
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="shrink-0 text-muted-foreground hover:text-foreground"><Info className="w-2.5 h-2.5" /></button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72 text-xs space-y-2 z-50" side="bottom" align="start">
                    <p className="font-semibold text-foreground">{desc.labelDE}</p>
                    <div><p className="text-[10px] font-semibold text-primary uppercase">Schwerpunkt</p><p className="text-[10px] text-muted-foreground">{desc.focus}</p></div>
                    <div><p className="text-[10px] font-semibold text-primary uppercase">Relevanz</p><p className="text-[10px] text-muted-foreground">{desc.relevance}</p></div>
                    {desc.tools && desc.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1">{desc.tools.map(t => <span key={t} className="text-[9px] px-1 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/40">{t}</span>)}</div>
                    )}
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <span className="text-xs font-semibold tabular-nums shrink-0">
              {demandedLevel > 0 ? Math.round((currentLevel / demandedLevel) * 100) : 0}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="relative h-1.5 bg-secondary/40 rounded-full overflow-visible">
              <div className="absolute h-full bg-primary/50 rounded-full" style={{ width: `${Math.min(currentLevel, 100)}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-foreground/50 rounded-full" style={{ left: `${Math.min(demandedLevel, 100)}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-muted-foreground tabular-nums">
              <span>Ist: {currentLevel}%</span>
              <span>Soll: {demandedLevel}%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="flex-1 h-6 text-[10px] gap-1" onClick={() => setShowAIModal(true)}>
              <Sparkles className="w-3 h-3" />Lernpfad
            </Button>
            <Button variant="outline" size="sm" className="h-6 w-6 p-0 shrink-0" onClick={() => setShowNotesModal(true)} title="Notiz">
              <StickyNote className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <LearningPathGeneratorModal
        open={showAIModal}
        onOpenChange={setShowAIModal}
        skillGapInput={{
          competencyId: competency.id, competencyName: competency.name, competencyDefinition: competency.name,
          subskills: problematicSubSkills.map((ss) => ({ name: ss.name, currentLevel: ss.currentLevel ?? 0 })),
          currentLevel, targetLevel: Math.max(demandedLevel, futureLevel),
          employeeId: employee.id, employeeName: employee.full_name, employeeRole: employee.role_profile?.role_title,
        }}
      />
      <AdminNotesModal open={showNotesModal} onOpenChange={setShowNotesModal} competencyName={competency.name} employeeName={employee.full_name} employeeId={employee.id} competencyId={competency.id} />
    </>
  );
}
