"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Laptop } from "lucide-react";

export function AppleEngineerTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#000000] text-[#F5F5F7] font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Floating Cupertino Glass Dock */}
      <header className="sticky top-6 z-50 max-w-xl mx-auto px-4">
        <div className="backdrop-blur-2xl bg-[#1D1D1F]/80 border border-white/10 rounded-full px-6 py-2.5 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-2">
            <Laptop className="w-4 h-4 text-blue-400" />
            <span className="font-semibold text-xs tracking-tight text-white">{pi.fullName || "Apple Engineer"}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              CUPERTINO HIG
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-12">
        <ModularThemeSections
          resume={resume}
          theme="apple-engineer"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#121214] border border-white/10 text-[#F5F5F7] shadow-xl hover:border-blue-500/30 transition-all rounded-3xl"
          accentClass="text-blue-400 font-bold"
          btnClass="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/20"
        />
      </main>
    </div>
  );
}
