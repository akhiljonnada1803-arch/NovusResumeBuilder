"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Zap,
  ShieldCheck,
  Globe,
  ArrowRight,
  Database,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";

interface WelcomeStepProps {
  onNext: () => void;
  onSkipAll: () => void;
}

export function WelcomeStep({ onNext, onSkipAll }: WelcomeStepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Pill & Title */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-mono font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>WELCOME TO NOVUS RESUME AI</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-foreground">
          First-Run Setup & Configuration
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Configure your AI engine, database, and cloud hosting in under 2 minutes. You can also skip any step and test in offline demo mode.
        </p>
      </div>

      {/* Services Grid Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>Google Gemini 1.5 Flash</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Powers STAR bullet enhancements, ATS semantic match auditing, and AI interview simulations.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <Database className="w-4 h-4" />
            </div>
            <span>Supabase PostgreSQL</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Relational storage with Row-Level Security (RLS) for resumes, version control, and auth.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <Globe className="w-4 h-4" />
            </div>
            <span>Vercel Edge Hosting</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Multi-tenant portfolio hosting with automatic SSL on subdomains and custom apex domains.
          </p>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <GithubIcon className="w-4 h-4" />
            </div>
            <span>GitHub Developer Sync</span>
          </div>
          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Automated README case study generation and 5-tier technical skill extraction from public repos.
          </p>
        </div>
      </div>

      {/* Estimated Time Badge */}
      <div className="p-3 rounded-xl border border-border bg-secondary/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4 text-primary" />
          <span>Estimated setup time: ~2 minutes</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Zero Code Required
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onSkipAll}
          className="text-xs text-muted-foreground hover:text-foreground order-2 sm:order-1"
        >
          Skip Setup (Use Offline Demo Mode)
        </Button>

        <Button
          type="button"
          variant="radiant"
          size="lg"
          onClick={onNext}
          className="w-full sm:w-auto h-10 px-6 text-xs font-bold gap-2 shadow-xs order-1 sm:order-2"
        >
          <span>Start Configuration</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
