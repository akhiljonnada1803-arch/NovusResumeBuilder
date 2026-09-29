import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function ATSMinimal({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements } = data;
  const accentColor = "#334155"; // Slate Minimal

  return (
    <div className={`p-8 sm:p-10 text-slate-800 bg-white leading-snug font-sans text-xs ${className}`}>
      {/* Minimal Header */}
      <header className="mb-4 pb-2 border-b border-slate-300">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-xs text-slate-600 font-medium">{personalInfo.jobTitle || "Job Title"}</p>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-500"
          iconClass="w-3 h-3 text-slate-400"
        />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-4">
          <SectionTitle title="Summary" accentColor={accentColor} variant="minimal" />
          <p className="text-[11px] text-slate-700 leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-4">
          <SectionTitle title="Experience" accentColor={accentColor} variant="minimal" />
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.position} – <span className="font-normal text-slate-700">{exp.company}</span></span>
                  <span className="text-[10px] font-normal text-slate-500">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.description && <p className="text-[11px] text-slate-600">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-[11px] space-y-0.5 text-slate-700">
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

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section className="mb-4">
          <SectionTitle title="Skills" accentColor={accentColor} variant="minimal" />
          <p className="text-[11px] text-slate-700">
            {skills.map((s) => s.name).join(" • ")}
          </p>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-4">
          <SectionTitle title="Projects" accentColor={accentColor} variant="minimal" />
          <div className="space-y-2">
            {projects.map((proj) => (
              <div key={proj.id} className="text-[11px] space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  {proj.startDate && <span className="font-normal text-slate-500">{proj.startDate}</span>}
                </div>
                <p className="text-slate-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-4">
          <SectionTitle title="Education" accentColor={accentColor} variant="minimal" />
          <div className="space-y-1.5">
            {education.map((edu) => (
              <div key={edu.id} className="text-[11px] flex justify-between">
                <div>
                  <span className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</span>, {edu.institution}
                </div>
                <span className="text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Honors */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section>
          <SectionTitle title="Certifications & Honors" accentColor={accentColor} variant="minimal" />
          <div className="space-y-0.5 text-[11px] text-slate-700">
            {certifications.map((c) => (
              <p key={c.id}><span className="font-bold">{c.name}</span> – {c.issuer}</p>
            ))}
            {achievements.map((a) => (
              <p key={a.id}><span className="font-bold">{a.title}</span>: {a.description}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
