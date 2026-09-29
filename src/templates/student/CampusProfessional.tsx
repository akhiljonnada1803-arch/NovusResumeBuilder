import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function CampusProfessional({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#4f46e5"; // Indigo

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Header with Subtle Gradient Underline */}
      <header className="pb-5 mb-6 border-b-2" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl font-black text-slate-900">{personalInfo.fullName || "Student Name"}</h1>
        <p className="text-sm font-bold mt-1" style={{ color: accentColor }}>{personalInfo.jobTitle || "University Graduate"}</p>
        <ContactList data={data} containerClass="flex flex-wrap items-center gap-3 pt-2 text-xs text-slate-600" />
      </header>

      {/* Education First */}
      {education.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Education" accentColor={accentColor} variant="line" />
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs flex justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                  <p className="text-slate-600">{edu.institution} {edu.gpa ? `• GPA: ${edu.gpa}` : ""}</p>
                </div>
                <span className="text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Technical Projects" accentColor={accentColor} variant="line" />
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{p.title}</span>
                  <span className="text-slate-500 font-normal">{p.startDate || ""}</span>
                </div>
                {p.technologies && <p className="text-[11px] font-semibold" style={{ color: accentColor }}>Stack: {p.technologies.join(", ")}</p>}
                <p className="text-slate-700">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internships */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Internships & Experience" accentColor={accentColor} variant="line" />
          <div className="space-y-3 text-xs">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{exp.position} – {exp.company}</span>
                  <span className="text-slate-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.description && <p className="text-slate-700">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section>
          <SectionTitle title="Skills & Competencies" accentColor={accentColor} variant="line" />
          <div className="flex flex-wrap gap-1.5 text-xs">
            {skills.map((s) => (
              <span key={s.id} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
