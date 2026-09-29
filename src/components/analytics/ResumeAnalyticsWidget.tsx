"use client";

import React from "react";
import { ResumeAnalyticsMetrics } from "@/types/analytics";
import {
  FileDown,
  Share2,
  FileCode,
  ArrowUpRight,
  TrendingUp,
  FileText,
  Sparkles,
  ExternalLink,
  QrCode,
  Download,
} from "lucide-react";

interface ResumeAnalyticsWidgetProps {
  metrics: ResumeAnalyticsMetrics;
}

export function ResumeAnalyticsWidget({ metrics }: ResumeAnalyticsWidgetProps) {
  const { totalDownloads, downloadsBreakdown, totalExports, exportsBreakdown, totalShares, sharesBreakdown, timeSeries } = metrics;

  // Max value for visual SVG chart scaling
  const maxValue = Math.max(...timeSeries.map((t) => t.value), 10);

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">ATS Resume Telemetry & Distribution</h2>
            <p className="text-xs text-muted-foreground">
              Monitor downloads, developer exports, and recruiter live link shares.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{metrics.downloadsGrowth}% MoM</span>
          </span>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Downloads Breakdown */}
        <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-500" />
              Resume Downloads
            </span>
            <span className="text-base font-bold font-mono text-foreground">{totalDownloads}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>PDF (ATS Clean)</span>
                <span className="font-mono font-semibold text-foreground">{downloadsBreakdown.pdf}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${(downloadsBreakdown.pdf / (totalDownloads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>DOCX (Word)</span>
                <span className="font-mono font-semibold text-foreground">{downloadsBreakdown.docx}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full"
                  style={{ width: `${(downloadsBreakdown.docx / (totalDownloads || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Plain TXT</span>
                <span className="font-mono font-semibold text-foreground">{downloadsBreakdown.txt}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-slate-400 rounded-full"
                  style={{ width: `${(downloadsBreakdown.txt / (totalDownloads || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Exports Breakdown */}
        <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-500" />
              Developer Exports
            </span>
            <span className="text-base font-bold font-mono text-foreground">{totalExports}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>JSON Resume Schema</span>
                <span className="font-mono font-semibold text-foreground">{exportsBreakdown.json}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(exportsBreakdown.json / (totalExports || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Markdown (.md)</span>
                <span className="font-mono font-semibold text-foreground">{exportsBreakdown.markdown}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(exportsBreakdown.markdown / (totalExports || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>LaTeX Source</span>
                <span className="font-mono font-semibold text-foreground">{exportsBreakdown.latex}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(exportsBreakdown.latex / (totalExports || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Live Link Shares */}
        <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-emerald-500" />
              Live Link Shares
            </span>
            <span className="text-base font-bold font-mono text-foreground">{totalShares}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Direct Link Views</span>
                <span className="font-mono font-semibold text-foreground">{sharesBreakdown.liveLinkViews}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${(sharesBreakdown.liveLinkViews / (totalShares || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Recruiter Outreach Clicks</span>
                <span className="font-mono font-semibold text-foreground">{sharesBreakdown.recruiterClicks}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(sharesBreakdown.recruiterClicks / (totalShares || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>QR Code Scans</span>
                <span className="font-mono font-semibold text-foreground">{sharesBreakdown.directQrScans}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(sharesBreakdown.directQrScans / (totalShares || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Timeline Chart */}
      <div className="space-y-2 pt-2">
        <span className="text-xs font-bold text-foreground block">Download & Share Velocity Trend</span>
        <div className="h-32 w-full flex items-end gap-2 pt-4 px-2 pb-2 bg-secondary/30 rounded-xl border border-border">
          {timeSeries.map((point, idx) => {
            const heightPercent = Math.max(12, Math.round((point.value / maxValue) * 100));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                {/* Tooltip */}
                <div className="absolute -top-8 bg-black text-white text-[10px] font-mono px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                  {point.label}: {point.value} actions
                </div>

                <div
                  className="w-full bg-blue-500/80 hover:bg-blue-400 rounded-t-md transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
                <span className="text-[9px] font-mono text-muted-foreground truncate w-full text-center">
                  {point.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
