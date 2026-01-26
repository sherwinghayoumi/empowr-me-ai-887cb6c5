import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// KOMPETENZ-SCHEMA - EXAKT wie in competencySchema.ts
// ═══════════════════════════════════════════════════════════════════════════════

const COMPETENCY_SCHEMA: Record<string, Record<string, string[]>> = {
  "Commercial Fluency": {
    "Commercial Awareness & Financial Literacy": [
      "Financial Statement Basics",
      "Industry Analysis",
      "Purchase Price Mechanisms"
    ]
  },

  "M&A Fundamentals & Deal Hygiene": {
    "Deal Lifecycle Management": [
      "CP Tracking",
      "Closing Mechanics",
      "Signature Coordination",
      "VDR Management"
    ],
    "Ancillary Document Drafting": [
      "Corporate Governance",
      "Cross-referencing",
      "Error-spotting",
      "Template Adaptation"
    ]
  },

  "Tech-Enhanced Due Diligence": {
    "AI-Assisted Risk Review": [
      "Hallucination Checking",
      "Prompt Engineering",
      "Risk Grading",
      "Synthesis"
    ],
    "Data Hygiene & VDR Architecture": [
      "File Naming",
      "OCR QC",
      "Redaction",
      "Taxonomy Design"
    ],
    "AI-Ready VDR Architecture": [
      "Data quality for LLM ingestion",
      "Folder structures for agent consumption",
      "Metadata for agent consumption",
      "VDR taxonomies for agent consumption"
    ]
  },

  "Regulatory & AI Governance": {
    "EU AI Act & Digital Compliance": [
      "AI System Classification",
      "GDPR Overlap",
      "Prohibited Use Spotting",
      "Provider Assessment"
    ],
    "ESG & Supply Chain Due Diligence": [
      "Greenwashing ID",
      "Regulatory Mapping",
      "Supply Chain Auditing"
    ]
  },

  "Risk, Regulation & Governance": {
    "Regulatory Clearance Coordination (FDI / Antitrust)": [
      "Filing Strategy & Sequencing",
      "Information Orchestration",
      "Authority / Counterparty Coordination",
      "Condition & Remedy Management"
    ],
    "EU AI Act & Digital Compliance": [
      "AI Categorization",
      "Deployer Liability Assessment",
      "Digital / Data Governance DD",
      "Supply-Chain Alignment (CSDDD-adjacent)"
    ],
    "Agentic AI Governance (operational)": [
      "Escalating exceptions",
      "Operating within agent-orchestrated workflows",
      "Validating agent outputs"
    ]
  },

  "Tech-Enabled Legal Work": {
    "AI Output Validation": [
      "Hallucination Spotting",
      "Source Verification",
      "Prompt & Context Engineering",
      "Confidentiality / Privilege Guardrails"
    ],
    "AI-Ready VDR Architecture": [
      "Designing VDR taxonomies",
      "Designing folder structures",
      "Defining metadata for agent consumption",
      "Ensuring data quality for LLM ingestion"
    ],
    "Data Room & Closing Automation": [
      "eSignature Workflow Management",
      "Automated Closing Set Generation",
      "VDR Permissioning & Analytics",
      "Document Assembly / Comparison Automation"
    ]
  },

  "Legal Project Management": {
    "Matter Management & Efficiency": [
      "Scoping",
      "Resource Allocation",
      "Timeline Management",
      "Status Reporting"
    ]
  },

  "Professionalism & Soft Skills": {
    "Stakeholder Communication & EQ": [
      "Active Listening",
      "Plain English",
      "Crisis De-escalation",
      "Managing Up"
    ]
  },

  "Deal Execution & Project Control": {
    "M&A Project Management": [
      "Critical Path Management",
      "Resource Allocation",
      "Fee Management",
      "Cross-functional Coordination"
    ],
    "Fee & Scope Discipline": [
      "Budget Tracking",
      "Scope Creep Identification",
      "Efficient Delegation",
      "ALSP / Vendor Utilization"
    ]
  },

  "Corporate/M&A Technical Lawyering": {
    "Definitive Agreement Drafting (SPA/APA)": [
      "Purchase Price Mechanics",
      "Warranties & Indemnities",
      "Conditions Precedent & Closing Mechanics",
      "Definitions & Cross-References"
    ],
    "Disclosure Schedule Management": [
      "Fact-Gathering",
      "Warranty Mapping",
      "Risk Assessment",
      "Defensive Drafting"
    ]
  },

  "Commercial Judgment & Negotiation": {
    "Negotiating Mid-Market Deal Points": [
      "Market Standard Knowledge",
      "Drafting Compromises",
      "Issue Prioritization",
      "Stakeholder Management"
    ]
  },

  "Team Supervision & Quality Control": {
    "Junior Associate & Paralegal Supervision": [
      "Delegation & Briefing",
      "Quality Assurance / Reviewing",
      "Feedback Delivery",
      "Workload Balancing"
    ]
  },

  "Negotiation, Commercial Judgment & Stakeholder Management": {
    "Stakeholder Management & Difficult Counterparties": [
      "Expectation setting & alignment",
      "Conflict de-escalation",
      "Decision-maker mapping",
      "Escalation path management",
      "Written vs verbal negotiation tactics"
    ],
    "Strategic Negotiation & Gap Bridging": [
      "Integrative bargaining & trade-offs",
      "Earn-out/rollover negotiation",
      "W&I insurance integration",
      "Dispute-resolution design",
      "Negotiation narrative & leverage mapping"
    ],
    "Risk Allocation: Indemnities, Caps, Baskets & Survival": [
      "Cap/basket design",
      "Materiality scrape logic",
      "Survival periods calibration",
      "Special indemnities drafting",
      "Claims process & escrow mechanics"
    ],
    "Warranty & Indemnity (W&I) Insurance Negotiation": [
      "Insurer Q&A management",
      "Underwriting pack curation",
      "Policy exclusion negotiation",
      "SPA-insurance alignment",
      "Claims readiness planning"
    ]
  },

  "Deal Leadership, Strategy & Project Control": {
    "Legal Project Management (LPM) & AFA Engineering": [
      "Scope definition & assumptions lists",
      "Budget-to-actual tracking & forecasting",
      "Resource allocation (AI vs junior vs specialist)",
      "Scope-change control & client alignment",
      "Post-matter profitability review"
    ],
    "Deal Architecture & Structuring": [
      "Structure options analysis",
      "Locked box vs completion accounts selection",
      "Pre-closing reorg planning",
      "Funds flow & step plan drafting",
      "Cross-border execution sequencing"
    ],
    "Workstream Leadership & Specialist Integration": [
      "Issue triage & prioritization",
      "Tax/antitrust/employment/data integration",
      "Dependency management across workstreams",
      "Escalation management",
      "Sign/close readiness gating"
    ],
    "Signing/Closing Orchestration & Deal Hygiene": [
      "CP tracking & satisfaction strategy",
      "Signature package coordination",
      "Closing agenda & call leadership",
      "Funds flow coordination",
      "Post-closing deliverables management"
    ],
    "Matter Risk Governance & Quality Gates": [
      "Senior review checklists",
      "Redline rationale articulation",
      "Version control & audit trails",
      "Privilege/confidentiality controls",
      "Error prevention (closing mechanics)"
    ]
  },

  "M&A Technical Mastery (Structure + Drafting Strategy)": {
    "SPA/SHA Drafting Strategy & Market Standards": [
      "Market standard benchmarking",
      "Clause architecture & fallback positions",
      "Schedule strategy & disclosure design",
      "Definitions/interpretation engineering",
      "Precedent selection & customization"
    ],
    "Representations & Warranties Architecture": [
      "Materiality/knowledge qualifiers",
      "Disclosure approach & updates",
      "Bring-down mechanics",
      "Fundamental vs business reps",
      "AI/data/IP reps tailoring"
    ],
    "Covenants, Interim Operations & Conduct of Business": [
      "Interim ops limitations",
      "Consent rights design",
      "Ordinary course definitions",
      "Information rights",
      "Pre-closing leakage controls"
    ],
    "Conditions Precedent, MAC & Closing Conditions": [
      "Regulatory CP drafting (FDI/antitrust)",
      "MAC clause tailoring",
      "Bring-down & officer cert mechanics",
      "Third-party consent strategy",
      "Long-stop & termination triggers"
    ],
    "Purchase Price Mechanics & Adjustments": [
      "Locked box protections & leakage",
      "Working capital adjustment design",
      "Earn-out metrics & governance",
      "True-up dispute resolution",
      "Equity rollover documentation"
    ],
    "Ancillary Documents & Corporate Housekeeping (Senior-Level)": [
      "Board/shareholder resolutions drafting oversight",
      "Disclosure letter coordination",
      "Equity incentive plan impacts",
      "Officer exculpation/charter amendments",
      "Corporate registry filings planning"
    ]
  },

  "Risk Allocation, Governance & Regulatory Awareness": {
    "EU AI Act Due Diligence (EU Focus)": [
      "AI system classification & inventory review",
      "Conformity assessment/documentation checks",
      "Data governance & training-data risk",
      "AI governance & AI literacy evaluation",
      "AI reps/indemnities design"
    ],
    "Privacy, Cybersecurity & Data Transfers in M&A": [
      "GDPR assessment & DPIA signals",
      "Data breach history evaluation",
      "Cross-border transfer mechanisms (SCCs)",
      "Security controls review (ISO/SOC2)",
      "Data-related reps/covenants"
    ],
    "Sanctions, Export Controls & Trade Compliance": [
      "Sanctions screening & exposure mapping",
      "Export-control classification (EAR/ITAR proxies)",
      "Contractual protections design",
      "OFAC/EU list monitoring",
      "Closing conditions & termination triggers"
    ],
    "FDI Screening & National Security Review": [
      "FDI/CFIUS applicability screening",
      "Filing package coordination",
      "Timeline & long-stop calibration",
      "Mitigation measures negotiation",
      "Information control/clean team setup"
    ],
    "US Corporate Governance, Caremark & Officer Duties (US Focus)": [
      "Caremark 'red flags' analysis",
      "Officer duty/exculpation amendments",
      "Board minutes risk-proofing",
      "Reincorporation analysis (DE/NV/TX)",
      "ESG governance backlash navigation"
    ],
    "Antitrust/Competition Law Deal Readiness (Senior Interface)": [
      "Competition risk spotting from overlaps",
      "Information exchange/clean team rules",
      "CP drafting around approvals",
      "Remedy package coordination",
      "Gun-jumping avoidance"
    ],
    "Agentic AI Governance & Agent Supervisor": [
      "Designing multi-agent deal workflows",
      "Staffing teams around agentic systems",
      "Managing agent performance & exceptions"
    ],
    "AI Compliance & Regulatory Alignment": [
      "New contract language",
      "Liability frameworks",
      "IP ownership for agents' outputs"
    ]
  },

  "Tech-Enabled Legal Delivery (AI workflows + QA + automation)": {
    "Legal Prompt Engineering & Context Priming": [
      "Context priming with precedents",
      "Structured-output prompting (tables/JSON)",
      "Defensive prompting & redaction",
      "Iterative refinement loops",
      "Prompt library governance"
    ],
    "AI Output Validation & Human-in-the-Loop Auditing": [
      "Citation & authority verification",
      "Sampling-based doc checks",
      "Hallucination detection",
      "Bias/omission detection",
      "Feedback loops & guardrails"
    ],
    "AI-Assisted Diligence Orchestration": [
      "Diligence scope design for AI",
      "Red flag criteria definition",
      "Clause extraction workflows",
      "Issue clustering & narrative synthesis",
      "Privilege-aware data handling"
    ],
    "Contract Analytics & Portfolio Review": [
      "Change-of-control extraction",
      "Assignment/consent mapping",
      "Revenue/termination risk flags",
      "Template vs bespoke clause detection",
      "Output normalization for drafting"
    ],
    "Workflow Automation & Standardization (Agentic-ready)": [
      "SOP design for recurring tasks",
      "Automation mapping (intake→draft→review)",
      "Template parameterization",
      "Data capture for KM",
      "Role-based task assignment"
    ]
  },

  "Client Advisory & Communication (Value + Risk Transparency)": {
    "Executive Risk Summarization & Recommendation": [
      "Risk ranking & materiality calls",
      "Commercial impact framing",
      "Options & recommendation drafting",
      "Client-ready writing",
      "Escalation timing"
    ],
    "Client Relationship Management (Delivery-Led)": [
      "Proactive communication cadence",
      "Managing client anxiety & deadlines",
      "Coordinating internal team responses",
      "Setting service-level expectations",
      "Documenting advice for defensibility"
    ],
    "Value Communication & Fee Narrative": [
      "Budget narrative drafting",
      "Value framing for deliverables",
      "AFA scope boundary communication",
      "Write-off prevention conversations",
      "Post-matter value recap"
    ]
  },

  "Knowledge Systems, Precedents & Quality Management": {
    "Knowledge Architecture & Precedent Modernization": [
      "Clause library curation & tagging",
      "Market standard monitoring",
      "Precedent versioning",
      "Post-deal data capture",
      "AI training-data hygiene"
    ],
    "Playbook Creation & Training Materials": [
      "Playbook structuring",
      "Scenario-based guidance",
      "Checklist design",
      "Training delivery & feedback",
      "Updating materials from live deals"
    ],
    "Document Automation / CLM Interface (Supervision)": [
      "Template governance",
      "Clause fallback logic",
      "Data field validation",
      "Exception handling",
      "Integration with DMS/KM"
    ]
  },

  "Team Leadership, Coaching & Delegation": {
    "Delegation, Coaching & Feedback Loops": [
      "Task scoping & briefing",
      "Review & feedback routines",
      "Coaching on drafting/negotiation",
      "Performance calibration",
      "Knowledge transfer"
    ],
    "Resource Planning & Utilization Management": [
      "Capacity planning",
      "Leverage model design",
      "Specialist scheduling",
      "Crunch-time triage",
      "Burnout risk management"
    ],
    "Mentoring on Professional Responsibility & Privilege": [
      "Privilege protocol design",
      "Confidentiality & clean team rules",
      "AI acceptable-use enforcement",
      "Recordkeeping & audit trails",
      "Incident response"
    ]
  }
};

// Generiert den Kompetenz-Teil für den System Prompt
function getCompetencySchemaForPrompt(): string {
  let output = "";

  for (const [cluster, competencies] of Object.entries(COMPETENCY_SCHEMA)) {
    output += `\n═══════════════════════════════════════════════════════════════════════════════\n`;
    output += `CLUSTER: "${cluster}"\n`;
    output += `═══════════════════════════════════════════════════════════════════════════════\n`;

    for (const [comp, subskills] of Object.entries(competencies)) {
      output += `\nKOMPETENZ: "${comp}"\n`;
      output += `Subskills:\n`;
      for (const sub of subskills) {
        output += `- "${sub}"\n`;
      }
    }
  }

  return output;
}

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

Erstelle das Kompetenzprofil als JSON. Verwende NUR die im System definierten Kompetenz-Namen!`;

    console.log("Calling Anthropic API with role:", roleTitle);
    console.log("System prompt length:", SYSTEM_PROMPT.length);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
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
      console.error("No JSON found in response:", content);
      return new Response(
        JSON.stringify({ error: "Kein JSON in Antwort gefunden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const profile = JSON.parse(jsonMatch[0]);

    // Validierung: Prüfe ob Cluster-Namen korrekt sind
    const validClusters = Object.keys(COMPETENCY_SCHEMA);
    const generatedClusters = profile.competencyProfile?.clusters?.map((c: { clusterName: string }) => c.clusterName) || [];
    console.log("Generated clusters:", generatedClusters);
    console.log("Valid clusters:", validClusters);

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
