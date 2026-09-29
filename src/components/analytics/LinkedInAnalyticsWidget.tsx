"use client";

import React from "react";
import { LinkedInAnalyticsMetrics } from "@/types/analytics";
import {
  Users,
  Eye,
  Search,
  Award,
  ArrowUpRight,
  TrendingUp,
  MailCheck,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { LinkedinIcon } from "@/components/shared/icons";

interface LinkedInAnalyticsWidgetProps {
  metrics: LinkedInAnalyticsMetrics;
}

export function LinkedInAnalyticsWidget({ metrics }: LinkedInAnalyticsWidgetProps) {
  const { profileViews, profileViewsGrowth, searchAppearances, searchAppearancesGrowth, connectionsCount, endorsementsCount, topSearchKeywords, recruiterInquiriesCount } = metrics;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/10 text-blue-600 border border-blue-600/20">
            <LinkedinIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">LinkedIn Recruiter & Search Reach</h2>
            <p className="text-xs text-muted-foreground">
              Imported signals from recruiter search queries and candidate profile impressions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-600/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Profile Sync Active</span>
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Profile Views</span>
            <Eye className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{profileViews}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+{profileViewsGrowth}% MoM</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Search Appearances</span>
            <Search className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{searchAppearances}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+{searchAppearancesGrowth}% queries</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Network</span>
            <Users className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{connectionsCount.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">Direct Connections</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Recruiter Inquiries</span>
            <MailCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{recruiterInquiriesCount}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">High Intent Leads</span>
        </div>
      </div>

      {/* Top Search Keywords */}
      <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
        <span className="text-xs font-bold text-foreground block">Top Recruiter Search Queries Matching You</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {topSearchKeywords.map((kw, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border text-xs">
              <span className="font-semibold text-foreground">{kw.keyword}</span>
              <span className="font-mono text-muted-foreground text-[11px]">{kw.count} hits</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
