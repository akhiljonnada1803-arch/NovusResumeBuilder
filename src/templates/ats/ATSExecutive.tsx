import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function ATSExecutive({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#1e3a8a"; // Navy Executive tone

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Executive Header with Left Accent Line */}
      <header className="border-l-4 pl-4 pb-2 mb-6" style={{ borderColor: accentColor }}>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight uppercase" style={{ color: accentColor }}>
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mt-0.5">
          {personalInfo.jobTitle || "Executive / Management Professional"}
        </p>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center gap-4 pt-2"
          itemClass="text-[11px] text-slate-700 font-medium"
          iconClass="w-3 h-3 text-slate-500"
        />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <SectionTitle title="Executive Profile" accentColor={accentColor} variant="left-bar" />
          <p className="text-xs text-slate-800 leading-normal pl-3">{personalInfo.summary}</p>
        </section>
      )}

      {/* Professional Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Professional Experience" accentColor={accentColor} variant="left-bar" />
          <div className="space-y-4 pl-3">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-slate-900 text-[13px]">{exp.position}</span>
                  <span className="text-[11px] font-semibold text-slate-600">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-700">
                  <span style={{ color: accentColor }}>{exp.company}</span>
                  {exp.location && <span className="text-slate-500">{exp.location}</span>}
                </div>
                {exp.description && <p className="text-xs text-slate-700 mt-1">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-slate-800">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="leading-normal">{h}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Core Competencies Matrix */}
      {skills.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Areas of Expertise" accentColor={accentColor} variant="left-bar" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pl-3 text-xs text-slate-800">
            {skills.map((s) => (
              <div key={s.id} className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
                <span>{s.name}</span>
                {s.level && <span className="text-[10px] text-slate-500">({s.level})</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects / Initiatives */}
      {projects.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Strategic Projects & Leadership" accentColor={accentColor} variant="left-bar" />
          <div className="space-y-3 pl-3">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  <span className="font-normal text-[11px] text-slate-500">{proj.startDate || ""}</span>
                </div>
                <p className="text-slate-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Education & Credentials" accentColor={accentColor} variant="left-bar" />
          <div className="space-y-2 pl-3">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs flex justify-between">
                <div>
                  <p className="font-bold text-slate-900">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="text-slate-700">{edu.institution}</p>
                </div>
                <span className="text-[11px] text-slate-600">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Honors */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section>
          <SectionTitle title="Certifications & Honors" accentColor={accentColor} variant="left-bar" />
          <div className="space-y-1.5 pl-3 text-xs text-slate-800">
            {certifications.map((c) => (
              <p key={c.id}><span className="font-bold">{c.name}</span> – {c.issuer} ({c.issueDate})</p>
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
