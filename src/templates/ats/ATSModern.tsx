import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function ATSModern({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#0284c7"; // Modern Teal/Cyan accent

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Centered Modern Header with Accent Badge */}
      <header className="text-center pb-5 mb-5 border-b border-slate-200">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold my-2" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
          {personalInfo.jobTitle || "Professional Title"}
        </div>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center justify-center gap-3 pt-1 text-xs text-slate-600"
          iconClass="w-3 h-3"
        />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <SectionTitle title="Summary" accentColor={accentColor} variant="line" />
          <p className="text-xs text-slate-700 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Experience" accentColor={accentColor} variant="line" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold text-slate-900">
                  <span className="text-sm">{exp.position}</span>
                  <span className="text-[11px] font-normal text-slate-500">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                <div className="text-xs font-semibold" style={{ color: accentColor }}>
                  {exp.company} {exp.location ? `• ${exp.location}` : ""}
                </div>
                {exp.description && <p className="text-xs text-slate-700">{exp.description}</p>}
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

      {/* Skills Matrix */}
      {skills.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Key Skills & Technologies" accentColor={accentColor} variant="line" />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {skills.map((s) => (
              <span
                key={s.id}
                className="text-xs px-2.5 py-1 rounded-md font-semibold bg-slate-100 text-slate-800 border border-slate-200"
              >
                {s.name} {s.level ? `• ${s.level}` : ""}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Projects" accentColor={accentColor} variant="line" />
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  {proj.startDate && <span className="font-normal text-slate-500">{proj.startDate}</span>}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] font-semibold" style={{ color: accentColor }}>
                    {proj.technologies.join(" • ")}
                  </p>
                )}
                <p className="text-slate-700">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Education" accentColor={accentColor} variant="line" />
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs flex justify-between">
                <div>
                  <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
                <span className="text-[11px] text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Achievements */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section>
          <SectionTitle title="Certifications & Honors" accentColor={accentColor} variant="line" />
          <div className="space-y-1 text-xs text-slate-800">
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
