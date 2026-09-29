import { Resume } from "@/types/resume";
import {
  VoiceInterviewType,
  VoiceTurn,
  VoiceTurnEvaluation,
  VoiceEvidenceItem,
  VoiceSpeechAnalytics,
} from "@/types/voice-interview";

/**
 * Builds candidate profile context for the AI Bar Raiser.
 */
export function buildCandidateContext(resume?: Resume | null): string {
  if (!resume) {
    return "Target Role: Senior Software Engineer\nExperience: 5+ years building scalable distributed software.";
  }

  const expLines = (resume.experience || [])
    .slice(0, 3)
    .map((e) => `- ${e.position} at ${e.company} (${e.startDate} - ${e.endDate}): ${e.highlights?.slice(0, 2).join("; ") || e.description}`)
    .join("\n");

  const projLines = (resume.projects || [])
    .slice(0, 3)
    .map((p) => `- Project: "${p.title}" using ${p.technologies?.join(", ") || "various tech"}: ${p.description}`)
    .join("\n");

  const skills = (resume.skills || []).map((s) => s.name).join(", ");

  return `
Candidate Name: ${resume.personalInfo?.fullName || "Candidate"}
Target Role: ${resume.targetRole || resume.personalInfo?.jobTitle || "Senior Software Engineer"}
Skills: ${skills}
Experience History:
${expLines || "Experienced Software Engineer"}
Featured Projects:
${projLines || "Open-source & enterprise projects"}
GitHub: ${resume.personalInfo?.github || "https://github.com/alexrivera"}
Website / Portfolio: ${resume.personalInfo?.website || "https://alexrivera.dev"}
  `.trim();
}

/**
 * Returns dynamic, non-scripted opening questions tailored to the candidate's real profile.
 */
export function getOpeningQuestion(
  interviewType: VoiceInterviewType,
  candidateName = "Candidate",
  targetRole = "Senior Software Engineer",
  featuredProject = "Production Architecture"
): string {
  const cleanProject = featuredProject && featuredProject !== "Production Architecture" ? featuredProject : "your recent technical work";

  switch (interviewType) {
    case "hr":
      return `Welcome ${candidateName}. To start our conversation for the ${targetRole} position, walk me through how you approach cross-functional alignment when stakeholders have conflicting priorities. How did you handle this on ${cleanProject}?`;

    case "technical":
      return `Hello ${candidateName}. In this technical session for ${targetRole}, I'd like to dive into architectural resilience. Looking at your work on ${cleanProject}, walk me through the hardest concurrency or performance bottleneck you encountered and how you engineered the solution.`;

    case "system-design":
      return `Welcome ${candidateName}. For our system design round for ${targetRole}, let's architect a high-throughput distributed system inspired by ${cleanProject}. How would you structure the persistence layer and caching tier to guarantee sub-50ms p99 latency during 10x traffic surges?`;

    case "ai-ml":
      return `Hello ${candidateName}. In this AI and Machine Learning round, let's explore retrieval latency and model reliability. How do you design validation guardrails and evaluation metrics when integrating LLMs or machine learning pipelines into production workflows like ${cleanProject}?`;

    case "data-science":
      return `Welcome ${candidateName}. For our Data Science interview, walk me through an end-to-end data pipeline or analytical model you designed for ${cleanProject}. How did you validate feature significance and monitor data drift in production?`;

    case "product-management":
      return `Hello ${candidateName}. As a Product Manager candidate for ${targetRole}, how do you establish the product roadmap and technical trade-offs for a complex initiative like ${cleanProject}?`;

    default:
      return `Welcome ${candidateName}. Tell me about the core engineering challenges you tackled while building ${cleanProject}, and what architectural decisions you would make differently today.`;
  }
}

/**
 * Computes speech metrics from candidate turns
 */
export function analyzeVoiceSpeech(turns: VoiceTurn[], durationMinutes = 5): VoiceSpeechAnalytics {
  const allWords = turns
    .map((t) => t.candidateTranscript || "")
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const totalWords = allWords.length;
  const safeMinutes = Math.max(0.5, durationMinutes);
  const speakingPaceWpm = totalWords > 0 ? Math.round(totalWords / safeMinutes) : 0;

  const fillerList = ["um", "uh", "like", "you know", "actually", "basically", "sort of"];
  const fillerWordsBreakdown: Record<string, number> = {};
  let fillerWordsCount = 0;

  fillerList.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    const count = (turns.map((t) => t.candidateTranscript).join(" ").match(regex) || []).length;
    if (count > 0) {
      fillerWordsBreakdown[word] = count;
      fillerWordsCount += count;
    }
  });

  const avgWordsPerAnswer = turns.length > 0 ? Math.round(totalWords / turns.length) : 0;
  const hesitationScore = Math.min(100, Math.round((fillerWordsCount / Math.max(totalWords, 1)) * 100));

  return {
    speakingPaceWpm,
    totalWords,
    fillerWordsCount,
    fillerWordsBreakdown,
    avgWordsPerAnswer,
    hesitationScore,
  };
}

/**
 * Calculates evidence-backed final voice scores.
 * Enforces zero scores and "Insufficient interview data" when candidate has not spoken or provided answers.
 */
export function calculateFinalVoiceScores(
  turns: VoiceTurn[],
  durationMinutes = 5
): {
  communication: number;
  confidence: number;
  clarity: number;
  technicalKnowledge: number;
  overall: number;
  verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" | "Insufficient Data" | "Evaluation Unavailable";
  evidenceList: VoiceEvidenceItem[];
  speechAnalytics: VoiceSpeechAnalytics;
  topStrengths: string[];
  priorityGrowthAreas: string[];
  executiveSummary: string;
} {
  const speechAnalytics = analyzeVoiceSpeech(turns, durationMinutes);
  const validCandidateTurns = turns.filter(
    (t) => t.candidateTranscript && t.candidateTranscript.trim().split(/\s+/).filter(Boolean).length >= 5
  );

  const evaluatedTurns = turns.filter((t) => t.evaluation && t.evaluation.overallScore > 0);

  // 1. THRESHOLD RULE: If candidate spoke fewer than 15 words or provided 0 valid answers
  if (validCandidateTurns.length === 0 || speechAnalytics.totalWords < 15) {
    return {
      communication: 0,
      confidence: 0,
      clarity: 0,
      technicalKnowledge: 0,
      overall: 0,
      verdict: "Insufficient Data",
      evidenceList: [],
      speechAnalytics,
      topStrengths: [],
      priorityGrowthAreas: [
        "Complete at least one spoken response to generate evidence-backed evaluation.",
        "Ensure your microphone is connected and speak clearly for at least 15-20 seconds per answer.",
      ],
      executiveSummary: `Evaluation suspended: Session recorded 0 substantive spoken answers (${speechAnalytics.totalWords} words, ${speechAnalytics.speakingPaceWpm} WPM). To prevent false positives or fabricated ratings, no competency scores or hiring recommendations are generated without spoken transcript data.`,
    };
  }

  // 2. Aggregate scores from evaluated turns
  let commTotal = 0;
  let confTotal = 0;
  let clarityTotal = 0;
  let techTotal = 0;
  let overallTotal = 0;

  const allStrengths: string[] = [];
  const allImprovements: string[] = [];
  const evidenceList: VoiceEvidenceItem[] = [];

  evaluatedTurns.forEach((t) => {
    const e = t.evaluation!;
    commTotal += e.communicationScore;
    confTotal += e.confidenceScore;
    clarityTotal += e.clarityScore;
    techTotal += e.technicalKnowledgeScore;
    overallTotal += e.overallScore;

    allStrengths.push(...(e.strengths || []));
    allImprovements.push(...(e.improvements || []));

    if (e.reason && e.supportingTranscript) {
      evidenceList.push({
        category: "Technical & Communication",
        score: e.overallScore,
        reason: e.reason,
        supportingTranscript: e.supportingTranscript,
        question: t.interviewerQuestion,
      });
    } else if (e.evidenceList && e.evidenceList.length > 0) {
      evidenceList.push(...e.evidenceList);
    }
  });

  const count = evaluatedTurns.length || 1;
  const communication = Math.round(commTotal / count);
  const confidence = Math.round(confTotal / count);
  const clarity = Math.round(clarityTotal / count);
  const technicalKnowledge = Math.round(techTotal / count);
  const overall = Math.round(overallTotal / count);

  const verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" =
    overall >= 88
      ? "Strong Hire"
      : overall >= 78
      ? "Hire"
      : overall >= 68
      ? "Leaning Hire"
      : "Needs Improvement";

  return {
    communication,
    confidence,
    clarity,
    technicalKnowledge,
    overall,
    verdict,
    evidenceList,
    speechAnalytics,
    topStrengths: Array.from(new Set(allStrengths)).slice(0, 3),
    priorityGrowthAreas: Array.from(new Set(allImprovements)).slice(0, 3),
    executiveSummary: `Candidate completed ${evaluatedTurns.length} spoken response(s) with an evidence-based overall score of ${overall}/100 (${verdict}). Speaking pace averaged ${speechAnalytics.speakingPaceWpm} WPM across ${speechAnalytics.totalWords} spoken words.`,
  };
}
