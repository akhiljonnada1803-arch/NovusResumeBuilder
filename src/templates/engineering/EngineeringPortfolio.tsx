import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function EngineeringPortfolio({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#059669"; // Emerald Engineering

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Portfolio Header with Accent Color Block */}
      <header className="p-6 rounded-2xl mb-6 bg-slate-900 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black">{personalInfo.fullName || "Engineer Name"}</h1>
          <p className="text-xs font-mono font-bold mt-1 text-emerald-400">{personalInfo.jobTitle || "Lead Engineer & Architect"}</p>
        </div>
        <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-300 font-mono" itemClass="text-slate-200" iconClass="w-3.5 h-3.5 text-emerald-400" />
      </header>

      {/* Grid of Projects & Experience */}
      <div className="space-y-6">
        {/* Projects Spotlight */}
        {projects.length > 0 && (
          <section>
            <SectionTitle title="Engineering Portfolio" accentColor={accentColor} variant="line" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {projects.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <h4 className="font-bold text-xs text-slate-900">{p.title}</h4>
                  <p className="text-xs text-slate-600 leading-normal">{p.description}</p>
                  {p.technologies && (
                    <p className="text-[10px] font-mono font-semibold pt-1" style={{ color: accentColor }}>
                      Stack: {p.technologies.join(" • ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <SectionTitle title="Experience & Leadership" accentColor={accentColor} variant="line" />
            <div className="space-y-4">
              {experience.map((exp) => (
                <div key={exp.id} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span className="text-sm">{exp.position} – {exp.company}</span>
                    <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                  </div>
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

        {/* Skills & Education */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {skills.length > 0 && (
            <section>
              <SectionTitle title="Tech Stack" accentColor={accentColor} variant="line" />
              <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                {skills.map((s) => (
                  <span key={s.id} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px]">
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle title="Education" accentColor={accentColor} variant="line" />
              <div className="space-y-2 text-xs">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-slate-600">{edu.institution} ({edu.startDate} – {edu.endDate || "Present"})</p>
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
