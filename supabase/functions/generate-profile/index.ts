import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ═══════════════════════════════════════════════════════════════════════════════
// KOMPETENZ-SCHEMA - EXAKT synchron mit Supabase-Datenbank
// ═══════════════════════════════════════════════════════════════════════════════

const COMPETENCY_SCHEMA: Record<string, Record<string, string[]>> = {
  // JUNIOR ASSOCIATE (JA) CLUSTERS
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
      "Signature Coordination",
      "Closing Mechanics",
      "VDR Management"
    ],
    "Ancillary Document Drafting": [
      "Template Adaptation",
      "Cross-referencing",
      "Error-spotting",
      "Corporate Governance"
    ]
  },

  "Tech-Enhanced Due Diligence": {
    "AI-Assisted Risk Review": [
      "Risk Grading",
      "Synthesis",
      "Prompt Engineering",
      "Hallucination Checking"
    ],
    "Data Hygiene & VDR Architecture": [
      "File Naming",
      "Taxonomy Design",
      "Redaction",
      "OCR QC"
    ]
  },

  "Regulatory & AI Governance": {
    "EU AI Act & Digital Compliance": [
      "Prohibited Use Spotting",
      "GDPR Overlap",
      "Provider Assessment",
      "AI System Classification"
    ],
    "ESG & Supply Chain Due Diligence": [
      "Regulatory Mapping",
      "Greenwashing ID",
      "Supply Chain Auditing"
    ]
  },

  "Legal Project Management": {
    "Matter Management & Efficiency": [
      "Scoping",
      "Timeline Management",
      "Status Reporting",
      "Resource Allocation"
    ]
  },

  "Professionalism & Soft Skills": {
    "Stakeholder Communication & EQ": [
      "Active Listening",
      "Plain English",
      "Managing Up",
      "Crisis De-escalation"
    ]
  },

  // MID-LEVEL ASSOCIATE (MLA) CLUSTERS
  "Deal Execution & Project Control": {
    "M&A Project Management": [
      "Fee Management: Track burn vs cap; flag scope changes early; align effort with budget.",
      "Critical Path Management: Identify blockers, sequence dependencies, and unblock timeline-critical items.",
      "Cross-functional Coordination: Coordinate tax/IP/employment/antitrust inputs and integrate into the deal plan.",
      "Resource Allocation: Staff and re-balance juniors/paralegals across DD, drafting, CPs, and admin work."
    ],
    "Fee & Scope Discipline": [
      "Efficient Delegation: Route work to the cheapest-competent resource (junior, paralegal, ALSP, tool).",
      "ALSP / Vendor Utilization: Decide when to outsource commoditized tasks and manage vendor costs.",
      "Scope Creep Identification: Spot out-of-scope requests and document change requests early.",
      "Budget Tracking: Maintain budget-to-actual tracking and forecasts for the matter."
    ]
  },

  "Corporate/M&A Technical Lawyering": {
    "Definitive Agreement Drafting (SPA/APA)": [
      "Purchase Price Mechanics: Draft working capital / locked-box / completion accounts mechanics and related definitions.",
      "Definitions & Cross-References: Maintain consistency across the document; prevent internal contradictions.",
      "Warranties & Indemnities: Tailor protections and limitations based on risk allocation and DD findings.",
      "Conditions Precedent & Closing Mechanics: Structure CPs, sign/close gap, and deliverables to control execution risk."
    ],
    "Disclosure Schedule Management": [
      "Fact-Gathering: Run disclosure calls and interrogate management to surface exceptions to warranties.",
      "Warranty Mapping: Map facts to the exact warranty language and required disclosure format.",
      "Risk Assessment: Decide materiality and what must be disclosed vs managed contractually.",
      "Defensive Drafting: Draft clear, specific disclosures that withstand challenge and align with VDR evidence."
    ]
  },

  "Risk, Regulation & Governance": {
    "Regulatory Clearance Coordination (FDI / Antitrust)": [
      "Condition & Remedy Management: Manage MACs, hell-or-high-water provisions, and remedy packages.",
      "Filing Strategy & Sequencing: Plan filings, long-stop dates, and conditions; align with signing/closing mechanics.",
      "Authority / Counterparty Coordination: Interface with regulators, opposing counsel, and antitrust advisors.",
      "Information Orchestration: Compile and format submissions and manage information flow between stakeholders."
    ],
    "EU AI Act & Digital Compliance": [
      "AI Categorization: Identify whether target systems fall into high-risk or other regulated categories.",
      "Supply-Chain Alignment (CSDDD-adjacent): Coordinate AI-related supplier / value-chain checks where relevant.",
      "Digital / Data Governance DD: Translate AI/data governance findings into reps, covenants, and conditions.",
      "Deployer Liability Assessment: Assess buyer/firm obligations and exposure as 'deployer' and define mitigations."
    ],
    "Agentic AI Governance (operational)": [
      "Escalating exceptions",
      "Validating agent outputs",
      "Operating within agent-orchestrated workflows"
    ]
  },

  "Tech-Enabled Legal Work": {
    "AI Output Validation": [
      "Hallucination Spotting: Detect fabricated facts/citations and inconsistent reasoning in AI outputs.",
      "Confidentiality / Privilege Guardrails: Apply redaction and safe workflows to avoid leakage and privilege waiver.",
      "Source Verification: Check AI summaries against originals; validate citations and quotes.",
      "Prompt & Context Engineering: Provide the right context/constraints so outputs are legally usable."
    ],
    "AI-Ready VDR Architecture": [
      "Designing VDR taxonomies",
      "Designing folder structures",
      "Ensuring data quality for LLM ingestion",
      "Defining metadata for agent consumption (not human search)"
    ],
    "Data Room & Closing Automation": [
      "Automated Closing Set Generation: Generate closing sets/bibles and post-closing packages efficiently.",
      "VDR Permissioning & Analytics: Manage access, Q&A workflows, and use analytics to support deal progress.",
      "eSignature Workflow Management: Configure signing order, envelopes, signature pages, and audit trails.",
      "Document Assembly / Comparison Automation: Automate compile/compare steps to reduce errors."
    ]
  },

  "Commercial Judgment & Negotiation": {
    "Negotiating Mid-Market Deal Points": [
      "Issue Prioritization: Separate 'must have' vs 'nice to have' under time/budget pressure.",
      "Drafting Compromises: Translate negotiation outcomes into clean, enforceable drafting.",
      "Market Standard Knowledge: Know 'what's market' for common mid-market positions (size, industry, jurisdiction).",
      "Stakeholder Management: Run wording turns with opposing counsel and keep client aligned."
    ]
  },

  // NOTE: MLA uses the same cluster names as DB (no MLA- prefix)
  // "Commercial Fluency" and "Negotiation, Commercial Judgment & Stakeholder Management" 
  // are defined above and reused for MLA role mapping

  "Team Supervision & Quality Control": {
    "Junior Associate & Paralegal Supervision": [
      "Quality Assurance / Reviewing: Review junior drafts, spot gaps, and fix errors before senior review.",
      "Workload Balancing: Monitor junior capacity and reassign work to prevent burnout and missed deadlines.",
      "Delegation & Briefing: Frame tasks, provide context, and set realistic deadlines and quality expectations.",
      "Feedback Delivery: Deliver actionable feedback that improves future output and speed."
    ]
  },

  // SENIOR ASSOCIATE / COUNSEL (SA) CLUSTERS
  "Negotiation, Commercial Judgment & Stakeholder Management": {
    "Stakeholder Management & Difficult Counterparties": [
      "Conflict de-escalation",
      "Decision-maker mapping",
      "Escalation path management",
      "Written vs verbal negotiation tactics",
      "Expectation setting & alignment"
    ],
    "Strategic Negotiation & Gap Bridging": [
      "Integrative bargaining & trade-offs",
      "W&I insurance integration",
      "Earn-out/rollover negotiation",
      "Dispute-resolution design",
      "Negotiation narrative & leverage mapping"
    ],
    "Risk Allocation: Indemnities, Caps, Baskets & Survival": [
      "Materiality scrape logic",
      "Survival periods calibration",
      "Cap/basket design",
      "Claims process & escrow mechanics",
      "Special indemnities drafting"
    ],
    "Warranty & Indemnity (W&I) Insurance Negotiation": [
      "Underwriting pack curation",
      "Insurer Q&A management",
      "Policy exclusion negotiation",
      "SPA-insurance alignment",
      "Claims readiness planning"
    ]
  },

  "Deal Leadership, Strategy & Project Control": {
    "Legal Project Management (LPM) & AFA Engineering": [
      "Scope definition & assumptions lists",
      "Post-matter profitability review",
      "Scope-change control & client alignment",
      "Budget-to-actual tracking & forecasting",
      "Resource allocation (AI vs junior vs specialist)"
    ],
    "Deal Architecture & Structuring": [
      "Funds flow & step plan drafting",
      "Cross-border execution sequencing",
      "Locked box vs completion accounts selection",
      "Structure options analysis",
      "Pre-closing reorg planning"
    ],
    "Workstream Leadership & Specialist Integration": [
      "Sign/close readiness gating",
      "Dependency management across workstreams",
      "Escalation management",
      "Issue triage & prioritization",
      "Tax/antitrust/employment/data integration"
    ],
    "Signing/Closing Orchestration & Deal Hygiene": [
      "CP tracking & satisfaction strategy",
      "Closing agenda & call leadership",
      "Funds flow coordination",
      "Signature package coordination",
      "Post-closing deliverables management"
    ],
    "Matter Risk Governance & Quality Gates": [
      "Error prevention (closing mechanics)",
      "Redline rationale articulation",
      "Version control & audit trails",
      "Senior review checklists",
      "Privilege/confidentiality controls"
    ]
  },

  "M&A Technical Mastery (Structure + Drafting Strategy)": {
    "SPA/SHA Drafting Strategy & Market Standards": [
      "Market standard benchmarking",
      "Clause architecture & fallback positions",
      "Definitions/interpretation engineering",
      "Schedule strategy & disclosure design",
      "Precedent selection & customization"
    ],
    "Representations & Warranties Architecture": [
      "Bring-down mechanics",
      "AI/data/IP reps tailoring",
      "Disclosure approach & updates",
      "Materiality/knowledge qualifiers",
      "Fundamental vs business reps"
    ],
    "Covenants, Interim Operations & Conduct of Business": [
      "Consent rights design",
      "Pre-closing leakage controls",
      "Information rights",
      "Ordinary course definitions",
      "Interim ops limitations"
    ],
    "Conditions Precedent, MAC & Closing Conditions": [
      "Long-stop & termination triggers",
      "Third-party consent strategy",
      "MAC clause tailoring",
      "Bring-down & officer cert mechanics",
      "Regulatory CP drafting (FDI/antitrust)"
    ],
    "Purchase Price Mechanics & Adjustments": [
      "Locked box protections & leakage",
      "Earn-out metrics & governance",
      "Equity rollover documentation",
      "Working capital adjustment design",
      "True-up dispute resolution"
    ],
    "Ancillary Documents & Corporate Housekeeping (Senior-Level)": [
      "Corporate registry filings planning",
      "Disclosure letter coordination",
      "Board/shareholder resolutions drafting oversight",
      "Equity incentive plan impacts",
      "Officer exculpation/charter amendments"
    ]
  },

  "Risk Allocation, Governance & Regulatory Awareness": {
    "EU AI Act Due Diligence (EU Focus)": [
      "Data governance & training-data risk",
      "AI system classification & inventory review",
      "AI reps/indemnities design",
      "AI governance & AI literacy evaluation",
      "Conformity assessment/documentation checks"
    ],
    "Privacy, Cybersecurity & Data Transfers in M&A": [
      "GDPR assessment & DPIA signals",
      "Security controls review (ISO/SOC2)",
      "Cross-border transfer mechanisms (SCCs)",
      "Data-related reps/covenants",
      "Data breach history evaluation"
    ],
    "Sanctions, Export Controls & Trade Compliance": [
      "Contractual protections design",
      "Export-control classification (EAR/ITAR proxies)",
      "Sanctions screening & exposure mapping",
      "Closing conditions & termination triggers",
      "OFAC/EU list monitoring"
    ],
    "FDI Screening & National Security Review": [
      "Information control/clean team setup",
      "Filing package coordination",
      "Timeline & long-stop calibration",
      "Mitigation measures negotiation",
      "FDI/CFIUS applicability screening"
    ],
    "US Corporate Governance, Caremark & Officer Duties (US Focus)": [
      "ESG governance backlash navigation",
      "Reincorporation analysis (DE/NV/TX)",
      "Board minutes risk-proofing",
      "Caremark 'red flags' analysis",
      "Officer duty/exculpation amendments"
    ],
    "Antitrust/Competition Law Deal Readiness (Senior Interface)": [
      "Gun-jumping avoidance",
      "Remedy package coordination",
      "Competition risk spotting from overlaps",
      "CP drafting around approvals",
      "Information exchange/clean team rules"
    ]
  },

  "Tech-Enabled Legal Delivery (AI workflows + QA + automation)": {
    "Legal Prompt Engineering & Context Priming": [
      "Iterative refinement loops",
      "Prompt library governance",
      "Context priming with precedents",
      "Defensive prompting & redaction",
      "Structured-output prompting (tables/JSON)"
    ],
    "AI Output Validation & Human-in-the-Loop Auditing": [
      "Bias/omission detection",
      "Hallucination detection",
      "Sampling-based doc checks",
      "Feedback loops & guardrails",
      "Citation & authority verification"
    ],
    "AI-Assisted Diligence Orchestration": [
      "Diligence scope design for AI",
      "Issue clustering & narrative synthesis",
      "Red flag criteria definition",
      "Clause extraction workflows",
      "Privilege-aware data handling"
    ],
    "Contract Analytics & Portfolio Review": [
      "Change-of-control extraction",
      "Output normalization for drafting",
      "Assignment/consent mapping",
      "Revenue/termination risk flags",
      "Template vs bespoke clause detection"
    ]
  },

  "Client Advisory & Communication (Value + Risk Transparency)": {
    "Executive Risk Summarization & Recommendation": [
      "Commercial impact framing",
      "Client-ready writing",
      "Options & recommendation drafting",
      "Escalation timing",
      "Risk ranking & materiality calls"
    ],
    "Client Relationship Management (Delivery-Led)": [
      "Proactive communication cadence",
      "Coordinating internal team responses",
      "Documenting advice for defensibility",
      "Managing client anxiety & deadlines",
      "Setting service-level expectations"
    ],
    "Value Communication & Fee Narrative": [
      "Budget narrative drafting",
      "Value framing for deliverables",
      "Write-off prevention conversations",
      "AFA scope boundary communication",
      "Post-matter value recap"
    ]
  },

  "Knowledge Systems, Precedents & Quality Management": {
    "Knowledge Architecture & Precedent Modernization": [
      "AI training-data hygiene",
      "Clause library curation & tagging",
      "Precedent versioning",
      "Post-deal data capture",
      "Market standard monitoring"
    ],
    "Playbook Creation & Training Materials": [
      "Checklist design",
      "Training delivery & feedback",
      "Playbook structuring",
      "Updating materials from live deals",
      "Scenario-based guidance"
    ]
  },

  "Team Leadership, Coaching & Delegation": {
    "Delegation, Coaching & Feedback Loops": [
      "Knowledge transfer",
      "Performance calibration",
      "Coaching on drafting/negotiation",
      "Review & feedback routines",
      "Task scoping & briefing"
    ],
    "Resource Planning & Utilization Management": [
      "Crunch-time triage",
      "Burnout risk management",
      "Specialist scheduling",
      "Capacity planning",
      "Leverage model design"
    ],
    "Mentoring on Professional Responsibility & Privilege": [
      "Incident response",
      "AI acceptable-use enforcement",
      "Recordkeeping & audit trails",
      "Privilege protocol design",
      "Confidentiality & clean team rules"
    ]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE-BASED CLUSTER MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const ROLE_CLUSTERS: Record<string, string[]> = {
  // Junior Associate: Only JA clusters
  "junior_associate": [
    "Commercial Fluency",
    "M&A Fundamentals & Deal Hygiene",
    "Tech-Enhanced Due Diligence",
    "Regulatory & AI Governance",
    "Legal Project Management",
    "Professionalism & Soft Skills"
  ],
  
  // Mid-Level Associate: MLA-specific clusters (using DB-matching names without MLA- prefix)
  "mid-level_associate_(mla)": [
    "Deal Execution & Project Control",
    "Corporate/M&A Technical Lawyering",
    "Risk, Regulation & Governance",
    "Tech-Enabled Legal Work",
    "Commercial Judgment & Negotiation",
    "Team Supervision & Quality Control",
    "Commercial Fluency",
    "Negotiation, Commercial Judgment & Stakeholder Management"
  ],
  
  // Senior Associate: SA-specific clusters only
  "senior_associate_(sa)": [
    "Negotiation, Commercial Judgment & Stakeholder Management",
    "Deal Leadership, Strategy & Project Control",
    "M&A Technical Mastery (Structure + Drafting Strategy)",
    "Risk Allocation, Governance & Regulatory Awareness",
    "Tech-Enabled Legal Delivery (AI workflows + QA + automation)",
    "Client Advisory & Communication (Value + Risk Transparency)",
    "Knowledge Systems, Precedents & Quality Management",
    "Team Leadership, Coaching & Delegation"
  ]
};

// Alias mappings for different role key formats
const ROLE_KEY_ALIASES: Record<string, string> = {
  "junior_associate": "junior_associate",
  "ja": "junior_associate",
  "junior associate": "junior_associate",
  "mid-level_associate_(mla)": "mid-level_associate_(mla)",
  "mla": "mid-level_associate_(mla)",
  "mid-level associate": "mid-level_associate_(mla)",
  "midlevel associate": "mid-level_associate_(mla)",
  "senior_associate_(sa)": "senior_associate_(sa)",
  "sa": "senior_associate_(sa)",
  "senior associate": "senior_associate_(sa)",
  "counsel": "senior_associate_(sa)"
};

function normalizeRoleKey(roleTitle: string): string {
  const normalized = roleTitle.toLowerCase().trim();
  return ROLE_KEY_ALIASES[normalized] || "mid-level_associate_(mla)";
}

function getClustersForRole(roleKey: string): string[] {
  const normalizedRole = normalizeRoleKey(roleKey);
  return ROLE_CLUSTERS[normalizedRole] || ROLE_CLUSTERS["mid-level_associate_(mla)"];
}

// Generiert den Kompetenz-Teil für den System Prompt - NUR für die angegebene Rolle
function getCompetencySchemaForPrompt(roleKey: string): string {
  const allowedClusters = getClustersForRole(roleKey);
  let output = "";

  console.log(`Generating schema for role: ${roleKey}`);
  console.log(`Allowed clusters: ${allowedClusters.join(", ")}`);

  for (const [cluster, competencies] of Object.entries(COMPETENCY_SCHEMA)) {
    // Skip clusters not relevant for this role
    if (!allowedClusters.includes(cluster)) {
      continue;
    }

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

// Generates the system prompt with role-specific competencies only
function getSystemPrompt(roleKey: string): string {
  const normalizedRole = normalizeRoleKey(roleKey);
  const allowedClusters = getClustersForRole(roleKey);
  
  return `Du bist ein HR-Analytics-Assistent für eine Wirtschaftskanzlei im Bereich Corporate Law / M&A.

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
KRITISCH: Du bewertest einen ${roleKey} (normalisiert: ${normalizedRole})
═══════════════════════════════════════════════════════════════════════════════

Bewerte NUR die folgenden ${allowedClusters.length} Cluster für diese Rolle:
${allowedClusters.map((c, i) => `${i + 1}. ${c}`).join("\n")}

═══════════════════════════════════════════════════════════════════════════════
EXAKTE KOMPETENZ- UND SUBSKILL-NAMEN FÜR DIESE ROLLE
Keine Abweichungen, keine Umformulierungen, keine Abkürzungen!
═══════════════════════════════════════════════════════════════════════════════

${getCompetencySchemaForPrompt(roleKey)}

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
2. Bewerte ALLE Kompetenzen in ALLEN oben aufgelisteten Clustern für diese Rolle!
3. Bei fehlender Evidence: "NB" (Nicht bewertbar)
4. Overall Score = gewichteter Durchschnitt aller bewerteten Kompetenzen (Rating 1=20%, 2=40%, 3=60%, 4=80%, 5=100%)
5. Antworte NUR mit JSON - keine Erklärungen davor oder danach!`;
}

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

    // Generate role-specific system prompt
    const systemPrompt = getSystemPrompt(roleTitle);
    const allowedClusters = getClustersForRole(roleTitle);

    console.log("Calling Anthropic API with role:", roleTitle);
    console.log("Normalized role:", normalizeRoleKey(roleTitle));
    console.log("Allowed clusters:", allowedClusters);
    console.log("System prompt length:", systemPrompt.length);

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
        system: systemPrompt,
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
