import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Formats DB competency schema for the system prompt
function getCompetencySchemaForPrompt(
  dbCompetencySchema: Array<{ clusterName: string; competencyName: string; subskills: string[] }>
): string {
  if (!dbCompetencySchema || dbCompetencySchema.length === 0) {
    throw new Error("Kein Kompetenz-Schema verfügbar. Der Mitarbeiter muss einem veröffentlichten Role Profile zugewiesen sein.");
  }

  const clusterMap = new Map<string, Array<{ competencyName: string; subskills: string[] }>>();
  for (const comp of dbCompetencySchema) {
    if (!clusterMap.has(comp.clusterName)) {
      clusterMap.set(comp.clusterName, []);
    }
    clusterMap.get(comp.clusterName)!.push(comp);
  }

  let output = "";
  for (const [cluster, competencies] of clusterMap) {
    output += `\n═══════════════════════════════════════════════════════════════════════════════\n`;
    output += `CLUSTER: "${cluster}"\n`;
    output += `═══════════════════════════════════════════════════════════════════════════════\n`;

    for (const comp of competencies) {
      output += `\nKOMPETENZ: "${comp.competencyName}"\n`;
      output += `Subskills:\n`;
      for (const sub of comp.subskills) {
        output += `- "${sub}"\n`;
      }
    }
  }
  return output;
}

// Generates the system prompt using DB competency schema
function getSystemPrompt(
  roleDisplayName: string,
  dbCompetencySchema: Array<{ clusterName: string; competencyName: string; subskills: string[] }>,
  practiceGroup: string
): string {
  return `Du bist ein HR-Analytics-Assistent für eine Wirtschaftskanzlei im Bereich ${practiceGroup}.

Du erhältst 3 Dokumente: CV, Self-Assessment, Manager-Assessment.

Deine Aufgabe:
1. DSGVO-Consent prüfen (muss im Self-Assessment bestätigt sein)
2. Daten extrahieren aus allen Dokumenten
3. Kompetenzen bewerten (Rating 1-5)
4. Stärken und Entwicklungsfelder identifizieren

BEWERTUNGSMASSSTAB: 0-100 Skala, rollenrelativ fuer ${roleDisplayName}
Bewerte auf einer Skala von 0 bis 100 in 5er-Schritten.
Die Bewertung bezieht sich AUSSCHLIESSLICH auf die Erwartungen der aktuellen Rolle.
Ein Junior Associate, der alle JA-Kompetenzen perfekt beherrscht, verdient 85-100.
Ein Senior Associate, der SA-Kompetenzen nur teilweise beherrscht, kann 25-40 bekommen.
Vergleiche NICHT zwischen Rollen -- bewerte nur innerhalb der Rollenerwartung.

Orientierungsrahmen:
- 0-20:   Erfuellt die Rollenerwartung nicht (deutliche Luecken fuer diese Stufe)
- 25-40:  Teilweise auf Rollenniveau (Grundlagen vorhanden, aber Luecken)
- 45-60:  Auf Rollenniveau (erfuellt die Erwartung fuer diese Position solide)
- 65-80:  Ueber Rollenniveau (uebertrifft die Erwartung fuer diese Stufe)
- 85-100: Herausragend fuer diese Rolle (Benchmark / Vorbild auf dieser Stufe)

Vergib Werte in 5er-Schritten: 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100.
Nutze die volle Bandbreite. 50 = solide Mitte der Rollenerwartung.

WICHTIG: Du MUSST für JEDE Kompetenz und JEDEN Subskill ein numerisches Rating (1-5) vergeben!
Wenn keine direkte Evidence vorhanden ist, nutze dein Expertenwissen, um basierend auf dem Gesamtbild
(Berufserfahrung, verwandte Skills, dokumentierte Leistungen) eine fundierte Einschaetzung abzugeben.
Beziehe die Bewertung dabei IMMER auf das erwartete Niveau der aktuellen Rolle -- NICHT auf eine absolute Senioritaetsskala.
Setze in diesem Fall die Confidence auf "LOW" und erkläre in der Evidence, worauf die Einschätzung basiert.
"NB" (Nicht bewertbar) ist KEINE gültige Antwort – es muss IMMER ein Rating von 1-5 vergeben werden.

═══════════════════════════════════════════════════════════════════════════════
KRITISCH: Du bewertest einen ${roleDisplayName}
Praxisgruppe: ${practiceGroup}

BEWERTUNGSPRINZIP: Alle Ratings sind RELATIV zur Rolle "${roleDisplayName}".
Eine 5 bedeutet: herausragend FUER DIESE ROLLE.
Eine 3 bedeutet: solide auf dem erwarteten Niveau DIESER ROLLE.
Absolute Berufserfahrung oder Senioritaet duerfen das Rating
NICHT systematisch nach oben oder unten verzerren.
═══════════════════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════════════════
EXAKTE KOMPETENZ- UND SUBSKILL-NAMEN (aus der Datenbank)
KRITISCH: Du MUSST die Namen ZEICHENGENAU (character-for-character) verwenden!
Keine Abweichungen, keine Umformulierungen, keine Abkürzungen, keine Ergänzungen!
Kopiere die Namen exakt wie hier angegeben in deine JSON-Antwort!
═══════════════════════════════════════════════════════════════════════════════

${getCompetencySchemaForPrompt(dbCompetencySchema)}

═══════════════════════════════════════════════════════════════════════════════
ANTWORT-FORMAT
═══════════════════════════════════════════════════════════════════════════════

Antworte NUR mit validem JSON im folgenden Schema:

{
  "extractedData": {
    "source": {
      "cvPresent": true/false,
      "selfAssessmentPresent": true/false,
      "managerAssessmentPresent": true/false,
      "extractionQuality": "HIGH" | "MEDIUM" | "LOW"
    },
    "employee": {
      "name": "string oder null",
      "currentRole": "string",
      "yearsAtCompany": number,
      "totalYearsInBusiness": number,
      "targetRole": "string",
      "gdprConsentGiven": true/false
    },
    "cvHighlights": {
      "education": ["string"],
      "certifications": ["string"],
      "keyExperience": ["string"],
      "toolProficiency": ["string"],
      "languages": ["string"]
    }
  },
  "competencyProfile": {
    "role": "string",
    "assessmentDate": "YYYY-MM-DD",
    "clusters": [
      {
        "clusterName": "EXAKT wie oben definiert",
        "competencies": [
          {
            "name": "EXAKT wie oben definiert",
            "rating": 1-5,
            "confidence": "HIGH" | "MEDIUM" | "LOW",
            "selfRating": number oder null,
            "managerRating": number oder null,
            "evidenceSummary": "max 10 Wörter",
            "subskills": [
              {
                "name": "EXAKT wie oben definiert",
                "rating": 1-5,
                "evidence": "max 5 Wörter"
              }
            ]
          }
        ]
      }
    ]
  },
  "analysis": {
    "overallScore": 0-100,
    "topStrengths": [
      {
        "competency": "Name",
        "rating": number,
        "evidence": "max 10 Wörter"
      }
    ],
    "developmentAreas": [
      {
        "competency": "Name",
        "currentRating": number,
        "targetRating": number,
        "gap": "max 5 Wörter",
        "recommendation": "max 10 Wörter"
      }
    ],
    "promotionReadiness": {
      "targetRole": "string",
      "readinessPercentage": 0-100,
      "criticalGaps": ["string"],
      "estimatedTimeline": "string"
    }
  },
  "compliance": {
    "gdprConsentVerified": true/false,
    "disclaimer": "KI-generierte Analyse zur Unterstützung der HR-Entscheidung"
  }
}

WICHTIGE REGELN:
1. Verwende NUR die oben definierten Cluster-, Kompetenz- und Subskill-Namen!
2. Bewerte ALLE Kompetenzen in ALLEN oben aufgelisteten Clustern für diese Rolle!
3. Vergib IMMER ein numerisches Rating (1-5) – NIEMALS "NB"!
4. Overall Score = gewichteter Durchschnitt aller Kompetenzen (1=20%, 2=40%, 3=60%, 4=80%, 5=100%)
5. Antworte NUR mit JSON - keine Erklärungen davor oder danach!
6. HALTE ALLE Textfelder (evidence, gap, recommendation) EXTREM KURZ (max 10 Wörter)! Kürze ist kritisch!`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cvText, selfText, managerText, roleTitle, dbCompetencySchema, practiceGroup } = await req.json();

    // Validate that DB schema is provided
    if (!dbCompetencySchema || dbCompetencySchema.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Kein Kompetenz-Schema übergeben. Der Mitarbeiter muss einem veröffentlichten Role Profile zugewiesen sein, bevor ein Profil generiert werden kann."
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roleDisplayName = roleTitle;
    const practiceArea = practiceGroup || "Corporate Law / M&A";

    const systemPrompt = getSystemPrompt(roleDisplayName, dbCompetencySchema, practiceArea);

    console.log(`Generating profile for: ${roleDisplayName} (${practiceArea})`);
    console.log(`DB competency schema: ${dbCompetencySchema.length} competencies`);
    console.log(`System prompt length: ${systemPrompt.length}`);

    const userPrompt = `
ROLLE: ${roleDisplayName}

=== CV ===
${cvText}

=== SELF-ASSESSMENT ===
${selfText}

=== MANAGER-ASSESSMENT ===
${managerText}

Erstelle das Kompetenzprofil als JSON. Verwende EXAKT die im System definierten Kompetenz-Namen – zeichengenau, ohne Abweichungen!`;

    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 16000,
        system: systemPrompt,
        messages: [
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit erreicht. Bitte versuchen Sie es in einer Minute erneut." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "KI-API Fehler: " + response.status }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    const stopReason = data.stop_reason;

    console.log("AI response length:", content?.length);
    console.log("Stop reason:", stopReason);

    if (stopReason === "max_tokens") {
      console.warn("Response was truncated by max_tokens limit!");
    }

    // JSON aus Antwort extrahieren
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in response:", content);
      return new Response(
        JSON.stringify({ error: "Kein JSON in Antwort gefunden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let jsonStr = jsonMatch[0];

    // Attempt to repair truncated JSON by closing open structures
    let profile;
    try {
      profile = JSON.parse(jsonStr);
    } catch (parseError) {
      console.warn("JSON parse failed, attempting repair...", (parseError as Error).message);
      let openBraces = 0, openBrackets = 0;
      for (const ch of jsonStr) {
        if (ch === '{') openBraces++;
        else if (ch === '}') openBraces--;
        else if (ch === '[') openBrackets++;
        else if (ch === ']') openBrackets--;
      }
      jsonStr = jsonStr.replace(/,\s*$/, '');
      jsonStr = jsonStr.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, '');
      for (let i = 0; i < openBrackets; i++) jsonStr += ']';
      for (let i = 0; i < openBraces; i++) jsonStr += '}';

      try {
        profile = JSON.parse(jsonStr);
        console.log("JSON repair successful");
      } catch (repairError) {
        console.error("JSON repair also failed:", (repairError as Error).message);
        return new Response(
          JSON.stringify({ error: "KI-Antwort war unvollständig. Bitte erneut versuchen." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const generatedClusters = profile.competencyProfile?.clusters?.map((c: { clusterName: string }) => c.clusterName) || [];
    console.log(`Generated ${generatedClusters.length} clusters`);

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
