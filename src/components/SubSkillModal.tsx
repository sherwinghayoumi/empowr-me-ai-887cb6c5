import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSkillLevel, type SkillLevel } from "@/data/mockData";
import { type Competency } from "@/data/competenciesData";

interface SubSkillRating {
  subSkillId: string;
  rating: number;
}

interface SubSkillModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competency: Competency | null;
  subSkillRatings: SubSkillRating[];
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
  competency,
  subSkillRatings,
  competencyLevel,
}: SubSkillModalProps) {
  if (!competency) return null;

  const overallLevel = getSkillLevel(competencyLevel);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{competency.name}</span>
            <Badge variant={getLevelBadgeVariant(overallLevel)}>
              {competencyLevel}%
            </Badge>
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {competency.primaryCompetency}
          </p>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <h4 className="text-sm font-medium text-foreground">Sub-Skills</h4>
          <div className="space-y-3">
            {competency.subSkills.map((subSkill, index) => {
              const rating = subSkillRatings.find(r => r.subSkillId === subSkill.id);
              const ratingValue = rating?.rating ?? 50;
              const level = getSkillLevel(ratingValue);

              return (
                <div
                  key={subSkill.id}
                  className="p-3 rounded-lg bg-secondary/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{subSkill.name}</p>
                      <p className="text-xs text-muted-foreground">{subSkill.nameDE}</p>
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
            })}
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
