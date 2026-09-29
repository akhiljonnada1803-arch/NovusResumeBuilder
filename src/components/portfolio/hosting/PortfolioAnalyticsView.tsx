"use client";

import React, { useState, useEffect } from "react";
import { PortfolioAnalyticsSummary } from "@/types/hosting";
import { getPortfolioAnalytics } from "@/lib/portfolio/analytics-engine";
import {
  Eye,
  Users,
  Download,
  Mail,
  TrendingUp,
  Globe,
  Share2,
  Smartphone,
  Laptop,
  Tablet,
  ArrowUpRight,
} from "lucide-react";

interface PortfolioAnalyticsViewProps {
  resumeId: string;
}

export function PortfolioAnalyticsView({ resumeId }: PortfolioAnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<PortfolioAnalyticsSummary | null>(null);

  useEffect(() => {
    // Fetch telemetry from API or fallback engine
    fetch(`/api/portfolio/analytics/stats?resumeId=${resumeId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.analytics) {
          setAnalytics(data.analytics);
        } else {
          setAnalytics(getPortfolioAnalytics(resumeId));
        }
      })
      .catch(() => {
        setAnalytics(getPortfolioAnalytics(resumeId));
      });
  }, [resumeId]);

  if (!analytics) {
    return <div className="p-8 text-center text-xs text-muted-foreground">Loading portfolio telemetry...</div>;
  }

  const maxViews = Math.max(...analytics.viewsOverTime.map((d) => d.views), 1);

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Page Views</span>
            <Eye className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.totalViews.toLocaleString()}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">+18.4% this week</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Unique Visitors</span>
            <Users className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-2xl font-bold text-foreground">{analytics.uniqueVisitors.toLocaleString()}</p>
          <span className="text-[10px] text-muted-foreground">Recruiters & Engineers</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Resume Downloads</span>
            <Download className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-2xl font-bold text-primary">{analytics.resumeDownloads}</p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{analytics.conversionRate}% conversion</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Direct Messages</span>
            <Mail className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{analytics.contactInquiries}</p>
          <span className="text-[10px] text-muted-foreground">Inquiries received</span>
        </div>
      </div>

      {/* 14-Day View History Chart */}
      <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-foreground">Traffic Velocity & Resume Downloads (Last 14 Days)</h3>
            <p className="text-[11px] text-muted-foreground">Daily visitors and candidate resume PDF downloads.</p>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-primary" />
              <span className="text-muted-foreground">Page Views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-muted-foreground">PDF Downloads</span>
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="h-44 flex items-end gap-2 pt-4 border-b border-border/80 pb-2">
          {analytics.viewsOverTime.map((item, idx) => {
            const heightPercent = (item.views / maxViews) * 100;
            const dlHeight = (item.downloads / maxViews) * 100;
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                <div className="w-full flex items-end gap-0.5 justify-center h-full">
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[14px] bg-primary/80 group-hover:bg-primary rounded-t-sm transition-all"
                  />
                  <div
                    style={{ height: `${dlHeight}%` }}
                    className="w-full max-w-[8px] bg-emerald-500/80 group-hover:bg-emerald-500 rounded-t-sm transition-all"
                  />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">
                  {item.date.split(" ")[1]}
                </span>

                {/* Hover Tooltip */}
                <div className="absolute -top-10 hidden group-hover:flex flex-col items-center bg-popover text-popover-foreground px-2 py-1 rounded shadow-lg text-[10px] font-mono whitespace-nowrap z-20 border border-border">
                  <span>{item.views} views</span>
                  <span className="text-emerald-500 font-bold">{item.downloads} downloads</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Traffic Sources & Geographic Breakdown (2 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referrers */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-primary" />
              <span>Top Referral Traffic Sources</span>
            </h3>
          </div>

          <div className="space-y-2.5 text-xs">
            {analytics.topReferrers.map((ref, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground truncate max-w-[200px]">{ref.source}</span>
                  <span className="font-mono text-muted-foreground">{ref.count} ({ref.percentage}%)</span>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div
                    style={{ width: `${ref.percentage}%` }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>Visitor Geographic Distribution</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {analytics.topCountries.map((c, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">{c.flag}</span>
                  <span className="text-[11px] font-semibold text-foreground truncate">{c.country}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
