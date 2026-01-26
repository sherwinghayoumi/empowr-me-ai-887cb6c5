export interface CertificateAnalysis {
  documentType: 'CERTIFICATE' | 'DEGREE' | 'TRAINING' | 'AWARD' | 'LANGUAGE' | 'OTHER';
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate: string | null;
  level: string | null;
  field: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface RatingChange {
  cluster: string;
  competency: string;
  oldRating: number;
  newRating: number;
  change: string;
  justification: string;
}

export interface CertificateUpdateResult {
  documentAnalysis: CertificateAnalysis;
  isRelevant: boolean;
  relevanceReason: string;
  ratingChanges: RatingChange[];
  overallScoreChange: {
    oldScore: number;
    newScore: number;
    change: string;
  };
  warnings: string[];
}
