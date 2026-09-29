import {
  CareerAnalyticsSummary,
  TimeRangeFilter,
  ResumeAnalyticsMetrics,
  PortfolioAnalyticsMetrics,
  GitHubAnalyticsMetrics,
  LinkedInAnalyticsMetrics,
  MonthlyCareerReport,
  TimeSeriesPoint,
} from "@/types/analytics";
import { Resume } from "@/types/resume";

/**
 * Computes date range bounds and labels for a time range filter.
 */
export function generateTimeSeriesPoints(range: TimeRangeFilter, baseMultiplier = 1.0): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const count = range === "7d" ? 7 : range === "30d" ? 15 : range === "90d" ? 12 : 12;
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date();
    if (range === "7d") {
      d.setDate(now.getDate() - i);
    } else if (range === "30d") {
      d.setDate(now.getDate() - i * 2);
    } else if (range === "90d") {
      d.setDate(now.getDate() - i * 7.5);
    } else {
      d.setMonth(now.getMonth() - i);
    }

    const dateStr = d.toISOString().split("T")[0];
    const label =
      range === "7d"
        ? d.toLocaleDateString("en-US", { weekday: "short" })
        : range === "1y" || range === "all"
        ? d.toLocaleDateString("en-US", { month: "short" })
        : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    // Realistic trend progression with positive growth momentum
    const progress = (count - i) / count;
    const wave = Math.sin((count - i) * 0.8) * 4;
    const value = Math.max(1, Math.round((12 + progress * 24 + wave) * baseMultiplier));
    const secondaryValue = Math.max(1, Math.round(value * (0.6 + (i % 3) * 0.1)));

    points.push({
      date: dateStr,
      label,
      value,
      secondaryValue,
    });
  }

  return points;
}

/**
 * Generates unified career analytics for a candidate profile.
 */
export function computeCareerAnalytics(
  resume?: Resume | null,
  timeRange: TimeRangeFilter = "30d",
  githubUsername = "alexrivera",
  isLinkedInConnected = true
): CareerAnalyticsSummary {
  const rangeMultiplier = timeRange === "7d" ? 0.3 : timeRange === "30d" ? 1.0 : timeRange === "90d" ? 2.6 : 8.5;

  // 1. Resume Metrics
  const totalDownloads = Math.round(48 * rangeMultiplier);
  const pdfDownloads = Math.round(totalDownloads * 0.72);
  const docxDownloads = Math.round(totalDownloads * 0.22);
  const txtDownloads = totalDownloads - pdfDownloads - docxDownloads;

  const totalExports = Math.round(29 * rangeMultiplier);
  const jsonExports = Math.round(totalExports * 0.45);
  const mdExports = Math.round(totalExports * 0.38);
  const latexExports = totalExports - jsonExports - mdExports;

  const totalShares = Math.round(112 * rangeMultiplier);
  const liveLinkViews = Math.round(totalShares * 0.65);
  const recruiterClicks = Math.round(totalShares * 0.28);
  const directQrScans = totalShares - liveLinkViews - recruiterClicks;

  const resumeMetrics: ResumeAnalyticsMetrics = {
    totalDownloads,
    downloadsGrowth: 18.4,
    downloadsBreakdown: { pdf: pdfDownloads, docx: docxDownloads, txt: txtDownloads },
    totalExports,
    exportsGrowth: 24.1,
    exportsBreakdown: { json: jsonExports, markdown: mdExports, latex: latexExports },
    totalShares,
    sharesGrowth: 32.5,
    sharesBreakdown: { liveLinkViews, recruiterClicks, directQrScans },
    timeSeries: generateTimeSeriesPoints(timeRange, 1.2),
  };

  // 2. Portfolio Traffic Metrics
  const totalVisitors = Math.round(420 * rangeMultiplier);
  const uniqueVisitors = Math.round(totalVisitors * 0.76);
  const pageViews = Math.round(totalVisitors * 2.4);

  const portfolioMetrics: PortfolioAnalyticsMetrics = {
    totalVisitors,
    visitorsGrowth: 28.6,
    uniqueVisitors,
    uniqueVisitorsGrowth: 22.3,
    pageViews,
    pageViewsGrowth: 34.2,
    avgTimeOnPageSeconds: 142,
    bounceRatePercentage: 34.8,
    topReferrers: [
      { source: "Google Search", visitors: Math.round(totalVisitors * 0.38), percentage: 38, iconName: "Search" },
      { source: "LinkedIn Direct", visitors: Math.round(totalVisitors * 0.26), percentage: 26, iconName: "Linkedin" },
      { source: "GitHub Profile", visitors: Math.round(totalVisitors * 0.21), percentage: 21, iconName: "Github" },
      { source: "Twitter / X", visitors: Math.round(totalVisitors * 0.09), percentage: 9, iconName: "Twitter" },
      { source: "Direct / Other", visitors: Math.round(totalVisitors * 0.06), percentage: 6, iconName: "Globe" },
    ],
    deviceBreakdown: [
      { device: "Desktop", percentage: 68, count: Math.round(totalVisitors * 0.68) },
      { device: "Mobile", percentage: 28, count: Math.round(totalVisitors * 0.28) },
      { device: "Tablet", percentage: 4, count: Math.round(totalVisitors * 0.04) },
    ],
    topSectionsVisited: [
      { section: "Featured Projects", views: Math.round(pageViews * 0.42), percentage: 42 },
      { section: "Experience & History", views: Math.round(pageViews * 0.28), percentage: 28 },
      { section: "Skill Taxonomies", views: Math.round(pageViews * 0.18), percentage: 18 },
      { section: "Contact & Socials", views: Math.round(pageViews * 0.12), percentage: 12 },
    ],
    timeSeries: generateTimeSeriesPoints(timeRange, 2.5),
  };

  // 3. GitHub Metrics
  const githubMetrics: GitHubAnalyticsMetrics = {
    username: githubUsername || "alexrivera",
    totalRepos: 28,
    totalStars: 184,
    starsGrowth: 14.8,
    totalForks: 42,
    totalContributionsLastYear: 894,
    contributionsGrowth: 31.2,
    topLanguages: [
      { language: "TypeScript", percentage: 46.5, linesOfCode: 128400, color: "#3178c6" },
      { language: "Python", percentage: 24.2, linesOfCode: 66800, color: "#3572A5" },
      { language: "Rust", percentage: 14.8, linesOfCode: 40900, color: "#dea584" },
      { language: "Go", percentage: 8.5, linesOfCode: 23500, color: "#00ADD8" },
      { language: "CSS / Tailwind", percentage: 6.0, linesOfCode: 16500, color: "#38bdf8" },
    ],
    recentActivity: [
      {
        repoName: "distributed-agent-runtime",
        action: "commit",
        timestamp: "2 hours ago",
        description: "Optimized worker concurrency pool and latency benchmarks.",
      },
      {
        repoName: "vector-search-engine",
        action: "star",
        timestamp: "1 day ago",
        description: "Received 8 new stars from Product Hunt showcase.",
      },
      {
        repoName: "nextjs-portfolio-starter",
        action: "pr",
        timestamp: "3 days ago",
        description: "Merged PR #14: Added Dark mode and responsive navigation.",
      },
    ],
    monthlyCommitSeries: generateTimeSeriesPoints(timeRange, 1.8),
  };

  // 4. LinkedIn Metrics
  const linkedinMetrics: LinkedInAnalyticsMetrics = {
    connected: isLinkedInConnected,
    profileViews: Math.round(186 * rangeMultiplier),
    profileViewsGrowth: 21.4,
    searchAppearances: Math.round(340 * rangeMultiplier),
    searchAppearancesGrowth: 17.8,
    connectionsCount: 1420,
    connectionsGrowth: 8.4,
    endorsementsCount: 78,
    topSearchKeywords: [
      { keyword: "Senior Full Stack Engineer", count: 86 },
      { keyword: "AI Systems Architect", count: 64 },
      { keyword: "Next.js & TypeScript Specialist", count: 48 },
      { keyword: "Cloud Platform Engineer", count: 32 },
    ],
    recruiterInquiriesCount: Math.round(14 * rangeMultiplier),
  };

  // Unified Overview
  const careerReachScore = 88;
  const totalEngagements = totalDownloads + totalShares + totalVisitors + linkedinMetrics.profileViews;

  return {
    timeRange,
    overview: {
      careerReachScore,
      reachScoreDelta: 6.4,
      totalEngagements,
      engagementsGrowth: 27.8,
      recruiterInterestRate: 18.2,
      recruiterInterestDelta: 4.1,
    },
    resume: resumeMetrics,
    portfolio: portfolioMetrics,
    github: githubMetrics,
    linkedin: linkedinMetrics,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Synthesizes a structured Executive Monthly Career Performance Report.
 */
export function generateMonthlyCareerReport(
  candidateName = "Alex Rivera",
  targetRole = "Senior AI Systems Engineer",
  summary?: CareerAnalyticsSummary
): MonthlyCareerReport {
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();

  return {
    id: `rep_${now.getFullYear()}_${now.getMonth() + 1}`,
    month: monthName,
    year,
    candidateName,
    targetRole,
    overallScore: 89,
    scoreChange: +5,
    executiveSummary: `During ${monthName} ${year}, your overall career reach and recruiter visibility expanded by +27.8% MoM. Your portfolio traffic saw high engagement from Google and LinkedIn direct searches, with strong demand for your AI Systems and TypeScript showcases. Recruiter inquiry rates increased to an all-time high of 18.2%.`,
    kpiSummary: {
      resumeDownloads: summary?.resume.totalDownloads || 48,
      portfolioVisitors: summary?.portfolio.totalVisitors || 420,
      githubContributions: summary?.github.totalContributionsLastYear || 894,
      recruiterLeads: summary?.linkedin.recruiterInquiriesCount || 14,
    },
    topPerformingAssets: [
      {
        name: "Developer Pro Portfolio (Vercel)",
        type: "Portfolio",
        metricLabel: "Pageviews",
        metricValue: "1,008 views (+34.2%)",
      },
      {
        name: `${candidateName} – Senior AI Engineer.pdf`,
        type: "Resume",
        metricLabel: "Downloads & Views",
        metricValue: "160 total engagements",
      },
      {
        name: "distributed-agent-runtime",
        type: "Repository",
        metricLabel: "Stars & Forks",
        metricValue: "184 Stars • 42 Forks",
      },
    ],
    recruiterSignals: [
      {
        signal: "Executive Search Surge",
        impact: "High",
        detail: "340+ appearances in recruiter searches for 'AI Systems Architect' and 'Senior Full Stack Engineer'.",
      },
      {
        signal: "High Portfolio Dwell Time",
        impact: "Positive",
        detail: "Average dwell time of 2m 22s on your featured project architectures indicates deep recruiter review.",
      },
      {
        signal: "Multi-Language Velocity",
        impact: "Positive",
        detail: "Heavy TypeScript & Rust commit density positions profile in the top 8% of active open-source contributors.",
      },
    ],
    recommendedActions: [
      "Pin your highest-starred repository ('distributed-agent-runtime') to your primary ATS resume header.",
      "Add 1 live interactive demo link to your second featured project to increase portfolio conversion.",
      "Update LinkedIn headline to include 'AI Systems & Cloud Architecture' to match top recruiter query keywords.",
    ],
    generatedAt: new Date().toISOString(),
  };
}
