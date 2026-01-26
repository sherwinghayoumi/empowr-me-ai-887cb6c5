import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

interface SkillGapInput {
  competencyName: string;
  competencyDefinition?: string;
  subskills?: { name: string; currentLevel: number }[];
  currentLevel: number;
  targetLevel: number;
  employeeRole?: string;
  employeeExperience?: number;
}

interface ModuleFromClaude {
  title: string;
  provider: string;
  description: string;
  contentUrl?: string | null;
  durationMinutes: number;
  level: string;
  format: string;
  reason: string;
  sortOrder: number;
}

interface EnrichedModule extends ModuleFromClaude {
  verifiedUrl: string | null;
  isUrlVerified: boolean;
  searchFallbackUrl: string;
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

// Generate fallback search URL based on provider
function generateFallbackSearchUrl(title: string, provider: string): string {
  const encodedTitle = encodeURIComponent(title);
  const providerLower = provider.toLowerCase();
  
  if (providerLower.includes('coursera')) {
    return `https://www.coursera.org/search?query=${encodedTitle}`;
  } else if (providerLower.includes('linkedin')) {
    return `https://www.linkedin.com/learning/search?keywords=${encodedTitle}`;
  } else if (providerLower.includes('udemy')) {
    return `https://www.udemy.com/courses/search/?q=${encodedTitle}`;
  } else if (providerLower.includes('pmi')) {
    return `https://www.pmi.org/certifications`;
  } else if (providerLower.includes('edx')) {
    return `https://www.edx.org/search?q=${encodedTitle}`;
  } else if (providerLower.includes('pluralsight')) {
    return `https://www.pluralsight.com/search?q=${encodedTitle}`;
  } else if (providerLower.includes('udacity')) {
    return `https://www.udacity.com/catalog?searchValue=${encodedTitle}`;
  } else {
    // Google search as ultimate fallback
    return `https://www.google.com/search?q=${encodedTitle}+${encodeURIComponent(provider)}+course`;
  }
}

// Verify course URL using Perplexity API
async function verifyModuleUrl(title: string, provider: string): Promise<{
  verifiedUrl: string | null;
  isVerified: boolean;
}> {
  if (!PERPLEXITY_API_KEY) {
    console.log("PERPLEXITY_API_KEY not configured, skipping URL verification");
    return { verifiedUrl: null, isVerified: false };
  }

  try {
    console.log(`Verifying URL for: "${title}" by ${provider}`);
    
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{
          role: 'user',
          content: `Find the official course page URL for "${title}" by ${provider}. 
          
Important: 
- Return ONLY the direct URL to the course/certification page, nothing else
- The URL must be a valid, working link to the actual course
- If you cannot find an exact match, respond with exactly "NOT_FOUND"
- Do not include any explanation or additional text`
        }],
        search_domain_filter: [
          'coursera.org', 
          'linkedin.com', 
          'udemy.com', 
          'pmi.org', 
          'edx.org', 
          'pluralsight.com',
          'udacity.com',
          'skillsoft.com',
          'datacamp.com'
        ],
      }),
    });

    if (!response.ok) {
      console.error(`Perplexity API error: ${response.status}`);
      return { verifiedUrl: null, isVerified: false };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    
    console.log(`Perplexity response for "${title}": ${content}`);
    
    if (!content || content === 'NOT_FOUND' || content.includes('NOT_FOUND')) {
      return { verifiedUrl: null, isVerified: false };
    }
    
    // Extract URL from response (in case there's extra text)
    const urlMatch = content.match(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/);
    if (urlMatch) {
      const url = urlMatch[0].replace(/[.,;:!?)]+$/, ''); // Remove trailing punctuation
      return { verifiedUrl: url, isVerified: true };
    }
    
    return { verifiedUrl: null, isVerified: false };
  } catch (error) {
    console.error(`Error verifying URL for "${title}":`, error);
    return { verifiedUrl: null, isVerified: false };
  }
}

// Enrich all modules with verified URLs in parallel
async function enrichModulesWithUrls(modules: ModuleFromClaude[]): Promise<EnrichedModule[]> {
  console.log(`Enriching ${modules.length} modules with verified URLs...`);
  
  const enrichmentPromises = modules.map(async (module): Promise<EnrichedModule> => {
    const { verifiedUrl, isVerified } = await verifyModuleUrl(module.title, module.provider);
    const searchFallbackUrl = generateFallbackSearchUrl(module.title, module.provider);
    
    return {
      ...module,
      verifiedUrl,
      isUrlVerified: isVerified,
      searchFallbackUrl,
      // Use verified URL as contentUrl if available, otherwise keep original or use fallback
      contentUrl: verifiedUrl || module.contentUrl || null,
    };
  });
  
  return Promise.all(enrichmentPromises);
}

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

    console.log("Phase 1: Calling Anthropic API for learning path generation...");

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
    console.log("Phase 1 complete: Anthropic API response received");

    // Extract the tool use result
    const toolUse = data.content?.find((block: any) => block.type === "tool_use");
    
    if (!toolUse || toolUse.name !== "generate_learning_path") {
      throw new Error("No valid learning path generated");
    }

    const learningPath = toolUse.input;

    // Phase 2: Enrich modules with verified URLs via Perplexity
    console.log("Phase 2: Verifying course URLs with Perplexity...");
    const enrichedModules = await enrichModulesWithUrls(learningPath.modules);
    console.log("Phase 2 complete: URL verification finished");

    // Build final response
    const enrichedLearningPath = {
      ...learningPath,
      modules: enrichedModules,
      aiRecommendationReason: `Generiert für ${competencyName} (Gap: ${targetLevel - currentLevel}%)`,
    };

    return new Response(JSON.stringify(enrichedLearningPath), {
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
