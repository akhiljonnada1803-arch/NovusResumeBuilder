"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Palette } from "lucide-react";

export function DesignerPortfolioTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#0E0B12] text-[#F3E8FF] font-sans selection:bg-rose-500 selection:text-white">
      {/* Editorial Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0E0B12]/90 border-b border-rose-500/20 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="w-4 h-4 text-rose-400" />
          <span className="font-serif font-black text-sm tracking-wide text-white">{pi.fullName || "Designer Portfolio"}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30">
            SWISS EDITORIAL
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <ModularThemeSections
          resume={resume}
          theme="designer"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#17121E] border border-rose-500/20 text-[#F3E8FF] shadow-xl hover:border-rose-500/40 transition-all rounded-3xl"
          accentClass="text-rose-400 font-bold"
          btnClass="bg-gradient-to-r from-rose-500 to-purple-600 hover:opacity-90 text-white font-semibold shadow-lg shadow-rose-500/20"
        />
      </main>
    </div>
  );
}
