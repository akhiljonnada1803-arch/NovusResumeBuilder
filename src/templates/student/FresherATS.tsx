import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function FresherATS({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements } = data;
  const accentColor = "#000000"; // Pure Black ATS for Fresher

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Centered Classic Header */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-sm font-bold text-slate-800 mt-0.5">{personalInfo.jobTitle || "Entry-Level Candidate"}</p>
        <ContactList data={data} containerClass="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-medium" iconClass="w-3 h-3 text-black" />
      </header>

      {/* Education First */}
      {education.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Education" accentColor={accentColor} />
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs flex justify-between">
                <div>
                  <p className="font-bold text-black">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-slate-700">{edu.institution}</p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p>{edu.startDate} – {edu.current ? "Present" : edu.endDate}</p>
                  {edu.gpa && <p className="font-bold text-black">GPA: {edu.gpa}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Skills & Knowledge" accentColor={accentColor} />
          <p className="text-xs text-slate-800">
            {skills.map((s) => s.name).join(" • ")}
          </p>
        </section>
      )}

      {/* Academic & Personal Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Key Projects" accentColor={accentColor} />
          <div className="space-y-3">
            {projects.map((p) => (
              <div key={p.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-black">
                  <span>{p.title}</span>
                  {p.startDate && <span className="font-normal text-slate-600 text-[11px]">{p.startDate}</span>}
                </div>
                {p.technologies && <p className="text-[11px] text-slate-700 italic">Technologies: {p.technologies.join(", ")}</p>}
                <p className="text-slate-800">{p.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Experience / Internships */}
      {experience.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Internships & Work History" accentColor={accentColor} />
          <div className="space-y-3 text-xs">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-0.5">
                <div className="flex justify-between font-bold text-black">
                  <span>{exp.position} – {exp.company}</span>
                  <span className="font-normal text-slate-600 text-[11px]">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                {exp.description && <p className="text-slate-800">{exp.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications & Achievements */}
      {(certifications.length > 0 || achievements.length > 0) && (
        <section>
          <SectionTitle title="Certifications & Honors" accentColor={accentColor} />
          <ul className="list-disc list-inside text-xs space-y-1 text-slate-800">
            {certifications.map((c) => (
              <li key={c.id}><span className="font-bold">{c.name}</span> – {c.issuer}</li>
            ))}
            {achievements.map((a) => (
              <li key={a.id}><span className="font-bold">{a.title}</span>: {a.description}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
