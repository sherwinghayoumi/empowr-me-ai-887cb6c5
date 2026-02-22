import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface AISparkleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
  showLabel?: boolean;
}

/**
 * Animated sparkle badge for AI-generated content.
 * Pulses gently to indicate AI origin.
 */
export function AISparkle({ className, size = "sm", label = "KI", showLabel = true }: AISparkleProps) {
  const sizeClasses = {
    sm: "h-5 px-1.5 text-[10px] gap-0.5",
    md: "h-6 px-2 text-xs gap-1",
    lg: "h-7 px-2.5 text-xs gap-1.5",
  };
  const iconSize = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        "bg-primary/15 text-primary border border-primary/25",
        "animate-ai-shimmer",
        sizeClasses[size],
        className,
      )}
    >
      <Sparkles className={cn(iconSize[size], "animate-ai-sparkle-icon")} />
      {showLabel && label}
    </span>
  );
}

/**
 * Animated sparkle icon only (no badge background).
 * Useful inline next to titles.
 */
export function AISparkleIcon({ className, size = "sm" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const iconSize = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };
  return (
    <Sparkles
      className={cn(
        iconSize[size],
        "text-primary animate-ai-sparkle-icon",
        className,
      )}
    />
  );
}
