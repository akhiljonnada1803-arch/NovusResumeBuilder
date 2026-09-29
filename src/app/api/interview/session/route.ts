import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, turns, currentStage, personaId, targetRole, jobDescription } =
      await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { error } = await supabase.from("interview_sessions").upsert(
      {
        id: sessionId,
        user_id: user.id,
        persona_id: personaId || "tech-lead",
        target_role: targetRole || "Software Engineer",
        job_description: jobDescription || "",
        turns: turns || [],
        current_stage: currentStage || "intro",
        status: "active",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Session save error:", err);
    return NextResponse.json({ error: err.message || "Save failed" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const personaId = searchParams.get("personaId");

    const query = supabase
      .from("interview_sessions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("started_at", { ascending: false })
      .limit(1);

    if (personaId) query.eq("persona_id", personaId);

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ session: data?.[0] || null });
  } catch (err: any) {
    return NextResponse.json({ session: null, error: err.message }, { status: 500 });
  }
}
