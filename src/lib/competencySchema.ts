// Vollständiges Kompetenz-Schema für alle Rollen

// WICHTIG: Diese Namen müssen EXAKT mit der Supabase competencies Tabelle übereinstimmen!

export const COMPETENCY_SCHEMA: Record<string, Record<string, string[]>> = {
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
