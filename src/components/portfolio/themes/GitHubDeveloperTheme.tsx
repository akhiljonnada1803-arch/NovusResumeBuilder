"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { GithubIcon } from "@/components/shared/icons";
import { Terminal } from "lucide-react";

export function GitHubDeveloperTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#0D1117] text-[#C9D1D9] font-mono selection:bg-[#238636] selection:text-white">
      {/* GitHub Top Header */}
      <header className="sticky top-0 z-50 bg-[#161B22] border-b border-[#30363D] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GithubIcon className="w-6 h-6 text-white" />
          <span className="font-bold text-sm text-white">github.com/{pi.fullName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "developer"}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#238636]/20 text-[#3FB950] border border-[#238636]/40 font-mono">
            OCTOCAT PROFILE
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ModularThemeSections
          resume={resume}
          theme="github-developer"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#161B22] border border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E] transition-all"
          accentClass="text-[#3FB950] font-bold"
          btnClass="bg-[#238636] hover:bg-[#2EA043] text-white font-semibold shadow-md"
        />
      </main>
    </div>
  );
}
