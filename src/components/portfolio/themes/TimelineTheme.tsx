"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Clock } from "lucide-react";

export function TimelineTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 font-sans selection:bg-indigo-600 selection:text-white">
      {/* Sticky Roadmap Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070A12]/90 border-b border-indigo-500/20 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <span className="font-bold text-sm text-white">{pi.fullName || "Chronicle"}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            CHRONOLOGICAL ROADMAP
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <ModularThemeSections
          resume={resume}
          theme="timeline"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#0D1222] border border-indigo-500/20 text-slate-100 shadow-xl"
          accentClass="text-indigo-400 font-bold"
          btnClass="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-500/20"
        />
      </main>
    </div>
  );
}
