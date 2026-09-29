import { NextRequest, NextResponse } from "next/server";
import { getOpeningQuestion, buildCandidateContext } from "@/lib/voice/interview-engine";
import { VoiceInterviewType } from "@/types/voice-interview";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const { interviewType = "technical", resume, targetRole } = body as {
      interviewType: VoiceInterviewType;
      resume?: any;
      targetRole?: string;
    };

    const candidateName = resume?.personalInfo?.fullName || "Candidate";
    const role = targetRole || resume?.targetRole || "Senior Software Engineer";
    const featuredProject = resume?.projects?.[0]?.title || "Production Cloud Architecture";

    let openingQuestion = getOpeningQuestion(interviewType, candidateName, role, featuredProject);

    // If Gemini key available, customize opening question with real candidate background
    if (IS_VALID_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: { temperature: 0.2 },
        });

        const prompt = `
You are an expert AI Principal Interviewer and Bar Raiser conducting a realistic voice interview.
Interview Type: ${interviewType.toUpperCase()}
Target Role: ${role}
Candidate Profile:
${buildCandidateContext(resume)}

Generate an engaging, natural opening interview question (2-3 sentences max) that warmly welcomes ${candidateName} and presents an authentic, rigorous first question tailored specifically to their background, projects, or the selected interview type.
Do NOT output markdown formatting, bullet points, or quotes. Output ONLY spoken conversational text.
        `.trim();

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        if (text && text.length > 20) {
          openingQuestion = text;
        }
      } catch (e) {
        console.warn("Gemini voice interview start fallback:", e);
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: `voice_session_${Date.now()}`,
      openingQuestion,
      interviewType,
      targetRole: role,
      candidateName,
    });
  } catch (error: any) {
    console.error("Voice Interview Start Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize voice interview." },
      { status: 500 }
    );
  }
}
