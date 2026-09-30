import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from "docx";
import { Resume } from "@/types/resume";
import { saveFileWithNativeFallback } from "@/lib/desktop/tauri-bridge";

export interface DocxExportOptions {
  filename?: string;
  onProgress?: (status: string) => void;
}

/**
 * Generates an ATS-compliant, professionally styled Microsoft Word (.docx) document
 * from structured resume data.
 */
export async function exportResumeToDocx(
  resume: Resume,
  options: DocxExportOptions = {}
): Promise<void> {
  const { personalInfo, experience = [], education = [], skills = [], projects = [], certifications = [], achievements = [], design } = resume;
  const cleanName = personalInfo.fullName
    ? personalInfo.fullName.toLowerCase().replace(/[^a-z0-9]/g, "-")
    : "resume";
  const { filename = `${cleanName}-resume.docx`, onProgress } = options;

  onProgress?.("Generating Word document structure...");

  // Primary brand accent color in hex (strip #)
  const rawAccent = (design?.accentColor || "#1E293B").replace("#", "");
  const accentHex = rawAccent.length === 6 ? rawAccent : "1E293B";

  // Margins in millimeters
  const marginMm =
    design?.margins === "compact"
      ? 12
      : design?.margins === "spacious"
      ? 28
      : design?.margins === "custom" && design?.customMarginMm
      ? design.customMarginMm
      : 20;

  const marginTwips = convertMillimetersToTwip(marginMm);

  const sectionsChildren: Paragraph[] = [];

  // Helper for Section Headings
  const createSectionHeader = (title: string): Paragraph => {
    return new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 120 },
      border: {
        bottom: {
          color: accentHex,
          space: 4,
          style: BorderStyle.SINGLE,
          size: 12,
        },
      },
      children: [
        new TextRun({
          text: title.toUpperCase(),
          bold: true,
          size: 24, // 12pt
          color: accentHex,
          font: "Arial",
        }),
      ],
    });
  };

  // 1. Header (Candidate Name + Title)
  sectionsChildren.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [
        new TextRun({
          text: personalInfo.fullName || "Your Full Name",
          bold: true,
          size: 36, // 18pt
          color: "0F172A",
          font: "Arial",
        }),
      ],
    })
  );

  if (personalInfo.jobTitle) {
    sectionsChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({
            text: personalInfo.jobTitle,
            bold: true,
            size: 22, // 11pt
            color: accentHex,
            font: "Arial",
          }),
        ],
      })
    );
  }

  // Contact Info Line
  const contactParts: string[] = [];
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo.github) contactParts.push(personalInfo.github);
  if (personalInfo.website) contactParts.push(personalInfo.website);

  if (contactParts.length > 0) {
    sectionsChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 200 },
        children: [
          new TextRun({
            text: contactParts.join("  |  "),
            size: 18, // 9pt
            color: "475569",
            font: "Arial",
          }),
        ],
      })
    );
  }

  // 2. Professional Summary
  if (personalInfo.summary?.trim()) {
    sectionsChildren.push(createSectionHeader("Professional Summary"));
    sectionsChildren.push(
      new Paragraph({
        spacing: { before: 60, after: 160 },
        children: [
          new TextRun({
            text: personalInfo.summary.trim(),
            size: 20, // 10pt
            color: "334155",
            font: "Arial",
          }),
        ],
      })
    );
  }

  // 3. Work Experience
  if (experience.length > 0) {
    sectionsChildren.push(createSectionHeader("Work Experience"));
    experience.forEach((exp) => {
      // Role & Company Line
      sectionsChildren.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({
              text: exp.position || "Position",
              bold: true,
              size: 21,
              color: "0F172A",
              font: "Arial",
            }),
            new TextRun({
              text: `  —  ${exp.company || "Company"}`,
              size: 20,
              color: "334155",
              font: "Arial",
            }),
            new TextRun({
              text: `\t${exp.startDate || ""} – ${exp.current ? "Present" : exp.endDate || ""}`,
              bold: true,
              size: 18,
              color: "64748B",
              font: "Arial",
            }),
          ],
        })
      );

      if (exp.location) {
        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: exp.location,
                italics: true,
                size: 18,
                color: "64748B",
                font: "Arial",
              }),
            ],
          })
        );
      }

      if (exp.description?.trim()) {
        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 40 },
            children: [
              new TextRun({
                text: exp.description.trim(),
                size: 20,
                color: "334155",
                font: "Arial",
              }),
            ],
          })
        );
      }

      // Highlights / Bullets
      if (exp.highlights && exp.highlights.length > 0) {
        exp.highlights.forEach((hl) => {
          if (hl.trim()) {
            sectionsChildren.push(
              new Paragraph({
                bullet: { level: 0 },
                spacing: { before: 20, after: 20 },
                children: [
                  new TextRun({
                    text: hl.trim(),
                    size: 20,
                    color: "334155",
                    font: "Arial",
                  }),
                ],
              })
            );
          }
        });
      }
    });
  }

  // 4. Education
  if (education.length > 0) {
    sectionsChildren.push(createSectionHeader("Education"));
    education.forEach((edu) => {
      sectionsChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: `${edu.degree || "Degree"} in ${edu.fieldOfStudy || "Major"}`,
              bold: true,
              size: 21,
              color: "0F172A",
              font: "Arial",
            }),
            new TextRun({
              text: `  —  ${edu.institution || "University"}`,
              size: 20,
              color: "334155",
              font: "Arial",
            }),
            new TextRun({
              text: `\t${edu.startDate || ""} – ${edu.current ? "Present" : edu.endDate || ""}`,
              bold: true,
              size: 18,
              color: "64748B",
              font: "Arial",
            }),
          ],
        })
      );

      if (edu.gpa) {
        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 0, after: 40 },
            children: [
              new TextRun({
                text: `GPA / Grade: ${edu.gpa}`,
                size: 18,
                color: "475569",
                font: "Arial",
              }),
            ],
          })
        );
      }
    });
  }

  // 5. Technical Skills
  if (skills.length > 0) {
    sectionsChildren.push(createSectionHeader("Skills & Competencies"));
    // Group skills by category if available, otherwise join
    const skillsByCategory: Record<string, string[]> = {};
    skills.forEach((s) => {
      const cat = s.category || "Core Skills";
      if (!skillsByCategory[cat]) skillsByCategory[cat] = [];
      skillsByCategory[cat].push(s.name);
    });

    Object.entries(skillsByCategory).forEach(([cat, list]) => {
      sectionsChildren.push(
        new Paragraph({
          spacing: { before: 40, after: 40 },
          children: [
            new TextRun({
              text: `${cat}: `,
              bold: true,
              size: 20,
              color: "0F172A",
              font: "Arial",
            }),
            new TextRun({
              text: list.join("  •  "),
              size: 20,
              color: "334155",
              font: "Arial",
            }),
          ],
        })
      );
    });
  }

  // 6. Projects
  if (projects.length > 0) {
    sectionsChildren.push(createSectionHeader("Key Projects"));
    projects.forEach((proj) => {
      const techLine = proj.technologies?.length ? ` (${proj.technologies.join(", ")})` : "";
      sectionsChildren.push(
        new Paragraph({
          spacing: { before: 100, after: 30 },
          children: [
            new TextRun({
              text: proj.title || "Project",
              bold: true,
              size: 21,
              color: "0F172A",
              font: "Arial",
            }),
            new TextRun({
              text: techLine,
              italics: true,
              size: 18,
              color: "64748B",
              font: "Arial",
            }),
            new TextRun({
              text: proj.startDate ? `\t${proj.startDate}${proj.endDate ? ` – ${proj.endDate}` : ""}` : "",
              bold: true,
              size: 18,
              color: "64748B",
              font: "Arial",
            }),
          ],
        })
      );

      if (proj.description?.trim()) {
        sectionsChildren.push(
          new Paragraph({
            spacing: { before: 20, after: 40 },
            children: [
              new TextRun({
                text: proj.description.trim(),
                size: 20,
                color: "334155",
                font: "Arial",
              }),
            ],
          })
        );
      }
    });
  }

  // 7. Certifications
  if (certifications.length > 0) {
    sectionsChildren.push(createSectionHeader("Certifications"));
    certifications.forEach((cert) => {
      sectionsChildren.push(
        new Paragraph({
          spacing: { before: 60, after: 30 },
          children: [
            new TextRun({
              text: cert.name,
              bold: true,
              size: 20,
              color: "0F172A",
              font: "Arial",
            }),
            new TextRun({
              text: `  —  ${cert.issuer}`,
              size: 20,
              color: "475569",
              font: "Arial",
            }),
            new TextRun({
              text: cert.issueDate ? `\t${cert.issueDate}` : "",
              size: 18,
              color: "64748B",
              font: "Arial",
            }),
          ],
        })
      );
    });
  }

  // 8. Achievements
  if (achievements.length > 0) {
    sectionsChildren.push(createSectionHeader("Key Achievements"));
    achievements.forEach((ach) => {
      sectionsChildren.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { before: 30, after: 30 },
          children: [
            new TextRun({
              text: ach.title,
              bold: true,
              size: 20,
              color: "0F172A",
              font: "Arial",
            }),
            new TextRun({
              text: ach.description ? `: ${ach.description}` : "",
              size: 20,
              color: "334155",
              font: "Arial",
            }),
          ],
        })
      );
    });
  }

  onProgress?.("Compiling docx binary...");

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: marginTwips,
              bottom: marginTwips,
              left: marginTwips,
              right: marginTwips,
            },
          },
        },
        children: sectionsChildren,
      },
    ],
  });

  onProgress?.("Saving Word file...");
  const buffer = await Packer.toBlob(doc);

  // Convert Blob to data URL for native desktop fallback or anchor download
  const reader = new FileReader();
  reader.readAsDataURL(buffer);
  reader.onloadend = async () => {
    const dataUrl = reader.result as string;
    await saveFileWithNativeFallback(
      filename,
      dataUrl,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
  };
}
