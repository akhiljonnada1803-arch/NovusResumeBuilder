"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { ModularThemeSections } from "@/components/portfolio/sections/ModularPortfolioSections";
import {
  Rocket,
  Share2,
  Check,
} from "lucide-react";

export function FounderTheme({ resume, subdomain, sectionsConfig }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Memo Navigation Bar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#090D16]/80 border-b border-amber-500/20 px-4 sm:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-bold text-sm tracking-tight text-white">{pi.fullName || "Founder"}</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
            VENTURE MEMO
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-500/30 text-amber-300" onClick={handleCopy}>
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
            <span>Share Memo</span>
          </Button>
          <ThemeToggle />
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <ModularThemeSections
          resume={resume}
          theme="founder"
          sectionsConfig={sectionsConfig}
          cardClass="bg-[#0E131F] border border-amber-500/20 text-slate-100 shadow-xl"
          accentClass="text-amber-400 font-bold"
          btnClass="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold hover:opacity-90 shadow-md shadow-amber-500/20"
        />
      </main>
    </div>
  );
}
