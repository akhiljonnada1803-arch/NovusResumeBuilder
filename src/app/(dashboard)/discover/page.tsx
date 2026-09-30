"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Sparkles,
  FileText,
  ShieldCheck,
  Globe,
  Bot,
  Mic,
  Video,
  Key,
  Command,
  Mail,
  Users,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";

interface RoadmapItem {
  readonly icon: React.ElementType;
  readonly title: string;
  readonly description: string;
  readonly version: string;
  readonly status: "live" | "in-progress" | "planned";
  readonly statusLabel: string;
  readonly href?: string;
  readonly accent: string;
  readonly iconColor: string;
  readonly badgeColor: string;
}

const ROADMAP_ITEMS: RoadmapItem[] = [
  // v1.1 — Released / Live Now
  {
    icon: Mic,
    title: "Voice Interview Coach",
    description:
      "Practice interviews out loud with real-time speech analysis, filler word detection, and confidence scoring.",
    version: "v1.1",
    status: "live",
    statusLabel: "Live in v1.1",
    href: "/interview-coach",
    accent: "from-purple-500/15 via-violet-500/5 to-transparent border-purple-500/30",
    iconColor: "text-purple-400",
    badgeColor: "bg-purple-500/10 text-purple-300 border-purple-500/30",
  },
  {
    icon: Video,
    title: "Video Interview Studio",
    description:
      "Full video mock interviews with AI-powered posture analysis, eye contact metrics, and structured STAR feedback.",
    version: "v1.1",
    status: "live",
    statusLabel: "Live in v1.1",
    href: "/interview-coach",
    accent: "from-blue-500/15 via-cyan-500/5 to-transparent border-blue-500/30",
    iconColor: "text-blue-400",
    badgeColor: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  },
  {
    icon: Key,
    title: "Bring Your Own Key (BYOK) Manager",
    description:
      "Store your own free-tier Gemini and Supabase keys locally on your device with client-side obfuscation. 100% private.",
    version: "v1.1",
    status: "live",
    statusLabel: "Live in v1.1",
    href: "/settings",
    accent: "from-amber-500/15 via-yellow-500/5 to-transparent border-amber-500/30",
    iconColor: "text-amber-400",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  },
  {
    icon: Command,
    title: "Global Command Palette (⌘K)",
    description:
      "Instant keyboard navigation across all resumes, tools, settings, and interview studios with fuzzy search.",
    version: "v1.1",
    status: "live",
    statusLabel: "Live in v1.1",
    accent: "from-emerald-500/15 via-teal-500/5 to-transparent border-emerald-500/30",
    iconColor: "text-emerald-400",
    badgeColor: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  },

  // v1.2 — In Progress
  {
    icon: LinkedinIcon,
    title: "Live 3-Way LinkedIn Sync",
    description:
      "Automatic bidirectional sync between your LinkedIn profile, ATS resume, and live portfolio site — always in lockstep.",
    version: "v1.2",
    status: "in-progress",
    statusLabel: "Coming in v1.2",
    accent: "from-sky-500/15 via-blue-500/5 to-transparent border-sky-500/30",
    iconColor: "text-sky-400",
    badgeColor: "bg-sky-500/10 text-sky-300 border-sky-500/30",
  },
  {
    icon: GithubIcon,
    title: "GitHub Webhook Auto-Sync",
    description:
      "Real-time webhook listener that streams newly shipped repositories, commits, and star milestones into your project section.",
    version: "v1.2",
    status: "in-progress",
    statusLabel: "Coming in v1.2",
    accent: "from-slate-500/15 via-zinc-500/5 to-transparent border-slate-500/30",
    iconColor: "text-slate-300",
    badgeColor: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  },
  {
    icon: Mail,
    title: "Monthly Career & ATS Intelligence Report",
    description:
      "Automated monthly email digest with portfolio visitor analytics, recruiter searches, and ATS score improvement tips.",
    version: "v1.2",
    status: "in-progress",
    statusLabel: "Coming in v1.2",
    accent: "from-pink-500/15 via-rose-500/5 to-transparent border-pink-500/30",
    iconColor: "text-pink-400",
    badgeColor: "bg-pink-500/10 text-pink-300 border-pink-500/30",
  },

  // v2.0 & v3.0 — Planned
  {
    icon: Users,
    title: "Enterprise & Club Team Workspace",
    description:
      "Multi-member workspace for college clubs and developer cohorts with bulk ATS scoring, shared templates, and leaderboards.",
    version: "v2.0",
    status: "planned",
    statusLabel: "Planned · v2.0",
    accent: "from-indigo-500/15 via-violet-500/5 to-transparent border-indigo-500/30",
    iconColor: "text-indigo-400",
    badgeColor: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  },
  {
    icon: Smartphone,
    title: "Native Mobile App (iOS & Android)",
    description:
      "Build and edit your resume on the go with camera-based paper resume OCR scanner and offline cloud synchronization.",
    version: "v3.0",
    status: "planned",
    statusLabel: "Planned · v3.0",
    accent: "from-orange-500/15 via-amber-500/5 to-transparent border-orange-500/30",
    iconColor: "text-orange-400",
    badgeColor: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  },
];

export default function DiscoverPage() {
  const [filter, setFilter] = useState<"all" | "live" | "in-progress" | "planned">("all");

  const filteredItems = ROADMAP_ITEMS.filter((item) => {
    if (filter === "all") return true;
    return item.status === filter;
  });

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-8">
      {/* Hero Header */}
      <div className="text-center space-y-3 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary">
          <Compass className="w-3.5 h-3.5" />
          Product Evolution &amp; Release Roadmap
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          What&apos;s New &amp; What&apos;s Next
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Track our ongoing development across major releases. Everything in Novus
          is built to be open-source, private by design, and cost-free for clubs.
        </p>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {(
            [
              { id: "all", label: "All Items" },
              { id: "live", label: "🎉 Live in v1.1" },
              { id: "in-progress", label: "⚡ In Progress (v1.2)" },
              { id: "planned", label: "🔭 Future (v2.0 / v3.0)" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                filter === tab.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Roadmap Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`relative rounded-xl border bg-gradient-to-br p-5 space-y-3.5 transition-all duration-200 hover:scale-[1.01] ${feature.accent}`}
            >
              {/* Top Header: Icon, Title, Status Badge */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-background/80 border border-border/60 flex items-center justify-center shrink-0 shadow-2xs">
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground leading-tight">
                      {feature.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] font-mono font-medium text-muted-foreground">
                        {feature.version}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border shrink-0 ${feature.badgeColor}`}
                >
                  {feature.statusLabel}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {feature.description}
              </p>

              {/* Action Link for Live Features */}
              {feature.href && (
                <div className="pt-1">
                  <Link
                    href={feature.href}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Try it now
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Core Features Recap */}
      <div className="rounded-xl border border-border/60 bg-secondary/30 p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          Core Platform Foundation (v1.0 &amp; v1.1)
        </div>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Interactive ATS resume builder, 26+ templates, PDF compiler, portfolio website generator with 10 themes, AI bullet optimizer, cover letter engine, BYOK key manager, and live interview studios are fully live.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {[
            { icon: FileText, label: "Resume Builder (26+ Templates)" },
            { icon: ShieldCheck, label: "ATS Scanner & Optimizer" },
            { icon: Globe, label: "Portfolio Sites (10 Themes)" },
            { icon: Bot, label: "AI Interview Coach" },
            { icon: Key, label: "BYOK Privacy Manager" },
            { icon: Command, label: "Command Palette (⌘K)" },
          ].map(({ icon: I, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-background border border-border/60 px-2.5 py-1 rounded-full shadow-2xs"
            >
              <I className="w-3 h-3 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
