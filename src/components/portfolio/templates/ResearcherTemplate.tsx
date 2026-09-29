"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BaseThemeProps } from "@/types/portfolio";
import {
  BookOpen,
  Award,
  ExternalLink,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  FileText,
  Bookmark,
  GraduationCap,
  Globe,
  Mail,
  GitBranch,
  MapPin,
  Quote,
  Library,
} from "lucide-react";

export function ResearcherTemplate({ resume, customization }: BaseThemeProps) {
  const pi = resume.personalInfo || {};
  const education = resume.education || [];
  const projects = resume.projects || [];
  const skills = resume.skills || [];
  const experience = resume.experience || [];
  const [copiedDoi, setCopiedDoi] = useState<string | null>(null);

  const isSectionVisible = (sectionId: string) => {
    if (customization?.sectionVisibility && customization.sectionVisibility[sectionId] !== undefined) {
      return customization.sectionVisibility[sectionId];
    }
    return true;
  };

  const rawFullName = customization?.headlineOverride?.trim() || (pi.fullName || "Candidate").replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const jobTitle = customization?.taglineOverride?.trim() || (pi.jobTitle && !pi.jobTitle.toLowerCase().includes("github") && !pi.jobTitle.toLowerCase().includes("linkedin")
    ? pi.jobTitle
    : resume.targetRole || "Principal Research Scientist & Scholar");

  const handleCopyBibtex = (title: string, key: string) => {
    const bibtex = `@article{${key.toLowerCase().replace(/[^a-z0-9]/g, "_")}_2024,
  title={${title}},
  author={${rawFullName}},
  journal={Proceedings of Academic & Systems Computing},
  year={2024},
  url={https://doi.org/10.1145/example}
}`;
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(bibtex);
      setCopiedDoi(key);
      setTimeout(() => setCopiedDoi(null), 2000);
    }
  };

  const summary = customization?.bioOverride?.trim() || pi.summary || `Principal Investigator focused on empirical computing architectures, distributed consensus protocols, and verifiable deep learning systems.`;
  const heroPhoto = customization?.photoUrl?.trim() || pi.photoUrl;
  const primaryCta = customization?.primaryCtaText?.trim() || "Contact PI";
  const primaryCtaLink = customization?.primaryCtaLink?.trim() || (pi.email ? `mailto:${pi.email}` : "#contact");

  return (
    <div className="min-h-screen bg-[#0d1117] text-stone-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Academic & Editorial Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0d1117]/90 border-b border-stone-800 px-4 sm:px-8 py-3.5">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {heroPhoto ? (
              <img src={heroPhoto} alt={rawFullName} className="w-9 h-9 rounded-lg object-cover border border-indigo-500/50" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                §
              </div>
            )}
            <div>
              <span className="font-serif font-bold text-sm sm:text-base text-stone-100 block leading-tight">
                {rawFullName}
              </span>
              <span className="text-[11px] text-stone-400 font-mono hidden sm:block">
                {jobTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-stone-900 border border-stone-700 text-indigo-400 font-mono text-xs">
              ORCID: 0000-0002-8193-4910
            </span>
            <a
              href={primaryCtaLink}
              className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{primaryCta}</span>
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Scholarly Hero & Abstract */}
        {isSectionVisible("hero") && (
          <section className="space-y-6 pb-8 border-b border-stone-800">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>SCHOLARLY PROFILE // PEER-REVIEWED RESEARCH</span>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 justify-between">
              <div>
                <h1 className="text-4xl sm:text-6xl font-serif font-bold tracking-tight text-white leading-tight">
                  {rawFullName}
                </h1>
                <p className="text-base text-stone-400 font-sans mt-2">
                  {jobTitle} {pi.location ? `• ${pi.location}` : ""}
                </p>
              </div>
              {heroPhoto && (
                <img
                  src={heroPhoto}
                  alt={rawFullName}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-xl"
                />
              )}
            </div>

            {/* Research Abstract Blockquote */}
            {isSectionVisible("about") && (
              <div className="p-6 sm:p-8 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Quote className="w-4 h-4" />
                  <span>Research Statement &amp; Abstract</span>
                </div>
                <p className="font-serif text-base sm:text-lg text-stone-200 leading-relaxed italic">
                  &ldquo;{summary}&rdquo;
                </p>

                <div className="flex flex-wrap gap-4 pt-3 border-t border-stone-800 font-mono text-xs text-stone-400">
                  <span className="flex items-center gap-1.5">
                    <Library className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{projects.length} Papers / Artifacts</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{education.length} Academic Degrees</span>
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2.5 pt-2 font-mono text-xs">
              <a
                href={primaryCtaLink}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{primaryCta}</span>
              </a>
              {pi.github && (
                <a
                  href={pi.github}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 transition-all flex items-center gap-1.5"
                >
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Code Repositories</span>
                </a>
              )}
              {pi.linkedin && (
                <a
                  href={pi.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 transition-all flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Scholarly Profile</span>
                </a>
              )}
            </div>
          </section>
        )}

        {/* Selected Publications & Systems */}
        {isSectionVisible("featured-projects") && projects.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
                Selected Publications &amp; Preprints
              </h2>
              <span className="text-xs font-mono text-indigo-400">Peer-Reviewed</span>
            </div>

            <div className="space-y-4">
              {projects.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 hover:border-indigo-500/40 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-indigo-400 font-bold">
                        [{idx + 1}] PREPRINT // ARTIFACT
                      </span>
                      <h3 className="font-serif font-bold text-lg text-white leading-snug break-words">
                        {p.title}
                      </h3>
                    </div>
                    <button
                      onClick={() => handleCopyBibtex(p.title, p.title || `ref_${idx}`)}
                      className="shrink-0 px-2.5 py-1 rounded bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-all"
                    >
                      {copiedDoi === (p.title || `ref_${idx}`) ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>BibTeX Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-indigo-400" />
                          <span>Cite BibTeX</span>
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans break-words">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800/80 font-mono text-xs">
                    <div className="flex flex-wrap gap-1.5">
                      {(p.technologies || []).map((tech: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded bg-indigo-950/50 border border-indigo-900/50 text-indigo-300 text-[10px]"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {p.githubUrl && (
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-stone-400 hover:text-white flex items-center gap-1"
                        >
                          <span>Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      {p.liveUrl && (
                        <a
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
                        >
                          <span>DOI / Artifact</span>
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

        {/* Academic Credentials & Degrees */}
        {isSectionVisible("education") && education.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              Academic Background &amp; Fellowships
            </h2>

            <div className="space-y-4">
              {education.map((edu: any, idx: number) => (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">{edu.institution}</h3>
                    <p className="text-sm text-indigo-400 font-sans">{edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}</p>
                  </div>
                  <div className="text-right sm:text-right font-mono text-xs text-stone-400">
                    <span>{edu.startDate || "2020"} &mdash; {edu.endDate || "Present"}</span>
                    {edu.gpa && <span className="block text-indigo-300">GPA: {edu.gpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Technical Domain Knowledge */}
        {isSectionVisible("skills") && skills.length > 0 && (
          <section className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-white tracking-tight">
              Fields of Competence &amp; Tools
            </h2>

            <div className="p-6 rounded-2xl bg-stone-900/60 border border-stone-800 flex flex-wrap gap-2">
              {skills.map((s: any, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-stone-800 border border-stone-700 text-stone-200 text-xs font-mono"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* CV Export Callout */}
        {isSectionVisible("contact") && (
          <section className="p-8 rounded-3xl bg-gradient-to-br from-indigo-950/80 to-stone-900 border border-indigo-800/40 text-center space-y-4">
            <h2 className="text-2xl font-serif font-bold text-white">
              Curriculum Vitae &amp; Research Portfolio
            </h2>
            <p className="text-sm text-stone-300 max-w-md mx-auto font-sans">
              Download full academic CV including conference committee appointments, grant history, and citation metrics.
            </p>
            <div className="pt-2">
              <Link
                href={`/builder/${resume.id || "sample"}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold text-sm transition-all shadow-lg shadow-indigo-600/30"
              >
                <Download className="w-4 h-4" />
                <span>Export Academic CV (PDF)</span>
              </Link>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-stone-800 text-xs text-stone-500 font-mono">
          <p>Scholarly Portfolio • Synthesized via Novus Resume AI</p>
        </footer>
      </main>
    </div>
  );
}
