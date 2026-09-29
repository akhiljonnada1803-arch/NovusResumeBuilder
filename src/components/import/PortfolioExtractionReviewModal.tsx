"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useResumeStore } from "@/store/useResumeStore";
import { ExtractedPortfolioData, PortfolioMergeSelection } from "@/types/portfolio-import";
import { Resume } from "@/types/resume";
import { DEFAULT_DESIGN } from "@/lib/constants";
import {
  Globe,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Award,
  Sparkles,
  ArrowRight,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  User,
  Check,
  RotateCcw,
  Layers,
  Code2,
  Mail,
  Phone,
  XCircle,
  Trash2,
  Lock,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

interface PortfolioExtractionReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: ExtractedPortfolioData | null;
}

export function PortfolioExtractionReviewModal({
  open,
  onOpenChange,
  data,
}: PortfolioExtractionReviewModalProps) {
  const router = useRouter();
  const { success, error: showErrorToast } = useToast();

  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const resumes = useResumeStore((state) => state.resumes);
  const activeResume = resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const importResume = useResumeStore((state) => state.importResume);
  const updateResume = useResumeStore((state) => state.updateResume);

  const [activeTab, setActiveTab] = useState<"projects" | "skills" | "experience" | "social" | "contact">("projects");
  const [showMergeConfirm, setShowMergeConfirm] = useState(false);

  // Granular Merge Options (Never overwrite automatically)
  const [mergeSelection, setMergeSelection] = useState<PortfolioMergeSelection>({
    personalInfo: true,
    projects: true,
    skills: true,
    experience: true,
    education: true,
    certifications: true,
    achievements: true,
  });

  if (!data) return null;

  const {
    personalInfo,
    projects,
    skills,
    experience,
    education,
    certifications = [],
    achievements = [],
    socialLinks,
    rawSourceMeta,
    confidenceScore,
  } = data;

  // Converts extracted data into a complete Resume object
  const buildCompleteResume = (titleOverride?: string): Resume => {
    const resumeId = `portfolio-import-${Date.now()}`;
    return {
      id: resumeId,
      title: titleOverride || `${personalInfo.fullName || "Portfolio"} – Verified Profile`,
      targetRole: personalInfo.jobTitle || "Software Engineer",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      personalInfo: {
        fullName: personalInfo.fullName || "",
        jobTitle: personalInfo.jobTitle || "",
        email: personalInfo.email || socialLinks.email || "",
        phone: personalInfo.phone || socialLinks.phone || "",
        location: personalInfo.location || "",
        website: personalInfo.website || socialLinks.website || "",
        linkedin: personalInfo.linkedin || socialLinks.linkedin || "",
        github: personalInfo.github || socialLinks.github || "",
        summary: personalInfo.summary || "",
      },
      projects: projects.map((p, idx) => ({
        id: `proj_ext_${Date.now()}_${idx}`,
        title: p.title || "Project",
        subtitle: p.subtitle || "",
        description: p.description || "",
        technologies: p.technologies || [],
        githubUrl: p.githubUrl,
        liveUrl: p.liveUrl,
        startDate: p.startDate,
        endDate: p.endDate,
      })),
      skills: skills.map((s, idx) => ({
        id: `sk_ext_${Date.now()}_${idx}`,
        name: s.name,
        category: s.category || "Technical",
        level: s.level || "Advanced",
      })),
      experience: experience.map((e, idx) => ({
        id: `exp_ext_${Date.now()}_${idx}`,
        company: e.company || "",
        position: e.position || "",
        location: e.location || "",
        startDate: e.startDate || "",
        endDate: e.endDate || "",
        current: Boolean(e.current),
        description: e.description || "",
        highlights: e.highlights || [],
      })),
      education: education.map((ed, idx) => ({
        id: `edu_ext_${Date.now()}_${idx}`,
        institution: ed.institution || "",
        degree: ed.degree || "",
        fieldOfStudy: ed.fieldOfStudy || "",
        startDate: ed.startDate || "",
        endDate: ed.endDate || "",
        current: false,
        gpa: ed.gpa || "",
      })),
      certifications: certifications.map((c, idx) => ({
        id: `cert_ext_${Date.now()}_${idx}`,
        name: c.name || "",
        issuer: c.issuer || "",
        issueDate: c.issueDate || "",
      })),
      achievements: achievements.map((a, idx) => ({
        id: `ach_ext_${Date.now()}_${idx}`,
        title: a.title || "",
        issuer: a.issuer || "",
        date: a.date || "",
        description: a.description || "",
      })),
      design: DEFAULT_DESIGN,
    };
  };

  // Action 1: Import as Brand New Entity
  const handleCreateNewResume = () => {
    const newResume = buildCompleteResume();
    importResume(newResume);
    success(`Created new resume for ${personalInfo.fullName || "Candidate"}!`);
    onOpenChange(false);
    router.push(`/builder/${newResume.id}`);
  };

  // Action 2: Non-Destructive Merge (Only appends missing items without clobbering existing)
  const handleConfirmMerge = () => {
    if (!activeResume) {
      showErrorToast("No active resume found to merge with.");
      return;
    }

    const updates: Partial<Resume> = {};

    // 1. Projects Merge
    if (mergeSelection.projects) {
      const existingProjectTitles = new Set(activeResume.projects.map((p) => p.title.toLowerCase().trim()));
      const newProjects = projects
        .filter((p) => !existingProjectTitles.has(p.title.toLowerCase().trim()))
        .map((p, idx) => ({
          id: `proj_mrg_${Date.now()}_${idx}`,
          title: p.title,
          subtitle: p.subtitle || "",
          description: p.description || "",
          technologies: p.technologies || [],
          githubUrl: p.githubUrl,
          liveUrl: p.liveUrl,
        }));
      updates.projects = [...activeResume.projects, ...newProjects];
    }

    // 2. Skills Merge
    if (mergeSelection.skills) {
      const existingSkillNames = new Set(activeResume.skills.map((s) => s.name.toLowerCase().trim()));
      const newSkills = skills
        .filter((s) => !existingSkillNames.has(s.name.toLowerCase().trim()))
        .map((s, idx) => ({
          id: `sk_mrg_${Date.now()}_${idx}`,
          name: s.name,
          category: s.category || "Technical",
          level: s.level || "Advanced",
        }));
      updates.skills = [...activeResume.skills, ...newSkills];
    }

    // 3. Experience Merge
    if (mergeSelection.experience) {
      const existingCompanies = new Set(activeResume.experience.map((e) => `${e.company.toLowerCase()}-${e.position.toLowerCase()}`));
      const newExperience = experience
        .filter((e) => !existingCompanies.has(`${e.company.toLowerCase()}-${e.position.toLowerCase()}`))
        .map((e, idx) => ({
          id: `exp_mrg_${Date.now()}_${idx}`,
          company: e.company,
          position: e.position,
          location: e.location || "",
          startDate: e.startDate || "",
          endDate: e.endDate || "",
          current: Boolean(e.current),
          description: e.description || "",
          highlights: e.highlights || [],
        }));
      updates.experience = [...activeResume.experience, ...newExperience];
    }

    // 4. Contact & Social Links Merge
    if (mergeSelection.personalInfo) {
      updates.personalInfo = {
        ...activeResume.personalInfo,
        website: activeResume.personalInfo.website || personalInfo.website || socialLinks.website || "",
        github: activeResume.personalInfo.github || personalInfo.github || socialLinks.github || "",
        linkedin: activeResume.personalInfo.linkedin || personalInfo.linkedin || socialLinks.linkedin || "",
      };
    }

    updateResume(activeResume.id, updates);

    success(`Merged selected portfolio assets non-destructively into "${activeResume.title}"!`);
    setShowMergeConfirm(false);
    onOpenChange(false);
  };

  // Action 3: Ignore / Discard
  const handleIgnore = () => {
    onOpenChange(false);
    success("Portfolio extraction dismissed. No changes were made.");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="4xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <Globe className="w-5 h-5 text-primary" />
            <DialogTitle>Portfolio Extraction Preview</DialogTitle>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{confidenceScore}% Extraction Accuracy</span>
            </span>
          </div>
        </div>
        <DialogDescription>
          Verify extracted projects, skills, and experience from your <strong>{rawSourceMeta.sourceType.toUpperCase()}</strong> source before choosing an action.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Source Telemetry Banner */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-base">
                {personalInfo.fullName ? personalInfo.fullName.slice(0, 2).toUpperCase() : "PF"}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">
                  {personalInfo.fullName || "Candidate Portfolio"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {personalInfo.jobTitle || "Software Engineer"} {personalInfo.location ? `• ${personalInfo.location}` : ""}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
              <span className="px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground border border-border">
                Source: <strong className="text-foreground">{rawSourceMeta.sourceIdentifier}</strong>
              </span>
              {rawSourceMeta.detectedFramework && (
                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 font-bold">
                  {rawSourceMeta.detectedFramework}
                </span>
              )}
            </div>
          </div>

          {/* Zero-Overwrite Safety Banner */}
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
            <Lock className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span>
              <strong>Zero Auto-Overwrite Policy:</strong> Data is never automatically overwritten. You control whether to import as new, merge non-destructively, or ignore.
            </span>
          </div>
        </div>

        {/* 5 Requested Section Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-secondary/50 p-1 rounded-xl border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "projects"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1. Projects ({projects.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "skills"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2. Skills ({skills.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "experience"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3. Experience ({experience.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("social")}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "social"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            4. Social Links
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("contact")}
            className={`py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === "contact"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            5. Contact Info
          </button>
        </div>

        {/* Tab 1: Projects Preview */}
        {activeTab === "projects" && (
          <div className="space-y-2.5">
            {projects.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                No explicitly declared projects found in this portfolio source.
              </div>
            ) : (
              projects.map((p, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{p.title}</span>
                    <div className="flex items-center gap-2">
                      {p.githubUrl && (
                        <a href={p.githubUrl} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground">
                          <GithubIcon className="w-3.5 h-3.5" />
                        </a>
                      )}
                      {p.liveUrl && (
                        <a href={p.liveUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1 text-[11px]">
                          <span>Live</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  {p.description && <p className="text-muted-foreground leading-relaxed text-[11px]">{p.description}</p>}
                  {p.technologies && p.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.technologies.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-foreground border border-border">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Skills Preview */}
        {activeTab === "skills" && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <span className="text-xs font-bold text-foreground block">Extracted Skill Set</span>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs font-medium border border-border/80 flex items-center gap-1.5 shadow-2xs">
                  <span>{s.name}</span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase">{s.level}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Experience Preview */}
        {activeTab === "experience" && (
          <div className="space-y-2.5">
            {experience.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-border rounded-xl text-xs text-muted-foreground">
                No work experience records extracted from this portfolio source.
              </div>
            ) : (
              experience.map((e, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{e.position} @ {e.company}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {e.startDate} – {e.current ? "Present" : e.endDate || "N/A"}
                    </span>
                  </div>
                  {e.description && <p className="text-muted-foreground text-[11px] leading-relaxed">{e.description}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 4: Social Links Preview */}
        {activeTab === "social" && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
            <span className="font-bold text-foreground block">Extracted Social & Web Profiles</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <GithubIcon className="w-4 h-4 text-foreground" />
                  GitHub
                </span>
                <span className="font-mono text-[11px] text-foreground font-semibold">
                  {personalInfo.github || socialLinks.github || "(Not found)"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <LinkedinIcon className="w-4 h-4 text-blue-500" />
                  LinkedIn
                </span>
                <span className="font-mono text-[11px] text-foreground font-semibold">
                  {personalInfo.linkedin || socialLinks.linkedin || "(Not found)"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Globe className="w-4 h-4 text-primary" />
                  Website
                </span>
                <span className="font-mono text-[11px] text-foreground font-semibold">
                  {personalInfo.website || socialLinks.website || "(Not found)"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Contact Information Preview */}
        {activeTab === "contact" && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3 text-xs">
            <span className="font-bold text-foreground block">Extracted Contact Information</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Candidate Name</span>
                <span className="font-bold text-foreground">{personalInfo.fullName || "(Not found)"}</span>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Job Title / Headline</span>
                <span className="font-bold text-foreground">{personalInfo.jobTitle || "(Not found)"}</span>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Email Address</span>
                <span className="font-mono text-foreground font-bold">{personalInfo.email || socialLinks.email || "(Not found)"}</span>
              </div>

              <div className="p-3 rounded-lg bg-secondary/30 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Location</span>
                <span className="font-bold text-foreground">{personalInfo.location || "(Not found)"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Merge Confirmation & Selection Screen */}
        {showMergeConfirm && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-3 animate-in fade-in duration-200 text-xs">
            <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Configure Non-Destructive Merge into &ldquo;{activeResume?.title}&rdquo;</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Select which sections to merge. Existing data will not be overwritten; only new projects, skills, and experiences will be appended.
            </p>

            {/* Merge Section Checkboxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeSelection.projects}
                  onChange={(e) => setMergeSelection({ ...mergeSelection, projects: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-semibold text-[11px]">Projects ({projects.length})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeSelection.skills}
                  onChange={(e) => setMergeSelection({ ...mergeSelection, skills: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-semibold text-[11px]">Skills ({skills.length})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeSelection.experience}
                  onChange={(e) => setMergeSelection({ ...mergeSelection, experience: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-semibold text-[11px]">Experience ({experience.length})</span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg bg-card/80 border border-border cursor-pointer">
                <input
                  type="checkbox"
                  checked={mergeSelection.personalInfo}
                  onChange={(e) => setMergeSelection({ ...mergeSelection, personalInfo: e.target.checked })}
                  className="rounded text-primary focus:ring-primary"
                />
                <span className="font-semibold text-[11px]">Social & Contact</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button size="sm" variant="ghost" onClick={() => setShowMergeConfirm(false)} className="text-xs">
                Cancel
              </Button>
              <Button size="sm" variant="radiant" onClick={handleConfirmMerge} className="text-xs font-bold gap-1.5 shadow-xs">
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Merge Non-Destructively</span>
              </Button>
            </div>
          </div>
        )}

        {/* 3 Explicit Options: Import, Merge, Ignore */}
        {!showMergeConfirm && (
          <div className="pt-2 border-t border-border space-y-3">
            <span className="text-[11px] font-mono uppercase font-bold text-muted-foreground block text-center">
              Choose Migration Action
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Option 1: Import as Brand New Entity */}
              <button
                type="button"
                onClick={handleCreateNewResume}
                className="p-3.5 rounded-2xl border border-border bg-card hover:border-primary/60 hover:bg-secondary/40 text-left transition-all space-y-1 group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground group-hover:text-primary">
                    1. Import (New Entity)
                  </span>
                  <FileText className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Creates a brand new ATS-formatted resume & portfolio workspace.
                </p>
              </button>

              {/* Option 2: Merge into Active Resume */}
              <button
                type="button"
                onClick={() => setShowMergeConfirm(true)}
                className="p-3.5 rounded-2xl border border-border bg-card hover:border-emerald-500/60 hover:bg-secondary/40 text-left transition-all space-y-1 group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground group-hover:text-emerald-500">
                    2. Merge (Append Missing)
                  </span>
                  <Layers className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Appends new projects & skills to active resume without overwriting.
                </p>
              </button>

              {/* Option 3: Ignore / Discard */}
              <button
                type="button"
                onClick={handleIgnore}
                className="p-3.5 rounded-2xl border border-border bg-card hover:border-rose-500/60 hover:bg-secondary/40 text-left transition-all space-y-1 group shadow-2xs cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground group-hover:text-rose-500">
                    3. Ignore / Discard
                  </span>
                  <XCircle className="w-3.5 h-3.5 text-muted-foreground group-hover:text-rose-500" />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Dismisses this extraction without altering any of your data.
                </p>
              </button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
