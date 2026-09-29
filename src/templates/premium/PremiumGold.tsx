import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function PremiumGold({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#d97706"; // Premium Warm Gold/Amber

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-serif ${className}`}>
      {/* Gold Accented Header */}
      <header className="border-b-2 pb-6 mb-6" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">{personalInfo.fullName || "Your Full Name"}</h1>
        <p className="text-xs font-sans font-black uppercase tracking-widest mt-1" style={{ color: accentColor }}>
          {personalInfo.jobTitle || "Senior Executive & Managing Director"}
        </p>
        <ContactList data={data} containerClass="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-600 font-sans" iconClass="w-3.5 h-3.5 text-amber-600" />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Executive Brief" accentColor={accentColor} variant="line" />
          <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6 font-sans">
          <SectionTitle title="Executive Appointments & History" accentColor={accentColor} variant="line" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="text-sm">{exp.position}</span>
                  <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="font-semibold text-amber-700">{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
        {skills.length > 0 && (
          <section>
            <SectionTitle title="Strategic Capabilities" accentColor={accentColor} variant="line" />
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((s) => (
                <span key={s.id} className="px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-200 font-semibold">
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
  );
}
