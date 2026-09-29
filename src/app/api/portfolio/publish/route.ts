import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeId, templateId = "developer", vercelUrl, vercelProjectId } = body;

    // Fix #6: validate required inputs (resumeId was previously destructured and ignored)
    if (!resumeId || typeof resumeId !== "string") {
      return NextResponse.json({ error: "resumeId is required." }, { status: 400 });
    }

    // NOTE: Persistence is not yet implemented — this is an in-memory stub.
    // To make this durable, write the deployment record to a database here.
    const deployment = {
      id: `dep_${Math.random().toString(36).substring(2, 10)}`,
      resumeId,
      templateId,
      vercelUrl: vercelUrl || null,
      vercelProjectId: vercelProjectId || null,
      status: "Published",
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      status: "Published",
      message: "Portfolio state marked as Published.",
      deployment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to publish portfolio" }, { status: 500 });
  }
}
