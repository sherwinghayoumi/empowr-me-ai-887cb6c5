// Mock certification recommendations for skill gap closure

export interface Certification {
  id: string;
  name: string;
  provider: string;
  description: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  format: "Online" | "In-Person" | "Hybrid";
  url: string;
  relevantCompetencies: string[];
}

export const certifications: Certification[] = [
  // Legal Core Certifications
  {
    id: "cert-1",
    name: "Certified M&A Specialist (CMAS)",
    provider: "M&A Leadership Council",
    description: "Comprehensive certification covering deal structuring, valuation methods, and post-merger integration strategies for legal professionals.",
    duration: "6 months",
    level: "Advanced",
    format: "Hybrid",
    url: "https://www.maleadershipcouncil.com/certifications",
    relevantCompetencies: ["ma-structuring", "commercial-awareness"],
  },
  {
    id: "cert-2",
    name: "Contract Management Professional (CMP)",
    provider: "National Contract Management Association (NCMA)",
    description: "Industry-recognized certification for contract lifecycle management, negotiation, and compliance.",
    duration: "4 months",
    level: "Intermediate",
    format: "Online",
    url: "https://www.ncmahq.org/certification",
    relevantCompetencies: ["contract-drafting", "legal-analysis"],
  },
  {
    id: "cert-3",
    name: "Certified Commercial Contracts Manager (CCCM)",
    provider: "NCMA",
    description: "Advanced certification focusing on complex commercial contract structures and risk management.",
    duration: "6 months",
    level: "Advanced",
    format: "Hybrid",
    url: "https://www.ncmahq.org/certification/cccm",
    relevantCompetencies: ["contract-drafting", "commercial-awareness"],
  },
  
  // Business Acumen Certifications
  {
    id: "cert-4",
    name: "Financial Modeling & Valuation Analyst (FMVA)",
    provider: "Corporate Finance Institute (CFI)",
    description: "Master financial modeling, valuation techniques, and business analysis essential for M&A transactions.",
    duration: "3-6 months",
    level: "Intermediate",
    format: "Online",
    url: "https://corporatefinanceinstitute.com/certifications/fmva/",
    relevantCompetencies: ["commercial-awareness", "ma-structuring"],
  },
  {
    id: "cert-5",
    name: "Chartered Financial Analyst (CFA) Level I",
    provider: "CFA Institute",
    description: "Gold-standard certification for investment and financial analysis fundamentals.",
    duration: "6-12 months",
    level: "Advanced",
    format: "Online",
    url: "https://www.cfainstitute.org/en/programs/cfa",
    relevantCompetencies: ["commercial-awareness", "ma-structuring"],
  },
  
  // Technology Certifications
  {
    id: "cert-6",
    name: "Legal Technology Core Competencies Certification",
    provider: "ILTANET (International Legal Technology Association)",
    description: "Foundational certification covering legal technology tools, AI applications, and digital transformation.",
    duration: "2 months",
    level: "Beginner",
    format: "Online",
    url: "https://www.iltanet.org/education",
    relevantCompetencies: ["tech-legal-ops"],
  },
  {
    id: "cert-7",
    name: "Certified E-Discovery Specialist (CEDS)",
    provider: "ACEDS",
    description: "Comprehensive certification for electronic discovery processes, data management, and legal technology.",
    duration: "3 months",
    level: "Intermediate",
    format: "Online",
    url: "https://aceds.org/certification/",
    relevantCompetencies: ["tech-legal-ops", "legal-analysis"],
  },
  {
    id: "cert-8",
    name: "AI for Law Certificate",
    provider: "Stanford Law School",
    description: "Executive education program on AI applications in legal practice, including contract analysis and due diligence automation.",
    duration: "8 weeks",
    level: "Intermediate",
    format: "Online",
    url: "https://law.stanford.edu/codex-the-stanford-center-for-legal-informatics/",
    relevantCompetencies: ["tech-legal-ops", "legal-analysis"],
  },
  
  // Soft Skills & Leadership Certifications
  {
    id: "cert-9",
    name: "Certified Professional in Leadership (CPL)",
    provider: "Institute of Leadership & Management (ILM)",
    description: "Practical leadership certification covering team management, delegation, and performance coaching.",
    duration: "4 months",
    level: "Intermediate",
    format: "Hybrid",
    url: "https://www.i-l-m.com/",
    relevantCompetencies: ["team-leadership"],
  },
  {
    id: "cert-10",
    name: "Executive Leadership Program",
    provider: "Harvard Business School Online",
    description: "Premium executive education program for senior leadership development and strategic thinking.",
    duration: "8 weeks",
    level: "Expert",
    format: "Online",
    url: "https://online.hbs.edu/courses/leadership-principles/",
    relevantCompetencies: ["team-leadership", "client-communication"],
  },
  {
    id: "cert-11",
    name: "Professional Certified Coach (PCC)",
    provider: "International Coaching Federation (ICF)",
    description: "Gold-standard coaching certification for developing team members and providing effective feedback.",
    duration: "6-12 months",
    level: "Advanced",
    format: "Hybrid",
    url: "https://coachingfederation.org/credentials-and-standards/pcc-paths",
    relevantCompetencies: ["team-leadership", "client-communication"],
  },
  
  // Communication Certifications
  {
    id: "cert-12",
    name: "Strategic Communication Professional Certification",
    provider: "International Association of Business Communicators (IABC)",
    description: "Advanced certification for stakeholder management, persuasive communication, and client relationship building.",
    duration: "4 months",
    level: "Intermediate",
    format: "Online",
    url: "https://www.iabc.com/certification/",
    relevantCompetencies: ["client-communication"],
  },
  {
    id: "cert-13",
    name: "Negotiation Mastery",
    provider: "Harvard Law School (PON)",
    description: "Premier negotiation program from Harvard's Program on Negotiation, covering advanced negotiation strategies.",
    duration: "8 weeks",
    level: "Advanced",
    format: "Online",
    url: "https://www.pon.harvard.edu/executive-education/",
    relevantCompetencies: ["client-communication", "ma-structuring"],
  },
  
  // Project & Time Management
  {
    id: "cert-14",
    name: "Project Management Professional (PMP)",
    provider: "Project Management Institute (PMI)",
    description: "Industry-standard certification for project planning, execution, and time management.",
    duration: "3-6 months",
    level: "Intermediate",
    format: "Online",
    url: "https://www.pmi.org/certifications/project-management-pmp",
    relevantCompetencies: ["time-management"],
  },
  {
    id: "cert-15",
    name: "Certified Associate in Project Management (CAPM)",
    provider: "Project Management Institute (PMI)",
    description: "Entry-level project management certification covering fundamentals of scheduling, resource allocation, and prioritization.",
    duration: "2-3 months",
    level: "Beginner",
    format: "Online",
    url: "https://www.pmi.org/certifications/capm",
    relevantCompetencies: ["time-management"],
  },
];

// Get certifications relevant to a specific competency
export function getCertificationsForCompetency(competencyId: string): Certification[] {
  return certifications.filter((cert) =>
    cert.relevantCompetencies.includes(competencyId)
  );
}

// Get the best certification recommendation based on skill gap severity
export function getRecommendedCertification(
  competencyId: string,
  gapSeverity: "critical" | "high" | "moderate"
): Certification | undefined {
  const relevantCerts = getCertificationsForCompetency(competencyId);
  
  if (relevantCerts.length === 0) return undefined;
  
  // For critical gaps, prefer beginner/intermediate level
  // For moderate gaps, prefer intermediate/advanced
  const preferredLevels: Record<string, string[]> = {
    critical: ["Beginner", "Intermediate"],
    high: ["Intermediate", "Advanced"],
    moderate: ["Advanced", "Expert"],
  };
  
  const preferred = preferredLevels[gapSeverity];
  const sorted = relevantCerts.sort((a, b) => {
    const aMatch = preferred.includes(a.level) ? 0 : 1;
    const bMatch = preferred.includes(b.level) ? 0 : 1;
    return aMatch - bMatch;
  });
  
  return sorted[0];
}
