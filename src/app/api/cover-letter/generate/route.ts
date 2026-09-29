import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetterWithAI } from "@/lib/cover-letter/ai-generator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      resume,
      jobDescription,
      targetRole,
      companyName,
      hiringManager,
      archetype = "software-engineer",
      tone = "professional",
    } = body;

    if (!resume) {
      return NextResponse.json({ error: "Candidate resume is required." }, { status: 400 });
    }

    if (!targetRole || !companyName) {
      return NextResponse.json(
        { error: "Target Role and Company Name are required." },
        { status: 400 }
      );
    }

    const content = await generateCoverLetterWithAI({
      resume,
      jobDescription: jobDescription || `${targetRole} position at ${companyName}`,
      targetRole,
      companyName,
      hiringManager,
      archetype,
      tone,
    });

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error("Cover Letter Generate API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate cover letter." },
      { status: 500 }
    );
  }
}
