import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  animation?: "bounce" | "pulse" | "spin" | "shake" | "float";
  hoverOnly?: boolean;
  size?: number;
}

export function AnimatedIcon({
  icon: Icon,
  className,
  animation = "bounce",
  hoverOnly = true,
  size = 24,
}: AnimatedIconProps) {
  const animationClasses = {
    bounce: "hover:animate-bounce",
    pulse: "hover:animate-pulse",
    spin: "hover:animate-spin",
    shake: "hover:animate-shake",
    float: "hover:animate-float",
  };

  const alwaysAnimationClasses = {
    bounce: "animate-bounce",
    pulse: "animate-pulse",
    spin: "animate-spin",
    shake: "animate-shake",
    float: "animate-float",
  };

  return (
    <Icon
      size={size}
      className={cn(
        "transition-all duration-300",
        hoverOnly ? animationClasses[animation] : alwaysAnimationClasses[animation],
        className
      )}
    />
  );
}
