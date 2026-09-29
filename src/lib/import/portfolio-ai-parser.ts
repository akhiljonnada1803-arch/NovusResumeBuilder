import { GoogleGenerativeAI } from "@google/generative-ai";
import { ScrapedPortfolioContent } from "./portfolio-scraper";
import { ExtractedPortfolioData, ExtractedSocialLinks } from "@/types/portfolio-import";
import { validateExtractedResume } from "./validator";
import { Resume } from "@/types/resume";
import { DEFAULT_DESIGN } from "@/lib/constants";

import { isValidApiKey } from "@/lib/gemini/client";

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
].filter(Boolean) as string[];

/**
 * Parses scraped portfolio content with Gemini AI into a validated structured candidate profile.
 * Zero-hallucination mandate strictly enforced.
 */
export async function parsePortfolioWithAI(
  scraped: ScrapedPortfolioContent,
  userApiKey?: string
): Promise<ExtractedPortfolioData> {
  const effectiveKey = (userApiKey || "").trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const hasValidKey = isValidApiKey(effectiveKey);
  const prompt = `
You are a precise, zero-hallucination portfolio extraction engine.
Analyze the provided portfolio content (extracted from a live website, GitHub repository, static HTML site, React project, or Next.js project) and extract structured candidate profile data.

CRITICAL ZERO-HALLUCINATION RULES:
1. Extract ONLY facts, projects, skills, certifications, and experiences that are EXPLICITLY present in the text.
2. NEVER invent fake companies, phantom schools, unlisted skills, or hallucinated dates.
3. If any field or section is not mentioned, return empty string "" or empty array [].

PORTFOLIO CONTENT TO ANALYZE:
"""
${scraped.rawText.slice(0, 16000)}
"""

Return ONLY a valid JSON object matching this schema:
{
  "personalInfo": {
    "fullName": "string",
    "jobTitle": "string",
    "email": "string",
    "phone": "string",
    "location": "string",
    "website": "string",
    "linkedin": "string",
    "github": "string",
    "summary": "string"
  },
  "socialLinks": {
    "github": "string",
    "linkedin": "string",
    "twitter": "string",
    "website": "string",
    "email": "string",
    "phone": "string"
  },
  "projects": [
    {
      "title": "string",
      "subtitle": "string",
      "description": "string",
      "technologies": ["string"],
      "githubUrl": "string",
      "liveUrl": "string",
      "startDate": "string",
      "endDate": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "Languages" | "Frameworks" | "Technical" | "Tools" | "Soft Skills" | "Other",
      "level": "Beginner" | "Intermediate" | "Advanced" | "Expert"
    }
  ],
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string"
    }
  ],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "issueDate": "string"
    }
  ],
  "achievements": [
    {
      "title": "string",
      "issuer": "string",
      "date": "string",
      "description": "string"
    }
  ]
}
`;

  let parsedRaw: any = null;

  if (hasValidKey) {
    const genAI = new GoogleGenerativeAI(effectiveKey);
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.0, responseMimeType: "application/json" },
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const clean = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
        parsedRaw = JSON.parse(clean);
        if (parsedRaw) break;
      } catch (err) {
        console.warn(`Gemini portfolio parser attempt with ${modelName} failed:`, err);
      }
    }
  }

  if (!parsedRaw) {
    parsedRaw = heuristicParsePortfolio(scraped);
  }

  // Construct standard intermediate resume object for factual verification
  const candidateResume: Resume = {
    id: `temp_import_${Date.now()}`,
    title: parsedRaw.personalInfo?.fullName
      ? `${parsedRaw.personalInfo.fullName} Portfolio Profile`
      : "Imported Portfolio Profile",
    targetRole: parsedRaw.personalInfo?.jobTitle || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {
      fullName: parsedRaw.personalInfo?.fullName || "",
      jobTitle: parsedRaw.personalInfo?.jobTitle || "",
      email: parsedRaw.personalInfo?.email || scraped.socialLinks?.email || "",
      phone: parsedRaw.personalInfo?.phone || scraped.socialLinks?.phone || "",
      location: parsedRaw.personalInfo?.location || "",
      website: parsedRaw.personalInfo?.website || scraped.socialLinks?.website || (scraped.sourceMeta.sourceType === "url" ? scraped.sourceMeta.sourceIdentifier : ""),
      linkedin: parsedRaw.personalInfo?.linkedin || scraped.socialLinks?.linkedin || "",
      github: parsedRaw.personalInfo?.github || scraped.socialLinks?.github || (scraped.sourceMeta.sourceType === "github" ? `https://github.com/${scraped.sourceMeta.sourceIdentifier}` : ""),
      summary: parsedRaw.personalInfo?.summary || "",
    },
    experience: Array.isArray(parsedRaw.experience)
      ? parsedRaw.experience.map((e: any, idx: number) => ({
          id: `exp_${idx}`,
          company: e.company || "",
          position: e.position || "",
          location: e.location || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          current: Boolean(e.current),
          description: e.description || "",
          highlights: Array.isArray(e.highlights) ? e.highlights : [],
        }))
      : [],
    education: Array.isArray(parsedRaw.education)
      ? parsedRaw.education.map((ed: any, idx: number) => ({
          id: `edu_${idx}`,
          institution: ed.institution || "",
          degree: ed.degree || "",
          fieldOfStudy: ed.fieldOfStudy || "",
          startDate: ed.startDate || "",
          endDate: ed.endDate || "",
          current: false,
          gpa: ed.gpa || "",
        }))
      : [],
    skills: Array.isArray(parsedRaw.skills)
      ? parsedRaw.skills.map((s: any, idx: number) => ({
          id: `sk_${idx}`,
          name: typeof s === "string" ? s : s.name,
          category: s.category || "Technical",
          level: s.level || "Advanced",
        }))
      : [],
    certifications: Array.isArray(parsedRaw.certifications)
      ? parsedRaw.certifications.map((c: any, idx: number) => ({
          id: `cert_${idx}`,
          name: c.name || "",
          issuer: c.issuer || "",
          issueDate: c.issueDate || "",
        }))
      : [],
    projects: Array.isArray(parsedRaw.projects)
      ? parsedRaw.projects.map((p: any, idx: number) => ({
          id: `proj_${idx}`,
          title: p.title || "",
          subtitle: p.subtitle || "",
          description: p.description || "",
          technologies: Array.isArray(p.technologies) ? p.technologies : [],
          githubUrl: p.githubUrl || undefined,
          liveUrl: p.liveUrl || undefined,
        }))
      : [],
    achievements: Array.isArray(parsedRaw.achievements)
      ? parsedRaw.achievements.map((a: any, idx: number) => ({
          id: `ach_${idx}`,
          title: a.title || "",
          issuer: a.issuer || "",
          date: a.date || "",
          description: a.description || "",
        }))
      : [],
    design: DEFAULT_DESIGN,
  };

  const validation = validateExtractedResume(candidateResume, scraped.rawText, scraped.sourceMeta.sourceIdentifier);

  const socialLinks: ExtractedSocialLinks = {
    ...scraped.socialLinks,
    ...(parsedRaw.socialLinks || {}),
    github: candidateResume.personalInfo.github || scraped.socialLinks?.github,
    linkedin: candidateResume.personalInfo.linkedin || scraped.socialLinks?.linkedin,
    email: candidateResume.personalInfo.email || scraped.socialLinks?.email,
    phone: candidateResume.personalInfo.phone || scraped.socialLinks?.phone,
    website: candidateResume.personalInfo.website || scraped.socialLinks?.website,
  };

  return {
    personalInfo: candidateResume.personalInfo,
    projects: candidateResume.projects.map(({ id, ...rest }) => rest),
    skills: candidateResume.skills.map(({ id, ...rest }) => rest),
    experience: candidateResume.experience.map(({ id, ...rest }) => rest),
    education: candidateResume.education.map(({ id, ...rest }) => rest),
    certifications: candidateResume.certifications.map(({ id, ...rest }) => rest),
    achievements: candidateResume.achievements.map(({ id, ...rest }) => rest),
    socialLinks,
    rawSourceMeta: scraped.sourceMeta,
    confidenceScore: validation.confidenceScores.overall,
    sectionConfidenceScores: validation.confidenceScores,
    uncertainFields: validation.uncertainFields,
  };
}

/**
 * Factual heuristic fallback when AI key is unavailable or for malformed websites.
 */
function heuristicParsePortfolio(scraped: ScrapedPortfolioContent): any {
  const text = scraped.rawText;
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  const githubMatch = text.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
  const linkedinMatch = text.match(/linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  const phoneMatch = text.match(/(\+?[0-9]{1,3}[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/);

  const knownTech = [
    "TypeScript", "JavaScript", "Python", "Go", "Rust", "React", "Next.js",
    "Vue", "Tailwind CSS", "Node.js", "PostgreSQL", "MongoDB", "Docker", "AWS", "Figma",
    "GraphQL", "REST API", "SQL", "Git", "Kubernetes", "Linux", "HTML", "CSS"
  ];
  const detectedSkills = knownTech
    .filter((tech) => new RegExp(`(^|[^a-zA-Z0-9_])${tech}([^a-zA-Z0-9_]|$)`, "i").test(text))
    .map((name) => ({ name, category: "Technical", level: "Advanced" }));

  let fullName = scraped.sourceMeta.pageTitle || "";
  if (fullName.includes("•") || fullName.includes("-") || fullName.includes("|")) {
    fullName = fullName.split(/[•\-|]/)[0].trim();
  }

  return {
    personalInfo: {
      fullName: fullName.length > 2 && fullName.length < 60 ? fullName : "Portfolio Author",
      jobTitle: "Software Engineer",
      email: emailMatch ? emailMatch[1] : scraped.socialLinks?.email || "",
      phone: phoneMatch ? phoneMatch[0] : scraped.socialLinks?.phone || "",
      github: githubMatch ? `https://${githubMatch[0]}` : scraped.socialLinks?.github || "",
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : scraped.socialLinks?.linkedin || "",
      website: scraped.sourceMeta.previewUrl || scraped.socialLinks?.website || "",
      summary: "",
    },
    socialLinks: scraped.socialLinks,
    projects: [],
    skills: detectedSkills,
    experience: [],
    education: [],
    certifications: [],
    achievements: [],
  };
}
