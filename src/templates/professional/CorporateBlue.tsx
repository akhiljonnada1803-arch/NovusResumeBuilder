import React from "react";
import { TemplateProps, ContactList, SectionTitle, ProfileAvatar } from "../common/TemplateSections";

export function CorporateBlue({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#1d4ed8"; // Corporate Royal Blue

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Top Banner Header */}
      <header className="p-6 rounded-2xl mb-6 text-white flex items-center justify-between gap-4" style={{ backgroundColor: accentColor }}>
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">{personalInfo.fullName || "Your Full Name"}</h1>
          <p className="text-sm font-bold text-white/90 uppercase tracking-wider mt-1">{personalInfo.jobTitle || "Business Leader"}</p>
          <ContactList
            data={data}
            containerClass="flex flex-wrap items-center gap-4 pt-3 text-xs text-white/80"
            itemClass="flex items-center gap-1 text-white/90 font-medium"
            iconClass="w-3.5 h-3.5 text-white"
          />
        </div>
        <ProfileAvatar data={data} className="border-white/40 shadow-md" />
      </header>

      {/* 2-Column Split Body */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Main (8 cols): Experience & Projects */}
        <div className="md:col-span-8 space-y-6">
          {personalInfo.summary && (
            <section>
              <SectionTitle title="Executive Profile" accentColor={accentColor} />
              <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
            </section>
          )}

          {experience.length > 0 && (
            <section>
              <SectionTitle title="Career History" accentColor={accentColor} />
              <div className="space-y-4">
                {experience.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-slate-900 text-sm">{exp.position}</span>
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

          {projects.length > 0 && (
            <section>
              <SectionTitle title="Key Projects & Deliverables" accentColor={accentColor} />
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id} className="text-xs space-y-0.5">
                    <h4 className="font-bold text-slate-900">{proj.title}</h4>
                    <p className="text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar (4 cols): Skills, Education, Certifications */}
        <div className="md:col-span-4 space-y-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          {skills.length > 0 && (
            <section>
              <SectionTitle title="Core Expertise" accentColor={accentColor} />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {skills.map((s) => (
                  <span key={s.id} className="text-xs px-2.5 py-1 rounded bg-white border border-slate-200 font-semibold text-slate-800">
                    {s.name}
                  </span>
                ))}
              </div>
            </section>
          )}

          {education.length > 0 && (
            <section>
              <SectionTitle title="Education" accentColor={accentColor} />
              <div className="space-y-3 text-xs">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="font-bold text-slate-900">{edu.degree}</p>
                    <p className="text-slate-600">{edu.fieldOfStudy}</p>
                    <p className="text-slate-500">{edu.institution} ({edu.startDate} – {edu.endDate || "Present"})</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {certifications.length > 0 && (
            <section>
              <SectionTitle title="Certifications" accentColor={accentColor} />
              <div className="space-y-2 text-xs">
                {certifications.map((c) => (
                  <div key={c.id}>
                    <p className="font-bold text-slate-900">{c.name}</p>
                    <p className="text-slate-500">{c.issuer} ({c.issueDate})</p>
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
