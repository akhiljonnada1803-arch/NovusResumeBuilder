import { RecruiterPersonaProfile } from "./persona";
import { ConversationTurn } from "./session";
import { IntegrityReport } from "./integrity";

export interface SpeechAnalytics {
  speakingPaceWpm: number;
  totalWords: number;
  fillerWordsCount: number;
  fillerWordsBreakdown: Record<string, number>;
  avgWordsPerAnswer: number;
  hesitationScore: number;
}

export interface ExampleAnswerImprovement {
  question: string;
  candidateAnswerExcerpt: string;
  critique: string;
  suggestedHighImpactAnswer: string;
}

export interface EvaluationEvidenceItem {
  category: string;
  score: number;
  reason: string;
  supportingTranscript: string;
  question?: string;
  candidateAnswerExcerpt?: string;
}

export interface EvidenceScoreItem {
  category: string;
  score: number;
  reason: string;
  supportingTranscript: string;
}

export interface AnswerEvaluation {
  evaluationStatus: "completed" | "insufficient-data" | "ai-unavailable";
  overallScore: number;
  technicalAccuracy: number;
  communication: number;
  confidence: number;
  completeness: number;
  reason: string;
  supportingTranscript: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  evidenceList: EvidenceScoreItem[];
}

export interface InterviewReadinessReport {
  overallReadiness: number; // 0-100
  readinessLevel: "FAANG / Tier-1 Ready" | "Solid Candidate" | "Needs Moderate Preparation" | "High Risk" | "Insufficient Data";
  totalQuestionsAnswered: number;
  averageScores: {
    technicalAccuracy: number;
    communication: number;
    confidence: number;
    completeness: number;
  };
  evidenceList: EvidenceScoreItem[];
  topStrengths: string[];
  priorityImprovements: string[];
}

export interface InterviewScorecard {
  id: string;
  candidateName: string;
  targetRole: string;
  persona: RecruiterPersonaProfile;
  totalTurns: number;
  durationMinutes: number;
  evaluationStatus: "completed" | "insufficient-data" | "ai-unavailable";
  candidateResponseCount: number;
  turns: ConversationTurn[];
  scores: {
    communication: number; // 0 - 100
    technicalKnowledge: number; // 0 - 100
    technicalDepth?: number; // legacy fallback
    problemSolving: number; // 0 - 100
    confidence: number; // 0 - 100
    clarity: number; // 0 - 100
    leadership: number; // 0 - 100
    behavioralFit: number; // 0 - 100
    roleMatch: number; // 0 - 100
    overall: number; // 0 - 100
  };
  evidenceList?: EvaluationEvidenceItem[];
  speechAnalytics?: SpeechAnalytics;
  missedOpportunities?: string[];
  exampleAnswerImprovements?: ExampleAnswerImprovement[];
  integrityReport?: IntegrityReport;
  verdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" | "Insufficient Data" | "Evaluation Unavailable";
  executiveSummary: string;
  keyStrengths: string[];
  growthAreas: string[];
  recruiterClosingNote: string;
  completedAt: string;
}
