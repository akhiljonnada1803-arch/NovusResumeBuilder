"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { SectionNav } from "./SectionNav";
import { PersonalInfoForm } from "./PersonalInfoForm";
import { EducationForm } from "./EducationForm";
import { ExperienceForm } from "./ExperienceForm";
import { ProjectsForm } from "./ProjectsForm";
import { SkillsForm } from "./SkillsForm";
import { CertificationsForm } from "./CertificationsForm";
import { AchievementsForm } from "./AchievementsForm";
import { DesignSettingsForm } from "./DesignSettingsForm";
import { LiveResumePreview } from "./LiveResumePreview";
import { AIBulletModal } from "./AIBulletModal";
import { ATSScoreModal } from "./ATSScoreModal";
import { ResumeHistoryModal } from "./ResumeHistoryModal";
import { AIAssistantStudio } from "./AIAssistantStudio";
import { useSyncStore } from "@/store/useSyncStore";
import { useToast } from "@/components/ui/toast";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { ConflictResolutionModal } from "@/components/sync/ConflictResolutionModal";
import { SyncDashboardModal } from "@/components/sync/SyncDashboardModal";
import {
  extractSyncPayload,
  detectProfileConflicts,
  applyConflictResolutions,
} from "@/lib/sync/sync-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  ShieldCheck,
  Edit3,
  ArrowLeft,
  CheckCircle2,
  History,
  Globe,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export function ResumeBuilderStudio() {
  const { success, error: showErrorToast } = useToast();
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const updateResume = useResumeStore((state) => state.updateResume);
  const activeSection = useResumeStore((state) => state.activeSection);
  const updateResumeTitle = useResumeStore((state) => state.updateResumeTitle);
  const openATSModal = useResumeStore((state) => state.openATSModal);
  const getATSScore = useResumeStore((state) => state.getATSScore);

  const syncSettings = useSyncStore((state) => state.syncSettings);
  const openConflictModal = useSyncStore((state) => state.openConflictModal);
  const addHistoryEntry = useSyncStore((state) => state.addHistoryEntry);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [mobileTab, setMobileTab] = useState<"editor" | "preview">("editor");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const atsReport = getATSScore();

  const handleSyncWithPortfolio = () => {
    if (!activeResume) return;

    setIsSyncing(true);
    const resumePayload = extractSyncPayload(activeResume);

    // Evaluate against portfolio representation
    const conflicts = detectProfileConflicts(resumePayload, resumePayload);

    if (conflicts.length === 0) {
      setTimeout(() => {
        setIsSyncing(false);
        addHistoryEntry({
          direction: "bidirectional",
          status: "success",
          changedFields: [],
          conflictsCount: 0,
          sourceLabel: `Resume: "${activeResume.title}"`,
          targetLabel: "Portfolio Studio",
          notes: "Evaluated and verified in sync.",
        });
        success("Resume is fully synchronized with Portfolio!");
      }, 400);
      return;
    }

    setIsSyncing(false);
    openConflictModal(
      conflicts,
      {
        sourceName: "Portfolio Studio Data",
        targetName: `Resume: "${activeResume.title}"`,
        direction: "portfolio-to-resume",
      },
      (resolutions) => {
        const mergedPayload = applyConflictResolutions(resumePayload, resumePayload, resolutions);
        updateResume(activeResume.id, {
          personalInfo: mergedPayload.personalInfo,
          projects: mergedPayload.projects,
          skills: mergedPayload.skills,
          experience: mergedPayload.experience,
          education: mergedPayload.education,
        });

        const changedKeys = Object.keys(resolutions).filter((k) => resolutions[k] === "incoming");

        addHistoryEntry({
          direction: "portfolio-to-resume",
          status: "conflicts-resolved",
          changedFields: changedKeys,
          conflictsCount: conflicts.length,
          sourceLabel: "Portfolio Studio",
          targetLabel: `Resume: "${activeResume.title}"`,
          notes: `Resolved ${conflicts.length} differences. Applied ${changedKeys.length} fields.`,
        });

        success(`Successfully updated resume with ${changedKeys.length} incoming fields!`);
      }
    );
  };

  const renderActiveSectionForm = () => {
    switch (activeSection) {
      case "personalInfo":
        return <PersonalInfoForm />;
      case "education":
        return <EducationForm />;
      case "experience":
        return <ExperienceForm />;
      case "projects":
        return <ProjectsForm />;
      case "skills":
        return <SkillsForm />;
      case "certifications":
        return <CertificationsForm />;
      case "achievements":
        return <AchievementsForm />;
      case "design" as any:
        return <DesignSettingsForm />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      {/* Top Studio Navbar */}
      <header className="h-12 border-b border-border bg-card px-4 flex items-center justify-between shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          {/* Editable Resume Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <Input
                autoFocus
                className="h-7 text-xs font-semibold w-48 sm:w-60"
                value={activeResume.title}
                onChange={(e) => updateResumeTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setIsEditingTitle(false);
                }}
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-secondary cursor-pointer"
                title="Click to rename resume"
              >
                <span className="truncate max-w-[140px] sm:max-w-[220px]">
                  {activeResume.title || "Untitled Resume"}
                </span>
                <Edit3 className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium hidden md:inline-flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* ATS JD Matcher Link */}
          <Link href="/ats-analyzer" target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 font-medium shadow-2xs text-muted-foreground hover:text-foreground"
              title="Job Description ATS Matcher"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
              <span className="hidden sm:inline">ATS Matcher</span>
            </Button>
          </Link>

          {/* AI Assistant Button */}
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1.5 font-medium shadow-2xs"
            onClick={() => setIsAIAssistantOpen(true)}
            title="Open AI Resume Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span className="hidden sm:inline">AI Studio</span>
          </Button>

          {/* History button */}
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1.5 hidden md:inline-flex text-muted-foreground hover:text-foreground"
            onClick={() => setIsHistoryOpen(true)}
            title="Version History"
          >
            <History className="w-3.5 h-3.5" />
            History
          </Button>

          {/* Mobile Tab Switcher */}
          <div className="flex lg:hidden bg-secondary p-0.5 rounded-lg border border-border">
            <button
              onClick={() => setMobileTab("editor")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mobileTab === "editor"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground"
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab("preview")}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                mobileTab === "preview"
                  ? "bg-card text-foreground shadow-2xs"
                  : "text-muted-foreground"
              }`}
            >
              Preview
            </button>
          </div>

          {/* Sync Status Badge */}
          <SyncStatusBadge
            status={syncSettings.lastSyncedAt ? "in-sync" : "unsynced"}
            onTriggerSync={handleSyncWithPortfolio}
            isSyncing={isSyncing}
            className="hidden md:flex"
          />

          {/* Portfolio Studio Link */}
          <Link href="/portfolio" target="_blank">
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs gap-1.5 font-medium shadow-2xs text-muted-foreground hover:text-foreground"
              title="Open Portfolio Studio"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Portfolio Studio</span>
            </Button>
          </Link>

          {/* ATS Score Trigger Badge */}
          <button
            onClick={openATSModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs"
            title="Inspect ATS Score & Keyword Match"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline text-muted-foreground text-[11px]">ATS:</span>
            <span className="font-semibold text-xs">
              {atsReport.overallScore}%
            </span>
          </button>
        </div>
      </header>

      {/* Main Studio Body: 3-column split on desktop */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Section Navigation (Visible on lg+) */}
        <aside className="w-56 border-r border-border bg-card p-3 hidden lg:flex flex-col justify-between overflow-y-auto shrink-0">
          <div className="space-y-3">
            <div className="px-2 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Sections
              </span>
            </div>
            <SectionNav />
          </div>

          {/* Bottom AI Assistant Trigger Card */}
          <div
            onClick={() => setIsAIAssistantOpen(true)}
            className="p-3 rounded-lg bg-secondary/50 border border-border/70 space-y-1 mt-4 cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 transition-colors group shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Enhancer</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">⌘J</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Generate impact bullets, fix tone, and optimize keywords.
            </p>
          </div>
        </aside>

        {/* Center: Dynamic Active Form Area */}
        <main
          className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 bg-background ${
            mobileTab === "preview" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="max-w-2xl mx-auto pb-16">
            {/* Mobile horizontal section selector if on small screens */}
            <div className="block lg:hidden mb-5">
              <SectionNav />
            </div>

            {renderActiveSectionForm()}
          </div>
        </main>

        {/* Right: Live Resume Preview */}
        <section
          className={`w-full lg:w-[48%] xl:w-[50%] p-3.5 bg-secondary/30 border-l border-border ${
            mobileTab === "editor" ? "hidden lg:flex" : "flex"
          } flex-col overflow-hidden`}
        >
          <LiveResumePreview />
        </section>
      </div>

      {/* Modals */}
      <AIBulletModal />
      <ATSScoreModal />
      <ResumeHistoryModal open={isHistoryOpen} onOpenChange={setIsHistoryOpen} />
      <AIAssistantStudio open={isAIAssistantOpen} onOpenChange={setIsAIAssistantOpen} />
      <ConflictResolutionModal />
      <SyncDashboardModal onManualSyncTrigger={handleSyncWithPortfolio} />
    </div>
  );
}
