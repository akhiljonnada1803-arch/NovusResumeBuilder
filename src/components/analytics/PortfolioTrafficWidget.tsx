"use client";

import React from "react";
import { PortfolioAnalyticsMetrics } from "@/types/analytics";
import {
  Globe,
  Users,
  Eye,
  Smartphone,
  Monitor,
  Tablet,
  ArrowUpRight,
  TrendingUp,
  Search,
  ExternalLink,
  Compass,
} from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon } from "@/components/shared/icons";

interface PortfolioTrafficWidgetProps {
  metrics: PortfolioAnalyticsMetrics;
}

export function PortfolioTrafficWidget({ metrics }: PortfolioTrafficWidgetProps) {
  const { totalVisitors, uniqueVisitors, pageViews, topReferrers, deviceBreakdown, topSectionsVisited, timeSeries } = metrics;
  const maxValue = Math.max(...timeSeries.map((t) => t.value), 10);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Vercel Portfolio Web Traffic & Referrers</h2>
            <p className="text-xs text-muted-foreground">
              Real-time telemetry from candidate-owned Vercel deployments.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{metrics.visitorsGrowth}% Traffic</span>
          </span>
        </div>
      </div>

      {/* Traffic Timeline Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-foreground">Traffic Volume Trend (Pageviews vs Unique Visitors)</span>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" /> Pageviews ({pageViews})
            </span>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span className="w-2.5 h-2.5 rounded bg-blue-500" /> Unique ({uniqueVisitors})
            </span>
          </div>
        </div>

        <div className="h-36 w-full flex items-end gap-2 pt-4 px-2 pb-2 bg-secondary/30 rounded-xl border border-border">
          {timeSeries.map((point, idx) => {
            const pageviewHeight = Math.max(15, Math.round((point.value / maxValue) * 100));
            const uniqueHeight = Math.max(10, Math.round(((point.secondaryValue || point.value * 0.6) / maxValue) * 100));

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  {point.label}: {point.value} views • {point.secondaryValue} unique
                </div>

                <div className="w-full flex items-end justify-center gap-0.5 h-full">
                  <div
                    className="w-1/2 bg-emerald-500/80 hover:bg-emerald-400 rounded-t-xs transition-all duration-300"
                    style={{ height: `${pageviewHeight}%` }}
                  />
                  <div
                    className="w-1/2 bg-blue-500/80 hover:bg-blue-400 rounded-t-xs transition-all duration-300"
                    style={{ height: `${uniqueHeight}%` }}
                  />
                </div>

                <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Referrers & Devices Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Top Referrers (7 cols) */}
        <div className="lg:col-span-7 p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Top Referrer Channels</span>
            <span className="text-[10px] font-mono text-muted-foreground">Inbound Sources</span>
          </div>

          <div className="space-y-2 text-xs">
            {topReferrers.map((ref, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    {ref.source.includes("Google") && <Search className="w-3 h-3 text-blue-500" />}
                    {ref.source.includes("LinkedIn") && <LinkedinIcon className="w-3 h-3 text-blue-600" />}
                    {ref.source.includes("GitHub") && <GithubIcon className="w-3 h-3 text-foreground" />}
                    {ref.source.includes("Twitter") && <TwitterIcon className="w-3 h-3 text-sky-400" />}
                    {ref.source.includes("Direct") && <Globe className="w-3 h-3 text-muted-foreground" />}
                    <span>{ref.source}</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {ref.visitors} ({ref.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${ref.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device Types (5 cols) */}
        <div className="lg:col-span-5 p-4 rounded-xl border border-border bg-secondary/20 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-foreground block mb-1">Device Breakdown</span>
            <p className="text-[11px] text-muted-foreground">Screen resolution categories</p>
          </div>

          <div className="space-y-3 text-xs my-auto">
            {deviceBreakdown.map((dev, idx) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-2">
                  {dev.device === "Desktop" && <Monitor className="w-4 h-4 text-primary" />}
                  {dev.device === "Mobile" && <Smartphone className="w-4 h-4 text-emerald-500" />}
                  {dev.device === "Tablet" && <Tablet className="w-4 h-4 text-amber-500" />}
                  <span className="font-bold text-foreground">{dev.device}</span>
                </div>
                <span className="font-mono font-bold text-foreground">{dev.percentage}%</span>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-muted-foreground font-mono pt-2 border-t border-border/60">
            Bounce Rate: <strong className="text-foreground">{metrics.bounceRatePercentage}%</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
