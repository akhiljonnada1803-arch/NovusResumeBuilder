import { NextRequest, NextResponse } from "next/server";
import { getVideoOpeningQuestion } from "@/lib/video/video-interview-engine";
import { VideoInterviewTrack, RECRUITER_PERSONAS } from "@/types/video-interview";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildCandidateContext } from "@/lib/voice/interview-engine";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

const IS_VALID_API_KEY =
  Boolean(GEMINI_API_KEY) &&
  GEMINI_API_KEY.length > 25 &&
  !GEMINI_API_KEY.includes("your-") &&
  !GEMINI_API_KEY.includes("demo") &&
  !GEMINI_API_KEY.includes("placeholder");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { track = "technical", resume, targetRole } = body as {
      track: VideoInterviewTrack;
      resume?: any;
      targetRole?: string;
    };

    const candidateName = resume?.personalInfo?.fullName || "Candidate";
    const role = targetRole || resume?.targetRole || "Senior Software Engineer";
    const recruiter = RECRUITER_PERSONAS[track] || RECRUITER_PERSONAS.technical;

    let openingQuestion = getVideoOpeningQuestion(track, candidateName, role);

    if (IS_VALID_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { temperature: 0.2 },
        });

        const prompt = `
You are ${recruiter.name}, ${recruiter.title} at ${recruiter.company}.
You are conducting a professional video call interview with candidate ${candidateName} for the ${role} position.
Track: ${track.toUpperCase()}
Candidate Background:
${buildCandidateContext(resume)}

Generate an authentic, professional opening greeting and question (2-3 sentences max) to begin the video call. Introduce yourself warmly and ask an insightful first question tailored to the ${track} track and their experience.
Do NOT use bullet points or quotation marks. Output ONLY spoken conversational text.
        `.trim();

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        if (text && text.length > 20) {
          openingQuestion = text;
        }
      } catch (e) {
        console.warn("Gemini video interview start fallback:", e);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: `vcall_${Date.now()}`,
      track,
      targetRole: role,
      candidateName,
      recruiter,
      openingQuestion,
    });
  } catch (error: any) {
    console.error("Video Interview Start Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to start video interview." },
      { status: 500 }
    );
  }
}
