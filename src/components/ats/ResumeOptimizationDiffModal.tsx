"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { OptimizedResumeDiff } from "@/lib/ats/jd-matcher";
import {
  Sparkles,
  Check,
  ArrowRight,
  Plus,
  RefreshCw,
  FileCheck,
  CheckCircle2,
} from "lucide-react";

interface ResumeOptimizationDiffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  diff: OptimizedResumeDiff | null;
  onApplied?: () => void;
}

export function ResumeOptimizationDiffModal({
  open,
  onOpenChange,
  diff,
  onApplied,
}: ResumeOptimizationDiffModalProps) {
  const { success } = useToast();
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const addSkill = useResumeStore((state) => state.addSkill);

  const [applySummary, setApplySummary] = useState(true);
  const [applyExperience, setApplyExperience] = useState(true);
  const [applySkills, setApplySkills] = useState(true);

  if (!diff) return null;

  const handleApply = () => {
    // 1. Apply Summary
    if (applySummary && diff.optimizedSummary) {
      updatePersonalInfo({ summary: diff.optimizedSummary });
    }

    // 2. Apply Experience highlights
    if (applyExperience && diff.experienceDiffs) {
      diff.experienceDiffs.forEach((item) => {
        if (item.id && item.optimizedHighlights?.length) {
          updateExperience(item.id, { highlights: item.optimizedHighlights });
        }
      });
    }

    // 3. Apply missing skills
    if (applySkills && diff.suggestedSkillsToAdd) {
      diff.suggestedSkillsToAdd.forEach((skillName) => {
        addSkill({
          name: skillName,
          category: "Technical",
          level: "Advanced",
        });
      });
    }

    success("Resume successfully optimized and aligned with target Job Description!");
    if (onApplied) onApplied();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-foreground" />
          <DialogTitle>AI Resume Optimization Review</DialogTitle>
        </div>
        <DialogDescription>
          Review tailored executive summary, keyword-aligned STAR accomplishment bullets, and recommended skills before updating your active resume.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
        {/* Section 1: Executive Summary Diff */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Executive Summary Alignment
            </h4>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={applySummary}
                onChange={(e) => setApplySummary(e.target.checked)}
                className="rounded text-primary focus:ring-0"
              />
              <span>Apply</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">Current Summary</span>
              <p className="text-muted-foreground leading-relaxed">
                {diff.originalSummary || "No summary present."}
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> AI Tailored Summary
              </span>
              <p className="text-foreground leading-relaxed font-medium">
                {diff.optimizedSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Experience Bullets Diff */}
        {diff.experienceDiffs && diff.experienceDiffs.length > 0 && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Work Experience STAR Optimization ({diff.experienceDiffs.length} Positions)
              </h4>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyExperience}
                  onChange={(e) => setApplyExperience(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
                <span>Apply</span>
              </label>
            </div>

            <div className="space-y-3">
              {diff.experienceDiffs.map((exp) => (
                <div key={exp.id} className="p-3 rounded-lg bg-secondary/30 border border-border/60 space-y-2 text-xs">
                  <div className="font-semibold text-foreground">
                    {exp.position} – <span className="text-muted-foreground">{exp.company}</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                      Optimized Accomplishments:
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-foreground">
                      {exp.optimizedHighlights.map((h, i) => (
                        <li key={i} className="leading-relaxed">{h}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Recommended Skills */}
        {diff.suggestedSkillsToAdd && diff.suggestedSkillsToAdd.length > 0 && (
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" />
                Target Keywords to Add ({diff.suggestedSkillsToAdd.length})
              </h4>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={applySkills}
                  onChange={(e) => setApplySkills(e.target.checked)}
                  className="rounded text-primary focus:ring-0"
                />
                <span>Apply</span>
              </label>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {diff.suggestedSkillsToAdd.map((s, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border font-medium"
                >
                  <Plus className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="radiant"
          size="sm"
          className="text-xs font-semibold gap-1.5 shadow-2xs"
          onClick={handleApply}
        >
          <Check className="w-3.5 h-3.5" />
          Apply Selected Optimizations
        </Button>
      </div>
    </Dialog>
  );
}
