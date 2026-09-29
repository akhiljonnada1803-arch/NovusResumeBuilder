import {
  Resume,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
} from "./resume";
import { UncertainField, SectionConfidenceScores } from "./import";

export type PortfolioImportSourceType =
  | "url"
  | "github"
  | "zip"
  | "html_snippet"
  | "react_project"
  | "nextjs_project";

export type DetectedProjectType =
  | "Static HTML/CSS/JS Site"
  | "React Project"
  | "Next.js Project"
  | "Astro Site"
  | "Vue / Nuxt Site"
  | "Custom Web Application";

export interface RawPortfolioSourceMeta {
  sourceType: PortfolioImportSourceType;
  sourceIdentifier: string;
  detectedFramework?: string;
  projectType?: DetectedProjectType;
  filesScanned?: number;
  pageTitle?: string;
  previewUrl?: string;
  scrapedAt?: string;
}

export interface ExtractedSocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
  website?: string;
  email?: string;
  phone?: string;
  portfolio?: string;
}

export interface ExtractedPortfolioData {
  personalInfo: Partial<PersonalInfo>;
  projects: Omit<ProjectItem, "id">[];
  skills: Omit<SkillItem, "id">[];
  experience: Omit<ExperienceItem, "id">[];
  education: Omit<EducationItem, "id">[];
  certifications: Omit<CertificationItem, "id">[];
  achievements: Omit<AchievementItem, "id">[];
  socialLinks: ExtractedSocialLinks;
  rawSourceMeta: RawPortfolioSourceMeta;
  confidenceScore: number;
  sectionConfidenceScores?: SectionConfidenceScores;
  uncertainFields: UncertainField[];
}

export interface PortfolioImportResult {
  success: boolean;
  data?: ExtractedPortfolioData;
  error?: string;
  warning?: string;
}

export interface PortfolioMergeSelection {
  personalInfo: boolean;
  projects: boolean;
  skills: boolean;
  experience: boolean;
  education: boolean;
  certifications: boolean;
  achievements: boolean;
}
