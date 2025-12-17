// Competencies with Sub-Skills based on the mapping CSV

export interface SubSkill {
  id: string;
  name: string;
  nameDE: string;
}

export interface Competency {
  id: string;
  name: string;
  primaryCompetency: string;
  subSkills: SubSkill[];
}

// Competencies mapped from skills_competencies_mapping.csv
export const competencies: Competency[] = [
  {
    id: "legal-analysis",
    name: "Legal Analysis",
    primaryCompetency: "1. TRANSAKTIONALE & RECHTLICHE EXPERTISE",
    subSkills: [
      { id: "la-1", name: "Contract Analysis & Review", nameDE: "1.2 Vertragsanalyse und -prüfung" },
      { id: "la-2", name: "Due Diligence Execution", nameDE: "1.1 Due Diligence Durchführung" },
      { id: "la-3", name: "Legal & Logical Analysis", nameDE: "6.1 Juristische & logische Analyse" },
      { id: "la-4", name: "Critical Thinking & Questioning", nameDE: "6.2 Kritisches Denken & Hinterfragen" },
    ],
  },
  {
    id: "contract-drafting",
    name: "Contract Drafting",
    primaryCompetency: "1. TRANSAKTIONALE & RECHTLICHE EXPERTISE",
    subSkills: [
      { id: "cd-1", name: "Contract Analysis & Review", nameDE: "1.2 Vertragsanalyse und -prüfung" },
      { id: "cd-2", name: "Written Communication & Documentation", nameDE: "2.2 Schriftliche Kommunikation & Dokumentation" },
      { id: "cd-3", name: "Quality Assurance & Attention to Detail", nameDE: "7.5 Qualitätssicherung & Detailgenauigkeit" },
      { id: "cd-4", name: "Risk Identification & Assessment", nameDE: "1.4 Risikoidentifikation und -bewertung" },
    ],
  },
  {
    id: "ma-structuring",
    name: "M&A Structuring",
    primaryCompetency: "4. BUSINESS & STRATEGISCHES DENKEN",
    subSkills: [
      { id: "ma-1", name: "Strategic Deal Structuring", nameDE: "4.3 Strategische Dealstrukturierung" },
      { id: "ma-2", name: "Transaction Structuring", nameDE: "1.3 Transaktionsstrukturierung" },
      { id: "ma-3", name: "Financial Analysis & Valuation", nameDE: "4.2 Finanzielle Analyse & Bewertung" },
      { id: "ma-4", name: "Creative Problem Solving", nameDE: "6.3 Kreative Problemlösung" },
    ],
  },
  {
    id: "client-communication",
    name: "Client Communication",
    primaryCompetency: "2. VERHANDLUNGS- & KOMMUNIKATIONSFÄHIGKEITEN",
    subSkills: [
      { id: "cc-1", name: "Stakeholder Engagement & Relationship Management", nameDE: "2.4 Stakeholder-Engagement & Beziehungsverwaltung" },
      { id: "cc-2", name: "Oral Presentation & Persuasion", nameDE: "2.3 Mündliche Präsentation & Überzeugung" },
      { id: "cc-3", name: "Empathy & Emotional Intelligence", nameDE: "2.5 Empathie & emotionale Intelligenz" },
      { id: "cc-4", name: "Business Development & Client Focus", nameDE: "4.4 Geschäftsentwicklung & Client-Zentrierung" },
    ],
  },
  {
    id: "commercial-awareness",
    name: "Commercial Awareness",
    primaryCompetency: "4. BUSINESS & STRATEGISCHES DENKEN",
    subSkills: [
      { id: "ca-1", name: "Business Case & Business Models", nameDE: "4.1 Business Case & Geschäftsmodelle verstehen" },
      { id: "ca-2", name: "Synergy Identification & Value Creation", nameDE: "4.5 Synergieidentifikation & Value Creation" },
      { id: "ca-3", name: "Financial Analysis & Valuation", nameDE: "4.2 Finanzielle Analyse & Bewertung" },
      { id: "ca-4", name: "Financing Understanding", nameDE: "1.5 Finanzierungsverständnis" },
    ],
  },
  {
    id: "team-leadership",
    name: "Team Leadership",
    primaryCompetency: "5. LEADERSHIP & TEAM MANAGEMENT",
    subSkills: [
      { id: "tl-1", name: "Team Leadership & Delegation", nameDE: "5.2 Teamführung & Delegation" },
      { id: "tl-2", name: "Employee Coaching & Development", nameDE: "5.1 Mitarbeiter-Coaching & Entwicklung" },
      { id: "tl-3", name: "Feedback Culture & Performance Management", nameDE: "5.3 Feedback-Kultur & Performance Management" },
      { id: "tl-4", name: "Stakeholder Engagement & Relationship Management", nameDE: "2.4 Stakeholder-Engagement & Beziehungsverwaltung" },
    ],
  },
  {
    id: "tech-legal-ops",
    name: "Tech / Legal Ops",
    primaryCompetency: "3. TECHNOLOGIE & DIGITAL INTELLIGENCE",
    subSkills: [
      { id: "to-1", name: "Legal Tech Tool Competence", nameDE: "3.1 Legal Tech Tool-Kompetenz" },
      { id: "to-2", name: "AI/ML Applications in Legal", nameDE: "3.2 AI/ML-Anwendungen im Legal" },
      { id: "to-3", name: "Data Management & Data Rooms", nameDE: "3.3 Datenmanagement & Datenräume" },
      { id: "to-4", name: "Time Management & Prioritization", nameDE: "7.3 Zeitmanagement & Priorisierung" },
    ],
  },
  {
    id: "time-management",
    name: "Time Management",
    primaryCompetency: "7. PROJEKT- & PROZESSMANAGEMENT",
    subSkills: [
      { id: "tm-1", name: "Time Management & Prioritization", nameDE: "7.3 Zeitmanagement & Priorisierung" },
      { id: "tm-2", name: "Transaction Planning & Milestones", nameDE: "7.1 Transaktionsplanung & Meilensteine" },
      { id: "tm-3", name: "Quality Assurance & Attention to Detail", nameDE: "7.5 Qualitätssicherung & Detailgenauigkeit" },
      { id: "tm-4", name: "Resource Allocation & Budgeting", nameDE: "7.2 Ressourcenallokation & Budgeting" },
    ],
  },
];

export function getCompetencyById(id: string): Competency | undefined {
  return competencies.find((c) => c.id === id);
}

// Generate sub-skill ratings for an employee based on their competency level
export function generateSubSkillRatings(
  competencyLevel: number,
  subSkillCount: number
): number[] {
  const ratings: number[] = [];
  for (let i = 0; i < subSkillCount; i++) {
    // Vary around the competency level by ±15%
    const variance = (Math.random() - 0.5) * 30;
    const rating = Math.max(5, Math.min(100, Math.round(competencyLevel + variance)));
    ratings.push(rating);
  }
  return ratings;
}
