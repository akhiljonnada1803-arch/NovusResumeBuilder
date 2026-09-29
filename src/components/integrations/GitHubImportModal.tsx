"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GithubIcon } from "@/components/shared/icons";
import { RepositoryItem, ContributionStats, ExtractedProject, ExtractedSkill } from "@/lib/integrations/types";
import {
  Search,
  Star,
  GitFork,
  Check,
  ExternalLink,
  Sparkles,
  Loader2,
  RefreshCw,
  FolderGit2,
  Code2,
  SlidersHorizontal,
  Plus,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  ShieldCheck,
  Flame,
  Globe,
  FileText,
  Activity,
  Layers,
  Terminal,
} from "lucide-react";

interface GitHubImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultUsername?: string;
  initialTab?: "repos" | "skills" | "profile";
}

export function GitHubImportModal({
  open,
  onOpenChange,
  defaultUsername,
  initialTab = "repos",
}: GitHubImportModalProps) {
  const { success, error: showErrorToast } = useToast();
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addProject = useResumeStore((state) => state.addProject);
  const addSkill = useResumeStore((state) => state.addSkill);
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);

  const [username, setUsername] = useState(
    defaultUsername ||
      activeResume.personalInfo?.github?.replace(/^https?:\/\/github\.com\//, "") ||
      ""
  );
  const [token, setToken] = useState("");
  const [showTokenInput, setShowTokenInput] = useState(false);

  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [repos, setRepos] = useState<RepositoryItem[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [userInfo, setUserInfo] = useState<any | null>(null);

  const [activeTab, setActiveTab] = useState<"repos" | "skills" | "profile">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [minQualityScore, setMinQualityScore] = useState<number>(0);

  const [analyzingRepoId, setAnalyzingRepoId] = useState<string | number | null>(null);
  const [analyzedProject, setAnalyzedProject] = useState<ExtractedProject | null>(null);
  const [activeAnalysisRepo, setActiveAnalysisRepo] = useState<RepositoryItem | null>(null);
  const [projectPreviewMode, setProjectPreviewMode] = useState<"resume" | "portfolio">("resume");

  const [isExtractingSkills, setIsExtractingSkills] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState<ExtractedSkill[]>([]);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  // Fetch repositories
  const handleFetchRepos = async () => {
    if (!username.trim()) {
      showErrorToast("Please enter a GitHub username.");
      return;
    }

    setIsLoadingRepos(true);
    setAnalyzedProject(null);
    setExtractedSkills([]);

    try {
      const response = await fetch("/api/integrations/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          token: token.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch repositories.");

      setRepos(data.repos || []);
      setStats(data.stats || null);
      setUserInfo(data.user || null);

      updatePersonalInfo({
        github: `https://github.com/${username.trim()}`,
      });

      success(`Fetched ${data.repos.length} repositories for ${username}!`);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to connect to GitHub.");
    } finally {
      setIsLoadingRepos(false);
    }
  };

  // 1-Click Auto-Sync
  const handleAutoSyncAll = async () => {
    if (!username.trim()) return;
    setIsSyncingAll(true);

    try {
      const res = await fetch("/api/integrations/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          token: token.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to sync GitHub.");

      // Sync projects
      (data.projects || []).forEach((proj: ExtractedProject) => {
        addProject({
          title: proj.title,
          subtitle: proj.subtitle,
          description: proj.resumeDescription || proj.description,
          technologies: proj.technologies,
          githubUrl: proj.githubUrl,
          liveUrl: proj.liveUrl,
        });
      });

      // Sync skills
      (data.skills || []).forEach((sk: ExtractedSkill) => {
        addSkill({
          name: sk.name,
          category: sk.category as any,
          level: sk.proficiency as any,
        });
      });

      setStats(data.stats);
      setExtractedSkills(data.skills);
      success("Auto-synced top projects & 5-tier skills into active resume!");
    } catch (err: any) {
      showErrorToast(err.message || "Auto-sync failed.");
    } finally {
      setIsSyncingAll(false);
    }
  };

  // AI Project Analysis
  const handleAnalyzeRepo = async (repo: RepositoryItem) => {
    setAnalyzingRepoId(repo.id);
    setActiveAnalysisRepo(repo);

    try {
      const response = await fetch("/api/integrations/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          token: token.trim() || undefined,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to analyze repository.");

      setAnalyzedProject(data.project);
      success(`Generated AI descriptions for ${repo.name}!`);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to analyze repository.");
    } finally {
      setAnalyzingRepoId(null);
    }
  };

  // Extract 5-tier skills
  const handleExtractSkills = async () => {
    if (repos.length === 0) return;
    setIsExtractingSkills(true);

    try {
      const response = await fetch("/api/integrations/github/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repos }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to extract skills.");

      const skillsList = Array.isArray(data.skills) ? data.skills : [];
      setExtractedSkills(skillsList);
      setActiveTab("skills");
      success(`Extracted ${skillsList.length} technical skills!`);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to extract skills.");
    } finally {
      setIsExtractingSkills(false);
    }
  };

  const handleAddAnalyzedProjectToResume = () => {
    if (!analyzedProject) return;

    addProject({
      title: analyzedProject.title,
      subtitle: analyzedProject.subtitle,
      description:
        projectPreviewMode === "resume"
          ? analyzedProject.resumeDescription || analyzedProject.description
          : analyzedProject.portfolioDescription || analyzedProject.description,
      technologies: analyzedProject.technologies,
      githubUrl: analyzedProject.githubUrl,
      liveUrl: analyzedProject.liveUrl,
    });

    success(`Added "${analyzedProject.title}" to your resume!`);
    setAnalyzedProject(null);
  };

  const handleAddAllSkillsToResume = () => {
    if (extractedSkills.length === 0) return;

    extractedSkills.forEach((skill) => {
      addSkill({
        name: skill.name,
        category: skill.category as any,
        level: skill.proficiency as any,
      });
    });

    success(`Added ${extractedSkills.length} skills to your resume!`);
  };

  // Filter repositories
  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLang =
      selectedLanguage === "all" ||
      (r.primaryLanguage && r.primaryLanguage.toLowerCase() === selectedLanguage.toLowerCase());
    const matchesQuality = r.qualityScore >= minQualityScore;

    return matchesSearch && matchesLang && matchesQuality;
  });

  const allLanguages = Array.from(
    new Set(repos.map((r) => r.primaryLanguage).filter(Boolean) as string[])
  );

  const devScores = stats?.developerScores;

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="4xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <GithubIcon className="w-5 h-5 text-foreground" />
          <DialogTitle>GitHub Developer Profile & Project Engine</DialogTitle>
        </div>
        <DialogDescription>
          Analyze repositories, calculate 3D developer benchmarks, extract 5-tier skills, and auto-sync into resumes and portfolios.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {/* Username Connect Form */}
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="flex-1 w-full">
              <Input
                placeholder="Enter GitHub username (e.g. torvalds, vercel, shadcn)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                leftIcon={<GithubIcon className="w-4 h-4" />}
                className="h-8.5 text-xs"
                onKeyDown={(e) => e.key === "Enter" && handleFetchRepos()}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="h-8.5 text-xs font-semibold gap-1.5 shadow-2xs w-full sm:w-auto"
                onClick={handleFetchRepos}
                disabled={isLoadingRepos}
              >
                {isLoadingRepos ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Fetching Repos...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Analyze Profile
                  </>
                )}
              </Button>

              {repos.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8.5 text-xs font-semibold gap-1.5 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                  onClick={handleAutoSyncAll}
                  disabled={isSyncingAll}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? "animate-spin" : ""}`} />
                  <span>Auto-Sync</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <button
              type="button"
              onClick={() => setShowTokenInput(!showTokenInput)}
              className="text-primary hover:underline"
            >
              {showTokenInput ? "Hide Personal Access Token" : "+ Add GitHub Token for Private Repos & High Rate Limits"}
            </button>
          </div>

          {showTokenInput && (
            <div className="pt-2 border-t border-border/60">
              <Label className="text-[11px]">GitHub Personal Access Token (Optional)</Label>
              <Input
                type="password"
                placeholder="ghp_xxxxxxxxxxxx"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-7.5 text-xs font-mono"
              />
            </div>
          )}
        </div>

        {/* 3D Developer Score Matrix Banner */}
        {devScores && (
          <div className="p-4 rounded-xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 shadow-2xs space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-xs text-foreground">GitHub Developer Score Matrix</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {devScores.tier}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Overall Rating</span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {devScores.compositeScore}/100
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Project Quality</span>
                <span className="text-base font-bold font-mono text-blue-600 dark:text-blue-400">
                  {devScores.projectQualityScore}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Open Source</span>
                <span className="text-base font-bold font-mono text-purple-600 dark:text-purple-400">
                  {devScores.openSourceScore}%
                </span>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">Activity Score</span>
                <span className="text-base font-bold font-mono text-amber-600 dark:text-amber-400">
                  {devScores.activityScore}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        {repos.length > 0 && (
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <div className="flex items-center gap-1.5 bg-secondary/50 p-0.5 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setActiveTab("repos")}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === "repos"
                    ? "bg-card text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Repositories ({repos.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  if (extractedSkills.length === 0) handleExtractSkills();
                  else setActiveTab("skills");
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === "skills"
                    ? "bg-card text-foreground shadow-2xs border border-border/60"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                5-Tier Skills ({extractedSkills.length})
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Repositories List */}
        {activeTab === "repos" && repos.length > 0 && (
          <div className="space-y-3">
            {/* Search & Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
              <div className="sm:col-span-6">
                <Input
                  placeholder="Filter repositories by name or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                  className="h-8 text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
                >
                  <option value="all">All Languages</option>
                  {allLanguages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={minQualityScore}
                  onChange={(e) => setMinQualityScore(Number(e.target.value))}
                  className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
                >
                  <option value={0}>All Quality Scores</option>
                  <option value={60}>Score &gt; 60%</option>
                  <option value={75}>Score &gt; 75% (Top Tier)</option>
                  <option value={85}>Score &gt; 85% (Showcase)</option>
                </select>
              </div>
            </div>

            {/* Repositories Cards */}
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  className="p-3.5 rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-700 transition-colors shadow-2xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-foreground truncate">
                          {repo.name}
                        </span>
                        {repo.primaryLanguage && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border">
                            {repo.primaryLanguage}
                          </span>
                        )}
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                          Quality: {repo.qualityScore}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {repo.description || "No description provided."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      variant="radiant"
                      className="h-7 text-xs font-semibold gap-1 shrink-0 shadow-2xs"
                      onClick={() => handleAnalyzeRepo(repo)}
                      disabled={analyzingRepoId === repo.id}
                    >
                      {analyzingRepoId === repo.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3" />
                          AI Generate
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500" /> {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" /> {repo.forks}
                      </span>
                    </div>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-foreground text-primary font-medium"
                    >
                      <span>View GitHub</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: 5-Tier Extracted Skills */}
        {activeTab === "skills" && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">
                Auto-Extracted Technical Skills ({extractedSkills.length})
              </span>
              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="h-7 text-xs gap-1 font-semibold"
                onClick={handleAddAllSkillsToResume}
              >
                <Plus className="w-3.5 h-3.5" />
                Add All to Resume
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
              {(Array.isArray(extractedSkills) ? extractedSkills : []).map((sk, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-card shadow-2xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{sk.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary border border-border text-muted-foreground">
                      {sk.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{sk.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analyzed Project Detail Modal / Preview */}
        {analyzedProject && (
          <div className="p-4 rounded-xl border border-primary/40 bg-card shadow-lg space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-xs text-foreground">
                  AI Generated Project: {analyzedProject.title}
                </h3>
              </div>

              {/* Format Toggle */}
              <div className="flex items-center bg-secondary p-0.5 rounded-lg border border-border text-[11px]">
                <button
                  type="button"
                  onClick={() => setProjectPreviewMode("resume")}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    projectPreviewMode === "resume" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  Resume Format
                </button>
                <button
                  type="button"
                  onClick={() => setProjectPreviewMode("portfolio")}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    projectPreviewMode === "portfolio" ? "bg-card text-foreground shadow-2xs" : "text-muted-foreground"
                  }`}
                >
                  Portfolio Format
                </button>
              </div>
            </div>

            <p className="text-xs text-foreground/90 leading-relaxed">
              {projectPreviewMode === "resume"
                ? analyzedProject.resumeDescription || analyzedProject.description
                : analyzedProject.portfolioDescription || analyzedProject.description}
            </p>

            {/* Bullet points */}
            {analyzedProject.highlights && (
              <ul className="space-y-1 pl-4 list-disc text-xs text-muted-foreground">
                {analyzedProject.highlights.map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div className="flex flex-wrap gap-1">
                {analyzedProject.technologies.map((t, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-foreground">
                    {t}
                  </span>
                ))}
              </div>

              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="h-7 text-xs font-semibold gap-1"
                onClick={handleAddAnalyzedProjectToResume}
              >
                <Plus className="w-3 h-3" />
                Add to Active Resume
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
