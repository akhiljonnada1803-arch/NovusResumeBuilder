"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Layers } from "lucide-react";

export function ProductShowcaseTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#08090C] text-slate-100 font-sans selection:bg-purple-600 selection:text-white">
      {/* Linear Product Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#08090C]/90 border-b border-purple-500/20 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Layers className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <span className="font-bold text-sm text-white">{pi.fullName || "Product Showcase"}</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
            LINEAR CRAFT
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <ModularThemeSections
          resume={resume}
          theme="showcase"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#10121A] border border-purple-500/20 text-slate-100 shadow-xl hover:border-purple-500/40 transition-all"
          accentClass="text-purple-400 font-bold"
          btnClass="bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white font-semibold shadow-lg shadow-purple-500/20"
        />
      </main>
    </div>
  );
}
