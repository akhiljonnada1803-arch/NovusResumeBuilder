import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { resumeId, eventType, path } = body;

    // In production, record telemetry event into Supabase PostgreSQL table
    return NextResponse.json({
      success: true,
      tracked: {
        resumeId,
        eventType,
        path,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to track event" }, { status: 500 });
  }
}
