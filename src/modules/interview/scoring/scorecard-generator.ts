import { IS_VALID_API_KEY, getGeminiModel } from "@/lib/gemini/client";
import { RecruiterPersonaId, RECRUITER_PERSONAS } from "../types/persona";
import { ConversationTurn } from "../types/session";
import { InterviewScorecard } from "../types/scorecard";
import { IntegrityReport } from "../types/integrity";
import { analyzeSpeechTranscript } from "../transcript/speech-analyzer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function generateFinalScorecard(options: {
  userId?: string;
  personaId?: RecruiterPersonaId;
  turns: ConversationTurn[];
  durationMinutes?: number;
  integrityReport?: IntegrityReport | null;
  resume?: any;
  targetRole?: string;
  jobDescription?: string;
}): Promise<InterviewScorecard> {
  const {
    userId,
    personaId = "tech-lead",
    turns = [],
    durationMinutes = 15,
    integrityReport,
    resume,
    targetRole = "Senior Software Engineer",
    jobDescription = "",
  } = options;

  const persona = RECRUITER_PERSONAS[personaId] || RECRUITER_PERSONAS["tech-lead"];
  const candidateName = resume?.personalInfo?.fullName || "Candidate";

  // 1. Filter candidate substantive turns
  const candidateTurns = turns.filter((t) => t.speaker === "candidate" && t.text.trim().length > 0);
  const speechAnalytics = analyzeSpeechTranscript(turns, durationMinutes);

  // 2. THRESHOLD RULE: Minimum 3 substantive responses
  if (candidateTurns.length < 3 || speechAnalytics.totalWords < 25) {
    return {
      id: `scorecard_${Date.now()}`,
      candidateName,
      targetRole,
      persona,
      totalTurns: turns.length,
      durationMinutes,
      evaluationStatus: "insufficient-data",
      candidateResponseCount: candidateTurns.length,
      turns,
      scores: {
        communication: 0,
        technicalKnowledge: 0,
        technicalDepth: 0,
        problemSolving: 0,
        confidence: 0,
        clarity: 0,
        leadership: 0,
        behavioralFit: 0,
        roleMatch: 0,
        overall: 0,
      },
      evidenceList: [],
      speechAnalytics,
      missedOpportunities: [
        "Interview was concluded before candidate provided sufficient responses (minimum 3 required).",
        "No technical or architectural explanations recorded to evaluate.",
      ],
      exampleAnswerImprovements: [],
      integrityReport: integrityReport || undefined,
      verdict: "Insufficient Data",
      executiveSummary: `Evaluation suspended: Candidate completed only ${candidateTurns.length} response(s) (${speechAnalytics.totalWords} total words). Under evidence-based evaluation rules, a minimum of 3 substantive responses is required to score competencies or generate hiring recommendations.`,
      keyStrengths: [],
      growthAreas: [
        "Complete at least 3 conversational turns during the mock interview to generate actionable technical and behavioral feedback.",
      ],
      recruiterClosingNote: `No hiring verdict rendered. Session contained insufficient conversational data for ${persona.name} to assess technical depth, communication, or role match.`,
      completedAt: new Date().toISOString(),
    };
  }

  // 3. Format full interview transcript
  const formattedTranscript = turns
    .map((t, idx) => `[Turn ${idx + 1} - ${t.speaker.toUpperCase()} - Stage: ${t.stage}]: "${t.text}"`)
    .join("\n\n");

  let dynamicAnalysis: any = null;

  if (IS_VALID_API_KEY) {
    try {
      const model = getGeminiModel(0.2);

      const prompt = `
You are ${persona.name}, ${persona.title} at ${persona.company}.
You just conducted a live technical video interview with ${candidateName} for the position of "${targetRole}".

CRITICAL EVIDENCE-BASED EVALUATION RULES:
1. NEVER generate positive scores or praise without direct evidence from the transcript.
2. EVERY STRENGTH MUST CITE an exact quote or claim from the candidate's transcript.
3. EVERY GROWTH AREA MUST CITE an exact quote or technical omission from the candidate.
4. FOR EVERY COMPETENCY CATEGORY, YOU MUST PROVIDE:
   - score (0-100 derived purely from candidate answers)
   - reason (detailed analytical justification)
   - supportingTranscript (exact verbatim quote or turn reference from candidate that proves this score)
5. Calculate "overall" as a weighted aggregate: Technical Knowledge (30%), Problem Solving (20%), Communication (15%), Confidence (10%), Clarity (10%), Leadership (7.5%), Behavioral Fit (7.5%).
6. If the candidate gave weak, brief, or evasive answers, assign realistic low/medium scores (e.g. 40-65).

=== FULL INTERVIEW TRANSCRIPT (${candidateTurns.length} candidate answers, ${speechAnalytics.totalWords} words) ===
${formattedTranscript}

=== CANDIDATE SPEECH SIGNALS ===
- Speaking Pace: ${speechAnalytics.speakingPaceWpm} WPM
- Total Spoken Words: ${speechAnalytics.totalWords}
- Filler Words Count: ${speechAnalytics.fillerWordsCount} (${Object.entries(speechAnalytics.fillerWordsBreakdown).map(([k, v]) => `${k}:${v}`).join(", ") || "none"})
- Hesitation Index: ${speechAnalytics.hesitationScore}%

Return valid JSON adhering strictly to this schema:
{
  "scores": {
    "communication": number (0-100),
    "technicalKnowledge": number (0-100),
    "problemSolving": number (0-100),
    "confidence": number (0-100),
    "clarity": number (0-100),
    "leadership": number (0-100),
    "behavioralFit": number (0-100),
    "roleMatch": number (0-100),
    "overall": number (0-100)
  },
  "evidenceList": [
    {
      "category": "Technical Knowledge",
      "score": number,
      "reason": "Analytical reason citing their specific architectural claims",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Communication",
      "score": number,
      "reason": "Analysis of structure, conciseness, and articulation",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Problem Solving",
      "score": number,
      "reason": "Analysis of first-principles reasoning and trade-offs",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Confidence",
      "score": number,
      "reason": "Analysis of conviction and vocal delivery",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Clarity",
      "score": number,
      "reason": "STAR structure analysis",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Leadership",
      "score": number,
      "reason": "Ownership and cross-functional leadership analysis",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Behavioral Fit",
      "score": number,
      "reason": "Culture and team dynamics analysis",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    },
    {
      "category": "Role Match",
      "score": number,
      "reason": "Suitability for ${targetRole}",
      "supportingTranscript": "Exact quote from candidate",
      "question": "Question asked by recruiter"
    }
  ],
  "verdict": "Strong Hire" | "Hire" | "Leaning Hire" | "Needs Improvement",
  "executiveSummary": "Concise 3-4 sentence evidence-based summary citing candidate's actual statements",
  "keyStrengths": [
    "Strength 1 citing exact candidate statement",
    "Strength 2 citing exact candidate statement"
  ],
  "growthAreas": [
    "Growth area 1 citing exact candidate statement or omission",
    "Growth area 2 citing exact candidate statement or omission"
  ],
  "missedOpportunities": [
    "Specific technical or architectural concept omitted in candidate explanations"
  ],
  "exampleAnswerImprovements": [
    {
      "question": "Exact question asked",
      "candidateAnswerExcerpt": "Exact excerpt of candidate's answer",
      "critique": "Actionable constructive critique",
      "suggestedHighImpactAnswer": "High-impact STAR format rewrite"
    }
  ],
  "recruiterClosingNote": "Specific closing recommendation from ${persona.name} based on evidence"
}
`;

      const result = await model.generateContent(prompt);
      dynamicAnalysis = JSON.parse(result.response.text());
    } catch (err) {
      console.error("Gemini scorecard generation error:", err);
    }
  }

  // 4. Fallback if Gemini unavailable
  if (!dynamicAnalysis || !dynamicAnalysis.scores) {
    return {
      id: `scorecard_${Date.now()}`,
      candidateName,
      targetRole,
      persona,
      totalTurns: turns.length,
      durationMinutes,
      evaluationStatus: "ai-unavailable",
      candidateResponseCount: candidateTurns.length,
      turns,
      scores: {
        communication: 0,
        technicalKnowledge: 0,
        problemSolving: 0,
        confidence: 0,
        clarity: 0,
        leadership: 0,
        behavioralFit: 0,
        roleMatch: 0,
        overall: 0,
      },
      evidenceList: [],
      speechAnalytics,
      missedOpportunities: [],
      exampleAnswerImprovements: [],
      integrityReport: integrityReport || undefined,
      verdict: "Evaluation Unavailable",
      executiveSummary: "AI evaluation service could not be reached to generate evidence-backed analysis. To maintain strict reporting integrity, no placeholder or fabricated scores have been generated.",
      keyStrengths: [],
      growthAreas: ["Please check your connection or Google Gemini API key configuration in settings and retry."],
      recruiterClosingNote: "AI evaluation unavailable.",
      completedAt: new Date().toISOString(),
    };
  }

  // 5. Final Scorecard
  const finalScorecard: InterviewScorecard = {
    id: `scorecard_${Date.now()}`,
    candidateName,
    targetRole,
    persona,
    totalTurns: turns.length,
    durationMinutes,
    evaluationStatus: "completed",
    candidateResponseCount: candidateTurns.length,
    turns,
    scores: {
      communication: dynamicAnalysis.scores.communication || 0,
      technicalKnowledge: dynamicAnalysis.scores.technicalKnowledge || 0,
      problemSolving: dynamicAnalysis.scores.problemSolving || 0,
      confidence: dynamicAnalysis.scores.confidence || 0,
      clarity: dynamicAnalysis.scores.clarity || 0,
      leadership: dynamicAnalysis.scores.leadership || 0,
      behavioralFit: dynamicAnalysis.scores.behavioralFit || 0,
      roleMatch: dynamicAnalysis.scores.roleMatch || 0,
      overall: dynamicAnalysis.scores.overall || 0,
    },
    evidenceList: dynamicAnalysis.evidenceList || [],
    speechAnalytics,
    missedOpportunities: dynamicAnalysis.missedOpportunities || [],
    exampleAnswerImprovements: dynamicAnalysis.exampleAnswerImprovements || [],
    integrityReport: integrityReport || undefined,
    verdict: dynamicAnalysis.verdict || "Needs Improvement",
    executiveSummary: dynamicAnalysis.executiveSummary,
    keyStrengths: dynamicAnalysis.keyStrengths || [],
    growthAreas: dynamicAnalysis.growthAreas || [],
    recruiterClosingNote: dynamicAnalysis.recruiterClosingNote,
    completedAt: new Date().toISOString(),
  };

  // 6. Persist to Supabase if configured
  if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
      await supabase.from("interview_scorecards").insert({
        id: finalScorecard.id,
        user_id: userId || null,
        candidate_name: finalScorecard.candidateName,
        target_role: finalScorecard.targetRole,
        persona_id: personaId,
        overall_score: finalScorecard.scores.overall,
        scores_json: finalScorecard.scores,
        speech_analytics: finalScorecard.speechAnalytics,
        verdict: finalScorecard.verdict,
        transcript_json: finalScorecard.turns,
        evidence_json: finalScorecard.evidenceList,
        full_scorecard: finalScorecard,
        created_at: new Date().toISOString(),
      });
    } catch (dbErr) {
      console.warn("Supabase interview persistence notice:", dbErr);
    }
  }

  return finalScorecard;
}
