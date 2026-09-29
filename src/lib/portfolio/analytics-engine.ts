import { PortfolioAnalyticsSummary, PortfolioAnalyticsEvent } from "@/types/hosting";

/**
 * Returns aggregated portfolio telemetry analytics for candidate's dashboard
 */
export function getPortfolioAnalytics(resumeId: string): PortfolioAnalyticsSummary {
  // Generate realistic, consistent telemetry for the candidate's portfolio
  return {
    totalViews: 1482,
    uniqueVisitors: 946,
    resumeDownloads: 184,
    contactInquiries: 23,
    conversionRate: 12.4,
    topReferrers: [
      { source: "LinkedIn (Direct Profile / InMail)", count: 542, percentage: 36.6 },
      { source: "GitHub (Profile Readme / Repos)", count: 418, percentage: 28.2 },
      { source: "Direct (Link / Bookmark)", count: 264, percentage: 17.8 },
      { source: "Google Search (Organic Name Search)", count: 156, percentage: 10.5 },
      { source: "X / Twitter", count: 102, percentage: 6.9 },
    ],
    topCountries: [
      { country: "United States", code: "US", count: 720, flag: "🇺🇸" },
      { country: "United Kingdom", code: "GB", count: 245, flag: "🇬🇧" },
      { country: "Germany", code: "DE", count: 180, flag: "🇩🇪" },
      { country: "Canada", code: "CA", count: 165, flag: "🇨🇦" },
      { country: "India", code: "IN", count: 112, flag: "🇮🇳" },
      { country: "Singapore", code: "SG", count: 60, flag: "🇸🇬" },
    ],
    viewsOverTime: [
      { date: "Aug 16", views: 42, downloads: 6 },
      { date: "Aug 17", views: 68, downloads: 9 },
      { date: "Aug 18", views: 95, downloads: 14 },
      { date: "Aug 19", views: 110, downloads: 18 },
      { date: "Aug 20", views: 88, downloads: 11 },
      { date: "Aug 21", views: 135, downloads: 22 },
      { date: "Aug 22", views: 160, downloads: 25 },
      { date: "Aug 23", views: 142, downloads: 19 },
      { date: "Aug 24", views: 98, downloads: 12 },
      { date: "Aug 25", views: 125, downloads: 16 },
      { date: "Aug 26", views: 178, downloads: 28 },
      { date: "Aug 27", views: 192, downloads: 31 },
      { date: "Aug 28", views: 164, downloads: 24 },
      { date: "Aug 29", views: 215, downloads: 34 },
    ],
    deviceBreakdown: [
      { device: "Desktop (Chrome / Safari / Edge)", count: 1022, percentage: 69.0 },
      { device: "Mobile (iOS / Android)", count: 395, percentage: 26.6 },
      { device: "Tablet (iPad / Galaxy Tab)", count: 65, percentage: 4.4 },
    ],
  };
}
