"use client";

import React from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import {
  ExternalLink,
  Mail,
  Globe,
  ArrowRight,
  GraduationCap,
  Code2,
  FolderGit2,
  Sparkles,
  MapPin,
  GitBranch,
} from "lucide-react";

export function DeveloperTemplate({ resume, customization }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const experience = resume.experience || [];
  const projects = resume.projects || [];
  const skills = resume.skills || [];
  const education = resume.education || [];

  const isSectionVisible = (sectionId: string) => {
    if (customization?.sectionVisibility && customization.sectionVisibility[sectionId] !== undefined) {
      return customization.sectionVisibility[sectionId];
    }
    return true;
  };

  const rawFullName = (pi.fullName || "Candidate").replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const jobTitle = customization?.taglineOverride?.trim() || (pi.jobTitle && !pi.jobTitle.toLowerCase().includes("github") && !pi.jobTitle.toLowerCase().includes("linkedin")
    ? pi.jobTitle
    : resume.targetRole || experience[0]?.position || "AI & Full Stack Engineer");

  const badgeRole = jobTitle.toUpperCase().includes("STUDENT") || jobTitle.toUpperCase().includes("ENGINEER")
    ? `${jobTitle.toUpperCase()} | FULL STACK DEVELOPER | PROBLEM SOLVER`
    : `AI & ML ENGINEERING STUDENT | FULL STACK DEVELOPER | PROBLEM SOLVER`;

  const summary = customization?.bioOverride?.trim() || pi.summary || `Passionate ${jobTitle} focused on building scalable web applications, deep learning architectures, and intelligent software systems.`;

  const heroPhoto = customization?.photoUrl?.trim() || pi.photoUrl;
  const primaryCta = customization?.primaryCtaText?.trim() || "View Projects";
  const primaryCtaLink = customization?.primaryCtaLink?.trim() || "#projects";
  const secondaryCta = customization?.secondaryCtaText?.trim() || "Let's Talk";

  return (
    <div className="min-h-screen bg-[#07090e] text-[#f8fafc] font-sans selection:bg-sky-500 selection:text-black">
      {/* Fixed/Sticky Top Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090e]/85 border-b border-white/6 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="#" className="text-xl font-black text-white tracking-tight hover:opacity-90">
            {rawFullName}
          </a>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-400">
            {isSectionVisible("about") && <a href="#about" className="hover:text-white transition-colors">About</a>}
            {isSectionVisible("education") && <a href="#education" className="hover:text-white transition-colors">Education</a>}
            {isSectionVisible("skills") && <a href="#skills" className="hover:text-white transition-colors">Skills</a>}
            {isSectionVisible("featured-projects") && <a href="#projects" className="hover:text-white transition-colors">Projects</a>}
            {isSectionVisible("experience") && <a href="#experience" className="hover:text-white transition-colors">Experience</a>}
            {isSectionVisible("contact") && <a href="#contact" className="hover:text-white transition-colors">Contact</a>}
          </nav>

          <a
            href="#contact"
            className="text-xs sm:text-sm font-bold px-5 py-2 rounded-full bg-sky-300 hover:bg-sky-400 text-slate-950 transition-all transform hover:-translate-y-0.5 shadow-md shadow-sky-500/20"
          >
            Resume
          </a>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20 py-10">
        {/* Hero Section */}
        {(isSectionVisible("hero") || isSectionVisible("about")) && (
          <section id="about" className="pt-8 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full bg-white/4 border border-white/10 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>{badgeRole}</span>
              </div>

              {customization?.headlineOverride?.trim() ? (
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-white">
                  {customization.headlineOverride}
                </h1>
              ) : (
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.05] text-white">
                  Code. Train.<br />
                  <span className="bg-gradient-to-r from-sky-300 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                    Optimize.
                  </span><br />
                  Repeat.
                </h1>
              )}

              <p className="text-base sm:text-lg text-slate-400 leading-relaxed max-w-xl">
                {summary}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={primaryCtaLink}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-sky-600/30 flex items-center gap-2"
                >
                  <span>{primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <a
                  href="#contact"
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5"
                >
                  {secondaryCta}
                </a>
              </div>
            </div>

            {/* Right Angled Image Frame */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[340px] sm:max-w-[380px] aspect-[4/4.8] bg-slate-900 rounded-2xl border-2 border-white/15 -rotate-3 hover:rotate-0 transition-transform duration-300 shadow-2xl shadow-black/80 overflow-hidden relative">
                {heroPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={heroPhoto}
                    alt={rawFullName}
                    className="w-full h-full object-cover grayscale-[15%] contrast-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center mb-4">
                      <Code2 className="w-12 h-12 text-sky-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{rawFullName}</h3>
                    <p className="text-xs text-sky-400 mt-1 font-mono">{jobTitle}</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Education Section */}
        {isSectionVisible("education") && education.length > 0 && (
          <section id="education" className="space-y-6 pt-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Academics &amp; Foundations</span>
              <h2 className="text-3xl font-black text-white">Education</h2>
            </div>

            <div className="space-y-4">
              {education.map((edu: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0f131d] border border-white/8 hover:border-sky-500/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-sky-400" />
                      <span>{edu.institution}</span>
                    </h3>
                    <p className="text-sm text-sky-400 font-semibold">{edu.degree || edu.fieldOfStudy}</p>
                    {edu.description && <p className="text-xs text-slate-400 max-w-xl">{edu.description}</p>}
                  </div>
                  <div className="font-mono text-xs px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 font-bold self-start sm:self-center">
                    {edu.startDate} &mdash; {edu.endDate || "Present"} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills Section */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section id="skills" className="space-y-6 pt-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Tooling &amp; Stack</span>
              <h2 className="text-3xl font-black text-white">Technical Skills</h2>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f131d] border border-white/8 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Verified Engineering Competencies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((s: any, idx: number) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-lg bg-white/5 border border-white/8 text-slate-200 text-sm font-medium hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-300 transition-colors"
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Projects Section */}
        {isSectionVisible("featured-projects") && projects.length > 0 && (
          <section id="projects" className="space-y-6 pt-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Engineering Showcase</span>
              <h2 className="text-3xl font-black text-white">Featured Projects</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0f131d] border border-white/8 hover:border-sky-500/40 hover:-translate-y-1 transition-all flex flex-col justify-between space-y-4 shadow-xl shadow-black/40"
                >
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      {p.description}
                    </p>
                  </div>

                  <div className="space-y-4 pt-3 border-t border-white/8">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.technologies || []).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="text-[11px] font-mono px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 text-sky-300"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold pt-1">
                      {p.liveUrl ? (
                        <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1">
                          <span>Live Demo</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-500 font-mono text-[11px]">System Build</span>
                      )}

                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-white flex items-center gap-1">
                          <span>GitHub</span>
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

        {/* Profiles Section */}
        {isSectionVisible("about") && (
          <section id="profiles" className="space-y-6 pt-6">
            <div className="space-y-1">
              <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">Online Presence</span>
              <h2 className="text-3xl font-black text-white">Coding &amp; Professional Profiles</h2>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pi.github && (
              <a
                href={pi.github}
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-[#0f131d] border border-white/8 hover:border-sky-500/40 hover:-translate-y-1 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">GitHub</h4>
                  <span className="text-xs text-sky-400 font-medium">Explore Repositories &rarr;</span>
                </div>
              </a>
            )}

            {pi.linkedin && (
              <a
                href={pi.linkedin}
                target="_blank"
                rel="noreferrer"
                className="p-5 rounded-2xl bg-[#0f131d] border border-white/8 hover:border-sky-500/40 hover:-translate-y-1 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 fill-current text-blue-400" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.65 1.65 0 1 0 0 3.3 1.65 1.65 0 0 0 0-3.3z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">LinkedIn</h4>
                  <span className="text-xs text-sky-400 font-medium">Connect Professionally &rarr;</span>
                </div>
              </a>
            )}

            {pi.email && (
              <a
                href={`mailto:${pi.email}`}
                className="p-5 rounded-2xl bg-[#0f131d] border border-white/8 hover:border-sky-500/40 hover:-translate-y-1 transition-all flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Email</h4>
                  <span className="text-xs text-sky-400 font-medium">Send Direct Message &rarr;</span>
                </div>
              </a>
            )}
          </div>
        </section>
        )}

        {/* Contact CTA Section */}
        {isSectionVisible("contact") && (
          <section id="contact" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-sky-500/10 via-[#0f131d] to-[#07090e] border border-sky-500/20 text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Let&apos;s Connect &amp; Collaborate</h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
              Interested in discussing high-impact engineering roles, full-stack projects, or intelligent system architectures? Let&apos;s talk.
            </p>
            <div className="pt-2">
              <a
                href={`mailto:${pi.email || "akhiljonnada1803@gmail.com"}`}
                className="inline-block px-7 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-sky-600/30"
              >
                Send Email Message &rarr;
              </a>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-white/8 text-xs text-slate-500 font-mono">
          <p>&copy; {new Date().getFullYear()} {rawFullName}. Built with Novus Resume AI &bull; Hosted on Vercel.</p>
        </footer>
      </main>
    </div>
  );
}
