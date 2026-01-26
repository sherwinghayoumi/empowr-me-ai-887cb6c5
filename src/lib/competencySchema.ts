// Kompetenz-Schema - EXAKT synchron mit Supabase-Datenbank
// Automatisch generiert aus competency_clusters, competencies und subskills Tabellen

// WICHTIG: Diese Namen müssen EXAKT mit der Supabase-Datenbank übereinstimmen!

export const COMPETENCY_SCHEMA: Record<string, Record<string, string[]>> = {
  // ═══════════════════════════════════════════════════════════════════════════════
  // JUNIOR ASSOCIATE (JA) CLUSTERS
  // ═══════════════════════════════════════════════════════════════════════════════

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

  // ═══════════════════════════════════════════════════════════════════════════════
  // MID-LEVEL ASSOCIATE (MLA) CLUSTERS
  // ═══════════════════════════════════════════════════════════════════════════════

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
      "Condition & Remedy Management",
      "Filing Strategy & Sequencing",
      "Authority / Counterparty Coordination",
      "Information Orchestration"
    ],
    "EU AI Act & Digital Compliance": [
      "AI Categorization",
      "Supply-Chain Alignment (CSDDD-adjacent)",
      "Digital / Data Governance DD",
      "Deployer Liability Assessment"
    ],
    "Agentic AI Governance (operational)": [
      "Escalating exceptions",
      "Validating agent outputs",
      "Operating within agent-orchestrated workflows"
    ]
  },

  "Tech-Enabled Legal Work": {
    "AI Output Validation": [
      "Hallucination Spotting",
      "Confidentiality / Privilege Guardrails",
      "Source Verification",
      "Prompt & Context Engineering"
    ],
    "AI-Ready VDR Architecture": [
      "VDR taxonomies for agent consumption",
      "Folder structures for agent consumption",
      "Data quality for LLM ingestion",
      "Metadata for agent consumption"
    ],
    "Data Room & Closing Automation": [
      "Automated Closing Set Generation",
      "VDR Permissioning & Analytics",
      "eSignature Workflow Management",
      "Document Assembly / Comparison Automation"
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

  "Team Supervision & Quality Control": {
    "Junior Associate & Paralegal Supervision": [
      "Quality Assurance / Reviewing",
      "Workload Balancing",
      "Delegation & Briefing",
      "Feedback Delivery"
    ]
  },

  "Business Development Support (Mid-market relationship building)": {
    "Business Development Support (Mid-market relationship building)": [
      "Business Development Support (Mid-market relationship building)"
    ]
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // SENIOR ASSOCIATE / COUNSEL (SA) CLUSTERS
  // ═══════════════════════════════════════════════════════════════════════════════

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
  },

  // ═══════════════════════════════════════════════════════════════════════════════
  // PARTNER-LEVEL CLUSTERS (for reference/future)
  // ═══════════════════════════════════════════════════════════════════════════════

  "Deal Strategy, Risk Ownership & Structuring Judgment": {
    "Deal Strategy Development & Risk Ownership": [
      "Deal thesis articulation & strategic positioning",
      "Risk tolerance calibration & client alignment",
      "Value creation narrative & deal story",
      "Board/stakeholder risk presentation",
      "Go/no-go recommendation & escalation"
    ],
    "Deal Structuring & Risk Allocation Mastery": [
      "Alternative structure generation (asset/share, carve-out, JV)",
      "Locked-box vs completion accounts strategic selection",
      "Warranty/indemnity architecture design",
      "Seller-friendly vs buyer-friendly strategy",
      "Step-plan & pre-signing restructuring"
    ],
    "Due Diligence Scoping & Prioritization": [
      "Due diligence prioritization & materiality thresholds",
      "Risk-based scoping (red flag vs full DD)",
      "Integrating financial/tax/employment findings into deal terms",
      "DD report ownership & risk summary authorship",
      "Issue escalation & deal team alignment"
    ],
    "Regulatory & Antitrust Strategy Oversight": [
      "Antitrust strategy & remedy planning oversight",
      "FDI/national security exposure assessment",
      "Regulatory timeline integration into deal structure",
      "Authority relationship management",
      "Condition precedent design (approval risk)"
    ],
    "Cross-Border M&A Coordination & Multi-Jurisdictional Strategy": [
      "Local counsel selection & instruction",
      "Harmonizing closing mechanics across jurisdictions",
      "Managing translation, notarization, apostilles",
      "Multi-jurisdiction issue matrix & tracking",
      "Regulatory sequencing across geographies"
    ]
  },

  "Negotiation Leadership & Stakeholder Power Management": {
    "High-Stakes Negotiation Leadership": [
      "Leading principal-level negotiations",
      "Managing multi-party dynamics (sponsors, co-investors)",
      "Bridging commercial vs legal gaps",
      "Handling walk-away scenarios & brinkmanship",
      "Term sheet / MoU negotiation leadership"
    ],
    "Stakeholder Power Management (Board, Sponsors, Management, Lenders)": [
      "Managing sponsor/lender expectations",
      "Board reporting & governance alignment",
      "Management retention/incentive negotiation interface",
      "Seller management & trust-building",
      "Multi-party alignment in consortium deals"
    ],
    "Crisis Management & Client Escalation Handling": [
      "Managing deal-threatening issues",
      "Rapid response coordination (regulatory, media, legal)",
      "Client de-escalation & expectation reset",
      "Insurance & claims management interface",
      "Reputation protection & media coordination"
    ],
    "Dispute Avoidance & Deal-Edge Conflict Resolution": [
      "Purchase price dispute resolution (expert, arbitration)",
      "Breach/termination risk assessment",
      "Post-closing dispute prevention",
      "Claims process design & escrow release",
      "Earn-out dispute mitigation"
    ]
  },

  "Client Leadership, Origination & Relationship Strategy": {
    "Strategic Client Relationship Management & Cross-Selling": [
      "Handling sensitive conversations & fee disputes",
      "Cross-selling orchestration across practices",
      "Client issue spotting & proactive advice",
      "Managing expectations on scope/fees/timelines",
      "Value delivery cadence (QBRs, post-matter reviews)",
      "Stakeholder mapping (GC/CFO/board/in-house team)"
    ],
    "Client Origination & Business Development Execution": [
      "Referral cultivation (bankers, PE, accountants, boutiques)",
      "Strategic networking & relationship seeding",
      "CRM discipline (follow-ups, pipeline hygiene, conversion review)",
      "Thought leadership that converts (alerts, webinars, podcasts)",
      "Opportunity qualification & profitability screening",
      "Pitch development (problem diagnosis + ROI narrative)"
    ],
    "Client Panel & Procurement Navigation": [
      "Competitive tender strategy & differentiation",
      "Pricing grid strategy & rate architecture",
      "Diversity/ESG/tech capability positioning",
      "Panel relationship management & renewals",
      "Performance KPI reporting & scorecards",
      "RFP response leadership (narrative + evidence)"
    ],
    "Engagement Terms & Scope Control": [
      "Client onboarding & matter kickoff discipline",
      "Change control & scope creep management",
      "Assumptions & exclusions drafting",
      "Engagement letter negotiation (scope, limits, indemnities)",
      "Budget communication & variance explanation"
    ],
    "Thought Leadership Strategy & Reputation Building": [
      "Editorial calendar & themes tied to client pain",
      "Media engagement & quote readiness",
      "Authoring client-ready insights (not academic memos)",
      "Measuring content-to-pipeline conversion",
      "Speaking/panel participation strategy"
    ],
    "Client Experience Design & Service Model Tailoring": [
      "Client communication architecture (updates, escalation paths)",
      "Feedback loops & NPS-style measurement",
      "Client portal strategy & reporting formats",
      "Onboarding playbooks for new matters",
      "Service model selection (modular/unbundled/full-service)"
    ]
  },

  "Practice Management, Pricing & Delivery Standards": {
    "Alternative Fee Arrangement (AFA) Engineering & Pricing Strategy": [
      "Scope-based pricing design",
      "Risk/reward models (success fees, holdbacks)",
      "Fee estimation accuracy & variance analysis",
      "Pricing tool & benchmark utilization",
      "Profitability modeling per fee type"
    ],
    "Practice Profitability Management (PPEP, Leverage, Realization)": [
      "PPEP/realization analysis & intervention",
      "Leverage model optimization (senior/junior mix)",
      "Write-off prevention & root-cause analysis",
      "Billing discipline & WIP management",
      "Revenue forecasting & matter pipeline"
    ],
    "Legal Project Management (LPM) & Process Standardization": [
      "Matter scoping & checklist discipline",
      "Template selection & standardization",
      "Process mapping for recurring deal types",
      "SOP authorship & maintenance",
      "Lessons-learned capture & feedback loops"
    ],
    "Resourcing, Delegation & Matter Delivery Supervision": [
      "Resource allocation across matters",
      "Delegation matrix & decision rights",
      "Junior supervision & milestone review",
      "Escalation protocols",
      "Capacity planning & crunch-time management"
    ],
    "Quality Assurance, Sign-Off & Error Prevention": [
      "Senior review & sign-off protocols",
      "Error tracking & near-miss analysis",
      "Version control & document hygiene",
      "Risk flag identification & escalation",
      "Post-signing review discipline"
    ]
  },

  "Tech-Enabled Practice Strategy (AI adoption + controls + differentiation)": {
    "Legal Tech & AI Adoption Strategy (Partner Lens)": [
      "AI use-case prioritization for practice",
      "Change management & team buy-in",
      "Risk governance for new tools",
      "ROI evaluation & business-case development",
      "Pilot-to-scale roadmaps"
    ],
    "Vendor Evaluation & Procurement (AI and Legal Ops Tools)": [
      "Tool selection criteria & scoring",
      "Contract negotiation (SLA, data rights, exit)",
      "Security/compliance vetting",
      "Integration with existing tech stack",
      "Post-implementation performance monitoring"
    ],
    "Client Reporting, Dashboards & Transparency Infrastructure": [
      "KPI selection & reporting cadence",
      "Dashboard design for clients & partners",
      "Data quality & source integrity",
      "Automation of status updates",
      "Transparency as differentiation"
    ]
  },

  "Governance, Ethics & Regulatory Oversight (incl. AI)": {
    "AI Governance & Client Acceptability (EU-focused)": [
      "AI policy development for practice",
      "Client-specific AI use approvals",
      "EU AI Act practice implications",
      "Confidentiality & privilege in AI use",
      "AI output liability allocation"
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
    ],
    "Conflicts, Ethics & Professional Responsibility Oversight": [
      "Conflicts clearing & lateral hire vetting",
      "Chinese wall & information barrier enforcement",
      "Ethical issues escalation & bar referral",
      "Client confidentiality & privilege management",
      "Professional conduct training & culture"
    ],
    "Risk Management, Malpractice Prevention & Insurance Interface": [
      "Risk register maintenance",
      "Malpractice exposure identification",
      "Insurance notification protocols",
      "Claims management & defense coordination",
      "Post-incident learning & policy update"
    ],
    "Regulatory Horizon Scanning & Client-Facing Risk Updates": [
      "Regulatory change monitoring",
      "Client alert development",
      "Impact assessment for practice areas",
      "Proactive client communication",
      "Integration into deal playbooks"
    ]
  },

  "Talent Leadership (coaching, delegation, performance, culture)": {
    "Structured Talent Development & Mentoring": [
      "Career pathway design & communication",
      "Mentoring program oversight",
      "Training curriculum development",
      "Secondment & rotation planning",
      "Promotion readiness assessment"
    ],
    "Performance Management, Culture & Team Accountability": [
      "Performance review discipline & calibration",
      "Feedback culture & real-time coaching",
      "Underperformance intervention",
      "Culture modeling & values reinforcement",
      "Retention strategy & exit management"
    ]
  },

  "Knowledge & Quality Systems (playbooks, precedent modernization, QA)": {
    "Precedent & Playbook System Ownership": [
      "Precedent library governance",
      "Playbook authorship & version control",
      "Knowledge contribution incentives",
      "Cross-border precedent harmonization",
      "Retirement of outdated materials"
    ],
    "Document Automation & Clause Standardization Oversight": [
      "Clause bank curation",
      "Automation template ownership",
      "Exception handling & fallback drafting",
      "Quality audit for automated output",
      "Integration with DMS & intake systems"
    ],
    "Deal Data Capture & Lessons-Learned Loops": [
      "Post-deal debrief discipline",
      "Data capture for market intelligence",
      "Issue pattern recognition",
      "Playbook update triggers",
      "Benchmarking against peer deals"
    ]
  }
};

// Hilfsfunktion: Generiert den Kompetenz-Teil für den System Prompt
export function getCompetencySchemaForPrompt(): string {
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

// Hilfsfunktion: Alle Kompetenz-Namen als flache Liste
export function getAllCompetencyNames(): string[] {
  const names: string[] = [];

  for (const cluster of Object.values(COMPETENCY_SCHEMA)) {
    for (const competency of Object.keys(cluster)) {
      names.push(competency);
    }
  }

  return names;
}

// Hilfsfunktion: Alle Cluster-Namen
export function getAllClusterNames(): string[] {
  return Object.keys(COMPETENCY_SCHEMA);
}

// Hilfsfunktion: Validiere ob ein Kompetenz-Name existiert
export function validateCompetencyName(name: string): boolean {
  for (const cluster of Object.values(COMPETENCY_SCHEMA)) {
    if (Object.keys(cluster).includes(name)) {
      return true;
    }
  }
  return false;
}

// Hilfsfunktion: Finde Cluster für eine Kompetenz
export function getClusterForCompetency(competencyName: string): string | null {
  for (const [clusterName, competencies] of Object.entries(COMPETENCY_SCHEMA)) {
    if (Object.keys(competencies).includes(competencyName)) {
      return clusterName;
    }
  }
  return null;
}
