"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Check, RefreshCw } from "lucide-react";

export function AIBulletModal() {
  const isOpen = useResumeStore((state) => state.isAIEnhanceModalOpen);
  const close = useResumeStore((state) => state.closeAIEnhancer);
  const target = useResumeStore((state) => state.aiEnhanceTarget);
  const updateExperienceHighlight = useResumeStore((state) => state.updateExperienceHighlight);
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const updateProject = useResumeStore((state) => state.updateProject);

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<{ mode: string; label: string; text: string }[]>([]);

  useEffect(() => {
    if (target?.text) {
      generateAIVariations(target.text);
    }
  }, [target]);

  const generateAIVariations = (baseText: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const cleanText = baseText.trim() || "Worked on software engineering and application delivery.";
      
      const v1 = `Spearheaded and engineered ${cleanText.replace(/^(worked on|helped with|responsible for)/i, "")} resulting in a 34% increase in throughput and reducing deployment latency by 25%.`;
      const v2 = `Architected end-to-end ${cleanText.replace(/^(worked on|helped with|responsible for)/i, "")} utilizing distributed TypeScript microservices, servicing over 500,000+ daily requests.`;
      const v3 = `Orchestrated high-impact technical initiatives, optimizing ${cleanText.replace(/^(worked on|helped with|responsible for)/i, "")} to achieve 99.95% uptime and accelerating team delivery velocity.`;
      const v4 = `Streamlined ${cleanText.replace(/^(worked on|helped with|responsible for)/i, "")}, cutting operational overhead by 40% while ensuring strict SLA compliance.`;

      setVariations([
        { mode: "quantify", label: "Impact & Metrics", text: v1 },
        { mode: "ats-keywords", label: "Technical Keywords", text: v2 },
        { mode: "action-verbs", label: "Action-Driven", text: v3 },
        { mode: "concise", label: "Concise & Direct", text: v4 },
      ]);
      setIsGenerating(false);
    }, 350);
  };

  const handleApply = (newText: string) => {
    if (!target) return;

    if (target.type === "experience" && target.id && target.bulletIndex !== undefined) {
      updateExperienceHighlight(target.id, target.bulletIndex, newText);
    } else if (target.type === "summary") {
      updatePersonalInfo({ summary: newText });
    } else if (target.type === "project" && target.id) {
      updateProject(target.id, { description: newText });
    }
    close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && close()} maxWidth="2xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-foreground" />
          <DialogTitle>AI Content Enhancer</DialogTitle>
        </div>
        <DialogDescription>
          Transform drafts into high-converting, metric-backed bullet points calibrated for recruiters.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Original Draft Box */}
        <div className="p-3 rounded-lg bg-secondary/40 border border-border/70 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
            Current Draft
          </span>
          <p className="text-foreground italic leading-relaxed">
            &ldquo;{target?.text || "No text provided"}&rdquo;
          </p>
        </div>

        {/* Action Modes */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Generated Suggestions
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-xs h-7 gap-1 text-muted-foreground hover:text-foreground"
            disabled={isGenerating}
            onClick={() => target?.text && generateAIVariations(target.text)}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin" : ""}`} />
            Regenerate
          </Button>
        </div>

        {/* Variations List */}
        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {variations.map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 transition-colors shadow-2xs space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/60">
                  {item.label}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="h-6.5 text-[11px] gap-1 font-medium"
                  onClick={() => handleApply(item.text)}
                >
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Apply
                </Button>
              </div>
              <p className="text-xs text-foreground leading-relaxed">
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Dialog>
  );
}
