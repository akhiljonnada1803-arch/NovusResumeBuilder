import { NextRequest, NextResponse } from "next/server";
import {
  computeProfileCompleteness,
  generateCareerInsights,
  detectIdentityConflicts,
} from "@/lib/integrations/linkedin/identity-engine";
import { Resume } from "@/types/resume";
import { ParsedLinkedInProfile } from "@/lib/integrations/linkedin/linkedin-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { linkedinProfile, resume } = body as {
      linkedinProfile?: ParsedLinkedInProfile;
      resume?: Resume;
    };

    const completeness = computeProfileCompleteness(linkedinProfile, resume);
    const careerInsights = generateCareerInsights(linkedinProfile, resume);
    const conflicts = detectIdentityConflicts(linkedinProfile, resume);

    return NextResponse.json({
      success: true,
      completeness,
      careerInsights,
      conflicts,
    });
  } catch (error: any) {
    console.error("LinkedIn Insights API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate insights." },
      { status: 500 }
    );
  }
}
