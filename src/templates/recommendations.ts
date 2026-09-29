import { Resume, TemplateMetadata } from "@/types/resume";
import { RESUME_TEMPLATES } from "./registry";

export interface RecommendationResult {
  recommendedTemplate: TemplateMetadata;
  alternativeTemplates: TemplateMetadata[];
  reason: string;
  atsConfidenceScore: number;
}

/**
 * Intelligent recommendation engine matching target role, experience, and industry with the ideal resume template.
 */
export function recommendTemplateForResume(resume: Resume): RecommendationResult {
  const role = (resume.targetRole || resume.personalInfo.jobTitle || "").toLowerCase();
  const experienceCount = resume.experience.length;

  // 1. Student / Fresh Graduate logic
  if (
    experienceCount === 0 ||
    role.includes("graduate") ||
    role.includes("intern") ||
    role.includes("student") ||
    role.includes("entry") ||
    role.includes("junior")
  ) {
    const main = RESUME_TEMPLATES.find((t) => t.id === "graduate-starter")!;
    const alts = RESUME_TEMPLATES.filter((t) => t.id === "campus-professional" || t.id === "fresher-ats");
    return {
      recommendedTemplate: main,
      alternativeTemplates: alts,
      reason: "Education-first layout with GPA prominence and academic project spotlighting.",
      atsConfidenceScore: 98,
    };
  }

  // 2. Engineering / Technical roles
  if (
    role.includes("software") ||
    role.includes("developer") ||
    role.includes("engineer") ||
    role.includes("full-stack") ||
    role.includes("frontend") ||
    role.includes("backend") ||
    role.includes("devops") ||
    role.includes("cloud") ||
    role.includes("data") ||
    role.includes("ai")
  ) {
    const main = RESUME_TEMPLATES.find((t) => t.id === "developer-pro")!;
    const alts = RESUME_TEMPLATES.filter(
      (t) => t.id === "ats-technical" || t.id === "fullstack-engineer" || t.id === "tech-minimal"
    );
    return {
      recommendedTemplate: main,
      alternativeTemplates: alts,
      reason: "Optimized for engineering screening with dedicated project repositories and tech stack matrix.",
      atsConfidenceScore: 97,
    };
  }

  // 3. Creative / UI/UX / Design roles
  if (
    role.includes("design") ||
    role.includes("ux") ||
    role.includes("ui") ||
    role.includes("art") ||
    role.includes("creative") ||
    role.includes("product designer")
  ) {
    const main = RESUME_TEMPLATES.find((t) => t.id === "creative-portfolio")!;
    const alts = RESUME_TEMPLATES.filter(
      (t) => t.id === "designer-grid" || t.id === "creative-modern" || t.id === "visual-artist"
    );
    return {
      recommendedTemplate: main,
      alternativeTemplates: alts,
      reason: "Showcases portfolio case studies, visual hierarchy, and tools with high visual polish.",
      atsConfidenceScore: 90,
    };
  }

  // 4. Executive / C-Suite / Leadership
  if (
    role.includes("director") ||
    role.includes("vp") ||
    role.includes("chief") ||
    role.includes("cto") ||
    role.includes("ceo") ||
    role.includes("president") ||
    role.includes("head of") ||
    role.includes("executive") ||
    experienceCount >= 4
  ) {
    const main = RESUME_TEMPLATES.find((t) => t.id === "elite-executive")!;
    const alts = RESUME_TEMPLATES.filter(
      (t) => t.id === "luxury-black" || t.id === "ats-executive" || t.id === "modern-executive"
    );
    return {
      recommendedTemplate: main,
      alternativeTemplates: alts,
      reason: "Authoritative leadership structure emphasizing board-level milestones and executive governance.",
      atsConfidenceScore: 96,
    };
  }

  // Default: Corporate / ATS Modern
  const main = RESUME_TEMPLATES.find((t) => t.id === "ats-classic")!;
  const alts = RESUME_TEMPLATES.filter(
    (t) => t.id === "corporate-blue" || t.id === "ats-modern" || t.id === "contemporary-pro"
  );
  return {
    recommendedTemplate: main,
    alternativeTemplates: alts,
    reason: "100% ATS machine-compatible layout with universally trusted corporate readability.",
    atsConfidenceScore: 100,
  };
}
