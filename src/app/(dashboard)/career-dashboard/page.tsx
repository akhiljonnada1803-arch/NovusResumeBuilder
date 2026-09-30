"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  CareerIntelligenceReport,
  LearningRecommendation,
} from "@/types/career";
import {
  CareerAnalyticsSummary,
  TimeRangeFilter,
  MonthlyCareerReport,
} from "@/types/analytics";
import { computeCareerAnalytics, generateMonthlyCareerReport } from "@/lib/analytics/analytics-service";
import { AnalyticsKpiGrid } from "@/components/analytics/AnalyticsKpiGrid";
import { ResumeAnalyticsWidget } from "@/components/analytics/ResumeAnalyticsWidget";
import { PortfolioTrafficWidget } from "@/components/analytics/PortfolioTrafficWidget";
import { GitHubAnalyticsWidget } from "@/components/analytics/GitHubAnalyticsWidget";
import { LinkedInAnalyticsWidget } from "@/components/analytics/LinkedInAnalyticsWidget";
import { MonthlyReportModal } from "@/components/analytics/MonthlyReportModal";
import {
  TrendingUp,
  Compass,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  DollarSign,
  Briefcase,
  Layers,
  Code2,
  BookOpen,
  Check,
  Plus,
  RefreshCw,
  Loader2,
  ChevronRight,
  ExternalLink,
  Target,
  Clock,
  Flame,
  User,
  Zap,
  Activity,
  BarChart3,
  Calendar,
  FileText,
} from "lucide-react";

export default function CareerDashboardPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const addSkill = useResumeStore((state) => state.addSkill);

  const selectedResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const [selectedResumeId, setSelectedResumeId] = useState(selectedResume?.id || "");
  const currentResume = resumes.find((r) => r.id === selectedResumeId) || selectedResume;

  // Tabs: "analytics" (new Career Analytics Dashboard) vs "intelligence" (AI Trajectory Hub)
  const [activeDashboardTab, setActiveDashboardTab] = useState<"analytics" | "intelligence">("analytics");
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>("30d");

  // Analytics State
  const [analyticsSummary, setAnalyticsSummary] = useState<CareerAnalyticsSummary>(() =>
    computeCareerAnalytics(currentResume, "30d")
  );
  const [monthlyReport, setMonthlyReport] = useState<MonthlyCareerReport | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Intelligence State
  const [targetRole, setTargetRole] = useState(
    currentResume?.personalInfo?.jobTitle?.toLowerCase().includes("student")
      ? "AI Systems Engineer"
      : "Principal AI Architect"
  );
  const [intelligenceReport, setIntelligenceReport] = useState<CareerIntelligenceReport | null>(null);
  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [activePathStep, setActivePathStep] = useState<number>(2);

  // Update analytics when time range or resume changes
  useEffect(() => {
    const summary = computeCareerAnalytics(
      currentResume,
      timeRange,
      currentResume?.personalInfo?.github ? currentResume.personalInfo.github.split("/").pop() : "alexrivera"
    );
    setAnalyticsSummary(summary);
  }, [timeRange, selectedResumeId]);

  const fetchCareerIntelligence = async () => {
    if (!currentResume) return;
    setIsLoadingIntelligence(true);

    try {
      const res = await fetch("/api/career/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: currentResume,
          targetRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze career data.");

      setIntelligenceReport(data.report);
      success("Career Intelligence updated!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to compute career report.");
    } finally {
      setIsLoadingIntelligence(false);
    }
  };

  useEffect(() => {
    fetchCareerIntelligence();
  }, [selectedResumeId]);

  const handleOpenMonthlyReport = () => {
    const report = generateMonthlyCareerReport(
      currentResume?.personalInfo?.fullName || "Candidate",
      currentResume?.personalInfo?.jobTitle || "Senior Software Engineer",
      analyticsSummary
    );
    setMonthlyReport(report);
    setIsReportModalOpen(true);
  };

  const handleAddSkillToResume = (skill: LearningRecommendation) => {
    addSkill({
      name: skill.skillName,
      category: skill.category === "AI & ML" ? "Technical" : (skill.category as any),
      level: "Intermediate",
    });
    success(`Added "${skill.skillName}" to your active resume!`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              Career Analytics & Intelligence Platform
            </h1>
            <p className="text-xs text-muted-foreground">
              Real-time telemetry across Resume downloads, Portfolio visitors, GitHub velocity, and LinkedIn reach.
            </p>
          </div>
        </div>

        {/* Global Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Resume Profile Selector */}
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-hidden max-w-[180px]"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>

          {/* Monthly Report Button */}
          <Button
            size="sm"
            variant="radiant"
            onClick={handleOpenMonthlyReport}
            className="h-8 text-xs gap-1.5 font-bold shadow-xs"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Monthly Report</span>
          </Button>
        </div>
      </div>

      {/* Main Module Tabs (SaaS Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/40 p-1.5 rounded-2xl border border-border">
        <div className="grid grid-cols-2 gap-1 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveDashboardTab("analytics")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "analytics"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 className="w-4 h-4 text-primary" />
            <span>Multi-Channel Telemetry & Analytics</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveDashboardTab("intelligence")}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "intelligence"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Compass className="w-4 h-4 text-blue-500" />
            <span>AI Trajectory & Market Benchmark</span>
          </button>
        </div>

        {/* Time Range Filter (For Analytics Tab) */}
        {activeDashboardTab === "analytics" && (
          <div className="flex items-center gap-1 bg-card p-1 rounded-xl border border-border text-xs">
            {(["7d", "30d", "90d", "1y"] as TimeRangeFilter[]).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] font-semibold transition-all cursor-pointer ${
                  timeRange === range
                    ? "bg-primary text-primary-foreground font-bold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CAREER ANALYTICS & TELEMETRY MODULES */}
      {/* ========================================================================= */}
      {activeDashboardTab === "analytics" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* ⚠️ Demo Data Disclaimer */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/8 text-amber-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            <div className="text-xs space-y-0.5">
              <p className="font-semibold text-amber-200">Illustrative demo data</p>
              <p className="text-amber-400/80">
                These analytics are generated locally from your resume content — not from real tracking. Real portfolio visitor counts, recruiter clicks, and GitHub metrics require connecting live data sources (coming in v1.2).
              </p>
            </div>
          </div>

          {/* Top 4 KPI Metric Cards */}
          <AnalyticsKpiGrid summary={analyticsSummary} />

          {/* Module 1 & 2: Resume Analytics and Portfolio Analytics (Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResumeAnalyticsWidget metrics={analyticsSummary.resume} />
            <PortfolioTrafficWidget metrics={analyticsSummary.portfolio} />
          </div>

          {/* Module 3 & 4: GitHub Engineering and LinkedIn Reach (Grid) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GitHubAnalyticsWidget metrics={analyticsSummary.github} />
            <LinkedInAnalyticsWidget metrics={analyticsSummary.linkedin} />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AI CAREER INTELLIGENCE & TRAJECTORY HUB */}
      {/* ========================================================================= */}
      {activeDashboardTab === "intelligence" && intelligenceReport && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Health Score & Salary Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Health Score Gauge (4 cols) */}
            <div className="lg:col-span-4 p-6 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Career Health Benchmark
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  {intelligenceReport.healthScore.tier}
                </span>
              </div>

              <div className="flex items-center gap-6 my-auto">
                <div className="w-24 h-24 rounded-full border-4 border-emerald-500/80 bg-emerald-500/10 flex flex-col items-center justify-center shrink-0 shadow-lg">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                    {intelligenceReport.healthScore.overall}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-muted-foreground">/ 100</span>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground">Top {100 - intelligenceReport.healthScore.percentile}% Percentile</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Outperforms {intelligenceReport.healthScore.percentile}% of peer candidates for {intelligenceReport.targetRole}.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-xs pt-3 border-t border-border/60">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Resume & ATS Strength</span>
                    <span className="font-mono font-semibold text-foreground">{intelligenceReport.healthScore.breakdown.resumeStrength}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${intelligenceReport.healthScore.breakdown.resumeStrength}%` }} />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>GitHub Code Velocity</span>
                    <span className="font-mono font-semibold text-foreground">{intelligenceReport.healthScore.breakdown.githubVelocity}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${intelligenceReport.healthScore.breakdown.githubVelocity}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Summary & Compensation Grid (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  Strategic Takeaway & Market Positioning
                </div>
                <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed font-sans">
                  {intelligenceReport.executiveSummary}
                </p>
              </div>

              {/* Salary Insights Projections Grid */}
              <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      Market Compensation Trajectory ({intelligenceReport.salaryInsight.currency})
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Comparing {intelligenceReport.salaryInsight.currentRole} vs {intelligenceReport.salaryInsight.targetRole} compensation bands.
                    </p>
                  </div>

                  <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 w-fit">
                    +{intelligenceReport.salaryInsight.projectedGainPercentage}% Projected Growth
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 rounded-xl border border-border bg-secondary/30">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">25th Percentile</span>
                    <span className="text-base font-bold font-mono text-foreground">
                      ${(intelligenceReport.salaryInsight.percentile25 / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-primary/40 bg-card shadow-2xs">
                    <span className="text-[10px] text-primary uppercase font-bold block">Market Median (50th)</span>
                    <span className="text-base font-bold font-mono text-primary">
                      ${(intelligenceReport.salaryInsight.percentile50 / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-secondary/30">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">75th Percentile</span>
                    <span className="text-base font-bold font-mono text-foreground">
                      ${(intelligenceReport.salaryInsight.percentile75 / 1000).toFixed(0)}k
                    </span>
                  </div>

                  <div className="p-3 rounded-xl border border-border bg-secondary/30">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Top 10% Tier</span>
                    <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
                      ${(intelligenceReport.salaryInsight.percentile90 / 1000).toFixed(0)}k+
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Career Progression Roadmap */}
          <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Visual Career Progression Roadmap
                </h2>
                <p className="text-xs text-muted-foreground">
                  Step-by-step career path milestones, technical prerequisites, and transition projects.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {intelligenceReport.careerPaths.map((step) => (
                <div
                  key={step.step}
                  onClick={() => setActivePathStep(step.step)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 flex flex-col justify-between ${
                    step.isTarget
                      ? "border-primary/60 bg-gradient-to-br from-card via-card to-primary/5 shadow-md"
                      : "border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 shadow-2xs"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                        Milestone 0{step.step}
                      </span>
                      <span className="text-[11px] font-bold text-primary">{step.timeframe}</span>
                    </div>

                    <h3 className="font-bold text-base text-foreground">{step.roleTitle}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">
                        Required Tech Stack:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {step.requiredSkills.map((sk, i) => (
                          <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-foreground">
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/60 text-[11px]">
                      <span className="font-semibold text-foreground block mb-0.5">🚀 Transition Project:</span>
                      <span className="text-muted-foreground">{step.transitionProject}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Monthly Report Modal */}
      <MonthlyReportModal
        open={isReportModalOpen}
        onOpenChange={setIsReportModalOpen}
        report={monthlyReport}
      />
    </div>
  );
}
