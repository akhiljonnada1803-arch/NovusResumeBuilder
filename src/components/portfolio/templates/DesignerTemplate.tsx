"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import {
  Palette,
  Eye,
  Layers,
  Sparkles,
  ArrowUpRight,
  Download,
  Share2,
  Check,
  LayoutGrid,
  ExternalLink,
  Mail,
  GitBranch,
  Globe,
  Boxes,
  ArrowRight,
} from "lucide-react";

export function DesignerTemplate({ resume, customization }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const projects = resume.projects || [];
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  const [activeToken, setActiveToken] = useState<string | null>(null);

  const isSectionVisible = (sectionId: string) => {
    if (customization?.sectionVisibility && customization.sectionVisibility[sectionId] !== undefined) {
      return customization.sectionVisibility[sectionId];
    }
    return true;
  };

  const rawFullName = customization?.headlineOverride?.trim() || (pi.fullName || "Candidate").replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const jobTitle = customization?.taglineOverride?.trim() || (pi.jobTitle && !pi.jobTitle.toLowerCase().includes("github") && !pi.jobTitle.toLowerCase().includes("linkedin")
    ? pi.jobTitle
    : resume.targetRole || "Product Designer & Design Systems Engineer");

  const designTokens = [
    { name: "Neon Rose", hex: "#F43F5E", bg: "bg-[#F43F5E]", border: "border-rose-500" },
    { name: "Obsidian Ink", hex: "#09090B", bg: "bg-[#18181B]", border: "border-zinc-700" },
    { name: "Electric Violet", hex: "#8B5CF6", bg: "bg-[#8B5CF6]", border: "border-violet-500" },
    { name: "Cyber Sky", hex: "#38BDF8", bg: "bg-[#38BDF8]", border: "border-sky-400" },
    { name: "Amber Glow", hex: "#F59E0B", bg: "bg-[#F59E0B]", border: "border-amber-500" },
  ];

  const summary = customization?.bioOverride?.trim() || pi.summary || `Product Designer & Design Systems Architect passionate about tactile digital craftsmanship, micro-interactions, and human-centered design principles.`;
  const heroPhoto = customization?.photoUrl?.trim() || pi.photoUrl;
  const primaryCta = customization?.primaryCtaText?.trim() || "Explore Case Studies";
  const primaryCtaLink = customization?.primaryCtaLink?.trim() || "#cases";

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-rose-500 selection:text-white">
      {/* Top Editorial Minimal Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/85 border-b border-zinc-800/80 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="#" className="flex items-center gap-3">
            {heroPhoto ? (
              <img src={heroPhoto} alt={rawFullName} className="w-8 h-8 rounded-full object-cover border border-rose-500" />
            ) : (
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            )}
            <span className="font-black text-sm sm:text-base tracking-tight text-white uppercase">
              {rawFullName}
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
            {isSectionVisible("hero") && <a href="#about" className="hover:text-rose-400 transition-colors">Philosophy</a>}
            {isSectionVisible("featured-projects") && <a href="#cases" className="hover:text-rose-400 transition-colors">Case Studies</a>}
            {isSectionVisible("skills") && <a href="#tokens" className="hover:text-rose-400 transition-colors">Design Tokens</a>}
            {isSectionVisible("experience") && <a href="#experience" className="hover:text-rose-400 transition-colors">Experience</a>}
            {isSectionVisible("contact") && <a href="#contact" className="hover:text-rose-400 transition-colors">Contact</a>}
          </nav>

          <div className="flex items-center gap-2">
            {pi.email && (
              <a
                href={`mailto:${pi.email}`}
                className="text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all transform hover:-translate-y-0.5 shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Book Review</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-24">
        {/* Massive Editorial Hero */}
        {isSectionVisible("hero") && (
          <section id="about" className="pt-6 space-y-8">
            <div className="inline-flex items-center gap-2 font-mono text-xs font-bold px-3.5 py-1.5 rounded-full bg-rose-950/40 border border-rose-800/40 text-rose-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SELECTED PRODUCT DESIGN &amp; INTERACTION ENGINEERING</span>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-6 flex-1">
                <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[1.03]">
                  Design. Prototype.<br />
                  <span className="bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300 bg-clip-text text-transparent">
                    Polish.
                  </span><br />
                  Deliver.
                </h1>

                <p className="text-lg sm:text-xl text-zinc-400 max-w-3xl leading-relaxed font-normal">
                  {summary}
                </p>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={primaryCtaLink}
                    className="px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-rose-600/30 flex items-center gap-2"
                  >
                    <span>{primaryCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  {pi.linkedin && (
                    <a
                      href={pi.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <Globe className="w-4 h-4 text-rose-400" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {pi.github && (
                    <a
                      href={pi.github}
                      target="_blank"
                      rel="noreferrer"
                      className="px-5 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <GitBranch className="w-4 h-4 text-rose-400" />
                      <span>GitHub</span>
                    </a>
                  )}
                </div>
              </div>

              {heroPhoto && (
                <div className="shrink-0">
                  <img
                    src={heroPhoto}
                    alt={rawFullName}
                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl object-cover border-2 border-rose-500/40 shadow-2xl"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* Dynamic Design Tokens Swatch Bar */}
        {isSectionVisible("skills") && (
          <section id="tokens" className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-rose-500" />
                <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                  Studio Design System Tokens
                </h3>
              </div>
              <span className="text-xs font-mono text-zinc-400">Design System V2</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {designTokens.map((token, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveToken(token.name)}
                  className={`p-3.5 rounded-2xl bg-zinc-950 border ${token.border} cursor-pointer hover:scale-105 transition-all space-y-2`}
                >
                  <div className={`h-10 w-full rounded-xl ${token.bg} shadow-inner`} />
                  <div>
                    <span className="font-bold text-xs text-white block">{token.name}</span>
                    <span className="font-mono text-[10px] text-zinc-400 block">{token.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Visual Case Studies (Masonry / Editorial Grid) */}
        {isSectionVisible("featured-projects") && projects.length > 0 && (
          <section id="cases" className="space-y-8">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <LayoutGrid className="w-6 h-6 text-rose-500" />
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Featured Product Case Studies ({projects.length})
                </h2>
              </div>
              <span className="text-xs font-mono text-zinc-400">Interaction &amp; UI Systems</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="group rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-rose-500/50 overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Visual Preview Header Block */}
                  <div className="h-44 sm:h-52 bg-gradient-to-br from-rose-600/20 via-zinc-900 to-indigo-600/20 p-6 flex flex-col justify-between border-b border-zinc-800 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-3 py-1 rounded-full bg-zinc-950/80 text-rose-400 border border-rose-500/30">
                        CASE 0{idx + 1}
                      </span>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-500 hover:text-white flex items-center justify-center transition-colors"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-rose-400 transition-colors break-words">
                      {proj.title}
                    </h3>
                  </div>

                  <div className="p-6 sm:p-8 space-y-5">
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed break-words">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {(proj.technologies || ["Figma", "Design Systems", "Prototyping"]).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-rose-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80 text-xs">
                      {proj.liveUrl ? (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-rose-400 font-bold hover:underline flex items-center gap-1"
                        >
                          <span>View Interactive Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-zinc-500 font-mono text-[11px]">Prototype &amp; Design Spec</span>
                      )}

                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-400 hover:text-white font-semibold flex items-center gap-1"
                        >
                          <span>Source Code</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Design System Competencies & Tooling */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center gap-3">
              <Boxes className="w-6 h-6 text-rose-500" />
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Design Systems &amp; Tooling
              </h2>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap gap-3">
              {skills.map((skill: any, idx: number) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs sm:text-sm font-semibold hover:border-rose-500/50 hover:text-rose-300 transition-all flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience Timeline */}
        {isSectionVisible("experience") && experience.length > 0 && (
          <section id="experience" className="space-y-6">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Design Leadership &amp; Career
            </h2>

            <div className="space-y-4">
              {experience.map((exp: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="font-bold text-lg text-white">{exp.position}</h3>
                      <p className="text-sm text-rose-400 font-medium">{exp.company}</p>
                    </div>
                    <span className="text-xs font-mono text-zinc-400">
                      {exp.startDate} &mdash; {exp.endDate || "Present"}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Resume & Booking CTA */}
        {isSectionVisible("contact") && (
          <section id="contact" className="p-8 sm:p-14 rounded-3xl bg-gradient-to-r from-rose-950/60 via-zinc-900 to-rose-950/40 border border-rose-800/40 text-center space-y-6">
            <h2 className="text-3xl sm:text-5xl font-black text-white">
              Let&apos;s build something memorable together.
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto">
              Available for product advisory, design systems consulting, and high-impact UX architecture roles.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {pi.email && (
                <a
                  href={`mailto:${pi.email}`}
                  className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-rose-600/30 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Get In Touch</span>
                </a>
              )}
              <Link
                href={`/builder/${resume.id || "sample"}`}
                className="px-6 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-bold text-sm transition-all flex items-center gap-2"
              >
                <Download className="w-4 h-4 text-rose-400" />
                <span>Download Product Resume</span>
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-zinc-800/80 text-xs text-zinc-500 font-mono">
          <p>© {new Date().getFullYear()} {rawFullName} • Studio Portfolio by Novus Resume AI</p>
        </footer>
      </main>
    </div>
  );
}
