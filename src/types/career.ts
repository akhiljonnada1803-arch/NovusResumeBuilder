export interface CareerHealthScore {
  overall: number; // 0 - 100
  tier: "Top 5% Elite" | "Industry Ready / Strong" | "High Growth Potential" | "Foundational Stage";
  percentile: number; // e.g. 92
  breakdown: {
    resumeStrength: number; // 0 - 100
    githubVelocity: number; // 0 - 100
    skillModernity: number; // 0 - 100
    careerTrajectory: number; // 0 - 100
  };
}

export interface SalaryInsight {
  currentRole: string;
  currentEstimatedMedian: number;
  targetRole: string;
  targetEstimatedMedian: number;
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  projectedGainPercentage: number;
  currency: string;
  marketDemand: "Extremely High" | "High" | "Moderate";
}

export interface CareerPathStep {
  step: number;
  roleTitle: string;
  timeframe: string; // e.g. "Current", "6 - 12 Months", "2 - 3 Years"
  description: string;
  requiredSkills: string[];
  transitionProject: string;
  isCurrent?: boolean;
  isTarget?: boolean;
}

export interface LearningRecommendation {
  id: string;
  skillName: string;
  category: "AI & ML" | "Distributed Systems" | "Frontend Architecture" | "DevOps & Cloud" | "System Design";
  priority: "Critical (Must-Have)" | "High Value" | "Recommended";
  estimatedHours: number;
  rationale: string;
  suggestedProject: string;
}

export interface CertificationRecommendation {
  id: string;
  name: string;
  issuer: string;
  valueRating: "Top Tier ROI" | "Industry Standard" | "Specialized";
  estimatedPrepTime: string;
  credentialUrl?: string;
  relevance: string;
}

export interface CareerIntelligenceReport {
  generatedAt: string;
  currentRole: string;
  targetRole: string;
  executiveSummary: string;
  healthScore: CareerHealthScore;
  salaryInsight: SalaryInsight;
  careerPaths: CareerPathStep[];
  missingSkills: LearningRecommendation[];
  certifications: CertificationRecommendation[];
}
