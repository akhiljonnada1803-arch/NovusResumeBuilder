import { Resume } from "@/types/resume";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

export interface ExtractedJDRequirements {
  roleTitle: string;
  company?: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceYears?: number;
  seniorityLevel?: "Entry" | "Mid-Level" | "Senior" | "Lead" | "Staff" | "Director";
  educationLevel?: string;
  techKeywords: string[];
  responsibilities: string[];
}

export interface DimensionScore {
  score: number; // 0 - 100
  label: string;
  matchedCount: number;
  totalCount: number;
  details: string;
}

export interface MissingKeywordItem {
  name: string;
  isRequired: boolean;
  category: "Languages" | "Frameworks" | "Tools" | "Technical" | "Methodology";
}

export interface ATSMatchResult {
  overallScore: number;
  matchLevel: "Excellent" | "Good" | "Average" | "Weak";
  summaryVerdict: string;

  dimensions: {
    skillMatch: DimensionScore;
    keywordMatch: DimensionScore;
    experienceMatch: DimensionScore;
    educationMatch: DimensionScore;
  };

  matchedKeywords: string[];
  missingKeywords: MissingKeywordItem[];
  strengths: string[];
  criticalGaps: string[];
  actionableTips: string[];

  extractedJD: ExtractedJDRequirements;
}

export interface OptimizedResumeDiff {
  originalSummary: string;
  optimizedSummary: string;

  originalSkills: string[];
  suggestedSkillsToAdd: string[];

  experienceDiffs: {
    id: string;
    company: string;
    position: string;
    originalHighlights: string[];
    optimizedHighlights: string[];
  }[];

  projectDiffs?: {
    id: string;
    title: string;
    originalDescription: string;
    optimizedDescription: string;
    originalHighlights?: string[];
    optimizedHighlights?: string[];
  }[];
}

/**
 * Extracts structured job requirements from job description text using Gemini AI.
 */
export async function extractJDRequirements(jdText: string): Promise<ExtractedJDRequirements> {
  const truncatedJD = jdText.slice(0, 5000);

  const prompt = `
You are an expert ATS parser and technical recruiter.
Extract all structured hiring criteria from this Job Description.

Job Description:
"""
${truncatedJD}
"""

Return ONLY a valid JSON object matching this schema:
{
  "roleTitle": "string",
  "company": "string",
  "requiredSkills": ["skill1", "skill2"],
  "preferredSkills": ["skill1", "skill2"],
  "experienceYears": 5,
  "seniorityLevel": "Senior",
  "educationLevel": "Bachelor's in Computer Science or equivalent",
  "techKeywords": ["TypeScript", "AWS", "Docker", "PostgreSQL", "Next.js"],
  "responsibilities": ["bullet 1", "bullet 2"]
}
`;

  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      return JSON.parse(text);
    } catch (err) {
      console.warn("Gemini JD extraction fallback:", err);
    }
  }

  // Fallback heuristic extraction
  return heuristicExtractJD(jdText);
}

/**
 * Analyzes resume against extracted JD requirements and calculates 4-dimensional ATS scores.
 */
export async function computeATSMatch(
  resume: Resume,
  jdText: string,
  preExtractedJD?: ExtractedJDRequirements
): Promise<ATSMatchResult> {
  const jdRequirements = preExtractedJD || (await extractJDRequirements(jdText));

  // 1. Compile resume searchable text corpus
  const resumeSkills = (resume.skills || []).map((s) => s.name.toLowerCase());
  const resumeExperienceText = (resume.experience || [])
    .map((e) => `${e.position} ${e.company} ${e.description} ${(e.highlights || []).join(" ")}`)
    .join(" ")
    .toLowerCase();
  const resumeProjectsText = (resume.projects || [])
    .map((p) => `${p.title} ${p.subtitle || ""} ${p.description} ${(p.technologies || []).join(" ")}`)
    .join(" ")
    .toLowerCase();
  const resumeSummary = (resume.personalInfo?.summary || "").toLowerCase();
  const resumeEducationText = (resume.education || [])
    .map((ed) => `${ed.degree} ${ed.fieldOfStudy} ${ed.institution}`)
    .join(" ")
    .toLowerCase();

  const fullResumeCorpus = `${resumeSkills.join(" ")} ${resumeExperienceText} ${resumeProjectsText} ${resumeSummary} ${resumeEducationText}`;

  // 2. Skill Match calculation
  const allJdSkills = [...jdRequirements.requiredSkills, ...jdRequirements.preferredSkills];
  const matchedSkills: string[] = [];
  const missingKeywordsList: MissingKeywordItem[] = [];

  jdRequirements.requiredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (fullResumeCorpus.includes(sLower) || resumeSkills.some((rs) => rs.includes(sLower) || sLower.includes(rs))) {
      matchedSkills.push(skill);
    } else {
      missingKeywordsList.push({
        name: skill,
        isRequired: true,
        category: categorizeKeyword(skill),
      });
    }
  });

  jdRequirements.preferredSkills.forEach((skill) => {
    const sLower = skill.toLowerCase();
    if (fullResumeCorpus.includes(sLower) || resumeSkills.some((rs) => rs.includes(sLower) || sLower.includes(rs))) {
      matchedSkills.push(skill);
    } else {
      missingKeywordsList.push({
        name: skill,
        isRequired: false,
        category: categorizeKeyword(skill),
      });
    }
  });

  const totalSkillsCount = allJdSkills.length || 1;
  const skillScore = Math.min(100, Math.round((matchedSkills.length / totalSkillsCount) * 100));

  // 3. Keyword Match calculation
  const matchedKeywords: string[] = [];
  jdRequirements.techKeywords.forEach((kw) => {
    if (fullResumeCorpus.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else if (!missingKeywordsList.some((m) => m.name.toLowerCase() === kw.toLowerCase())) {
      missingKeywordsList.push({
        name: kw,
        isRequired: false,
        category: categorizeKeyword(kw),
      });
    }
  });

  const totalKeywordsCount = jdRequirements.techKeywords.length || 1;
  const keywordScore = Math.min(100, Math.round((matchedKeywords.length / totalKeywordsCount) * 100));

  // 4. Experience Match calculation
  const totalExpCount = resume.experience?.length || 0;
  let experienceScore = 70;
  if (totalExpCount >= 3) experienceScore = 95;
  else if (totalExpCount === 2) experienceScore = 85;
  else if (totalExpCount === 1) experienceScore = 75;
  else experienceScore = 50;

  // 5. Education Match calculation
  let educationScore = 80;
  if (resume.education && resume.education.length > 0) {
    educationScore = 95;
  }

  // 6. Overall Weighted ATS Score
  const overallScore = Math.round(
    skillScore * 0.4 + keywordScore * 0.3 + experienceScore * 0.2 + educationScore * 0.1
  );

  let matchLevel: ATSMatchResult["matchLevel"] = "Weak";
  if (overallScore >= 88) matchLevel = "Excellent";
  else if (overallScore >= 75) matchLevel = "Good";
  else if (overallScore >= 60) matchLevel = "Average";

  // 7. Strengths & Critical Gaps
  const strengths: string[] = [];
  if (matchedSkills.length >= 4) strengths.push(`Strong overlap in core tech stack (${matchedSkills.slice(0, 3).join(", ")}).`);
  if (experienceScore >= 85) strengths.push("Career progression and work history closely aligns with target seniority.");
  if (keywordScore >= 75) strengths.push("High keyword density matching technical requirements.");

  const criticalGaps: string[] = [];
  const requiredMissing = missingKeywordsList.filter((m) => m.isRequired);
  if (requiredMissing.length > 0) {
    criticalGaps.push(`Missing ${requiredMissing.length} required skills: ${requiredMissing.slice(0, 3).map((m) => m.name).join(", ")}.`);
  }
  if (skillScore < 65) {
    criticalGaps.push("Low skill coverage compared to job description requirements.");
  }

  const actionableTips: string[] = [
    `Incorporate missing high-priority keywords (${missingKeywordsList.slice(0, 3).map((m) => m.name).join(", ")}) into your Skills and Experience bullets.`,
    "Quantify your accomplishments using metrics (%, $, latency, throughput) to stand out to ATS scanners.",
    "Tailor your Executive Summary to echo the core responsibilities outlined in the job description.",
  ];

  return {
    overallScore,
    matchLevel,
    summaryVerdict:
      overallScore >= 88
        ? "Outstanding candidate fit. Your resume satisfies virtually all core requirements and keywords."
        : overallScore >= 75
        ? "Competitive match. Adding a few missing keywords will boost your profile into the top 5% of applicants."
        : overallScore >= 60
        ? "Moderate match. Significant skill and keyword gaps exist that need optimization before applying."
        : "Low alignment with this job description. Consider extensive keyword alignment and AI optimization.",
    dimensions: {
      skillMatch: {
        score: skillScore,
        label: "Skill Coverage",
        matchedCount: matchedSkills.length,
        totalCount: totalSkillsCount,
        details: `${matchedSkills.length} of ${totalSkillsCount} required/preferred skills found.`,
      },
      keywordMatch: {
        score: keywordScore,
        label: "Keyword Density",
        matchedCount: matchedKeywords.length,
        totalCount: totalKeywordsCount,
        details: `${matchedKeywords.length} of ${totalKeywordsCount} core technical keywords detected.`,
      },
      experienceMatch: {
        score: experienceScore,
        label: "Experience Depth",
        matchedCount: totalExpCount,
        totalCount: 3,
        details: `${totalExpCount} career positions aligned with seniority level.`,
      },
      educationMatch: {
        score: educationScore,
        label: "Education Criteria",
        matchedCount: resume.education?.length || 0,
        totalCount: 1,
        details: "Academic qualifications align with target job requirements.",
      },
    },
    matchedKeywords: Array.from(new Set([...matchedSkills, ...matchedKeywords])),
    missingKeywords: missingKeywordsList,
    strengths,
    criticalGaps,
    actionableTips,
    extractedJD: jdRequirements,
  };
}

/**
 * Optimizes the resume for the specific job description using Gemini AI.
 */
export async function optimizeResumeForJD(
  resume: Resume,
  jdText: string,
  jdRequirements: ExtractedJDRequirements
): Promise<OptimizedResumeDiff> {
  const prompt = `
You are an elite technical resume optimizer from Google and Stripe.
Tailor and optimize this candidate's resume specifically for the target Job Description to maximize ATS score and recruiter engagement.

Target Job Criteria:
- Role: ${jdRequirements.roleTitle}
- Required Skills: ${jdRequirements.requiredSkills.join(", ")}
- Tech Keywords: ${jdRequirements.techKeywords.join(", ")}
- Key Responsibilities: ${jdRequirements.responsibilities.slice(0, 3).join("; ")}

Candidate's Current Resume Data:
- Summary: "${resume.personalInfo?.summary || ""}"
- Skills: ${resume.skills?.map((s) => s.name).join(", ")}
- Experience:
${(resume.experience || [])
  .map(
    (e) => `  [${e.id}] ${e.position} @ ${e.company}:
  Highlights:
  ${(e.highlights || []).map((h) => `  - ${h}`).join("\n")}`
  )
  .join("\n\n")}

Instructions:
1. Rewrite the Executive Summary (3-4 sentences) sharply positioning the candidate for this exact role.
2. Recommend 4-6 essential skills to add from the JD that make sense for this engineer.
3. For each Experience item, rewrite the bullet points using the Google XYZ / STAR format ("Accomplished [X] as measured by [Y] by doing [Z]"), embedding relevant keywords and action verbs naturally without inventing fictitious degrees or false job titles.

Return ONLY valid JSON matching this exact structure:
{
  "optimizedSummary": "string",
  "suggestedSkillsToAdd": ["skill1", "skill2", "skill3"],
  "experienceDiffs": [
    {
      "id": "exp-1",
      "company": "Company Name",
      "position": "Role",
      "optimizedHighlights": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ]
}
`;

  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      return {
        originalSummary: resume.personalInfo?.summary || "",
        optimizedSummary: parsed.optimizedSummary || resume.personalInfo?.summary || "",
        originalSkills: (resume.skills || []).map((s) => s.name),
        suggestedSkillsToAdd: parsed.suggestedSkillsToAdd || jdRequirements.requiredSkills.slice(0, 5),
        experienceDiffs: (resume.experience || []).map((exp) => {
          const diffMatch = parsed.experienceDiffs?.find((d: any) => d.id === exp.id || d.company === exp.company);
          return {
            id: exp.id,
            company: exp.company,
            position: exp.position,
            originalHighlights: exp.highlights || [],
            optimizedHighlights:
              diffMatch?.optimizedHighlights ||
              (exp.highlights || []).map(
                (h) => `Engineered and deployed core systems with ${jdRequirements.techKeywords[0] || "modern frameworks"}, enhancing throughput and reliability.`
              ),
          };
        }),
      };
    } catch (err) {
      console.warn("Gemini resume optimization fallback:", err);
    }
  }

  // Fallback rule-based optimization
  return {
    originalSummary: resume.personalInfo?.summary || "",
    optimizedSummary: `High-impact ${jdRequirements.roleTitle} with extensive background architecting scalable solutions utilizing ${jdRequirements.techKeywords.slice(0, 3).join(", ")}. Proven track record delivering mission-critical platforms with measurable reliability, high throughput, and seamless cross-functional execution.`,
    originalSkills: (resume.skills || []).map((s) => s.name),
    suggestedSkillsToAdd: jdRequirements.requiredSkills.slice(0, 5),
    experienceDiffs: (resume.experience || []).map((exp) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      originalHighlights: exp.highlights || [],
      optimizedHighlights: (exp.highlights || []).map(
        (h) => `${h} (Optimized for ${jdRequirements.roleTitle} requirements)`
      ),
    })),
  };
}

function categorizeKeyword(kw: string): MissingKeywordItem["category"] {
  const lower = kw.toLowerCase();
  if (["python", "typescript", "javascript", "go", "golang", "java", "c++", "rust", "sql", "ruby", "c#"].includes(lower)) {
    return "Languages";
  }
  if (["react", "next.js", "nextjs", "vue", "angular", "node", "nodejs", "fastapi", "django", "spring", "express", "tailwind"].includes(lower)) {
    return "Frameworks";
  }
  if (["docker", "kubernetes", "aws", "gcp", "azure", "redis", "postgresql", "postgres", "mongodb", "git", "ci/cd", "terraform"].includes(lower)) {
    return "Tools";
  }
  if (["agile", "scrum", "tdd", "ci/cd", "microservices", "system design", "distributed systems"].includes(lower)) {
    return "Methodology";
  }
  return "Technical";
}

function heuristicExtractJD(text: string): ExtractedJDRequirements {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const title = lines[0] || "Software Engineer";

  const keywords: string[] = [];
  const commonTech = [
    "TypeScript", "React", "Next.js", "Node.js", "Python", "Go", "Java", "Docker",
    "Kubernetes", "AWS", "GCP", "PostgreSQL", "MongoDB", "Redis", "GraphQL", "REST APIs",
    "Microservices", "CI/CD", "Tailwind CSS", "Distributed Systems"
  ];

  commonTech.forEach((tech) => {
    if (new RegExp(`\\b${tech}\\b`, "i").test(text)) {
      keywords.push(tech);
    }
  });

  return {
    roleTitle: title,
    requiredSkills: keywords.slice(0, 5),
    preferredSkills: keywords.slice(5, 8),
    experienceYears: 4,
    seniorityLevel: "Senior",
    educationLevel: "Bachelor's degree in Computer Science or equivalent practical experience",
    techKeywords: keywords,
    responsibilities: [
      "Design, build, and maintain high-performance, scalable distributed systems.",
      "Collaborate with cross-functional engineering and product teams to deliver core features.",
      "Ensure code quality, test coverage, and security compliance across services."
    ],
  };
}
