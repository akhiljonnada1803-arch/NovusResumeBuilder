import { Resume } from "@/types/resume";
import {
  SyncProfilePayload,
  FieldConflict,
  SyncDirection,
  SyncHistoryEntry,
  SelectiveSyncConfig,
  SyncLogEntry,
} from "@/types/sync";

export const DEFAULT_SELECTIVE_SYNC_CONFIG: SelectiveSyncConfig = {
  skills: true,
  experience: true,
  education: true,
  projects: true,
  certifications: true,
  achievements: true,
  personalInfo: true,
};

/**
 * Extracts normalized profile payload from a Resume entity for sync evaluation.
 */
export function extractSyncPayload(resume: Resume): SyncProfilePayload {
  return {
    personalInfo: resume.personalInfo || {
      fullName: "",
      jobTitle: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    projects: resume.projects || [],
    skills: resume.skills || [],
    experience: resume.experience || [],
    education: resume.education || [],
    certifications: resume.certifications || [],
    achievements: resume.achievements || [],
  };
}

/**
 * Computes a deterministic hash representation of a profile payload respecting selective sync.
 */
export function computeProfileHash(
  payload: SyncProfilePayload,
  selectiveSync: SelectiveSyncConfig = DEFAULT_SELECTIVE_SYNC_CONFIG
): string {
  const normalized: any = {};

  if (selectiveSync.personalInfo) {
    normalized.pi = {
      name: payload.personalInfo.fullName?.trim() || "",
      title: payload.personalInfo.jobTitle?.trim() || "",
      email: payload.personalInfo.email?.trim() || "",
      phone: payload.personalInfo.phone?.trim() || "",
      loc: payload.personalInfo.location?.trim() || "",
      summary: payload.personalInfo.summary?.trim() || "",
      site: payload.personalInfo.website?.trim() || "",
      gh: payload.personalInfo.github?.trim() || "",
      li: payload.personalInfo.linkedin?.trim() || "",
    };
  }

  if (selectiveSync.projects) {
    normalized.projects = (payload.projects || []).map((p) => ({
      t: p.title.trim().toLowerCase(),
      d: p.description.trim(),
      tech: (p.technologies || []).slice().sort(),
      gh: p.githubUrl || "",
      live: p.liveUrl || "",
    }));
  }

  if (selectiveSync.skills) {
    normalized.skills = (payload.skills || []).map((s) => ({
      n: s.name.trim().toLowerCase(),
      l: s.level || "",
      c: s.category || "",
    }));
  }

  if (selectiveSync.experience) {
    normalized.exp = (payload.experience || []).map((e) => ({
      c: e.company.trim().toLowerCase(),
      p: e.position.trim().toLowerCase(),
      d: e.description.trim(),
      s: e.startDate,
      end: e.endDate,
    }));
  }

  if (selectiveSync.education) {
    normalized.edu = (payload.education || []).map((ed) => ({
      i: ed.institution.trim().toLowerCase(),
      d: ed.degree.trim().toLowerCase(),
      s: ed.startDate,
      end: ed.endDate,
    }));
  }

  if (selectiveSync.certifications) {
    normalized.cert = (payload.certifications || []).map((c) => ({
      n: c.name.trim().toLowerCase(),
      iss: c.issuer.trim().toLowerCase(),
      date: c.issueDate,
    }));
  }

  if (selectiveSync.achievements) {
    normalized.ach = (payload.achievements || []).map((a) => ({
      t: a.title.trim().toLowerCase(),
      iss: (a.issuer || "").trim().toLowerCase(),
      d: a.description.trim(),
    }));
  }

  return JSON.stringify(normalized);
}

/**
 * Deep-compares current target payload vs incoming source payload to detect field-level conflicts.
 * Honors user's selective sync preferences.
 */
export function detectProfileConflicts(
  current: SyncProfilePayload,
  incoming: SyncProfilePayload,
  selectiveSync: SelectiveSyncConfig = DEFAULT_SELECTIVE_SYNC_CONFIG
): FieldConflict[] {
  const conflicts: FieldConflict[] = [];

  // 1. Personal Info Fields
  if (selectiveSync.personalInfo) {
    const piKeys: (keyof typeof current.personalInfo)[] = [
      "fullName",
      "jobTitle",
      "summary",
      "email",
      "phone",
      "location",
      "website",
      "github",
      "linkedin",
    ];

    const piLabels: Record<string, string> = {
      fullName: "Full Name",
      jobTitle: "Job Title / Headline",
      summary: "Professional Summary & Bio",
      email: "Email Address",
      phone: "Phone Number",
      location: "Location",
      website: "Website Link",
      github: "GitHub Profile",
      linkedin: "LinkedIn Profile",
    };

    piKeys.forEach((k) => {
      const curVal = current.personalInfo[k] || "";
      const incVal = incoming.personalInfo[k] || "";

      if (curVal !== incVal && (curVal || incVal)) {
        conflicts.push({
          id: `conflict_pi_${k}`,
          fieldPath: `personalInfo.${k}`,
          fieldLabel: piLabels[k] || k,
          section: "personalInfo",
          currentValue: curVal || "(Empty)",
          incomingValue: incVal || "(Empty)",
          selectedChoice: "incoming",
        });
      }
    });
  }

  // 2. Projects Comparison
  if (selectiveSync.projects) {
    const currentProjMap = new Map((current.projects || []).map((p) => [p.title.trim().toLowerCase(), p]));

    incoming.projects.forEach((incP, idx) => {
      const key = incP.title.trim().toLowerCase();
      const curP = currentProjMap.get(key);

      if (curP) {
        if (curP.description.trim() !== incP.description.trim()) {
          conflicts.push({
            id: `conflict_proj_desc_${idx}`,
            fieldPath: `projects[${idx}].description`,
            fieldLabel: `Project "${incP.title}" Description`,
            section: "projects",
            currentValue: curP.description,
            incomingValue: incP.description,
            selectedChoice: "incoming",
          });
        }
        const curTech = (curP.technologies || []).join(", ");
        const incTech = (incP.technologies || []).join(", ");
        if (curTech !== incTech) {
          conflicts.push({
            id: `conflict_proj_tech_${idx}`,
            fieldPath: `projects[${idx}].technologies`,
            fieldLabel: `Project "${incP.title}" Technologies`,
            section: "projects",
            currentValue: curTech || "(None)",
            incomingValue: incTech || "(None)",
            selectedChoice: "incoming",
          });
        }
      } else {
        conflicts.push({
          id: `conflict_proj_new_${idx}`,
          fieldPath: `projects.new[${idx}]`,
          fieldLabel: `New Project: "${incP.title}"`,
          section: "projects",
          currentValue: "(Not in target)",
          incomingValue: `${incP.title} – ${incP.description.slice(0, 80)}...`,
          selectedChoice: "incoming",
        });
      }
    });
  }

  // 3. Skills Comparison
  if (selectiveSync.skills) {
    const currentSkills = (current.skills || []).map((s) => s.name.trim()).join(", ");
    const incomingSkills = (incoming.skills || []).map((s) => s.name.trim()).join(", ");

    if (currentSkills !== incomingSkills && (currentSkills || incomingSkills)) {
      conflicts.push({
        id: "conflict_skills_set",
        fieldPath: "skills",
        fieldLabel: "Skills & Tech Stack Set",
        section: "skills",
        currentValue: currentSkills || "(Empty)",
        incomingValue: incomingSkills || "(Empty)",
        selectedChoice: "incoming",
      });
    }
  }

  // 4. Experience Comparison
  if (selectiveSync.experience) {
    const currentExpMap = new Map(
      (current.experience || []).map((e) => [`${e.company.trim().toLowerCase()}-${e.position.trim().toLowerCase()}`, e])
    );

    incoming.experience.forEach((incE, idx) => {
      const key = `${incE.company.trim().toLowerCase()}-${incE.position.trim().toLowerCase()}`;
      const curE = currentExpMap.get(key);

      if (curE) {
        if (curE.description.trim() !== incE.description.trim()) {
          conflicts.push({
            id: `conflict_exp_desc_${idx}`,
            fieldPath: `experience[${idx}].description`,
            fieldLabel: `${incE.position} @ ${incE.company} Description`,
            section: "experience",
            currentValue: curE.description,
            incomingValue: incE.description,
            selectedChoice: "incoming",
          });
        }
      } else {
        conflicts.push({
          id: `conflict_exp_new_${idx}`,
          fieldPath: `experience.new[${idx}]`,
          fieldLabel: `New Experience: ${incE.position} @ ${incE.company}`,
          section: "experience",
          currentValue: "(Not in target)",
          incomingValue: `${incE.position} @ ${incE.company} (${incE.startDate} - ${incE.endDate || "Present"})`,
          selectedChoice: "incoming",
        });
      }
    });
  }

  // 5. Education Comparison
  if (selectiveSync.education) {
    const currentEduMap = new Map((current.education || []).map((ed) => [ed.institution.trim().toLowerCase(), ed]));

    incoming.education.forEach((incEd, idx) => {
      const key = incEd.institution.trim().toLowerCase();
      const curEd = currentEduMap.get(key);

      if (!curEd) {
        conflicts.push({
          id: `conflict_edu_new_${idx}`,
          fieldPath: `education.new[${idx}]`,
          fieldLabel: `New Education: ${incEd.degree} @ ${incEd.institution}`,
          section: "education",
          currentValue: "(Not in target)",
          incomingValue: `${incEd.degree} in ${incEd.fieldOfStudy} (${incEd.startDate} - ${incEd.endDate})`,
          selectedChoice: "incoming",
        });
      }
    });
  }

  // 6. Certifications Comparison
  if (selectiveSync.certifications) {
    const currentCertMap = new Map((current.certifications || []).map((c) => [c.name.trim().toLowerCase(), c]));

    (incoming.certifications || []).forEach((incC, idx) => {
      const key = incC.name.trim().toLowerCase();
      const curC = currentCertMap.get(key);

      if (!curC) {
        conflicts.push({
          id: `conflict_cert_new_${idx}`,
          fieldPath: `certifications.new[${idx}]`,
          fieldLabel: `New Certification: ${incC.name}`,
          section: "certifications",
          currentValue: "(Not in target)",
          incomingValue: `${incC.name} by ${incC.issuer} (${incC.issueDate})`,
          selectedChoice: "incoming",
        });
      }
    });
  }

  return conflicts;
}

/**
 * Merges current payload and incoming payload based on user's field-level conflict resolutions.
 * Only modifies sections enabled in selectiveSync.
 */
export function applyConflictResolutions(
  current: SyncProfilePayload,
  incoming: SyncProfilePayload,
  resolutions: Record<string, "current" | "incoming">,
  selectiveSync: SelectiveSyncConfig = DEFAULT_SELECTIVE_SYNC_CONFIG
): SyncProfilePayload {
  const merged: SyncProfilePayload = {
    personalInfo: { ...current.personalInfo },
    projects: [...current.projects],
    skills: [...current.skills],
    experience: [...current.experience],
    education: [...current.education],
    certifications: [...(current.certifications || [])],
    achievements: [...(current.achievements || [])],
  };

  // 1. Personal Info
  if (selectiveSync.personalInfo) {
    Object.keys(incoming.personalInfo).forEach((k) => {
      const conflictId = `conflict_pi_${k}`;
      const choice = resolutions[conflictId] ?? "incoming";
      if (choice === "incoming" && (incoming.personalInfo as any)[k] !== undefined) {
        (merged.personalInfo as any)[k] = (incoming.personalInfo as any)[k];
      }
    });
  }

  // 2. Skills
  if (selectiveSync.skills && resolutions["conflict_skills_set"] === "incoming") {
    merged.skills = [...incoming.skills];
  }

  // 3. Projects
  if (selectiveSync.projects) {
    incoming.projects.forEach((incP, idx) => {
      const newConflictId = `conflict_proj_new_${idx}`;
      const descConflictId = `conflict_proj_desc_${idx}`;
      const techConflictId = `conflict_proj_tech_${idx}`;

      if (resolutions[newConflictId] === "incoming") {
        const exists = merged.projects.some((p) => p.title.toLowerCase() === incP.title.toLowerCase());
        if (!exists) {
          merged.projects.push(incP);
        }
      }

      const curPIndex = merged.projects.findIndex((p) => p.title.toLowerCase() === incP.title.toLowerCase());
      if (curPIndex >= 0) {
        if (resolutions[descConflictId] === "incoming") {
          merged.projects[curPIndex].description = incP.description;
        }
        if (resolutions[techConflictId] === "incoming") {
          merged.projects[curPIndex].technologies = incP.technologies;
        }
      }
    });
  }

  // 4. Experience
  if (selectiveSync.experience) {
    incoming.experience.forEach((incE, idx) => {
      const newConflictId = `conflict_exp_new_${idx}`;
      const descConflictId = `conflict_exp_desc_${idx}`;

      if (resolutions[newConflictId] === "incoming") {
        const exists = merged.experience.some(
          (e) => e.company.toLowerCase() === incE.company.toLowerCase() && e.position.toLowerCase() === incE.position.toLowerCase()
        );
        if (!exists) {
          merged.experience.push(incE);
        }
      }

      const curEIndex = merged.experience.findIndex(
        (e) => e.company.toLowerCase() === incE.company.toLowerCase() && e.position.toLowerCase() === incE.position.toLowerCase()
      );
      if (curEIndex >= 0 && resolutions[descConflictId] === "incoming") {
        merged.experience[curEIndex].description = incE.description;
      }
    });
  }

  // 5. Education
  if (selectiveSync.education) {
    incoming.education.forEach((incEd, idx) => {
      const newConflictId = `conflict_edu_new_${idx}`;
      if (resolutions[newConflictId] === "incoming") {
        const exists = merged.education.some((ed) => ed.institution.toLowerCase() === incEd.institution.toLowerCase());
        if (!exists) {
          merged.education.push(incEd);
        }
      }
    });
  }

  // 6. Certifications
  if (selectiveSync.certifications && incoming.certifications) {
    incoming.certifications.forEach((incC, idx) => {
      const newConflictId = `conflict_cert_new_${idx}`;
      if (resolutions[newConflictId] === "incoming") {
        const exists = (merged.certifications || []).some((c) => c.name.toLowerCase() === incC.name.toLowerCase());
        if (!exists) {
          if (!merged.certifications) merged.certifications = [];
          merged.certifications.push(incC);
        }
      }
    });
  }

  return merged;
}
