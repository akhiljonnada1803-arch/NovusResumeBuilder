import { NextRequest, NextResponse } from "next/server";
import { VoiceTurn, VoiceInterviewType } from "@/types/voice-interview";
import { calculateFinalVoiceScores } from "@/lib/voice/interview-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      turns = [],
      interviewType = "technical",
      candidateName = "Candidate",
      targetRole = "Senior Software Engineer",
      durationMinutes = 5,
    } = body as {
      turns: VoiceTurn[];
      interviewType: VoiceInterviewType;
      candidateName?: string;
      targetRole?: string;
      durationMinutes?: number;
    };

    const finalScores = calculateFinalVoiceScores(turns, durationMinutes);

    return NextResponse.json({
      success: true,
      report: {
        id: `vrep_${Date.now()}`,
        interviewType,
        targetRole,
        candidateName,
        totalQuestions: turns.length,
        evaluationStatus: finalScores.verdict === "Insufficient Data" ? "insufficient-data" : "completed",
        turns,
        finalScores: {
          communication: finalScores.communication,
          confidence: finalScores.confidence,
          clarity: finalScores.clarity,
          technicalKnowledge: finalScores.technicalKnowledge,
          overall: finalScores.overall,
        },
        overallVerdict: finalScores.verdict,
        evidenceList: finalScores.evidenceList,
        speechAnalytics: finalScores.speechAnalytics,
        executiveSummary: finalScores.executiveSummary,
        topStrengths: finalScores.topStrengths,
        priorityGrowthAreas: finalScores.priorityGrowthAreas,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Voice Complete API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finalize voice interview." },
      { status: 500 }
    );
  }
}
