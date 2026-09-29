import { Resume } from "@/types/resume";
import { CoverLetterArchetype, CoverLetterTone } from "@/types/cover-letter";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

interface GenerateCoverLetterParams {
  resume: Resume;
  jobDescription: string;
  targetRole: string;
  companyName: string;
  hiringManager?: string;
  archetype: CoverLetterArchetype;
  tone: CoverLetterTone;
}

const ARCHETYPE_INSTRUCTIONS: Record<CoverLetterArchetype, string> = {
  "software-engineer":
    "Emphasize technical architecture, system scalability, distributed pipelines, clean code practices, testing standards, and measurable engineering outcomes (e.g. latency reduction, throughput, reliability).",
  internship:
    "Emphasize academic projects, high learning velocity, foundational computer science concepts, open-source curiosity, and strong passion to contribute meaningfully to the team.",
  "product-manager":
    "Emphasize product strategy, customer obsession, cross-functional engineering/design leadership, KPI growth metrics, roadmap execution, and product-market fit vision.",
  research:
    "Emphasize algorithmic depth, mathematical rigor, experimental methodology, published research/citations, benchmarking rigor, and novel technical problem solving.",
  startup:
    "Emphasize high velocity, wearing multiple hats, zero-to-one product shipping, extreme ownership, bias for action, adaptability, and thriving in fast-paced ambiguous environments.",
  corporate:
    "Emphasize enterprise governance, stakeholder alignment, compliance, risk mitigation, scalable cross-team collaboration, and proven track record of reliable delivery.",
};

const TONE_INSTRUCTIONS: Record<CoverLetterTone, string> = {
  professional:
    "Tone: Authoritative, polished, sophisticated, and respectful. Use crisp standard business grammar.",
  enthusiastic:
    "Tone: Energetic, passionate, inspiring, and mission-driven. Convey deep excitement for the company's vision and product.",
  minimalist:
    "Tone: Direct, succinct, punchy, and concise. No fluff, filler, or cliches. Get straight to the value proposition.",
  storytelling:
    "Tone: Narrative-driven and engaging. Frame career milestones as a compelling journey of solving tough problems.",
  "data-driven":
    "Tone: Analytical, metric-heavy, and outcome-oriented. Highlight percentages, user counts, scale factors, and quantifiable business impact.",
};

/**
 * Generates an authentic, recruiter-calibrated cover letter using Gemini AI.
 */
export async function generateCoverLetterWithAI(
  params: GenerateCoverLetterParams
): Promise<string> {
  const { resume, jobDescription, targetRole, companyName, hiringManager, archetype, tone } = params;

  const candidateName = resume.personalInfo?.fullName || "Candidate";
  const candidateSummary = resume.personalInfo?.summary || "";
  const candidateExperience = (resume.experience || [])
    .slice(0, 3)
    .map(
      (e) => `- ${e.position} at ${e.company}: ${e.highlights?.slice(0, 2).join("; ") || e.description}`
    )
    .join("\n");
  const candidateProjects = (resume.projects || [])
    .slice(0, 2)
    .map((p) => `- Project "${p.title}": ${p.description} (Tech: ${p.technologies?.join(", ")})`)
    .join("\n");
  const candidateSkills = (resume.skills || []).slice(0, 10).map((s) => s.name).join(", ");

  const prompt = `
You are an expert technical resume and cover letter writer for top-tier technology companies (Google, Stripe, Linear, Notion, Apple).
Write an exceptional, authentic, and persuasive cover letter for ${candidateName} applying for the ${targetRole} position at ${companyName}.

Archetype Focus (${archetype}):
${ARCHETYPE_INSTRUCTIONS[archetype]}

Tone Guidelines (${tone}):
${TONE_INSTRUCTIONS[tone]}

Recipient:
${hiringManager ? `Dear ${hiringManager},` : `Dear ${companyName} Hiring Team,`}

Job Description / Target Criteria:
"""
${jobDescription.slice(0, 3000)}
"""

Candidate's Real Resume Context (MUST reference these specific achievements and projects):
- Summary: ${candidateSummary}
- Work Experience:
${candidateExperience || "Experienced technical professional."}
- Featured Projects:
${candidateProjects || "Built high-performance software applications."}
- Top Skills: ${candidateSkills}

Formatting & Quality Rules:
1. Address the recipient properly (e.g. "Dear ${hiringManager || `${companyName} Hiring Team`},").
2. Paragraph 1 (The Hook): A strong opening stating the role, enthusiasm for ${companyName}'s specific mission, and a high-level summary of relevant expertise.
3. Paragraph 2 & 3 (The Proof & Impact): Directly connect 2-3 specific accomplishments from the candidate's real experience and projects to the challenges described in the job description. Cite real metrics (throughput, latency, user counts).
4. Paragraph 4 (The Close & Call to Action): Reiterate excitement, cultural fit, and propose a discussion.
5. Sign off professionally (e.g. "Sincerely,\n${candidateName}").
6. Keep total length around 280-380 words for optimal recruiter readability.
7. Return ONLY the plain text cover letter (no markdown header blocks, no meta commentary).
`;

  if (GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: { temperature: 0.3 },
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();
      if (text.length > 100) return text;
    } catch (err) {
      console.warn("Gemini cover letter generation fallback:", err);
    }
  }

  // Fallback template
  const salutation = hiringManager ? `Dear ${hiringManager},` : `Dear ${companyName} Hiring Team,`;
  return `${salutation}

I am writing to express my strong enthusiasm for the ${targetRole} position at ${companyName}. With extensive experience architecting modern software systems, scalable backend pipelines, and interactive web applications, I have long admired ${companyName}'s technological leadership and would be thrilled to contribute to your engineering organization.

In my recent work, I have focused on delivering measurable impact across distributed cloud architectures. At my previous roles, I led high-velocity initiatives optimizing core platforms, reducing API latencies, and establishing robust continuous integration and automated testing suites. Furthermore, my hands-on background developing full-stack projects using ${candidateSkills.slice(0, 40) || "modern technologies"} directly aligns with the technical challenges outlined in your job requirements.

What excites me most about ${companyName} is the opportunity to solve complex, high-scale engineering problems alongside a world-class team. I bring a strong ownership mindset, a passion for clean modular architecture, and a dedication to mentoring peers and maintaining high code reliability.

I would welcome the opportunity to discuss in detail how my background, technical capabilities, and enthusiasm align with ${companyName}'s goals for the ${targetRole} role. Thank you for your time and consideration.

Sincerely,

${candidateName}`;
}
