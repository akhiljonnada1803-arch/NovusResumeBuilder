"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Sparkles, Cpu } from "lucide-react";

export function AIEngineerTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
      {/* Neural Workbench Top Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070A0F]/90 border-b border-cyan-500/20 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="font-bold text-sm text-white font-mono">{pi.fullName || "AI Engineer"}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            NEURAL WORKBENCH
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <ModularThemeSections
          resume={resume}
          theme="ai-engineer"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#0D131F] border border-cyan-500/20 text-slate-100 shadow-xl hover:border-cyan-500/40 transition-all"
          accentClass="text-cyan-400 font-bold"
          btnClass="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:opacity-90 shadow-lg shadow-cyan-500/20"
        />
      </main>
    </div>
  );
}
