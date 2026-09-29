"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import {
  ProfileCompletenessReport,
  CareerInsightsReport,
  IdentityFieldConflict,
  IdentitySyncHistoryEntry,
  IdentityPlatform,
} from "@/types/unified-identity";
import {
  computeProfileCompleteness,
  generateCareerInsights,
  detectIdentityConflicts,
} from "@/lib/integrations/linkedin/identity-engine";
import { ParsedLinkedInProfile } from "@/lib/integrations/linkedin/linkedin-parser";
import { LinkedInImportModal } from "./LinkedInImportModal";
import { LinkedinIcon } from "@/components/shared/icons";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Globe,
  ArrowRight,
  ArrowLeftRight,
  TrendingUp,
  ShieldCheck,
  Award,
  Layers,
  BrainCircuit,
  History,
  Check,
  ChevronRight,
  Download,
  Upload,
  Briefcase,
  GraduationCap,
  Code2,
  User,
  Sliders,
  XCircle,
} from "lucide-react";

export function LinkedInIdentityHub() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const importResume = useResumeStore((state) => state.importResume);
  const activeResume = resumes.find((r) => r.id === activeResumeId) || resumes[0] || null;

  const [activeTab, setActiveTab] = useState<"sync" | "completeness" | "insights" | "history">("sync");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Stored LinkedIn profile in localStorage or default
  const [linkedinProfile, setLinkedinProfile] = useState<ParsedLinkedInProfile | null>(null);
  const [syncHistory, setSyncHistory] = useState<IdentitySyncHistoryEntry[]>([]);
  const [conflicts, setConflicts] = useState<IdentityFieldConflict[]>([]);
  const [resolutions, setResolutions] = useState<Record<string, IdentityPlatform | "merge">>({});

  // Real-time completeness and insights
  const [completeness, setCompleteness] = useState<ProfileCompletenessReport>(
    computeProfileCompleteness(null, activeResume)
  );
  const [careerInsights, setCareerInsights] = useState<CareerInsightsReport>(
    generateCareerInsights(null, activeResume)
  );

  // Load from local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const storedLi = localStorage.getItem("novus_linkedin_profile");
        if (storedLi) {
          const parsed = JSON.parse(storedLi);
          setLinkedinProfile(parsed);
          setCompleteness(computeProfileCompleteness(parsed, activeResume));
          setCareerInsights(generateCareerInsights(parsed, activeResume));
          setConflicts(detectIdentityConflicts(parsed, activeResume));
        }

        const storedHistory = localStorage.getItem("novus_linkedin_sync_history");
        if (storedHistory) {
          setSyncHistory(JSON.parse(storedHistory));
        }
      } catch {}
    }
  }, [activeResume]);

  // Execute 3-Way Sync
  const handleExecuteSync = async (source: IdentityPlatform = "linkedin", target: IdentityPlatform | "all" = "all") => {
    setIsSyncing(true);

    try {
      const res = await fetch("/api/linkedin/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          target,
          linkedinProfile,
          resume: activeResume,
          resolutions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to execute synchronization.");

      // Update local state
      setLinkedinProfile(data.updatedLinkedIn);
      if (typeof window !== "undefined") {
        localStorage.setItem("novus_linkedin_profile", JSON.stringify(data.updatedLinkedIn));
      }

      if (data.updatedResume) {
        importResume(data.updatedResume);
      }

      setCompleteness(data.completeness);
      setCareerInsights(data.careerInsights);
      setConflicts(data.conflicts || []);
      setResolutions({});

      const newHistory = [data.historyEntry, ...syncHistory].slice(0, 20);
      setSyncHistory(newHistory);
      if (typeof window !== "undefined") {
        localStorage.setItem("novus_linkedin_sync_history", JSON.stringify(newHistory));
      }

      success(`Successfully synchronized ${source.toUpperCase()} ↔ Resume ↔ Portfolio!`);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to complete synchronization.");
    } finally {
      setIsSyncing(false);
    }
  };

  const candidateName = linkedinProfile?.fullName || activeResume?.personalInfo?.fullName || "Candidate";
  const candidateHeadline = linkedinProfile?.jobTitle || activeResume?.personalInfo?.jobTitle || "Software Engineer";

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-gradient-to-br from-card via-card to-blue-500/5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20 flex items-center justify-center shrink-0 shadow-sm">
            <LinkedinIcon className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30 text-[10px] font-mono font-bold">
                <ShieldCheck className="w-3 h-3" />
                <span>UNIFIED PROFESSIONAL IDENTITY SYSTEM</span>
              </span>
              {linkedinProfile && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                  ● Verified LinkedIn Profile
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-foreground">{candidateName}</h1>
            <p className="text-xs text-muted-foreground">{candidateHeadline}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsImportModalOpen(true)}
            className="h-9 px-4 text-xs font-bold gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Profile</span>
          </Button>

          <Button
            size="sm"
            variant="radiant"
            onClick={() => handleExecuteSync("linkedin", "all")}
            disabled={isSyncing}
            className="h-9 px-5 text-xs font-black gap-2 shadow-md uppercase tracking-wider"
          >
            <ArrowLeftRight className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Synchronizing..." : "Sync All (3-Way)"}</span>
          </Button>
        </div>
      </div>

      {/* 2. Primary Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-border/80 pb-2 overflow-x-auto">
        {[
          { id: "sync", label: "3-Way Sync Matrix", icon: ArrowLeftRight },
          { id: "completeness", label: `Completeness (${completeness.overallScore}%)`, icon: ShieldCheck },
          { id: "insights", label: `Career Insights (${careerInsights.recruiterDiscoverabilityScore}%)`, icon: TrendingUp },
          { id: "history", label: `Sync History (${syncHistory.length})`, icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 3. TAB 1: 3-Way Synchronization Matrix & Conflict Resolution */}
      {activeTab === "sync" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Visual 3-Pillar Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Pillar 1: LinkedIn */}
            <div className="p-5 rounded-3xl border border-blue-500/30 bg-blue-500/5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LinkedinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span className="font-bold text-xs text-foreground">LinkedIn Source</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold">
                  {linkedinProfile?.experience?.length || 0} Roles
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Source of truth for headline, bio endorsements, and verified career timeline.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExecuteSync("linkedin", "all")}
                  disabled={isSyncing}
                  className="w-full h-8 text-[11px] font-bold gap-1 text-blue-600 dark:text-blue-400"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Push to Resume & Portfolio</span>
                </Button>
              </div>
            </div>

            {/* Pillar 2: Resume */}
            <div className="p-5 rounded-3xl border border-primary/30 bg-primary/5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span className="font-bold text-xs text-foreground">Active Resume</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-mono text-[10px] font-bold">
                  {activeResume?.skills?.length || 0} Skills
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                ATS-optimized bullet points, tailored metrics, and project accomplishments.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExecuteSync("resume", "all")}
                  disabled={isSyncing}
                  className="w-full h-8 text-[11px] font-bold gap-1 text-primary"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Push to LinkedIn & Portfolio</span>
                </Button>
              </div>
            </div>

            {/* Pillar 3: Portfolio */}
            <div className="p-5 rounded-3xl border border-purple-500/30 bg-purple-500/5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="font-bold text-xs text-foreground">Live Portfolio</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold">
                  {activeResume?.projects?.length || 0} Projects
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deployable personal website with live code demo links and GitHub repositories.
              </p>
              <div className="pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleExecuteSync("portfolio", "all")}
                  disabled={isSyncing}
                  className="w-full h-8 text-[11px] font-bold gap-1 text-purple-600 dark:text-purple-400"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Push to LinkedIn & Resume</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Active Conflict Resolution Screen */}
          {conflicts.length > 0 && (
            <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-sm text-foreground">
                    {conflicts.length} Field Conflict{conflicts.length > 1 ? "s" : ""} Detected
                  </h3>
                </div>
                <span className="text-xs font-mono text-muted-foreground">Select resolution preference</span>
              </div>

              <div className="space-y-3">
                {conflicts.map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl bg-card border border-border space-y-2 text-xs">
                    <span className="font-bold text-foreground block">{c.label}</span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          (resolutions[c.id] || c.selectedResolution) === "linkedin"
                            ? "bg-blue-500/10 border-blue-500 text-foreground ring-1 ring-blue-500/30"
                            : "bg-secondary/30 border-border text-muted-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name={c.id}
                          checked={(resolutions[c.id] || c.selectedResolution) === "linkedin"}
                          onChange={() => setResolutions({ ...resolutions, [c.id]: "linkedin" })}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-[10px] uppercase font-mono text-blue-600 dark:text-blue-400 block">
                            LinkedIn Value
                          </span>
                          <span className="text-xs text-foreground">{c.linkedinValue}</span>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                          resolutions[c.id] === "resume"
                            ? "bg-primary/10 border-primary text-foreground ring-1 ring-primary/30"
                            : "bg-secondary/30 border-border text-muted-foreground"
                        }`}
                      >
                        <input
                          type="radio"
                          name={c.id}
                          checked={resolutions[c.id] === "resume"}
                          onChange={() => setResolutions({ ...resolutions, [c.id]: "resume" })}
                          className="mt-0.5"
                        />
                        <div>
                          <span className="font-bold text-[10px] uppercase font-mono text-primary block">
                            Resume Value
                          </span>
                          <span className="text-xs text-foreground">{c.resumeValue}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                size="sm"
                variant="radiant"
                onClick={() => handleExecuteSync("linkedin", "all")}
                disabled={isSyncing}
                className="h-9 px-6 text-xs font-bold gap-2"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply Resolutions & Re-Sync</span>
              </Button>
            </div>
          )}

          {/* Section Alignment Table */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Section Synchronization Status</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: "Headline & Title", status: "Synced", icon: Briefcase, count: candidateHeadline },
                { title: "About & Bio", status: "Synced", icon: User, count: `${completeness.sections.about.score}%` },
                { title: "Skills Stack", status: "Synced", icon: Code2, count: `${activeResume?.skills?.length || 0} skills` },
                { title: "Experience Timeline", status: "Synced", icon: History, count: `${activeResume?.experience?.length || 0} roles` },
                { title: "Education", status: "Synced", icon: GraduationCap, count: `${activeResume?.education?.length || 0} degrees` },
                { title: "Certifications", status: "Synced", icon: Award, count: `${activeResume?.certifications?.length || 0} certs` },
                { title: "Portfolio Projects", status: "Synced", icon: Globe, count: `${activeResume?.projects?.length || 0} projects` },
                { title: "Contact Details", status: "Synced", icon: ShieldCheck, count: "Verified" },
              ].map((s, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <s.icon className="w-3.5 h-3.5 text-primary" />
                      {s.title}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      ● {s.status}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground truncate block">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: Profile Completeness & Missing Sections */}
      {activeTab === "completeness" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Score Hero Card */}
          <div className="p-6 sm:p-8 rounded-3xl border border-border bg-gradient-to-br from-card to-primary/5 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-xs font-bold border border-primary/20 inline-block">
                {completeness.tier}
              </span>
              <h2 className="text-2xl font-black text-foreground">Unified Profile Health Score</h2>
              <p className="text-xs text-muted-foreground max-w-md leading-relaxed">
                Calculated across 8 weighted sections. Higher scores maximize recruiter InMail discovery and pass high-bar ATS screening.
              </p>
            </div>

            <div className="w-32 h-32 rounded-3xl bg-primary/10 border-2 border-primary/30 flex flex-col items-center justify-center font-mono shadow-inner">
              <span className="text-4xl font-black text-primary">{completeness.overallScore}%</span>
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Completeness</span>
            </div>
          </div>

          {/* Missing Sections & Critical Fixes Card */}
          {completeness.criticalFixes.length > 0 && (
            <div className="p-5 rounded-3xl border border-amber-500/30 bg-amber-500/5 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Priority Action Items ({completeness.criticalFixes.length} Recommendations)
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {completeness.criticalFixes.map((fix, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-card border border-border flex items-start gap-2 text-xs text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{fix}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8-Section Breakdown Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.entries(completeness.sections).map(([key, sec]) => (
              <div key={key} className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{sec.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                      sec.status === "complete"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                        : sec.status === "partial"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                        : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                    }`}
                  >
                    {sec.score}% • {sec.status.toUpperCase()}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sec.score >= 80 ? "bg-emerald-500" : sec.score >= 50 ? "bg-amber-500" : "bg-rose-500"
                    }`}
                    style={{ width: `${sec.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{sec.recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. TAB 3: Career Insights & Market Readiness */}
      {activeTab === "insights" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Seniority & Discoverability 3-Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Recruiter InMail Visibility</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono text-primary">
                  {careerInsights.recruiterDiscoverabilityScore}%
                </span>
                <span className="text-xs text-emerald-500 font-bold">Top 8%</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Search keyword index match rate</p>
            </div>

            <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Seniority Benchmark</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-foreground">
                  {careerInsights.seniorityLevel}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">Calibrated against Silicon Valley bar</p>
            </div>

            <div className="p-5 rounded-3xl border border-border bg-card shadow-2xs space-y-1">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">Market Alignment Index</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black font-mono text-purple-500">
                  {careerInsights.marketAlignmentScore}%
                </span>
                <span className="text-xs text-muted-foreground">Tier 1</span>
              </div>
              <p className="text-[11px] text-muted-foreground">High-demand tech stack alignment</p>
            </div>
          </div>

          {/* High-Value Keyword Cloud */}
          <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span>Recruiter Search Keyword Saturation</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {careerInsights.topKeywords.map((k, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-border flex items-center gap-2 text-xs font-semibold text-foreground"
                >
                  <span>{k.keyword}</span>
                  <span className="px-1.5 py-0.2 rounded-md bg-primary/10 text-primary font-mono text-[10px]">
                    {k.density}x
                  </span>
                </div>
              ))}
            </div>

            {careerInsights.missingHighValueKeywords.length > 0 && (
              <div className="pt-3 border-t border-border/60 space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold text-muted-foreground block">
                  Recommended High-Demand Keywords to Add:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {careerInsights.missingHighValueKeywords.map((k, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-secondary/30 border border-dashed border-border text-muted-foreground text-xs"
                    >
                      + {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Deep Insight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {careerInsights.metrics.map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl border border-border bg-secondary/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">{m.title}</span>
                  <span className="font-mono font-bold text-primary">{m.score}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{m.insight}</p>
                <div className="pt-1 border-t border-border/60 text-[10px] text-primary font-medium">
                  💡 {m.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. TAB 4: Synchronization Audit History */}
      {activeTab === "history" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>Synchronization Audit History Log</span>
              </h3>
              <span className="text-xs font-mono text-muted-foreground">Immutable audit trail</span>
            </div>

            {syncHistory.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground text-xs space-y-2">
                <History className="w-8 h-8 mx-auto text-muted-foreground/40" />
                <p>No synchronization history recorded yet. Click &ldquo;Sync All&rdquo; above to run your first 3-way sync.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {syncHistory.map((entry) => (
                  <div key={entry.id} className="p-3.5 rounded-2xl bg-secondary/30 border border-border space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-primary uppercase">
                        {entry.source.toUpperCase()} &rarr; {entry.target.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-foreground">{entry.summary}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {entry.fieldsChanged.map((f, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-card border border-border text-muted-foreground">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LinkedIn Import Modal */}
      <LinkedInImportModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        onSuccess={() => {
          handleExecuteSync("linkedin", "all");
        }}
      />
    </div>
  );
}
