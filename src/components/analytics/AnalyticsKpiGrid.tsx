"use client";

import React from "react";
import { CareerAnalyticsSummary } from "@/types/analytics";
import {
  TrendingUp,
  Users,
  Eye,
  FileDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface AnalyticsKpiGridProps {
  summary: CareerAnalyticsSummary;
}

export function AnalyticsKpiGrid({ summary }: AnalyticsKpiGridProps) {
  const { overview, resume, portfolio, linkedin, github } = summary;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Career Reach Score */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Career Reach Score
          </span>
          <span className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Zap className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black font-mono text-foreground">
              {overview.careerReachScore}
            </span>
            <span className="text-xs text-muted-foreground font-semibold">/ 100</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{overview.reachScoreDelta}% this month</span>
          </div>
        </div>

        <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${overview.careerReachScore}%` }}
          />
        </div>
      </div>

      {/* KPI 2: Total Career Engagements */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Total Engagements
          </span>
          <span className="p-2 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Users className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-3xl font-black font-mono text-foreground">
            {overview.totalEngagements.toLocaleString()}
          </span>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{overview.engagementsGrowth}% vs prior period</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Combined resume views, web visits, and profile opens.
        </p>
      </div>

      {/* KPI 3: Portfolio Traffic */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Portfolio Pageviews
          </span>
          <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Eye className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-3xl font-black font-mono text-foreground">
            {portfolio.pageViews.toLocaleString()}
          </span>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{portfolio.pageViewsGrowth}% unique visits</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Avg. dwell time: <strong>{Math.floor(portfolio.avgTimeOnPageSeconds / 60)}m {portfolio.avgTimeOnPageSeconds % 60}s</strong>
        </p>
      </div>

      {/* KPI 4: Recruiter Conversion Rate */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-3 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Recruiter Conversion
          </span>
          <span className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
            <Target className="w-4 h-4" />
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-3xl font-black font-mono text-foreground">
            {overview.recruiterInterestRate}%
          </span>

          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{overview.recruiterInterestDelta}% inquiry surge</span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground">
          {linkedin.recruiterInquiriesCount} verified recruiter leads this period.
        </p>
      </div>
    </div>
  );
}
