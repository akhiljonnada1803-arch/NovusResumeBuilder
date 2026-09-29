import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/resumes/[id]/duplicate - Clone a resume and all its child sections
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

    // 1. Fetch original resume
    const { data: original, error: origError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (origError || !original) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // 2. Fetch original child records
    const [
      { data: education },
      { data: experience },
      { data: projects },
      { data: skills },
      { data: certifications },
      { data: achievements },
    ] = await Promise.all([
      supabase.from("education").select("*").eq("resume_id", id),
      supabase.from("experience").select("*").eq("resume_id", id),
      supabase.from("projects").select("*").eq("resume_id", id),
      supabase.from("skills").select("*").eq("resume_id", id),
      supabase.from("certifications").select("*").eq("resume_id", id),
      supabase.from("achievements").select("*").eq("resume_id", id),
    ]);

    // 3. Create duplicate resume
    const { data: duplicateResume, error: createError } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title: `${original.title} (Copy)`,
        target_role: original.target_role,
        ats_score: original.ats_score,
        personal_info: original.personal_info,
        design: original.design,
      })
      .select()
      .single();

    if (createError || !duplicateResume) {
      return NextResponse.json({ error: createError?.message || "Failed to duplicate" }, { status: 500 });
    }

    const newId = duplicateResume.id;

    // 4. Duplicate child records with new foreign key
    await Promise.all([
      education && education.length > 0 &&
        supabase.from("education").insert(
          education.map(({ id: _, created_at: __, updated_at: ___, ...item }) => ({
            ...item,
            resume_id: newId,
          }))
        ),
      experience && experience.length > 0 &&
        supabase.from("experience").insert(
          experience.map(({ id: _, created_at: __, updated_at: ___, ...item }) => ({
            ...item,
            resume_id: newId,
          }))
        ),
      projects && projects.length > 0 &&
        supabase.from("projects").insert(
          projects.map(({ id: _, created_at: __, updated_at: ___, ...item }) => ({
            ...item,
            resume_id: newId,
          }))
        ),
      skills && skills.length > 0 &&
        supabase.from("skills").insert(
          skills.map(({ id: _, created_at: __, updated_at: ___, ...item }) => ({
            ...item,
            resume_id: newId,
          }))
        ),
      certifications && certifications.length > 0 &&
        supabase.from("certifications").insert(
          certifications.map(({ id: _, created_at: __, updated_at: ___, ...item }) => ({
            ...item,
            resume_id: newId,
          }))
        ),
      achievements && achievements.length > 0 &&
        supabase.from("achievements").insert(
          achievements.map(({ id: _, created_at: __, updated_at: ___, ...item }) => ({
            ...item,
            resume_id: newId,
          }))
        ),
    ]);

    return NextResponse.json({ success: true, duplicateResume }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
