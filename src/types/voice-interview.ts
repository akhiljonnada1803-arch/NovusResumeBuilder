export type VoiceInterviewType =
  | "hr"
  | "technical"
  | "system-design"
  | "data-science"
  | "ai-ml"
  | "product-management";

export type VoiceInterviewState =
  | "idle"
  | "ai-speaking"
  | "user-listening"
  | "user-speaking"
  | "evaluating"
  | "completed";

export interface VoiceEvidenceItem {
  category: string;
  score: number; // 0 - 100
  reason: string;
  supportingTranscript: string;
  question?: string;
}

export interface VoiceSpeechAnalytics {
  speakingPaceWpm: number;
  totalWords: number;
  fillerWordsCount: number;
  fillerWordsBreakdown: Record<string, number>;
  avgWordsPerAnswer: number;
  hesitationScore: number;
}

export interface VoiceTurnEvaluation {
  evaluationStatus?: "completed" | "insufficient-data" | "ai-unavailable";
  communicationScore: number; // 0 - 100
  confidenceScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  technicalKnowledgeScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  reason?: string;
  supportingTranscript?: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
  modelAnswer: string;
  followUpQuestion?: string;
  evidenceList?: VoiceEvidenceItem[];
}

export interface VoiceTurn {
  id: string;
  turnNumber: number;
  interviewerQuestion: string;
  candidateTranscript: string;
  audioDurationSeconds?: number;
  speakingPaceWpm?: number;
  fillerWordsCount?: number;
  evaluation?: VoiceTurnEvaluation;
  timestamp: string;
}

export interface VoiceInterviewSession {
  id: string;
  interviewType: VoiceInterviewType;
  targetRole: string;
  candidateName: string;
  totalQuestions: number;
  evaluationStatus?: "completed" | "insufficient-data" | "ai-unavailable";
  turns: VoiceTurn[];
  finalScores: {
    communication: number;
    confidence: number;
    clarity: number;
    technicalKnowledge: number;
    overall: number;
  };
  overallVerdict: "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement" | "Insufficient Data" | "Evaluation Unavailable";
  executiveSummary: string;
  evidenceList: VoiceEvidenceItem[];
  speechAnalytics?: VoiceSpeechAnalytics;
  topStrengths: string[];
  priorityGrowthAreas: string[];
  createdAt: string;
  completedAt?: string;
}

export interface VoiceSettings {
  voiceName: string;
  rate: number; // 0.8 - 1.3
  pitch: number; // 0.8 - 1.2
  volume: number; // 0 - 1
  autoSpeak: boolean;
  silenceTimeoutMs: number;
}

export interface InterviewTypeMetadata {
  id: VoiceInterviewType;
  title: string;
  shortTitle: string;
  description: string;
  focusAreas: string[];
  difficultyLevels: ("Entry" | "Mid" | "Senior" | "Staff / Principal")[];
  iconName: string;
  badgeColor: string;
}

export const INTERVIEW_TYPES_CATALOG: InterviewTypeMetadata[] = [
  {
    id: "hr",
    title: "HR & Behavioral Bar Raiser",
    shortTitle: "HR / Behavioral",
    description: "Evaluates leadership principles, conflict resolution, team collaboration, and cultural alignment using STAR methodology.",
    focusAreas: ["STAR Technique", "Leadership Principles", "Conflict Resolution", "Communication"],
    difficultyLevels: ["Mid", "Senior", "Staff / Principal"],
    iconName: "UserCheck",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  {
    id: "technical",
    title: "Technical & Coding Architecture",
    shortTitle: "Technical Coding",
    description: "Deep dive into data structures, algorithms, frontend/backend paradigms, and production debugging.",
    focusAreas: ["Algorithms", "Clean Architecture", "API Design", "Performance"],
    difficultyLevels: ["Entry", "Mid", "Senior", "Staff / Principal"],
    iconName: "Code2",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  {
    id: "system-design",
    title: "System Design & Distributed Scalability",
    shortTitle: "System Design",
    description: "Architect high-availability distributed systems, caching layers, microservices, and database sharding.",
    focusAreas: ["Scalability & CAP Theorem", "Caching & CDN", "Database Partitioning", "Latency Optimization"],
    difficultyLevels: ["Senior", "Staff / Principal"],
    iconName: "Layers",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  {
    id: "ai-ml",
    title: "AI / Machine Learning Engineering",
    shortTitle: "AI & ML",
    description: "Evaluates LLM architectures, RAG pipelines, model fine-tuning, vector databases, and inference latency.",
    focusAreas: ["LLMs & Transformers", "RAG & Embeddings", "Model Evaluation", "Inference Optimization"],
    difficultyLevels: ["Mid", "Senior", "Staff / Principal"],
    iconName: "BrainCircuit",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  {
    id: "data-science",
    title: "Data Science & Applied Analytics",
    shortTitle: "Data Science",
    description: "Evaluates statistical modeling, A/B experimentation, ETL pipelines, and business metric derivation.",
    focusAreas: ["Hypothesis Testing", "A/B Experimentation", "Predictive Modeling", "Feature Engineering"],
    difficultyLevels: ["Mid", "Senior"],
    iconName: "BarChart3",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    id: "product-management",
    title: "Product Management & Strategy",
    shortTitle: "Product Management",
    description: "Evaluates product vision, metric frameworks, user trade-offs, roadmap execution, and technical feasibility.",
    focusAreas: ["Product Vision", "Prioritization Frameworks", "GTM & Metrics", "Cross-Functional Execution"],
    difficultyLevels: ["Mid", "Senior", "Staff / Principal"],
    iconName: "Target",
    badgeColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
];
