import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SkillBarProps {
  skillName: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel: number;
  className?: string;
  delay?: number;
}

export function SkillBar({
  skillName,
  currentLevel,
  demandedLevel,
  futureLevel,
  className,
  delay = 0,
}: SkillBarProps) {
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
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">{skillName}</span>
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
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-muted-foreground">
            Demand
          </div>
        </div>
        
        {/* Future Demanded Marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-full z-10 transition-all duration-500"
          style={{ left: `${futureLevel}%`, opacity: showMarkers ? 1 : 0, transform: `translateY(-50%) scale(${showMarkers ? 1 : 0})` }}
          title={`Future Demand: ${futureLevel}%`}
        >
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-primary">
            Future
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>0%</span>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-foreground/70" /> Current Demand
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-primary" /> Future Demand
          </span>
        </div>
        <span>100%</span>
      </div>
    </div>
  );
}
