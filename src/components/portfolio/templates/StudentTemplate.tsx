"use client";

import React from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import {
  GraduationCap,
  BookOpen,
  Award,
  FolderGit2,
  Calendar,
  Download,
  ExternalLink,
  Sparkles,
  MapPin,
  Mail,
  GitBranch,
  Globe,
  ArrowRight,
  CheckCircle2,
  Code2,
  Trophy,
} from "lucide-react";

export function StudentTemplate({ resume, customization }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const education = resume.education || [];
  const projects = resume.projects || [];
  const skills = resume.skills || [];
  const experience = resume.experience || [];

  const isSectionVisible = (sectionId: string) => {
    if (customization?.sectionVisibility && customization.sectionVisibility[sectionId] !== undefined) {
      return customization.sectionVisibility[sectionId];
    }
    return true;
  };

  const rawFullName = (pi.fullName || "Candidate").replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const jobTitle = customization?.taglineOverride?.trim() || (pi.jobTitle && !pi.jobTitle.toLowerCase().includes("github") && !pi.jobTitle.toLowerCase().includes("linkedin")
    ? pi.jobTitle
    : resume.targetRole || "Computer Science & Engineering Student");

  const primaryEdu = education[0] || {
    institution: "University",
    degree: "Bachelor of Science in Computer Science",
    fieldOfStudy: "Computer Science & Engineering",
    startDate: "2021",
    endDate: "2025",
    gpa: "3.85 / 4.0",
  };

  const summary = customization?.bioOverride?.trim() || pi.summary || `Honors student at ${primaryEdu.institution} specializing in ${primaryEdu.fieldOfStudy || "Computer Science"}. Passionate about systems engineering, machine learning algorithms, and practical software development.`;

  const primaryCta = customization?.primaryCtaText?.trim() || "Explore Capstone Projects";
  const primaryCtaLink = customization?.primaryCtaLink?.trim() || "#projects";

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Top Campus Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/85 border-b border-blue-900/40 px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <a href="#" className="flex items-center gap-3 text-white tracking-tight hover:opacity-90">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-sm sm:text-base text-white block leading-tight">
                {rawFullName}
              </span>
              <span className="text-[11px] text-blue-400 font-mono hidden sm:block">
                Class of {primaryEdu.endDate || "2025"} • {primaryEdu.institution}
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            {isSectionVisible("about") && <a href="#about" className="hover:text-blue-400 transition-colors">About</a>}
            {isSectionVisible("education") && <a href="#education" className="hover:text-blue-400 transition-colors">Academics</a>}
            {isSectionVisible("featured-projects") && <a href="#projects" className="hover:text-blue-400 transition-colors">Capstone Builds</a>}
            {isSectionVisible("skills") && <a href="#skills" className="hover:text-blue-400 transition-colors">Skills</a>}
            {isSectionVisible("experience") && experience.length > 0 && <a href="#experience" className="hover:text-blue-400 transition-colors">Experience</a>}
            {isSectionVisible("contact") && <a href="#contact" className="hover:text-blue-400 transition-colors">Contact</a>}
          </nav>

          <div className="flex items-center gap-2.5">
            {pi.email && (
              <a
                href={`mailto:${pi.email}`}
                className="text-xs sm:text-sm font-bold px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white transition-all transform hover:-translate-y-0.5 shadow-md shadow-blue-600/30 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Contact Student</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-20 py-10">
        {/* Academic Hero Section */}
        {isSectionVisible("hero") && (
          <section id="about" className="pt-8 pb-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 font-mono text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-800/60 text-blue-400 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>CLASS OF {primaryEdu.endDate || "2025"} • SEEKING FULL-TIME & INTERNSHIPS</span>
              </div>

              {customization?.headlineOverride?.trim() ? (
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white">
                  {customization.headlineOverride}
                </h1>
              ) : (
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.08] text-white">
                  Learn. Build.<br />
                  <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                    Innovate.
                  </span><br />
                  Excel.
                </h1>
              )}

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                {summary}
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={primaryCtaLink}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/30 flex items-center gap-2"
                >
                  <span>{primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                {pi.github && (
                  <a
                    href={pi.github}
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-sm transition-all flex items-center gap-2"
                  >
                    <GitBranch className="w-4 h-4 text-blue-400" />
                    <span>GitHub Repos</span>
                  </a>
                )}
              </div>
            </div>

            {/* Academic Metric & Card Shield */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[360px] bg-gradient-to-b from-[#0f1a36] to-[#0a1024] rounded-2xl border border-blue-800/40 p-6 shadow-2xl shadow-blue-950/50 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center gap-4 border-b border-blue-900/40 pb-5">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <GraduationCap className="w-7 h-7 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base leading-tight">{primaryEdu.institution}</h3>
                    <p className="text-xs text-blue-400 font-mono mt-0.5">{primaryEdu.degree}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Cumulative GPA</span>
                    <span className="text-xl font-black font-mono text-white mt-1 block">{primaryEdu.gpa || "3.8+ / 4.0"}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/40">
                    <span className="text-[10px] font-mono font-bold uppercase text-slate-400 block">Graduation</span>
                    <span className="text-xl font-black font-mono text-blue-400 mt-1 block">{primaryEdu.endDate || "2025"}</span>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Dean&apos;s Honor Roll &amp; Academic Distinction</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Capstone Research &amp; Peer Mentoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
                    <span>{pi.location || "On Campus / Remote Available"}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Education Deep Dive */}
        <section id="education" className="space-y-6">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Academic Background &amp; Education
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {education.map((edu: any, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0f172a]/70 border border-blue-900/40 hover:border-blue-700/60 transition-all space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white">{edu.institution}</h3>
                    <p className="text-sm text-blue-400 font-medium">{edu.degree}</p>
                    {edu.fieldOfStudy && (
                      <p className="text-xs text-slate-400 mt-0.5">{edu.fieldOfStudy}</p>
                    )}
                  </div>
                  {edu.gpa && (
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-950 border border-blue-800 text-blue-300">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center gap-2 pt-2 border-t border-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  <span>{edu.startDate || "2021"} &mdash; {edu.endDate || "Present"}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Capstone & Flagship Projects */}
        <section id="projects" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FolderGit2 className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Capstone &amp; Practical Projects
              </h2>
            </div>
            <span className="text-xs font-mono text-blue-400 hidden sm:inline-block">
              {projects.length} Featured Repositories
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((proj: any, idx: number) => (
              <div
                key={idx}
                className="group rounded-2xl bg-[#0f172a]/70 border border-blue-900/40 hover:border-blue-500/50 p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-blue-950/40"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800">
                      PROJECT 0{idx + 1}
                    </span>
                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <GitBranch className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors break-words">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-slate-300 leading-relaxed break-words line-clamp-4">
                    {proj.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/80 mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {(proj.technologies || []).slice(0, 4).map((tech: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800/50 text-blue-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    {proj.liveUrl ? (
                      <a
                        href={proj.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>Launch App</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">Academic Build</span>
                    )}

                    {proj.githubUrl && (
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white font-semibold flex items-center gap-1"
                      >
                        <span>Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Technical Competencies & Coursework */}
        <section id="skills" className="space-y-6">
          <div className="flex items-center gap-3">
            <Code2 className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Technical Competencies &amp; Skills
            </h2>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#0f172a]/70 border border-blue-900/40 space-y-4">
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill: any, idx: number) => (
                <div
                  key={idx}
                  className="px-3.5 py-2 rounded-xl bg-blue-950/40 border border-blue-800/50 text-slate-200 text-xs sm:text-sm font-semibold hover:border-blue-500/60 hover:text-white transition-all flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Internship / Campus Experience */}
        {experience.length > 0 && (
          <section id="experience" className="space-y-6">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Internships &amp; Leadership
              </h2>
            </div>

            <div className="space-y-4">
              {experience.map((exp: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#0f172a]/70 border border-blue-900/40 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div>
                      <h3 className="font-bold text-base text-white">{exp.position}</h3>
                      <p className="text-sm text-blue-400 font-medium">{exp.company}</p>
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

        {/* Verified Student Resume CTA */}
        <section id="contact" className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-blue-950/80 border border-blue-700/50 text-center space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-300">
            <Trophy className="w-7 h-7" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Looking for my verified resume?
            </h2>
            <p className="text-sm text-blue-200/80 leading-relaxed">
              Export my verified ATS-friendly resume containing full coursework, academic projects, and verified GPA.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {pi.email && (
              <a
                href={`mailto:${pi.email}`}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-blue-600/30 flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                <span>Send Email Inquiry</span>
              </a>
            )}
            <Link
              href={`/builder/${resume.id || "sample"}`}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Official Resume PDF</span>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-slate-800/80 text-xs text-slate-500 font-mono">
          <p>© {new Date().getFullYear()} {rawFullName} • Synthesized via Novus Resume AI</p>
        </footer>
      </main>
    </div>
  );
}
