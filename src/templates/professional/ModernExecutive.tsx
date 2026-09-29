import React from "react";
import { TemplateProps, ContactList, SectionTitle, ProfileAvatar } from "../common/TemplateSections";

export function ModernExecutive({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#0f766e"; // Executive Emerald/Teal

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b-2" style={{ borderColor: accentColor }}>
        <div className="flex items-center gap-4">
          <ProfileAvatar data={data} />
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{personalInfo.fullName || "Your Full Name"}</h1>
            <p className="text-sm font-bold uppercase tracking-wider mt-1" style={{ color: accentColor }}>{personalInfo.jobTitle || "Executive Leader"}</p>
          </div>
        </div>
        <div className="sm:text-right">
          <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-600" />
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Executive Overview" accentColor={accentColor} variant="badge" />
          <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Leadership Experience" accentColor={accentColor} variant="badge" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-slate-900 text-sm">{exp.position}</span>
                  <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs font-bold text-slate-700">{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
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

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Core Competencies" accentColor={accentColor} variant="badge" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            {skills.map((s) => (
              <div key={s.id} className="p-2 rounded bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                {s.name} {s.level ? `(${s.level})` : ""}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education & Honors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {education.length > 0 && (
          <section>
            <SectionTitle title="Education" accentColor={accentColor} variant="badge" />
            <div className="space-y-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-600">{edu.institution}</p>
                  <p className="text-[11px] text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {certifications.length > 0 && (
          <section>
            <SectionTitle title="Certifications" accentColor={accentColor} variant="badge" />
            <div className="space-y-2 text-xs">
              {certifications.map((c) => (
                <div key={c.id}>
                  <p className="font-bold text-slate-900">{c.name}</p>
                  <p className="text-slate-600">{c.issuer} ({c.issueDate})</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
