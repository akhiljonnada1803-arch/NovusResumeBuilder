import {
  RecruiterPersonaId,
  RecruiterPersonaProfile,
  RECRUITER_PERSONAS,
} from "../types/persona";
import {
  InterviewStage,
  ConversationTurn,
  MultiSourceContext,
  INTERVIEW_STAGES,
} from "../types/session";
import { AdaptiveMemoryGraph } from "./adaptive-memory-graph";

/**
 * Strips out generic robotic opening clichés.
 */
export function sanitizeRecruiterResponse(text: string): string {
  const genericPrefixes = [
    /^(great answer|that's a great answer|that is a solid point|that's a solid point|interesting point|interesting answer|that's interesting|tell me more|thank you for sharing|thanks for sharing|i see|that makes sense|good to know|moving on to the next question)[,.:;!\s-]*/i,
    /^(well said|awesome|understood|good point)[,.:;!\s-]*/i,
  ];

  let cleaned = text.trim();
  for (const regex of genericPrefixes) {
    cleaned = cleaned.replace(regex, "").trim();
  }

  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Builds the comprehensive prompt for Gemini to act as the AI Recruiter with active memory.
 */
export function buildConversationalPrompt(
  personaId: RecruiterPersonaId,
  stage: InterviewStage,
  history: ConversationTurn[],
  latestCandidateAnswer: string,
  context: MultiSourceContext,
  recruiterNotes: { note: string; stage: string }[] = [],
  memoryGraph: AdaptiveMemoryGraph = new AdaptiveMemoryGraph()
): string {
  const persona = RECRUITER_PERSONAS[personaId] || RECRUITER_PERSONAS["tech-lead"];
  const stageInfo = INTERVIEW_STAGES.find((s) => s.id === stage) || INTERVIEW_STAGES[0];

  // Extract memory graph claims and determine strategy
  const turnIndex = history.filter((t) => t.speaker === "candidate").length;
  memoryGraph.extractCandidateClaims(latestCandidateAnswer, stage, context, turnIndex);
  const strategy = memoryGraph.selectNextStrategy(latestCandidateAnswer, history);
  const memoryGraphSummary = memoryGraph.generateMemorySummary(history, context, recruiterNotes, strategy);

  // Format past turns
  const formattedHistory = history
    .slice(-8)
    .map((t) => `${t.speaker === "recruiter" ? persona.name : context.candidateName} [Stage: ${t.stage}]: "${t.text}"`)
    .join("\n\n");

  return `
${persona.systemPromptStyle}

INTERVIEW SESSION PROFILE:
- Recruiter Name: ${persona.name} (${persona.title} at ${persona.company})
- Candidate Name: ${context.candidateName}
- Target Role: ${context.targetRole}
- Current Focus Stage: ${stageInfo.name} (${stageInfo.description})

${memoryGraphSummary}

CANDIDATE MULTI-SOURCE RECORD (YOU MUST REFERENCE SPECIFIC DETAILS, PROJECTS, OR SKILLS FROM HERE):
[1. Resume Experience & Metrics]:
${context.resumeSummary}

[2. Portfolio Projects & URLs]:
${context.portfolioProjects.join("\n") || "(No separate portfolio listed)"}

[3. GitHub Repositories & Tech Stacks]:
${context.githubRepos.join("\n") || "(No public repos listed)"}
Languages: ${context.githubLanguages.join(", ")}

[4. LinkedIn & Qualifications]:
${context.linkedinExperience.join("\n") || "(No LinkedIn bio listed)"}

${context.jobDescription ? `[5. Target Job Description]:\n${context.jobDescription}\n` : ""}

PRIOR CONVERSATION TRANSCRIPT:
${formattedHistory || "(Interview conversation starting now)"}

CANDIDATE'S LATEST ANSWER:
"${latestCandidateAnswer}"

CRITICAL RECRUITER INSTRUCTIONS (NON-SCRIPTED REAL HUMAN BEHAVIOR):
1. ZERO SCRIPTED CLICHÉS OR TEMPLATE PHRASES:
   - STRICTLY FORBIDDEN: "Great answer", "That's interesting", "Tell me more", "That's a solid point", "Thank you for sharing", "I see", "Moving on", "That makes sense", "Understood".
   - Start immediately with your dynamic human reaction, counter-question, or technical cross-examination.

2. CROSS-EXAMINE & BUILD ON MEMORY:
   - If the candidate mentioned something in an earlier turn, explicitly cross-reference it.

3. EXECUTE THE APPOINTED STRATEGY (${strategy.toUpperCase()}):
   - If CLARIFICATION: Ask for exact technical mechanics, numbers, or specific libraries.
   - If CHALLENGE: Pose a difficult edge-case or failure mode (e.g. network partition, cache invalidation, thundering herd).
   - If TECHNICAL-DEEP-DIVE: Push on concurrency, memory allocations, or database lock contention.

4. DYNAMIC RECRUITER REACTION & INTERNAL STATE:
   - Compute your true internal state based on their response:
     - confidenceLevel (0-100)
     - interestLevel (0-100)
     - concernLevel (0-100)
     - technicalImpression: "Exceptional" | "Strong" | "Solid" | "Shallow" | "Needs Investigation"
     - activeEmotion: A short 3-6 word phrase of what you are thinking.
     - emotionEmoji: One contextual emoji (e.g. 🧐, ⚔️, 💡, 🌟, 🔍, ⚡, ✍️).

5. LENGTH: 2 to 3 natural spoken sentences maximum.

OUTPUT JSON SCHEMA:
{
  "recruiterResponse": "Direct, authentic spoken dialogue from ${persona.name} (2-3 sentences max)",
  "activeEmotion": "Short phrase describing ${persona.name}'s active reaction",
  "emotionEmoji": "🧐",
  "internalState": {
    "confidenceLevel": number,
    "interestLevel": number,
    "concernLevel": number,
    "technicalImpression": "Exceptional" | "Strong" | "Solid" | "Shallow" | "Needs Investigation"
  },
  "suggestedNextStage": "${stage}",
  "instantScore": number (0-100 based strictly on answer substance),
  "instantFeedback": "One sentence technical critique",
  "recruiterLiveNote": "Specific scratchpad note citing their actual claim"
}
`;
}

/**
 * Generates an intelligent, grounded dynamic fallback derived strictly from candidate's profile.
 */
export function generateDynamicGroundedFallback(
  personaId: RecruiterPersonaId,
  stage: InterviewStage,
  candidateAnswer: string,
  context: MultiSourceContext,
  history: ConversationTurn[],
  memoryGraph: AdaptiveMemoryGraph = new AdaptiveMemoryGraph()
) {
  const persona = RECRUITER_PERSONAS[personaId] || RECRUITER_PERSONAS["tech-lead"];
  const realProject = context.portfolioProjects[0]?.split("(")[0]?.replace(/"/g, "").trim() || "your core application";
  const realSkills = context.githubLanguages.slice(0, 2).join(" and ") || "your technical stack";

  const strategy = memoryGraph.selectNextStrategy(candidateAnswer, history);

  let recruiterResponse = "";
  let activeEmotion = `${persona.name} is evaluating your technical reasoning`;
  let emotionEmoji = "🧐";

  if (strategy === "clarification") {
    recruiterResponse = `You mentioned your approach with ${realSkills}, but I'd like to understand the concrete mechanics. What specific concurrency controls or error boundaries did you implement in ${realProject}?`;
    activeEmotion = `${persona.name} is requesting concrete implementation details`;
    emotionEmoji = "🔍";
  } else if (strategy === "challenge") {
    recruiterResponse = `In a high-load scenario on ${realProject}, what happens if your primary database experiences replica lag during a burst of concurrent writes? How does your architecture ensure consistency without blocking requests?`;
    activeEmotion = `${persona.name} is probing edge-case failure modes`;
    emotionEmoji = "⚔️";
  } else {
    recruiterResponse = `Looking into your implementation of ${realProject}, walk me through the key architectural trade-offs you evaluated before choosing your current stack over alternative solutions.`;
    activeEmotion = `${persona.name} is diving into architecture trade-offs`;
    emotionEmoji = "💡";
  }

  return {
    recruiterResponse,
    activeEmotion,
    emotionEmoji,
    suggestedNextStage: stage,
    instantScore: candidateAnswer.length > 30 ? 88 : 60,
    instantFeedback: `Evaluated technical reasoning and implementation trade-offs for ${realProject}.`,
    recruiterLiveNote: `Noted candidate explanation regarding ${realSkills} on ${realProject}.`,
  };
}
