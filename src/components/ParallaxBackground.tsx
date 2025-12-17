import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface ParallaxBackgroundProps {
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}

export function ParallaxBackground({ 
  className,
  intensity = "medium" 
}: ParallaxBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  const multiplier = intensity === "subtle" ? 10 : intensity === "medium" ? 20 : 40;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * multiplier;
      const y = (e.clientY / window.innerHeight - 0.5) * multiplier;
      setMousePosition({ x, y });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [multiplier]);

  return (
    <div className={cn("fixed inset-0 -z-10 overflow-hidden pointer-events-none", className)}>
      {/* Animated gradient orbs */}
      <div
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] animate-gradient-shift"
        style={{
          background: "radial-gradient(circle, hsl(var(--primary) / 0.4), transparent 70%)",
          top: `calc(10% + ${scrollY * 0.1}px)`,
          left: "10%",
          transform: `translate(${mousePosition.x * 1.5}px, ${mousePosition.y * 1.5}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] animate-gradient-shift-reverse"
        style={{
          background: "radial-gradient(circle, hsl(var(--skill-strong) / 0.4), transparent 70%)",
          bottom: `calc(10% - ${scrollY * 0.05}px)`,
          right: "15%",
          transform: `translate(${-mousePosition.x}px, ${-mousePosition.y}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-15 blur-[80px] animate-gradient-pulse"
        style={{
          background: "radial-gradient(circle, hsl(var(--skill-very-strong) / 0.3), transparent 70%)",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`,
          transition: "transform 0.3s ease-out",
        }}
      />
      
      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: "100px 100px",
        }}
      />
    </div>
  );
}
