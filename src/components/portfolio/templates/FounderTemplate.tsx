"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import {
  Rocket,
  Flame,
  Award,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Download,
  Share2,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  Sparkles,
  Mail,
  GitBranch,
  Globe,
  ArrowRight,
} from "lucide-react";

export function FounderTemplate({ resume, customization }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const experience = resume.experience || [];
  const projects = resume.projects || [];
  const skills = resume.skills || [];
  const education = resume.education || [];
  const [copied, setCopied] = useState(false);

  const isSectionVisible = (sectionId: string) => {
    if (customization?.sectionVisibility && customization.sectionVisibility[sectionId] !== undefined) {
      return customization.sectionVisibility[sectionId];
    }
    return true;
  };

  const rawFullName = customization?.headlineOverride?.trim() || (pi.fullName || "Candidate").replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const jobTitle = customization?.taglineOverride?.trim() || (pi.jobTitle && !pi.jobTitle.toLowerCase().includes("github") && !pi.jobTitle.toLowerCase().includes("linkedin")
    ? pi.jobTitle
    : resume.targetRole || "Founder & Chief Technology Operator");

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const summary = customization?.bioOverride?.trim() || pi.summary || `Technology founder & executive operator with a proven track record of taking products from 0 to 1, building high-throughput engineering teams, and driving capital-efficient scale.`;
  const heroPhoto = customization?.photoUrl?.trim() || pi.photoUrl;
  const primaryCta = customization?.primaryCtaText?.trim() || "Investor Inquiries";
  const primaryCtaLink = customization?.primaryCtaLink?.trim() || (pi.email ? `mailto:${pi.email}` : "#contact");

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Executive Memorandum Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#080c14]/85 border-b border-amber-500/20 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {heroPhoto ? (
              <img src={heroPhoto} alt={rawFullName} className="w-8 h-8 rounded-full object-cover border border-amber-500" />
            ) : (
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            )}
            <span className="font-extrabold text-sm sm:text-base text-white">
              {rawFullName}
            </span>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 hidden sm:inline-block">
              VENTURE MEMO
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-1.5 rounded-lg border border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
              <span>{copied ? "Link Copied" : "Share Memo"}</span>
            </button>
            <a
              href={primaryCtaLink}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{primaryCta}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-12 space-y-20">
        {/* Venture Executive Briefing Hero */}
        {isSectionVisible("hero") && (
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Flame className="w-3.5 h-3.5" />
              <span>EXECUTIVE LEADERSHIP &amp; VENTURE MEMORANDUM</span>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-6 flex-1">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  Building category-defining systems with <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-200 bg-clip-text text-transparent">venture scale</span>.
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                  {summary}
                </p>

                {/* 4 Live Traction KPI Dials */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1422] border border-amber-500/20 space-y-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-white">$1.2M+</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Annual Run-Rate</span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1422] border border-amber-500/20 space-y-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">120k+</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Active Users</span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1422] border border-amber-500/20 space-y-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">3.4x</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">YoY Growth</span>
                  </div>

                  <div className="p-4 sm:p-5 rounded-2xl bg-[#0f1422] border border-amber-500/20 space-y-1">
                    <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">99.99%</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Uptime SLA</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={primaryCtaLink}
                    className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-amber-500/20 flex items-center gap-2"
                  >
                    <span>Request Cap Table &amp; Deck</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  {pi.linkedin && (
                    <a
                      href={pi.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4 text-amber-400" />
                      <span>Executive Profile</span>
                    </a>
                  )}
                </div>
              </div>

              {heroPhoto && (
                <div className="shrink-0">
                  <img
                    src={heroPhoto}
                    alt={rawFullName}
                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl object-cover border-2 border-amber-500/40 shadow-2xl"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Ventures & Product Initiatives */}
        {isSectionVisible("featured-projects") && projects.length > 0 && (
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
              <div className="flex items-center gap-3">
                <Rocket className="w-6 h-6 text-amber-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Ventures &amp; Product Initiatives ({projects.length})
                </h2>
              </div>
              <span className="text-xs font-mono text-amber-400">Commercial &amp; Open Source</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl bg-[#0f1422] border border-amber-500/20 hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
                        VENTURE 0{idx + 1}
                      </span>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline text-xs font-bold flex items-center gap-1"
                        >
                          <span>Live Product</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    <h3 className="font-bold text-xl text-white break-words">
                      {proj.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed break-words">
                      {proj.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.technologies || []).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-amber-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    {proj.githubUrl && (
                      <div className="text-xs pt-1">
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-white flex items-center gap-1"
                        >
                          <span>Architecture &amp; Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Executive Experience & Board History */}
        {isSectionVisible("experience") && experience.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Building2 className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Executive Leadership &amp; Board History
              </h2>
            </div>

            <div className="space-y-4">
              {experience.map((exp: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl bg-[#0f1422] border border-amber-500/20 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="font-bold text-lg text-white">{exp.position}</h3>
                      <p className="text-sm text-amber-400 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-400">
                      {exp.startDate} &mdash; {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Architecture Competencies */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Technology Stack &amp; Core Competencies
            </h2>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#0f1422] border border-amber-500/20 flex flex-wrap gap-2.5">
              {skills.map((skill: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold hover:border-amber-500/40 transition-all"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Executive Deck Download */}
        {isSectionVisible("contact") && (
          <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-amber-950/40 via-[#0f1422] to-amber-950/40 border border-amber-500/30 text-center space-y-5">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Looking for executive resume &amp; references?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto">
              Export verified executive resume with verifiable board history, venture revenue metrics, and technical patents.
            </p>

            <div className="pt-2">
              <Link
                href={`/builder/${resume.id || "sample"}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm transition-all shadow-lg shadow-amber-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Export Executive CV (PDF)</span>
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-amber-500/20 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} {rawFullName} • Executive Memorandum via Novus Resume AI</p>
        </footer>
      </main>
    </div>
  );
}
