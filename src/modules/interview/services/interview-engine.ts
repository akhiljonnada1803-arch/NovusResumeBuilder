import { IS_VALID_API_KEY, getGeminiModel } from "@/lib/gemini/client";
import { RecruiterPersonaId, RECRUITER_PERSONAS } from "../types/persona";
import {
  InterviewStage,
  ConversationTurn,
} from "../types/session";
import { AdaptiveMemoryGraph } from "./adaptive-memory-graph";
import { buildMultiSourceContext } from "./context-aggregator";
import {
  buildConversationalPrompt,
  sanitizeRecruiterResponse,
  generateDynamicGroundedFallback,
} from "./persona-service";
import { generateInterviewQuestions, evaluateCandidateAnswer, calculateInterviewReadiness } from "../scoring/evaluation-engine";
import { generateFinalScorecard } from "../scoring/scorecard-generator";

export interface ProcessTurnInput {
  personaId?: RecruiterPersonaId;
  stage?: InterviewStage;
  history?: ConversationTurn[];
  candidateAnswer?: string;
  recruiterNotes?: { note: string; stage: string }[];
  resume?: any;
  targetRole?: string;
  jobDescription?: string;
}

export interface ProcessTurnOutput {
  success: boolean;
  recruiterResponse: string;
  activeEmotion: string;
  emotionEmoji: string;
  internalState: {
    confidenceLevel: number;
    interestLevel: number;
    concernLevel: number;
    technicalImpression: "Exceptional" | "Strong" | "Solid" | "Shallow" | "Needs Investigation";
  };
  suggestedNextStage: InterviewStage;
  instantScore: number | null;
  instantFeedback: string;
  recruiterLiveNote: string;
}

// Allowed stage progression order — prevents AI from jumping to "completed" early
const STAGE_ORDER: InterviewStage[] = [
  "intro",
  "resume-walkthrough",
  "project-deep-dive",
  "technical-architecture",
  "behavioral-leadership",
  "candidate-qa",
  "completed",
];

function isValidNextStage(current: InterviewStage, suggested: InterviewStage): boolean {
  const currentIdx = STAGE_ORDER.indexOf(current);
  const suggestedIdx = STAGE_ORDER.indexOf(suggested);
  // Allow staying on current stage or advancing by at most 1 step
  return suggestedIdx >= currentIdx && suggestedIdx <= currentIdx + 1;
}

/**
 * Unified Interview Engine that coordinates multi-source context,
 * memory graph, and live conversational turns.
 * Creates a fresh AdaptiveMemoryGraph per request to avoid cross-user data leakage.
 */
export async function processConversationTurn(
  input: ProcessTurnInput
): Promise<ProcessTurnOutput> {
  const {
    personaId = "tech-lead",
    stage = "intro",
    history = [],
    candidateAnswer = "",
    recruiterNotes = [],
    resume,
    targetRole = "Senior Software Engineer",
    jobDescription = "",
  } = input;

  const persona = RECRUITER_PERSONAS[personaId] || RECRUITER_PERSONAS["tech-lead"];
  const multiSourceContext = buildMultiSourceContext(resume, targetRole, jobDescription);

  // Create a fresh, per-request AdaptiveMemoryGraph and replay all prior candidate
  // turns so memory is consistent without relying on a server-side singleton.
  const memoryGraph = new AdaptiveMemoryGraph();
  const priorCandidateTurns = history.filter((t) => t.speaker === "candidate");
  priorCandidateTurns.forEach((t, idx) => {
    memoryGraph.extractCandidateClaims(t.text, t.stage, multiSourceContext, idx);
  });

  // Initial greeting turn (empty candidate answer)
  if (!candidateAnswer || candidateAnswer.trim().length === 0) {
    const candidateName = multiSourceContext.candidateName;
    const featuredProj = multiSourceContext.portfolioProjects[0]?.split("(")[0]?.replace(/"/g, "").trim();

    const dynamicGreeting = featuredProj
      ? `Hello ${candidateName}, I'm ${persona.name}, ${persona.title} at ${persona.company}. I was looking through your work on ${featuredProj} and wanted to kick off our discussion there. Walk me through the core engineering challenge you solved in that project.`
      : `Hello ${candidateName}, I'm ${persona.name}, ${persona.title} at ${persona.company}. Thanks for taking the time to speak with me today for the ${targetRole} role. To start off, what technical area in your recent work has pushed your engineering boundaries the most?`;

    return {
      success: true,
      recruiterResponse: dynamicGreeting,
      activeEmotion: `${persona.name} is starting the interview session`,
      emotionEmoji: "👋",
      internalState: {
        confidenceLevel: 80,
        interestLevel: 85,
        concernLevel: 10,
        technicalImpression: "Solid",
      },
      suggestedNextStage: "resume-walkthrough",
      instantScore: null,
      instantFeedback: `${persona.name} initiated session tailored to ${candidateName}'s background.`,
      recruiterLiveNote: `Candidate connected with ${persona.name}. Primary evaluation focus: ${persona.scoringFocus.primaryMetric}.`,
    };
  }

  let parsedResult: any = null;

  if (IS_VALID_API_KEY) {
    try {
      const model = getGeminiModel(0.35);
      const prompt = buildConversationalPrompt(
        personaId,
        stage,
        history,
        candidateAnswer,
        multiSourceContext,
        recruiterNotes,
        memoryGraph
      );

      const result = await model.generateContent(prompt);
      parsedResult = JSON.parse(result.response.text());

      if (parsedResult?.recruiterResponse) {
        parsedResult.recruiterResponse = sanitizeRecruiterResponse(parsedResult.recruiterResponse);
      }

      // Guard against AI suggesting an invalid stage jump (e.g. "completed" after turn 2)
      if (
        parsedResult?.suggestedNextStage &&
        !isValidNextStage(stage, parsedResult.suggestedNextStage)
      ) {
        parsedResult.suggestedNextStage = stage;
      }
    } catch (err) {
      console.warn("Gemini chat turn fallback triggered:", err);
    }
  }

  if (!parsedResult || !parsedResult.recruiterResponse) {
    parsedResult = generateDynamicGroundedFallback(
      personaId,
      stage,
      candidateAnswer,
      multiSourceContext,
      history,
      memoryGraph
    );
  }

  const defaultInternalState = {
    confidenceLevel: 82,
    interestLevel: 85,
    concernLevel: 15,
    technicalImpression: "Strong" as const,
  };

  // instantScore: null when not returned — avoids silently inflating the difficulty tier
  const rawScore = parsedResult.instantScore;
  const instantScore =
    typeof rawScore === "number" && rawScore >= 0 && rawScore <= 100
      ? rawScore
      : null;

  return {
    success: true,
    recruiterResponse: parsedResult.recruiterResponse,
    activeEmotion: parsedResult.activeEmotion || `${persona.name} is evaluating your technical reasoning`,
    emotionEmoji: parsedResult.emotionEmoji || "🧐",
    internalState: parsedResult.internalState || defaultInternalState,
    suggestedNextStage: parsedResult.suggestedNextStage || stage,
    instantScore,
    instantFeedback: parsedResult.instantFeedback || `Evaluated candidate response under ${persona.scoringFocus.primaryMetric}.`,
    recruiterLiveNote: parsedResult.recruiterLiveNote || `Noted technical points on ${candidateAnswer.slice(0, 40)}...`,
  };
}

// Re-export core functions for modular consumption
export {
  generateInterviewQuestions,
  evaluateCandidateAnswer,
  calculateInterviewReadiness,
  generateFinalScorecard,
};
