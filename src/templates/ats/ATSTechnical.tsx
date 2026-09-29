import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function ATSTechnical({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#2563eb"; // Technical Blue

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-mono ${className}`}>
      {/* Header */}
      <header className="border-b-2 pb-4 mb-5" style={{ borderColor: accentColor }}>
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: accentColor }}>
              {personalInfo.fullName || "Developer Name"}
            </h1>
            <p className="text-xs font-bold text-slate-700 font-sans mt-0.5">
              {personalInfo.jobTitle || "Senior Software Engineer"}
            </p>
          </div>
        </div>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center gap-3 pt-2 text-xs font-sans"
          iconClass="w-3 h-3 text-slate-500"
        />
      </header>

      {/* Skills Matrix - Placed prominent for technical screening */}
      {skills.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Technical Skillset" accentColor={accentColor} variant="filled" />
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
            <p><span className="font-bold">Languages & Core:</span> {skills.filter((s) => s.category === "Languages" || s.category === "Technical").map((s) => s.name).join(", ") || skills.slice(0, 6).map((s) => s.name).join(", ")}</p>
            <p><span className="font-bold">Frameworks & Tools:</span> {skills.filter((s) => s.category === "Frameworks" || s.category === "Tools").map((s) => s.name).join(", ") || skills.slice(6).map((s) => s.name).join(", ")}</p>
          </div>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-5 font-sans">
          <SectionTitle title="Work Experience" accentColor={accentColor} variant="filled" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold">
                  <span className="text-sm font-black text-slate-900">{exp.position}</span>
                  <span className="font-mono text-[11px] text-slate-600">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs font-bold" style={{ color: accentColor }}>
                  {exp.company} {exp.location ? `• ${exp.location}` : ""}
                </div>
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

      {/* Engineering Projects */}
      {projects.length > 0 && (
        <section className="mb-5 font-sans">
          <SectionTitle title="Open Source & Technical Projects" accentColor={accentColor} variant="filled" />
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{proj.title}</span>
                  <span className="font-mono text-[11px] text-slate-500">{proj.startDate || ""}</span>
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] font-mono font-semibold" style={{ color: accentColor }}>
                    Stack: [{proj.technologies.join(", ")}]
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
        <section className="mb-5 font-sans">
          <SectionTitle title="Education" accentColor={accentColor} variant="filled" />
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs flex justify-between">
                <div>
                  <p className="font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-600">{edu.institution}</p>
                </div>
                <span className="font-mono text-[11px] text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <section className="font-sans">
          <SectionTitle title="Verified Certifications" accentColor={accentColor} variant="filled" />
          <div className="space-y-1 text-xs text-slate-800">
            {certifications.map((c) => (
              <p key={c.id}><span className="font-bold">{c.name}</span> – {c.issuer} ({c.issueDate})</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
