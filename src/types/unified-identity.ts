import { Resume, ExperienceItem, EducationItem, SkillItem, CertificationItem, ProjectItem } from "./resume";
import { ParsedLinkedInProfile } from "@/lib/integrations/linkedin/linkedin-parser";

export type IdentityPlatform = "linkedin" | "resume" | "portfolio";

export interface IdentityProfileSectionScore {
  name: string;
  score: number; // 0 - 100
  weight: number; // weight percentage
  status: "complete" | "partial" | "missing";
  missingItems: string[];
  recommendation: string;
}

export interface ProfileCompletenessReport {
  overallScore: number; // 0 - 100
  tier: "Elite (90%+)" | "Strong (75-89%)" | "Developing (50-74%)" | "Needs Attention (<50%)";
  sections: {
    personalInfo: IdentityProfileSectionScore;
    headline: IdentityProfileSectionScore;
    about: IdentityProfileSectionScore;
    experience: IdentityProfileSectionScore;
    education: IdentityProfileSectionScore;
    certifications: IdentityProfileSectionScore;
    skills: IdentityProfileSectionScore;
    portfolioProjects: IdentityProfileSectionScore;
  };
  missingSections: string[];
  criticalFixes: string[];
}

export interface CareerInsightMetric {
  title: string;
  score: number; // 0 - 100
  status: "high" | "moderate" | "growth";
  insight: string;
  recommendation: string;
}

export interface CareerInsightsReport {
  recruiterDiscoverabilityScore: number;
  seniorityLevel: "Junior / Entry" | "Mid-Level Engineer" | "Senior Engineer" | "Staff / Principal Lead";
  marketAlignmentScore: number;
  topKeywords: { keyword: string; density: number; category: string }[];
  missingHighValueKeywords: string[];
  metrics: CareerInsightMetric[];
}

export interface IdentityFieldConflict {
  id: string;
  field: string;
  label: string;
  section: "personalInfo" | "experience" | "education" | "skills" | "certifications" | "projects";
  linkedinValue?: string;
  resumeValue?: string;
  portfolioValue?: string;
  selectedResolution: IdentityPlatform | "merge";
}

export interface IdentitySyncHistoryEntry {
  id: string;
  timestamp: string;
  source: IdentityPlatform;
  target: IdentityPlatform | "all";
  status: "success" | "conflicts_resolved" | "partial";
  fieldsChanged: string[];
  conflictsResolvedCount: number;
  summary: string;
}

export interface UnifiedIdentityState {
  linkedinProfile?: ParsedLinkedInProfile;
  resume?: Resume;
  lastSyncedAt?: string;
  syncHistory: IdentitySyncHistoryEntry[];
  completeness: ProfileCompletenessReport;
  careerInsights: CareerInsightsReport;
}
