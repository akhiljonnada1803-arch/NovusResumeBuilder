import { NextRequest, NextResponse } from "next/server";
import {
  computeProfileCompleteness,
  generateCareerInsights,
  detectIdentityConflicts,
  sync3WayIdentity,
} from "@/lib/integrations/linkedin/identity-engine";
import { IdentityPlatform } from "@/types/unified-identity";
import { Resume } from "@/types/resume";
import { ParsedLinkedInProfile } from "@/lib/integrations/linkedin/linkedin-parser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      source = "linkedin",
      target = "all",
      linkedinProfile,
      resume,
      resolutions = {},
    } = body as {
      source: IdentityPlatform;
      target: IdentityPlatform | "all";
      linkedinProfile?: ParsedLinkedInProfile;
      resume?: Resume;
      resolutions?: Record<string, IdentityPlatform | "merge">;
    };

    if (!linkedinProfile && !resume) {
      return NextResponse.json(
        { error: "Provide at least a LinkedIn profile or active Resume to synchronize." },
        { status: 400 }
      );
    }

    const currentLinkedin: ParsedLinkedInProfile = linkedinProfile || {
      fullName: resume?.personalInfo?.fullName || "Candidate",
      jobTitle: resume?.personalInfo?.jobTitle || "Software Engineer",
      summary: resume?.personalInfo?.summary || "",
      experience: (resume?.experience || []).map((e) => ({
        company: e.company,
        position: e.position,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        current: e.current,
        description: e.description,
        highlights: e.highlights,
      })),
      education: (resume?.education || []).map((ed) => ({
        institution: ed.institution,
        degree: ed.degree,
        fieldOfStudy: ed.fieldOfStudy,
        startDate: ed.startDate,
        endDate: ed.endDate,
        current: ed.current || false,
      })),
      skills: (resume?.skills || []).map((s) => ({
        name: s.name,
        category: s.category,
        level: s.level,
      })),
      certifications: (resume?.certifications || []).map((c) => ({
        name: c.name,
        issuer: c.issuer,
        issueDate: c.issueDate,
        credentialUrl: c.credentialUrl,
      })),
      projects: (resume?.projects || []).map((p) => ({
        title: p.title,
        subtitle: p.subtitle,
        description: p.description,
        technologies: p.technologies,
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
      })),
      languages: [],
    };

    const currentResume: Resume = resume || {
      id: `resume_sync_${Date.now()}`,
      title: `${currentLinkedin.fullName} – Resume`,
      targetRole: currentLinkedin.jobTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalInfo: {
        fullName: currentLinkedin.fullName,
        jobTitle: currentLinkedin.jobTitle,
        email: currentLinkedin.email || "",
        phone: currentLinkedin.phone || "",
        location: currentLinkedin.location || "",
        linkedin: currentLinkedin.linkedinUrl || "",
        summary: currentLinkedin.summary,
      },
      experience: currentLinkedin.experience.map((e, idx) => ({
        id: `exp_${idx}`,
        ...e,
      })),
      education: currentLinkedin.education.map((ed, idx) => ({
        id: `edu_${idx}`,
        ...ed,
      })),
      skills: currentLinkedin.skills.map((s, idx) => ({
        id: `sk_${idx}`,
        ...s,
      })),
      certifications: currentLinkedin.certifications.map((c, idx) => ({
        id: `cert_${idx}`,
        ...c,
      })),
      projects: currentLinkedin.projects.map((p, idx) => ({
        id: `proj_${idx}`,
        ...p,
      })),
      achievements: [],
      languages: [],
      design: {} as any,
    };

    // 1. Detect any active conflicts
    const conflicts = detectIdentityConflicts(currentLinkedin, currentResume);

    // 2. Execute 3-Way Sync
    const syncResult = sync3WayIdentity(source, target, currentLinkedin, currentResume, resolutions);

    // 3. Compute Completeness & Career Insights
    const completeness = computeProfileCompleteness(syncResult.updatedLinkedIn, syncResult.updatedResume);
    const careerInsights = generateCareerInsights(syncResult.updatedLinkedIn, syncResult.updatedResume);

    return NextResponse.json({
      success: true,
      updatedResume: syncResult.updatedResume,
      updatedLinkedIn: syncResult.updatedLinkedIn,
      conflicts,
      historyEntry: syncResult.historyEntry,
      completeness,
      careerInsights,
    });
  } catch (error: any) {
    console.error("LinkedIn 3-Way Sync Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute 3-way synchronization." },
      { status: 500 }
    );
  }
}
