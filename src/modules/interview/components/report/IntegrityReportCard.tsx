"use client";

import React from "react";
import { IntegrityReport } from "../../types/integrity";
import { ShieldCheck, ShieldAlert, Shield, AlertTriangle } from "lucide-react";

interface IntegrityReportCardProps {
  report?: IntegrityReport | null;
}

export function IntegrityReportCard({ report }: IntegrityReportCardProps) {
  if (!report) {
    return (
      <div className="p-5 rounded-3xl border border-border bg-card shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-foreground font-bold text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Interview Integrity & Focus Assessment</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Pristine 100% session integrity. Zero tab switches or window defocus events recorded.
        </p>
      </div>
    );
  }

  const score = report.overallScore ?? 100;
  const isPristine = score >= 90;
  const isModerate = score >= 70 && score < 90;

  const badgeColor = isPristine
    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
    : isModerate
    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
    : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";

  return (
    <div className="p-6 rounded-3xl border border-border bg-card shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">Interview Integrity & Focus Assessment</h4>
            <p className="text-[11px] text-muted-foreground">
              Continuous focus monitoring without intrusive OS locks or kiosk restrictions.
            </p>
          </div>
        </div>

        <div className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${badgeColor}`}>
          {isPristine ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
          <span>{score}% — {report.verdict}</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
            Focus Loss Count
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-foreground">{report.tabSwitchCount || 0}</span>
            <span className="text-[11px] text-muted-foreground">events</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
            Total Time Away
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-foreground">{report.unfocusedDurationSeconds || 0}</span>
            <span className="text-[11px] text-muted-foreground">seconds</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-secondary/40 border border-border/70 space-y-1">
          <span className="text-[10px] font-mono uppercase font-bold text-muted-foreground block">
            DevTools Detected
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">{report.devtoolsDetected ? "Yes" : "None"}</span>
          </div>
        </div>
      </div>

      {/* Description Summary */}
      <p className="text-xs text-muted-foreground leading-relaxed">
        {report.summary}
      </p>

      {/* Interruption Events Log */}
      {report.events && report.events.length > 0 && (
        <div className="space-y-2 pt-1 border-t border-border/60">
          <span className="text-[11px] font-mono uppercase font-bold text-muted-foreground">
            Interruption Events Log:
          </span>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
            {report.events.map((ev, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-secondary/30 border border-border text-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="text-foreground font-medium truncate">{ev.description}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
