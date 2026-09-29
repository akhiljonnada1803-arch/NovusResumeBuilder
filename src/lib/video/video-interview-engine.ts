import {
  VideoInterviewTrack,
  VideoTurn,
  RECRUITER_PERSONAS,
  RecruiterPersona,
  VideoEvidenceItem,
  BehavioralMetrics,
} from "@/types/video-interview";

export function getVideoOpeningQuestion(
  track: VideoInterviewTrack,
  candidateName = "Candidate",
  targetRole = "Senior Software Engineer",
  featuredProject = "Production Architecture"
): string {
  const recruiter = RECRUITER_PERSONAS[track];
  const cleanProject = featuredProject && featuredProject !== "Production Architecture" ? featuredProject : "your recent technical work";

  switch (track) {
    case "hr":
      return `Hello ${candidateName}, I'm ${recruiter.name}, ${recruiter.title} at ${recruiter.company}. Thanks for joining this video session today. To start off, tell me about your work on ${cleanProject} and how that experience shaped your approach to cross-team collaboration.`;

    case "technical":
      return `Hi ${candidateName}, I'm ${recruiter.name}, ${recruiter.title}. In this technical round for ${targetRole}, I'd love to discuss production system reliability. Looking at ${cleanProject}, walk me through a critical incident or performance bottleneck you resolved and how you structured the root-cause analysis.`;

    case "behavioral":
      return `Welcome ${candidateName}, I'm ${recruiter.name}, ${recruiter.title}. We place a strong emphasis on leadership and ownership. Tell me about a time during the development of ${cleanProject} when requirements were ambiguous and deadlines were tight. How did you align stakeholders and drive execution?`;

    case "executive":
      return `Hello ${candidateName}, I'm ${recruiter.name}, ${recruiter.title}. As a candidate for ${targetRole}, how do you balance technical debt versus speed-to-market when delivering high-impact initiatives like ${cleanProject}?`;

    default:
      return `Hello ${candidateName}, I'm ${recruiter.name}. Walk me through the architecture of ${cleanProject} and the primary trade-offs you evaluated.`;
  }
}

/**
 * Computes evidence-grounded final video verdict.
 * If candidate responses are empty or below threshold, returns zero scores and "Insufficient interview data".
 */
export function computeFinalVideoVerdict(turns: VideoTurn[]): {
  overallScore: number;
  verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" | "Insufficient Data" | "Evaluation Unavailable";
  recruiterNotes: string;
  topStrengths: string[];
  priorityImprovements: string[];
  evidenceList: VideoEvidenceItem[];
  aggregateBehavioral: BehavioralMetrics;
} {
  const allCandidateWords = turns
    .map((t) => t.transcriptText || "")
    .join(" ")
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);

  const totalWords = allCandidateWords.length;
  const validTurns = turns.filter((t) => (t.transcriptText || "").trim().split(/\s+/).filter(Boolean).length >= 5);
  const evaluated = turns.filter((t) => t.contentEvaluation && t.contentEvaluation.score > 0);

  // Default aggregate behavioral
  const defaultBehavioral: BehavioralMetrics = {
    eyeContactScore: 0,
    facialEngagementScore: 0,
    speakingPaceWpm: 0,
    confidenceScore: 0,
    bodyLanguageScore: 0,
    fillerWordsCount: 0,
    fillerWordsList: [],
  };

  // 1. THRESHOLD RULE: If candidate spoke fewer than 15 words or 0 valid turns
  if (validTurns.length === 0 || totalWords < 15) {
    return {
      overallScore: 0,
      verdict: "Insufficient Data",
      recruiterNotes: "Evaluation suspended: Candidate provided 0 substantive spoken video responses. Under evidence-based recruiter evaluation rules, no performance scores or hiring recommendations can be rendered.",
      topStrengths: [],
      priorityImprovements: [
        "Complete at least one full video turn with substantive spoken answers.",
        "Ensure camera and microphone permissions are enabled.",
      ],
      evidenceList: [],
      aggregateBehavioral: defaultBehavioral,
    };
  }

  let totalContent = 0;
  let totalEye = 0;
  let totalFacial = 0;
  let totalWpm = 0;
  let totalConf = 0;
  let totalBody = 0;
  let totalFiller = 0;
  const allFillerList: string[] = [];

  const strengths: string[] = [];
  const improvements: string[] = [];
  const evidenceList: VideoEvidenceItem[] = [];

  evaluated.forEach((t) => {
    totalContent += t.contentEvaluation!.score;
    const b = t.behavioralScores;
    totalEye += b.eyeContactScore;
    totalFacial += b.facialEngagementScore;
    totalWpm += b.speakingPaceWpm;
    totalConf += b.confidenceScore;
    totalBody += b.bodyLanguageScore;
    totalFiller += b.fillerWordsCount;
    allFillerList.push(...(b.fillerWordsList || []));

    strengths.push(...(t.contentEvaluation!.strengths || []));
    improvements.push(...(t.contentEvaluation!.improvements || []));

    if (t.contentEvaluation!.reason && t.contentEvaluation!.supportingTranscript) {
      evidenceList.push({
        category: "Content & Technical Accuracy",
        score: t.contentEvaluation!.score,
        reason: t.contentEvaluation!.reason,
        supportingTranscript: t.contentEvaluation!.supportingTranscript,
        question: t.questionText,
      });
    }
  });

  const count = evaluated.length || 1;
  const contentScore = Math.round(totalContent / count);
  const avgEye = Math.round(totalEye / count);
  const avgFacial = Math.round(totalFacial / count);
  const avgWpm = Math.round(totalWpm / count);
  const avgConf = Math.round(totalConf / count);
  const avgBody = Math.round(totalBody / count);

  const behavioralScore = Math.round((avgEye + avgFacial + avgConf + avgBody) / 4);
  const overallScore = Math.round(contentScore * 0.6 + behavioralScore * 0.4);

  const verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" =
    overallScore >= 88
      ? "Strong Hire"
      : overallScore >= 78
      ? "Hire"
      : overallScore >= 68
      ? "Leaning Hire"
      : "Needs Improvement";

  return {
    overallScore,
    verdict,
    recruiterNotes: `Candidate achieved an evidence-based rating of ${overallScore}/100 with an overall '${verdict}' decision. Content accuracy scored ${contentScore}% and video delivery presence scored ${behavioralScore}%.`,
    topStrengths: Array.from(new Set(strengths)).slice(0, 3),
    priorityImprovements: Array.from(new Set(improvements)).slice(0, 3),
    evidenceList,
    aggregateBehavioral: {
      eyeContactScore: avgEye,
      facialEngagementScore: avgFacial,
      speakingPaceWpm: avgWpm,
      confidenceScore: avgConf,
      bodyLanguageScore: avgBody,
      fillerWordsCount: totalFiller,
      fillerWordsList: Array.from(new Set(allFillerList)),
    },
  };
}
