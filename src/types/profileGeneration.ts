// Für die Dokument-Uploads
export interface UploadedDocuments {
  cv: File | null;
  selfAssessment: File | null;
  managerAssessment: File | null;
}

// Claude Response Struktur
export interface GeneratedProfile {
  extractedData: {
    source: {
      cvPresent: boolean;
      selfAssessmentPresent: boolean;
      managerAssessmentPresent: boolean;
      extractionQuality: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    employee: {
      name: string | null;
      currentRole: string;
      yearsAtCompany: number;
      totalYearsInBusiness: number;
      targetRole: string;
      gdprConsentGiven: boolean;
    };
    cvHighlights: {
      education: string[];
      certifications: string[];
      keyExperience: string[];
      toolProficiency: string[];
      languages: string[];
    };
  };
  competencyProfile: {
    role: string;
    assessmentDate: string;
    clusters: Array<{
      clusterName: string;
      competencies: Array<{
        name: string;
        rating: number | 'NB';
        confidence: 'HIGH' | 'MEDIUM' | 'LOW';
        selfRating: number | null;
        managerRating: number | null;
        evidenceSummary: string;
        subskills: Array<{
          name: string;
          rating: number | 'NB';
          evidence: string;
        }>;
      }>;
    }>;
  };
  analysis: {
    overallScore: number;
    topStrengths: Array<{
      competency: string;
      rating: number;
      evidence: string;
    }>;
    developmentAreas: Array<{
      competency: string;
      currentRating: number | 'NB';
      targetRating: number;
      gap: string;
      recommendation: string;
    }>;
    promotionReadiness: {
      targetRole: string;
      readinessPercentage: number;
      criticalGaps: string[];
      estimatedTimeline: string;
    };
  };
  compliance: {
    gdprConsentVerified: boolean;
    disclaimer: string;
  };
}
