import { NextRequest, NextResponse } from "next/server";
import { optimizeResumeForJD, extractJDRequirements } from "@/lib/ats/jd-matcher";
import { Resume } from "@/types/resume";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, jdText, jdRequirements } = body;

    if (!resume) {
      return NextResponse.json({ error: "Candidate resume is required." }, { status: 400 });
    }

    if (!jdText || typeof jdText !== "string") {
      return NextResponse.json({ error: "Job description is required." }, { status: 400 });
    }

    const requirements = jdRequirements || (await extractJDRequirements(jdText));
    const diff = await optimizeResumeForJD(resume as Resume, jdText, requirements);

    return NextResponse.json({ diff });
  } catch (error: any) {
    console.error("ATS Optimize API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to optimize resume for job description." },
      { status: 500 }
    );
  }
}
