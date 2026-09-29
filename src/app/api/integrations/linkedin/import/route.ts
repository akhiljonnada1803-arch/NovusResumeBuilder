import { NextRequest, NextResponse } from "next/server";
import { parseDocumentBuffer } from "@/lib/ats/document-parser";
import { parseLinkedInProfileWithAI, buildResumeFromLinkedIn } from "@/lib/integrations/linkedin/linkedin-parser";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let rawText = "";
    let linkedinUrl: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      linkedinUrl = (formData.get("linkedinUrl") as string) || undefined;

      if (!file) {
        return NextResponse.json({ error: "No LinkedIn file uploaded." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = file.name.toLowerCase();

      let fileType: "pdf" | "docx" | "txt" = "pdf";
      if (fileName.endsWith(".docx")) fileType = "docx";
      else if (fileName.endsWith(".txt")) fileType = "txt";

      rawText = await parseDocumentBuffer(buffer, fileType);
    } else {
      const body = await req.json();
      rawText = body.profileText || "";
      linkedinUrl = body.linkedinUrl;
    }

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Insufficient profile content. Please upload a valid LinkedIn PDF export or paste your full profile text." },
        { status: 400 }
      );
    }

    // 1. Structure profile with AI
    const parsedProfile = await parseLinkedInProfileWithAI(rawText, linkedinUrl);

    // 2. Build complete Resume object
    const generatedResume = buildResumeFromLinkedIn(parsedProfile);

    return NextResponse.json({
      profile: parsedProfile,
      resume: generatedResume,
    });
  } catch (error: any) {
    console.error("LinkedIn Import API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to import LinkedIn profile." },
      { status: 500 }
    );
  }
}
