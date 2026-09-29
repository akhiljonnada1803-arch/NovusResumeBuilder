"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MonthlyCareerReport } from "@/types/analytics";
import { useToast } from "@/components/ui/toast";
import {
  FileText,
  Printer,
  Download,
  Share2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Award,
  ArrowUpRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface MonthlyReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: MonthlyCareerReport | null;
}

export function MonthlyReportModal({ open, onOpenChange, report }: MonthlyReportModalProps) {
  const { success } = useToast();

  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyMarkdown = () => {
    const md = `
# Executive Career Performance Report: ${report.month} ${report.year}
**Candidate**: ${report.candidateName}  
**Target Role**: ${report.targetRole}  
**Career Reach Score**: ${report.overallScore}/100 (+${report.scoreChange}% MoM)

## Executive Summary
${report.executiveSummary}

## Key Telemetry Metrics
- Resume Downloads: ${report.kpiSummary.resumeDownloads}
- Portfolio Visitors: ${report.kpiSummary.portfolioVisitors}
- GitHub Velocity: ${report.kpiSummary.githubContributions} annual contributions
- Recruiter Leads: ${report.kpiSummary.recruiterLeads}

## Top Performing Assets
${report.topPerformingAssets.map((a) => `- **${a.name}** (${a.type}): ${a.metricValue}`).join("\n")}

## Recruiter Market Signals
${report.recruiterSignals.map((s) => `- **${s.signal}** [${s.impact}]: ${s.detail}`).join("\n")}

## Recommended Career Actions
${report.recommendedActions.map((act, i) => `${i + 1}. ${act}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(md);
    success("Monthly report markdown copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Executive Career Performance Report</DialogTitle>
              <span className="text-xs text-muted-foreground font-normal">
                {report.month} {report.year} • Synthesized by Novus AI Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={handleCopyMarkdown} className="h-8 text-xs gap-1 font-semibold">
              <Download className="w-3.5 h-3.5" />
              <span>Copy MD</span>
            </Button>
            <Button size="sm" variant="radiant" onClick={handlePrint} className="h-8 text-xs gap-1 font-bold shadow-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 pt-2 print:max-h-none print:overflow-visible">
        {/* Executive Score Banner */}
        <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-primary/5 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground">
                Executive Candidate Summary
              </span>
              <h3 className="text-base font-bold text-foreground">{report.candidateName}</h3>
              <p className="text-xs text-muted-foreground">{report.targetRole}</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <span className="text-3xl font-black font-mono text-primary">{report.overallScore}</span>
                <span className="text-xs text-muted-foreground font-bold"> / 100</span>
                <div className="flex items-center justify-end gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{report.scoreChange}% MoM</span>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-foreground/90 leading-relaxed pt-2 border-t border-border/60">
            {report.executiveSummary}
          </p>
        </div>

        {/* 4 KPI Numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div className="p-3 rounded-xl border border-border bg-secondary/20">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Resume Downloads</span>
            <span className="text-base font-bold font-mono text-foreground">{report.kpiSummary.resumeDownloads}</span>
          </div>
          <div className="p-3 rounded-xl border border-border bg-secondary/20">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Portfolio Traffic</span>
            <span className="text-base font-bold font-mono text-foreground">{report.kpiSummary.portfolioVisitors}</span>
          </div>
          <div className="p-3 rounded-xl border border-border bg-secondary/20">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">GitHub Velocity</span>
            <span className="text-base font-bold font-mono text-foreground">{report.kpiSummary.githubContributions}</span>
          </div>
          <div className="p-3 rounded-xl border border-border bg-secondary/20">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Recruiter Inquiries</span>
            <span className="text-base font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {report.kpiSummary.recruiterLeads} Leads
            </span>
          </div>
        </div>

        {/* Top Performing Assets */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
          <span className="font-bold text-foreground block">Top Performing Career Distribution Assets</span>
          <div className="space-y-2">
            {report.topPerformingAssets.map((asset, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-secondary/30 border border-border flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground">{asset.name}</span>
                  <span className="text-[10px] font-mono text-muted-foreground block">{asset.type}</span>
                </div>
                <span className="font-mono font-bold text-primary text-[11px]">{asset.metricValue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recruiter Signals */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
          <span className="font-bold text-foreground block">Recruiter & Market Signals</span>
          <div className="space-y-2">
            {report.recruiterSignals.map((sig, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-secondary/30 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{sig.signal}</span>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {sig.impact} Impact
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">{sig.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
          <span className="font-bold text-foreground block">High-ROI Next Steps for Next Month</span>
          <div className="space-y-1.5">
            {report.recommendedActions.map((action, idx) => (
              <div key={idx} className="flex items-start gap-2 text-muted-foreground text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{action}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
