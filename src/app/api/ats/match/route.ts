import { NextRequest, NextResponse } from "next/server";
import { computeATSMatch } from "@/lib/ats/jd-matcher";
import { Resume } from "@/types/resume";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, jdText } = body;

    if (!resume) {
      return NextResponse.json({ error: "Candidate resume is required." }, { status: 400 });
    }

    if (!jdText || typeof jdText !== "string" || jdText.trim().length < 20) {
      return NextResponse.json(
        { error: "A job description with at least 20 characters is required." },
        { status: 400 }
      );
    }

    const matchResult = await computeATSMatch(resume as Resume, jdText.trim());

    return NextResponse.json({ matchResult });
  } catch (error: any) {
    console.error("ATS Match API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate ATS match." },
      { status: 500 }
    );
  }
}
