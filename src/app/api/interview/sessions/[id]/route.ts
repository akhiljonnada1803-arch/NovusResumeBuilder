import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** PATCH /api/interview/sessions/[id] — save final scorecard */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      overallScore?: number;
      turns?: Array<{
        turnNumber: number;
        question: string;
        answerTranscript: string;
        starScore?: number;
        clarityScore?: number;
        feedback?: string;
      }>;
    };

    const { error } = await supabase
      .from("interview_sessions")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        scorecard: {
          overallScore: body.overallScore ?? 0,
          turns: body.turns ?? [],
        },
      })
      .eq("id", id)
      .eq("user_id", user.id); // RLS double-check

    if (error) {
      logger.error("interview_session_patch_error", { id, error: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.error("interview_session_patch_unexpected", { err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** GET /api/interview/sessions/[id] — load a specific session */
export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("interview_sessions")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({
      session: {
        id: data.id,
        user_id: user.id,
        interview_type: data.persona_id,
        target_role: data.target_role,
        total_turns: (
          (data.scorecard as { turns?: unknown[] })?.turns ?? []
        ).length,
        overall_score: (data.scorecard as { overallScore?: number })
          ?.overallScore ?? null,
        completed_at: data.completed_at,
        created_at: data.created_at,
      },
      scorecards: (
        (data.scorecard as { turns?: Array<Record<string, unknown>> })?.turns ??
        []
      ).map((t, i) => ({
        id: `${data.id}-turn-${i}`,
        session_id: data.id,
        turn_number: (t.turnNumber as number) ?? i + 1,
        question: (t.question as string) ?? "",
        answer_transcript: (t.answerTranscript as string) ?? "",
        star_score: (t.starScore as number) ?? null,
        clarity_score: (t.clarityScore as number) ?? null,
        feedback: (t.feedback as string) ?? null,
        created_at: data.created_at,
      })),
    });
  } catch (err) {
    logger.error("interview_session_get_unexpected", { err });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
