import { NextRequest, NextResponse } from "next/server";
import { evaluateCandidateAnswer } from "@/modules/interview";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, answer, resume } = body;

    if (!question || !answer) {
      return NextResponse.json(
        { error: "Both question and candidate answer are required." },
        { status: 400 }
      );
    }

    const evaluation = await evaluateCandidateAnswer(question, answer, resume || {});
    return NextResponse.json({ evaluation });
  } catch (error: any) {
    console.error("Evaluate Answer API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to evaluate candidate response." },
      { status: 500 }
    );
  }
}
