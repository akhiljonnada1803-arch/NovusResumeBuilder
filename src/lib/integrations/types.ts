/**
 * Unified Integration System Types
 * Scalable architecture supporting GitHub, LeetCode, LinkedIn, HackerRank, Medium, and Google Scholar.
 */

export type IntegrationPlatform =
  | "github"
  | "leetcode"
  | "linkedin"
  | "hackerrank"
  | "medium"
  | "scholar";

export interface IntegrationAccount {
  platform: IntegrationPlatform;
  username: string;
  connectedAt: string;
  avatarUrl?: string;
  profileUrl?: string;
  lastSyncedAt?: string;
  status: "connected" | "syncing" | "error" | "disconnected";
  meta?: Record<string, any>;
}

export interface DeveloperScoreBreakdown {
  projectQualityScore: number; // 0 - 100
  openSourceScore: number; // 0 - 100
  activityScore: number; // 0 - 100
  compositeScore: number; // 0 - 100
  tier: "Elite Lead / Staff" | "Senior Engineer" | "Proficient Builder" | "Emerging Developer";
}

export interface ContributionStats {
  totalRepos: number;
  totalStars: number;
  totalForks: number;
  totalCommits?: number;
  topLanguages: { name: string; percentage: number; color?: string }[];
  streakDays?: number;
  rankingScore?: number;
  developerScores?: DeveloperScoreBreakdown;
}

export interface RepositoryItem {
  id: number | string;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  homepageUrl?: string | null;
  stars: number;
  forks: number;
  openIssues?: number;
  primaryLanguage: string | null;
  languages: { [name: string]: number };
  topics: string[];
  isFork: boolean;
  isArchived: boolean;
  isPrivate?: boolean;
  hasReadme: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  qualityScore: number; // 0 - 100 calculated benchmark
  qualityBreakdown: {
    documentation: number;
    activity: number;
    popularity: number;
    completeness: number;
  };
}

export interface ExtractedProject {
  title: string;
  subtitle: string;
  description: string;
  resumeDescription?: string;
  portfolioDescription?: string;
  highlights: string[];
  keyAchievements?: string[];
  technologies: string[];
  liveUrl?: string;
  githubUrl: string;
  stars: number;
  qualityScore: number;
}

export type DeveloperSkillCategory =
  | "Languages"
  | "Frameworks"
  | "Databases"
  | "DevOps Tools"
  | "Cloud Platforms"
  | "Technical"
  | "Soft Skills"
  | "Other";

export interface ExtractedSkill {
  name: string;
  category: DeveloperSkillCategory;
  proficiency: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  evidence: string; // e.g. "Primary language across 6 repositories"
}

export interface IntegrationProvider<TConfig = any> {
  platform: IntegrationPlatform;
  name: string;
  description: string;
  iconName: string;
  isAvailable: boolean;
  fetchProfile: (config: TConfig) => Promise<{ username: string; stats: ContributionStats }>;
  fetchRepositories?: (config: TConfig) => Promise<RepositoryItem[]>;
}
