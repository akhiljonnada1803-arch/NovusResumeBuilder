import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function EliteExecutive({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#0f172a"; // Deep Slate Elite

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Elite Executive Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 pb-6 mb-6 border-b-4 border-slate-900">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 uppercase">
            {personalInfo.fullName || "Your Full Name"}
          </h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mt-1">
            {personalInfo.jobTitle || "Chief Technology Officer / C-Suite Executive"}
          </p>
        </div>
        <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-600 font-medium" />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Executive Leadership & Board Profile" accentColor={accentColor} variant="line" />
          <p className="text-xs text-slate-800 leading-normal font-medium">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Executive Experience & Track Record" accentColor={accentColor} variant="line" />
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="text-sm uppercase tracking-tight">{exp.position}</span>
                  <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="font-semibold text-slate-700">{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
                {exp.description && <p className="text-slate-700">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-1 pt-1 text-slate-800">
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

      {/* Board & Academic */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {skills.length > 0 && (
          <section>
            <SectionTitle title="Core Leadership Domains" accentColor={accentColor} variant="line" />
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-800 font-semibold">
              {skills.map((s) => (
                <div key={s.id} className="p-1.5 bg-slate-50 rounded border border-slate-200">
                  {s.name}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionTitle title="Education & Credentials" accentColor={accentColor} variant="line" />
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
  );
}
