import { NextRequest, NextResponse } from "next/server";
import { VideoTurn, VideoInterviewTrack, RECRUITER_PERSONAS } from "@/types/video-interview";
import { computeFinalVideoVerdict } from "@/lib/video/video-interview-engine";
import { aggregateSessionBehavioral } from "@/lib/video/behavioral-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      turns = [],
      track = "technical",
      candidateName = "Candidate",
      targetRole = "Senior Software Engineer",
      recordedVideoBlobUrl,
    } = body as {
      turns: VideoTurn[];
      track: VideoInterviewTrack;
      candidateName?: string;
      targetRole?: string;
      recordedVideoBlobUrl?: string;
    };

    const recruiter = RECRUITER_PERSONAS[track] || RECRUITER_PERSONAS.technical;
    const finalVerdict = computeFinalVideoVerdict(turns);
    const aggregateBehavioral = finalVerdict.aggregateBehavioral || aggregateSessionBehavioral(turns.map((t) => t.behavioralScores));

    return NextResponse.json({
      success: true,
      report: {
        id: `vsession_${Date.now()}`,
        candidateName,
        targetRole,
        track,
        recruiter,
        evaluationStatus: finalVerdict.verdict === "Insufficient Data" ? "insufficient-data" : "completed",
        turns,
        overallScore: finalVerdict.overallScore,
        verdict: finalVerdict.verdict,
        aggregateBehavioral,
        evidenceList: finalVerdict.evidenceList,
        recruiterNotes: finalVerdict.recruiterNotes,
        topStrengths: finalVerdict.topStrengths,
        priorityImprovements: finalVerdict.priorityImprovements,
        recordedVideoBlobUrl,
        completedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Video Complete API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to finalize video interview." },
      { status: 500 }
    );
  }
}
