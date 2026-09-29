import React from "react";
import { TemplateProps, ContactList, SectionTitle } from "../common/TemplateSections";

export function ElegantBusiness({ data, className = "" }: TemplateProps) {
  const { personalInfo, experience, education, projects, skills, certifications, achievements, design } = data;
  const accentColor = design?.accentColor || "#7c2d12"; // Elegant Terracotta/Burgundy

  return (
    <div className={`p-8 sm:p-12 text-stone-900 bg-white leading-relaxed font-serif ${className}`}>
      {/* Centered Editorial Header with Border Frame */}
      <header className="border-y-2 border-stone-800 py-6 mb-8 text-center">
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 uppercase">
          {personalInfo.fullName || "Your Full Name"}
        </h1>
        <p className="text-sm font-semibold tracking-widest text-stone-600 uppercase mt-2">
          {personalInfo.jobTitle || "Business Consultant"}
        </p>
        <ContactList
          data={data}
          containerClass="flex flex-wrap items-center justify-center gap-4 pt-3 font-sans text-xs text-stone-600"
          iconClass="w-3 h-3 text-stone-500"
        />
      </header>

      {/* Summary */}
      {personalInfo.summary && (
        <section className="mb-6">
          <SectionTitle title="Executive Profile" accentColor={accentColor} variant="line" />
          <p className="text-xs text-stone-800 leading-normal">{personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <section className="mb-6">
          <SectionTitle title="Professional Experience" accentColor={accentColor} variant="line" />
          <div className="space-y-4 font-sans">
            {experience.map((exp) => (
              <div key={exp.id} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-bold text-stone-900">
                  <span className="text-sm">{exp.position}</span>
                  <span className="text-stone-500 font-normal">{exp.startDate} – {exp.current ? "Present" : exp.endDate}</span>
                </div>
                <div className="text-xs font-semibold" style={{ color: accentColor }}>{exp.company} {exp.location ? `• ${exp.location}` : ""}</div>
                {exp.description && <p className="text-xs text-stone-700">{exp.description}</p>}
                {exp.highlights && exp.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-xs space-y-1 pt-1 text-stone-800">
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

      {/* Skills & Education */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans">
        {skills.length > 0 && (
          <section>
            <SectionTitle title="Core Strengths" accentColor={accentColor} variant="line" />
            <div className="space-y-1.5 text-xs text-stone-800">
              {skills.map((s) => (
                <p key={s.id}>• <span className="font-bold">{s.name}</span> {s.level ? `(${s.level})` : ""}</p>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section>
            <SectionTitle title="Academic Background" accentColor={accentColor} variant="line" />
            <div className="space-y-2 text-xs">
              {education.map((edu) => (
                <div key={edu.id}>
                  <p className="font-bold text-stone-900">{edu.degree} in {edu.fieldOfStudy}</p>
                  <p className="text-stone-600">{edu.institution} ({edu.startDate} – {edu.endDate || "Present"})</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
