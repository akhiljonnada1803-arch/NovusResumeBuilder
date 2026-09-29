import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/resumes/[id]/history - List version snapshots
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: history, error } = await supabase
      .from("resume_history")
      .select("id, resume_id, version_number, change_summary, created_at")
      .eq("resume_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ history: history || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/resumes/[id]/history - Restore a specific version snapshot
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { historyId } = body;

    if (!historyId) {
      return NextResponse.json({ error: "historyId is required" }, { status: 400 });
    }

    // 1. Fetch historical snapshot
    const { data: snapshotRecord, error: fetchError } = await supabase
      .from("resume_history")
      .select("*")
      .eq("id", historyId)
      .eq("resume_id", id)
      .single();

    if (fetchError || !snapshotRecord) {
      return NextResponse.json({ error: "Version snapshot not found" }, { status: 404 });
    }

    const snapshot = snapshotRecord.snapshot_data as any;

    // 2. Restore parent resume data
    await supabase
      .from("resumes")
      .update({
        title: snapshot.title,
        target_role: snapshot.targetRole,
        personal_info: snapshot.personalInfo,
        design: snapshot.design,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id);

    // 3. Clear and re-populate child tables with snapshot items
    await Promise.all([
      supabase.from("education").delete().eq("resume_id", id),
      supabase.from("experience").delete().eq("resume_id", id),
      supabase.from("projects").delete().eq("resume_id", id),
      supabase.from("skills").delete().eq("resume_id", id),
      supabase.from("certifications").delete().eq("resume_id", id),
      supabase.from("achievements").delete().eq("resume_id", id),
    ]);

    if (snapshot.education?.length) {
      await supabase.from("education").insert(
        snapshot.education.map((item: any, idx: number) => ({ ...item, resume_id: id, order_index: idx }))
      );
    }
    if (snapshot.experience?.length) {
      await supabase.from("experience").insert(
        snapshot.experience.map((item: any, idx: number) => ({ ...item, resume_id: id, order_index: idx }))
      );
    }
    if (snapshot.projects?.length) {
      await supabase.from("projects").insert(
        snapshot.projects.map((item: any, idx: number) => ({ ...item, resume_id: id, order_index: idx }))
      );
    }
    if (snapshot.skills?.length) {
      await supabase.from("skills").insert(
        snapshot.skills.map((item: any, idx: number) => ({ ...item, resume_id: id, order_index: idx }))
      );
    }
    if (snapshot.certifications?.length) {
      await supabase.from("certifications").insert(
        snapshot.certifications.map((item: any, idx: number) => ({ ...item, resume_id: id, order_index: idx }))
      );
    }
    if (snapshot.achievements?.length) {
      await supabase.from("achievements").insert(
        snapshot.achievements.map((item: any, idx: number) => ({ ...item, resume_id: id, order_index: idx }))
      );
    }

    return NextResponse.json({ success: true, restoredSnapshot: snapshot });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
