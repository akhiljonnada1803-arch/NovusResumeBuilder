export type TimeRangeFilter = "7d" | "30d" | "90d" | "1y" | "all";

export interface TimeSeriesPoint {
  date: string;
  label: string;
  value: number;
  secondaryValue?: number;
}

export interface ReferrerMetric {
  source: string;
  visitors: number;
  percentage: number;
  iconName?: string;
}

export interface DeviceBreakdown {
  device: "Desktop" | "Mobile" | "Tablet" | "Other";
  percentage: number;
  count: number;
}

export interface LanguageMetric {
  language: string;
  percentage: number;
  linesOfCode?: number;
  color: string;
}

// 1. Resume Analytics Metrics
export interface ResumeAnalyticsMetrics {
  totalDownloads: number;
  downloadsGrowth: number; // percentage change vs previous period
  downloadsBreakdown: {
    pdf: number;
    docx: number;
    txt: number;
  };
  totalExports: number;
  exportsGrowth: number;
  exportsBreakdown: {
    json: number;
    markdown: number;
    latex: number;
  };
  totalShares: number;
  sharesGrowth: number;
  sharesBreakdown: {
    liveLinkViews: number;
    recruiterClicks: number;
    directQrScans: number;
  };
  timeSeries: TimeSeriesPoint[];
}

// 2. Portfolio Analytics Metrics
export interface PortfolioAnalyticsMetrics {
  totalVisitors: number;
  visitorsGrowth: number;
  uniqueVisitors: number;
  uniqueVisitorsGrowth: number;
  pageViews: number;
  pageViewsGrowth: number;
  avgTimeOnPageSeconds: number;
  bounceRatePercentage: number;
  topReferrers: ReferrerMetric[];
  deviceBreakdown: DeviceBreakdown[];
  topSectionsVisited: { section: string; views: number; percentage: number }[];
  timeSeries: TimeSeriesPoint[];
}

// 3. GitHub Analytics Metrics
export interface GitHubAnalyticsMetrics {
  username: string;
  totalRepos: number;
  totalStars: number;
  starsGrowth: number;
  totalForks: number;
  totalContributionsLastYear: number;
  contributionsGrowth: number;
  topLanguages: LanguageMetric[];
  recentActivity: {
    repoName: string;
    action: "commit" | "star" | "fork" | "pr";
    timestamp: string;
    description: string;
  }[];
  monthlyCommitSeries: TimeSeriesPoint[];
}

// 4. LinkedIn Analytics Metrics
export interface LinkedInAnalyticsMetrics {
  connected: boolean;
  profileViews: number;
  profileViewsGrowth: number;
  searchAppearances: number;
  searchAppearancesGrowth: number;
  connectionsCount: number;
  connectionsGrowth: number;
  endorsementsCount: number;
  topSearchKeywords: { keyword: string; count: number }[];
  recruiterInquiriesCount: number;
}

// Unified Career Analytics Payload
export interface CareerAnalyticsSummary {
  timeRange: TimeRangeFilter;
  overview: {
    careerReachScore: number; // 0 - 100 aggregate reach
    reachScoreDelta: number;
    totalEngagements: number;
    engagementsGrowth: number;
    recruiterInterestRate: number; // percentage
    recruiterInterestDelta: number;
  };
  resume: ResumeAnalyticsMetrics;
  portfolio: PortfolioAnalyticsMetrics;
  github: GitHubAnalyticsMetrics;
  linkedin: LinkedInAnalyticsMetrics;
  lastUpdated: string;
}

// Monthly Executive Report Structure
export interface MonthlyCareerReport {
  id: string;
  month: string;
  year: number;
  candidateName: string;
  targetRole: string;
  overallScore: number;
  scoreChange: number;
  executiveSummary: string;
  kpiSummary: {
    resumeDownloads: number;
    portfolioVisitors: number;
    githubContributions: number;
    recruiterLeads: number;
  };
  topPerformingAssets: {
    name: string;
    type: "Resume" | "Portfolio" | "Repository" | "Project";
    metricLabel: string;
    metricValue: string;
  }[];
  recruiterSignals: {
    signal: string;
    impact: "High" | "Medium" | "Positive";
    detail: string;
  }[];
  recommendedActions: string[];
  generatedAt: string;
}
