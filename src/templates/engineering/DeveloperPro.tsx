import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";
import { GithubIcon } from "@/components/shared/icons";

export function DeveloperPro({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#3b82f6"; // Dev Blue

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Dev Header with Dark Monospace Tag */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{personalInfo.fullName || "Developer Name"}</h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-900 text-white font-bold">DEV.PRO</span>
          </div>
          <p className="text-sm font-bold text-slate-600 mt-1">{personalInfo.jobTitle || "Senior Software Engineer"}</p>
        </div>
        <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-600 font-mono" />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Technical Summary" accentColor={accentColor} variant="line" />
          <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Featured Projects - High Prominence for Devs */}
      {projects.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Featured Projects & Open Source" accentColor={accentColor} variant="line" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((proj) => (
              <div key={proj.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-xs text-slate-900">{proj.title}</h4>
                  {proj.githubUrl && <span className="text-[10px] text-slate-500 font-mono">GitHub</span>}
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">{proj.description}</p>
                {proj.technologies && proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((t, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.2 rounded bg-white text-slate-700 font-mono border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Work Experience" accentColor={accentColor} variant="line" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-sm text-slate-900">{exp.position}</span>
                  <span className="font-mono text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs font-bold" style={{ color: accentColor }}>{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
                {exp.description && <p className="text-xs text-slate-700">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-slate-800">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Stack */}
      {skills.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Technical Matrix" accentColor={accentColor} variant="line" />
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {skills.map((s) => (
              <span key={s.id} className="px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200 font-semibold">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <SectionTitle title="Education" accentColor={accentColor} variant="line" />
          <div className="space-y-2 text-xs">
            {education.map((edu) => (
              <div key={edu.id} className="flex justify-between">
                <div>
                  <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
                <span className="font-mono text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
