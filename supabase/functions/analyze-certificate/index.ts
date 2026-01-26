import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CERTIFICATE_SYSTEM_PROMPT = `Du bist ein HR-Analytics-Assistent. Du analysierst Zertifikate und Qualifikationsnachweise.

DEINE AUFGABE:
1. Dokument analysieren (Typ, Aussteller, Datum, Fachgebiet)
2. Relevanz für M&A / Corporate Law bewerten
3. Rating-Änderungen vorschlagen

MAPPING-REGELN:

Tool-Zertifizierungen:
- Harvey Certified → AI-Assisted Risk Review +1.0, Prompt Engineering +1.0
- Datasite Expert → VDR Management +1.0
- Kira Certified → AI-Assisted Risk Review +0.5

Berufsqualifikationen:
- Fachanwalt Handels-/Gesellschaftsrecht → Technical Lawyering +1.0
- CIPP/E (Privacy) → EU AI Act, GDPR +1.0
- PMP → Legal Project Management +1.0

Akademische Abschlüsse:
- LL.M. (Corporate/M&A) → Technical Lawyering +0.5
- MBA → Commercial Fluency +0.5

REGELN:
- Ratings können nur STEIGEN (nie fallen)
- Maximum ist 5.0
- Zertifikate älter als 5 Jahre: halber Impact
- Abgelaufene Zertifikate: kein Impact

Antworte NUR mit validem JSON im folgenden Format:
{
  "documentAnalysis": {
    "documentType": "CERTIFICATE" | "DEGREE" | "TRAINING" | "AWARD" | "LANGUAGE" | "OTHER",
    "title": "string",
    "issuer": "string",
    "issueDate": "YYYY-MM-DD",
    "expiryDate": "YYYY-MM-DD" | null,
    "level": "string" | null,
    "field": "string",
    "confidence": "HIGH" | "MEDIUM" | "LOW"
  },
  "isRelevant": boolean,
  "relevanceReason": "string",
  "ratingChanges": [
    {
      "cluster": "string",
      "competency": "string",
      "oldRating": number,
      "newRating": number,
      "change": "+X.X",
      "justification": "string"
    }
  ],
  "overallScoreChange": {
    "oldScore": number,
    "newScore": number,
    "change": "+X" oder "0"
  },
  "warnings": ["string"]
}`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }

    const { type, currentProfile, documentContent, imageBase64, mimeType, fileName } = await req.json();

    let messages;

    if (type === 'image') {
      messages = [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `AKTUELLES PROFIL:
${JSON.stringify(currentProfile.competencyProfile, null, 2)}

AKTUELLER OVERALL SCORE: ${currentProfile.analysis.overallScore}

---

Das Bild zeigt ein Zertifikat/Urkunde. Dateiname: ${fileName}

Analysiere es und schlage Rating-Updates vor.
Antworte als JSON.`
          },
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: imageBase64
            }
          }
        ]
      }];
    } else {
      messages = [{
        role: 'user',
        content: `AKTUELLES PROFIL:
${JSON.stringify(currentProfile.competencyProfile, null, 2)}

AKTUELLER OVERALL SCORE: ${currentProfile.analysis.overallScore}

---

HOCHGELADENES DOKUMENT:
Dateiname: ${fileName}

Inhalt:
${documentContent}

---

Analysiere das Zertifikat und schlage Rating-Updates vor.
Antworte als JSON mit: documentAnalysis, isRelevant, relevanceReason, ratingChanges, overallScoreChange, warnings`
      }];
    }

    console.log(`Analyzing certificate: ${fileName} (type: ${type})`);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: CERTIFICATE_SYSTEM_PROMPT,
        messages
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic API error:', err);
      throw new Error(err.error?.message || 'Claude API Fehler');
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      throw new Error('Keine Antwort von Claude erhalten');
    }

    console.log('Claude response received, parsing JSON...');

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', content);
      throw new Error('Kein JSON in Antwort gefunden');
    }

    const result = JSON.parse(jsonMatch[0]);

    console.log('Certificate analysis complete:', {
      documentType: result.documentAnalysis?.documentType,
      isRelevant: result.isRelevant,
      ratingChanges: result.ratingChanges?.length || 0
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("analyze-certificate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unbekannter Fehler" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
