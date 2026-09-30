import { RecruiterPersonaProfile } from "./persona";

export type InterviewStage =
  | "intro"
  | "resume-walkthrough"
  | "project-deep-dive"
  | "technical-architecture"
  | "behavioral-leadership"
  | "candidate-qa"
  | "completed";

export interface InterviewStageInfo {
  id: InterviewStage;
  stageNumber: number;
  name: string;
  shortLabel: string;
  description: string;
  typicalDurationMinutes: number;
}

export const INTERVIEW_STAGES: InterviewStageInfo[] = [
  {
    id: "intro",
    stageNumber: 1,
    name: "Introduction & Agenda",
    shortLabel: "1. Intro",
    description: "Welcome, rapport building, role context, and interview agenda setting.",
    typicalDurationMinutes: 3,
  },
  {
    id: "resume-walkthrough",
    stageNumber: 2,
    name: "Resume & Career Walkthrough",
    shortLabel: "2. Career",
    description: "High-level overview of candidate's journey, transitions, and core expertise.",
    typicalDurationMinutes: 5,
  },
  {
    id: "project-deep-dive",
    stageNumber: 3,
    name: "Featured Project Deep Dive",
    shortLabel: "3. Projects",
    description: "In-depth dissection of a key project from Resume, GitHub, or Portfolio.",
    typicalDurationMinutes: 8,
  },
  {
    id: "technical-architecture",
    stageNumber: 4,
    name: "Technical & System Architecture",
    shortLabel: "4. Technical",
    description: "Probing system scalability, trade-offs, edge-case resilience, and design choices.",
    typicalDurationMinutes: 10,
  },
  {
    id: "behavioral-leadership",
    stageNumber: 5,
    name: "Behavioral & Leadership Principles",
    shortLabel: "5. Behavioral",
    description: "Conflict resolution, ambiguous ownership, prioritization, and culture alignment.",
    typicalDurationMinutes: 6,
  },
  {
    id: "candidate-qa",
    stageNumber: 6,
    name: "Candidate Reverse Q&A & Wrap-Up",
    shortLabel: "6. Q&A Wrap-up",
    description: "Candidate asks strategic questions about team, engineering culture, and roadmap.",
    typicalDurationMinutes: 5,
  },
];

export interface RecruiterInternalState {
  confidenceLevel: number; // 0 - 100
  interestLevel: number; // 0 - 100
  concernLevel: number; // 0 - 100
  technicalImpression: "Exceptional" | "Strong" | "Solid" | "Shallow" | "Needs Investigation";
  activeEmotion: string; // Dynamic AI generated string e.g. "Probing Redis eviction policy"
  emotionEmoji: string; // e.g. "🧐", "⚔️", "💡", "🌟", "✍️", "🔍"
}

export interface ConversationTurn {
  id: string;
  speaker: "recruiter" | "candidate";
  stage: InterviewStage;
  text: string;
  timestamp: string;
  recruiterReaction?: string;
  recruiterEmotionEmoji?: string;
  recruiterInternalState?: RecruiterInternalState;
  evaluationSnippet?: {
    score: number;
    feedback: string;
  };
}

export interface MultiSourceContext {
  resumeSummary: string;
  portfolioProjects: string[];
  githubRepos: string[];
  githubLanguages: string[];
  linkedinExperience: string[];
  candidateName: string;
  targetRole: string;
  jobDescription?: string;
}

export type InterviewCategory =
  | "hr"
  | "technical"
  | "project"
  | "behavioral"
  | "system-design"
  | "leadership";

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  question: string;
  intent: string;
  suggestedPoints: string[];
  difficulty: "Junior" | "Mid" | "Senior" | "Lead" | "Staff";
  codeSnippet?: string;
  companyTags?: string[];
  commonPitfalls?: string[];
  modelAnswer?: string;
  estimatedTime?: string;
}

export interface InterviewMessage {
  id: string;
  role: "interviewer" | "candidate";
  content: string;
  timestamp: string;
  questionId?: string;
  evaluation?: any;
}
