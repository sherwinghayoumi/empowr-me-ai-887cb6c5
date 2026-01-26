export type LearningLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
export type LearningFormat = 'Online' | 'In-Person' | 'Hybrid' | 'Self-Paced';

export interface LearningRecommendation {
  title: string;
  provider: string;
  description: string;
  contentUrl: string | null;
  durationMinutes: number;
  level: LearningLevel;
  format: LearningFormat;
  reason: string;
  sortOrder: number;
}

export interface GeneratedLearningPath {
  title: string;
  description: string;
  totalDurationMinutes: number;
  aiRecommendationReason: string;
  modules: LearningRecommendation[];
}

export interface SkillGapInput {
  competencyId: string;
  competencyName: string;
  competencyDefinition?: string;
  subskills?: { name: string; currentLevel: number }[];
  currentLevel: number;
  targetLevel: number;
  employeeId: string;
  employeeName: string;
  employeeRole?: string;
  employeeExperience?: number;
}

export interface SaveLearningPathParams {
  employeeId: string;
  competencyId: string;
  learningPath: GeneratedLearningPath;
}
