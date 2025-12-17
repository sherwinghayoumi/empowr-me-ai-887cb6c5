import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LiveDataIndicatorProps {
  value: number;
  variance?: number;
  interval?: number;
  className?: string;
  suffix?: string;
}

export function LiveDataIndicator({
  value,
  variance = 2,
  interval = 3000,
  className,
  suffix = "%",
}: LiveDataIndicatorProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsUpdating(true);
      
      // Simulate small data fluctuation
      const change = (Math.random() - 0.5) * variance * 2;
      const newValue = Math.max(0, Math.min(100, value + change));
      
      setTimeout(() => {
        setDisplayValue(newValue);
        setIsUpdating(false);
      }, 200);
    }, interval);

    return () => clearInterval(timer);
  }, [value, variance, interval]);

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "tabular-nums transition-all duration-300",
          isUpdating && "text-primary scale-105"
        )}
      >
        {displayValue.toFixed(1)}{suffix}
      </span>
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
      </span>
    </span>
  );
}
