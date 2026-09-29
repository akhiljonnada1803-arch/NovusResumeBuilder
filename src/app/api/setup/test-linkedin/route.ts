import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string" || url.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Please enter your LinkedIn profile URL." },
        { status: 400 }
      );
    }

    const cleanUrl = url.trim();
    const linkedinRegex = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i;
    const match = cleanUrl.match(linkedinRegex);

    if (!match) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid LinkedIn format. URL must be in format 'https://linkedin.com/in/yourprofile'.",
        },
        { status: 400 }
      );
    }

    const vanityName = match[1];

    return NextResponse.json({
      success: true,
      message: "LinkedIn profile connection validated!",
      profile: {
        vanityName,
        url: cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`,
        verifiedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("LinkedIn Setup Test Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to validate LinkedIn profile." },
      { status: 400 }
    );
  }
}
