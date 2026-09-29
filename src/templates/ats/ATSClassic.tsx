import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";
import { formatDate } from "@/lib/utils";

export function ATSClassic({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements } = data;
  const accentColor = "#000000"; // Pure monochrome for maximum ATS machine-parsing compliance

  return (
    <div className={`p-8 sm:p-12 text-slate-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5 text-center">
        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-sm font-bold text-slate-800 mt-1">
          {personalInfo.jobTitle || "Professional Title"}
        </p>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center justify-center gap-3 pt-2"
          itemClass="text-[11px] text-slate-700 font-medium"
          iconClass="w-3 h-3 text-black"
        />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-5">
          <SectionTitle title="Professional Summary" accentColor={accentColor} />
          <p className="text-xs text-slate-800 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Work Experience */}
      {experience.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Work Experience" accentColor={accentColor} />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold text-black">
                  <span>
                    {exp.position} – <span className="font-semibold text-slate-800">{exp.company}</span>
                  </span>
                  <span className="text-[11px] font-normal text-slate-600">
                    {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                  </span>
                </div>
                {exp.location && <p className="text-[10px] text-slate-600 italic">{exp.location}</p>}
                {exp.description && <p className="text-xs text-slate-800">{exp.description}</p>}
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

      {/* Technical Skills */}
      {skills.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Core Competencies & Skills" accentColor={accentColor} />
          <div className="text-xs text-slate-800 leading-normal">
            <span className="font-bold">Skills: </span>
            {skills.map((s) => s.name).join(" • ")}
          </div>
        </section>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Key Projects" accentColor={accentColor} />
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id} className="text-xs space-y-0.5">
                <div className="flex justify-between font-bold text-black">
                  <span>{proj.title}</span>
                  {proj.startDate && (
                    <span className="font-normal text-[11px] text-slate-600">
                      {proj.startDate} – {proj.endDate || "Present"}
                    </span>
                  )}
                </div>
                {proj.technologies && proj.technologies.length > 0 && (
                  <p className="text-[11px] text-slate-700 italic">
                    Technologies: {proj.technologies.join(", ")}
                  </p>
                )}
                <p className="text-slate-800 leading-normal">{proj.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education.length > 0 && (
        <section className="mb-5">
          <SectionTitle title="Education" accentColor={accentColor} />
          <div className="space-y-2">
            {education.map((edu) => (
              <div key={edu.id} className="text-xs flex justify-between">
                <div>
                  <p className="font-bold text-black">
                    {edu.degree} in {edu.fieldOfStudy}
                  </p>
                  <p className="text-slate-700">{edu.institution}{edu.location ? `, ${edu.location}` : ""}</p>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  <p>{edu.startDate} – {edu.current ? "Present" : edu.endDate}</p>
                  {edu.gpa && <p className="font-medium text-black">GPA: {edu.gpa}</p>}
                </div>
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
              <li key={c.id}>
                <span className="font-bold">{c.name}</span> – {c.issuer} ({c.issueDate})
              </li>
            ))}
            {achievements.map((a) => (
              <li key={a.id}>
                <span className="font-bold">{a.title}</span>: {a.description}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
