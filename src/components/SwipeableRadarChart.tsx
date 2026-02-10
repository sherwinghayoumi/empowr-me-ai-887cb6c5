import { useMemo, useState } from "react";
import { StrengthsWeaknessesRadar } from "./StrengthsWeaknessesRadar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SkillData {
  skillId: string;
  skillName?: string;
  currentLevel: number;
  demandedLevel: number;
  futureLevel?: number;
  clusterName?: string;
}

interface SwipeableRadarChartProps {
  skills: SkillData[];
  showDemanded?: boolean;
  className?: string;
  maxPerChart?: number;
}

interface ChartGroup {
  label: string;
  skills: SkillData[];
}

export function SwipeableRadarChart({
  skills,
  showDemanded = true,
  className,
  maxPerChart = 7,
}: SwipeableRadarChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const groups = useMemo<ChartGroup[]>(() => {
    // If 7 or fewer, show all in one chart
    if (skills.length <= maxPerChart) {
      return [{ label: "Alle Kompetenzen", skills }];
    }

    // Group by cluster
    const clusterMap = new Map<string, SkillData[]>();
    skills.forEach((s) => {
      const cluster = s.clusterName || "Sonstige";
      if (!clusterMap.has(cluster)) clusterMap.set(cluster, []);
      clusterMap.get(cluster)!.push(s);
    });

    // Merge small clusters to keep groups between 3-7 items
    const result: ChartGroup[] = [];
    let overflow: SkillData[] = [];
    let overflowLabels: string[] = [];

    clusterMap.forEach((items, label) => {
      if (items.length >= 3) {
        // If a single cluster is too large, split it
        if (items.length > maxPerChart) {
          for (let i = 0; i < items.length; i += maxPerChart) {
            const chunk = items.slice(i, i + maxPerChart);
            const part = Math.floor(i / maxPerChart) + 1;
            result.push({ label: `${label} (${part})`, skills: chunk });
          }
        } else {
          result.push({ label, skills: items });
        }
      } else {
        overflow.push(...items);
        overflowLabels.push(label);
        // Flush overflow when it reaches max
        if (overflow.length >= maxPerChart) {
          const chunk = overflow.splice(0, maxPerChart);
          result.push({ label: overflowLabels.join(" & "), skills: chunk });
          overflowLabels = [];
        }
      }
    });

    if (overflow.length > 0) {
      // Try to merge into last group if it would stay <= max
      const last = result[result.length - 1];
      if (last && last.skills.length + overflow.length <= maxPerChart) {
        last.skills.push(...overflow);
        last.label += ` & ${overflowLabels.join(" & ")}`;
      } else {
        result.push({
          label: overflowLabels.join(" & ") || "Weitere",
          skills: overflow,
        });
      }
    }

    return result;
  }, [skills, maxPerChart]);

  const totalGroups = groups.length;
  const current = groups[activeIndex] || groups[0];

  if (!current) return null;

  // Single group — no navigation needed
  if (totalGroups <= 1) {
    return (
      <StrengthsWeaknessesRadar
        skills={current.skills}
        showDemanded={showDemanded}
        className={className}
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          disabled={activeIndex === 0}
          onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col items-center gap-1">
          <span className="text-sm font-medium text-foreground">
            {current.label}
          </span>
          {/* Dot indicators */}
          <div className="flex gap-1.5">
            {groups.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex
                    ? "w-4 bg-primary"
                    : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          disabled={activeIndex === totalGroups - 1}
          onClick={() => setActiveIndex((i) => Math.min(totalGroups - 1, i + 1))}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Chart */}
      <StrengthsWeaknessesRadar
        skills={current.skills}
        showDemanded={showDemanded}
        className={className}
      />
    </div>
  );
}
