"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Share2,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Laptop,
  CheckCircle2,
  Palette,
} from "lucide-react";
import { PortfolioTheme } from "./PortfolioView";

interface PortfolioShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PortfolioShareModal({ open, onOpenChange }: PortfolioShareModalProps) {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const [selectedTheme, setSelectedTheme] = useState<PortfolioTheme>("founder");
  const [copied, setCopied] = useState(false);

  let sectionsParam = "";
  if (typeof window !== "undefined" && activeResume?.id) {
    const saved = localStorage.getItem(`novus_portfolio_sections_${activeResume.id}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const activeIds = parsed.filter((s: any) => s.enabled).map((s: any) => s.id).join(",");
          if (activeIds) sectionsParam = `&sections=${activeIds}`;
        }
      } catch (e) {}
    }
  }

  const portfolioUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/p/${activeResume.id}?theme=${selectedTheme}${sectionsParam}`
      : `/p/${activeResume.id}?theme=${selectedTheme}${sectionsParam}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(portfolioUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const themes: { id: PortfolioTheme; name: string; desc: string; accent: string }[] = [
    {
      id: "founder",
      name: "Silicon Valley Founder",
      desc: "Pitch deck & investor memo layout with traction dials and portfolio cards.",
      accent: "bg-amber-500",
    },
    {
      id: "apple-engineer",
      name: "Apple Engineer",
      desc: "Cupertino HIG launch aesthetic with floating macOS blur dock and hardware specs.",
      accent: "bg-blue-500",
    },
    {
      id: "github-developer",
      name: "GitHub Developer",
      desc: "Native GitHub profile tabs, pinned repo cards, and green activity grid.",
      accent: "bg-emerald-500",
    },
    {
      id: "timeline",
      name: "Interactive Timeline",
      desc: "Chronological milestone roadmap with interactive year scrubber.",
      accent: "bg-indigo-500",
    },
    {
      id: "showcase",
      name: "Product Showcase",
      desc: "Linear/Raycast product landing layout with interactive feature tabs.",
      accent: "bg-purple-500",
    },
    {
      id: "ai-engineer",
      name: "AI Engineer",
      desc: "Neural pipeline telemetry, HuggingFace model cards, and prompt playground.",
      accent: "bg-cyan-500",
    },
    {
      id: "terminal",
      name: "Cyberpunk Terminal",
      desc: "Interactive hacker terminal shell with runnable commands and ASCII banner.",
      accent: "bg-[#00FF66]",
    },
    {
      id: "designer",
      name: "Designer Portfolio",
      desc: "Swiss editorial magazine with design tokens and case study typography.",
      accent: "bg-rose-500",
    },
    {
      id: "executive",
      name: "Executive Professional",
      desc: "Fortune 500 executive briefing memorandum and strategic governance.",
      accent: "bg-amber-600",
    },
    {
      id: "interactive-3d",
      name: "3D Interactive",
      desc: "Spatial depth canvas with 3D cursor tilt parallax cards and isometric nodes.",
      accent: "bg-sky-400",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-primary">
          <Globe className="w-5 h-5" />
          <DialogTitle>Resume-to-Portfolio Website</DialogTitle>
        </div>
        <DialogDescription>
          Instantly convert your resume into a stunning, responsive, SEO-ready personal portfolio website.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Theme Picker */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Choose Portfolio Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTheme(t.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                  selectedTheme === t.id
                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30"
                    : "border-border bg-card/60 hover:border-border/80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${t.accent}`} />
                    <h4 className="font-bold text-xs text-foreground">{t.name}</h4>
                  </div>
                  {selectedTheme === t.id && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border space-y-2">
          <span className="text-xs font-bold text-foreground block">Your Public Portfolio Link</span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={portfolioUrl}
              className="flex-1 h-9 px-3 rounded-xl border border-border bg-card text-xs text-muted-foreground font-mono select-all focus:outline-none"
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-9 text-xs font-bold gap-1.5 shrink-0"
              onClick={handleCopy}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>

          <a href={portfolioUrl} target="_blank" rel="noreferrer">
            <Button variant="radiant" className="text-xs font-bold gap-1.5 shadow-md">
              <ExternalLink className="w-3.5 h-3.5" />
              Launch Live Website
            </Button>
          </a>
        </div>
      </div>
    </Dialog>
  );
}
