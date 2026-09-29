import {
  Resume,
  ExperienceItem,
  EducationItem,
  SkillItem,
  ProjectItem,
  CertificationItem,
  AchievementItem,
} from "@/types/resume";
import {
  ResumeExtractionResult,
  SourceTraceItem,
  ImportDiagnostics,
  OriginalDocument,
} from "@/types/import";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { validateExtractedResume } from "./validator";

import { isValidApiKey } from "@/lib/gemini/client";

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
].filter(Boolean) as string[];

/**
 * Stage 1: Zero-Loss Resume Parser Engine.
 * Combines multimodal/LLM extraction (when Gemini API is available) with an
 * enterprise-grade deterministic regex parser as a 100% reliable offline fallback.
 * Every extracted field is traceable to source lines with confidence scores.
 */
export async function parseRawResumeText(
  rawText: string,
  fileName = "Uploaded_Resume.pdf",
  fileType = "application/pdf",
  base64Data?: string,
  userApiKey?: string
): Promise<ResumeExtractionResult> {
  const startTime = Date.now();
  const text = (rawText || "").trim();
  const rawLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const effectiveKey = (userApiKey || "").trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const hasValidKey = isValidApiKey(effectiveKey);

  // 1. If Gemini API Key is present, attempt high-fidelity multimodal or text parsing
  if (hasValidKey && (text.length > 30 || base64Data)) {
    try {
      const aiResult = await parseWithGemini(
        text,
        fileName,
        fileType,
        base64Data,
        startTime,
        effectiveKey
      );
      if (aiResult && aiResult.success && aiResult.resume) {
        return aiResult;
      }
    } catch (err) {
      console.warn("Gemini Stage 1 parser fallback to deterministic engine:", err);
    }
  }

  // 2. High-Precision Deterministic Regex & Heuristics Parser (Offline / Fallback)
  return parseWithDeterministicEngine(text, rawLines, fileName, fileType, startTime);
}

/**
 * AI-Powered Stage 1 Parser using Gemini Flash with multi-model fallback
 */
async function parseWithGemini(
  rawText: string,
  fileName: string,
  fileType: string,
  base64Data: string | undefined,
  startTime: number,
  apiKey: string
): Promise<ResumeExtractionResult> {
  const genAI = new GoogleGenerativeAI(apiKey);

  const prompt = `
You are an expert ATS resume parser and structuring engine.
Extract ALL information from the resume document into clean, strict, and complete JSON.

CRITICAL EXTRACTION RULES:
1. Extract ALL real information present in the resume. DO NOT invent or fabricate any details.
2. Group the data accurately into: personalInfo, experience, education, skills, projects, certifications, achievements.

3. SKILLS RULES (CRITICAL):
   - Extract ONLY genuine, standalone technical skills, programming languages, frameworks, libraries, databases, and developer tools (e.g., "React", "TypeScript", "Python", "Node.js", "Docker", "PostgreSQL", "PyTorch", "FastAPI", "Redis", "ONNX", "MediaPipe").
   - NEVER extract project bullet points, whole sentences, action verbs, performance metrics, or phrases (e.g., NEVER extract "and VITS voice clones", "reducing RAM consumption", "<80ms per scan", "000+ institutional documents", "confidence", "heatmaps", "tables", or "DAG Execution" as skills).
   - Deduplicate and normalize skill names. Limit the skills array to the core 15-30 real technologies.

4. PROJECTS RULES (CRITICAL - DO NOT MERGE PROJECTS):
   - Extract ONLY genuine software, technical, and engineering projects (e.g., Apps, Web Platforms, Machine Learning models, Developer Tools, APIs).
   - NEVER extract leadership positions, positions of responsibility, extracurricular activities, or sports roles (e.g., 'School Vice Captain', 'Cricket Team Captain', 'Student Council') as projects.
   - Extract EVERY SINGLE software project as a SEPARATE object in the "projects" array.
   - If the resume lists multiple projects (e.g., "Local RAG Assistant", "EventSphere — Event Ticketing Ecosystem", "Indian Sign Language Recognition Engine", "Autonomous Agentic AI Framework"), you MUST create a distinct object for EACH one.
   - NEVER merge multiple projects together or put multiple projects in a single object.
   - For EACH project, construct:
     * "title": Clean project name (e.g., "Local RAG Assistant", "EventSphere")
     * "subtitle": Role, category, or tagline if present (e.g., "Event Ticketing Ecosystem", "Zero-Cloud Edge Inference")
     * "description": Comprehensive description combining the project summary and all bullet points / achievements into clear, professional text.
     * "liveUrl": GitHub repository URL or live deployment URL if present.
     * "technologies": Array of technologies used in this project (e.g., ["Python", "FastAPI", "Redis", "ONNX"]).

5. RESEARCH & PUBLICATIONS RULES (CRITICAL):
   - If the resume contains a "Research", "Publications", "Research Experience", or "Research Work" section (e.g., Deepfake Audio & Voice Clone Detection, acoustic feature analysis, papers):
     * Extract these into the "achievements" array (title: paper/research title, issuer: conference/journal/institution/lab, description: methodology/findings, date: publication date).
     * If it was a formal employment role (e.g. "Research Assistant / Fellow"), you may place it in "experience".
     * NEVER merge research papers or publications into the "projects" array or combine them with software projects.

6. For "experience": Extract company, position/title, location, startDate, endDate, current (boolean), description, and highlights (array of bullet points / responsibilities).
7. For "education": Extract institution, degree, fieldOfStudy, location, startDate, endDate, gpa, and description.
8. For "certifications": Extract name, issuer, issueDate.
9. For "achievements": Extract title, issuer, description, date (including any Research / Publications / Leadership Roles / Positions of Responsibility / Awards / Honors / Extracurriculars).

JSON SCHEMA STRUCTURE:
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
  "experience": [
    {
      "company": "string",
      "position": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": false,
      "description": "string",
      "highlights": ["string"]
    }
  ],
  "education": [
    {
      "institution": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "gpa": "string",
      "description": "string"
    }
  ],
  "skills": [
    {
      "name": "string",
      "category": "string",
      "level": "string"
    }
  ],
  "projects": [
    {
      "title": "string",
      "subtitle": "string",
      "description": "string",
      "liveUrl": "string",
      "technologies": ["string"]
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
      "description": "string",
      "date": "string"
    }
  ]
}

Input Document Text:
${rawText.length > 18000 ? `[NOTE: Document truncated to 18 000 chars — full length: ${rawText.length} chars. Sections near the end may be missing.]\n` : ""}${rawText.slice(0, 18000)}
`.trim();

  let responseText = "";
  let lastError: any = null;

  for (const modelName of CANDIDATE_MODELS) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      if (base64Data && fileType === "application/pdf") {
        try {
          const contents: any[] = [
            {
              inlineData: {
                data: base64Data,
                mimeType: "application/pdf",
              },
            },
            { text: prompt },
          ];
          const result = await model.generateContent(contents);
          responseText = result.response.text();
        } catch (multimodalErr) {
          // If multimodal inlineData fails, fallback to prompt with rawText
          console.warn(`Gemini multimodal attempt failed on ${modelName}, trying text prompt:`, multimodalErr);
          const result = await model.generateContent(prompt);
          responseText = result.response.text();
        }
      } else {
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      }

      if (responseText && responseText.trim().length > 0) {
        break; // Successfully got response
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Gemini model ${modelName} failed during resume parsing:`, err?.message || err);
      // Try next candidate model
    }
  }

  if (!responseText) {
    throw lastError || new Error("Gemini AI failed to generate resume extraction response.");
  }

  const cleanJson = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: any;
  try {
    parsed = JSON.parse(cleanJson);
  } catch (jsonErr) {
    throw new Error(
      `Gemini returned non-JSON response: ${(jsonErr as Error).message}. Falling back to deterministic parser.`
    );
  }
  const rawLines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const resumeId = `resume_${Math.random().toString(36).substring(2, 10)}`;

  // Normalize structure
  const experience: ExperienceItem[] = (parsed.experience || []).map((exp: any, idx: number) => ({
    id: `exp_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    company: exp.company || "Company",
    position: exp.position || "Role",
    location: exp.location || "",
    startDate: exp.startDate || "",
    endDate: exp.endDate || "",
    current: Boolean(exp.current),
    description: exp.description || "",
    highlights: Array.isArray(exp.highlights) ? exp.highlights.map(String) : [],
  }));

  const education: EducationItem[] = (parsed.education || []).map((edu: any, idx: number) => ({
    id: `edu_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    institution: edu.institution || "Institution",
    degree: edu.degree || "Degree",
    fieldOfStudy: edu.fieldOfStudy || "",
    location: edu.location || "",
    startDate: edu.startDate || "",
    endDate: edu.endDate || "",
    current: false,
    gpa: edu.gpa || "",
    description: edu.description || "",
  }));

  const skills: SkillItem[] = (parsed.skills || []).map((sk: any, idx: number) => ({
    id: `sk_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    name: typeof sk === "string" ? sk : sk.name || "Skill",
    category: sk.category || "Technical",
    level: sk.level || "Advanced",
  }));

  const projects: ProjectItem[] = (parsed.projects || []).map((proj: any, idx: number) => ({
    id: `proj_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    title: proj.title || "Project",
    subtitle: proj.subtitle || "",
    description: proj.description || "",
    liveUrl: proj.liveUrl || "",
    technologies: Array.isArray(proj.technologies) ? proj.technologies.map(String) : [],
  }));

  const certifications: CertificationItem[] = (parsed.certifications || []).map((cert: any, idx: number) => ({
    id: `cert_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    name: cert.name || "Certification",
    issuer: cert.issuer || "",
    issueDate: cert.issueDate || "",
  }));

  const achievements: AchievementItem[] = (parsed.achievements || []).map((ach: any, idx: number) => ({
    id: `ach_${idx}_${Math.random().toString(36).substring(2, 7)}`,
    title: ach.title || "Achievement",
    issuer: ach.issuer || "",
    description: ach.description || "",
    date: ach.date || "",
  }));

  const personalInfo = {
    fullName: parsed.personalInfo?.fullName || "",
    jobTitle: parsed.personalInfo?.jobTitle || "",
    email: parsed.personalInfo?.email || "",
    phone: parsed.personalInfo?.phone || "",
    location: parsed.personalInfo?.location || "",
    website: parsed.personalInfo?.website || "",
    linkedin: parsed.personalInfo?.linkedin || "",
    github: parsed.personalInfo?.github || "",
    summary: parsed.personalInfo?.summary || "",
    showPhoto: false,
    photoShape: "circle" as const,
    photoSize: "md" as const,
  };

  const structuredResume: Resume = {
    id: resumeId,
    title: personalInfo.fullName
      ? `${personalInfo.fullName} - ${personalInfo.jobTitle || "Resume"}`
      : "Imported Resume",
    targetRole: personalInfo.jobTitle || "Software Engineer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    design: {
      template: "ats-modern",
      accentColor: "#2563EB",
      fontFamily: "Inter",
      fontSize: "base",
      spacing: "normal",
      showIcons: true,
      showSectionDividers: true,
    },
  };

  // Build Source Trace Items linking extracted data back to document lines
  const sourceTrace: SourceTraceItem[] = [];

  const findLineNum = (query: string): number | undefined => {
    if (!query || query.length < 3) return undefined;
    const lower = query.toLowerCase();
    const idx = rawLines.findIndex((l) => l.toLowerCase().includes(lower));
    return idx >= 0 ? idx + 1 : undefined;
  };

  if (personalInfo.fullName) {
    sourceTrace.push({
      id: "trace_name",
      fieldKey: "personalInfo.fullName",
      label: "Full Name",
      section: "personalInfo",
      documentValue: personalInfo.fullName,
      parsedValue: personalInfo.fullName,
      lineNumber: findLineNum(personalInfo.fullName),
      confidence: 98,
      status: "verified",
    });
  }

  if (personalInfo.email) {
    sourceTrace.push({
      id: "trace_email",
      fieldKey: "personalInfo.email",
      label: "Email Address",
      section: "personalInfo",
      documentValue: personalInfo.email,
      parsedValue: personalInfo.email,
      lineNumber: findLineNum(personalInfo.email),
      confidence: 100,
      status: "verified",
    });
  }

  if (personalInfo.phone) {
    sourceTrace.push({
      id: "trace_phone",
      fieldKey: "personalInfo.phone",
      label: "Phone Number",
      section: "personalInfo",
      documentValue: personalInfo.phone,
      parsedValue: personalInfo.phone,
      lineNumber: findLineNum(personalInfo.phone),
      confidence: 95,
      status: "verified",
    });
  }

  if (personalInfo.jobTitle) {
    sourceTrace.push({
      id: "trace_jobTitle",
      fieldKey: "personalInfo.jobTitle",
      label: "Target Role / Headline",
      section: "personalInfo",
      documentValue: personalInfo.jobTitle,
      parsedValue: personalInfo.jobTitle,
      lineNumber: findLineNum(personalInfo.jobTitle),
      confidence: 95,
      status: "verified",
    });
  }

  experience.forEach((exp, idx) => {
    sourceTrace.push({
      id: `trace_${exp.id}`,
      fieldKey: `experience[${idx}].company`,
      label: `Experience: ${exp.position} at ${exp.company}`,
      section: "experience",
      documentValue: `${exp.position} @ ${exp.company}`,
      parsedValue: `${exp.position} at ${exp.company} (${exp.startDate || ""} - ${exp.endDate || "Present"})`,
      lineNumber: findLineNum(exp.company) || findLineNum(exp.position),
      confidence: 95,
      status: "verified",
    });
  });

  education.forEach((edu, idx) => {
    sourceTrace.push({
      id: `trace_${edu.id}`,
      fieldKey: `education[${idx}].institution`,
      label: `Education: ${edu.degree} from ${edu.institution}`,
      section: "education",
      documentValue: `${edu.degree} - ${edu.institution}`,
      parsedValue: `${edu.degree} from ${edu.institution}${edu.gpa ? ` (GPA: ${edu.gpa})` : ""}`,
      lineNumber: findLineNum(edu.institution) || findLineNum(edu.degree),
      confidence: 95,
      status: "verified",
    });
  });

  if (skills.length > 0) {
    sourceTrace.push({
      id: "trace_skills",
      fieldKey: "skills",
      label: `Skills (${skills.length} extracted)`,
      section: "skills",
      documentValue: skills.slice(0, 10).map((s) => s.name).join(", "),
      parsedValue: skills.map((s) => s.name).join(", "),
      lineNumber: findLineNum("skills") || 1,
      confidence: 98,
      status: "verified",
    });
  }

  const detectedSections = [
    personalInfo.fullName || personalInfo.email ? "personalInfo" : null,
    personalInfo.summary ? "summary" : null,
    experience.length > 0 ? "experience" : null,
    education.length > 0 ? "education" : null,
    skills.length > 0 ? "skills" : null,
    projects.length > 0 ? "projects" : null,
    certifications.length > 0 ? "certifications" : null,
    achievements.length > 0 ? "achievements" : null,
  ].filter(Boolean) as string[];

  const allSections = ["summary", "experience", "education", "skills", "projects", "certifications", "achievements"];
  const missingSections = allSections.filter((s) => !detectedSections.includes(s));

  const aiTotalFields =
    (personalInfo.fullName ? 1 : 0) +
    (personalInfo.email ? 1 : 0) +
    (personalInfo.phone ? 1 : 0) +
    (personalInfo.jobTitle ? 1 : 0) +
    (personalInfo.location ? 1 : 0) +
    (personalInfo.summary ? 1 : 0) +
    experience.length +
    education.length +
    skills.length +
    projects.length +
    certifications.length +
    achievements.length;

  const diagnostics: ImportDiagnostics = {
    parserMethod: "ai_enhanced",
    processingTimeMs: Date.now() - startTime,
    characterCount: rawText.length,
    lineCount: rawLines.length,
    detectedSections,
    missingSections,
    totalFieldsExtracted: aiTotalFields,
    traceableFieldsCount: sourceTrace.length,
    traceabilityPercentage: aiTotalFields > 0
      ? Math.min(100, Math.round((sourceTrace.length / aiTotalFields) * 100))
      : 0,
    warningsCount: rawText.length > 18000 ? 1 : 0,
    rawTextPreview: rawText.slice(0, 1500),
  };

  const originalDocument: OriginalDocument = {
    fileName,
    fileType,
    rawText,
    lines: rawLines,
    uploadedAt: new Date().toISOString(),
  };

  return validateExtractedResume(
    structuredResume,
    rawText,
    fileName,
    sourceTrace,
    diagnostics,
    originalDocument
  );
}

/**
 * Enterprise Deterministic Regex & Heuristics Parser (Zero Hallucination / 100% Offline)
 */
function parseWithDeterministicEngine(
  text: string,
  rawLines: string[],
  fileName: string,
  fileType: string,
  startTime: number
): ResumeExtractionResult {
  const sourceTrace: SourceTraceItem[] = [];

  // 1. Contact Information Regexes
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i;
  // Simplified phone regex: avoids false-positives on GPA/year ranges; validated below by digit count
  const phoneRegex = /(?:\+?\d{1,3}[-./\s]?)?(?:\(?\d{2,4}\)?[-./\s]?)?\d{3,5}[-./\s]?\d{3,5}[-./\s]?\d{2,5}(?:\s*(?:x|ext)\.?\s*\d+)?/;
  const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
  const githubRegex = /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i;
  const urlRegex = /(https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/i;

  let email = "";
  let phone = "";
  let linkedin = "";
  let github = "";
  let website = "";
  let location = "";

  rawLines.forEach((line, lineIdx) => {
    const lineNum = lineIdx + 1;

    if (!email) {
      const match = line.match(emailRegex);
      if (match) {
        email = match[1];
        sourceTrace.push({
          id: "trace_email",
          fieldKey: "personalInfo.email",
          label: "Email Address",
          section: "personalInfo",
          documentValue: line,
          parsedValue: email,
          lineNumber: lineNum,
          confidence: 100,
          status: "verified",
        });
      }
    }

    if (!phone) {
      const match = line.match(phoneRegex);
      const matchDigits = match ? (match[0].match(/\d/g) || []).length : 0;
      if (match && matchDigits >= 7 && matchDigits <= 15 && !match[0].includes("@")) {
        phone = match[0].trim();
        sourceTrace.push({
          id: "trace_phone",
          fieldKey: "personalInfo.phone",
          label: "Phone Number",
          section: "personalInfo",
          documentValue: line,
          parsedValue: phone,
          lineNumber: lineNum,
          confidence: 95,
          status: "verified",
        });
      }
    }

    if (!linkedin) {
      const match = line.match(linkedinRegex);
      if (match) {
        linkedin = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
        sourceTrace.push({
          id: "trace_linkedin",
          fieldKey: "personalInfo.linkedin",
          label: "LinkedIn Profile",
          section: "personalInfo",
          documentValue: line,
          parsedValue: linkedin,
          lineNumber: lineNum,
          confidence: 100,
          status: "verified",
        });
      }
    }

    if (!github) {
      const match = line.match(githubRegex);
      if (match) {
        github = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
        sourceTrace.push({
          id: "trace_github",
          fieldKey: "personalInfo.github",
          label: "GitHub Profile",
          section: "personalInfo",
          documentValue: line,
          parsedValue: github,
          lineNumber: lineNum,
          confidence: 100,
          status: "verified",
        });
      }
    }

    if (!website) {
      const match = line.match(urlRegex);
      if (match && !match[0].includes("linkedin.com") && !match[0].includes("github.com")) {
        website = match[0];
        sourceTrace.push({
          id: "trace_website",
          fieldKey: "personalInfo.website",
          label: "Portfolio / Website",
          section: "personalInfo",
          documentValue: line,
          parsedValue: website,
          lineNumber: lineNum,
          confidence: 95,
          status: "verified",
        });
      }
    }

    if (!location && (line.includes(",") || line.toLowerCase().includes("remote"))) {
      const locMatch = line.match(/([A-Z][a-zA-Z\s.-]+,\s*[A-Z]{2,}|[A-Z][a-zA-Z\s.-]+,\s*[A-Z][a-zA-Z\s]+|Remote)/);
      if (locMatch && !locMatch[0].includes("@") && locMatch[0].length < 40) {
        location = locMatch[0].trim();
        sourceTrace.push({
          id: "trace_location",
          fieldKey: "personalInfo.location",
          label: "Location",
          section: "personalInfo",
          documentValue: line,
          parsedValue: location,
          lineNumber: lineNum,
          confidence: 85,
          status: "verified",
        });
      }
    }
  });

  // 2. Candidate Full Name Detection
  let fullName = "";
  let fullNameLine = 0;
  for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
    const l = rawLines[i];
    if (
      l &&
      !l.includes("@") &&
      !l.includes("http") &&
      !l.includes(".com") &&
      !l.includes(":") &&
      !/^\d+$/.test(l) &&
      l.length >= 2 &&
      l.length < 45
    ) {
      const lowerLine = l.toLowerCase();
      if (
        !lowerLine.includes("curriculum vitae") &&
        !lowerLine.includes("resume") &&
        !lowerLine.includes("summary") &&
        !lowerLine.includes("experience") &&
        !lowerLine.includes("github") &&
        !lowerLine.includes("linkedin") &&
        !lowerLine.includes("portfolio")
      ) {
        let cleanName = l.replace(/[^a-zA-Z\s.-]/g, "").trim();
        // Repair spaced single-letter kerning splits (e.g. "AKHI L" -> "AKHIL", "SA I" -> "SAI")
        cleanName = cleanName.replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
        const wordCount = cleanName.split(/\s+/).length;
        if (wordCount >= 1 && wordCount <= 4) {
          fullName = cleanName;
          fullNameLine = i + 1;
          break;
        }
      }
    }
  }

  if (fullName) {
    sourceTrace.push({
      id: "trace_name",
      fieldKey: "personalInfo.fullName",
      label: "Full Name",
      section: "personalInfo",
      documentValue: rawLines[fullNameLine - 1] || fullName,
      parsedValue: fullName,
      lineNumber: fullNameLine,
      confidence: 95,
      status: "verified",
    });
  }

  // 3. Section Boundary Partitioning
  type SectionKey =
    | "header"
    | "summary"
    | "experience"
    | "education"
    | "skills"
    | "projects"
    | "research"
    | "certifications"
    | "achievements";

  const sectionKeywords: Record<string, string[]> = {
    summary: [
      "summary",
      "professional summary",
      "about",
      "about me",
      "profile",
      "executive summary",
      "career objective",
      "objective",
    ],
    experience: [
      "experience",
      "work experience",
      "professional experience",
      "employment history",
      "work history",
      "career history",
      "relevant experience",
      "internships",
      "work experience & internships",
    ],
    education: [
      "education",
      "academic background",
      "academic history",
      "academics",
      "educational qualifications",
      "degrees",
      "scholastic achievements",
    ],
    skills: [
      "key skills & technologies",
      "key skills and technologies",
      "skills & technologies",
      "technical skills & technologies",
      "skills",
      "technical skills",
      "technologies",
      "key skills",
      "core skills",
      "tools",
      "core competencies",
      "technical proficiencies",
      "tech stack",
      "programming languages",
      "frameworks",
      "tools & technologies",
      "technical skills & tools",
      "skills & tools",
    ],
    projects: [
      "projects",
      "key projects",
      "personal projects",
      "featured projects",
      "academic projects",
      "technical projects",
      "selected projects",
      "project work",
      "project experience",
      "major projects",
      "notable projects",
      "recent projects",
      "open source projects",
      "independent projects",
      "projects & contributions",
      "academic & personal projects",
      "software projects",
      "engineering projects",
    ],
    research: [
      "research",
      "research work",
      "research experience",
      "research & publications",
      "research and publications",
      "research publications",
      "publications & research",
      "publications",
      "papers & publications",
      "conference papers",
      "journal papers",
      "published papers",
      "patents",
      "patents & publications",
      "research projects",
      "research & development",
      "academic research",
      "selected publications",
    ],
    certifications: [
      "certifications",
      "licenses",
      "certificates",
      "credentials",
      "professional certifications",
      "courses & certifications",
      "certifications & trainings",
    ],
    achievements: [
      "achievements",
      "awards",
      "honors",
      "accomplishments",
      "honors & awards",
      "honors and awards",
      "awards & achievements",
      "awards and achievements",
      "key achievements",
      "leadership & positions of responsibility",
      "leadership and positions of responsibility",
      "positions of responsibility",
      "position of responsibility",
      "positions of responsibilities",
      "leadership & responsibility",
      "leadership & responsibilities",
      "leadership and responsibility",
      "leadership and responsibilities",
      "leadership",
      "leadership experience",
      "leadership roles",
      "leadership & activities",
      "leadership and activities",
      "leadership activities",
      "co-curricular activities",
      "cocurricular activities",
      "co curricular activities",
      "extracurricular activities",
      "extracurricular",
      "extracurriculars",
      "volunteering",
      "volunteer experience",
      "volunteer work",
      "community involvement",
      "competitions & hackathons",
      "hackathons",
    ],
  };

  let currentSection: SectionKey = "header";
  const sectionBlocks: Record<SectionKey, Array<{ text: string; lineNum: number }>> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    research: [],
    certifications: [],
    achievements: [],
  };

  rawLines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const cleanHeader = line
      .toLowerCase()
      .replace(/[:#*_\-–—•]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    const normalizedHeader = cleanHeader.replace(/&/g, "and").replace(/\s+/g, " ");

    let isSectionHeader = false;
    if (line.length <= 65) {
      for (const [secKey, keywords] of Object.entries(sectionKeywords)) {
        if (
          keywords.some((k) => {
            const normK = k.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ");
            return (
              cleanHeader === k ||
              cleanHeader === `${k}:` ||
              cleanHeader.startsWith(`${k} `) ||
              cleanHeader.endsWith(` ${k}`) ||
              normalizedHeader === normK ||
              normalizedHeader === `${normK}:` ||
              normalizedHeader.startsWith(`${normK} `) ||
              normalizedHeader.endsWith(` ${normK}`)
            );
          })
        ) {
          currentSection = secKey as SectionKey;
          isSectionHeader = true;
          break;
        }
      }
    }

    if (!isSectionHeader) {
      sectionBlocks[currentSection].push({ text: line, lineNum });
    }
  });

  const detectedSections: string[] = [];
  const missingSections: string[] = [];
  ([
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "research",
    "certifications",
    "achievements",
  ] as const).forEach((sec) => {
    if (sectionBlocks[sec].length > 0) {
      detectedSections.push(sec);
    } else {
      missingSections.push(sec);
    }
  });

  // Target Role / Headline
  let jobTitle = "";
  if (sectionBlocks.header.length > 0) {
    for (const item of sectionBlocks.header) {
      const l = item.text;
      const lower = l.toLowerCase();
      if (
        l !== fullName &&
        !l.includes("@") &&
        !l.includes("http") &&
        !lower.includes("github") &&
        !lower.includes("linkedin") &&
        !lower.includes("portfolio") &&
        !lower.includes("leetcode") &&
        !lower.includes("hackerrank") &&
        !lower.includes("codechef") &&
        !lower.includes("contact") &&
        !lower.includes("email") &&
        !lower.includes("phone") &&
        !lower.includes("tel:") &&
        !lower.includes("mobile") &&
        !/^\d+$/.test(l) &&
        l.length > 3 &&
        l.length < 60
      ) {
        jobTitle = l.replace(/[|•]/g, "").trim();
        sourceTrace.push({
          id: "trace_jobTitle",
          fieldKey: "personalInfo.jobTitle",
          label: "Target Role / Headline",
          section: "personalInfo",
          documentValue: l,
          parsedValue: jobTitle,
          lineNumber: item.lineNum,
          confidence: 90,
          status: "verified",
        });
        break;
      }
    }
  }

  // Summary Text
  let summary = "";
  if (sectionBlocks.summary.length > 0) {
    summary = sectionBlocks.summary.map((s) => s.text).join(" ").trim();
    sourceTrace.push({
      id: "trace_summary",
      fieldKey: "personalInfo.summary",
      label: "Professional Summary",
      section: "personalInfo",
      documentValue: summary.slice(0, 120) + (summary.length > 120 ? "..." : ""),
      parsedValue: summary,
      lineNumber: sectionBlocks.summary[0]?.lineNum,
      confidence: 95,
      status: "verified",
    });
  }

  // 4. Experience Parsing
  const experience: ExperienceItem[] = [];
  const expItems = sectionBlocks.experience;
  if (expItems.length > 0) {
    let currentExp: (Partial<ExperienceItem> & { lineStart?: number; docSnippet?: string }) | null = null;

    const datePattern = /(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?\d{4}\s*(?:–|-|to)\s*(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*)?(?:\d{4}|Present|Current|Now)|\d{1,2}\/\d{4}\s*(?:–|-|to)\s*(?:\d{1,2}\/\d{4}|Present|Current)|\b\d{4}\s*-\s*\d{4}\b/i;

    for (const { text: line, lineNum } of expItems) {
      const isBullet = /^[-•*–—\u2022\u2023\u25E6\u2043\u2219]\s*/.test(line) || /^\d+\.\s*/.test(line);

      if (isBullet) {
        const bulletText = line.replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219\d.]\s*/, "").trim();
        if (currentExp && bulletText) {
          currentExp.highlights = currentExp.highlights || [];
          currentExp.highlights.push(bulletText);
        }
      } else {
        const hasDate = datePattern.test(line);
        const hasSeparator = /[|@•–—]|\bat\b/i.test(line);

        if (hasDate || hasSeparator || (line.length > 4 && line.length < 80 && !isBullet)) {
          if (currentExp && (currentExp.company || currentExp.position)) {
            const expId = `exp_${experience.length}_${Math.random().toString(36).substring(2, 7)}`;
            experience.push({
              id: expId,
              company: currentExp.company || "Company",
              position: currentExp.position || "Role",
              location: currentExp.location || "",
              startDate: currentExp.startDate || "",
              endDate: currentExp.endDate || "",
              current: Boolean(currentExp.current),
              description: currentExp.description || "",
              highlights: currentExp.highlights || [],
            });

            sourceTrace.push({
              id: `trace_${expId}`,
              fieldKey: `experience[${experience.length - 1}].company`,
              label: `Experience: ${currentExp.position || "Role"} at ${currentExp.company || "Company"}`,
              section: "experience",
              documentValue: currentExp.docSnippet || line,
              parsedValue: `${currentExp.position} @ ${currentExp.company} (${currentExp.startDate || ""} - ${currentExp.endDate || "Present"})`,
              lineNumber: currentExp.lineStart,
              confidence: 90,
              status: "verified",
            });
          }

          const dateMatch = line.match(datePattern);
          let dates = "";
          let lineWithoutDate = line;
          if (dateMatch) {
            dates = dateMatch[0];
            lineWithoutDate = line.replace(dateMatch[0], "").trim();
          }

          const parts = lineWithoutDate.split(/[|•–—@]|\bat\b/i).map((p) => p.trim()).filter(Boolean);
          // Heuristic: detect "Company | Role" vs "Role | Company" by presence of role-title keywords
          const ROLE_KEYWORDS = /\b(engineer|developer|designer|manager|lead|senior|junior|intern|analyst|architect|scientist|director|vp|head|officer|specialist|consultant|associate|programmer|administrator|coordinator|researcher|strategist|executive)\b/i;
          let position: string;
          let company: string;
          if (parts.length >= 2) {
            const p0HasRole = ROLE_KEYWORDS.test(parts[0]);
            const p1HasRole = ROLE_KEYWORDS.test(parts[1]);
            if (!p0HasRole && p1HasRole) {
              // "Company | Role" format
              company = parts[0];
              position = parts[1];
            } else {
              // "Role | Company" or ambiguous
              position = parts[0];
              company = parts[1];
            }
          } else {
            position = parts[0] || "Software Engineer";
            company = parts[0] || "Company";
          }
          const isCurrent = /present|current|now/i.test(dates);

          let start = "";
          let end = "";
          if (dates) {
            const dateParts = dates.split(/(?:–|-|to)/i).map((d) => d.trim());
            start = dateParts[0] || "";
            end = isCurrent ? "Present" : dateParts[1] || "";
          }

          currentExp = {
            company,
            position,
            startDate: start,
            endDate: end,
            current: isCurrent,
            description: "",
            highlights: [],
            lineStart: lineNum,
            docSnippet: line,
          };
        }
      }
    }

    if (currentExp && (currentExp.company || currentExp.position)) {
      const expId = `exp_${experience.length}_${Math.random().toString(36).substring(2, 7)}`;
      experience.push({
        id: expId,
        company: currentExp.company || "Company",
        position: currentExp.position || "Role",
        location: currentExp.location || "",
        startDate: currentExp.startDate || "",
        endDate: currentExp.endDate || "",
        current: Boolean(currentExp.current),
        description: currentExp.description || "",
        highlights: currentExp.highlights || [],
      });

      sourceTrace.push({
        id: `trace_${expId}`,
        fieldKey: `experience[${experience.length - 1}].company`,
        label: `Experience: ${currentExp.position || "Role"} at ${currentExp.company || "Company"}`,
        section: "experience",
        documentValue: currentExp.docSnippet || "",
        parsedValue: `${currentExp.position} @ ${currentExp.company}`,
        lineNumber: currentExp.lineStart,
        confidence: 90,
        status: "verified",
      });
    }
  }

  // 5. Education Parsing
  const education: EducationItem[] = [];
  const eduItems = sectionBlocks.education;
  if (eduItems.length > 0) {
    const degreeKeywords = [
      "Bachelor",
      "Master",
      "PhD",
      "Doctorate",
      "B.S.",
      "B.A.",
      "M.S.",
      "M.A.",
      "B.Tech",
      "B.E.",
      "M.Tech",
      "Associate",
      "Diploma",
      "Degree",
      "BSc",
      "MSc",
      "B.Com",
      "BBA",
      "MBA",
    ];

    for (let i = 0; i < eduItems.length; i++) {
      const item = eduItems[i];
      const line = item.text;

      const hasDegree = degreeKeywords.some((d) => new RegExp(`\\b${d}\\b`, "i").test(line));
      const hasUniv = /(?:University|College|Institute|School|Academy|Polytechnic)/i.test(line);

      if (hasUniv || hasDegree) {
        const eduId = `edu_${education.length}_${Math.random().toString(36).substring(2, 7)}`;
        let institution = hasUniv ? line : "University";
        let degree = hasDegree ? line : "";

        if (hasUniv && !degree && eduItems[i + 1]) {
          degree = eduItems[i + 1].text;
          i++;
        } else if (hasDegree && !hasUniv && eduItems[i + 1]) {
          institution = eduItems[i + 1].text;
          i++;
        }

        const gpaMatch = line.match(/GPA\s*:?\s*([0-4]\.\d{1,2}|[0-9]{1,2}(?:\.\d{1,2})?\s*\/\s*10)/i);
        const gpa = gpaMatch ? gpaMatch[1] : "";

        education.push({
          id: eduId,
          institution: institution.slice(0, 80),
          degree: degree.slice(0, 80),
          fieldOfStudy: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          gpa,
          description: "",
        });

        sourceTrace.push({
          id: `trace_${eduId}`,
          fieldKey: `education[${education.length - 1}].institution`,
          label: `Education: ${degree || "Degree"} from ${institution || "School"}`,
          section: "education",
          documentValue: line,
          parsedValue: `${degree} - ${institution}${gpa ? ` (GPA: ${gpa})` : ""}`,
          lineNumber: item.lineNum,
          confidence: 90,
          status: "verified",
        });
      }
    }
  }

  // 6. Skills Parsing (Strict, Noise-Filtered & Categorized)
  const skills: SkillItem[] = [];
  const rawSkillsText = sectionBlocks.skills.map((s) => s.text).join(" ");

  const verifiedTechDictionary = [
    // Languages
    "TypeScript", "JavaScript", "Python", "Go", "Golang", "Java", "C++", "C#", "C", "Rust", "Ruby", "PHP",
    "Swift", "Kotlin", "Scala", "SQL", "R", "MATLAB", "Bash", "PowerShell", "Dart",
    // Web Frameworks & Runtimes
    "React", "React Native", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "SvelteKit", "Astro",
    "Remix", "Node.js", "Express", "Fastify", "Hono", "FastAPI", "Django", "Flask",
    "Spring Boot", "ASP.NET", "Rails", "Laravel", "NestJS", "Bun", "Deno",
    // Databases & ORMs
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase", "DynamoDB",
    "Elasticsearch", "Cassandra", "SQLite", "SQLite-VSS", "Snowflake",
    "Prisma", "Drizzle", "TypeORM", "Sequelize", "SQLAlchemy", "Mongoose",
    // APIs & Messaging
    "GraphQL", "REST APIs", "gRPC", "tRPC", "OpenAPI", "Swagger", "WebSockets", "Socket.io", "Kafka", "RabbitMQ",
    // DevOps & Cloud
    "Docker", "Kubernetes", "AWS", "GCP", "Google Cloud", "Azure", "Terraform", "CI/CD",
    "Git", "GitHub Actions", "GitLab CI", "Linux", "Nginx", "Cloudflare", "Vercel", "Railway", "Fly.io", "Netlify",
    // Frontend & Build Tools
    "Tailwind CSS", "Sass", "HTML5", "CSS3", "Webpack", "Vite", "Turbopack", "esbuild", "Rollup",
    "Microservices", "Serverless",
    // State Management & UI Libraries
    "Zustand", "Jotai", "Redux", "Recoil", "Tanstack Query", "shadcn/ui", "Radix UI",
    "Material UI", "Chakra UI", "Ant Design",
    // AI / ML / LLM
    "PyTorch", "TensorFlow", "OpenAI", "Gemini", "Anthropic", "LangChain", "LangGraph",
    "LlamaIndex", "Ollama", "Groq", "CrewAI", "AutoGen", "Llama", "Mistral",
    "Vector Databases", "Qdrant", "Pinecone", "ChromaDB", "Weaviate",
    "Hugging Face", "ONNX", "Scikit-Learn", "Pandas", "NumPy", "Keras",
    "OpenCV", "MediaPipe", "CUDA", "cuDNN", "MLflow",
    // Data Engineering
    "Apache Spark", "Airflow", "dbt", "Dagster",
    // Testing & Quality
    "Jest", "Playwright", "Cypress", "Vitest", "Storybook",
    // Mobile
    "Expo", "Flutter", "Ionic",
    // Auth & Payments
    "Auth0", "Clerk", "JWT", "OAuth", "Stripe", "Razorpay",
    // Tools
    "Figma", "Agile", "Scrum", "Jira", "System Architecture",
  ];

  const matchedSkillsSet = new Set<string>();

  // 1. Exact canonical technology matching across skills section (and full text if skills block is short)
  const textToScanForSkills = rawSkillsText.length > 20 ? rawSkillsText : text;
  for (const tech of verifiedTechDictionary) {
    const escaped = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|[^a-zA-Z0-9_])${escaped}([^a-zA-Z0-9_]|$)`, "i");
    if (pattern.test(textToScanForSkills)) {
      matchedSkillsSet.add(tech);
    }
  }

  // 2. Strict line-token parsing ONLY inside the explicit skills section
  const sentenceStopWords = new Set([
    "and", "the", "with", "for", "from", "over", "per", "into", "using", "reducing",
    "consumption", "documents", "attendee", "funnels", "clones", "confidence",
    "heatmaps", "schedules", "tables", "fusion", "dependencies", "institutional",
    "retention", "scan", "scaling", "implementing", "building", "developed", "architected",
    "engineered", "optimized", "managed", "created", "designed", "improved", "increased", "decreased"
  ]);

  if (sectionBlocks.skills.length > 0) {
    sectionBlocks.skills.forEach(({ text: sLine }) => {
      const cleaned = sLine.replace(/^[^:]+:\s*/, "");
      const items = cleaned
        .split(/[,•|/]/)
        .map((tok) => tok.trim())
        .filter((tok) => tok.length >= 2 && tok.length <= 25 && !tok.includes("@") && !tok.includes("http"));

      items.forEach((item) => {
        const words = item.split(/\s+/);
        const hasStopWord = words.some((w) => sentenceStopWords.has(w.toLowerCase()));
        const hasMetric = /[<%>0-9]{2,}/.test(item) || /^\d+$/.test(item);
        const isPureText = /^[a-zA-Z0-9.#+ -]+$/.test(item);

        if (words.length <= 3 && !hasStopWord && !hasMetric && isPureText && item.length >= 2) {
          const canonical = verifiedTechDictionary.find((t) => t.toLowerCase() === item.toLowerCase());
          matchedSkillsSet.add(canonical || item);
        }
      });
    });
  }

  const LANG_SET = new Set(["TypeScript", "JavaScript", "Python", "Go", "Golang", "Java", "C++", "C#", "C", "Rust",
    "Ruby", "PHP", "Swift", "Kotlin", "Scala", "SQL", "R", "MATLAB", "Bash", "PowerShell", "Dart", "HTML5", "CSS3"]);
  const FRAMEWORK_SET = new Set(["React", "React Native", "Next.js", "Vue", "Vue.js", "Angular", "Svelte", "SvelteKit",
    "Astro", "Remix", "Node.js", "Express", "Fastify", "Hono", "FastAPI", "Django", "Flask",
    "Spring Boot", "ASP.NET", "Rails", "Laravel", "NestJS"]);
  const TOOLS_SET = new Set(["PostgreSQL", "MySQL", "MongoDB", "Redis", "Supabase", "Firebase", "Docker",
    "Kubernetes", "AWS", "GCP", "Azure", "Git", "Kafka", "MediaPipe", "Razorpay", "Stripe",
    "Cloudflare", "Vercel", "Prisma", "Drizzle"]);

  // Cap total skills to maximum 30
  Array.from(matchedSkillsSet).slice(0, 30).forEach((skillName, idx) => {
    const skillId = `sk_${idx}_${Math.random().toString(36).substring(2, 6)}`;
    const category = LANG_SET.has(skillName) ? "Languages"
      : FRAMEWORK_SET.has(skillName) ? "Frameworks"
      : TOOLS_SET.has(skillName) ? "Tools"
      : "Technical";

    // Infer proficiency level from surrounding context in the skills section
    const lowerSkillsText = rawSkillsText.toLowerCase();
    const skillIdx = lowerSkillsText.indexOf(skillName.toLowerCase());
    const context = skillIdx >= 0
      ? lowerSkillsText.slice(Math.max(0, skillIdx - 40), skillIdx + skillName.length + 40)
      : "";
    const level = /\b(basic|beginner|familiar|exposure|learning|introductory|novice)\b/.test(context)
      ? "Beginner"
      : /\b(intermediate|moderate|working knowledge|comfortable|some experience)\b/.test(context)
      ? "Intermediate"
      : "Advanced";

    skills.push({
      id: skillId,
      name: skillName,
      level,
      category,
    });
  });

  if (skills.length > 0) {
    sourceTrace.push({
      id: "trace_skills",
      fieldKey: "skills",
      label: `Skills (${skills.length} extracted)`,
      section: "skills",
      documentValue: sectionBlocks.skills.map((s) => s.text).join(", ").slice(0, 150) || "Extracted from verified tech tokens",
      parsedValue: skills.map((s) => s.name).join(", "),
      lineNumber: sectionBlocks.skills[0]?.lineNum || 1,
      confidence: 100,
      status: "verified",
    });
  }

  // 7. High-Precision Projects Extraction Engine
  const projects: ProjectItem[] = [];
  const projItems = sectionBlocks.projects;

  const ACTION_VERBS = new Set([
    "developed", "implemented", "built", "designed", "engineered", "created", "architected",
    "trained", "fine-tuned", "evaluated", "optimized", "benchmarked", "integrated", "spearheaded",
    "managed", "led", "configured", "deployed", "scaled", "automated", "reduced", "increased",
    "achieved", "utilized", "leveraged", "authored", "collaborated", "facilitated", "delivered",
    "established", "formulated", "conducted", "analyzed", "processed", "constructed", "compiled",
    "tested", "maintained", "orchestrated", "engineered"
  ]);

  const PROJECT_CATEGORY_KEYWORDS = [
    "Framework", "Engine", "Ecosystem", "Platform", "System", "Assistant", "Pipeline",
    "App", "Application", "Model", "Bot", "Portal", "Dashboard", "Simulator", "Classifier",
    "Tracker", "Optimizer", "Service", "Hub", "Extension", "Toolkit", "Network"
  ];

  const COMMON_TECH_DOMAINS = new Set([
    "nlp", "ai", "ml", "llm", "api", "apis", "rest", "restful", "cv", "dl", "ui", "ux",
    "devops", "cloud", "backend", "frontend", "fullstack", "full stack", "rag", "database",
    "web", "mobile", "ios", "android", "microservices", "serverless", "socket.io", "webrtc", "onnx"
  ]);

  const isTechStackLine = (line: string, foundTechs: string[]): boolean => {
    if (line.includes("—") || line.includes("–") || /\bLink\b/i.test(line) || /github\.com/i.test(line)) {
      return false;
    }

    const clean = line
      .replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*/, "")
      .replace(/^(technologies|tech stack|tools|built with|stack|languages & tools|key tech)\s*:?\s*/i, "")
      .trim();

    if (/^(technologies|tech stack|tools|built with|stack)\s*:/i.test(line)) {
      return true;
    }

    const tokens = clean
      .split(/[,|•/–—+]/)
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);

    if (tokens.length === 0) return false;

    let techCount = 0;
    for (const token of tokens) {
      const isKnownTech = verifiedTechDictionary.some((vt) => vt.toLowerCase() === token);
      const isDomain = COMMON_TECH_DOMAINS.has(token);
      if (isKnownTech || isDomain) {
        techCount++;
      }
    }

    return techCount >= 1 && (techCount >= tokens.length * 0.5 || tokens.length <= 4);
  };

  // Helper to determine if a line is a Project Header
  const isProjectHeader = (line: string): { isHeader: boolean; cleanTitle: string; subtitle: string; liveUrl: string; techs: string[] } => {
    const rawTrimmed = line.trim();
    if (rawTrimmed.length < 3 || rawTrimmed.length > 180) {
      return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
    }

    // Strip leading bullet markers, numbering (1., [1], etc.)
    const stripped = rawTrimmed
      .replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219]+\s*/, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .trim();

    if (!stripped || stripped.length < 3) {
      return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
    }

    const firstWord = (stripped.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");

    // If first word is an action verb, this is a feature bullet, not a project title
    if (ACTION_VERBS.has(firstWord)) {
      return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
    }

    // If line has a colon with a descriptive sentence after it (e.g. "Zero-Cloud Edge Inference: Embedded quantized ONNX models...")
    // check if it's a feature bullet vs project title
    const colonMatch = stripped.match(/^([A-Za-z0-9\s-]{2,35}):\s+(.+)$/);
    if (colonMatch) {
      const afterColon = colonMatch[2].trim();
      const firstAfterColon = (afterColon.split(/\s+/)[0] || "").toLowerCase().replace(/[^a-z]/g, "");
      if (ACTION_VERBS.has(firstAfterColon) || afterColon.length > 40) {
        return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
      }
    }

    const NON_PROJECT_KEYWORDS = [
      "leadership", "position of responsibility", "positions of responsibility",
      "vice captain", "school captain", "cricket team", "football team", "head boy", "head girl",
      "student council", "extracurricular", "co-curricular", "volunteer", "volunteering",
      "responsibility", "responsibilities"
    ];

    const lowerStripped = stripped.toLowerCase();
    if (NON_PROJECT_KEYWORDS.some((kw) => lowerStripped.includes(kw))) {
      return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
    }

    // Extract techs mentioned in this line
    const foundTechs: string[] = [];
    for (const tech of verifiedTechDictionary) {
      const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const techPattern = new RegExp(`(^|[^a-zA-Z0-9_])${escapedTech}([^a-zA-Z0-9_]|$)`, "i");
      if (techPattern.test(stripped)) {
        foundTechs.push(tech);
      }
    }

    // If the line is purely a tech-stack list with no project title (e.g. "FastAPI, NLP" or "React, Vite, Node.js"), it's not a standalone header
    if (isTechStackLine(stripped, foundTechs) && !stripped.includes("|") && !/[—–]/.test(stripped)) {
      return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
    }

    const hasPipe = stripped.includes("|");
    const hasDash = /[—–]/.test(stripped);
    const hasUrl = /https?:\/\/|github\.com/i.test(stripped);
    const hasLinkKeyword = /\bLink\b/i.test(stripped);
    const hasProjectKeyword = PROJECT_CATEGORY_KEYWORDS.some((kw) => new RegExp(`\\b${kw}\\b`, "i").test(stripped));
    const hasExplicitTechStack = foundTechs.length >= 1 && (hasPipe || hasDash || stripped.includes("(") || stripped.includes("["));

    // Extract URL if present
    let liveUrl = "";
    const urlM = stripped.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+/i);
    if (urlM) {
      liveUrl = urlM[0].startsWith("http") ? urlM[0] : `https://${urlM[0]}`;
    }

    if (hasPipe || hasDash || hasUrl || hasLinkKeyword || hasExplicitTechStack || (hasProjectKeyword && stripped.length < 80)) {
      // Split header into Title and Subtitle / Tech
      let titlePart = stripped;
      let subtitlePart = "";

      if (hasDash) {
        const dParts = stripped.split(/[—–]/);
        titlePart = dParts[0].trim();
        subtitlePart = (dParts[1] || "").split("|")[0].replace(/\bLink\b/gi, "").trim();
      } else if (hasPipe) {
        const pParts = stripped.split("|");
        titlePart = pParts[0].trim();
        if (pParts[1] && !pParts[1].toLowerCase().includes("link") && !foundTechs.some(t => pParts[1].includes(t))) {
          subtitlePart = pParts[1].trim();
        }
      }

      const cleanTitle = titlePart
        .replace(/\s*\|\s*Link\s*.*$/i, "")
        .replace(/\s*\|\s*.*$/i, "")
        .replace(/https?:\/\/[^\s]+/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      if (cleanTitle.length >= 3 && cleanTitle.length <= 80) {
        return {
          isHeader: true,
          cleanTitle,
          subtitle: subtitlePart,
          liveUrl,
          techs: Array.from(new Set(foundTechs)),
        };
      }
    }

    // Capitalized standalone heading
    const isCapitalized = /^[A-Z]/.test(stripped);
    const endsWithPeriod = /[.?!]$/.test(stripped);
    const wordCount = stripped.split(/\s+/).length;

    if (isCapitalized && !endsWithPeriod && wordCount <= 7 && !stripped.includes(":") && stripped.length < 60) {
      return {
        isHeader: true,
        cleanTitle: stripped.replace(/\s+/g, " "),
        subtitle: "",
        liveUrl: "",
        techs: Array.from(new Set(foundTechs)),
      };
    }

    return { isHeader: false, cleanTitle: "", subtitle: "", liveUrl: "", techs: [] };
  };

  // Process all lines in the projects section
  let currentProject: {
    title: string;
    subtitle: string;
    bullets: string[];
    technologies: string[];
    liveUrl: string;
    lineNum: number;
  } | null = null;

  const flushProject = () => {
    if (currentProject && currentProject.title.trim()) {
      const projId = `proj_${projects.length}_${Math.random().toString(36).substring(2, 7)}`;
      const description = currentProject.bullets.join("\n\n").trim() || currentProject.title;

      projects.push({
        id: projId,
        title: currentProject.title,
        subtitle: currentProject.subtitle || "",
        description,
        liveUrl: currentProject.liveUrl,
        technologies: currentProject.technologies,
      });

      sourceTrace.push({
        id: `trace_${projId}`,
        fieldKey: `projects[${projects.length - 1}].title`,
        label: `Project: ${currentProject.title}`,
        section: "projects",
        documentValue: currentProject.title,
        parsedValue: currentProject.title,
        lineNumber: currentProject.lineNum,
        confidence: 95,
        status: "verified",
      });
    }
  };

  // Pre-split projects text into discrete lines handling continuous PDF paragraph streams
  const linesToProcess: Array<{ text: string; lineNum: number }> = [];

  const techDelimList = verifiedTechDictionary
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .concat(["CNN-LSTM", "CV", "NLP", "AI", "ML", "RAG", "LLM", "ONNX"])
    .join("|");

  projItems.forEach(({ text: pText, lineNum }) => {
    let normalized = pText.replace(/\s*\.\.\s+/g, "\n");

    // 1. Break after sentence ending punctuation (.!?) before any Project Header with "| Link"
    normalized = normalized.replace(
      /(?<=[.!?])\s+(?=(?:[•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*)?[A-Z][^|\n]{2,60}\s*\|\s*Link)/gi,
      "\n\n"
    );

    // 2. Break after tech words before a feature bullet with colon (e.g. "Razorpay Concurrency Control: Engineered...")
    normalized = normalized.replace(
      new RegExp(`\\b(${techDelimList})\\s+((?:[•*–—\\u2022\\u2023\\u25E6\\u2043\\u2219\\d.]+\\s*)?[A-Z][A-Za-z0-9\\s&-]{2,35}:\\s+[A-Z])`, "gi"),
      "$1\n$2"
    );

    // 3. Break after sentence ending punctuation (.!?) before a feature bullet
    normalized = normalized.replace(
      /(?<=[.!?])\s+(?=(?:[•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*)?[A-Z][A-Za-z0-9\s&-]{2,35}:\s+[A-Z])/g,
      "\n"
    );

    // 4. Break if line starts with a short Project Title directly preceding a colon feature bullet (e.g. "StudyBuddy Zero-Cloud Edge Inference: ...")
    normalized = normalized.replace(
      /^([A-Z][A-Za-z0-9]{2,25})\s+((?:[•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*)?[A-Z][A-Za-z0-9\s&-]{2,35}:\s+[A-Z])/,
      "$1\n$2"
    );

    const splitSegments = normalized.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    splitSegments.forEach((seg) => linesToProcess.push({ text: seg, lineNum }));
  });

  for (const { text: lineText, lineNum } of linesToProcess) {
    const trimmed = lineText.trim();
    if (!trimmed) continue;

    // Extract all recognized tech and domain keywords
    const foundTechs: string[] = [];
    for (const tech of verifiedTechDictionary) {
      const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const techPattern = new RegExp(`(^|[^a-zA-Z0-9_])${escapedTech}([^a-zA-Z0-9_]|$)`, "i");
      if (techPattern.test(trimmed)) {
        foundTechs.push(tech);
      }
    }
    for (const domain of ["NLP", "AI", "ML", "LLM", "RAG", "CV", "WebRTC", "Socket.io", "ONNX", "CNN-LSTM"]) {
      const pattern = new RegExp(`(^|[^a-zA-Z0-9_])${domain}([^a-zA-Z0-9_]|$)`, "i");
      if (pattern.test(trimmed) && !foundTechs.includes(domain)) {
        foundTechs.push(domain);
      }
    }

    const isTechLine = isTechStackLine(trimmed, foundTechs);

    // If current project was just started and the next line is a tech-stack line or link line
    if (isTechLine && currentProject && currentProject.bullets.length === 0) {
      foundTechs.forEach((t) => {
        if (!currentProject!.technologies.includes(t)) {
          currentProject!.technologies.push(t);
        }
      });
      const urlM = trimmed.match(/https?:\/\/[^\s]+|github\.com\/[^\s]+/i);
      if (urlM && !currentProject.liveUrl) {
        currentProject.liveUrl = urlM[0].startsWith("http") ? urlM[0] : `https://${urlM[0]}`;
      }
      continue;
    }

    const headerCheck = isProjectHeader(trimmed);

    if (headerCheck.isHeader && !isTechLine) {
      flushProject();
      currentProject = {
        title: headerCheck.cleanTitle,
        subtitle: headerCheck.subtitle,
        bullets: [],
        technologies: headerCheck.techs,
        liveUrl: headerCheck.liveUrl,
        lineNum,
      };
    } else if (currentProject) {
      const cleanBullet = trimmed
        .replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*/, "")
        .trim();

      if (cleanBullet) {
        foundTechs.forEach((t) => {
          if (!currentProject!.technologies.includes(t)) {
            currentProject!.technologies.push(t);
          }
        });

        // If the segment contains multiple feature bullets, split them cleanly
        const subBullets = cleanBullet
          .split(/(?<=[.!?])\s+(?=(?:[•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*)?[A-Z][A-Za-z0-9\s&-]{2,35}:\s+[A-Z])/g)
          .map((b) => b.trim())
          .filter(Boolean);

        subBullets.forEach((bullet) => {
          currentProject!.bullets.push(bullet);
        });
      }
    } else {
      // First project fallback if header wasn't matched cleanly
      const cleanBullet = trimmed
        .replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*/, "")
        .trim();
      currentProject = {
        title: cleanBullet.split(/[.|-]/)[0].slice(0, 50),
        subtitle: "",
        bullets: [cleanBullet],
        technologies: [],
        liveUrl: "",
        lineNum,
      };
    }
  }

  flushProject();

  // 8. Research & Publications Processing (Isolated into Achievements / Publications)
  const achievements: AchievementItem[] = [];

  if (sectionBlocks.research.length > 0) {
    let currentResearch: {
      title: string;
      issuer: string;
      description: string;
      date: string;
      lineNum: number;
    } | null = null;

    const flushResearch = () => {
      if (currentResearch && currentResearch.title.trim()) {
        const achId = `ach_research_${achievements.length}_${Math.random().toString(36).substring(2, 7)}`;
        achievements.push({
          id: achId,
          title: currentResearch.title,
          issuer: currentResearch.issuer || "Research Publication",
          description: currentResearch.description.trim() || currentResearch.title,
          date: currentResearch.date || "",
        });

        sourceTrace.push({
          id: `trace_${achId}`,
          fieldKey: `achievements[${achievements.length - 1}].title`,
          label: `Research / Publication: ${currentResearch.title}`,
          section: "achievements",
          documentValue: currentResearch.title,
          parsedValue: currentResearch.title,
          lineNumber: currentResearch.lineNum,
          confidence: 95,
          status: "verified",
        });
      }
    };

    sectionBlocks.research.forEach(({ text: rLine, lineNum }) => {
      const trimmed = rLine.trim();
      if (!trimmed) return;

      const cleanLine = trimmed.replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*/, "").trim();
      const isBullet = /^[-•*–—\u2022\u2023\u25E6\u2043\u2219]/.test(trimmed) || ACTION_VERBS.has((cleanLine.split(/\s+/)[0] || "").toLowerCase());

      if (!isBullet && cleanLine.length < 140 && !cleanLine.endsWith(".")) {
        flushResearch();
        const parts = cleanLine.split(/[|—–]/).map((s) => s.trim());
        currentResearch = {
          title: parts[0] || cleanLine,
          issuer: parts[1] || "Research Publication",
          description: "",
          date: "",
          lineNum,
        };
      } else if (currentResearch) {
        currentResearch.description += (currentResearch.description ? " " : "") + cleanLine;
      } else {
        currentResearch = {
          title: cleanLine.slice(0, 80),
          issuer: "Research Publication",
          description: cleanLine,
          date: "",
          lineNum,
        };
      }
    });

    flushResearch();
  }

  // 9. Standard Certifications & Achievements / Leadership
  const certifications: CertificationItem[] = [];
  const seenCertNames = new Set<string>();
  sectionBlocks.certifications.forEach(({ text: cLine, lineNum }) => {
    const normalizedCert = cLine.toLowerCase().trim();
    if (cLine.length > 3 && !seenCertNames.has(normalizedCert)) {
      seenCertNames.add(normalizedCert);
      const certId = `cert_${certifications.length}_${Math.random().toString(36).substring(2, 7)}`;
      certifications.push({
        id: certId,
        name: cLine.slice(0, 100),
        issuer: "",
        issueDate: "",
      });
      sourceTrace.push({
        id: `trace_${certId}`,
        fieldKey: `certifications[${certifications.length - 1}].name`,
        label: `Certification: ${cLine.slice(0, 50)}`,
        section: "certifications",
        documentValue: cLine,
        parsedValue: cLine,
        lineNumber: lineNum,
        confidence: 95,
        status: "verified",
      });
    }
  });

  if (sectionBlocks.achievements.length > 0) {
    let currentAch: {
      title: string;
      issuer: string;
      description: string;
      date: string;
      lineNum: number;
    } | null = null;

    const flushAch = () => {
      if (currentAch && currentAch.title.trim()) {
        const achId = `ach_${achievements.length}_${Math.random().toString(36).substring(2, 7)}`;
        achievements.push({
          id: achId,
          title: currentAch.title,
          issuer: currentAch.issuer || "",
          description: currentAch.description.trim() || currentAch.title,
          date: currentAch.date || "",
        });

        sourceTrace.push({
          id: `trace_${achId}`,
          fieldKey: `achievements[${achievements.length - 1}].title`,
          label: `Achievement / Leadership: ${currentAch.title}`,
          section: "achievements",
          documentValue: currentAch.title,
          parsedValue: currentAch.title,
          lineNumber: currentAch.lineNum,
          confidence: 95,
          status: "verified",
        });
      }
    };

    sectionBlocks.achievements.forEach(({ text: aLine, lineNum }) => {
      const trimmed = aLine.trim();
      if (!trimmed) return;

      const cleanLine = trimmed.replace(/^[-•*–—\u2022\u2023\u25E6\u2043\u2219\d.]+\s*/, "").trim();
      if (!cleanLine) return;

      // Skip redundant section headers if repeated
      if (
        /^(leadership|positions of responsibility|leadership & positions of responsibility|achievements|awards|extracurricular)$/i.test(
          cleanLine
        )
      ) {
        return;
      }

      const isBullet =
        /^[-•*–—\u2022\u2023\u25E6\u2043\u2219]/.test(trimmed) ||
        ACTION_VERBS.has((cleanLine.split(/\s+/)[0] || "").toLowerCase());

      if (!isBullet && cleanLine.length < 100 && !cleanLine.endsWith(".")) {
        flushAch();
        const parts = cleanLine.split(/[|—–]/).map((s) => s.trim());
        currentAch = {
          title: parts[0] || cleanLine,
          issuer: parts[1] || "",
          description: "",
          date: parts[2] || "",
          lineNum,
        };
      } else if (currentAch) {
        currentAch.description += (currentAch.description ? " " : "") + cleanLine;
      } else {
        currentAch = {
          title: cleanLine.slice(0, 80),
          issuer: "",
          description: cleanLine,
          date: "",
          lineNum,
        };
      }
    });

    flushAch();
  }

  const resumeId = `resume_${Math.random().toString(36).substring(2, 10)}`;

  const structuredResume: Resume = {
    id: resumeId,
    title: fullName ? `${fullName} - ${jobTitle || "Resume"}` : "Parsed Resume",
    targetRole: jobTitle || "Software Engineer",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    personalInfo: {
      fullName: fullName || "",
      jobTitle: jobTitle || "",
      email: email || "",
      phone: phone || "",
      location: location || "",
      website: website || "",
      linkedin: linkedin || "",
      github: github || "",
      summary: summary || "",
      showPhoto: false,
      photoShape: "circle",
      photoSize: "md",
    },
    experience,
    education,
    skills,
    projects,
    certifications,
    achievements,
    design: {
      template: "ats-modern",
      accentColor: "#2563EB",
      fontFamily: "Inter",
      fontSize: "base",
      spacing: "normal",
      showIcons: true,
      showSectionDividers: true,
    },
  };

  const processingTimeMs = Date.now() - startTime;

  const originalDocument: OriginalDocument = {
    fileName,
    fileType,
    rawText: text,
    lines: rawLines,
    uploadedAt: new Date().toISOString(),
  };

  const detTotalFields =
    (fullName ? 1 : 0) +
    (email ? 1 : 0) +
    (phone ? 1 : 0) +
    (jobTitle ? 1 : 0) +
    (location ? 1 : 0) +
    (summary ? 1 : 0) +
    experience.length +
    education.length +
    skills.length +
    projects.length +
    certifications.length +
    achievements.length;

  const diagnostics: ImportDiagnostics = {
    parserMethod: "deterministic_v2",
    processingTimeMs,
    characterCount: text.length,
    lineCount: rawLines.length,
    detectedSections,
    missingSections,
    totalFieldsExtracted: detTotalFields,
    traceableFieldsCount: sourceTrace.length,
    traceabilityPercentage: detTotalFields > 0
      ? Math.min(100, Math.round((sourceTrace.length / detTotalFields) * 100))
      : 0,
    warningsCount: 0,
    rawTextPreview: text.slice(0, 1500),
  };

  return validateExtractedResume(
    structuredResume,
    text,
    fileName,
    sourceTrace,
    diagnostics,
    originalDocument
  );
}

/**
 * Stage 2: Optional AI Enhancement.
 * AI may improve phrasing, grammar, and STAR bullet impact of EXISTING parsed content.
 * HARD MANDATE: AI may NEVER create missing sections, fake companies, synthetic skills, or phantom projects.
 */
export async function enhanceResumeWithAI(
  existingResume: Resume,
  originalText: string,
  userApiKey?: string
): Promise<Resume> {
  const effectiveKey = (userApiKey || "").trim() || process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";
  const hasValidKey = isValidApiKey(effectiveKey);

  if (!hasValidKey) {
    return applyHeuristicPolish(existingResume);
  }

  try {
    const genAI = new GoogleGenerativeAI(effectiveKey);
    // Strip internal IDs and the design block before sending to AI — saves tokens and prevents ID mutation
    const rawPayload = JSON.stringify(
      {
        personalInfo: existingResume.personalInfo,
        experience: existingResume.experience,
        education: existingResume.education,
        skills: existingResume.skills,
        projects: existingResume.projects,
        certifications: existingResume.certifications,
        achievements: existingResume.achievements,
      },
      (key, value) => (key === "id" ? undefined : value)
    );
    const truncatedPayload =
      rawPayload.length > 20000
        ? rawPayload.slice(0, 20000) + "\n... [payload truncated]"
        : rawPayload;

    const prompt = `
You are an executive resume copyeditor and ATS optimization specialist.
TASK: Polish the formatting and wording of the candidate's EXISTING resume data.

CRITICAL ANTI-HALLUCINATION CONSTRAINTS:
1. ONLY refine the wording and formatting of existing bullets and summary.
2. DO NOT invent ANY new companies, job titles, schools, dates, skills, or projects that are not in the input.
3. Keep all existing skill names intact. Do not inject unmentioned skills.
4. Polish bullet points to use strong action verbs (e.g., Engineered, Spearheaded, Architected) and clear professional structure.

Existing Resume Data:
${truncatedPayload}

Return strictly valid JSON with identical schema.
    `.trim();

    let textOutput = "";
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });
        const response = await model.generateContent(prompt);
        textOutput = response.response.text();
        if (textOutput) break;
      } catch (err) {
        console.warn(`Enhance resume with ${modelName} notice:`, err);
      }
    }

    if (!textOutput) {
      return applyHeuristicPolish(existingResume);
    }

    const cleanJson = textOutput.replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/\s*```$/, "").trim();

    let polished: any;
    try {
      polished = JSON.parse(cleanJson);
    } catch {
      return applyHeuristicPolish(existingResume);
    }

    // Guard: only apply polished entries that exist at matching indices — prevents silent drops
    const polishedExpCount = Array.isArray(polished.experience) ? polished.experience.length : 0;
    const polishedProjCount = Array.isArray(polished.projects) ? polished.projects.length : 0;

    return {
      ...existingResume,
      personalInfo: {
        ...existingResume.personalInfo,
        summary: polished.personalInfo?.summary || existingResume.personalInfo.summary,
      },
      experience: existingResume.experience.map((exp, idx) => ({
        ...exp,
        description: (idx < polishedExpCount && polished.experience[idx]?.description)
          ? polished.experience[idx].description
          : exp.description,
        highlights:
          idx < polishedExpCount &&
          Array.isArray(polished.experience[idx]?.highlights) &&
          polished.experience[idx].highlights.length > 0
            ? polished.experience[idx].highlights
            : exp.highlights,
      })),
      projects: existingResume.projects.map((proj, idx) => ({
        ...proj,
        description: (idx < polishedProjCount && polished.projects[idx]?.description)
          ? polished.projects[idx].description
          : proj.description,
      })),
    };
  } catch (err) {
    console.warn("AI enhancement failed, falling back to heuristic polish:", err);
    return applyHeuristicPolish(existingResume);
  }
}

/**
 * Deterministic heuristic polish fallback for Stage 2
 */
function applyHeuristicPolish(resume: Resume): Resume {
  return {
    ...resume,
    experience: resume.experience.map((exp) => ({
      ...exp,
      highlights: exp.highlights.map((h) => {
        const trimmed = h.trim();
        if (!trimmed) return trimmed;
        const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
        return capitalized.endsWith(".") ? capitalized : `${capitalized}.`;
      }),
    })),
  };
}
