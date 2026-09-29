import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function VisualArtist({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#a855f7"; // Creative Violet

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Visual Artist Header */}
      <header className="p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white mb-8">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight">{personalInfo.fullName || "Artist Name"}</h1>
        <p className="text-sm font-bold text-purple-300 mt-1 uppercase tracking-widest">{personalInfo.jobTitle || "Visual Artist & UI Designer"}</p>
        <ContactList data={data} containerClass="flex flex-wrap items-center gap-4 pt-4 text-xs text-white/80" itemClass="text-white" iconClass="w-3.5 h-3.5 text-purple-300" />
      </header>

      {/* Body */}
      <div className="space-y-6">
        {personalInfo.summary && (
          <section>
            <SectionTitle title="Artist Statement" accentColor={accentColor} variant="line" />
            <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
          </section>
        )}

        {projects.length > 0 && (
          <section>
            <SectionTitle title="Exhibitions & Key Projects" accentColor={accentColor} variant="line" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-2xl border border-purple-100 bg-purple-50/30 space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600 leading-normal">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {experience.length > 0 && (
          <section>
            <SectionTitle title="Experience" accentColor={accentColor} variant="line" />
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="text-sm">{exp.position} – <span className="text-purple-600">{exp.company}</span></span>
                    <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
                  {exp.description && <p className="text-slate-700">{exp.description}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {skills.length > 0 && (
          <section>
            <SectionTitle title="Mediums & Disciplines" accentColor={accentColor} variant="line" />
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((s) => (
                <span key={s.id} className="px-3 py-1 rounded-full font-bold bg-purple-100 text-purple-900">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
