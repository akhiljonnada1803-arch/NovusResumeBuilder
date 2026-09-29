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
You are a Principal Bar Raiser and Technical Interviewer at a top tier technology firm (Google, Meta, Stripe).
Analyze this candidate's resume and generate 8 high-caliber, highly tailored interview questions for a ${role} position.

Resume Context:
- Skills: ${candidateSkills || "TypeScript, React, Node.js, Distributed Systems"}
- Experience:
${candidateExperience || "Full stack engineering experience."}
- Projects:
${candidateProjects || "Built web applications."}

Generate exactly 2 questions per category:
1. "hr": Cultural fit, motivation for role, work style, and career transitions.
2. "technical": Architecture, system scalability, database tradeoffs, debugging, or core concepts relevant to their skills.
3. "project": Deep dive into their specific projects listed on the resume (e.g. architecture decisions, challenges, scaling bottlenecks).
4. "behavioral": STAR method questions (conflict resolution, handling tight deadlines, failure and learning).

Return ONLY a valid JSON array of objects matching this schema:
[
  {
    "id": "q-1",
    "category": "technical",
    "question": "string",
    "intent": "What the interviewer is evaluating",
    "suggestedPoints": ["point 1", "point 2"],
    "difficulty": "Senior"
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
          category: q.category as InterviewCategory,
          question: q.question,
          intent: q.intent || "Evaluating domain competence",
          suggestedPoints: Array.isArray(q.suggestedPoints) ? q.suggestedPoints : [],
          difficulty: q.difficulty || "Senior",
        }));
      }
    } catch {
      // Gracefully fall through to tailored domain questions
    }
  }

  // Grounded curated questions
  return [
    {
      id: "q-1-hr",
      category: "hr",
      question: `Why are you interested in advancing your career as a ${role}, and what type of engineering culture brings out your best work?`,
      intent: "Assess genuine motivation, cultural fit, and self-awareness.",
      suggestedPoints: ["Alignment with modern product engineering", "Collaborative ownership mindset", "Continuous technical curiosity"],
      difficulty: "Mid",
    },
    {
      id: "q-2-technical",
      category: "technical",
      question: "How do you approach architecting distributed microservices to ensure sub-100ms p99 latency under heavy concurrent write loads?",
      intent: "Evaluate system design depth, caching strategies, and database indexing.",
      suggestedPoints: ["Read/Write replicas & CQRS", "Redis caching layers", "Asynchronous message queues (Kafka/RabbitMQ)"],
      difficulty: "Senior",
    },
    {
      id: "q-3-project",
      category: "project",
      question: `Walk me through the architecture of your most impactful project (${resume.projects?.[0]?.title || "recent platform"}). What was the hardest technical bottleneck you encountered and how did you resolve it?`,
      intent: "Validate authentic hands-on project leadership and troubleshooting depth.",
      suggestedPoints: ["Clear architecture walkthrough", "Specific bottleneck explanation", "Quantifiable performance outcome"],
      difficulty: "Senior",
    },
    {
      id: "q-4-behavioral",
      category: "behavioral",
      question: "Tell me about a time when you strongly disagreed with a technical or product decision made by a team lead. How did you handle the situation?",
      intent: "Assess constructive disagreement, empathy, and commitment to team execution.",
      suggestedPoints: ["Data-driven constructive debate", "Professional communication", "Disagree and commit mindset"],
      difficulty: "Senior",
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
