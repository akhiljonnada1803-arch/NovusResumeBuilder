import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function FullStackEngineer({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#8b5cf6"; // FullStack Purple

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b-2" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{personalInfo.fullName || "Engineer Name"}</h1>
          <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>{personalInfo.jobTitle || "Full-Stack Software Engineer"}</p>
        </div>
        <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-600 font-mono" />
      </header>

      {/* 2-Column Split */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Content (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          {personalInfo.summary && (
            <section>
              <SectionTitle title="Architecture & Engineering Profile" accentColor={accentColor} />
              <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionTitle title="Experience" accentColor={accentColor} />
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-slate-900 text-sm">{exp.position}</span>
                      <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <div className="text-xs font-bold" style={{ color: accentColor }}>{exp.company}</div>
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

          {projects.length > 0 && (
            <section>
              <SectionTitle title="Systems & Applications" accentColor={accentColor} />
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs space-y-0.5">
                    <h4 className="font-bold text-slate-900">{proj.title}</h4>
                    <p className="text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar (4 cols) */}
        <div className="md:col-span-4 space-y-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {skills.length > 0 && (
            <section>
              <SectionTitle title="Stack Matrix" accentColor={accentColor} />
              <div className="space-y-1 text-xs">
                {skills.map((s) => (
                  <div key={s.id} className="flex justify-between py-0.5 border-b border-slate-200">
                    <span className="font-semibold text-slate-800">{s.name}</span>
                    <span className="text-slate-500 font-mono text-[10px]">{s.level || "Proficient"}</span>
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
