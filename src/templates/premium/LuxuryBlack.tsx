import React from "react";
import { TemplateProps, ContactList, SectionTitle, ProfileAvatar } from "../common/TemplateSections";

export function LuxuryBlack({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = "#e2e8f0"; // Platinum accent on Dark

  return (
    <div className={`p-8 sm:p-12 text-slate-100 bg-slate-950 leading-relaxed font-sans ${className}`}>
      {/* Luxury Dark Header */}
      <header className="border-b border-slate-800 pb-6 mb-6 flex items-center justify-between gap-4">
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white uppercase">
                {personalInfo.fullName || "Your Full Name"}
              </h1>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mt-1">
                {personalInfo.jobTitle || "Executive & Tech Leader"}
              </p>
            </div>
          </div>
          <ContactList data={data} containerClass="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-400" itemClass="text-slate-300" iconClass="w-3.5 h-3.5 text-slate-400" />
        </div>
        <ProfileAvatar data={data} size="lg" className="border-2 border-slate-700 shadow-lg shadow-black/60" />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Executive Profile</h3>
          <p className="text-xs text-slate-300 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Career History</h3>
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs border-l border-slate-800 pl-3">
                <div className="flex justify-between font-bold text-white">
                  <span className="text-sm">{exp.position}</span>
                  <span className="text-slate-400 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs text-slate-300 font-semibold">{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
                {exp.description && <p className="text-slate-300">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside space-y-0.5 pt-1 text-slate-300">
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
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Key Competencies</h3>
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((s) => (
                <span key={s.id} className="px-2.5 py-1 rounded bg-slate-900 text-slate-200 border border-slate-800 font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Education</h3>
            <div className="space-y-2 text-xs text-slate-300">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="font-bold text-white">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-400">{edu.institution} ({edu.startDate} – {edu.endDate || "Present"})</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
