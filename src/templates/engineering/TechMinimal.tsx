import React from "react";
import { TemplateProps, ContactList } from "../common/TemplateSections";

export function TechMinimal({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills } = data;

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-mono text-xs ${className}`}>
      {/* Terminal-inspired Minimal Header */}
      <header className="pb-4 mb-6 border-b border-slate-300">
        <div className="flex justify-between items-baseline">
          <h1 className="text-2xl font-black text-slate-900">{personalInfo.fullName || "alex.rivera"}</h1>
          <span className="text-slate-500 font-bold">~/{personalInfo.jobTitle || "software-engineer"}</span>
        </div>
        <ContactList data={data} containerClass="flex flex-wrap items-center gap-3 pt-2 text-[11px] text-slate-600" />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <p className="text-slate-500 font-bold mb-1">{"// Bio"}</p>
          <p className="text-slate-800 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-5">
          <p className="text-slate-500 font-bold mb-1">{"// Stack"}</p>
          <p className="text-slate-800 font-semibold">{skills.map((s) => s.name).join(" • ")}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <p className="text-slate-500 font-bold mb-2">{"// Experience"}</p>
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.position} @ {exp.company}</span>
                  <span className="text-slate-500 font-normal">{exp.startDate} - {exp.current ? "present" : exp.endDate}</span>
                </div>
                {exp.description && <p className="text-slate-700">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-0.5 pt-0.5 text-slate-800">
                    {exp.highlights.map((h, i) => (
                      <li key={i}>&gt; {h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <p className="text-slate-500 font-bold mb-2">{"// Projects"}</p>
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id} className="space-y-0.5">
                <p className="font-bold text-slate-900">{proj.title} {proj.technologies && `[${proj.technologies.join(", ")}]`}</p>
                <p className="text-slate-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section>
          <p className="text-slate-500 font-bold mb-1">{"// Education"}</p>
          {education.map((edu) => (
            <p key={edu.id} className="text-slate-800">{edu.degree} in {edu.fieldOfStudy} @ {edu.institution} ({edu.startDate} - {edu.endDate || "present"})</p>
          ))}
        </section>
      )}
    </div>
  );
}
