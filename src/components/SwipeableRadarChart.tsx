import { useMemo, useState } from "react";
import { StrengthsWeaknessesRadar } from "./StrengthsWeaknessesRadar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Info } from "lucide-react";

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
  description: string;
  skills: SkillData[];
}

// Cluster descriptions explaining WHY each grouping matters
const CLUSTER_DESCRIPTIONS: Record<string, string> = {
  "Digital & Technology": "Zeigt Ihre digitale Kompetenz – entscheidend für die Zukunftsfähigkeit in einer zunehmend technologiegetriebenen Arbeitswelt.",
  "Advisory & Client Excellence": "Misst Ihre Beratungs- und Kundenorientierung – der Kern Ihrer Wertschöpfung im direkten Mandantenkontakt.",
  "Leadership & Collaboration": "Bewertet Ihre Führungs- und Teamfähigkeiten – essenziell für Karriereentwicklung und organisatorischen Einfluss.",
  "Business Acumen & Strategy": "Erfasst Ihr strategisches Geschäftsverständnis – wichtig für unternehmerisches Denken und Marktpositionierung.",
  "Communication & Influence": "Zeigt Ihre Kommunikations- und Überzeugungskraft – entscheidend für Stakeholder-Management und Wirkung.",
  "Analytical & Problem Solving": "Misst Ihre analytischen Fähigkeiten – die Grundlage für fundierte Entscheidungen und komplexe Problemlösungen.",
  "Personal Effectiveness": "Bewertet Ihre persönliche Wirksamkeit – Selbstmanagement, Resilienz und kontinuierliche Weiterentwicklung.",
};

function getClusterDescription(clusterName: string): string {
  // Try exact match first, then partial
  if (CLUSTER_DESCRIPTIONS[clusterName]) return CLUSTER_DESCRIPTIONS[clusterName];
  
  const lowerName = clusterName.toLowerCase();
  for (const [key, desc] of Object.entries(CLUSTER_DESCRIPTIONS)) {
    if (lowerName.includes(key.toLowerCase().split(" ")[0]) || key.toLowerCase().includes(lowerName.split(" ")[0])) {
      return desc;
    }
  }
  
  return `Gruppiert thematisch verwandte Kompetenzen, um gezielt Stärken und Entwicklungsfelder in diesem Bereich sichtbar zu machen.`;
}

function getMergedDescription(labels: string[]): string {
  return `Fasst ${labels.length} kleinere Kompetenzbereiche zusammen, um ein vollständiges Bild ergänzender Fähigkeiten zu geben, die übergreifend wirken.`;
}

export function SwipeableRadarChart({
  skills,
  showDemanded = true,
  className,
  maxPerChart = 10,
}: SwipeableRadarChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const groups = useMemo<ChartGroup[]>(() => {
    // If 10 or fewer, show all in one chart
    if (skills.length <= maxPerChart) {
      return [{
        label: "Gesamtübersicht",
        description: "Alle Kompetenzen auf einen Blick – ideal um schnell zu erkennen, wo Sie im Vergleich zu den Rollenanforderungen stehen.",
        skills,
      }];
    }

    // Group by cluster
    const clusterMap = new Map<string, SkillData[]>();
    skills.forEach((s) => {
      const cluster = s.clusterName || "Sonstige";
      if (!clusterMap.has(cluster)) clusterMap.set(cluster, []);
      clusterMap.get(cluster)!.push(s);
    });

    const result: ChartGroup[] = [];
    let overflow: SkillData[] = [];
    let overflowLabels: string[] = [];

    clusterMap.forEach((items, label) => {
      if (items.length >= 3) {
        if (items.length > maxPerChart) {
          for (let i = 0; i < items.length; i += maxPerChart) {
            const chunk = items.slice(i, i + maxPerChart);
            const part = Math.floor(i / maxPerChart) + 1;
            result.push({
              label: `${label} (Teil ${part})`,
              description: getClusterDescription(label),
              skills: chunk,
            });
          }
        } else {
          result.push({
            label,
            description: getClusterDescription(label),
            skills: items,
          });
        }
      } else {
        overflow.push(...items);
        overflowLabels.push(label);
        if (overflow.length >= maxPerChart) {
          const chunk = overflow.splice(0, maxPerChart);
          result.push({
            label: overflowLabels.join(" & "),
            description: getMergedDescription(overflowLabels),
            skills: chunk,
          });
          overflowLabels = [];
        }
      }
    });

    if (overflow.length > 0) {
      const last = result[result.length - 1];
      if (last && last.skills.length + overflow.length <= maxPerChart) {
        last.skills.push(...overflow);
        last.label += ` & ${overflowLabels.join(" & ")}`;
        last.description = getMergedDescription([last.label, ...overflowLabels]);
      } else {
        result.push({
          label: overflowLabels.join(" & ") || "Weitere Kompetenzen",
          description: getMergedDescription(overflowLabels),
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
      <div className="space-y-2">
        <div className="flex items-start gap-2 px-1">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {current.description}
          </p>
        </div>
        <StrengthsWeaknessesRadar
          skills={current.skills}
          showDemanded={showDemanded}
          className={className}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Navigation header */}
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

        <div className="flex flex-col items-center gap-1.5 max-w-[70%]">
          <span className="text-sm font-semibold text-foreground">
            {current.label}
          </span>
          <span className="text-xs text-muted-foreground/70">
            {activeIndex + 1} von {totalGroups} · {current.skills.length} Kompetenzen
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
                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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

      {/* Explanation */}
      <div className="flex items-start gap-2 px-2 py-2 rounded-md bg-secondary/30">
        <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          {current.description}
        </p>
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
