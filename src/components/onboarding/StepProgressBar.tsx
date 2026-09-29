"use client";

import React from "react";
import { OnboardingStep } from "@/types/onboarding";
import { Check, Sparkles, Database, Globe, Layers } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

interface StepProgressBarProps {
  currentStep: OnboardingStep;
  onStepClick?: (step: OnboardingStep) => void;
}

const STEPS: { id: OnboardingStep; label: string; icon: any }[] = [
  { id: "welcome", label: "Welcome", icon: Sparkles },
  { id: "gemini", label: "Gemini AI", icon: Sparkles },
  { id: "supabase", label: "Supabase", icon: Database },
  { id: "github", label: "GitHub", icon: GithubIcon },
  { id: "linkedin", label: "LinkedIn", icon: LinkedinIcon },
  { id: "vercel", label: "Vercel", icon: Globe },
  { id: "summary", label: "Summary", icon: Layers },
];

export function StepProgressBar({ currentStep, onStepClick }: StepProgressBarProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full py-2">
      {/* Desktop Step Bar */}
      <div className="hidden sm:flex items-center justify-between relative px-2">
        {/* Connecting line */}
        <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-border -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-4 h-0.5 bg-primary -translate-y-1/2 transition-all duration-500 z-0"
          style={{ width: `${(Math.max(0, currentIndex) / (STEPS.length - 1)) * 95}%` }}
        />

        {STEPS.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
              className={`relative z-10 flex flex-col items-center gap-1 transition-all ${
                isCompleted ? "cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all shadow-xs ${
                  isCompleted
                    ? "bg-primary text-primary-foreground border-primary"
                    : isCurrent
                    ? "bg-card text-primary border-primary ring-4 ring-primary/20 scale-105 font-bold"
                    : "bg-secondary text-muted-foreground border-border"
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : <span className="text-[11px] font-mono font-bold">{idx + 1}</span>}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isCurrent ? "text-foreground font-bold" : isCompleted ? "text-muted-foreground" : "text-muted-foreground/60"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Header */}
      <div className="sm:hidden flex items-center justify-between p-3 rounded-xl border border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold font-mono">
            {currentIndex + 1}
          </div>
          <span className="text-xs font-bold text-foreground">
            Step {currentIndex + 1} of {STEPS.length}: {STEPS[currentIndex]?.label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground">
          {Math.round(((currentIndex + 1) / STEPS.length) * 100)}%
        </span>
      </div>
    </div>
  );
}
