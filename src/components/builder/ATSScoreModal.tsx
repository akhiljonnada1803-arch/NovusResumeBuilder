"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { SectionType } from "@/types/resume";

export function ATSScoreModal() {
  const isOpen = useResumeStore((state) => state.isATSModalOpen);
  const close = useResumeStore((state) => state.closeATSModal);
  const getATSScore = useResumeStore((state) => state.getATSScore);
  const setActiveSection = useResumeStore((state) => state.setActiveSection);

  const report = getATSScore();

  const handleFixSection = (sectionName?: string) => {
    if (sectionName) {
      setActiveSection(sectionName as SectionType);
    }
    close();
  };

  const getScoreBadge = (score: number) => {
    if (score >= 85) return "text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40";
    if (score >= 70) return "text-slate-800 bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40";
    return "text-red-700 bg-red-50 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/40";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()} maxWidth="2xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <DialogTitle>ATS Compliance & Diagnostics</DialogTitle>
        </div>
        <DialogDescription>
          Automated Applicant Tracking System scanner measuring keyword density, completeness, and measurable impact.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5">
        {/* Overall Score Gauge Banner */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-secondary border border-border/80 shadow-2xs shrink-0">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {report.overallScore}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  ATS Score Rating
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${getScoreBadge(report.overallScore)}`}>
                  {report.overallScore >= 80 ? "Pass" : "Review"}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-foreground">
                {report.overallScore >= 85
                  ? "Top 5% Candidate Score"
                  : report.overallScore >= 70
                  ? "Strong Competitive Profile"
                  : report.overallScore >= 50
                  ? "Moderate Compatibility"
                  : "Requires Optimization"}
              </h3>
              <p className="text-[11px] text-muted-foreground">
                Benchmarked against Workday, Greenhouse, and Lever parsing logic.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-44 space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-muted-foreground">Readiness</span>
              <span className="font-mono">{report.overallScore}/100</span>
            </div>
            <Progress value={report.overallScore} />
          </div>
        </div>

        {/* Section Score Breakdown */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Section Breakdown
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Contact</span>
                <span className="font-medium">{report.contactScore}/15</span>
              </div>
              <Progress value={(report.contactScore / 15) * 100} />
            </div>

            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Summary</span>
                <span className="font-medium">{report.summaryScore}/15</span>
              </div>
              <Progress value={(report.summaryScore / 15) * 100} />
            </div>

            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Experience</span>
                <span className="font-medium">{report.experienceScore}/30</span>
              </div>
              <Progress value={(report.experienceScore / 30) * 100} />
            </div>

            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Education</span>
                <span className="font-medium">{report.educationScore}/15</span>
              </div>
              <Progress value={(report.educationScore / 15) * 100} />
            </div>

            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Skills</span>
                <span className="font-medium">{report.skillsScore}/15</span>
              </div>
              <Progress value={(report.skillsScore / 15) * 100} />
            </div>

            <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/60">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Projects</span>
                <span className="font-medium">{report.projectsScore}/10</span>
              </div>
              <Progress value={(report.projectsScore / 10) * 100} />
            </div>
          </div>
        </div>

        {/* Actionable Recommendations */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recommendations
          </h4>
          <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
            {report.suggestions.map((sug, idx) => {
              const isCritical = sug.type === "critical";
              const isWarning = sug.type === "warning";
              const isSuccess = sug.type === "success";

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border flex items-center justify-between gap-3 text-xs ${
                    isCritical
                      ? "bg-red-50 border-red-200 text-red-900 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900/40"
                      : isWarning
                      ? "bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-900/40"
                      : isSuccess
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-900/40"
                      : "bg-secondary/30 border-border text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isCritical && <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                    {isWarning && <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                    {isSuccess && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    {!isCritical && !isWarning && !isSuccess && (
                      <Lightbulb className="w-3.5 h-3.5 text-foreground shrink-0" />
                    )}
                    <span className="font-normal leading-relaxed">{sug.message}</span>
                  </div>

                  {sug.section && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="h-6 text-[11px] px-2 shrink-0 font-medium"
                      onClick={() => handleFixSection(sug.section)}
                    >
                      Fix
                      <ArrowRight className="w-2.5 h-2.5 ml-1" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
