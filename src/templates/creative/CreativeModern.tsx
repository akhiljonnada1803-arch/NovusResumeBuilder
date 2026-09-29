import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function CreativeModern({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#14b8a6"; // Modern Creative Teal

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Modern Creative Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b-2" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">{personalInfo.fullName || "Creative Leader"}</h1>
          <p className="text-xs font-bold tracking-widest uppercase mt-1" style={{ color: accentColor }}>{personalInfo.jobTitle || "Art & Product Director"}</p>
        </div>
        <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-600" />
      </header>

      {/* 2-Column Balanced */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8 space-y-6">
          {personalInfo.summary && (
            <section>
              <SectionTitle title="Creative Vision" accentColor={accentColor} />
              <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionTitle title="Work History" accentColor={accentColor} />
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="text-sm">{exp.position}</span>
                      <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <div className="font-semibold text-teal-600">{exp.company}</div>
                    {exp.description && <p className="text-slate-700">{exp.description}</p>}
                    {exp.highlights && exp.highlights.length > 0 && (
                      <ul className="list-disc list-inside space-y-0.5 pt-1 text-slate-800">
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
        </div>

        <div className="md:col-span-4 space-y-6">
          {skills.length > 0 && (
            <section>
              <SectionTitle title="Skills" accentColor={accentColor} />
              <div className="flex flex-wrap gap-1.5 text-xs">
                {skills.map((s) => (
                  <span key={s.id} className="px-2.5 py-1 rounded bg-teal-50 text-teal-900 font-semibold border border-teal-200">
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {projects.length > 0 && (
            <section>
              <SectionTitle title="Projects" accentColor={accentColor} />
              <div className="space-y-2 text-xs">
                {projects.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <p className="font-bold text-slate-900">{p.title}</p>
                    <p className="text-[11px] text-slate-600">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle title="Education" accentColor={accentColor} />
              <div className="space-y-2 text-xs">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-slate-600">{edu.institution}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
