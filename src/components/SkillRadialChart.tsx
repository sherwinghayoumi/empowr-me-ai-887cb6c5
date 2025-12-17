import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface SkillRadialChartProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  delay?: number;
}

export function SkillRadialChart({
  value,
  size = 200,
  strokeWidth = 12,
  className,
  label,
  delay = 0,
}: SkillRadialChartProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedValue / 100) * circumference;

  const getColor = (val: number) => {
    if (val >= 90) return "hsl(var(--skill-very-strong))";
    if (val >= 70) return "hsl(var(--primary))";
    if (val >= 50) return "hsl(var(--skill-moderate))";
    if (val >= 30) return "hsl(var(--skill-weak))";
    return "hsl(var(--skill-very-weak))";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="hsl(var(--secondary))"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={getColor(value)}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-foreground">{Math.round(animatedValue)}%</span>
        {label && <span className="text-sm text-muted-foreground mt-1">{label}</span>}
      </div>
    </div>
  );
}
