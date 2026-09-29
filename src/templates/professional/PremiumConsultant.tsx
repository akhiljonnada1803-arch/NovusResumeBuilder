import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function PremiumConsultant({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#047857"; // Consultant Forest Emerald

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Consultant Header */}
      <header className="pb-6 mb-6 border-b-2" style={{ borderColor: accentColor }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {personalInfo.fullName || "Your Full Name"}
            </h1>
            <p className="text-sm font-bold uppercase tracking-wider mt-1" style={{ color: accentColor }}>
              {personalInfo.jobTitle || "Management Consultant & Strategist"}
            </p>
          </div>
          <ContactList data={data} containerClass="flex flex-col sm:items-end gap-1 text-xs text-slate-600" />
        </div>
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Engagement Highlights" accentColor={accentColor} variant="filled" />
          <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Consulting & Advisory Engagements" accentColor={accentColor} variant="filled" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                  <span className="text-sm">{exp.position}</span>
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

      {/* Skills & Projects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {skills.length > 0 && (
          <section>
            <SectionTitle title="Functional Capabilities" accentColor={accentColor} variant="filled" />
            <div className="space-y-1 text-xs text-slate-800">
              {skills.map((s) => (
                <div key={s.id} className="flex justify-between border-b border-slate-100 py-1">
                  <span className="font-semibold">{s.name}</span>
                  <span className="text-slate-500">{s.level || "Expert"}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionTitle title="Education" accentColor={accentColor} variant="filled" />
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
