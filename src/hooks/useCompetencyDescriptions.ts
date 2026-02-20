import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  getCompetencyDescription as getStaticCompetencyDescription,
  getSubskillDescription as getStaticSubskillDescription,
  type SkillDescription,
} from "@/data/competencyDescriptions";

interface DbDescription {
  name_key: string;
  description_type: string;
  label_de: string;
  focus: string;
  usage_context: string;
  relevance: string;
  tools: string[];
}

// ── Hook: lädt alle DB-Beschreibungen einmalig und cached sie ─────────────────
export function useCompetencyDescriptions() {
  return useQuery({
    queryKey: ["competency_descriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("competency_descriptions")
        .select("name_key, description_type, label_de, focus, usage_context, relevance, tools");
      if (error) throw error;
      // Index für O(1)-Lookup
      const map = new Map<string, DbDescription>();
      (data ?? []).forEach((d) => map.set(d.name_key.toLowerCase(), d as DbDescription));
      return map;
    },
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
  });
}

// ── Hilfsfunktion: DB first, dann statische Datei als Fallback ────────────────
export function resolveDescription(
  name: string,
  dbMap: Map<string, DbDescription> | undefined,
  type: "competency" | "subskill" = "competency"
): SkillDescription | undefined {
  if (!name) return undefined;
  const key = name.trim().toLowerCase();

  // 1. Exakter DB-Match
  const dbExact = dbMap?.get(key);
  if (dbExact) return dbToSkillDescription(dbExact);

  // 2. Teilstring-Match in DB
  if (dbMap) {
    for (const [dbKey, dbVal] of dbMap.entries()) {
      if (key.includes(dbKey) || dbKey.includes(key)) {
        return dbToSkillDescription(dbVal);
      }
    }
  }

  // 3. Fallback auf statische Datei
  return type === "competency"
    ? getStaticCompetencyDescription(name)
    : getStaticSubskillDescription(name);
}

function dbToSkillDescription(d: DbDescription): SkillDescription {
  return {
    nameKey: d.name_key,
    labelDE: d.label_de,
    focus: d.focus,
    usageContext: d.usage_context,
    relevance: d.relevance,
    tools: d.tools ?? [],
  };
}
