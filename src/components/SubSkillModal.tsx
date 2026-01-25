import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSkillLevel, type SkillLevel } from "@/data/mockData";

interface Subskill {
  id: string;
  name: string;
  name_de?: string;
  description?: string;
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

// Generate a pseudo-random but stable rating based on subskill index and competency level
function generateSubskillRating(index: number, competencyLevel: number): number {
  const variance = ((index * 17) % 30) - 15; // -15 to +14 variance
  return Math.max(10, Math.min(100, competencyLevel + variance));
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{competencyName}</span>
            <Badge variant={getLevelBadgeVariant(overallLevel)}>
              {competencyLevel}%
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <h4 className="text-sm font-medium text-foreground">Subskills</h4>
          <div className="space-y-3">
            {subskills.length > 0 ? (
              subskills.map((subskill, index) => {
                const ratingValue = generateSubskillRating(index, competencyLevel);
                const level = getSkillLevel(ratingValue);

                return (
                  <div
                    key={subskill.id}
                    className="p-3 rounded-lg bg-secondary/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{subskill.name}</p>
                        {subskill.name_de && (
                          <p className="text-xs text-muted-foreground">{subskill.name_de}</p>
                        )}
                        {subskill.description && (
                          <p className="text-xs text-muted-foreground mt-1">{subskill.description}</p>
                        )}
                      </div>
                      <Badge variant={getLevelBadgeVariant(level)} className="ml-2">
                        {ratingValue}%
                      </Badge>
                    </div>
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "absolute h-full rounded-full transition-all duration-500 ease-out",
                          getLevelColor(level)
                        )}
                        style={{ 
                          width: `${ratingValue}%`,
                          animationDelay: `${index * 100}ms`
                        }}
                      />
                    </div>
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
