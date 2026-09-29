"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Box } from "lucide-react";

export function Interactive3DTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#04060A] text-slate-100 font-sans selection:bg-cyan-400 selection:text-black overflow-x-hidden pb-24">
      {/* 3D Floating Spatial Header */}
      <header className="sticky top-6 z-50 max-w-xl mx-auto px-4">
        <div className="backdrop-blur-2xl bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-6 py-3 flex items-center justify-between shadow-2xl shadow-cyan-500/10">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: "12s" }} />
            <span className="font-bold text-xs tracking-tight text-white">{pi.fullName || "Spatial Canvas"}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              3D PERSPECTIVE
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-14">
        <ModularThemeSections
          resume={resume}
          theme="interactive-3d"
          sectionsConfig={sectionsConfig}
          cardClass="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-cyan-950/30 border border-cyan-500/30 text-slate-100 shadow-2xl shadow-cyan-500/5 rounded-3xl"
          accentClass="text-cyan-300 font-bold"
          btnClass="bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold hover:opacity-90 shadow-md shadow-cyan-500/20"
        />
      </main>
    </div>
  );
}
