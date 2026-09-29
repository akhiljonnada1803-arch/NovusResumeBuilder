"use client";

import React from "react";
import {
  Compass,
  Sparkles,
  FileText,
  ShieldCheck,
  Globe,
  Bot,
  Mic,
  Video,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

const UPCOMING_FEATURES = [
  {
    icon: Mic,
    title: "Voice Interview Coach",
    description:
      "Practice interviews out loud. Real-time speech analysis, filler word detection, and confidence scoring.",
    eta: "v1.1 · Coming in 2–3 weeks",
    accent: "from-violet-500/20 to-purple-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    icon: Video,
    title: "Video Interview Studio",
    description:
      "Full video mock interviews with AI-powered facial expression analysis, eye contact tracking, and posture feedback.",
    eta: "v1.1 · Coming in 2–3 weeks",
    accent: "from-blue-500/20 to-cyan-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
  },
  {
    icon: LinkedinIcon,
    title: "Live LinkedIn Sync",
    description:
      "Automatic 3-way sync between your LinkedIn profile, ATS resume, and live portfolio — always in perfect alignment.",
    eta: "v1.2 · Coming in 4–6 weeks",
    accent: "from-sky-500/20 to-blue-500/10 border-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    icon: GithubIcon,
    title: "GitHub Auto-Sync",
    description:
      "Webhook-driven auto-sync that pushes your latest GitHub contributions and projects directly into your resume.",
    eta: "v1.2 · Coming in 4–6 weeks",
    accent: "from-slate-500/20 to-gray-500/10 border-slate-500/20",
    iconColor: "text-slate-300",
  },
  {
    icon: Globe,
    title: "Enterprise Team Workspace",
    description:
      "Multi-seat recruiter workspace for candidate pipeline management, bulk ATS scoring, and team collaboration.",
    eta: "v2.0 · Coming in 60–90 days",
    accent: "from-emerald-500/20 to-teal-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    icon: Bot,
    title: "Native Mobile App",
    description:
      "Build and manage your resume on the go. iOS and Android apps with offline support and camera-based resume scanning.",
    eta: "v3.0 · Coming in 90–180 days",
    accent: "from-orange-500/20 to-amber-500/10 border-orange-500/20",
    iconColor: "text-orange-400",
  },
];

export default function DiscoverPage() {
  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary mb-2">
          <Compass className="w-3.5 h-3.5" />
          Feature Roadmap
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          What&apos;s Coming to Novus
        </h1>
        <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
          These features are actively being built. Engines, APIs, and components
          are already in the codebase — they just need the final polish before
          launch.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {UPCOMING_FEATURES.map((feature) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              className={`relative rounded-xl border bg-gradient-to-br p-5 space-y-3 transition-all duration-200 hover:scale-[1.01] ${feature.accent}`}
            >
              {/* Coming Soon Badge */}
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-mono font-medium text-muted-foreground bg-background/60 border border-border/60 px-2 py-1 rounded-md">
                  SOON
                </span>
              </div>

              {/* Icon + Title */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-background/60 border border-border/40 flex items-center justify-center shrink-0">
                  <Icon className={`w-4.5 h-4.5 ${feature.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                    {feature.eta}
                  </p>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground leading-relaxed pl-12">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Already Available CTA */}
      <div className="rounded-xl border border-border/60 bg-secondary/30 p-6 text-center space-y-3">
        <div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="w-4 h-4 text-primary" />
          Already Available Now
        </div>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Resume builder, PDF export, 10 portfolio themes, ATS scanner, AI
          bullet enhancer, cover letter generator, interview coach, career
          intelligence dashboard, GitHub integration, and resume import are all
          live.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          {[
            { icon: FileText, label: "Resume Builder" },
            { icon: ShieldCheck, label: "ATS Scanner" },
            { icon: Globe, label: "Portfolio Site" },
            { icon: Bot, label: "Interview Coach" },
          ].map(({ icon: I, label }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground bg-background border border-border/60 px-2.5 py-1 rounded-full"
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
