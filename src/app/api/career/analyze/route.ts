import { NextRequest, NextResponse } from "next/server";
import { analyzeCareerWithAI } from "@/lib/career/career-engine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, targetRole, githubStats, avgAtsScore } = body;

    if (!resume) {
      return NextResponse.json({ error: "Candidate resume is required." }, { status: 400 });
    }

    const report = await analyzeCareerWithAI({
      resume,
      targetRole,
      githubStats,
      avgAtsScore,
    });

    return NextResponse.json({ report });
  } catch (error: any) {
    console.error("Career Analysis API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze career intelligence." },
      { status: 500 }
    );
  }
}
