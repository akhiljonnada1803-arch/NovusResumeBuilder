import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function GraduateStarter({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#2563eb"; // Blue starter

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Graduate Header */}
      <header className="border-b-2 pb-5 mb-6 text-center" style={{ borderColor: accentColor }}>
        <h1 className="text-3xl font-black text-slate-900">{personalInfo.fullName || "Graduate Name"}</h1>
        <p className="text-xs font-bold uppercase tracking-wider mt-1 text-blue-600">{personalInfo.jobTitle || "Computer Science Graduate"}</p>
        <ContactList data={data} containerClass="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs text-slate-600" />
      </header>

      {/* Education First for Students */}
      {education.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Education & Academic Honors" accentColor={accentColor} />
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{edu.degree} in {edu.fieldOfStudy}</h4>
                  <p className="text-blue-700 font-semibold">{edu.institution} {edu.location ? `• ${edu.location}` : ""}</p>
                  {edu.description && <p className="text-slate-600 mt-1">{edu.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  <span className="font-semibold text-slate-500">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
                  {edu.gpa && <p className="font-black text-blue-900 mt-0.5">GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Technical & Coursework Skills" accentColor={accentColor} />
          <div className="flex flex-wrap gap-1.5 text-xs">
            {skills.map((s) => (
              <span key={s.id} className="px-2.5 py-1 rounded bg-slate-100 text-slate-800 font-semibold border border-slate-200">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Academic & Personal Projects */}
      {projects.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Academic & Personal Projects" accentColor={accentColor} />
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>{p.title}</span>
                  <span className="text-slate-500 font-normal">{p.startDate || ""}</span>
                </div>
                {p.technologies && <p className="text-[11px] text-blue-600 font-semibold">Technologies: {p.technologies.join(", ")}</p>}
                <p className="text-slate-700 leading-normal">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Internships & Work Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Internships & Work Experience" accentColor={accentColor} />
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

      {/* Achievements & Activities */}
      {achievements.length > 0 && (
        <section>
          <SectionTitle title="Activities & Honors" accentColor={accentColor} />
          <div className="space-y-1 text-xs text-slate-800">
            {achievements.map((a) => (
              <p key={a.id}>• <span className="font-bold">{a.title}</span>: {a.description}</p>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
