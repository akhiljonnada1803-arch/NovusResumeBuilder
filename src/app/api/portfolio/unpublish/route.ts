import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeId } = body;

    // Fix #6: resumeId was destructured but never validated or included in the response
    if (!resumeId || typeof resumeId !== "string") {
      return NextResponse.json({ error: "resumeId is required." }, { status: 400 });
    }

    // NOTE: Persistence is not yet implemented — this is an in-memory stub.
    // To make this durable, delete or update the deployment record in a database here.
    return NextResponse.json({
      success: true,
      resumeId,
      status: "Unpublished",
      message: "Portfolio has been unpublished.",
      unpublishedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to unpublish portfolio" }, { status: 500 });
  }
}
