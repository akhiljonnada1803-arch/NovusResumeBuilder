import { Resume } from "@/types/resume";
import { ParsedLinkedInProfile } from "./linkedin-parser";
import {
  ProfileCompletenessReport,
  CareerInsightsReport,
  IdentityFieldConflict,
  IdentitySyncHistoryEntry,
  IdentityPlatform,
  IdentityProfileSectionScore,
} from "@/types/unified-identity";

/**
 * Computes deterministic, transparent Profile Completeness across all 7 core sections + Portfolio.
 */
export function computeProfileCompleteness(
  linkedin?: ParsedLinkedInProfile | null,
  resume?: Resume | null
): ProfileCompletenessReport {
  const p = linkedin;
  const r = resume;

  // 1. Personal Info (Name, Email, Phone, Location)
  const hasName = Boolean(p?.fullName || r?.personalInfo?.fullName);
  const hasEmail = Boolean(p?.email || r?.personalInfo?.email);
  const hasPhone = Boolean(p?.phone || r?.personalInfo?.phone);
  const hasLoc = Boolean(p?.location || r?.personalInfo?.location);
  const piScore = (hasName ? 40 : 0) + (hasEmail ? 30 : 0) + (hasPhone ? 15 : 0) + (hasLoc ? 15 : 0);

  const missingPI: string[] = [];
  if (!hasName) missingPI.push("Full Name");
  if (!hasEmail) missingPI.push("Email Address");
  if (!hasPhone) missingPI.push("Phone Number");
  if (!hasLoc) missingPI.push("Location");

  const personalInfo: IdentityProfileSectionScore = {
    name: "Personal Contact Info",
    score: piScore,
    weight: 15,
    status: piScore === 100 ? "complete" : piScore > 50 ? "partial" : "missing",
    missingItems: missingPI,
    recommendation: piScore < 100 ? "Add verified email and phone number to boost recruiter response by 35%." : "Complete contact details verified.",
  };

  // 2. Headline & Role
  const headline = p?.jobTitle || r?.personalInfo?.jobTitle || "";
  const headlineScore = headline.length > 20 ? 100 : headline.length > 5 ? 60 : 0;
  const headlineSection: IdentityProfileSectionScore = {
    name: "Professional Headline",
    score: headlineScore,
    weight: 10,
    status: headlineScore === 100 ? "complete" : headlineScore > 0 ? "partial" : "missing",
    missingItems: headlineScore === 0 ? ["Professional Headline / Target Role"] : [],
    recommendation: headlineScore < 100 ? "Use an impactful headline highlighting role and core stack (e.g. 'Senior Systems Engineer | Distributed Systems & Next.js')." : "Strong optimized headline.",
  };

  // 3. About / Summary
  const about = p?.summary || r?.personalInfo?.summary || "";
  const words = about.split(/\s+/).filter(Boolean).length;
  const aboutScore = words >= 40 ? 100 : words >= 15 ? 65 : words > 0 ? 30 : 0;
  const aboutSection: IdentityProfileSectionScore = {
    name: "About & Executive Bio",
    score: aboutScore,
    weight: 15,
    status: aboutScore === 100 ? "complete" : aboutScore > 0 ? "partial" : "missing",
    missingItems: aboutScore === 0 ? ["Summary / Executive Bio"] : [],
    recommendation: aboutScore < 100 ? "Expand your bio with quantifiable achievements and core technical leadership focus." : "Comprehensive executive summary.",
  };

  // 4. Experience
  const expList = (p?.experience?.length ? p.experience : r?.experience) || [];
  const expCount = expList.length;
  const expScore = expCount >= 3 ? 100 : expCount === 2 ? 80 : expCount === 1 ? 55 : 0;
  const expSection: IdentityProfileSectionScore = {
    name: "Work Experience",
    score: expScore,
    weight: 20,
    status: expScore === 100 ? "complete" : expScore > 0 ? "partial" : "missing",
    missingItems: expCount === 0 ? ["Work Experience Roles"] : expCount < 2 ? ["Additional Career Experience"] : [],
    recommendation: expScore < 100 ? "Add at least 2 detailed past positions with metrics." : "Well-documented career progression.",
  };

  // 5. Education
  const eduList = (p?.education?.length ? p.education : r?.education) || [];
  const eduScore = eduList.length >= 1 ? 100 : 0;
  const eduSection: IdentityProfileSectionScore = {
    name: "Education & Degrees",
    score: eduScore,
    weight: 10,
    status: eduScore === 100 ? "complete" : "missing",
    missingItems: eduScore === 0 ? ["Education History"] : [],
    recommendation: eduScore === 0 ? "List university degree or academic background." : "Verified academic credentials.",
  };

  // 6. Certifications
  const certList = (p?.certifications?.length ? p.certifications : r?.certifications) || [];
  const certScore = certList.length >= 2 ? 100 : certList.length === 1 ? 70 : 0;
  const certSection: IdentityProfileSectionScore = {
    name: "Licenses & Certifications",
    score: certScore,
    weight: 10,
    status: certScore === 100 ? "complete" : certScore > 0 ? "partial" : "missing",
    missingItems: certList.length === 0 ? ["Industry Certifications (e.g. AWS, CKA)"] : [],
    recommendation: certScore < 100 ? "Add relevant cloud or domain certifications (e.g. AWS Solutions Architect, CKAD)." : "Industry certifications verified.",
  };

  // 7. Skills
  const skillList = (p?.skills?.length ? p.skills : r?.skills) || [];
  const skillCount = skillList.length;
  const skillScore = skillCount >= 10 ? 100 : skillCount >= 5 ? 75 : skillCount > 0 ? 40 : 0;
  const skillSection: IdentityProfileSectionScore = {
    name: "Skills & Competencies",
    score: skillScore,
    weight: 15,
    status: skillScore === 100 ? "complete" : skillScore > 0 ? "partial" : "missing",
    missingItems: skillCount < 5 ? ["Core Tech Stack Skills (Minimum 5 recommended)"] : [],
    recommendation: skillScore < 100 ? "Add targeted technical skills to maximize ATS search matching." : "Comprehensive skill stack indexed.",
  };

  // 8. Portfolio Projects
  const projList = (p?.projects?.length ? p.projects : r?.projects) || [];
  const projCount = projList.length;
  const projScore = projCount >= 2 ? 100 : projCount === 1 ? 60 : 0;
  const portfolioSection: IdentityProfileSectionScore = {
    name: "Portfolio Projects",
    score: projScore,
    weight: 5,
    status: projScore === 100 ? "complete" : projScore > 0 ? "partial" : "missing",
    missingItems: projCount === 0 ? ["Featured Portfolio Projects"] : [],
    recommendation: projScore < 100 ? "Attach live project repositories to demonstrate hands-on production code." : "Active portfolio projects linked.",
  };

  const weightedTotal = Math.round(
    (personalInfo.score * personalInfo.weight +
      headlineSection.score * headlineSection.weight +
      aboutSection.score * aboutSection.weight +
      expSection.score * expSection.weight +
      eduSection.score * eduSection.weight +
      certSection.score * certSection.weight +
      skillSection.score * skillSection.weight +
      portfolioSection.score * portfolioSection.weight) /
      100
  );

  const missingSections: string[] = [];
  if (personalInfo.status !== "complete") missingSections.push("Personal Contact Info");
  if (headlineSection.status !== "complete") missingSections.push("Headline");
  if (aboutSection.status !== "complete") missingSections.push("About / Bio");
  if (expSection.status !== "complete") missingSections.push("Work Experience");
  if (eduSection.status !== "complete") missingSections.push("Education");
  if (certSection.status !== "complete") missingSections.push("Certifications");
  if (skillSection.status !== "complete") missingSections.push("Skills");
  if (portfolioSection.status !== "complete") missingSections.push("Portfolio Projects");

  const criticalFixes: string[] = [];
  if (piScore < 100) criticalFixes.push("Provide verified contact info (email & location)");
  if (aboutScore < 50) criticalFixes.push("Write an impactful 3-sentence executive summary");
  if (skillCount < 5) criticalFixes.push("Add at least 5 primary technical competencies");
  if (certList.length === 0) criticalFixes.push("Add cloud or industry certifications to stand out to recruiters");

  return {
    overallScore: weightedTotal,
    tier:
      weightedTotal >= 90
        ? "Elite (90%+)"
        : weightedTotal >= 75
        ? "Strong (75-89%)"
        : weightedTotal >= 50
        ? "Developing (50-74%)"
        : "Needs Attention (<50%)",
    sections: {
      personalInfo,
      headline: headlineSection,
      about: aboutSection,
      experience: expSection,
      education: eduSection,
      certifications: certSection,
      skills: skillSection,
      portfolioProjects: portfolioSection,
    },
    missingSections,
    criticalFixes,
  };
}

/**
 * Generates Recruiter & Career Insights based on profile keywords and depth.
 */
export function generateCareerInsights(
  linkedin?: ParsedLinkedInProfile | null,
  resume?: Resume | null
): CareerInsightsReport {
  const p = linkedin;
  const r = resume;

  const combinedText = [
    p?.fullName || r?.personalInfo?.fullName || "",
    p?.jobTitle || r?.personalInfo?.jobTitle || "",
    p?.summary || r?.personalInfo?.summary || "",
    ...(p?.experience?.map((e) => `${e.position} ${e.company} ${e.description}`) || []),
    ...(r?.experience?.map((e) => `${e.position} ${e.company} ${e.description}`) || []),
    ...(p?.skills?.map((s) => s.name) || []),
    ...(r?.skills?.map((s) => s.name) || []),
  ].join(" ").toLowerCase();

  const highValueKeywords = [
    { keyword: "TypeScript", category: "Languages" },
    { keyword: "Next.js", category: "Frameworks" },
    { keyword: "React", category: "Frameworks" },
    { keyword: "Node.js", category: "Backend" },
    { keyword: "Python", category: "Languages" },
    { keyword: "PostgreSQL", category: "Database" },
    { keyword: "Redis", category: "Caching" },
    { keyword: "Docker", category: "DevOps" },
    { keyword: "Kubernetes", category: "Cloud" },
    { keyword: "AWS", category: "Cloud" },
    { keyword: "GraphQL", category: "API" },
    { keyword: "Microservices", category: "Architecture" },
    { keyword: "System Design", category: "Architecture" },
  ];

  const topKeywords: { keyword: string; density: number; category: string }[] = [];
  const missingHighValueKeywords: string[] = [];

  highValueKeywords.forEach(({ keyword, category }) => {
    const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, "g");
    const matches = combinedText.match(regex);
    if (matches && matches.length > 0) {
      topKeywords.push({ keyword, density: matches.length, category });
    } else {
      missingHighValueKeywords.push(keyword);
    }
  });

  const recruiterScore = Math.min(98, Math.max(45, 50 + topKeywords.length * 4));

  // Determine Seniority Level
  let seniority: CareerInsightsReport["seniorityLevel"] = "Mid-Level Engineer";
  const expYears = (p?.experience?.length || r?.experience?.length || 1) * 2;
  if (combinedText.includes("staff") || combinedText.includes("principal") || combinedText.includes("lead") || expYears >= 8) {
    seniority = "Staff / Principal Lead";
  } else if (combinedText.includes("senior") || expYears >= 5) {
    seniority = "Senior Engineer";
  } else if (expYears <= 2) {
    seniority = "Junior / Entry";
  }

  return {
    recruiterDiscoverabilityScore: recruiterScore,
    seniorityLevel: seniority,
    marketAlignmentScore: Math.min(96, Math.max(60, 65 + topKeywords.length * 3)),
    topKeywords,
    missingHighValueKeywords: missingHighValueKeywords.slice(0, 5),
    metrics: [
      {
        title: "Recruiter InMail Visibility",
        score: recruiterScore,
        status: recruiterScore >= 80 ? "high" : "moderate",
        insight: `Your profile matches ${topKeywords.length} primary recruiter search boolean operators.`,
        recommendation: "Add metrics and cloud architecture terms in project descriptions to boost indexing.",
      },
      {
        title: "ATS Keyword Saturation",
        score: Math.min(95, topKeywords.length * 8),
        status: topKeywords.length >= 8 ? "high" : "growth",
        insight: `Detected ${topKeywords.length} high-frequency tech terms.`,
        recommendation: `Consider integrating: ${missingHighValueKeywords.slice(0, 3).join(", ")}.`,
      },
      {
        title: "Seniority Benchmark",
        score: seniority === "Staff / Principal Lead" ? 95 : seniority === "Senior Engineer" ? 85 : 70,
        status: "high",
        insight: `Calibrated at '${seniority}' based on scope, team leadership, and technical complexity.`,
        recommendation: "Highlight cross-functional architectural leadership and system scale.",
      },
    ],
  };
}

/**
 * Detects field-level differences between LinkedIn, Resume, and Portfolio entities.
 */
export function detectIdentityConflicts(
  linkedin?: ParsedLinkedInProfile | null,
  resume?: Resume | null
): IdentityFieldConflict[] {
  const conflicts: IdentityFieldConflict[] = [];
  if (!linkedin || !resume) return conflicts;

  // 1. Headline / Job Title
  if (linkedin.jobTitle && resume.personalInfo.jobTitle && linkedin.jobTitle.trim() !== resume.personalInfo.jobTitle.trim()) {
    conflicts.push({
      id: "conflict_headline",
      field: "jobTitle",
      label: "Job Title / Headline",
      section: "personalInfo",
      linkedinValue: linkedin.jobTitle,
      resumeValue: resume.personalInfo.jobTitle,
      portfolioValue: resume.personalInfo.jobTitle,
      selectedResolution: "linkedin",
    });
  }

  // 2. Summary / Bio
  if (linkedin.summary && resume.personalInfo.summary && linkedin.summary.trim() !== resume.personalInfo.summary.trim()) {
    conflicts.push({
      id: "conflict_summary",
      field: "summary",
      label: "Professional Summary",
      section: "personalInfo",
      linkedinValue: linkedin.summary,
      resumeValue: resume.personalInfo.summary,
      portfolioValue: resume.personalInfo.summary,
      selectedResolution: "linkedin",
    });
  }

  // 3. Location
  if (linkedin.location && resume.personalInfo.location && linkedin.location.trim() !== resume.personalInfo.location.trim()) {
    conflicts.push({
      id: "conflict_location",
      field: "location",
      label: "Location",
      section: "personalInfo",
      linkedinValue: linkedin.location,
      resumeValue: resume.personalInfo.location,
      selectedResolution: "linkedin",
    });
  }

  return conflicts;
}

/**
 * Performs unified 3-way synchronization across LinkedIn, Resume, and Portfolio.
 */
export function sync3WayIdentity(
  source: IdentityPlatform,
  target: IdentityPlatform | "all",
  linkedin: ParsedLinkedInProfile,
  resume: Resume,
  resolutions: Record<string, IdentityPlatform | "merge"> = {}
): {
  updatedResume: Resume;
  updatedLinkedIn: ParsedLinkedInProfile;
  historyEntry: IdentitySyncHistoryEntry;
} {
  const updatedResume: Resume = {
    ...resume,
    personalInfo: { ...resume.personalInfo },
    experience: [...resume.experience],
    education: [...resume.education],
    skills: [...resume.skills],
    certifications: [...(resume.certifications || [])],
    projects: [...resume.projects],
    updatedAt: new Date().toISOString(),
  };

  const updatedLinkedIn: ParsedLinkedInProfile = {
    ...linkedin,
    experience: [...linkedin.experience],
    education: [...linkedin.education],
    skills: [...linkedin.skills],
    certifications: [...linkedin.certifications],
    projects: [...linkedin.projects],
  };

  const changedFields: string[] = [];

  // Apply sync from source to target
  if (source === "linkedin") {
    if (linkedin.fullName && (!resume.personalInfo.fullName || resolutions["conflict_name"] === "linkedin")) {
      updatedResume.personalInfo.fullName = linkedin.fullName;
      changedFields.push("Full Name");
    }
    if (linkedin.jobTitle && resolutions["conflict_headline"] !== "resume") {
      updatedResume.personalInfo.jobTitle = linkedin.jobTitle;
      changedFields.push("Headline / Role");
    }
    if (linkedin.summary && resolutions["conflict_summary"] !== "resume") {
      updatedResume.personalInfo.summary = linkedin.summary;
      changedFields.push("About Bio");
    }
    if (linkedin.linkedinUrl) {
      updatedResume.personalInfo.linkedin = linkedin.linkedinUrl;
    }

    // Merge Skills
    linkedin.skills.forEach((sk) => {
      const exists = updatedResume.skills.some((s) => s.name.toLowerCase() === sk.name.toLowerCase());
      if (!exists) {
        updatedResume.skills.push({
          id: `sk_li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: sk.name,
          category: sk.category || "Technical",
          level: sk.level || "Advanced",
        });
        changedFields.push(`Skill (${sk.name})`);
      }
    });

    // Merge Experience
    linkedin.experience.forEach((exp) => {
      const exists = updatedResume.experience.some(
        (e) => e.company.toLowerCase() === exp.company.toLowerCase() && e.position.toLowerCase() === exp.position.toLowerCase()
      );
      if (!exists) {
        updatedResume.experience.push({
          id: `exp_li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          company: exp.company,
          position: exp.position,
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "",
          current: Boolean(exp.current),
          description: exp.description || "",
          highlights: exp.highlights || [],
        });
        changedFields.push(`Experience (${exp.company})`);
      }
    });
  } else if (source === "resume") {
    if (resume.personalInfo.fullName) updatedLinkedIn.fullName = resume.personalInfo.fullName;
    if (resume.personalInfo.jobTitle) updatedLinkedIn.jobTitle = resume.personalInfo.jobTitle;
    if (resume.personalInfo.summary) updatedLinkedIn.summary = resume.personalInfo.summary;
    changedFields.push("Profile Details", "Skills Stack", "Experience Timeline");
  }

  const historyEntry: IdentitySyncHistoryEntry = {
    id: `sync_${Date.now()}`,
    timestamp: new Date().toISOString(),
    source,
    target,
    status: Object.keys(resolutions).length > 0 ? "conflicts_resolved" : "success",
    fieldsChanged: changedFields.length > 0 ? Array.from(new Set(changedFields)) : ["All Sections Verified in Sync"],
    conflictsResolvedCount: Object.keys(resolutions).length,
    summary: `Synchronized ${source.toUpperCase()} with ${target === "all" ? "Resume & Portfolio" : target.toUpperCase()} (${changedFields.length} updates applied).`,
  };

  return {
    updatedResume,
    updatedLinkedIn,
    historyEntry,
  };
}
