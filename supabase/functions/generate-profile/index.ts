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

Antworte NUR mit validem JSON im vorgegebenen Schema. Keine Erklärungen.`;

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
