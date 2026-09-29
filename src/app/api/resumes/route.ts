import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { DEFAULT_DESIGN } from "@/lib/constants";

// GET /api/resumes - List all resumes for current authenticated user
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: resumes, error } = await supabase
      .from("resumes")
      .select(`
        id,
        user_id,
        title,
        slug,
        target_role,
        ats_score,
        personal_info,
        design,
        is_published,
        created_at,
        updated_at
      `)
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ resumes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST /api/resumes - Create a new resume
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || "My New Resume";
    const template = body.template || "modern";
    const targetRole = body.targetRole || "";

    const { data: newResume, error } = await supabase
      .from("resumes")
      .insert({
        user_id: user.id,
        title,
        target_role: targetRole,
        design: {
          ...DEFAULT_DESIGN,
          template,
        },
        personal_info: body.personalInfo || {
          fullName: user.user_metadata?.full_name || "",
          jobTitle: targetRole,
          email: user.email || "",
          phone: "",
          location: "",
          website: "",
          linkedin: "",
          github: "",
          summary: "",
        },
        ats_score: 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Save initial version snapshot
    await supabase.from("resume_history").insert({
      resume_id: newResume.id,
      version_number: 1,
      change_summary: "Initial resume created",
      snapshot_data: newResume,
    });

    return NextResponse.json({ resume: newResume }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
