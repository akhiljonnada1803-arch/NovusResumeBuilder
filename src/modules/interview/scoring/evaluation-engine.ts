import { Resume } from "@/types/resume";
import {
  InterviewQuestion,
  InterviewCategory,
  AnswerEvaluation,
  InterviewReadinessReport,
} from "../types";
import { IS_VALID_API_KEY, getGeminiModel } from "@/lib/gemini/client";

/**
 * Generates tailored interview questions based on candidate's real resume.
 */
export async function generateInterviewQuestions(
  resume: Resume,
  targetRole?: string
): Promise<InterviewQuestion[]> {
  const role = targetRole || resume.personalInfo?.jobTitle || "Software Engineer";
  const candidateExperience = (resume.experience || [])
    .map((e) => `${e.position} at ${e.company}: ${e.description} ${(e.highlights || []).join(" ")}`)
    .join("\n");
  const candidateProjects = (resume.projects || [])
    .map((p) => `${p.title}: ${p.description} (Tech: ${(p.technologies || []).join(", ")})`)
    .join("\n");
  const candidateSkills = (resume.skills || []).map((s) => s.name).join(", ");

  const prompt = `
You are a Principal Bar Raiser and Technical Interview Director at a top-tier tech firm (Google, Meta, Stripe, Netflix).
Analyze this candidate's resume and generate 10-12 high-caliber, tailored interview questions for a ${role} position.

Resume Context:
- Skills: ${candidateSkills || "TypeScript, React, Node.js, Distributed Systems, Python, SQL"}
- Experience:
${candidateExperience || "Full stack engineering experience."}
- Projects:
${candidateProjects || "Built web applications."}

Categories to cover:
1. "technical": Architecture, database trade-offs, language internals, concurrency, memory/caching.
2. "system-design": High-scale distributed systems, reliability, p99 latency, partition tolerance, load balancing.
3. "project": Deep dive into candidate's specific resume projects and implementation details.
4. "behavioral": STAR method (Situation, Task, Action, Result) covering conflict, ownership, ambiguity, deadlines.
5. "leadership": Technical mentoring, architectural vision, engineering standards, cross-functional collaboration.
6. "hr": Cultural fit, motivation, career trajectory.

Return ONLY a valid JSON array of objects matching this exact schema:
[
  {
    "id": "q-1",
    "category": "technical",
    "question": "string",
    "intent": "Interviewer evaluation criteria",
    "suggestedPoints": ["point 1", "point 2", "point 3"],
    "difficulty": "Senior",
    "companyTags": ["Google", "Meta"],
    "commonPitfalls": ["Pitfall 1 to avoid", "Pitfall 2 to avoid"],
    "modelAnswer": "Comprehensive exemplar STAR or architectural answer outline explaining technical choices and trade-offs.",
    "estimatedTime": "3-5 mins"
  }
]
`;

  if (IS_VALID_API_KEY) {
    try {
      const model = getGeminiModel(0.2);

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q, idx) => ({
          id: `q-${idx + 1}-${Date.now()}`,
          category: (q.category || "technical") as InterviewCategory,
          question: q.question,
          intent: q.intent || "Evaluating domain competence and technical rigor.",
          suggestedPoints: Array.isArray(q.suggestedPoints) ? q.suggestedPoints : [],
          difficulty: q.difficulty || "Senior",
          companyTags: Array.isArray(q.companyTags) && q.companyTags.length > 0 ? q.companyTags : ["FAANG", "Tier-1"],
          commonPitfalls: Array.isArray(q.commonPitfalls) ? q.commonPitfalls : ["Failing to articulate trade-offs."],
          modelAnswer: q.modelAnswer || "Structure response using Situation-Task-Action-Result with quantified performance outcomes.",
          estimatedTime: q.estimatedTime || "3-5 mins",
        }));
      }
    } catch {
      // Gracefully fall through to tailored domain questions
    }
  }

  const primaryProject = resume.projects?.[0]?.title || "recent core system";

  // Grounded rich curated questions
  return [
    {
      id: "q-1-tech",
      category: "technical",
      question: "How do you approach architecting distributed services to ensure sub-100ms p99 latency under heavy concurrent write loads?",
      intent: "Evaluate system design depth, caching strategies, and database indexing.",
      suggestedPoints: ["Read/Write replicas & CQRS", "Redis caching layers with TTL jitter", "Asynchronous message queues (Kafka/RabbitMQ)"],
      difficulty: "Senior",
      companyTags: ["Meta", "Stripe", "Uber"],
      commonPitfalls: ["Suggesting synchronous DB writes on high traffic paths", "Ignoring database connection pool limits"],
      modelAnswer: "In high-write environments, decouple writes using an append-only event stream (Kafka) with worker consumers, employ write-through Redis caching with jittered TTL to avoid stampedes, and partition PostgreSQL tables by tenant or date.",
      estimatedTime: "4-6 mins",
    },
    {
      id: "q-2-sysdesign",
      category: "system-design",
      question: "Design a globally distributed rate limiter that can handle 500,000 requests/second with minimal cross-region latency.",
      intent: "Assess distributed state management, token bucket vs sliding window algorithms, and CAP theorem trade-offs.",
      suggestedPoints: ["Sliding window counter vs Token bucket algorithm", "Local edge rate limiting (Cloudflare/Fastly)", "Redis clusters with batch sync"],
      difficulty: "Staff",
      companyTags: ["Google", "Cloudflare", "Netflix"],
      commonPitfalls: ["Relying on a single global Redis cluster with high cross-region latency", "Failing to handle clock skew across nodes"],
      modelAnswer: "Employ a hybrid hierarchical rate limiter: enforce coarse limits at the edge via CDN/proxy using local memory sliding windows, synchronize aggregated metrics asynchronously to regional Redis clusters via Redis Cell or Lua scripts.",
      estimatedTime: "5-7 mins",
    },
    {
      id: "q-3-project",
      category: "project",
      question: `Walk me through the architecture of your featured project (${primaryProject}). What was the most critical technical trade-off you made and how did it perform in production?`,
      intent: "Validate authentic hands-on project leadership, architectural discernment, and troubleshooting depth.",
      suggestedPoints: ["Clear architecture & component boundaries", "Specific technical trade-off evaluated", "Quantified latency, throughput, or cost outcome"],
      difficulty: "Senior",
      companyTags: ["Stripe", "Amazon", "YC Startup"],
      commonPitfalls: ["Focusing only on UI features without discussing backend constraints", "Not knowing the production bottlenecks"],
      modelAnswer: `When building ${primaryProject}, we evaluated synchronous REST vs asynchronous event streaming for state updates. We opted for an event-driven model using Kafka, which decoupled consumers and reduced peak p95 latency from 450ms to 42ms.`,
      estimatedTime: "4-5 mins",
    },
    {
      id: "q-4-behavioral",
      category: "behavioral",
      question: "Tell me about a time when you strongly disagreed with a technical or product decision made by a team lead or architect. How did you handle the situation?",
      intent: "Assess constructive disagreement, empathy, and commitment to team execution (Disagree and Commit).",
      suggestedPoints: ["Data-driven constructive debate", "Active listening & empathy for product constraints", "Disagree and commit mindset once a decision was finalized"],
      difficulty: "Senior",
      companyTags: ["Amazon", "Google", "Apple"],
      commonPitfalls: ["Sounding defensive or resentful", "Giving an example where you did not support the team after the decision"],
      modelAnswer: "Situation: Our lead proposed migrating to a document database for relational user transactional data. Task: I needed to present relational integrity risks constructively. Action: I benchmarked foreign-key consistency and presented a 2-page RFC showing migration trade-offs. Result: The team adopted PostgreSQL with JSONB columns as the optimal middle ground.",
      estimatedTime: "3-4 mins",
    },
    {
      id: "q-5-leadership",
      category: "leadership",
      question: "How do you balance shipping fast for business deadlines against paying down technical debt and maintaining high code quality?",
      intent: "Evaluate engineering maturity, pragmatic trade-offs, and technical leadership.",
      suggestedPoints: ["Explicit technical debt tracking", "20% sprint allocation for refactoring", "Identifying business-critical vs non-critical failure zones"],
      difficulty: "Lead",
      companyTags: ["Netflix", "Meta", "Stripe"],
      commonPitfalls: ["Demanding 100% perfection without business context", "Ignoring tech debt until production breaks"],
      modelAnswer: "Technical debt is a financial leverage tool: borrow deliberately to test market fit, but track it transparently in the backlog with clear interest costs. We allocate 15-20% of sprint capacity to debt remediation and enforce strict zero-debt tolerance on auth and payments.",
      estimatedTime: "3-5 mins",
    },
    {
      id: "q-6-hr",
      category: "hr",
      question: `Why are you looking to advance your career as a ${role}, and what type of engineering culture brings out your highest impact?`,
      intent: "Assess self-awareness, authentic motivation, growth trajectory, and cultural alignment.",
      suggestedPoints: ["Alignment with modern high-velocity engineering", "High psychological safety & autonomous ownership", "Continuous technical curiosity"],
      difficulty: "Mid",
      companyTags: ["All Tech Companies"],
      commonPitfalls: ["Generic answers like 'I love coding'", "Speaking negatively about past employers"],
      modelAnswer: `I thrive in engineering cultures that combine high autonomous ownership with transparent technical debate. As a ${role}, I am focused on architecting resilient distributed systems and mentoring teammates to elevate engineering standards.`,
      estimatedTime: "2-3 mins",
    },
  ];
}

/**
 * Evaluates candidate's response across dimensions with mandatory evidence anchoring.
 * If answer length < threshold or AI is offline, returns zero scores / "Insufficient interview data"
 * without fabricating fake praise or hallucinations.
 */
export async function evaluateCandidateAnswer(
  question: InterviewQuestion,
  candidateAnswer: string,
  resume: Resume
): Promise<AnswerEvaluation> {
  const cleanAnswer = (candidateAnswer || "").trim();
  const wordCount = cleanAnswer.split(/\s+/).filter(Boolean).length;

  // 1. THRESHOLD RULE: If answer is too short (< 8 words), return "Insufficient interview data"
  if (wordCount < 8) {
    return {
      evaluationStatus: "insufficient-data",
      overallScore: 0,
      technicalAccuracy: 0,
      communication: 0,
      confidence: 0,
      completeness: 0,
      reason: "Answer was too brief (< 8 words) to extract technical claims or evaluate competence.",
      supportingTranscript: cleanAnswer ? `"${cleanAnswer}"` : "(No answer provided)",
      feedback: "Insufficient interview data: Please provide a substantive response explaining your reasoning and technical decisions.",
      strengths: [],
      improvements: [
        "Provide a complete spoken or written explanation addressing the question intent.",
        "Structure your response using the STAR format (Situation, Task, Action, Result).",
      ],
      modelAnswer: `When addressing ${question.question.toLowerCase().replace("?", "")}, I start by defining the technical requirements, trade-offs, and key metrics.`,
      evidenceList: [],
    };
  }

  // 2. AI Evidence-Based Evaluation
  if (IS_VALID_API_KEY) {
    try {
      const model = getGeminiModel(0.1);

      const prompt = `
You are a Principal Engineering Bar Raiser.
Evaluate this candidate's interview response with strict evidence-based rigor.

CRITICAL EVIDENCE RULES:
1. Every score MUST be derived from factual statements in the candidate's transcript.
2. If the candidate makes vague, hand-wavy, or inaccurate statements, score them accordingly (40-65).
3. EVERY score must include:
   - score (0-100)
   - reason (explanation of what was correct or missing)
   - supportingTranscript (verbatim quote from candidate)
4. DO NOT invent praise or strengths if not supported by the candidate's actual words.

Question:
"${question.question}"

Question Intent:
${question.intent}

Candidate's Answer:
"""
${cleanAnswer}
"""

Return valid JSON adhering strictly to this schema:
{
  "overallScore": number (0-100),
  "technicalAccuracy": number (0-100),
  "communication": number (0-100),
  "confidence": number (0-100),
  "completeness": number (0-100),
  "reason": "Detailed evidence-backed reason for this score",
  "supportingTranscript": "Exact verbatim quote from candidate answer",
  "feedback": "Concise 2-3 sentence recruiter critique",
  "strengths": ["Strength 1 citing exact candidate statement"],
  "improvements": ["Improvement 1 citing candidate omission or weak point"],
  "modelAnswer": "Exemplar model answer (150-200 words)",
  "evidenceList": [
    {
      "category": "Technical Accuracy",
      "score": number,
      "reason": "Reason for technical score",
      "supportingTranscript": "Exact candidate quote"
    },
    {
      "category": "Communication",
      "score": number,
      "reason": "Reason for communication score",
      "supportingTranscript": "Exact candidate quote"
    },
    {
      "category": "Completeness",
      "score": number,
      "reason": "Reason for completeness score",
      "supportingTranscript": "Exact candidate quote"
    }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());

      return {
        evaluationStatus: "completed",
        overallScore: Math.min(100, Math.max(0, parsed.overallScore || 0)),
        technicalAccuracy: Math.min(100, Math.max(0, parsed.technicalAccuracy || 0)),
        communication: Math.min(100, Math.max(0, parsed.communication || 0)),
        confidence: Math.min(100, Math.max(0, parsed.confidence || 0)),
        completeness: Math.min(100, Math.max(0, parsed.completeness || 0)),
        reason: parsed.reason || "Evaluated against question intent and technical correctness.",
        supportingTranscript: parsed.supportingTranscript || cleanAnswer.slice(0, 100),
        feedback: parsed.feedback || "Response evaluated against standard competency rubric.",
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
        improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
        modelAnswer: parsed.modelAnswer || "",
        evidenceList: Array.isArray(parsed.evidenceList) ? parsed.evidenceList : [],
      };
    } catch (err) {
      console.warn("AI answer evaluation failed:", err);
    }
  }

  // 3. AI Service Unavailable
  return {
    evaluationStatus: "ai-unavailable",
    overallScore: 0,
    technicalAccuracy: 0,
    communication: 0,
    confidence: 0,
    completeness: 0,
    reason: "AI evaluation service could not be reached to perform evidence-backed scoring.",
    supportingTranscript: cleanAnswer.slice(0, 80) + "...",
    feedback: "Evaluation unavailable: To maintain reporting integrity, no simulated or fabricated scores are assigned without live AI verification.",
    strengths: [],
    improvements: ["Configure a valid Google Gemini API key to enable live evidence-backed interview scoring."],
    modelAnswer: "",
    evidenceList: [],
  };
}

/**
 * Computes an overall Interview Readiness benchmark report from evaluated answers.
 */
export function calculateInterviewReadiness(
  evaluations: AnswerEvaluation[]
): InterviewReadinessReport {
  const completedEvaluations = evaluations.filter((e) => e.evaluationStatus === "completed" && e.overallScore > 0);

  if (completedEvaluations.length === 0) {
    return {
      overallReadiness: 0,
      readinessLevel: "Insufficient Data",
      totalQuestionsAnswered: 0,
      averageScores: {
        technicalAccuracy: 0,
        communication: 0,
        confidence: 0,
        completeness: 0,
      },
      evidenceList: [],
      topStrengths: [],
      priorityImprovements: [
        "Complete at least one full interview question with substantive technical details to calculate readiness.",
      ],
    };
  }

  const count = completedEvaluations.length;
  const avgTech = Math.round(completedEvaluations.reduce((acc, e) => acc + e.technicalAccuracy, 0) / count);
  const avgComm = Math.round(completedEvaluations.reduce((acc, e) => acc + e.communication, 0) / count);
  const avgConf = Math.round(completedEvaluations.reduce((acc, e) => acc + e.confidence, 0) / count);
  const avgComp = Math.round(completedEvaluations.reduce((acc, e) => acc + e.completeness, 0) / count);

  const overall = Math.round(
    avgTech * 0.35 + avgComm * 0.25 + avgConf * 0.2 + avgComp * 0.2
  );

  let readinessLevel: InterviewReadinessReport["readinessLevel"] = "Solid Candidate";
  if (overall >= 88) readinessLevel = "FAANG / Tier-1 Ready";
  else if (overall >= 75) readinessLevel = "Solid Candidate";
  else if (overall >= 60) readinessLevel = "Needs Moderate Preparation";
  else readinessLevel = "High Risk";

  const allStrengths = Array.from(new Set(completedEvaluations.flatMap((e) => e.strengths))).slice(0, 3);
  const allImprovements = Array.from(new Set(completedEvaluations.flatMap((e) => e.improvements))).slice(0, 3);
  const allEvidence = completedEvaluations.flatMap((e) => e.evidenceList || []);

  return {
    overallReadiness: overall,
    readinessLevel,
    totalQuestionsAnswered: count,
    averageScores: {
      technicalAccuracy: avgTech,
      communication: avgComm,
      confidence: avgConf,
      completeness: avgComp,
    },
    evidenceList: allEvidence,
    topStrengths: allStrengths,
    priorityImprovements: allImprovements,
  };
}
