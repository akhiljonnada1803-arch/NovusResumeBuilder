import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { calculateATSScore } from "@/lib/mock-data";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/resumes/[id] - Fetch complete resume with all sections
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

    const { data: resume, error: resumeError } = await supabase
      .from("resumes")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (resumeError || !resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Fetch related section items in parallel
    const [
      { data: education },
      { data: experience },
      { data: projects },
      { data: skills },
      { data: certifications },
      { data: achievements },
    ] = await Promise.all([
      supabase.from("education").select("*").eq("resume_id", id).order("order_index", { ascending: true }),
      supabase.from("experience").select("*").eq("resume_id", id).order("order_index", { ascending: true }),
      supabase.from("projects").select("*").eq("resume_id", id).order("order_index", { ascending: true }),
      supabase.from("skills").select("*").eq("resume_id", id).order("order_index", { ascending: true }),
      supabase.from("certifications").select("*").eq("resume_id", id).order("order_index", { ascending: true }),
      supabase.from("achievements").select("*").eq("resume_id", id).order("order_index", { ascending: true }),
    ]);

    const fullResume = {
      ...resume,
      education: education || [],
      experience: experience || [],
      projects: projects || [],
      skills: skills || [],
      certifications: certifications || [],
      achievements: achievements || [],
    };

    return NextResponse.json({ resume: fullResume });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// PUT /api/resumes/[id] - Update full resume data, relational sections & auto-save history
export async function PUT(request: Request, { params }: RouteParams) {
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
    const {
      title,
      targetRole,
      personalInfo,
      design,
      education = [],
      experience = [],
      projects = [],
      skills = [],
      certifications = [],
      achievements = [],
      changeSummary = "Auto-save update",
    } = body;

    // Calculate ATS score from payload
    const computedScore = calculateATSScore({
      id,
      title: title || "Resume",
      personalInfo: personalInfo || {},
      education,
      experience,
      projects,
      skills,
      certifications,
      achievements,
      design: design || {},
      createdAt: "",
      updatedAt: "",
    }).overallScore;

    // 1. Update parent resume record
    const { data: updatedResume, error: updateError } = await supabase
      .from("resumes")
      .update({
        title,
        target_role: targetRole,
        personal_info: personalInfo,
        design,
        ats_score: computedScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 2. Synchronize child tables (Replace / Upsert pattern)
    // Clear and batch re-insert to guarantee accurate ordering and deletions
    await Promise.all([
      supabase.from("education").delete().eq("resume_id", id),
      supabase.from("experience").delete().eq("resume_id", id),
      supabase.from("projects").delete().eq("resume_id", id),
      supabase.from("skills").delete().eq("resume_id", id),
      supabase.from("certifications").delete().eq("resume_id", id),
      supabase.from("achievements").delete().eq("resume_id", id),
    ]);

    // Insert updated child records with order indices
    await Promise.all([
      education.length > 0 &&
        supabase.from("education").insert(
          education.map((item: any, idx: number) => ({
            resume_id: id,
            institution: item.institution,
            degree: item.degree,
            field_of_study: item.fieldOfStudy,
            location: item.location || null,
            start_date: item.startDate,
            end_date: item.endDate || null,
            is_current: item.current || false,
            gpa: item.gpa || null,
            description: item.description || null,
            order_index: idx,
          }))
        ),
      experience.length > 0 &&
        supabase.from("experience").insert(
          experience.map((item: any, idx: number) => ({
            resume_id: id,
            company: item.company,
            position: item.position,
            location: item.location || null,
            start_date: item.startDate,
            end_date: item.endDate || null,
            is_current: item.current || false,
            description: item.description || "",
            highlights: item.highlights || [],
            order_index: idx,
          }))
        ),
      projects.length > 0 &&
        supabase.from("projects").insert(
          projects.map((item: any, idx: number) => ({
            resume_id: id,
            title: item.title,
            subtitle: item.subtitle || null,
            live_url: item.liveUrl || null,
            github_url: item.githubUrl || null,
            start_date: item.startDate || null,
            end_date: item.endDate || null,
            description: item.description || "",
            technologies: item.technologies || [],
            order_index: idx,
          }))
        ),
      skills.length > 0 &&
        supabase.from("skills").insert(
          skills.map((item: any, idx: number) => ({
            resume_id: id,
            name: item.name,
            level: item.level || "Advanced",
            category: item.category || "Technical",
            order_index: idx,
          }))
        ),
      certifications.length > 0 &&
        supabase.from("certifications").insert(
          certifications.map((item: any, idx: number) => ({
            resume_id: id,
            name: item.name,
            issuer: item.issuer,
            issue_date: item.issueDate,
            expiry_date: item.expiryDate || null,
            credential_id: item.credentialId || null,
            credential_url: item.credentialUrl || null,
            order_index: idx,
          }))
        ),
      achievements.length > 0 &&
        supabase.from("achievements").insert(
          achievements.map((item: any, idx: number) => ({
            resume_id: id,
            title: item.title,
            issuer: item.issuer || null,
            date: item.date || null,
            description: item.description || "",
            order_index: idx,
          }))
        ),
    ]);

    // 3. Record Version History snapshot
    const { count } = await supabase
      .from("resume_history")
      .select("*", { count: "exact", head: true })
      .eq("resume_id", id);

    await supabase.from("resume_history").insert({
      resume_id: id,
      version_number: (count || 0) + 1,
      change_summary: changeSummary,
      snapshot_data: body,
    });

    return NextResponse.json({ success: true, resume: updatedResume });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/resumes/[id] - Delete resume and all associated children
export async function DELETE(request: Request, { params }: RouteParams) {
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

    const { error } = await supabase
      .from("resumes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
