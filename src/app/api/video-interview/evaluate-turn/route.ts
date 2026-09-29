import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VideoInterviewTrack, VideoContentEvaluation } from "@/types/video-interview";
import { analyzeBehavioralPerformance } from "@/lib/video/behavioral-analyzer";
import { buildCandidateContext } from "@/lib/voice/interview-engine";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const IS_VALID_API_KEY =
  Boolean(GEMINI_API_KEY) &&
  GEMINI_API_KEY.length > 20 &&
  !GEMINI_API_KEY.includes("your-") &&
  !GEMINI_API_KEY.includes("demo") &&
  !GEMINI_API_KEY.includes("placeholder");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      track = "technical",
      question,
      answer,
      turnNumber = 1,
      totalTurns = 3,
      durationSeconds = 35,
      resume,
      targetRole = "Senior Software Engineer",
    } = body as {
      track: VideoInterviewTrack;
      question: string;
      answer: string;
      turnNumber: number;
      totalTurns: number;
      durationSeconds?: number;
      resume?: any;
      targetRole?: string;
    };

    const cleanAnswer = (answer || "").trim();
    const words = cleanAnswer.split(/\s+/).filter(Boolean);

    // 1. Analyze Behavioral Metrics
    const behavioralScores = analyzeBehavioralPerformance(cleanAnswer, durationSeconds);

    // 2. THRESHOLD RULE: If spoken answer is too short (< 6 words) or empty
    if (words.length < 6) {
      return NextResponse.json({
        success: true,
        behavioralScores,
        contentEvaluation: {
          evaluationStatus: "insufficient-data",
          score: 0,
          reason: "Spoken answer contained fewer than 6 words. Insufficient content to evaluate competence or delivery.",
          supportingTranscript: cleanAnswer || "(No speech detected)",
          feedback: "Insufficient interview data: Please speak your thoughts clearly and elaborate on your technical approach.",
          strengths: [],
          improvements: [
            "Provide a complete response explaining your approach using the STAR method.",
            "Speak continuously for at least 20-30 seconds to demonstrate communication clarity.",
          ],
          modelAnswer: "In production, I balance architectural scalability with immediate business delivery by using decoupled microservices...",
          followUpQuestion:
            turnNumber < totalTurns
              ? "Could you elaborate more on your implementation details and technical trade-offs?"
              : undefined,
          evidenceList: [],
        },
      });
    }

    // 3. Evaluate Content with Gemini AI
    let contentEvaluation: VideoContentEvaluation | null = null;

    if (IS_VALID_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        });

        const prompt = `
You are an Executive Recruiter and Bar Raiser evaluating a video interview response.
Track: ${track.toUpperCase()}
Target Role: ${targetRole}
Candidate Context:
${buildCandidateContext(resume)}

VIDEO CALL CONTEXT:
Question: "${question}"
Candidate Answer: "${cleanAnswer}"
Turn: ${turnNumber} of ${totalTurns}

CRITICAL EVIDENCE RULES:
1. Every score MUST be justified with candidate's actual words.
2. DO NOT invent false praise or imaginary strengths.
3. Every evaluation MUST include:
   - reason (specific justification)
   - supportingTranscript (exact quote from candidate)
4. Score accurately (0-100). If answer is weak or hand-wavy, assign 45-65.
5. Dynamic Follow-Up Questioning Strategy:
   - Dynamically cross-examine the candidate's answer and profile.
   - If vague or lacking metrics -> ask a CLARIFICATION question demanding concrete mechanics.
   - If bold architectural/scalability claims -> ask a CHALLENGE question probing network splits, race conditions, or failovers.
   - If technically solid -> ask a TECHNICAL DEEP DIVE into concurrency locks, memory allocations, or execution plans.
   - NEVER use canned filler like "Great answer", "Good point", or fixed sequences.

Return ONLY valid JSON matching this schema:
{
  "score": number,
  "reason": "Detailed justification citing candidate claims",
  "supportingTranscript": "Exact quote from candidate",
  "feedback": "2-sentence recruiter critique",
  "strengths": ["Strength 1 citing candidate statement"],
  "improvements": ["Improvement 1 citing candidate omission"],
  "modelAnswer": "Exemplar response",
  "followUpQuestion": "Dynamic follow-up question referencing candidate's specific statement or project (empty if last turn)"
}
`;

        const result = await model.generateContent(prompt);
        contentEvaluation = JSON.parse(result.response.text());
        if (contentEvaluation) {
          contentEvaluation.evaluationStatus = "completed";
        }
      } catch (err) {
        console.warn("Gemini video turn evaluation fallback:", err);
      }
    }

    if (!contentEvaluation) {
      const firstWord = words.find((w) => w.length > 5) || "approach";
      contentEvaluation = {
        evaluationStatus: "ai-unavailable",
        score: 0,
        reason: "AI evaluation service could not be reached to perform evidence-backed scoring.",
        supportingTranscript: cleanAnswer.slice(0, 100),
        feedback: "Evaluation unavailable: AI analysis service is offline. No fabricated scores generated.",
        strengths: [],
        improvements: ["Check API key configuration to enable live video turn scoring."],
        modelAnswer: "",
        followUpQuestion:
          turnNumber < totalTurns
            ? `You touched upon your work with ${firstWord}. Could you elaborate on how you handled high-concurrency bottlenecks and data consistency in that scenario?`
            : undefined,
        evidenceList: [],
      };
    }

    return NextResponse.json({
      success: true,
      behavioralScores,
      contentEvaluation,
    });
  } catch (error: any) {
    console.error("Video Turn Evaluation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate video turn." },
      { status: 500 }
    );
  }
}
