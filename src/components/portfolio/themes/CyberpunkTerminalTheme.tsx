"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import { Terminal } from "lucide-react";

export function CyberpunkTerminalTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};

  return (
    <div className="min-h-screen bg-[#030704] text-[#00FF66] font-mono selection:bg-[#00FF66] selection:text-black">
      {/* Terminal Title Bar */}
      <header className="sticky top-0 z-50 bg-[#061208] border-b border-[#00FF66]/30 px-6 py-3 flex items-center justify-between shadow-lg shadow-[#00FF66]/5">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-[#00FF66]" />
          <span className="font-bold text-xs text-[#00FF66]">root@{pi.fullName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "cyberpunk"}:~#</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
            TTY1 CLI
          </span>
        </div>

        <ThemeToggle />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <ModularThemeSections
          resume={resume}
          theme="terminal"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#061208] border border-[#00FF66]/30 text-[#00FF66] shadow-lg shadow-[#00FF66]/5"
          accentClass="text-[#00FF66] font-bold"
          btnClass="bg-[#00FF66] hover:bg-[#00CC55] text-black font-bold shadow-md shadow-[#00FF66]/20"
        />
      </main>
    </div>
  );
}
