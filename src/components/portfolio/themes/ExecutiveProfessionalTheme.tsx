"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Shield } from "lucide-react";

export function ExecutiveProfessionalTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#0C1017] text-slate-100 font-sans selection:bg-amber-600 selection:text-white">
      {/* Formal Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#0C1017]/90 border-b border-amber-500/20 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-sm bg-amber-500 text-slate-950 font-serif font-black flex items-center justify-center text-sm">
            {pi.fullName ? pi.fullName.charAt(0) : "E"}
          </div>
          <div>
            <span className="font-bold text-sm text-white block leading-none">{pi.fullName || "Executive Profile"}</span>
            <span className="text-[10px] text-amber-400 font-mono">EXECUTIVE ADVISORY & LEADERSHIP</span>
          </div>
        </div>
        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
        <ModularThemeSections
          resume={resume}
          theme="executive"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#111722] border border-amber-500/20 text-slate-100 shadow-xl rounded-2xl"
          accentClass="text-amber-400 font-bold"
          btnClass="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md"
        />
      </main>
    </div>
  );
}
