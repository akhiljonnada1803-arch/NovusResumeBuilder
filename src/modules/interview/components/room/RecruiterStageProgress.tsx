"use client";

import React from "react";
import { InterviewStage, INTERVIEW_STAGES } from "../../types";

interface RecruiterStageProgressProps {
  currentStage: InterviewStage;
}

export function RecruiterStageProgress({ currentStage }: RecruiterStageProgressProps) {
  const activeIndex = INTERVIEW_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
      {INTERVIEW_STAGES.map((stage, idx) => {
        const isPast = idx < activeIndex;
        const isCurrent = idx === activeIndex;

        return (
          <div
            key={stage.id}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all shrink-0 border ${
              isCurrent
                ? "bg-primary text-primary-foreground border-primary font-bold shadow-2xs"
                : isPast
                ? "bg-secondary text-foreground border-border/80"
                : "text-muted-foreground border-transparent opacity-60"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isCurrent ? "bg-white animate-pulse" : isPast ? "bg-emerald-500" : "bg-muted-foreground"
              }`}
            />
            <span>{stage.shortLabel}</span>
          </div>
        );
      })}
    </div>
  );
}
