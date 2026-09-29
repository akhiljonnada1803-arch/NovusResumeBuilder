export type VideoInterviewTrack =
  | "hr"
  | "technical"
  | "behavioral"
  | "executive";

export type VideoCallState =
  | "preview"
  | "connecting"
  | "in-call"
  | "evaluating"
  | "completed";

export interface BehavioralMetrics {
  eyeContactScore: number; // 0 - 100
  facialEngagementScore: number; // 0 - 100
  speakingPaceWpm: number; // Words Per Minute (e.g. 135)
  confidenceScore: number; // 0 - 100
  bodyLanguageScore: number; // 0 - 100
  fillerWordsCount: number;
  fillerWordsList: string[];
}

export interface VideoEvidenceItem {
  category: string;
  score: number; // 0 - 100
  reason: string;
  supportingTranscript: string;
  question?: string;
}

export interface VideoContentEvaluation {
  evaluationStatus?: "completed" | "insufficient-data" | "ai-unavailable";
  score: number; // 0 - 100
  reason?: string;
  supportingTranscript?: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion?: string;
  evidenceList?: VideoEvidenceItem[];
}

export interface VideoTurn {
  id: string;
  turnNumber: number;
  questionText: string;
  transcriptText: string;
  audioDurationSeconds: number;
  behavioralScores: BehavioralMetrics;
  contentEvaluation?: VideoContentEvaluation;
  timestamp: string;
}

export interface RecruiterPersona {
  name: string;
  title: string;
  company: string;
  avatarUrl: string;
  accentColor: string;
  bio: string;
}

export interface VideoInterviewSessionReport {
  id: string;
  candidateName: string;
  targetRole: string;
  track: VideoInterviewTrack;
  recruiter: RecruiterPersona;
  evaluationStatus?: "completed" | "insufficient-data" | "ai-unavailable";
  turns: VideoTurn[];
  overallScore: number;
  verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" | "Insufficient Data" | "Evaluation Unavailable";
  aggregateBehavioral: BehavioralMetrics;
  evidenceList: VideoEvidenceItem[];
  recruiterNotes: string;
  topStrengths: string[];
  priorityImprovements: string[];
  recordedVideoBlobUrl?: string;
  completedAt: string;
}

export const RECRUITER_PERSONAS: Record<VideoInterviewTrack, RecruiterPersona> = {
  hr: {
    name: "Elena Rostova",
    title: "Head of Talent Acquisition & Culture",
    company: "Novus Global Talent",
    avatarUrl: "/avatars/recruiter-elena.jpg",
    accentColor: "from-blue-600 to-indigo-700",
    bio: "Specializes in behavioral assessments, leadership principles, and cultural alignment.",
  },
  technical: {
    name: "Marcus Vance",
    title: "Principal Infrastructure Architect",
    company: "Novus Engineering",
    avatarUrl: "/avatars/recruiter-marcus.jpg",
    accentColor: "from-purple-600 to-indigo-800",
    bio: "Ex-Staff Engineer evaluating distributed systems, concurrency, and clean architectural design.",
  },
  behavioral: {
    name: "Sarah Jenkins",
    title: "Director of Engineering Management",
    company: "Novus Leadership",
    avatarUrl: "/avatars/recruiter-sarah.jpg",
    accentColor: "from-emerald-600 to-teal-800",
    bio: "Focuses on conflict management, cross-functional execution, and STAR storytelling.",
  },
  executive: {
    name: "David Sterling",
    title: "VP of Product & Strategic Operations",
    company: "Novus Ventures",
    avatarUrl: "/avatars/recruiter-david.jpg",
    accentColor: "from-amber-600 to-rose-700",
    bio: "Evaluates executive presence, strategic roadmap vision, and business impact.",
  },
};
