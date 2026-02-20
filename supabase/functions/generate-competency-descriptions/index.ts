import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface CompetencyInput {
  name: string;
  type: "competency" | "subskill";
  tools?: string[]; // optional – aus der DB bekannt
}

interface GeneratedDescription {
  name_key: string;
  description_type: "competency" | "subskill";
  label_de: string;
  focus: string;
  usage_context: string;
  relevance: string;
  tools: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY nicht konfiguriert");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) throw new Error("Supabase-Konfiguration fehlt");

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const { competencies }: { competencies: CompetencyInput[] } = body;

    if (!competencies?.length) {
      return new Response(JSON.stringify({ error: "Keine Kompetenzen übergeben" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Maximal 20 auf einmal (Token-Limit)
    const batch = competencies.slice(0, 20);

    const systemPrompt = `Du bist ein Experte für Anwalts- und M&A-Kompetenzen in Deutschland.
Du erhältst eine Liste von Kompetenz- oder Subskill-Namen aus einem Corporate Law / M&A Kontext.
Für jede Kompetenz generierst du eine strukturierte, professionelle deutschsprachige Beschreibung.

WICHTIG:
- Antworte NUR mit einem validen JSON-Array, ohne Markdown-Codeblöcke
- label_de: Präziser deutscher Fachbegriff (max. 6 Wörter)
- focus: Was ist der Schwerpunkt? (2-3 Sätze, präzise)
- usage_context: Wo und wann wird diese Kompetenz gebraucht? (2-3 Sätze)
- relevance: Warum ist sie relevant? Konkrete Konsequenzen bei Fehlen. (2-3 Sätze)
- tools: Array mit 3-5 relevanten Software-Tools oder Methoden (nur Namen, keine Beschreibungen)

Format:
[
  {
    "name_key": "<exakter englischer Name wie übergeben>",
    "label_de": "...",
    "focus": "...",
    "usage_context": "...",
    "relevance": "...",
    "tools": ["Tool1", "Tool2", "Tool3"]
  }
]`;

    const userPrompt = `Generiere deutsche Beschreibungen für folgende Kompetenzen im Corporate Law / M&A Bereich:

${batch
  .map(
    (c) =>
      `- Name: "${c.name}" | Typ: ${c.type === "competency" ? "Hauptkompetenz" : "Teilfähigkeit"}${
        c.tools?.length ? ` | Bekannte Tools: ${c.tools.join(", ")}` : ""
      }`
  )
  .join("\n")}

Antworte mit einem JSON-Array für alle ${batch.length} Kompetenzen.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude API Fehler: ${response.status} – ${errorText}`);
    }

    const aiResponse = await response.json();
    const rawText = aiResponse.content?.[0]?.text || "";

    // JSON aus Antwort extrahieren
    let parsed: GeneratedDescription[] = [];
    try {
      // Direkt parsen
      parsed = JSON.parse(rawText);
    } catch {
      // Fallback: JSON-Array aus Text extrahieren
      const match = rawText.match(/\[[\s\S]*\]/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error("KI-Antwort konnte nicht als JSON geparst werden");
      }
    }

    // In DB speichern (upsert – überschreibt bei gleichem name_key)
    const rows = parsed.map((d) => ({
      name_key: d.name_key,
      description_type: (d as any).description_type ?? (batch.find(c => c.name === d.name_key)?.type ?? "competency"),
      label_de: d.label_de,
      focus: d.focus,
      usage_context: d.usage_context,
      relevance: d.relevance,
      tools: d.tools ?? [],
      is_ai_generated: true,
      generated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("competency_descriptions")
      .upsert(rows, { onConflict: "name_key" });

    if (upsertError) {
      throw new Error(`DB-Speicherfehler: ${upsertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        generated: rows.length,
        descriptions: rows,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("generate-competency-descriptions Fehler:", err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unbekannter Fehler",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
