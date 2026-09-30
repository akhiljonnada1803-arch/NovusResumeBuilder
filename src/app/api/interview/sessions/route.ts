import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

/** POST /api/interview/sessions — create a new session */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      interviewType?: string;
      targetRole?: string;
      totalTurns?: number;
    };

    const id = crypto.randomUUID();

    const { error } = await supabase.from("interview_sessions").insert({
      id,
      user_id: user.id,
      persona_id: body.interviewType ?? "technical",
      target_role: body.targetRole ?? "Software Engineer",
      status: "active",
    });

    if (error) {
      logger.error("interview_session_create_error", { error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    logger.error("interview_session_create_unexpected", { err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** GET /api/interview/sessions — list user's sessions newest first */
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("interview_sessions")
      .select(
        "id, persona_id, target_role, status, scorecard, duration_minutes, started_at, completed_at, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Reshape to match client-side InterviewSessionRow type
    const sessions = (data ?? []).map((row) => ({
      id: row.id,
      user_id: user.id,
      interview_type: row.persona_id,
      target_role: row.target_role,
      total_turns: 0,
      overall_score: row.scorecard
        ? (row.scorecard as { overallScore?: number }).overallScore ?? null
        : null,
      completed_at: row.completed_at,
      created_at: row.created_at,
    }));

    return NextResponse.json({ sessions });
  } catch (err) {
    logger.error("interview_session_list_unexpected", { err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
