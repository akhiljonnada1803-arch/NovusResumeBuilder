import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function MinimalLuxury({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements } = data;
  const accentColor = "#18181b"; // Deep Zinc / Minimal Luxury

  return (
    <div className={`p-8 sm:p-12 text-zinc-900 bg-white leading-relaxed font-sans ${className}`}>
      {/* High-End Minimalist Header */}
      <header className="text-center pb-8 mb-8 border-b border-zinc-200">
        <h1 className="text-3xl sm:text-5xl font-extralight tracking-widest uppercase text-zinc-900">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mt-2">
          {personalInfo.jobTitle || "Managing Director"}
        </p>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center justify-center gap-4 pt-4 text-xs text-zinc-500 font-light"
          iconClass="w-3 h-3 text-zinc-400"
        />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-8">
          <SectionTitle title="Profile" accentColor={accentColor} variant="minimal" />
          <p className="text-xs text-zinc-700 font-light leading-relaxed">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-8">
          <SectionTitle title="Experience" accentColor={accentColor} variant="minimal" />
          <div className="space-y-5">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1 text-xs">
                <div className="flex justify-between items-baseline font-medium text-zinc-900">
                  <span className="text-sm font-semibold tracking-tight">{exp.position}</span>
                  <span className="text-zinc-400 font-light text-[11px]">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs text-zinc-600 font-normal">{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
                {exp.description && <p className="text-zinc-600 font-light">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="space-y-1 pt-1 text-zinc-700 font-light">
                    {exp.highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-zinc-400">—</span>
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills & Education */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {skills.length > 0 && (
          <section>
            <SectionTitle title="Competencies" accentColor={accentColor} variant="minimal" />
            <p className="text-xs text-zinc-700 font-light leading-relaxed">
              {skills.map((s) => s.name).join(" • ")}
            </p>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionTitle title="Education" accentColor={accentColor} variant="minimal" />
            <div className="space-y-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="font-semibold text-zinc-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-zinc-500 font-light">{edu.institution} ({edu.startDate} – {edu.endDate || "Present"})</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
