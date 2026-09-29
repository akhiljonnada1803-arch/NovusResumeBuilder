"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useSyncStore } from "@/store/useSyncStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PortfolioImportModal } from "@/components/import/PortfolioImportModal";
import { PortfolioExtractionReviewModal } from "@/components/import/PortfolioExtractionReviewModal";
import { SyncStatusBadge } from "@/components/sync/SyncStatusBadge";
import { ConflictResolutionModal } from "@/components/sync/ConflictResolutionModal";
import { SyncDashboardModal } from "@/components/sync/SyncDashboardModal";
import { ExtractedPortfolioData } from "@/types/portfolio-import";
import {
  extractSyncPayload,
  detectProfileConflicts,
  applyConflictResolutions,
  computeProfileHash,
} from "@/lib/sync/sync-service";
import {
  PortfolioTemplateId,
  PortfolioTheme,
  PORTFOLIO_TEMPLATES,
  DEFAULT_PORTFOLIO_SECTIONS,
  PortfolioCustomizationSettings,
} from "@/types/portfolio";
import { DeploymentLogEntry, VercelDeploymentResult } from "@/types/vercel-deploy";
import { BuildLogsTerminal } from "@/components/portfolio/deployment/BuildLogsTerminal";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  CheckCircle2,
  Rocket,
  RefreshCw,
  Lock,
  Layers,
  AlertCircle,
  Eye,
  Key,
  UserCheck,
  Shield,
  HelpCircle,
  UploadCloud,
  ArrowRightLeft,
  SlidersHorizontal,
  Type,
  Image as ImageIcon,
  RotateCcw,
  LayoutGrid,
  Plus,
  Trash2,
} from "lucide-react";

export default function PortfolioStudioPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const updateResume = useResumeStore((state) => state.updateResume);
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const addProject = useResumeStore((state) => state.addProject);
  const updateProject = useResumeStore((state) => state.updateProject);
  const deleteProject = useResumeStore((state) => state.deleteProject);
  const addSkill = useResumeStore((state) => state.addSkill);
  const deleteSkill = useResumeStore((state) => state.deleteSkill);
  const addExperience = useResumeStore((state) => state.addExperience);
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const deleteExperience = useResumeStore((state) => state.deleteExperience);
  const addEducation = useResumeStore((state) => state.addEducation);
  const updateEducation = useResumeStore((state) => state.updateEducation);
  const deleteEducation = useResumeStore((state) => state.deleteEducation);

  const selectedResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0];

  const [selectedResumeId, setSelectedResumeId] = useState(selectedResume?.id || "");
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplateId>("developer");
  const [activeTab, setActiveTab] = useState<"templates" | "content" | "sections" | "vercel" | "logs">("templates");
  const [contentSubTab, setContentSubTab] = useState<"hero" | "socials" | "projects" | "skills" | "experience" | "education">("hero");

  // Customization & Content Overrides State
  const [customization, setCustomization] = useState<PortfolioCustomizationSettings>({
    headlineOverride: "",
    taglineOverride: "",
    bioOverride: "",
    photoUrl: "",
    primaryCtaText: "",
    primaryCtaLink: "",
    sectionVisibility: {
      hero: true,
      about: true,
      "featured-projects": true,
      skills: true,
      experience: true,
      education: true,
      contact: true,
    },
  });

  // Portfolio Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedPortfolioData, setImportedPortfolioData] = useState<ExtractedPortfolioData | null>(null);
  const [isImportReviewOpen, setIsImportReviewOpen] = useState(false);

  // Sync Store & State
  const syncSettings = useSyncStore((state) => state.syncSettings);
  const openConflictModal = useSyncStore((state) => state.openConflictModal);
  const addHistoryEntry = useSyncStore((state) => state.addHistoryEntry);
  const [isSyncing, setIsSyncing] = useState(false);

  // Vercel State
  const [vercelToken, setVercelToken] = useState("");
  const candidateName = selectedResume?.personalInfo?.fullName || "candidate";
  const defaultProjectName = `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, "")}-portfolio`;
  const [projectName, setProjectName] = useState(defaultProjectName);

  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const [validatedUser, setValidatedUser] = useState<{
    id: string;
    username: string;
    email: string;
    name: string;
    avatar: string;
  } | null>(null);

  // Deployment Lifecycle: Draft | Published | Unpublished
  const [portfolioState, setPortfolioState] = useState<"Draft" | "Published" | "Unpublished">("Draft");
  const [deploymentResult, setDeploymentResult] = useState<VercelDeploymentResult | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<DeploymentLogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const currentResume = resumes.find((r) => r.id === selectedResumeId) || selectedResume;

  // Load saved token from localStorage if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedToken = localStorage.getItem("novus_vercel_token");
      if (savedToken) {
        setVercelToken(savedToken);
        validateToken(savedToken);
      }
    }
  }, []);

  const validateToken = async (tokenToValidate = vercelToken) => {
    if (!tokenToValidate.trim()) {
      showErrorToast("Please enter a Vercel Access Token.");
      return;
    }

    setIsValidatingToken(true);
    try {
      // Fix #1: token sent as Authorization header, not in the request body
      const res = await fetch("/api/portfolio/vercel/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tokenToValidate.trim()}`,
        },
        body: JSON.stringify({}),
      });

      const data = await res.json();
      if (data.valid && data.user) {
        setValidatedUser(data.user);
        if (typeof window !== "undefined") {
          localStorage.setItem("novus_vercel_token", tokenToValidate.trim());
        }
        success(`Validated Vercel Account: @${data.user.username}`);
      } else {
        setValidatedUser(null);
        showErrorToast(data.error || "Invalid Vercel Access Token.");
      }
    } catch (e: any) {
      showErrorToast("Error validating Vercel Access Token.");
    } finally {
      setIsValidatingToken(false);
    }
  };

  // Synchronize Resume with Portfolio
  const handleTriggerSync = () => {
    if (!currentResume) return;

    setIsSyncing(true);
    const sourceResume = resumes.find((r) => r.id === activeResumeId) || currentResume;
    const currentPayload = extractSyncPayload(currentResume);
    const sourcePayload = extractSyncPayload(sourceResume);

    const conflicts = detectProfileConflicts(currentPayload, sourcePayload);

    if (conflicts.length === 0) {
      // Perfectly in sync
      setTimeout(() => {
        setIsSyncing(false);
        addHistoryEntry({
          direction: "bidirectional",
          status: "success",
          changedFields: [],
          conflictsCount: 0,
          sourceLabel: sourceResume.title,
          targetLabel: "Portfolio Studio",
          notes: "Entities evaluated and confirmed in sync.",
        });
        success("Resume and Portfolio are already perfectly in sync!");
      }, 400);
      return;
    }

    // Conflicts / differences detected: Open Conflict Resolution Modal
    setIsSyncing(false);
    openConflictModal(
      conflicts,
      {
        sourceName: `Resume: "${sourceResume.title}"`,
        targetName: "Portfolio Studio View",
        direction: "resume-to-portfolio",
      },
      (resolutions) => {
        const mergedPayload = applyConflictResolutions(currentPayload, sourcePayload, resolutions);
        updateResume(currentResume.id, {
          personalInfo: mergedPayload.personalInfo,
          projects: mergedPayload.projects,
          skills: mergedPayload.skills,
          experience: mergedPayload.experience,
          education: mergedPayload.education,
        });

        const changedKeys = Object.keys(resolutions).filter((k) => resolutions[k] === "incoming");

        addHistoryEntry({
          direction: "resume-to-portfolio",
          status: "conflicts-resolved",
          changedFields: changedKeys,
          conflictsCount: conflicts.length,
          sourceLabel: sourceResume.title,
          targetLabel: "Portfolio Studio",
          notes: `Resolved ${conflicts.length} differences. Applied ${changedKeys.length} incoming fields.`,
        });

        success(`Successfully synchronized ${changedKeys.length} fields with portfolio!`);
      }
    );
  };

  // Deploy to User's Own Vercel
  const handleDeployToVercel = async () => {
    if (!currentResume) {
      showErrorToast("No resume selected for deployment.");
      return;
    }

    setIsDeploying(true);
    setActiveTab("logs");
    setLogs([]);

    try {
      // Fix #1: token sent as Authorization header, not in the request body
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (vercelToken.trim()) headers["Authorization"] = `Bearer ${vercelToken.trim()}`;

      const res = await fetch("/api/portfolio/vercel/deploy", {
        method: "POST",
        headers,
        body: JSON.stringify({
          resume: currentResume,
          resumeId: currentResume.id,
          theme: selectedTemplate,
          projectName: projectName.trim() || defaultProjectName,
          customization,
        }),
      });

      const data: VercelDeploymentResult = await res.json();

      if (data.success) {
        setDeploymentResult(data);
        setLogs(data.logs || []);
        setPortfolioState("Published");
        if (data.isDemoFallback) {
          success(`Preview complete — add your Vercel token to deploy live.`);
        } else {
          success(`Portfolio successfully deployed to ${data.url}!`);
        }
      } else {
        showErrorToast((data as any).error || "Deployment failed.");
      }
    } catch (e: any) {
      showErrorToast("Error deploying portfolio to Vercel.");
    } finally {
      setIsDeploying(false);
    }
  };

  // Unpublish
  const handleUnpublish = async () => {
    try {
      const res = await fetch("/api/portfolio/unpublish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: currentResume?.id }),
      });

      const data = await res.json();
      if (data.success) {
        setPortfolioState("Unpublished");
        success("Portfolio marked as unpublished.");
      }
    } catch (e: any) {
      showErrorToast("Error unpublishing portfolio.");
    }
  };

  // Live Website Button handler
  const handleOpenLiveWebsite = () => {
    if (portfolioState === "Published" && deploymentResult?.url) {
      window.open(deploymentResult.url, "_blank");
    } else {
      showErrorToast("Portfolio has not been deployed yet. Please deploy to your Vercel account first.");
    }
  };

  const copyLiveUrl = () => {
    if (deploymentResult?.url) {
      navigator.clipboard.writeText(deploymentResult.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success("Vercel deployment URL copied!");
    }
  };

  const toggleSection = (sectionKey: string) => {
    setCustomization((prev) => ({
      ...prev,
      sectionVisibility: {
        ...prev.sectionVisibility,
        [sectionKey]: prev.sectionVisibility?.[sectionKey] === false ? true : false,
      },
    }));
  };

  const handleResetCustomization = () => {
    setCustomization({
      headlineOverride: "",
      taglineOverride: "",
      bioOverride: "",
      photoUrl: "",
      primaryCtaText: "",
      primaryCtaLink: "",
      sectionVisibility: {
        hero: true,
        about: true,
        "featured-projects": true,
        skills: true,
        experience: true,
        education: true,
        contact: true,
      },
    });
    success("Customization overrides reset to resume defaults.");
  };

  const SECTIONS_LIST = [
    { id: "hero", label: "Hero Header & Introduction", desc: "Top title, role tag, and avatar" },
    { id: "about", label: "About / Bio & Philosophy", desc: "Summary narrative and background statement" },
    { id: "featured-projects", label: "Projects / Case Studies", desc: "Flagship software, papers, or deliverables" },
    { id: "skills", label: "Skills / Tokens / Stack", desc: "Competencies, toolchains, and badges" },
    { id: "experience", label: "Experience & Career History", desc: "Professional background timeline" },
    { id: "education", label: "Education & Credentials", desc: "Academic degrees and coursework" },
    { id: "contact", label: "Call-to-Action / Contact", desc: "Inquiry forms, booking links, and PDF download" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                Portfolio Deployment Studio
              </h1>
              {/* Sync Status Badge */}
              <SyncStatusBadge
                status={syncSettings.lastSyncedAt ? "in-sync" : "unsynced"}
                onTriggerSync={handleTriggerSync}
                isSyncing={isSyncing}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Customize content, toggle sections, switch themes, and deploy live to your personal Vercel account.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Import Existing Portfolio</span>
          </Button>

          {portfolioState === "Published" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleUnpublish}
              className="h-8 text-xs font-semibold text-muted-foreground hover:text-destructive"
            >
              Unpublish
            </Button>
          )}

          <Button
            size="sm"
            variant="radiant"
            onClick={handleOpenLiveWebsite}
            className="h-8 text-xs gap-1.5 font-bold shadow-2xs"
          >
            <span>Open Live Website</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Deployment Status & Architecture Banner */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              portfolioState === "Published" ? "bg-emerald-500 animate-pulse" :
              portfolioState === "Unpublished" ? "bg-amber-500" : "bg-slate-400"
            }`} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  Portfolio Status: <span className={
                    portfolioState === "Published" ? "text-emerald-600 dark:text-emerald-400" :
                    portfolioState === "Unpublished" ? "text-amber-500" : "text-muted-foreground"
                  }>{portfolioState}</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                  User-Owned Vercel Deployment
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {portfolioState === "Published" && deploymentResult?.url
                  ? `Live on Vercel at ${deploymentResult.url}`
                  : "Portfolio has not been deployed to Vercel yet."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {portfolioState === "Published" && deploymentResult?.url && (
              <Button
                size="sm"
                variant="outline"
                onClick={copyLiveUrl}
                className="h-7 text-xs gap-1 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? "Copied" : "Copy URL"}</span>
              </Button>
            )}

            <Button
              size="sm"
              variant="radiant"
              onClick={handleDeployToVercel}
              disabled={isDeploying}
              className="h-8 text-xs font-bold gap-1.5 shadow-xs"
            >
              <Rocket className={`w-3.5 h-3.5 ${isDeploying ? "animate-spin" : ""}`} />
              <span>{isDeploying ? "Deploying..." : portfolioState === "Published" ? "Redeploy Latest Changes" : "Deploy to Vercel"}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
            {/* Source Resume Selector */}
            <div className="space-y-1.5 pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold">Source Resume Data</Label>
                <button
                  type="button"
                  onClick={handleTriggerSync}
                  className="text-[10px] text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Sync</span>
                </button>
              </div>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Studio Navigation Tabs (5 Tabs) */}
            <div className="grid grid-cols-5 gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTab("templates")}
                className={`py-1 font-semibold rounded-md transition-colors ${
                  activeTab === "templates"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Templates
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("content")}
                className={`py-1 font-semibold rounded-md transition-colors ${
                  activeTab === "content"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sections")}
                className={`py-1 font-semibold rounded-md transition-colors ${
                  activeTab === "sections"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Sections
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("vercel")}
                className={`py-1 font-semibold rounded-md transition-colors ${
                  activeTab === "vercel"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Vercel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("logs")}
                className={`py-1 font-semibold rounded-md transition-colors ${
                  activeTab === "logs"
                    ? "bg-card text-foreground shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Logs
              </button>
            </div>

            {/* TAB 1: 6 Unique Templates */}
            {activeTab === "templates" && (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                {PORTFOLIO_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplate === tmpl.id;
                  return (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => setSelectedTemplate(tmpl.id)}
                      className={`w-full p-3.5 rounded-xl border text-left transition-all space-y-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-secondary text-foreground border-primary shadow-xs ring-1 ring-primary/40"
                          : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{tmpl.name}</span>
                        <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${tmpl.accentColor}`}>
                          {tmpl.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        {tmpl.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* TAB 2: Full Content & Section Editor */}
            {activeTab === "content" && (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 text-xs">
                {/* Content Sub-Navigation Pill Bar */}
                <div className="flex flex-wrap gap-1 bg-secondary/30 p-1 rounded-lg border border-border text-[10px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setContentSubTab("hero")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      contentSubTab === "hero" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Hero &amp; Bio
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentSubTab("socials")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      contentSubTab === "socials" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Socials
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentSubTab("projects")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      contentSubTab === "projects" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Projects ({currentResume?.projects?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentSubTab("skills")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      contentSubTab === "skills" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Skills ({currentResume?.skills?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentSubTab("experience")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      contentSubTab === "experience" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Experience ({currentResume?.experience?.length || 0})
                  </button>
                  <button
                    type="button"
                    onClick={() => setContentSubTab("education")}
                    className={`px-2 py-1 rounded-md transition-all ${
                      contentSubTab === "education" ? "bg-primary text-primary-foreground shadow-2xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Education ({currentResume?.education?.length || 0})
                  </button>
                </div>

                {/* Sub-Tab 1: Hero & Bio */}
                {contentSubTab === "hero" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="font-bold text-foreground text-xs">Hero &amp; Profile Overrides</span>
                      <button
                        type="button"
                        onClick={handleResetCustomization}
                        className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Headline / Display Name</Label>
                      <Input
                        value={customization.headlineOverride || ""}
                        onChange={(e) => setCustomization((p) => ({ ...p, headlineOverride: e.target.value }))}
                        placeholder={currentResume?.personalInfo?.fullName || "Your Full Name"}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Tagline / Professional Title</Label>
                      <Input
                        value={customization.taglineOverride || ""}
                        onChange={(e) => setCustomization((p) => ({ ...p, taglineOverride: e.target.value }))}
                        placeholder={currentResume?.targetRole || (currentResume?.personalInfo?.jobTitle && !currentResume.personalInfo.jobTitle.toLowerCase().includes("github") ? currentResume.personalInfo.jobTitle : "AI / Software Engineer")}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Hero Bio / About Narrative</Label>
                      <textarea
                        rows={3}
                        value={customization.bioOverride || ""}
                        onChange={(e) => setCustomization((p) => ({ ...p, bioOverride: e.target.value }))}
                        placeholder={currentResume?.personalInfo?.summary || "Short engaging summary..."}
                        className="w-full p-2.5 rounded-lg border border-border bg-card text-xs text-foreground placeholder-muted-foreground focus:outline-hidden resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Portrait / Avatar Image URL</Label>
                      <Input
                        value={customization.photoUrl || ""}
                        onChange={(e) => setCustomization((p) => ({ ...p, photoUrl: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border">
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold">Primary CTA Text</Label>
                        <Input
                          value={customization.primaryCtaText || ""}
                          onChange={(e) => setCustomization((p) => ({ ...p, primaryCtaText: e.target.value }))}
                          placeholder="View Projects"
                          className="h-8 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] font-semibold">Primary CTA Link</Label>
                        <Input
                          value={customization.primaryCtaLink || ""}
                          onChange={(e) => setCustomization((p) => ({ ...p, primaryCtaLink: e.target.value }))}
                          placeholder="#projects"
                          className="h-8 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sub-Tab 2: Socials & Contact */}
                {contentSubTab === "socials" && (
                  <div className="space-y-3 pt-1">
                    <span className="font-bold text-foreground text-xs block pb-1 border-b border-border">
                      Contact &amp; Public Profiles
                    </span>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Email Address</Label>
                      <Input
                        value={currentResume?.personalInfo?.email || ""}
                        onChange={(e) => updatePersonalInfo({ email: e.target.value })}
                        placeholder="alex@example.com"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Location / Base</Label>
                      <Input
                        value={currentResume?.personalInfo?.location || ""}
                        onChange={(e) => updatePersonalInfo({ location: e.target.value })}
                        placeholder="San Francisco, CA or Remote"
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">GitHub Profile URL</Label>
                      <Input
                        value={currentResume?.personalInfo?.github || ""}
                        onChange={(e) => updatePersonalInfo({ github: e.target.value })}
                        placeholder="https://github.com/username"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">LinkedIn Profile URL</Label>
                      <Input
                        value={currentResume?.personalInfo?.linkedin || ""}
                        onChange={(e) => updatePersonalInfo({ linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/username"
                        className="h-8 text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Portfolio / Personal Website</Label>
                      <Input
                        value={currentResume?.personalInfo?.website || ""}
                        onChange={(e) => updatePersonalInfo({ website: e.target.value })}
                        placeholder="https://mywebsite.com"
                        className="h-8 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-Tab 3: Projects Editor */}
                {contentSubTab === "projects" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="font-bold text-foreground text-xs">Featured Projects &amp; Demos</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addProject({
                          title: "New Flagship Project",
                          description: "High performance full-stack application with real-time sync and modern UI.",
                          technologies: ["React", "TypeScript", "TailwindCSS"],
                        })}
                        className="h-6 text-[10px] gap-1 px-2 font-semibold text-primary"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Project</span>
                      </Button>
                    </div>

                    {(!currentResume?.projects || currentResume.projects.length === 0) ? (
                      <div className="p-4 text-center border border-dashed border-border rounded-xl text-muted-foreground space-y-2">
                        <p className="text-xs">No projects added yet.</p>
                        <Button
                          size="sm"
                          variant="radiant"
                          onClick={() => addProject({
                            title: "AI Intelligent System",
                            description: "Autonomous reasoning engine and distributed microservices architecture.",
                            technologies: ["Next.js", "Python", "PyTorch"],
                          })}
                          className="h-7 text-xs font-semibold"
                        >
                          + Add First Project
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentResume.projects.map((proj, idx) => (
                          <div key={proj.id || idx} className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">Project #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => deleteProject(proj.id)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <Input
                              value={proj.title || ""}
                              onChange={(e) => updateProject(proj.id, { title: e.target.value })}
                              placeholder="Project Title"
                              className="h-7 text-xs font-semibold"
                            />

                            <textarea
                              rows={2}
                              value={proj.description || ""}
                              onChange={(e) => updateProject(proj.id, { description: e.target.value })}
                              placeholder="Project Description & impact..."
                              className="w-full p-2 rounded-lg border border-border bg-card text-xs text-foreground resize-none"
                            />

                            <Input
                              value={(proj.technologies || []).join(", ")}
                              onChange={(e) => updateProject(proj.id, {
                                technologies: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })}
                              placeholder="Tech Stack (e.g. Next.js, Python, PostgreSQL)"
                              className="h-7 text-[11px] font-mono"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={proj.liveUrl || ""}
                                onChange={(e) => updateProject(proj.id, { liveUrl: e.target.value })}
                                placeholder="Live Demo URL"
                                className="h-7 text-[11px] font-mono"
                              />
                              <Input
                                value={proj.githubUrl || ""}
                                onChange={(e) => updateProject(proj.id, { githubUrl: e.target.value })}
                                placeholder="GitHub Repo URL"
                                className="h-7 text-[11px] font-mono"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 4: Skills Editor */}
                {contentSubTab === "skills" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="font-bold text-foreground text-xs">Technical Competencies</span>
                      <span className="text-[10px] text-muted-foreground font-mono">{currentResume?.skills?.length || 0} skills</span>
                    </div>

                    <div className="flex gap-1.5">
                      <Input
                        id="newSkillInput"
                        placeholder="Add skill (e.g. TypeScript, PyTorch, Docker)..."
                        className="h-8 text-xs"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (e.currentTarget.value || "").trim();
                            if (val) {
                              addSkill({ name: val, level: "Advanced" });
                              e.currentTarget.value = "";
                            }
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="radiant"
                        onClick={() => {
                          const input = document.getElementById("newSkillInput") as HTMLInputElement;
                          if (input && input.value.trim()) {
                            addSkill({ name: input.value.trim(), level: "Advanced" });
                            input.value = "";
                          }
                        }}
                        className="h-8 text-xs font-semibold px-3 shrink-0"
                      >
                        + Add
                      </Button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-card/40 min-h-[80px]">
                      {(!currentResume?.skills || currentResume.skills.length === 0) ? (
                        <p className="text-xs text-muted-foreground m-auto py-2">No skills yet. Type a skill and press Enter.</p>
                      ) : (
                        currentResume.skills.map((s, idx) => (
                          <span
                            key={s.id || idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-foreground text-xs font-medium border border-border"
                          >
                            <span>{s.name}</span>
                            <button
                              type="button"
                              onClick={() => deleteSkill(s.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              &times;
                            </button>
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Sub-Tab 5: Experience Editor */}
                {contentSubTab === "experience" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="font-bold text-foreground text-xs">Career &amp; Leadership History</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addExperience({
                          company: "Tech Company",
                          position: "Senior Software Engineer",
                          startDate: "2023",
                          endDate: "Present",
                          description: "Architected scalable cloud backend systems and full-stack web applications.",
                        })}
                        className="h-6 text-[10px] gap-1 px-2 font-semibold text-primary"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Experience</span>
                      </Button>
                    </div>

                    {(!currentResume?.experience || currentResume.experience.length === 0) ? (
                      <div className="p-4 text-center border border-dashed border-border rounded-xl text-muted-foreground space-y-2">
                        <p className="text-xs">No career experience listed.</p>
                        <Button
                          size="sm"
                          variant="radiant"
                          onClick={() => addExperience({
                            company: "Innovate Labs",
                            position: "Full Stack Engineer",
                            startDate: "2023",
                            endDate: "Present",
                            description: "Built scalable web applications and AI APIs.",
                          })}
                          className="h-7 text-xs font-semibold"
                        >
                          + Add Experience
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentResume.experience.map((exp, idx) => (
                          <div key={exp.id || idx} className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">Role #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => deleteExperience(exp.id)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={exp.position || ""}
                                onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                                placeholder="Position Title"
                                className="h-7 text-xs font-semibold"
                              />
                              <Input
                                value={exp.company || ""}
                                onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                                placeholder="Company / Organization"
                                className="h-7 text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={exp.startDate || ""}
                                onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                                placeholder="Start Date (e.g. 2022)"
                                className="h-7 text-[11px]"
                              />
                              <Input
                                value={exp.endDate || ""}
                                onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                                placeholder="End Date (or Present)"
                                className="h-7 text-[11px]"
                              />
                            </div>

                            <textarea
                              rows={2}
                              value={exp.description || ""}
                              onChange={(e) => updateExperience(exp.id, { description: e.target.value })}
                              placeholder="Role summary and impact..."
                              className="w-full p-2 rounded-lg border border-border bg-card text-xs text-foreground resize-none"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-Tab 6: Education Editor */}
                {contentSubTab === "education" && (
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between pb-1 border-b border-border">
                      <span className="font-bold text-foreground text-xs">Education &amp; Degrees</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addEducation({
                          institution: "University / Institute",
                          degree: "Bachelor of Technology",
                          fieldOfStudy: "Computer Science & Engineering",
                          startDate: "2021",
                          endDate: "2025",
                          gpa: "3.9 / 4.0",
                        })}
                        className="h-6 text-[10px] gap-1 px-2 font-semibold text-primary"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Degree</span>
                      </Button>
                    </div>

                    {(!currentResume?.education || currentResume.education.length === 0) ? (
                      <div className="p-4 text-center border border-dashed border-border rounded-xl text-muted-foreground space-y-2">
                        <p className="text-xs">No education degrees listed.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentResume.education.map((edu, idx) => (
                          <div key={edu.id || idx} className="p-3 rounded-xl border border-border bg-card/60 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-foreground">Degree #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => deleteEducation(edu.id)}
                                className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <Input
                              value={edu.institution || ""}
                              onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                              placeholder="University / College"
                              className="h-7 text-xs font-semibold"
                            />

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={edu.degree || ""}
                                onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                placeholder="Degree (e.g. B.Tech)"
                                className="h-7 text-xs"
                              />
                              <Input
                                value={edu.fieldOfStudy || ""}
                                onChange={(e) => updateEducation(edu.id, { fieldOfStudy: e.target.value })}
                                placeholder="Major / Field"
                                className="h-7 text-xs"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Input
                                value={edu.startDate || ""}
                                onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                placeholder="Start Year"
                                className="h-7 text-[11px]"
                              />
                              <Input
                                value={edu.endDate || ""}
                                onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                placeholder="End Year"
                                className="h-7 text-[11px]"
                              />
                            </div>

                            <Input
                              value={edu.gpa || ""}
                              onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                              placeholder="GPA / Score (e.g. 9.19 / 10)"
                              className="h-7 text-[11px]"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Section Visibility Manager */}
            {activeTab === "sections" && (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-bold text-foreground text-xs">Visible Sections</span>
                  <span className="text-[10px] text-muted-foreground font-mono">Live Toggle</span>
                </div>

                {SECTIONS_LIST.map((sec) => {
                  const isVisible = customization.sectionVisibility?.[sec.id] !== false;
                  return (
                    <div
                      key={sec.id}
                      onClick={() => toggleSection(sec.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isVisible
                          ? "bg-secondary/40 border-border text-foreground"
                          : "bg-card/40 border-border/50 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <span className="font-bold text-xs block">{sec.label}</span>
                        <span className="text-[10px] text-muted-foreground block">{sec.desc}</span>
                      </div>
                      <div className={`w-8 h-4 rounded-full transition-colors flex items-center p-0.5 ${
                        isVisible ? "bg-primary justify-end" : "bg-muted justify-start"
                      }`}>
                        <div className="w-3 h-3 rounded-full bg-white shadow-xs" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB 4: Vercel Token & Account Link */}
            {activeTab === "vercel" && (
              <div className="space-y-4 p-1 text-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] font-semibold">Vercel Access Token</Label>
                    <a
                      href="https://vercel.com/account/tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-primary hover:underline flex items-center gap-1"
                    >
                      <span>Get Token</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <Input
                    type="password"
                    value={vercelToken}
                    onChange={(e) => setVercelToken(e.target.value)}
                    placeholder="vercel_tok_..."
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => validateToken()}
                  disabled={isValidatingToken}
                  className="w-full h-8 text-xs font-bold gap-1.5"
                >
                  <Key className={`w-3.5 h-3.5 ${isValidatingToken ? "animate-spin" : ""}`} />
                  <span>{isValidatingToken ? "Validating..." : "Validate Token & Account"}</span>
                </Button>

                {validatedUser ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">Connected to Vercel</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Deploying to user <strong className="text-foreground">@{validatedUser.username}</strong> ({validatedUser.email})
                    </p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-secondary/40 border border-border text-[11px] text-muted-foreground leading-relaxed">
                    Enter your personal Vercel access token to deploy portfolios directly to your Vercel project with automatic edge CDN & SSL.
                  </div>
                )}

                <div className="space-y-1.5 pt-2 border-t border-border">
                  <Label className="text-[11px] font-semibold">Vercel Project Name</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    placeholder="my-portfolio"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB 5: Real-Time Build Logs */}
            {activeTab === "logs" && (
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-muted-foreground block">
                  Vercel Edge Deployment Pipeline
                </span>
                <BuildLogsTerminal logs={logs} isDeploying={isDeploying} />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Interactive Preview Canvas (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card shadow-2xs text-xs">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="font-mono text-[11px] text-muted-foreground px-2 py-0.5 rounded bg-secondary flex items-center gap-1">
                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                <span>{deploymentResult?.url || `https://${projectName || "portfolio"}.vercel.app`}</span>
              </span>
            </div>

            <span className="text-[11px] font-semibold text-muted-foreground uppercase font-mono">
              Live Preview: {selectedTemplate}
            </span>
          </div>

          {/* Scaled Preview Canvas */}
          <div className="rounded-2xl border border-border overflow-hidden bg-background shadow-xs h-[740px] overflow-y-auto">
            {currentResume && (
              <PortfolioView
                key={`${selectedResumeId}-${selectedTemplate}-${JSON.stringify(customization)}-${currentResume.updatedAt || ''}`}
                resume={currentResume}
                initialTheme={selectedTemplate}
                customization={customization}
                onThemeChange={(newTheme) => setSelectedTemplate(newTheme as PortfolioTemplateId)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Portfolio Ingestion Modal */}
      <PortfolioImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onExtractionSuccess={(data) => {
          setImportedPortfolioData(data);
          setIsImportReviewOpen(true);
        }}
      />

      {/* Portfolio Extraction Review Modal */}
      <PortfolioExtractionReviewModal
        open={isImportReviewOpen}
        onOpenChange={setIsImportReviewOpen}
        data={importedPortfolioData}
      />

      {/* Conflict Resolution Modal */}
      <ConflictResolutionModal />

      {/* Sync Command Center Dashboard Modal */}
      <SyncDashboardModal onManualSyncTrigger={handleTriggerSync} />
    </div>
  );
}
