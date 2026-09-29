import { PortfolioTheme, PortfolioSectionConfig } from "./portfolio";

export type DeploymentStatus = "draft" | "publishing" | "live" | "paused";

export type DomainStatus = "pending" | "verified" | "failed" | "unconfigured";

export interface CustomDomainConfig {
  domain: string;
  status: DomainStatus;
  cnameRecord: {
    type: "CNAME";
    host: string;
    value: string;
    status: "valid" | "invalid" | "pending";
  };
  txtRecord: {
    type: "TXT";
    host: string;
    value: string;
    status: "valid" | "invalid" | "pending";
  };
  sslActive: boolean;
  verifiedAt?: string;
}

export interface PortfolioDeployment {
  id: string;
  resumeId: string;
  subdomain: string; // e.g. "alexrivera" -> alexrivera.novusresume.ai
  customDomain?: CustomDomainConfig;
  status: DeploymentStatus;
  theme: PortfolioTheme;
  sectionsConfig: PortfolioSectionConfig[];
  publishedAt?: string;
  updatedAt: string;
  sslActive: boolean;
  seoSettings?: {
    metaTitle?: string;
    metaDescription?: string;
    ogImage?: string;
    indexingAllowed: boolean;
  };
}

export type AnalyticsEventType =
  | "page_view"
  | "resume_download"
  | "contact_click"
  | "project_click"
  | "github_click";

export interface PortfolioAnalyticsEvent {
  id: string;
  resumeId: string;
  eventType: AnalyticsEventType;
  path: string;
  referrer: string;
  country: string;
  city?: string;
  device: "desktop" | "mobile" | "tablet";
  timestamp: string;
}

export interface PortfolioAnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  resumeDownloads: number;
  contactInquiries: number;
  conversionRate: number; // percentage
  topReferrers: { source: string; count: number; percentage: number }[];
  topCountries: { country: string; code: string; count: number; flag: string }[];
  viewsOverTime: { date: string; views: number; downloads: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
}
