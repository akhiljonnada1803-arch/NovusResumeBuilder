"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import {
  Briefcase,
  CheckCircle2,
  Calendar,
  Send,
  Star,
  Quote,
  ArrowRight,
  Download,
  ExternalLink,
  Sparkles,
  DollarSign,
  Clock,
  ShieldCheck,
  Mail,
  Zap,
} from "lucide-react";

export function FreelancerTemplate({ resume, customization }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const projects = resume.projects || [];
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  const [formSent, setFormSent] = useState(false);
  const [clientMsg, setClientMsg] = useState("");

  const isSectionVisible = (sectionId: string) => {
    if (customization?.sectionVisibility && customization.sectionVisibility[sectionId] !== undefined) {
      return customization.sectionVisibility[sectionId];
    }
    return true;
  };

  const rawFullName = customization?.headlineOverride?.trim() || (pi.fullName || "Candidate").replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const jobTitle = customization?.taglineOverride?.trim() || (pi.jobTitle && !pi.jobTitle.toLowerCase().includes("github") && !pi.jobTitle.toLowerCase().includes("linkedin")
    ? pi.jobTitle
    : resume.targetRole || "Independent Full-Stack Specialist & Fractional Lead");

  const packages = [
    {
      title: "Rapid MVP Sprint",
      tagline: "From Spec to Production in 3 Weeks",
      rate: "Fixed Scope",
      deliverables: [
        "Full-Stack Modern Next.js Web App",
        "Secure Database & Authentication Setup",
        "Stripe / Payment & CI/CD Pipeline",
        "30-Day Post-Launch Warranty Support",
      ],
      highlight: false,
    },
    {
      title: "Dedicated Technical Advisory",
      tagline: "Architecture & Scale Consulting",
      rate: "Fractional",
      deliverables: [
        "System Architecture & Security Reviews",
        "Database Optimization & Query Tuning",
        "Engineering Team Mentorship & Code Audits",
        "Bi-Weekly Executive Sprint Alignment",
      ],
      highlight: true,
    },
    {
      title: "Hands-On Senior Engineering",
      tagline: "Core Feature & API Execution",
      rate: "Retainer",
      deliverables: [
        "Complex Feature & Microservice Builds",
        "Third-Party SDK & AI Pipeline Integrations",
        "Performance & Latency Optimization",
        "Rapid Bug Resolution & Testing",
      ],
      highlight: false,
    },
  ];

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientMsg.trim()) return;
    setFormSent(true);
    setClientMsg("");
    setTimeout(() => setFormSent(false), 5000);
  };

  const summary = customization?.bioOverride?.trim() || pi.summary || `Senior software consultant helping high-growth startups and enterprises architect, build, and ship resilient digital products on schedule.`;
  const heroPhoto = customization?.photoUrl?.trim() || pi.photoUrl;
  const primaryCta = customization?.primaryCtaText?.trim() || "View Engagement Packages";
  const primaryCtaLink = customization?.primaryCtaLink?.trim() || "#packages";

  return (
    <div className="min-h-screen bg-[#0c0a17] text-slate-100 font-sans selection:bg-purple-500 selection:text-white">
      {/* Top Consultancy Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0c0a17]/85 border-b border-purple-900/30 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="#" className="flex items-center gap-3">
            {heroPhoto ? (
              <img src={heroPhoto} alt={rawFullName} className="w-8 h-8 rounded-xl object-cover border border-purple-500" />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-purple-600/30">
                ✦
              </div>
            )}
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white block leading-tight">
                {rawFullName}
              </span>
              <span className="text-[11px] text-purple-400 font-mono hidden sm:block">
                {jobTitle}
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            {isSectionVisible("hero") && <a href="#about" className="hover:text-purple-300 transition-colors">Services</a>}
            {isSectionVisible("about") && <a href="#packages" className="hover:text-purple-300 transition-colors">Pricing &amp; Packages</a>}
            {isSectionVisible("featured-projects") && <a href="#projects" className="hover:text-purple-300 transition-colors">Case Studies</a>}
            {isSectionVisible("skills") && <a href="#skills" className="hover:text-purple-300 transition-colors">Stack</a>}
            {isSectionVisible("contact") && <a href="#booking" className="hover:text-purple-300 transition-colors">Hire Me</a>}
          </nav>

          <a
            href="#booking"
            className="px-4 py-2 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-xs sm:text-sm font-bold transition-all transform hover:-translate-y-0.5 shadow-md shadow-purple-600/20 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Hire Me</span>
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-12 space-y-24">
        {/* High Conversion Hero */}
        {isSectionVisible("hero") && (
          <section id="about" className="pt-6 space-y-8">
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>AVAILABLE FOR CONTRACT &amp; FRACTIONAL ROLES</span>
            </div>

            <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
              <div className="space-y-6 flex-1">
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.05]">
                  High-Impact Engineering.<br />
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-300 bg-clip-text text-transparent">
                    Shipped On Time.
                  </span><br />
                  Zero Fluff.
                </h1>

                <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  {summary}
                </p>

                {/* Social Proof / Metric Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2 max-w-2xl">
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-900/40 space-y-1">
                    <span className="text-2xl font-black font-mono text-emerald-400">100%</span>
                    <span className="text-xs text-slate-400 block font-medium">On-Time Milestones</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-900/40 space-y-1">
                    <span className="text-2xl font-black font-mono text-purple-300">{projects.length}+</span>
                    <span className="text-xs text-slate-400 block font-medium">Products Shipped</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-900/40 space-y-1 col-span-2 sm:col-span-1">
                    <span className="text-2xl font-black font-mono text-amber-400">5.0 ★</span>
                    <span className="text-xs text-slate-400 block font-medium">Client Satisfaction</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={primaryCtaLink}
                    className="px-6 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-purple-600/30 flex items-center gap-2"
                  >
                    <span>{primaryCta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                  {pi.email && (
                    <a
                      href={`mailto:${pi.email}`}
                      className="px-5 py-3.5 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-200 font-bold text-sm transition-all flex items-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Instant Email Inquiry</span>
                    </a>
                  )}
                </div>
              </div>

              {heroPhoto && (
                <div className="shrink-0">
                  <img
                    src={heroPhoto}
                    alt={rawFullName}
                    className="w-48 h-48 sm:w-64 sm:h-64 rounded-3xl object-cover border-2 border-purple-500/40 shadow-2xl"
                  />
                </div>
              )}
            </div>
          </section>
        )}

        {/* 3 Tier Transparent Packages */}
        {isSectionVisible("about") && (
          <section id="packages" className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-purple-400">
                ENGAGEMENT MODELS
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Transparent Client Packages
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Pick the tier that matches your roadmap, or reach out for custom sprint arrangements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className={`p-6 sm:p-8 rounded-3xl border transition-all duration-300 flex flex-col justify-between relative ${
                    pkg.highlight
                      ? "bg-purple-950/60 border-purple-500 shadow-2xl shadow-purple-950/60 scale-105"
                      : "bg-[#141024] border-purple-900/40 hover:border-purple-700/60"
                  }`}
                >
                  {pkg.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-purple-500 text-white font-mono text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">{pkg.title}</h3>
                      <p className="text-xs text-purple-300 font-medium mt-1">{pkg.tagline}</p>
                    </div>

                    <div className="py-2 border-y border-purple-900/50">
                      <span className="text-2xl font-black font-mono text-white">{pkg.rate}</span>
                    </div>

                    <ul className="space-y-2.5 pt-2">
                      {pkg.deliverables.map((item, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <a
                      href="#booking"
                      className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                        pkg.highlight
                          ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30"
                          : "bg-purple-900/40 hover:bg-purple-800 text-purple-200 border border-purple-800"
                      }`}
                    >
                      <span>Request Booking</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Client Deliveries & Flagship Builds */}
        {isSectionVisible("featured-projects") && projects.length > 0 && (
          <section id="projects" className="space-y-8">
            <div className="flex items-center justify-between border-b border-purple-900/40 pb-4">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Client Case Studies &amp; Product Builds
                </h2>
              </div>
              <span className="text-xs font-mono text-purple-400">{projects.length} Case Studies</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 sm:p-8 rounded-3xl bg-[#141024] border border-purple-900/40 hover:border-purple-500/50 transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                        DELIVERY 0{idx + 1}
                      </span>
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline text-xs font-bold flex items-center gap-1"
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

                  <div className="space-y-3 pt-4 border-t border-purple-900/40">
                    <div className="flex flex-wrap gap-1.5">
                      {(proj.technologies || []).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800/60 text-purple-300"
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
                          <span>Source Code Repository</span>
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

        {/* Technical Competencies */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section id="skills" className="space-y-6">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Production Stack &amp; Specializations
              </h2>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl bg-[#141024] border border-purple-900/40 flex flex-wrap gap-2.5">
              {skills.map((skill: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/60 border border-purple-800/60 text-slate-200 text-xs sm:text-sm font-semibold hover:border-purple-400 transition-all"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Booking / Instant Inquiry Section */}
        {isSectionVisible("contact") && (
          <section id="booking" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-950 via-[#141024] to-purple-950 border border-purple-700/50 space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Ready to accelerate your roadmap?
              </h2>
              <p className="text-xs sm:text-sm text-purple-200">
                Send an inquiry or book a direct technical discovery sprint.
              </p>
            </div>

            <form onSubmit={handleInquirySubmit} className="max-w-xl mx-auto space-y-3">
              <textarea
                rows={3}
                value={clientMsg}
                onChange={(e) => setClientMsg(e.target.value)}
                placeholder="Describe your project, timeline, and key requirements..."
                className="w-full p-4 rounded-2xl bg-[#0c0a17] border border-purple-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 resize-none"
              />
              <div className="flex flex-wrap items-center justify-between gap-3">
                {pi.email && (
                  <a
                    href={`mailto:${pi.email}`}
                    className="text-xs text-purple-300 font-mono underline hover:text-white"
                  >
                    Direct Email: {pi.email}
                  </a>
                )}
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{formSent ? "Inquiry Received!" : "Send Project Brief"}</span>
                </button>
              </div>
            </form>

            <div className="text-center pt-4">
              <Link
                href={`/builder/${resume.id || "sample"}`}
                className="inline-flex items-center gap-2 text-xs font-mono text-purple-400 hover:text-white underline"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Consultant CV &amp; Project History (PDF)</span>
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-purple-900/40 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} {rawFullName} • Independent Technical Consultant</p>
        </footer>
      </main>
    </div>
  );
}
