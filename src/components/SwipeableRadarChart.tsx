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
  maxPerChart = 12,
}: SwipeableRadarChartProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const minPerChart = 5;

  const groups = useMemo<ChartGroup[]>(() => {
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

    // First pass: collect clusters
    const rawGroups: ChartGroup[] = [];
    const smallClusters: { label: string; items: SkillData[] }[] = [];

    clusterMap.forEach((items, label) => {
      if (items.length >= minPerChart) {
        // Split if too large
        if (items.length > maxPerChart) {
          for (let i = 0; i < items.length; i += maxPerChart) {
            const chunk = items.slice(i, i + maxPerChart);
            const part = Math.floor(i / maxPerChart) + 1;
            rawGroups.push({
              label: items.length > maxPerChart ? `${label} (Teil ${part})` : label,
              description: getClusterDescription(label),
              skills: chunk,
            });
          }
        } else {
          rawGroups.push({ label, description: getClusterDescription(label), skills: items });
        }
      } else {
        smallClusters.push({ label, items });
      }
    });

    // Second pass: merge small clusters into groups of minPerChart..maxPerChart
    let bucket: SkillData[] = [];
    let bucketLabels: string[] = [];

    const flushBucket = () => {
      if (bucket.length > 0) {
        rawGroups.push({
          label: bucketLabels.join(" & "),
          description: getMergedDescription(bucketLabels),
          skills: [...bucket],
        });
        bucket = [];
        bucketLabels = [];
      }
    };

    smallClusters.forEach(({ label, items }) => {
      bucket.push(...items);
      bucketLabels.push(label);
      if (bucket.length >= maxPerChart) {
        flushBucket();
      }
    });

    // Remaining bucket: merge into an existing group if too small
    if (bucket.length > 0 && bucket.length < minPerChart) {
      // Find the smallest existing group that can absorb them
      const candidate = rawGroups
        .filter((g) => g.skills.length + bucket.length <= maxPerChart)
        .sort((a, b) => a.skills.length - b.skills.length)[0];

      if (candidate) {
        candidate.skills.push(...bucket);
        candidate.label += ` & ${bucketLabels.join(" & ")}`;
        candidate.description = getMergedDescription([candidate.label]);
      } else {
        flushBucket();
      }
    } else {
      flushBucket();
    }

    // Final pass: ensure no group is below min by merging adjacent small groups
    const final: ChartGroup[] = [];
    for (const group of rawGroups) {
      const prev = final[final.length - 1];
      if (prev && prev.skills.length < minPerChart && prev.skills.length + group.skills.length <= maxPerChart) {
        prev.skills.push(...group.skills);
        prev.label += ` & ${group.label}`;
        prev.description = getMergedDescription([prev.label]);
      } else {
        final.push(group);
      }
    }

    return final;
  }, [skills, maxPerChart, minPerChart]);

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
