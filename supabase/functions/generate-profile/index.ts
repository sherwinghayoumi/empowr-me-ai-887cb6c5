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
    "Deal Lifecycle Management": ["CP Tracking", "Signature Coordination", "Closing Mechanics", "VDR Management"],
    "Ancillary Document Drafting": ["Template Adaptation", "Cross-referencing", "Error-spotting", "Corporate Governance"]
  },
  "Tech-Enhanced Due Diligence": {
    "AI-Assisted Risk Review": ["Risk Grading", "Synthesis", "Prompt Engineering", "Hallucination Checking"],
    "Data Hygiene & VDR Architecture": ["File Naming", "Taxonomy Design", "Redaction", "OCR QC"]
  },
  "Regulatory & AI Governance": {
    "EU AI Act & Digital Compliance": ["Prohibited Use Spotting", "GDPR Overlap", "Provider Assessment", "AI System Classification"],
    "ESG & Supply Chain Due Diligence": ["Regulatory Mapping", "Greenwashing ID", "Supply Chain Auditing"]
  },
  "Legal Project Management": {
    "Matter Management & Efficiency": ["Scoping", "Timeline Management", "Status Reporting", "Resource Allocation"]
  },
  "Professionalism & Soft Skills": {
    "Stakeholder Communication & EQ": ["Active Listening", "Plain English", "Managing Up", "Crisis De-escalation"]
  },
  // MLA CLUSTERS
  "Deal Execution & Project Control": {
    "M&A Project Management": ["Fee Management", "Critical Path Management", "Cross-functional Coordination", "Resource Allocation"],
    "Fee & Scope Discipline": ["Efficient Delegation", "ALSP / Vendor Utilization", "Scope Creep Identification", "Budget Tracking"]
  },
  "Corporate/M&A Technical Lawyering": {
    "Definitive Agreement Drafting (SPA/APA)": ["Purchase Price Mechanics", "Definitions & Cross-References", "Warranties & Indemnities", "Conditions Precedent & Closing Mechanics"],
    "Disclosure Schedule Management": ["Fact-Gathering", "Warranty Mapping", "Risk Assessment", "Defensive Drafting"]
  },
  "Risk, Regulation & Governance": {
    "Regulatory Clearance Coordination (FDI / Antitrust)": ["Condition & Remedy Management", "Filing Strategy & Sequencing", "Authority / Counterparty Coordination", "Information Orchestration"],
    "EU AI Act & Digital Compliance": ["AI Categorization", "Supply-Chain Alignment (CSDDD-adjacent)", "Digital / Data Governance DD", "Deployer Liability Assessment"],
    "Agentic AI Governance (operational)": ["Escalating exceptions", "Validating agent outputs", "Operating within agent-orchestrated workflows"]
  },
  "Tech-Enabled Legal Work": {
    "AI Output Validation": ["Hallucination Spotting", "Confidentiality / Privilege Guardrails", "Source Verification", "Prompt & Context Engineering"],
    "AI-Ready VDR Architecture": ["Designing VDR taxonomies", "Designing folder structures", "Ensuring data quality for LLM ingestion", "Defining metadata for agent consumption (not human search)"],
    "Data Room & Closing Automation": ["Automated Closing Set Generation", "VDR Permissioning & Analytics", "eSignature Workflow Management", "Document Assembly / Comparison Automation"]
  },
  "Commercial Judgment & Negotiation": {
    "Negotiating Mid-Market Deal Points": ["Issue Prioritization", "Drafting Compromises", "Market Standard Knowledge", "Stakeholder Management"]
  },
  "Team Supervision & Quality Control": {
    "Junior Associate & Paralegal Supervision": ["Quality Assurance / Reviewing", "Workload Balancing", "Delegation & Briefing", "Feedback Delivery"]
  },
  // SA CLUSTERS
  "Negotiation, Commercial Judgment & Stakeholder Management": {
    "Stakeholder Management & Difficult Counterparties": ["Conflict de-escalation", "Decision-maker mapping", "Escalation path management", "Written vs verbal negotiation tactics", "Expectation setting & alignment"],
    "Strategic Negotiation & Gap Bridging": ["Integrative bargaining & trade-offs", "W&I insurance integration", "Earn-out/rollover negotiation", "Dispute-resolution design", "Negotiation narrative & leverage mapping"],
    "Risk Allocation: Indemnities, Caps, Baskets & Survival": ["Materiality scrape logic", "Survival periods calibration", "Cap/basket design", "Claims process & escrow mechanics", "Special indemnities drafting"],
    "Warranty & Indemnity (W&I) Insurance Negotiation": ["Underwriting pack curation", "Insurer Q&A management", "Policy exclusion negotiation", "SPA-insurance alignment", "Claims readiness planning"]
  },
  "Deal Leadership, Strategy & Project Control": {
    "Legal Project Management (LPM) & AFA Engineering": ["Scope definition & assumptions lists", "Post-matter profitability review", "Scope-change control & client alignment", "Budget-to-actual tracking & forecasting", "Resource allocation (AI vs junior vs specialist)"],
    "Deal Architecture & Structuring": ["Funds flow & step plan drafting", "Cross-border execution sequencing", "Locked box vs completion accounts selection", "Structure options analysis", "Pre-closing reorg planning"],
    "Workstream Leadership & Specialist Integration": ["Sign/close readiness gating", "Dependency management across workstreams", "Escalation management", "Issue triage & prioritization", "Tax/antitrust/employment/data integration"],
    "Signing/Closing Orchestration & Deal Hygiene": ["CP tracking & satisfaction strategy", "Closing agenda & call leadership", "Funds flow coordination", "Signature package coordination", "Post-closing deliverables management"],
    "Matter Risk Governance & Quality Gates": ["Error prevention (closing mechanics)", "Redline rationale articulation", "Version control & audit trails", "Senior review checklists", "Privilege/confidentiality controls"]
  },
  "M&A Technical Mastery (Structure + Drafting Strategy)": {
    "SPA/SHA Drafting Strategy & Market Standards": ["Market standard benchmarking", "Clause architecture & fallback positions", "Definitions/interpretation engineering", "Schedule strategy & disclosure design", "Precedent selection & customization"],
    "Representations & Warranties Architecture": ["Bring-down mechanics", "AI/data/IP reps tailoring", "Disclosure approach & updates", "Materiality/knowledge qualifiers", "Fundamental vs business reps"],
    "Covenants, Interim Operations & Conduct of Business": ["Consent rights design", "Pre-closing leakage controls", "Information rights", "Ordinary course definitions", "Interim ops limitations"],
    "Conditions Precedent, MAC & Closing Conditions": ["Long-stop & termination triggers", "Third-party consent strategy", "MAC clause tailoring", "Bring-down & officer cert mechanics", "Regulatory CP drafting (FDI/antitrust)"],
    "Purchase Price Mechanics & Adjustments": ["Locked box protections & leakage", "Earn-out metrics & governance", "Equity rollover documentation", "Working capital adjustment design", "True-up dispute resolution"],
    "Ancillary Documents & Corporate Housekeeping (Senior-Level)": ["Corporate registry filings planning", "Disclosure letter coordination", "Board/shareholder resolutions drafting oversight", "Equity incentive plan impacts", "Officer exculpation/charter amendments"]
  },
  "Risk Allocation, Governance & Regulatory Awareness": {
    "EU AI Act Due Diligence (EU Focus)": ["Data governance & training-data risk", "AI system classification & inventory review", "AI reps/indemnities design", "AI governance & AI literacy evaluation", "Conformity assessment/documentation checks"],
    "Privacy, Cybersecurity & Data Transfers in M&A": ["GDPR assessment & DPIA signals", "Security controls review (ISO/SOC2)", "Cross-border transfer mechanisms (SCCs)", "Data-related reps/covenants", "Data breach history evaluation"],
    "Sanctions, Export Controls & Trade Compliance": ["Contractual protections design", "Export-control classification (EAR/ITAR proxies)", "Sanctions screening & exposure mapping", "Closing conditions & termination triggers", "OFAC/EU list monitoring"],
    "FDI Screening & National Security Review": ["Information control/clean team setup", "Filing package coordination", "Timeline & long-stop calibration", "Mitigation measures negotiation", "FDI/CFIUS applicability screening"],
    "US Corporate Governance, Caremark & Officer Duties (US Focus)": ["ESG governance backlash navigation", "Reincorporation analysis (DE/NV/TX)", "Board minutes risk-proofing", "Caremark 'red flags' analysis", "Officer duty/exculpation amendments"],
    "Antitrust/Competition Law Deal Readiness (Senior Interface)": ["Gun-jumping avoidance", "Remedy package coordination", "Competition risk spotting from overlaps", "CP drafting around approvals", "Information exchange/clean team rules"]
  },
  "Tech-Enabled Legal Delivery (AI workflows + QA + automation)": {
    "Legal Prompt Engineering & Context Priming": ["Iterative refinement loops", "Prompt library governance", "Context priming with precedents", "Defensive prompting & redaction", "Structured-output prompting (tables/JSON)"],
    "AI Output Validation & Human-in-the-Loop Auditing": ["Bias/omission detection", "Hallucination detection", "Sampling-based doc checks", "Feedback loops & guardrails", "Citation & authority verification"],
    "AI-Assisted Diligence Orchestration": ["Diligence scope design for AI", "Issue clustering & narrative synthesis", "Red flag criteria definition", "Clause extraction workflows", "Privilege-aware data handling"],
    "Contract Analytics & Portfolio Review": ["Change-of-control extraction", "Output normalization for drafting", "Assignment/consent mapping", "Revenue/termination risk flags", "Template vs bespoke clause detection"]
  },
  "Client Advisory & Communication (Value + Risk Transparency)": {
    "Executive Risk Summarization & Recommendation": ["Commercial impact framing", "Client-ready writing", "Options & recommendation drafting", "Escalation timing", "Risk ranking & materiality calls"],
    "Client Relationship Management (Delivery-Led)": ["Proactive communication cadence", "Coordinating internal team responses", "Documenting advice for defensibility", "Managing client anxiety & deadlines", "Setting service-level expectations"],
    "Value Communication & Fee Narrative": ["Budget narrative drafting", "Value framing for deliverables", "Write-off prevention conversations", "AFA scope boundary communication", "Post-matter value recap"]
  },
  "Knowledge Systems, Precedents & Quality Management": {
    "Knowledge Architecture & Precedent Modernization": ["AI training-data hygiene", "Clause library curation & tagging", "Precedent versioning", "Post-deal data capture", "Market standard monitoring"],
    "Playbook Creation & Training Materials": ["Checklist design", "Training delivery & feedback", "Playbook structuring", "Updating materials from live deals", "Scenario-based guidance"]
  },
  "Team Leadership, Coaching & Delegation": {
    "Delegation, Coaching & Feedback Loops": ["Knowledge transfer", "Performance calibration", "Coaching on drafting/negotiation", "Review & feedback routines", "Task scoping & briefing"],
    "Resource Planning & Utilization Management": ["Crunch-time triage", "Burnout risk management", "Specialist scheduling", "Capacity planning", "Leverage model design"],
    "Mentoring on Professional Responsibility & Privilege": ["Incident response", "AI acceptable-use enforcement", "Recordkeeping & audit trails", "Privilege protocol design", "Confidentiality & clean team rules"]
  },
  // PARTNER CLUSTERS
  "Deal Strategy, Risk Ownership & Structuring Judgment": {
    "Deal Strategy Development & Risk Ownership": ["Deal thesis articulation & strategic positioning", "Risk tolerance calibration & client alignment", "Value creation narrative & deal story", "Board/stakeholder risk presentation", "Go/no-go recommendation & escalation"],
    "Deal Structuring & Risk Allocation Mastery": ["Alternative structure generation (asset/share, carve-out, JV)", "Locked-box vs completion accounts strategic selection", "Warranty/indemnity architecture design", "Seller-friendly vs buyer-friendly strategy", "Step-plan & pre-signing restructuring"],
    "Due Diligence Scoping & Prioritization": ["Due diligence prioritization & materiality thresholds", "Risk-based scoping (red flag vs full DD)", "Integrating financial/tax/employment findings into deal terms", "DD report ownership & risk summary authorship", "Issue escalation & deal team alignment"],
    "Regulatory & Antitrust Strategy Oversight": ["Antitrust strategy & remedy planning oversight", "FDI/national security exposure assessment", "Regulatory timeline integration into deal structure", "Authority relationship management", "Condition precedent design (approval risk)"],
    "Cross-Border M&A Coordination & Multi-Jurisdictional Strategy": ["Local counsel selection & instruction", "Harmonizing closing mechanics across jurisdictions", "Managing translation, notarization, apostilles", "Multi-jurisdiction issue matrix & tracking", "Regulatory sequencing across geographies"]
  },
  "Negotiation Leadership & Stakeholder Power Management": {
    "High-Stakes Negotiation Leadership": ["Leading principal-level negotiations", "Managing multi-party dynamics (sponsors, co-investors)", "Bridging commercial vs legal gaps", "Handling walk-away scenarios & brinkmanship", "Term sheet / MoU negotiation leadership"],
    "Stakeholder Power Management (Board, Sponsors, Management, Lenders)": ["Managing sponsor/lender expectations", "Board reporting & governance alignment", "Management retention/incentive negotiation interface", "Seller management & trust-building", "Multi-party alignment in consortium deals"],
    "Crisis Management & Client Escalation Handling": ["Managing deal-threatening issues", "Rapid response coordination (regulatory, media, legal)", "Client de-escalation & expectation reset", "Insurance & claims management interface", "Reputation protection & media coordination"],
    "Dispute Avoidance & Deal-Edge Conflict Resolution": ["Purchase price dispute resolution (expert, arbitration)", "Breach/termination risk assessment", "Post-closing dispute prevention", "Claims process design & escrow release", "Earn-out dispute mitigation"]
  },
  "Client Leadership, Origination & Relationship Strategy": {
    "Strategic Client Relationship Management & Cross-Selling": ["Handling sensitive conversations & fee disputes", "Cross-selling orchestration across practices", "Client issue spotting & proactive advice", "Managing expectations on scope/fees/timelines", "Value delivery cadence (QBRs, post-matter reviews)", "Stakeholder mapping (GC/CFO/board/in-house team)"],
    "Client Origination & Business Development Execution": ["Referral cultivation (bankers, PE, accountants, boutiques)", "Strategic networking & relationship seeding", "CRM discipline (follow-ups, pipeline hygiene, conversion review)", "Thought leadership that converts (alerts, webinars, podcasts)", "Opportunity qualification & profitability screening", "Pitch development (problem diagnosis + ROI narrative)"],
    "Client Panel & Procurement Navigation": ["Competitive tender strategy & differentiation", "Pricing grid strategy & rate architecture", "Diversity/ESG/tech capability positioning", "Panel relationship management & renewals", "Performance KPI reporting & scorecards", "RFP response leadership (narrative + evidence)"],
    "Engagement Terms & Scope Control": ["Client onboarding & matter kickoff discipline", "Change control & scope creep management", "Assumptions & exclusions drafting", "Engagement letter negotiation (scope, limits, indemnities)", "Budget communication & variance explanation"],
    "Thought Leadership Strategy & Reputation Building": ["Editorial calendar & themes tied to client pain", "Media engagement & quote readiness", "Authoring client-ready insights (not academic memos)", "Measuring content-to-pipeline conversion", "Speaking/panel participation strategy"],
    "Client Experience Design & Service Model Tailoring": ["Client communication architecture (updates, escalation paths)", "Feedback loops & NPS-style measurement", "Client portal strategy & reporting formats", "Onboarding playbooks for new matters", "Service model selection (modular/unbundled/full-service)"]
  },
  "Practice Management, Pricing & Delivery Standards": {
    "Alternative Fee Arrangement (AFA) Engineering & Pricing Strategy": ["Scope-based pricing design", "Risk/reward models (success fees, holdbacks)", "Fee estimation accuracy & variance analysis", "Pricing tool & benchmark utilization", "Profitability modeling per fee type"],
    "Practice Profitability Management (PPEP, Leverage, Realization)": ["PPEP/realization analysis & intervention", "Leverage model optimization (senior/junior mix)", "Write-off prevention & root-cause analysis", "Billing discipline & WIP management", "Revenue forecasting & matter pipeline"],
    "Legal Project Management (LPM) & Process Standardization": ["Matter scoping & checklist discipline", "Template selection & standardization", "Process mapping for recurring deal types", "SOP authorship & maintenance", "Lessons-learned capture & feedback loops"],
    "Resourcing, Delegation & Matter Delivery Supervision": ["Resource allocation across matters", "Delegation matrix & decision rights", "Junior supervision & milestone review", "Escalation protocols", "Capacity planning & crunch-time management"],
    "Quality Assurance, Sign-Off & Error Prevention": ["Senior review & sign-off protocols", "Error tracking & near-miss analysis", "Version control & document hygiene", "Risk flag identification & escalation", "Post-signing review discipline"]
  },
  "Tech-Enabled Practice Strategy (AI adoption + controls + differentiation)": {
    "Legal Tech & AI Adoption Strategy (Partner Lens)": ["AI use-case prioritization for practice", "Change management & team buy-in", "Risk governance for new tools", "ROI evaluation & business-case development", "Pilot-to-scale roadmaps"],
    "Vendor Evaluation & Procurement (AI and Legal Ops Tools)": ["Tool selection criteria & scoring", "Contract negotiation (SLA, data rights, exit)", "Security/compliance vetting", "Integration with existing tech stack", "Post-implementation performance monitoring"],
    "Client Reporting, Dashboards & Transparency Infrastructure": ["KPI selection & reporting cadence", "Dashboard design for clients & partners", "Data quality & source integrity", "Automation of status updates", "Transparency as differentiation"]
  },
  "Governance, Ethics & Regulatory Oversight (incl. AI)": {
    "AI Governance & Client Acceptability (EU-focused)": ["AI policy development for practice", "Client-specific AI use approvals", "EU AI Act practice implications", "Confidentiality & privilege in AI use", "AI output liability allocation"],
    "Agentic AI Governance & Agent Supervisor": ["Designing multi-agent deal workflows", "Staffing teams around agentic systems", "Managing agent performance & exceptions"],
    "AI Compliance & Regulatory Alignment": ["New contract language", "Liability frameworks", "IP ownership for agents' outputs"],
    "Conflicts, Ethics & Professional Responsibility Oversight": ["Conflicts clearing & lateral hire vetting", "Chinese wall & information barrier enforcement", "Ethical issues escalation & bar referral", "Client confidentiality & privilege management", "Professional conduct training & culture"],
    "Risk Management, Malpractice Prevention & Insurance Interface": ["Risk register maintenance", "Malpractice exposure identification", "Insurance notification protocols", "Claims management & defense coordination", "Post-incident learning & policy update"],
    "Regulatory Horizon Scanning & Client-Facing Risk Updates": ["Regulatory change monitoring", "Client alert development", "Impact assessment for practice areas", "Proactive client communication", "Integration into deal playbooks"]
  },
  "Talent Leadership (coaching, delegation, performance, culture)": {
    "Structured Talent Development & Mentoring": ["Career pathway design & communication", "Mentoring program oversight", "Training curriculum development", "Secondment & rotation planning", "Promotion readiness assessment"],
    "Performance Management, Culture & Team Accountability": ["Performance review discipline & calibration", "Feedback culture & real-time coaching", "Underperformance intervention", "Culture modeling & values reinforcement", "Retention strategy & exit management"]
  },
  "Knowledge & Quality Systems (playbooks, precedent modernization, QA)": {
    "Precedent & Playbook System Ownership": ["Precedent library governance", "Playbook authorship & version control", "Knowledge contribution incentives", "Cross-border precedent harmonization", "Retirement of outdated materials"],
    "Document Automation & Clause Standardization Oversight": ["Clause bank curation", "Automation template ownership", "Exception handling & fallback drafting", "Quality audit for automated output", "Integration with DMS & intake systems"],
    "Deal Data Capture & Lessons-Learned Loops": ["Post-deal debrief discipline", "Data capture for market intelligence", "Issue pattern recognition", "Playbook update triggers", "Benchmarking against peer deals"]
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE-BASED CLUSTER MAPPING
// ═══════════════════════════════════════════════════════════════════════════════

const ROLE_CLUSTERS: Record<string, string[]> = {
  "junior_associate": [
    "Commercial Fluency",
    "M&A Fundamentals & Deal Hygiene",
    "Tech-Enhanced Due Diligence",
    "Regulatory & AI Governance",
    "Legal Project Management",
    "Professionalism & Soft Skills"
  ],
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
  "senior_associate_(sa)": [
    "Negotiation, Commercial Judgment & Stakeholder Management",
    "Deal Leadership, Strategy & Project Control",
    "M&A Technical Mastery (Structure + Drafting Strategy)",
    "Risk Allocation, Governance & Regulatory Awareness",
    "Tech-Enabled Legal Delivery (AI workflows + QA + automation)",
    "Client Advisory & Communication (Value + Risk Transparency)",
    "Knowledge Systems, Precedents & Quality Management",
    "Team Leadership, Coaching & Delegation"
  ],
  "counsel": [
    // Aus SA übernommen (Kern-Arbeit):
    "Negotiation, Commercial Judgment & Stakeholder Management",
    "Deal Leadership, Strategy & Project Control",
    "M&A Technical Mastery (Structure + Drafting Strategy)",
    "Risk Allocation, Governance & Regulatory Awareness",
    "Tech-Enabled Legal Delivery (AI workflows + QA + automation)",
    "Client Advisory & Communication (Value + Risk Transparency)",
    "Knowledge Systems, Precedents & Quality Management",
    "Team Leadership, Coaching & Delegation",
    // Aus Partner übernommen (Wachstumsrichtung):
    "Practice Management, Pricing & Delivery Standards",
    "Governance, Ethics & Regulatory Oversight (incl. AI)"
  ],
  "partner": [
    "Deal Strategy, Risk Ownership & Structuring Judgment",
    "Negotiation Leadership & Stakeholder Power Management",
    "Client Leadership, Origination & Relationship Strategy",
    "Practice Management, Pricing & Delivery Standards",
    "Tech-Enabled Practice Strategy (AI adoption + controls + differentiation)",
    "Governance, Ethics & Regulatory Oversight (incl. AI)",
    "Talent Leadership (coaching, delegation, performance, culture)",
    "Knowledge & Quality Systems (playbooks, precedent modernization, QA)"
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
  "counsel": "counsel",
  "cn": "counsel",
  "partner": "partner",
  "partner_/_practice_lead": "partner",
  "practice_lead": "partner"
};

const ROLE_DISPLAY_NAMES: Record<string, string> = {
  "junior_associate": "Junior Associate",
  "mid-level_associate_(mla)": "Mid-Level Associate",
  "senior_associate_(sa)": "Senior Associate",
  "counsel": "Counsel",
  "partner": "Partner / Practice Lead"
};

function normalizeRoleKey(roleTitle: string): string {
  const normalized = roleTitle.toLowerCase().trim();

  // If the roleTitle has the compound key format (e.g. "senior_associate__banking_finance"),
  // extract the role part (before the double underscore)
  const rolePart = normalized.includes('__') ? normalized.split('__')[0] : normalized;

  // Exakter Match
  if (ROLE_KEY_ALIASES[rolePart]) {
    return ROLE_KEY_ALIASES[rolePart];
  }

  // Fuzzy Match: Prüfe ob einer der Alias-Keys im Input enthalten ist
  // Only match aliases longer than 2 chars to avoid false positives with "ja", "sa", "cn"
  for (const [alias, roleKey] of Object.entries(ROLE_KEY_ALIASES)) {
    if (alias.length > 2 && (rolePart.includes(alias) || alias.includes(rolePart))) {
      return roleKey;
    }
  }

  // Fallback mit Warning
  console.warn(`Unknown role key: "${roleTitle}", falling back to mid-level_associate_(mla)`);
  return "mid-level_associate_(mla)";
}

function getClustersForRole(roleKey: string): string[] {
  const normalizedRole = normalizeRoleKey(roleKey);
  return ROLE_CLUSTERS[normalizedRole] || ROLE_CLUSTERS["mid-level_associate_(mla)"];
}

// Generiert den Kompetenz-Teil für den System Prompt - NUR für die angegebene Rolle
// If dbCompetencySchema is provided, use it (exact DB names). Otherwise fall back to static schema.
function getCompetencySchemaForPrompt(roleKey: string, dbCompetencySchema?: Array<{ clusterName: string; competencyName: string; subskills: string[] }>): string {
  // If we have actual DB competencies, use them - this guarantees 100% name match
  if (dbCompetencySchema && dbCompetencySchema.length > 0) {
    console.log(`Using DB competency schema with ${dbCompetencySchema.length} competencies`);
    
    // Group by cluster
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

  // Fallback: use static schema
  const allowedClusters = getClustersForRole(roleKey);
  let output = "";

  console.log(`Using static schema for role: ${roleKey}`);
  console.log(`Allowed clusters: ${allowedClusters.join(", ")}`);

  for (const [cluster, competencies] of Object.entries(COMPETENCY_SCHEMA)) {
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
function getSystemPrompt(
  roleKey: string,
  dbCompetencySchema?: Array<{ clusterName: string; competencyName: string; subskills: string[] }>,
  practiceGroup?: string
): string {
  const normalizedRole = normalizeRoleKey(roleKey);
  const allowedClusters = dbCompetencySchema ? [] : getClustersForRole(roleKey);
  const schemaSource = dbCompetencySchema ? "Datenbank" : "statisches Schema";
  const practiceArea = practiceGroup || "Corporate Law / M&A";
  
  return `Du bist ein HR-Analytics-Assistent für eine Wirtschaftskanzlei im Bereich ${practiceArea}.

Du erhältst 3 Dokumente: CV, Self-Assessment, Manager-Assessment.

Deine Aufgabe:
1. DSGVO-Consent prüfen (muss im Self-Assessment bestätigt sein)
2. Daten extrahieren aus allen Dokumenten
3. Kompetenzen bewerten (Rating 1-5)
4. Stärken und Entwicklungsfelder identifizieren

BEWERTUNGSMASSSTAB: Rollenrelativ fuer ${roleKey}
Die Bewertung bezieht sich AUSSCHLIESSLICH auf die Erwartungen der aktuellen Rolle.
Ein Junior Associate, der alle JA-Kompetenzen perfekt beherrscht, verdient eine 5.
Ein Senior Associate, der SA-Kompetenzen nur teilweise beherrscht, kann eine 2 bekommen.
Vergleiche NICHT zwischen Rollen -- bewerte nur innerhalb der Rollenerwartung.

- 1 = Erfuellt die Rollenerwartung nicht (deutliche Luecken fuer diese Stufe)
- 2 = Teilweise auf Rollenniveau (Grundlagen vorhanden, aber Luecken)
- 3 = Auf Rollenniveau (erfuellt die Erwartung fuer diese Position solide)
- 4 = Ueber Rollenniveau (uebertrifft die Erwartung fuer diese Stufe)
- 5 = Herausragend fuer diese Rolle (Benchmark / Vorbild auf dieser Stufe)

WICHTIG: Du MUSST für JEDE Kompetenz und JEDEN Subskill ein numerisches Rating (1-5) vergeben!
Wenn keine direkte Evidence vorhanden ist, nutze dein Expertenwissen, um basierend auf dem Gesamtbild
(Berufserfahrung, verwandte Skills, dokumentierte Leistungen) eine fundierte Einschaetzung abzugeben.
Beziehe die Bewertung dabei IMMER auf das erwartete Niveau der aktuellen Rolle -- NICHT auf eine absolute Senioritaetsskala.
Setze in diesem Fall die Confidence auf "LOW" und erkläre in der Evidence, worauf die Einschätzung basiert.
"NB" (Nicht bewertbar) ist KEINE gültige Antwort – es muss IMMER ein Rating von 1-5 vergeben werden.

═══════════════════════════════════════════════════════════════════════════════
KRITISCH: Du bewertest einen ${roleKey} (normalisiert: ${normalizedRole})
Kompetenz-Quelle: ${schemaSource}

BEWERTUNGSPRINZIP: Alle Ratings sind RELATIV zur Rolle "${roleKey}".
Eine 5 bedeutet: herausragend FUER DIESE ROLLE.
Eine 3 bedeutet: solide auf dem erwarteten Niveau DIESER ROLLE.
Absolute Berufserfahrung oder Senioritaet duerfen das Rating
NICHT systematisch nach oben oder unten verzerren.
═══════════════════════════════════════════════════════════════════════════════

${dbCompetencySchema ? '' : `Bewerte NUR die folgenden ${allowedClusters.length} Cluster für diese Rolle:
${allowedClusters.map((c: string, i: number) => `${i + 1}. ${c}`).join("\n")}
`}
═══════════════════════════════════════════════════════════════════════════════
EXAKTE KOMPETENZ- UND SUBSKILL-NAMEN (aus der ${schemaSource})
KRITISCH: Du MUSST die Namen ZEICHENGENAU (character-for-character) verwenden!
Keine Abweichungen, keine Umformulierungen, keine Abkürzungen, keine Ergänzungen!
Kopiere die Namen exakt wie hier angegeben in deine JSON-Antwort!
═══════════════════════════════════════════════════════════════════════════════

${getCompetencySchemaForPrompt(roleKey, dbCompetencySchema)}

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
    

    const userPrompt = `
ROLLE: ${roleTitle}

=== CV ===
${cvText}

=== SELF-ASSESSMENT ===
${selfText}

=== MANAGER-ASSESSMENT ===
${managerText}

Erstelle das Kompetenzprofil als JSON. Verwende EXAKT die im System definierten Kompetenz-Namen – zeichengenau, ohne Abweichungen!`;

    // Generate role-specific system prompt (use DB schema if available)
    const systemPrompt = getSystemPrompt(roleTitle, dbCompetencySchema, practiceGroup);
    const allowedClusters = getClustersForRole(roleTitle);

    console.log("Using DB competency schema:", !!dbCompetencySchema, "count:", dbCompetencySchema?.length || 0);
    console.log("Practice group:", practiceGroup || "default (Corporate Law / M&A)");

    console.log("Calling Anthropic API with role:", roleTitle);
    console.log("Normalized role:", normalizeRoleKey(roleTitle));
    console.log("Allowed clusters:", allowedClusters);
    console.log("System prompt length:", systemPrompt.length);

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
    console.log("AI response preview:", content?.substring(0, 500));

    // Check if response was truncated
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
      // Count open vs close braces/brackets and close them
      let openBraces = 0, openBrackets = 0;
      for (const ch of jsonStr) {
        if (ch === '{') openBraces++;
        else if (ch === '}') openBraces--;
        else if (ch === '[') openBrackets++;
        else if (ch === ']') openBrackets--;
      }
      // Trim trailing comma or incomplete value
      jsonStr = jsonStr.replace(/,\s*$/, '');
      // Remove incomplete last key-value pair (e.g. truncated string)
      jsonStr = jsonStr.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"]*$/, '');
      // Close open brackets and braces
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
