import { cn } from "@/lib/utils";

interface DemandIndicatorProps {
  level: "very-strong" | "strong" | "moderate" | "weak" | "very-weak";
  showLabel?: boolean;
  className?: string;
}

const levelConfig = {
  "very-strong": { dots: 5, label: "Very Strong", color: "bg-[hsl(var(--skill-very-strong))]" },
  "strong": { dots: 4, label: "Strong", color: "bg-primary" },
  "moderate": { dots: 3, label: "Moderate", color: "bg-[hsl(var(--skill-moderate))]" },
  "weak": { dots: 2, label: "Weak", color: "bg-[hsl(var(--skill-weak))]" },
  "very-weak": { dots: 1, label: "Very Weak", color: "bg-[hsl(var(--skill-very-weak))]" },
};

export function DemandIndicator({ level, showLabel = true, className }: DemandIndicatorProps) {
  const config = levelConfig[level];

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-sm text-muted-foreground min-w-20">{config.label}</span>
      )}
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-colors",
              i < config.dots ? config.color : "bg-secondary"
            )}
          />
        ))}
      </div>
    </div>
  );
}
