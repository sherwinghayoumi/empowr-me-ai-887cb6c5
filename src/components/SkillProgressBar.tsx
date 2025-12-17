import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SkillProgressBarProps {
  value: number;
  currentDemand?: number;
  futureDemand?: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
  delay?: number;
}

export function SkillProgressBar({
  value,
  currentDemand,
  futureDemand,
  showLabel = true,
  size = "md",
  className,
  delay = 0,
}: SkillProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const getColorClass = (val: number) => {
    if (val >= 90) return "bg-[hsl(var(--skill-very-strong))]";
    if (val >= 70) return "bg-primary";
    if (val >= 50) return "bg-[hsl(var(--skill-moderate))]";
    if (val >= 30) return "bg-[hsl(var(--skill-weak))]";
    return "bg-[hsl(var(--skill-very-weak))]";
  };

  const heightClass = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  }[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {showLabel && (
        <span className="text-sm font-medium text-foreground min-w-[3rem]">{Math.round(animatedValue)}%</span>
      )}
      <div className={cn("relative flex-1", className)}>
        <div className={cn("bg-secondary rounded-full overflow-hidden", heightClass)}>
          <div
            className={cn("h-full rounded-full transition-all duration-700 ease-out", getColorClass(value))}
            style={{ width: `${animatedValue}%` }}
          />
        </div>
        {/* Demand Markers */}
        {currentDemand && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[hsl(var(--skill-moderate))] transition-opacity duration-500"
            style={{ left: `${currentDemand}%`, opacity: animatedValue > 0 ? 1 : 0 }}
            title={`Current Demand: ${currentDemand}%`}
          />
        )}
        {futureDemand && (
          <div
            className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-[hsl(var(--skill-weak))] transition-opacity duration-500"
            style={{ left: `${futureDemand}%`, opacity: animatedValue > 0 ? 1 : 0 }}
            title={`Future Demand: ${futureDemand}%`}
          />
        )}
      </div>
    </div>
  );
}
