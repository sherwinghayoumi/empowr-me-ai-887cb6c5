import { cn, capLevel } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChevronRight, Info, Wrench } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { getCompetencyDescription } from "@/data/competencyDescriptions";

interface CompetencyBarProps {
  competencyName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

export function CompetencyBar({
  competencyName,
  currentLevel: rawCurrentLevel,
  demandedLevel: rawDemandedLevel,
  futureLevel: rawFutureLevel,
  className,
  delay = 0,
  onClick,
}: CompetencyBarProps) {
  // Cap all levels at 100% for display
  const currentLevel = capLevel(rawCurrentLevel);
  const demandedLevel = capLevel(rawDemandedLevel);
  const futureLevel = capLevel(rawFutureLevel);

  const [animatedLevel, setAnimatedLevel] = useState(0);
  const [showMarkers, setShowMarkers] = useState(false);

  useEffect(() => {
    const levelTimer = setTimeout(() => {
      setAnimatedLevel(currentLevel);
    }, delay);
    const markerTimer = setTimeout(() => {
      setShowMarkers(true);
    }, delay + 300);
    return () => {
      clearTimeout(levelTimer);
      clearTimeout(markerTimer);
    };
  }, [currentLevel, delay]);

  const getBarColor = (current: number, demanded: number) => {
    if (current >= demanded) return "bg-[hsl(var(--skill-very-strong))]";
    if (current >= demanded - 20) return "bg-primary";
    if (current >= demanded - 40) return "bg-[hsl(var(--skill-moderate))]";
    return "bg-[hsl(var(--skill-weak))]";
  };

  const description = getCompetencyDescription(competencyName);
  const displayName = description?.labelDE ?? competencyName;

  return (
    <div className={cn("group w-full", className)}>
      <button
        onClick={onClick}
        className={cn(
          "w-full text-left space-y-2 p-3 rounded-lg transition-all duration-200",
          "hover:bg-secondary/30 hover:scale-[1.01] cursor-pointer"
        )}
      >
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{displayName}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{Math.round(animatedLevel)}%</span>
            {description && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="p-0.5 rounded-full text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Mehr Informationen"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-80 text-sm space-y-3 z-50"
                  side="left"
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
            )}
          </div>
        </div>
        <div className="relative h-3 bg-secondary rounded-full overflow-visible">
          {/* Current Level Bar */}
          <div
            className={cn("absolute h-full rounded-full transition-all duration-700 ease-out", getBarColor(currentLevel, demandedLevel))}
            style={{ width: `${animatedLevel}%` }}
          />

          {/* Current Demanded Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-foreground/70 rounded-full z-10 transition-all duration-500"
            style={{ left: `${demandedLevel}%`, opacity: showMarkers ? 1 : 0, transform: `translateY(-50%) scale(${showMarkers ? 1 : 0})` }}
            title={`Aktuelle Anforderung: ${demandedLevel}%`}
          />

          {/* Future Demanded Marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full z-10 transition-all duration-500"
            style={{ left: `${futureLevel}%`, opacity: showMarkers ? 1 : 0, transform: `translateY(-50%) scale(${showMarkers ? 1 : 0})` }}
            title={`Zukünftige Anforderung: ${futureLevel}%`}
          />
        </div>
      </button>
    </div>
  );
}
