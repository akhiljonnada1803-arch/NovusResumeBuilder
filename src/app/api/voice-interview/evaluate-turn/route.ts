import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { VoiceTurnEvaluation, VoiceInterviewType } from "@/types/voice-interview";
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
      interviewType = "technical",
      question,
      answer,
      turnNumber = 1,
      totalTurns = 4,
      resume,
      targetRole = "Senior Software Engineer",
    } = body as {
      interviewType: VoiceInterviewType;
      question: string;
      answer: string;
      turnNumber: number;
      totalTurns: number;
      resume?: any;
      targetRole?: string;
    };

    const cleanAnswer = (answer || "").trim();
    const words = cleanAnswer.split(/\s+/).filter(Boolean);

    // 1. THRESHOLD RULE: If spoken answer is too short (< 6 words) or empty, return Insufficient Data
    if (words.length < 6) {
      return NextResponse.json({
        success: true,
        evaluation: {
          evaluationStatus: "insufficient-data",
          communicationScore: 0,
          confidenceScore: 0,
          clarityScore: 0,
          technicalKnowledgeScore: 0,
          overallScore: 0,
          reason: "Spoken answer contained fewer than 6 words. Insufficient data to extract technical claims or evaluate delivery.",
          supportingTranscript: cleanAnswer || "(No speech detected)",
          feedback: "Insufficient interview data: Please speak your thoughts clearly and elaborate on your technical approach.",
          strengths: [],
          improvements: [
            "Explain your reasoning in detail rather than giving short single-word responses.",
            "Use concrete technical examples from your projects or previous work experience.",
          ],
          modelAnswer: "In production systems, I approach this challenge by first analyzing the access patterns...",
          followUpQuestion:
            turnNumber < totalTurns
              ? "Could you elaborate more on how you would implement this in practice?"
              : undefined,
          evidenceList: [],
        },
      });
    }

    let evaluation: VoiceTurnEvaluation | null = null;

    if (IS_VALID_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
          generationConfig: { temperature: 0.1, responseMimeType: "application/json" },
        });

        const prompt = `
You are a Principal Technical Bar Raiser conducting a live voice interview.
Interview Type: ${interviewType.toUpperCase()}
Target Role: ${targetRole}
Candidate Profile:
${buildCandidateContext(resume)}

INTERVIEW CONVERSATION:
Interviewer Question: "${question}"
Candidate's Spoken Answer: "${cleanAnswer}"
Current Turn: ${turnNumber} of ${totalTurns}

CRITICAL EVIDENCE RULES:
1. Every score MUST be justified with candidate's actual words.
2. DO NOT invent false praise or imaginary strengths.
3. Every evaluation MUST include:
   - reason (specific justification)
   - supportingTranscript (exact quote from candidate)
4. Score accurately (0-100). If answer is weak or hand-wavy, assign 45-65.
5. Dynamic Follow-Up Questioning Strategy:
   - Dynamically analyze the candidate's answer and profile.
   - If vague or lacking metrics -> ask a CLARIFICATION question demanding concrete mechanics.
   - If bold architectural/scalability claims -> ask a CHALLENGE question probing network splits, race conditions, or failovers.
   - If technically solid -> ask a TECHNICAL DEEP DIVE into concurrency locks, memory allocations, or execution plans.
   - NEVER use canned filler like "Great job", "Interesting", or fixed sequences.

Return valid JSON matching this schema:
{
  "communicationScore": number,
  "confidenceScore": number,
  "clarityScore": number,
  "technicalKnowledgeScore": number,
  "overallScore": number,
  "reason": "Detailed justification citing candidate claims",
  "supportingTranscript": "Exact quote from candidate",
  "feedback": "2-3 sentence critique",
  "strengths": ["Strength 1 citing candidate statement"],
  "improvements": ["Improvement 1 citing candidate omission"],
  "modelAnswer": "Exemplar response",
  "followUpQuestion": "Dynamic follow-up question referencing candidate's specific statement or project (empty if last turn)"
}
`;

        const result = await model.generateContent(prompt);
        evaluation = JSON.parse(result.response.text());
        if (evaluation) {
          evaluation.evaluationStatus = "completed";
        }
      } catch (err) {
        console.warn("Gemini turn evaluation fallback:", err);
      }
    }

    // 2. AI Unavailable Fallback (No fake data!)
    if (!evaluation) {
      const firstWord = words.find((w) => w.length > 5) || "approach";
      evaluation = {
        evaluationStatus: "ai-unavailable",
        communicationScore: 0,
        confidenceScore: 0,
        clarityScore: 0,
        technicalKnowledgeScore: 0,
        overallScore: 0,
        reason: "AI evaluation service could not be reached to perform evidence-backed scoring.",
        supportingTranscript: cleanAnswer.slice(0, 100),
        feedback: "Evaluation unavailable: AI analysis service is offline. No fabricated scores generated.",
        strengths: [],
        improvements: ["Check API key configuration to enable live voice turn scoring."],
        modelAnswer: "",
        followUpQuestion:
          turnNumber < totalTurns
            ? `You mentioned your experience with ${firstWord}. What specific architectural trade-offs and failure scenarios did you encounter when scaling that in production?`
            : undefined,
        evidenceList: [],
      };
    }

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    console.error("Voice Turn Evaluation Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate voice turn." },
      { status: 500 }
    );
  }
}
