import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSkillLevel, type SkillLevel } from "@/data/mockData";
import { Info } from "lucide-react";

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

export function SubSkillModal({
  open,
  onOpenChange,
  competencyName,
  subskills,
  competencyLevel,
}: SubSkillModalProps) {
  if (!competencyName) return null;

  const overallLevel = getSkillLevel(competencyLevel);
  
  // Count how many subskills have actual ratings
  const ratedCount = subskills.filter(s => s.currentLevel !== null).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{competencyName}</span>
            <Badge variant={getLevelBadgeVariant(overallLevel)}>
              {competencyLevel}%
            </Badge>
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

                return (
                  <div
                    key={subskill.id}
                    className="p-3 rounded-lg bg-secondary/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{subskill.name}</p>
                        {subskill.description && (
                          <p className="text-xs text-muted-foreground mt-1">{subskill.description}</p>
                        )}
                      </div>
                      {hasRating ? (
                        <Badge variant={getLevelBadgeVariant(level!)} className="ml-2">
                          {ratingValue}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="ml-2 text-muted-foreground">
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
              <span>90%+ Excellent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-strong))]" />
              <span>70-89% Strong</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-moderate))]" />
              <span>50-69% Moderate</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded bg-[hsl(var(--skill-weak))]" />
              <span>&lt;50% Needs Work</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}