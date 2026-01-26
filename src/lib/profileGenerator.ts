import { GeneratedProfile } from '@/types/profileGeneration';
import { getCompetencySchemaForPrompt } from './competencySchema';

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
- NB = Nicht bewertbar (keine Evidence)

═══════════════════════════════════════════════════════════════════════════════
KRITISCH: VERWENDE NUR DIE FOLGENDEN EXAKTEN KOMPETENZ- UND SUBSKILL-NAMEN!
Keine Abweichungen, keine Umformulierungen, keine Abkürzungen!
═══════════════════════════════════════════════════════════════════════════════

${getCompetencySchemaForPrompt()}

═══════════════════════════════════════════════════════════════════════════════
ROLLEN-ZUORDNUNG
═══════════════════════════════════════════════════════════════════════════════

Bewerte nur die Kompetenzen, die zur angegebenen Rolle passen:

JUNIOR ASSOCIATE (JA):
- Commercial Fluency
- M&A Fundamentals & Deal Hygiene
- Tech-Enhanced Due Diligence
- Regulatory & AI Governance
- Legal Project Management
- Professionalism & Soft Skills

MID-LEVEL ASSOCIATE (MLA):
- Alle JA-Cluster PLUS:
- Deal Execution & Project Control
- Corporate/M&A Technical Lawyering
- Risk, Regulation & Governance
- Tech-Enabled Legal Work
- Commercial Judgment & Negotiation
- Team Supervision & Quality Control
- Negotiation, Commercial Judgment & Stakeholder Management

SENIOR ASSOCIATE / COUNSEL (SA):
- Alle MLA-Cluster PLUS:
- Deal Leadership, Strategy & Project Control
- M&A Technical Mastery (Structure + Drafting Strategy)
- Risk Allocation, Governance & Regulatory Awareness
- Tech-Enabled Legal Delivery (AI workflows + QA + automation)
- Client Advisory & Communication (Value + Risk Transparency)
- Knowledge Systems, Precedents & Quality Management
- Team Leadership, Coaching & Delegation

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
            "rating": 1-5 oder "NB",
            "confidence": "HIGH" | "MEDIUM" | "LOW",
            "selfRating": number oder null,
            "managerRating": number oder null,
            "evidenceSummary": "Begründung",
            "subskills": [
              {
                "name": "EXAKT wie oben definiert",
                "rating": 1-5 oder "NB",
                "evidence": "Kurze Begründung"
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
        "evidence": "Begründung"
      }
    ],
    "developmentAreas": [
      {
        "competency": "Name",
        "currentRating": number oder "NB",
        "targetRating": number,
        "gap": "Beschreibung",
        "recommendation": "Empfehlung"
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
2. Bewerte nur Kompetenzen, die zur Rolle passen
3. Bei fehlender Evidence: "NB" (Nicht bewertbar)
4. Overall Score = gewichteter Durchschnitt aller bewerteten Kompetenzen (Rating 1=20%, 2=40%, 3=60%, 4=80%, 5=100%)
5. Antworte NUR mit JSON - keine Erklärungen davor oder danach!`;

export async function generateProfile(
  documents: { cvText: string; selfText: string; managerText: string },
  roleTitle: string
): Promise<GeneratedProfile> {
  
  const userPrompt = `
ROLLE: ${roleTitle}

=== CV ===
${documents.cvText}

=== SELF-ASSESSMENT ===
${documents.selfText}

=== MANAGER-ASSESSMENT ===
${documents.managerText}

Erstelle das Kompetenzprofil als JSON. Verwende NUR die im System definierten Kompetenz-Namen!`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }]
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || 'Claude API Fehler');
  }

  const data = await response.json();
  const content = data.content[0]?.text;
  
  // JSON aus Antwort extrahieren
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Kein JSON in Antwort gefunden');
  
  const profile = JSON.parse(jsonMatch[0]);
  
  // Logging für Debugging
  console.log('Generated Profile:', profile);
  console.log('Clusters:', profile.competencyProfile?.clusters?.map((c: any) => c.clusterName));
  
  return profile;
}
