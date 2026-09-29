import React from "react";
import { TemplateProps, ContactList, SectionTitle, ProfileAvatar } from "../common/TemplateSections";

export function CreativePortfolio({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#ec4899"; // Creative Vibrant Pink

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Creative Header */}
      <header className="pb-6 mb-6 border-b-4 flex items-center justify-between gap-4" style={{ borderColor: accentColor }}>
        <div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight" style={{ color: accentColor }}>
            {personalInfo.fullName || "Creative Director"}
          </h1>
          <p className="text-sm font-bold text-slate-800 tracking-wider uppercase mt-1">
            {personalInfo.jobTitle || "Lead UX / UI Product Designer"}
          </p>
          <ContactList data={data} containerClass="flex flex-wrap items-center gap-4 pt-3 text-xs text-slate-600" />
        </div>
        <ProfileAvatar data={data} size="lg" className="border-2 shadow-md" />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Design Philosophy & Vision" accentColor={accentColor} variant="line" />
          <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Visual Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Featured Case Studies & Work" accentColor={accentColor} variant="line" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-pink-100 bg-pink-50/40 space-y-1.5">
                <h4 className="font-bold text-sm text-slate-900">{p.title}</h4>
                {p.subtitle && <p className="text-xs text-pink-600 font-semibold">{p.subtitle}</p>}
                <p className="text-xs text-slate-600 leading-normal">{p.description}</p>
                {p.technologies && (
                  <p className="text-[10px] font-bold text-pink-600 pt-1">
                    Tools: {p.technologies.join(" • ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Creative Experience" accentColor={accentColor} variant="line" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between font-bold text-slate-900">
                  <span className="text-sm">{exp.position} – <span style={{ color: accentColor }}>{exp.company}</span></span>
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
            <SectionTitle title="Design & Technical Skills" accentColor={accentColor} variant="line" />
            <div className="flex flex-wrap gap-1.5 text-xs">
              {skills.map((s) => (
                <span key={s.id} className="px-3 py-1 rounded-full font-bold bg-pink-100 text-pink-900 border border-pink-200">
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
