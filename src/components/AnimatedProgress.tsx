import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  delay?: number;
  className?: string;
  indicatorClassName?: string;
}

export function AnimatedProgress({
  value,
  delay = 0,
  className,
  indicatorClassName,
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <Progress
      value={animatedValue}
      className={cn("transition-all duration-700", className)}
      indicatorClassName={indicatorClassName}
    />
  );
}
