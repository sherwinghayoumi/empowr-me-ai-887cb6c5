// SkillShift Mock Data for Corporate Law - London Office
import { getSkillLevel, type SkillLevel } from "@/lib/utils";

// Re-export for backwards compatibility
export { getSkillLevel, type SkillLevel } from "@/lib/utils";

export type SkillCategory = 
  | "Legal Core" 
  | "Business Acumen" 
  | "Technology" 
  | "Soft Skills";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  roleId: string;
  teamId: string;
  age: number;
  education: string;
  totalExperience: number;
  firmExperience: number;
  careerObjective: string;
  skills: {
    skillId: string;
    currentLevel: number;
    demandedLevel: number;
    futureLevel: number;
    level: SkillLevel;
  }[];
  overallScore: number;
  learningPaths: LearningPath[];
}

export interface LearningPath {
  id: string;
  title: string;
  targetSkillId: string;
  progress: number;
  modules: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface Team {
  id: string;
  name: string;
  leaderId: string;
  memberIds: string[];
  averageScore: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  level: "junior" | "mid" | "senior" | "counsel" | "specialist";
}

// Skills
export const skills: Skill[] = [
  { id: "legal-analysis", name: "Legal Analysis", category: "Legal Core" },
  { id: "contract-drafting", name: "Contract Drafting", category: "Legal Core" },
  { id: "ma-structuring", name: "M&A Structuring", category: "Legal Core" },
  { id: "client-communication", name: "Client Communication", category: "Soft Skills" },
  { id: "commercial-awareness", name: "Commercial Awareness", category: "Business Acumen" },
  { id: "team-leadership", name: "Team Leadership", category: "Soft Skills" },
  { id: "tech-legal-ops", name: "Tech / Legal Ops", category: "Technology" },
  { id: "time-management", name: "Time Management", category: "Soft Skills" },
];

// Roles
export const roles: Role[] = [
  { id: "junior-associate", name: "Junior Associate", description: "0-2 Jahre Erfahrung", level: "junior" },
  { id: "mid-level-associate", name: "Mid-Level Associate", description: "3-5 Jahre Erfahrung", level: "mid" },
  { id: "senior-associate", name: "Senior Associate", description: "5-8 Jahre Erfahrung", level: "senior" },
  { id: "counsel", name: "Counsel", description: "Senior Partner Track", level: "counsel" },
  { id: "legal-tech-associate", name: "Legal Tech Associate", description: "Legal Tech Spezialist", level: "specialist" },
];

// Helper to convert 1-5 scale to 0-100
function toPercent(val: number): number {
  return val * 20;
}

// Calculate overall score from skills
function calcOverall(skills: { currentLevel: number }[]): number {
  return Math.round(skills.reduce((sum, s) => sum + s.currentLevel, 0) / skills.length);
}

// All 32 Employees from London Corporate Law Talent Profiles PDF
export const employees: Employee[] = [
  // 1. Aisha Khan – Junior Associate
  {
    id: "emp-1",
    name: "Aisha Khan",
    email: "a.khan@firm.com",
    roleId: "junior-associate",
    teamId: "team-ma",
    age: 30,
    education: "LL.B / LL.M, University of Sydney (2024)",
    totalExperience: 7,
    firmExperience: 4,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [{ id: "lp-1", title: "M&A Structuring Fundamentals", targetSkillId: "ma-structuring", progress: 25, modules: [{ id: "m1", title: "Deal Structure Basics", completed: true }, { id: "m2", title: "Valuation Methods", completed: false }] }],
  },
  // 2. Daniel Okoye – Mid-Level Associate
  {
    id: "emp-2",
    name: "Daniel Okoye",
    email: "d.okoye@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-ma",
    age: 28,
    education: "LL.B / LL.M, University of Sydney (2009)",
    totalExperience: 5,
    firmExperience: 4,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(1)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [{ id: "lp-2", title: "Legal Tech Integration", targetSkillId: "tech-legal-ops", progress: 40, modules: [{ id: "m1", title: "AI in Contract Review", completed: true }, { id: "m2", title: "Document Management", completed: true }, { id: "m3", title: "Automation Tools", completed: false }] }],
  },
  // 3. Lucía Fernández – Junior Associate
  {
    id: "emp-3",
    name: "Lucía Fernández",
    email: "l.fernandez@firm.com",
    roleId: "junior-associate",
    teamId: "team-corporate",
    age: 40,
    education: "LL.B / LL.M, Sciences Po (2019)",
    totalExperience: 17,
    firmExperience: 8,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
  // 4. Ethan Brooks – Counsel
  {
    id: "emp-4",
    name: "Ethan Brooks",
    email: "e.brooks@firm.com",
    roleId: "counsel",
    teamId: "team-ma",
    age: 38,
    education: "LL.B / LL.M, Oxford University (2007)",
    totalExperience: 15,
    firmExperience: 7,
    careerObjective: "Equity Partner track or strategic leadership role",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "team-leadership", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 5. Noah Patel – Senior Associate
  {
    id: "emp-5",
    name: "Noah Patel",
    email: "n.patel@firm.com",
    roleId: "senior-associate",
    teamId: "team-ma",
    age: 44,
    education: "LL.B / LL.M, University of Sydney (2006)",
    totalExperience: 21,
    firmExperience: 4,
    careerObjective: "Advancement to Counsel and partial client ownership",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [{ id: "lp-5", title: "Team Leadership Excellence", targetSkillId: "team-leadership", progress: 60, modules: [{ id: "m1", title: "Delegation Skills", completed: true }, { id: "m2", title: "Conflict Resolution", completed: true }, { id: "m3", title: "Performance Coaching", completed: false }] }],
  },
  // 6. Amélie Dubois – Mid-Level Associate
  {
    id: "emp-6",
    name: "Amélie Dubois",
    email: "a.dubois@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-corporate",
    age: 29,
    education: "LL.B / LL.M, LSE (2021)",
    totalExperience: 6,
    firmExperience: 4,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(1)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 7. Jin Park – Senior Associate
  {
    id: "emp-7",
    name: "Jin Park",
    email: "j.park@firm.com",
    roleId: "senior-associate",
    teamId: "team-ma",
    age: 42,
    education: "LL.B / LL.M, NYU (2016)",
    totalExperience: 19,
    firmExperience: 10,
    careerObjective: "Advancement to Counsel and partial client ownership",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 8. Omar Haddad – Mid-Level Associate
  {
    id: "emp-8",
    name: "Omar Haddad",
    email: "o.haddad@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-corporate",
    age: 27,
    education: "LL.B / LL.M, King's College London (2009)",
    totalExperience: 4,
    firmExperience: 1,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 9. Sofia Rossi – Mid-Level Associate
  {
    id: "emp-9",
    name: "Sofia Rossi",
    email: "s.rossi@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-ma",
    age: 38,
    education: "LL.B / LL.M, University of Toronto (2009)",
    totalExperience: 15,
    firmExperience: 8,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 10. Mateo Alvarez – Legal Tech Associate
  {
    id: "emp-10",
    name: "Mateo Alvarez",
    email: "m.alvarez@firm.com",
    roleId: "legal-tech-associate",
    teamId: "team-tech",
    age: 33,
    education: "LL.B / LL.M, King's College London (2018)",
    totalExperience: 10,
    firmExperience: 4,
    careerObjective: "Build Legal Operations / Automation practice",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [{ id: "lp-10", title: "Client Communication Skills", targetSkillId: "client-communication", progress: 30, modules: [{ id: "m1", title: "Stakeholder Management", completed: true }, { id: "m2", title: "Presentation Skills", completed: false }] }],
  },
  // 11. Priya Nair – Junior Associate
  {
    id: "emp-11",
    name: "Priya Nair",
    email: "p.nair@firm.com",
    roleId: "junior-associate",
    teamId: "team-corporate",
    age: 32,
    education: "LL.B / LL.M, University of Sydney (2006)",
    totalExperience: 9,
    firmExperience: 9,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 12. James Wilson – Mid-Level Associate
  {
    id: "emp-12",
    name: "James Wilson",
    email: "j.wilson@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-ma",
    age: 40,
    education: "LL.B / LL.M, King's College London (2008)",
    totalExperience: 17,
    firmExperience: 9,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 13. Hannah Müller – Mid-Level Associate
  {
    id: "emp-13",
    name: "Hannah Müller",
    email: "h.mueller@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-corporate",
    age: 37,
    education: "LL.B / LL.M, LSE (2021)",
    totalExperience: 14,
    firmExperience: 8,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(1)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 14. Carlos Mendes – Legal Tech Associate
  {
    id: "emp-14",
    name: "Carlos Mendes",
    email: "c.mendes@firm.com",
    roleId: "legal-tech-associate",
    teamId: "team-tech",
    age: 48,
    education: "LL.B / LL.M, Sciences Po (2010)",
    totalExperience: 25,
    firmExperience: 5,
    careerObjective: "Build Legal Operations / Automation practice",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(2)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 15. Aya Nakamura – Legal Tech Associate
  {
    id: "emp-15",
    name: "Aya Nakamura",
    email: "a.nakamura@firm.com",
    roleId: "legal-tech-associate",
    teamId: "team-tech",
    age: 38,
    education: "LL.B / LL.M, Cambridge University (2017)",
    totalExperience: 15,
    firmExperience: 2,
    careerObjective: "Build Legal Operations / Automation practice",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(2)) },
      { skillId: "client-communication", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 16. Tomás Silva – Junior Associate
  {
    id: "emp-16",
    name: "Tomás Silva",
    email: "t.silva@firm.com",
    roleId: "junior-associate",
    teamId: "team-corporate",
    age: 43,
    education: "LL.B / LL.M, Oxford University (2020)",
    totalExperience: 20,
    firmExperience: 2,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(2)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(2), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(2)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [{ id: "lp-16", title: "Legal Analysis Deep Dive", targetSkillId: "legal-analysis", progress: 15, modules: [{ id: "m1", title: "Case Law Research", completed: true }, { id: "m2", title: "Statutory Interpretation", completed: false }] }],
  },
  // 17. Benjamin Cohen – Senior Associate
  {
    id: "emp-17",
    name: "Benjamin Cohen",
    email: "b.cohen@firm.com",
    roleId: "senior-associate",
    teamId: "team-ma",
    age: 36,
    education: "LL.B / LL.M, LSE (2009)",
    totalExperience: 13,
    firmExperience: 10,
    careerObjective: "Advancement to Counsel and partial client ownership",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 18. Rania El-Sayed – Legal Tech Associate
  {
    id: "emp-18",
    name: "Rania El-Sayed",
    email: "r.elsayed@firm.com",
    roleId: "legal-tech-associate",
    teamId: "team-tech",
    age: 39,
    education: "LL.B / LL.M, Sciences Po (2013)",
    totalExperience: 16,
    firmExperience: 1,
    careerObjective: "Build Legal Operations / Automation practice",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "contract-drafting", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 19. Leo Kowalski – Junior Associate
  {
    id: "emp-19",
    name: "Leo Kowalski",
    email: "l.kowalski@firm.com",
    roleId: "junior-associate",
    teamId: "team-ma",
    age: 31,
    education: "LL.B / LL.M, LSE (2010)",
    totalExperience: 8,
    firmExperience: 8,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "contract-drafting", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "ma-structuring", currentLevel: toPercent(3), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(3)) },
      { skillId: "client-communication", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(2), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(2)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
  // 20. Mai Nguyen – Counsel
  {
    id: "emp-20",
    name: "Mai Nguyen",
    email: "m.nguyen@firm.com",
    roleId: "counsel",
    teamId: "team-corporate",
    age: 47,
    education: "LL.B / LL.M, LSE (2020)",
    totalExperience: 24,
    firmExperience: 9,
    careerObjective: "Equity Partner track or strategic leadership role",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 21. Nikolai Petrov – Senior Associate
  {
    id: "emp-21",
    name: "Nikolai Petrov",
    email: "n.petrov@firm.com",
    roleId: "senior-associate",
    teamId: "team-ma",
    age: 43,
    education: "LL.B / LL.M, LSE (2013)",
    totalExperience: 20,
    firmExperience: 9,
    careerObjective: "Advancement to Counsel and partial client ownership",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 22. Fatima Zahra – Junior Associate
  {
    id: "emp-22",
    name: "Fatima Zahra",
    email: "f.zahra@firm.com",
    roleId: "junior-associate",
    teamId: "team-corporate",
    age: 48,
    education: "LL.B / LL.M, NYU (2018)",
    totalExperience: 25,
    firmExperience: 9,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(2)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
  // 23. Oliver Hart – Junior Associate
  {
    id: "emp-23",
    name: "Oliver Hart",
    email: "o.hart@firm.com",
    roleId: "junior-associate",
    teamId: "team-ma",
    age: 31,
    education: "LL.B / LL.M, Sciences Po (2006)",
    totalExperience: 8,
    firmExperience: 2,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(1)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
  // 24. Ibrahim Diop – Junior Associate
  {
    id: "emp-24",
    name: "Ibrahim Diop",
    email: "i.diop@firm.com",
    roleId: "junior-associate",
    teamId: "team-corporate",
    age: 34,
    education: "LL.B / LL.M, Sciences Po (2006)",
    totalExperience: 11,
    firmExperience: 10,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
  // 25. Elena Popescu – Senior Associate
  {
    id: "emp-25",
    name: "Elena Popescu",
    email: "e.popescu@firm.com",
    roleId: "senior-associate",
    teamId: "team-corporate",
    age: 31,
    education: "LL.B / LL.M, King's College London (2011)",
    totalExperience: 8,
    firmExperience: 3,
    careerObjective: "Advancement to Counsel and partial client ownership",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 26. Ryan O'Connor – Counsel
  {
    id: "emp-26",
    name: "Ryan O'Connor",
    email: "r.oconnor@firm.com",
    roleId: "counsel",
    teamId: "team-ma",
    age: 28,
    education: "LL.B / LL.M, NYU (2016)",
    totalExperience: 5,
    firmExperience: 5,
    careerObjective: "Equity Partner track or strategic leadership role",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "team-leadership", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 27. Sara Svensson – Mid-Level Associate
  {
    id: "emp-27",
    name: "Sara Svensson",
    email: "s.svensson@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-corporate",
    age: 46,
    education: "LL.B / LL.M, University of Toronto (2024)",
    totalExperience: 23,
    firmExperience: 7,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
  // 28. Yusuf Demir – Counsel
  {
    id: "emp-28",
    name: "Yusuf Demir",
    email: "y.demir@firm.com",
    roleId: "counsel",
    teamId: "team-corporate",
    age: 37,
    education: "LL.B / LL.M, Sciences Po (2013)",
    totalExperience: 14,
    firmExperience: 8,
    careerObjective: "Equity Partner track or strategic leadership role",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 29. Chinedu Okafor – Senior Associate
  {
    id: "emp-29",
    name: "Chinedu Okafor",
    email: "c.okafor@firm.com",
    roleId: "senior-associate",
    teamId: "team-ma",
    age: 38,
    education: "LL.B / LL.M, Sciences Po (2005)",
    totalExperience: 15,
    firmExperience: 10,
    careerObjective: "Advancement to Counsel and partial client ownership",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "contract-drafting", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "ma-structuring", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "team-leadership", currentLevel: toPercent(5), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "time-management", currentLevel: toPercent(5), demandedLevel: toPercent(5), futureLevel: toPercent(5), level: getSkillLevel(toPercent(5)) },
    ],
    learningPaths: [],
  },
  // 30. Valentina Bianchi – Mid-Level Associate
  {
    id: "emp-30",
    name: "Valentina Bianchi",
    email: "v.bianchi@firm.com",
    roleId: "mid-level-associate",
    teamId: "team-ma",
    age: 37,
    education: "LL.B / LL.M, Oxford University (2007)",
    totalExperience: 14,
    firmExperience: 7,
    careerObjective: "Transition to Senior Associate with deal lead responsibility",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "client-communication", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(4), futureLevel: toPercent(5), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 31. Adam Lewin – Junior Associate
  {
    id: "emp-31",
    name: "Adam Lewin",
    email: "a.lewin@firm.com",
    roleId: "junior-associate",
    teamId: "team-ma",
    age: 30,
    education: "LL.B / LL.M, Oxford University (2019)",
    totalExperience: 7,
    firmExperience: 2,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(2), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "contract-drafting", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
    ],
    learningPaths: [],
  },
  // 32. Mina Shafi – Junior Associate
  {
    id: "emp-32",
    name: "Mina Shafi",
    email: "m.shafi@firm.com",
    roleId: "junior-associate",
    teamId: "team-corporate",
    age: 46,
    education: "LL.B / LL.M, University of Toronto (2013)",
    totalExperience: 23,
    firmExperience: 8,
    careerObjective: "Promotion to Mid-Level Associate within 2–3 years",
    overallScore: 0,
    skills: [
      { skillId: "legal-analysis", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "contract-drafting", currentLevel: toPercent(4), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(4)) },
      { skillId: "ma-structuring", currentLevel: toPercent(1), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(1)) },
      { skillId: "client-communication", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
      { skillId: "commercial-awareness", currentLevel: toPercent(3), demandedLevel: toPercent(2), futureLevel: toPercent(3), level: getSkillLevel(toPercent(3)) },
      { skillId: "team-leadership", currentLevel: toPercent(1), demandedLevel: toPercent(1), futureLevel: toPercent(2), level: getSkillLevel(toPercent(1)) },
      { skillId: "tech-legal-ops", currentLevel: toPercent(2), demandedLevel: toPercent(2), futureLevel: toPercent(4), level: getSkillLevel(toPercent(2)) },
      { skillId: "time-management", currentLevel: toPercent(3), demandedLevel: toPercent(3), futureLevel: toPercent(4), level: getSkillLevel(toPercent(3)) },
    ],
    learningPaths: [],
  },
];

// Calculate overall scores
employees.forEach(emp => {
  emp.overallScore = calcOverall(emp.skills);
});

// Teams - Updated with all employees
export const teams: Team[] = [
  { 
    id: "team-ma", 
    name: "M&A Practice Group", 
    leaderId: "emp-4", 
    memberIds: ["emp-1", "emp-2", "emp-5", "emp-7", "emp-9", "emp-12", "emp-17", "emp-19", "emp-21", "emp-23", "emp-26", "emp-29", "emp-30", "emp-31"], 
    averageScore: 0
  },
  { 
    id: "team-corporate", 
    name: "Corporate Advisory", 
    leaderId: "emp-20", 
    memberIds: ["emp-3", "emp-6", "emp-8", "emp-11", "emp-13", "emp-16", "emp-22", "emp-24", "emp-25", "emp-27", "emp-28", "emp-32"], 
    averageScore: 0
  },
  { 
    id: "team-tech", 
    name: "Legal Tech & Innovation", 
    leaderId: "emp-10", 
    memberIds: ["emp-14", "emp-15", "emp-18"], 
    averageScore: 0
  },
];

// Calculate team averages
teams.forEach(team => {
  const allMembers = [...team.memberIds, team.leaderId];
  const teamEmployees = employees.filter(e => allMembers.includes(e.id));
  team.averageScore = Math.round(teamEmployees.reduce((sum, e) => sum + e.overallScore, 0) / teamEmployees.length);
});

// Role-Skill Templates
export const roleSkillTemplates: Record<string, { skillId: string; currentBenchmark: number; futureBenchmark: number }[]> = {
  "junior-associate": [
    { skillId: "legal-analysis", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "contract-drafting", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "ma-structuring", currentBenchmark: 40, futureBenchmark: 60 },
    { skillId: "client-communication", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "commercial-awareness", currentBenchmark: 40, futureBenchmark: 60 },
    { skillId: "team-leadership", currentBenchmark: 20, futureBenchmark: 40 },
    { skillId: "tech-legal-ops", currentBenchmark: 40, futureBenchmark: 80 },
    { skillId: "time-management", currentBenchmark: 60, futureBenchmark: 80 },
  ],
  "mid-level-associate": [
    { skillId: "legal-analysis", currentBenchmark: 80, futureBenchmark: 100 },
    { skillId: "contract-drafting", currentBenchmark: 80, futureBenchmark: 100 },
    { skillId: "ma-structuring", currentBenchmark: 80, futureBenchmark: 100 },
    { skillId: "client-communication", currentBenchmark: 80, futureBenchmark: 100 },
    { skillId: "commercial-awareness", currentBenchmark: 80, futureBenchmark: 100 },
    { skillId: "team-leadership", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "tech-legal-ops", currentBenchmark: 40, futureBenchmark: 80 },
    { skillId: "time-management", currentBenchmark: 80, futureBenchmark: 100 },
  ],
  "senior-associate": [
    { skillId: "legal-analysis", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "contract-drafting", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "ma-structuring", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "client-communication", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "commercial-awareness", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "team-leadership", currentBenchmark: 80, futureBenchmark: 100 },
    { skillId: "tech-legal-ops", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "time-management", currentBenchmark: 100, futureBenchmark: 100 },
  ],
  "counsel": [
    { skillId: "legal-analysis", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "contract-drafting", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "ma-structuring", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "client-communication", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "commercial-awareness", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "team-leadership", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "tech-legal-ops", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "time-management", currentBenchmark: 100, futureBenchmark: 100 },
  ],
  "legal-tech-associate": [
    { skillId: "legal-analysis", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "contract-drafting", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "ma-structuring", currentBenchmark: 40, futureBenchmark: 60 },
    { skillId: "client-communication", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "commercial-awareness", currentBenchmark: 60, futureBenchmark: 80 },
    { skillId: "team-leadership", currentBenchmark: 40, futureBenchmark: 60 },
    { skillId: "tech-legal-ops", currentBenchmark: 100, futureBenchmark: 100 },
    { skillId: "time-management", currentBenchmark: 80, futureBenchmark: 100 },
  ],
};

// Default employee for employee login
export const DEFAULT_EMPLOYEE_ID = "emp-2";

// Helper functions
export function getEmployeeById(id: string): Employee | undefined {
  return employees.find(e => e.id === id);
}

export function getRoleById(id: string): Role | undefined {
  return roles.find(r => r.id === id);
}

export function getTeamById(id: string): Team | undefined {
  return teams.find(t => t.id === id);
}

export function getSkillById(id: string): Skill | undefined {
  return skills.find(s => s.id === id);
}

export function getEmployeesByTeam(teamId: string): Employee[] {
  return employees.filter(e => e.teamId === teamId);
}

export function getEmployeesByRole(roleId: string): Employee[] {
  return employees.filter(e => e.roleId === roleId);
}

export function calculateTeamAverage(teamId: string): number {
  const teamEmployees = getEmployeesByTeam(teamId);
  if (teamEmployees.length === 0) return 0;
  return Math.round(teamEmployees.reduce((sum, e) => sum + e.overallScore, 0) / teamEmployees.length);
}

export function getSkillGaps(employee: Employee): { skillId: string; gap: number; skillName: string }[] {
  return employee.skills
    .map(s => {
      const gap = s.demandedLevel - s.currentLevel;
      const skill = getSkillById(s.skillId);
      return { skillId: s.skillId, gap, skillName: skill?.name || s.skillId };
    })
    .filter(g => g.gap > 0)
    .sort((a, b) => b.gap - a.gap);
}
