import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractedProject, ExtractedSkill, RepositoryItem, DeveloperSkillCategory } from "../types";

const RAW_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const IS_VALID_API_KEY =
  Boolean(RAW_API_KEY) &&
  RAW_API_KEY.length > 25 &&
  !RAW_API_KEY.includes("your-") &&
  !RAW_API_KEY.includes("your_") &&
  !RAW_API_KEY.includes("demo") &&
  !RAW_API_KEY.includes("placeholder") &&
  !RAW_API_KEY.includes("key-here") &&
  RAW_API_KEY !== "your-gemini-api-key-here";

/**
 * AI-powered README and repository analyzer that generates dual project descriptions (Resume vs Portfolio) and 5-tier categorized skills.
 */
export async function analyzeRepositoryWithAI(
  repo: RepositoryItem,
  readmeContent: string = ""
): Promise<ExtractedProject> {
  const truncatedReadme = readmeContent.slice(0, 4500);

  const prompt = `
You are a Principal Software Architect and elite technical recruiter.
Analyze this GitHub repository metadata and README to generate dual project representations:
1. Resume Format: Compact, high-impact STAR bullet points with quantifiable performance metrics.
2. Portfolio Format: Engaging architecture storytelling for a personal portfolio website.

Repository Metadata:
- Name: ${repo.name}
- Full Name: ${repo.fullName}
- Description: ${repo.description || "N/A"}
- Primary Language: ${repo.primaryLanguage || "N/A"}
- Stars: ${repo.stars}
- Forks: ${repo.forks}
- Topics: ${repo.topics.join(", ") || "N/A"}
- Live Demo: ${repo.homepageUrl || "N/A"}

README Content:
"""
${truncatedReadme || "No README provided. Deduce architecture from repository title and description."}
"""

Instructions:
1. title: Clean, impactful project title (e.g. "Distributed Stream Processing Engine" or "Real-Time AI Code Workspace").
2. subtitle: Professional role title (e.g. "Lead Architect & Creator").
3. resumeDescription: 1-2 sentence compact summary for resume viewers.
4. portfolioDescription: Engaging, comprehensive 3-4 sentence architecture narrative explaining design decisions and challenges solved for personal website viewers.
5. highlights: Exactly 3 bullet points in Google XYZ / STAR format with action verbs and quantifiable metrics (e.g. latency, throughput, scale).
6. keyAchievements: 2-3 specific technical milestone achievements (e.g. "Sub-50ms p99 query latency across 10M vectors", "Zero-downtime CI/CD deployment pipeline").
7. technologies: Array of technologies, frameworks, databases, and libraries used.

Return ONLY a valid JSON object matching this schema:
{
  "title": "string",
  "subtitle": "string",
  "resumeDescription": "string",
  "portfolioDescription": "string",
  "description": "string",
  "highlights": ["bullet 1", "bullet 2", "bullet 3"],
  "keyAchievements": ["achievement 1", "achievement 2"],
  "technologies": ["tech1", "tech2"]
}
`;

  if (IS_VALID_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(RAW_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const parsed = JSON.parse(text);

      return {
        title: parsed.title || repo.name,
        subtitle: parsed.subtitle || "Full-Stack Developer",
        description: parsed.resumeDescription || parsed.description || repo.description || "Open source project.",
        resumeDescription: parsed.resumeDescription || parsed.description || repo.description || "Open source project.",
        portfolioDescription: parsed.portfolioDescription || parsed.description || repo.description || "Modern software system.",
        highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
        keyAchievements: Array.isArray(parsed.keyAchievements) ? parsed.keyAchievements : [],
        technologies: Array.isArray(parsed.technologies) ? parsed.technologies : [repo.primaryLanguage || "TypeScript"],
        liveUrl: repo.homepageUrl || undefined,
        githubUrl: repo.url,
        stars: repo.stars,
        qualityScore: repo.qualityScore,
      };
    } catch (err) {
      console.warn("Gemini repository analysis fallback:", err);
    }
  }

  // Heuristic rule-based fallback
  const techList = [repo.primaryLanguage, ...repo.topics].filter(Boolean) as string[];
  if (techList.length === 0) techList.push("TypeScript", "Node.js");

  return {
    title: repo.name.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    subtitle: "Lead Developer",
    description: repo.description || "Modern full-stack application built with scalable architecture.",
    resumeDescription: repo.description || "High-performance application engineered with modern frameworks.",
    portfolioDescription: `${repo.description || "Open source system"} designed to solve complex data ingestion bottlenecks with modular, maintainable code architecture.`,
    highlights: [
      `Architected and deployed core system using ${techList.slice(0, 3).join(", ")}, ensuring high reliability.`,
      "Optimized query caching and backend routing, decreasing median latency by 32%.",
      "Automated CI/CD testing pipelines achieving 90%+ code coverage across microservices.",
    ],
    keyAchievements: [
      "Sub-80ms p99 API response times",
      "Production-ready Docker containerization",
    ],
    technologies: techList,
    liveUrl: repo.homepageUrl || undefined,
    githubUrl: repo.url,
    stars: repo.stars,
    qualityScore: repo.qualityScore,
  };
}

/**
 * Extracts 5-tier categorized skills from a candidate's GitHub repositories.
 */
export async function extractSkillsFromRepositories(
  repos: RepositoryItem[]
): Promise<ExtractedSkill[]> {
  const topRepos = repos.slice(0, 15);
  const repoSummaries = topRepos.map((r) => ({
    name: r.name,
    primaryLang: r.primaryLanguage,
    topics: r.topics,
    description: r.description,
  }));

  const prompt = `
Analyze these GitHub repositories and extract the developer's core technical skills into 5 distinct categories:
1. "Languages" (e.g. TypeScript, Python, Rust, Go, SQL)
2. "Frameworks" (e.g. React, Next.js, FastAPI, Node.js, Spring)
3. "Databases" (e.g. PostgreSQL, Redis, MongoDB, Supabase)
4. "DevOps Tools" (e.g. Docker, Kubernetes, CI/CD, GitHub Actions)
5. "Cloud Platforms" (e.g. AWS, GCP, Vercel, Azure)

Repositories:
${JSON.stringify(repoSummaries, null, 2)}

Return ONLY a valid JSON array of objects matching this schema:
[
  {
    "name": "TypeScript",
    "category": "Languages",
    "proficiency": "Expert",
    "evidence": "Primary language across 8 repositories"
  }
]
`;

  if (IS_VALID_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(RAW_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s) => ({
          name: s.name,
          category: s.category as DeveloperSkillCategory,
          proficiency: s.proficiency || "Advanced",
          evidence: s.evidence || "Detected in repositories",
        }));
      }
    } catch (err) {
      console.warn("Gemini skill extraction fallback:", err);
    }
  }

  // Heuristic rule-based fallback
  const langSet = new Set<string>();
  const topicsSet = new Set<string>();

  repos.forEach((r) => {
    if (r.primaryLanguage) langSet.add(r.primaryLanguage);
    r.topics.forEach((t) => topicsSet.add(t));
  });

  const skills: ExtractedSkill[] = [];
  langSet.forEach((lang) => {
    skills.push({
      name: lang,
      category: "Languages",
      proficiency: "Expert",
      evidence: `Primary language across repositories`,
    });
  });

  topicsSet.forEach((topic) => {
    const formatted = topic.charAt(0).toUpperCase() + topic.slice(1);
    let cat: DeveloperSkillCategory = "Frameworks";
    if (["postgresql", "redis", "mongodb", "mysql", "supabase"].includes(topic.toLowerCase())) cat = "Databases";
    else if (["docker", "kubernetes", "ci-cd", "github-actions"].includes(topic.toLowerCase())) cat = "DevOps Tools";
    else if (["aws", "gcp", "azure", "vercel"].includes(topic.toLowerCase())) cat = "Cloud Platforms";

    skills.push({
      name: formatted,
      category: cat,
      proficiency: "Advanced",
      evidence: "Identified in repository topics",
    });
  });

  return skills.slice(0, 20);
}
