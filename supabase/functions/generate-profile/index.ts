import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `Du bist ein HR-Analytics-Assistent für eine Wirtschaftskanzlei im Bereich Corporate Law / M&A.

Du erhältst 3 Dokumente: CV, Self-Assessment, Manager-Assessment.

Deine Aufgabe:
1. DSGVO-Consent prüfen (muss im Self-Assessment bestätigt sein)
2. Daten extrahieren aus allen Dokumenten
3. Kompetenzen bewerten (Rating 1-5, oder "NB" wenn keine Evidence)
4. Stärken und Entwicklungsfelder identifizieren

RATING-SKALA:
- 1 = Grundlagen fehlen
- 2 = Basis vorhanden
- 3 = Kompetent
- 4 = Stark
- 5 = Exzellent
- NB = Nicht bewertbar

KOMPETENZ-CLUSTER:
1. M&A Fundamentals (Deal Lifecycle, Ancillary Documents)
2. Tech-Enhanced DD (AI-Assisted Review, VDR Management)
3. Regulatory (EU AI Act, GDPR, ESG)
4. Commercial Fluency (Financial Literacy)
5. Legal Project Management (Matter Management)
6. Soft Skills (Communication, Stakeholder Management)

ANTWORTE NUR mit diesem exakten JSON-Schema (keine Erklärungen, kein Markdown, nur reines JSON):
{
  "extractedData": {
    "source": {
      "cvPresent": boolean,
      "selfAssessmentPresent": boolean,
      "managerAssessmentPresent": boolean,
      "extractionQuality": "HIGH" | "MEDIUM" | "LOW"
    },
    "employee": {
      "name": string | null,
      "currentRole": string,
      "yearsAtCompany": number,
      "totalYearsInBusiness": number,
      "targetRole": string,
      "gdprConsentGiven": boolean
    },
    "cvHighlights": {
      "education": string[],
      "certifications": string[],
      "keyExperience": string[],
      "toolProficiency": string[],
      "languages": string[]
    }
  },
  "competencyProfile": {
    "role": string,
    "assessmentDate": string (ISO format YYYY-MM-DD),
    "clusters": [
      {
        "clusterName": string,
        "competencies": [
          {
            "name": string,
            "rating": number (1-5) | "NB",
            "confidence": "HIGH" | "MEDIUM" | "LOW",
            "selfRating": number | null,
            "managerRating": number | null,
            "evidenceSummary": string,
            "subskills": [
              {
                "name": string,
                "rating": number (1-5) | "NB",
                "evidence": string
              }
            ]
          }
        ]
      }
    ]
  },
  "analysis": {
    "overallScore": number (0-100, berechne den Durchschnitt aller numerischen Ratings und multipliziere mit 20),
    "topStrengths": [
      {
        "competency": string,
        "rating": number,
        "evidence": string
      }
    ],
    "developmentAreas": [
      {
        "competency": string,
        "currentRating": number | "NB",
        "targetRating": number,
        "gap": string (z.B. "2 Stufen"),
        "recommendation": string
      }
    ],
    "promotionReadiness": {
      "targetRole": string,
      "readinessPercentage": number (0-100),
      "criticalGaps": string[],
      "estimatedTimeline": string (z.B. "6-12 Monate")
    }
  },
  "compliance": {
    "gdprConsentVerified": boolean (true NUR wenn explizite DSGVO-Einwilligung im Self-Assessment gefunden wurde),
    "disclaimer": string
  }
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, selfText, managerText, roleTitle } = await req.json();
    
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const userPrompt = `
ROLLE: ${roleTitle}

=== CV ===
${cvText}

=== SELF-ASSESSMENT ===
${selfText}

=== MANAGER-ASSESSMENT ===
${managerText}

Erstelle das Kompetenzprofil als JSON.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Anthropic API error:", err);
      return new Response(
        JSON.stringify({ error: err.error?.message || "Claude API Fehler" }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    // Logging für Debugging
    console.log("Claude response length:", content?.length);
    console.log("Claude response preview:", content?.substring(0, 500));

    // JSON aus Antwort extrahieren
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "Kein JSON in Antwort gefunden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(profile), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-profile error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
