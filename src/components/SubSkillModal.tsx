import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn, getSkillLevel, type SkillLevel } from "@/lib/utils";
import { Info, Wrench } from "lucide-react";
import { getCompetencyDescription, getSubskillDescription } from "@/data/competencyDescriptions";

interface Subskill {
  id: string;
  name: string;
  description?: string;
  currentLevel: number | null;
  evidence?: string;
}

interface SubSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competencyName: string | null;
  subskills: Subskill[];
  competencyLevel: number;
}

function getLevelColor(level: SkillLevel): string {
  switch (level) {
    case "very-strong":
      return "bg-[hsl(var(--skill-very-strong))]";
    case "strong":
      return "bg-[hsl(var(--skill-strong))]";
    case "moderate":
      return "bg-[hsl(var(--skill-moderate))]";
    case "weak":
      return "bg-[hsl(var(--skill-weak))]";
    case "very-weak":
      return "bg-[hsl(var(--skill-very-weak))]";
    default:
      return "bg-muted";
  }
}

function getLevelBadgeVariant(level: SkillLevel): "default" | "secondary" | "destructive" | "outline" {
  switch (level) {
    case "very-strong":
    case "strong":
      return "default";
    case "moderate":
      return "secondary";
    case "weak":
    case "very-weak":
      return "destructive";
    default:
      return "outline";
  }
}

function InfoPopover({ description }: { description: ReturnType<typeof getCompetencyDescription> }) {
  if (!description) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Mehr Informationen"
          onClick={(e) => e.stopPropagation()}
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-80 text-sm space-y-3 z-[200]"
        side="right"
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="font-semibold text-foreground text-base">{description.labelDE}</p>
        </div>
        <div className="space-y-2.5">
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Schwerpunkt</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{description.focus}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Einsatzbereich</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{description.usageContext}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-0.5">Relevanz</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{description.relevance}</p>
          </div>
          {description.tools && description.tools.length > 0 && (
            <div>
              <div className="flex items-center gap-1 mb-1">
                <Wrench className="w-3 h-3 text-primary" />
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Tools & Ressourcen</p>
              </div>
              <div className="flex flex-wrap gap-1">
                {description.tools.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/40"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function SubSkillModal({
  open,
  onOpenChange,
  competencyName,
  subskills,
  competencyLevel,
}: SubSkillModalProps) {
  if (!competencyName) return null;

  const overallLevel = getSkillLevel(competencyLevel);
  const competencyDesc = getCompetencyDescription(competencyName);
  const displayCompetencyName = competencyDesc?.labelDE ?? competencyName;

  // Count how many subskills have actual ratings
  const ratedCount = subskills.filter(s => s.currentLevel !== null).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{displayCompetencyName}</span>
            <Badge variant={getLevelBadgeVariant(overallLevel)}>
              {competencyLevel}%
            </Badge>
            {competencyDesc && (
              <InfoPopover description={competencyDesc} />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-foreground">Subskills</h4>
            {ratedCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {ratedCount} von {subskills.length} bewertet
              </span>
            )}
          </div>

          <div className="space-y-3">
            {subskills.length > 0 ? (
              subskills.map((subskill) => {
                const hasRating = subskill.currentLevel !== null;
                const ratingValue = subskill.currentLevel ?? 0;
                const level = hasRating ? getSkillLevel(ratingValue) : null;
                const subskillDesc = getSubskillDescription(subskill.name);
                const displaySubskillName = subskillDesc?.labelDE ?? subskill.name;

                return (
                  <div
                    key={subskill.id}
                    className="p-3 rounded-lg bg-secondary/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium text-foreground">{displaySubskillName}</p>
                          {subskillDesc && (
                            <InfoPopover description={subskillDesc} />
                          )}
                        </div>
                        {subskillDesc?.focus && (
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
                            {subskillDesc.focus}
                          </p>
                        )}
                      </div>
                      {hasRating ? (
                        <Badge variant={getLevelBadgeVariant(level!)} className="ml-2 shrink-0">
                          {ratingValue}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 text-muted-foreground shrink-0">
                          Nicht bewertet
                        </Badge>
                      )}
                    </div>

                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      {hasRating ? (
                        <div
                          className={cn(
                            "absolute h-full rounded-full transition-all duration-500 ease-out",
                            getLevelColor(level!)
                          )}
                          style={{ width: `${ratingValue}%` }}
                        />
                      ) : (
                        <div className="absolute h-full w-full bg-muted/50" />
                      )}
                    </div>

                    {subskill.evidence && (
                      <div className="flex items-start gap-2 mt-2 p-2 bg-secondary/20 rounded text-xs text-muted-foreground">
                        <Info className="w-3 h-3 mt-0.5 shrink-0" />
                        <span>{subskill.evidence}</span>
                      </div>
                    )}

                    {subskillDesc?.tools && subskillDesc.tools.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {subskillDesc.tools.slice(0, 3).map((tool) => (
                          <span
                            key={tool}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/60 text-muted-foreground border border-border/40"
                          >
                            {tool}
                          </span>
                        ))}
                        {subskillDesc.tools.length > 3 && (
                          <span className="text-[10px] text-muted-foreground px-1">
                            +{subskillDesc.tools.length - 3} weitere
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Keine Subskills für diese Kompetenz definiert
              </p>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-3 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-very-strong))]" />
              <span>90%+ Exzellent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-strong))]" />
              <span>70–89% Stark</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-moderate))]" />
              <span>50–69% Solide</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-weak))]" />
              <span>&lt;50% Entwicklungsbedarf</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
