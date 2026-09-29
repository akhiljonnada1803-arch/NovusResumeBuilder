import { NextRequest, NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/modules/interview";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resume, targetRole } = body;

    if (!resume) {
      return NextResponse.json({ error: "Candidate resume is required." }, { status: 400 });
    }

    const questions = await generateInterviewQuestions(resume, targetRole);
    return NextResponse.json({ questions });
  } catch (error: any) {
    console.error("Generate Questions API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate interview questions." },
      { status: 500 }
    );
  }
}
