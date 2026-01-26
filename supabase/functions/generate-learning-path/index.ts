import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface SkillGapInput {
  competencyName: string;
  competencyDefinition?: string;
  subskills?: { name: string; currentLevel: number }[];
  currentLevel: number;
  targetLevel: number;
  employeeRole?: string;
  employeeExperience?: number;
}

const learningPathTool = {
  name: "generate_learning_path",
  description: "Generate a structured learning path with certifications and courses for a skill gap",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { 
        type: "string",
        description: "A concise title for the learning path"
      },
      description: { 
        type: "string",
        description: "A brief description of what this learning path covers"
      },
      totalDurationMinutes: {
        type: "number",
        description: "Estimated total duration in minutes"
      },
      modules: {
        type: "array",
        description: "List of 3-5 learning modules/certifications",
        items: {
          type: "object",
          properties: {
            title: { type: "string", description: "Name of the certification or course" },
            provider: { type: "string", description: "Organization offering this (e.g., PMI, Coursera, LinkedIn Learning)" },
            description: { type: "string", description: "Brief description of what is covered" },
            contentUrl: { type: "string", description: "URL to the course/certification (if known)" },
            durationMinutes: { type: "number", description: "Estimated duration in minutes" },
            level: { 
              type: "string", 
              enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
              description: "Difficulty level"
            },
            format: {
              type: "string",
              enum: ["Online", "In-Person", "Hybrid", "Self-Paced"],
              description: "Learning format"
            },
            reason: { type: "string", description: "Why this module is recommended for closing the skill gap" },
            sortOrder: { type: "number", description: "Order in the learning sequence (1-5)" }
          },
          required: ["title", "provider", "description", "durationMinutes", "level", "reason", "sortOrder"]
        }
      }
    },
    required: ["title", "description", "totalDurationMinutes", "modules"]
  }
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const input: SkillGapInput = await req.json();
    
    const { 
      competencyName, 
      competencyDefinition, 
      subskills, 
      currentLevel, 
      targetLevel,
      employeeRole,
      employeeExperience 
    } = input;

    // Build context for subskills with gaps
    const subskillContext = subskills?.length 
      ? `\n\nSubskills mit Entwicklungsbedarf:\n${subskills.map(s => `- ${s.name}: aktuell ${s.currentLevel}%`).join('\n')}`
      : '';

    const roleContext = employeeRole 
      ? `\nMitarbeiter-Rolle: ${employeeRole}` 
      : '';
    
    const experienceContext = employeeExperience 
      ? `\nBerufserfahrung: ${employeeExperience} Jahre`
      : '';

    const systemPrompt = `Du bist ein erfahrener L&D (Learning & Development) Experte spezialisiert auf M&A-Rechtsanwälte und Unternehmensberater im deutschsprachigen Raum.

Deine Aufgabe ist es, personalisierte Lernpfade zu erstellen, die:
1. Anerkannte Zertifizierungen priorisieren (z.B. NCMA, PMI, CFA, CAIA, legal-spezifische Zertifikate)
2. Online-Verfügbarkeit berücksichtigen
3. In logischer Reihenfolge von Grundlagen zu Fortgeschritten aufgebaut sind
4. Realistische Zeitschätzungen enthalten
5. Konkrete, existierende Kurse und Zertifizierungen empfehlen

Antworte immer mit dem generate_learning_path Tool.`;

    const userPrompt = `Erstelle einen Lernpfad für folgende Skill Gap:

Kompetenz: ${competencyName}
${competencyDefinition ? `Definition: ${competencyDefinition}` : ''}

Aktuelles Level: ${currentLevel}%
Ziel-Level: ${targetLevel}%
Lücke: ${targetLevel - currentLevel}%${subskillContext}${roleContext}${experienceContext}

Empfehle 3-5 konkrete Zertifizierungen, Kurse oder Lernressourcen, die diese Lücke schließen können.`;

    console.log("Calling Anthropic API for learning path generation...");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        system: systemPrompt,
        tools: [learningPathTool],
        tool_choice: { type: "tool", name: "generate_learning_path" },
        messages: [
          { role: "user", content: userPrompt }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Anthropic API response received");

    // Extract the tool use result
    const toolUse = data.content?.find((block: any) => block.type === "tool_use");
    
    if (!toolUse || toolUse.name !== "generate_learning_path") {
      throw new Error("No valid learning path generated");
    }

    const learningPath = toolUse.input;

    // Add AI recommendation reason
    learningPath.aiRecommendationReason = `Generiert für ${competencyName} (Gap: ${targetLevel - currentLevel}%)`;

    return new Response(JSON.stringify(learningPath), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-learning-path:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
