import { cn, capLevel } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";

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

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left space-y-2 p-3 rounded-lg transition-all duration-200",
        "hover:bg-secondary/30 hover:scale-[1.01] cursor-pointer group",
        className
      )}
    >
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-foreground font-medium">{competencyName}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        <span className="text-muted-foreground">{Math.round(animatedLevel)}%</span>
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
          title={`Current Demand: ${demandedLevel}%`}
        />
        
        {/* Future Demanded Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full z-10 transition-all duration-500"
          style={{ left: `${futureLevel}%`, opacity: showMarkers ? 1 : 0, transform: `translateY(-50%) scale(${showMarkers ? 1 : 0})` }}
          title={`Future Demand: ${futureLevel}%`}
        />
      </div>
    </button>
  );
}
