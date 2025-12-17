import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface InteractiveChartProps {
  data: DataPoint[];
  type?: "bar" | "horizontal";
  className?: string;
  animate?: boolean;
  showValues?: boolean;
}

export function InteractiveChart({
  data,
  type = "bar",
  className,
  animate = true,
  showValues = true,
}: InteractiveChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [animatedData, setAnimatedData] = useState<DataPoint[]>(
    data.map((d) => ({ ...d, value: 0 }))
  );

  const maxValue = Math.max(...data.map((d) => d.value));

  useEffect(() => {
    if (animate) {
      const timeout = setTimeout(() => {
        setAnimatedData(data);
      }, 300);
      return () => clearTimeout(timeout);
    } else {
      setAnimatedData(data);
    }
  }, [data, animate]);

  const getBarColor = (index: number, value: number) => {
    if (data[index].color) return data[index].color;
    if (value >= 80) return "hsl(var(--skill-very-strong))";
    if (value >= 60) return "hsl(var(--skill-strong))";
    if (value >= 40) return "hsl(var(--skill-moderate))";
    if (value >= 20) return "hsl(var(--skill-weak))";
    return "hsl(var(--skill-very-weak))";
  };

  if (type === "horizontal") {
    return (
      <div className={cn("space-y-3", className)}>
        {animatedData.map((item, index) => (
          <div
            key={item.label}
            className="group cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <div className="flex justify-between text-sm mb-1">
              <span className={cn(
                "transition-colors duration-200",
                hoveredIndex === index ? "text-foreground font-medium" : "text-muted-foreground"
              )}>
                {item.label}
              </span>
              {showValues && (
                <span className={cn(
                  "transition-all duration-200",
                  hoveredIndex === index ? "text-foreground scale-110" : "text-muted-foreground"
                )}>
                  {Math.round(item.value)}%
                </span>
              )}
            </div>
            <div className="h-3 bg-secondary/50 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-700 ease-out",
                  hoveredIndex === index && "shadow-lg"
                )}
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: getBarColor(index, data[index].value),
                  boxShadow: hoveredIndex === index 
                    ? `0 0 20px ${getBarColor(index, data[index].value)}` 
                    : "none",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("flex items-end gap-2 h-48", className)}>
      {animatedData.map((item, index) => (
        <div
          key={item.label}
          className="flex-1 flex flex-col items-center gap-2 group cursor-pointer"
          onMouseEnter={() => setHoveredIndex(index)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <div
            className={cn(
              "w-full rounded-t-lg transition-all duration-700 ease-out relative",
              hoveredIndex === index && "shadow-lg"
            )}
            style={{
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: getBarColor(index, data[index].value),
              minHeight: "4px",
              boxShadow: hoveredIndex === index 
                ? `0 0 20px ${getBarColor(index, data[index].value)}` 
                : "none",
              transform: hoveredIndex === index ? "scaleY(1.05)" : "scaleY(1)",
              transformOrigin: "bottom",
            }}
          >
            {showValues && hoveredIndex === index && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground px-2 py-1 rounded text-xs font-medium shadow-lg animate-scale-in">
                {Math.round(item.value)}%
              </div>
            )}
          </div>
          <span className={cn(
            "text-xs transition-colors duration-200 text-center truncate w-full",
            hoveredIndex === index ? "text-foreground font-medium" : "text-muted-foreground"
          )}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
