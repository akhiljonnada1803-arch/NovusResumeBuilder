import { NextRequest, NextResponse } from "next/server";
import { enhanceResumeWithAI } from "@/lib/import/resume-parser";
import { checkRateLimit } from "@/lib/rate-limit";
import { Resume } from "@/types/resume";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { isRateLimited, resetTime } = await checkRateLimit(req, { name: "ai_generation", maxRequests: 20, windowSeconds: 60 });
    if (isRateLimited) {
      return NextResponse.json(
        { error: `Too many AI requests. Please wait ${resetTime}s before trying again.` },
        { status: 429 }
      );
    }

    const userApiKey = req.headers.get("x-gemini-api-key") || "";

    const { resume, originalText = "", apiKey } = (await req.json()) as {
      resume: Resume;
      originalText?: string;
      apiKey?: string;
    };

    if (!resume || !resume.personalInfo) {
      return NextResponse.json({ error: "Invalid resume payload provided" }, { status: 400 });
    }

    const enhancedResume = await enhanceResumeWithAI(resume, originalText, apiKey || userApiKey);

    return NextResponse.json({
      success: true,
      resume: enhancedResume,
      message: "Resume formatting and descriptions enhanced without hallucinating missing data.",
    });
  } catch (err: any) {
    console.error("AI Enhancement endpoint error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to enhance resume descriptions" },
      { status: 500 }
    );
  }
}
