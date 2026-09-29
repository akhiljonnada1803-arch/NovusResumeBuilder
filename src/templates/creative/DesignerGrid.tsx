import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function DesignerGrid({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#f97316"; // Tangerine Orange

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Designer Grid Header */}
      <header className="grid grid-cols-1 md:grid-cols-12 gap-4 pb-6 mb-6 border-b-2 border-slate-900">
        <div className="md:col-span-7">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{personalInfo.fullName || "Designer Name"}</h1>
          <p className="text-sm font-bold text-orange-600 mt-1 uppercase tracking-wider">{personalInfo.jobTitle || "Product & Graphic Designer"}</p>
        </div>
        <div className="md:col-span-5 flex flex-col justify-center">
          <ContactList data={data} containerClass="flex flex-col gap-1 text-xs text-slate-600" />
        </div>
      </header>

      {/* Grid Layout Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {personalInfo.summary && (
            <section>
              <SectionTitle title="Profile" accentColor={accentColor} variant="line" />
              <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionTitle title="Experience" accentColor={accentColor} variant="line" />
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span className="text-sm">{exp.position}</span>
                      <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                    </div>
                    <div className="text-xs font-semibold text-orange-600">{exp.company}</div>
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
        </div>

        {/* Right Column (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          {projects.length > 0 && (
            <section>
              <SectionTitle title="Selected Works" accentColor={accentColor} variant="line" />
              <div className="space-y-3">
                {projects.map((p) => (
                  <div key={p.id} className="p-3 rounded-xl bg-orange-50/50 border border-orange-100 space-y-1 text-xs">
                    <h4 className="font-bold text-slate-900">{p.title}</h4>
                    <p className="text-slate-600">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {skills.length > 0 && (
            <section>
              <SectionTitle title="Toolbox" accentColor={accentColor} variant="line" />
              <div className="flex flex-wrap gap-1.5 text-xs">
                {skills.map((s) => (
                  <span key={s.id} className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-semibold">
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
