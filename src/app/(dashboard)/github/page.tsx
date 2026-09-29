"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RepositoryItem,
  ContributionStats,
  ExtractedProject,
  ExtractedSkill,
} from "@/lib/integrations/types";
import { GithubIcon } from "@/components/shared/icons";
import {
  Search,
  Star,
  GitFork,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  FolderGit2,
  FileText,
  Globe,
  ExternalLink,
  Code2,
  Check,
  Plus,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  Cpu,
} from "lucide-react";

export default function GitHubDashboardPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const activeResume = resumes.find((r) => r.id === activeResumeId) || resumes[0];
  const updateResume = useResumeStore((state) => state.updateResume);

  const [username, setUsername] = useState(
    activeResume?.personalInfo?.github
      ? activeResume.personalInfo.github.replace(/https?:\/\/github\.com\//, "").replace(/\//g, "")
      : "octocat"
  );
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [analyzingRepoId, setAnalyzingRepoId] = useState<string | number | null>(null);

  const [userProfile, setUserProfile] = useState<{
    login: string;
    name: string;
    avatarUrl: string;
    bio: string;
    publicRepos: number;
    followers: number;
  } | null>(null);

  const [repos, setRepos] = useState<RepositoryItem[]>([]);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [selectedRepoIds, setSelectedRepoIds] = useState<Set<string | number>>(new Set());
  const [projectSummaries, setProjectSummaries] = useState<Record<string, ExtractedProject>>({});

  // Initial Fetch if username exists
  const fetchGitHubData = async (userToFetch = username) => {
    if (!userToFetch.trim()) {
      showErrorToast("Please enter a valid GitHub username.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/integrations/github/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userToFetch.trim(),
          token: token.trim() || undefined,
          perPage: 50,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to load GitHub account data.");
      }

      setUserProfile(data.user);
      setRepos(data.repos || []);
      setStats(data.stats || null);

      // Pre-select top 3 quality repos
      if (data.repos && data.repos.length > 0) {
        const top3 = new Set<string | number>(data.repos.slice(0, 3).map((r: RepositoryItem) => r.id));
        setSelectedRepoIds(top3);
      }

      success(`Connected to @${data.user.login} (${data.repos.length} repositories loaded)`);
    } catch (e: any) {
      showErrorToast(e.message || "Error connecting to GitHub.");
    } finally {
      setLoading(false);
    }
  };

  // Generate AI Summary for single repo
  const handleAnalyzeRepo = async (repo: RepositoryItem) => {
    setAnalyzingRepoId(repo.id);
    try {
      const res = await fetch("/api/integrations/github/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner: userProfile?.login || username,
          repo: repo.name,
          repositoryData: repo,
          token: token.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.project) {
        setProjectSummaries((prev) => ({
          ...prev,
          [repo.id]: data.project,
        }));
        success(`Generated verified summary for ${repo.name}!`);
      }
    } catch (e: any) {
      showErrorToast("Failed to analyze repository.");
    } finally {
      setAnalyzingRepoId(null);
    }
  };

  // Auto-Import into Resume
  const handleImportToResume = () => {
    if (!activeResume) {
      showErrorToast("No active resume selected.");
      return;
    }

    const selectedRepos = repos.filter((r) => selectedRepoIds.has(r.id));
    if (selectedRepos.length === 0) {
      showErrorToast("Please select at least one repository to import.");
      return;
    }

    const newProjectItems = selectedRepos.map((r, idx) => {
      const summary = projectSummaries[r.id];
      return {
        id: `proj_gh_${Date.now()}_${idx}`,
        title: summary?.title || r.name.replace(/[-_]/g, " "),
        subtitle: summary?.subtitle || "Creator & Developer",
        githubUrl: r.url,
        liveUrl: r.homepageUrl || undefined,
        description: summary?.resumeDescription || summary?.description || r.description || "Open source software project.",
        technologies: summary?.technologies || (r.primaryLanguage ? [r.primaryLanguage, ...r.topics] : r.topics),
      };
    });

    // Merge without duplicates
    const existingTitles = new Set(activeResume.projects.map((p) => p.title.toLowerCase()));
    const filteredNew = newProjectItems.filter((p) => !existingTitles.has(p.title.toLowerCase()));

    updateResume(activeResume.id, {
      projects: [...activeResume.projects, ...filteredNew],
    });

    success(`Imported ${filteredNew.length} GitHub projects into "${activeResume.title}"!`);
  };

  // Auto-Import into Portfolio
  const handleImportToPortfolio = () => {
    if (!activeResume) {
      showErrorToast("No active resume found.");
      return;
    }

    const selectedRepos = repos.filter((r) => selectedRepoIds.has(r.id));
    if (selectedRepos.length === 0) {
      showErrorToast("Select repositories to import.");
      return;
    }

    const portfolioProjects = selectedRepos.map((r, idx) => {
      const summary = projectSummaries[r.id];
      return {
        id: `proj_port_${Date.now()}_${idx}`,
        title: summary?.title || r.name.replace(/[-_]/g, " "),
        subtitle: summary?.subtitle || "Lead Developer",
        githubUrl: r.url,
        liveUrl: r.homepageUrl || undefined,
        description: summary?.portfolioDescription || summary?.description || r.description || "Engineered scalable application.",
        technologies: summary?.technologies || (r.primaryLanguage ? [r.primaryLanguage, ...r.topics] : r.topics),
      };
    });

    updateResume(activeResume.id, {
      projects: [...activeResume.projects, ...portfolioProjects],
    });

    success(`Synced ${portfolioProjects.length} projects to Portfolio website!`);
  };

  const toggleRepoSelection = (id: string | number) => {
    const next = new Set(selectedRepoIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRepoIds(next);
  };

  // Filtered repositories
  const filteredRepos = repos.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLang =
      selectedLanguage === "all" || r.primaryLanguage?.toLowerCase() === selectedLanguage.toLowerCase();
    return matchesSearch && matchesLang;
  });

  const allLanguages = Array.from(
    new Set(repos.map((r) => r.primaryLanguage).filter(Boolean))
  ) as string[];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-2xs">
            <GithubIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              GitHub Developer Hub
            </h1>
            <p className="text-xs text-muted-foreground">
              Sync repositories, auto-generate verified project summaries from READMEs, and import into Resumes and Portfolios.
            </p>
          </div>
        </div>

        {/* Global Sync / Action Buttons */}
        <div className="flex items-center gap-2">
          {userProfile && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fetchGitHubData()}
                disabled={loading}
                className="h-8 text-xs gap-1.5 font-semibold"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>Refresh GitHub Data</span>
              </Button>

              <Button
                size="sm"
                variant="radiant"
                onClick={handleImportToResume}
                disabled={selectedRepoIds.size === 0}
                className="h-8 text-xs gap-1.5 font-bold shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Import to Resume ({selectedRepoIds.size})</span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Connect Bar */}
      <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchGitHubData();
          }}
          className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end text-xs"
        >
          <div className="sm:col-span-4 space-y-1">
            <Label className="text-[11px] font-semibold">GitHub Username or Organization</Label>
            <div className="flex items-center rounded-lg border border-border bg-secondary/30 focus-within:border-primary">
              <span className="px-2.5 text-muted-foreground font-mono text-xs">@</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. torvalds or octocat"
                className="w-full h-8 bg-transparent text-xs text-foreground font-mono focus:outline-hidden pr-2"
              />
            </div>
          </div>

          <div className="sm:col-span-5 space-y-1">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold">Personal Access Token (Optional)</Label>
              <span className="text-[10px] text-muted-foreground">Increases API rate limits</span>
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_... (optional)"
              className="w-full h-8 px-2.5 rounded-lg border border-border bg-secondary/30 text-xs font-mono text-foreground focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-3">
            <Button
              type="submit"
              size="sm"
              variant="radiant"
              disabled={loading}
              className="w-full h-8 text-xs font-bold gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Connecting..." : "Connect GitHub"}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* Connected Profile & Developer Score Matrix */}
      {userProfile && stats && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* User Profile Card (4 cols) */}
          <div className="md:col-span-4 p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
            <div className="flex items-start gap-3">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-14 h-14 rounded-2xl border-2 border-border shadow-xs object-cover"
              />
              <div className="min-w-0 space-y-0.5">
                <h3 className="font-bold text-sm text-foreground truncate">{userProfile.name}</h3>
                <span className="text-xs font-mono text-muted-foreground block">@{userProfile.login}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  <span>Synced</span>
                </span>
              </div>
            </div>

            {userProfile.bio && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {userProfile.bio}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-center text-xs">
              <div className="p-2 rounded-xl bg-secondary/40 space-y-0.5">
                <span className="text-[10px] text-muted-foreground">Repos</span>
                <span className="text-base font-bold text-foreground block font-mono">{userProfile.publicRepos}</span>
              </div>
              <div className="p-2 rounded-xl bg-secondary/40 space-y-0.5">
                <span className="text-[10px] text-muted-foreground">Stars</span>
                <span className="text-base font-bold text-amber-500 block font-mono">{stats.totalStars}</span>
              </div>
              <div className="p-2 rounded-xl bg-secondary/40 space-y-0.5">
                <span className="text-[10px] text-muted-foreground">Forks</span>
                <span className="text-base font-bold text-primary block font-mono">{stats.totalForks}</span>
              </div>
            </div>
          </div>

          {/* Velocity & Developer Tier Metrics (8 cols) */}
          <div className="md:col-span-8 p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                  3D Developer Benchmark
                </span>
                <h3 className="font-bold text-base text-foreground">
                  Tier: <span className="text-primary">{stats.developerScores?.tier || "Proficient Builder"}</span>
                </h3>
              </div>
              <span className="text-2xl font-black font-mono text-emerald-500">
                {stats.developerScores?.compositeScore || 85}/100
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Project Quality</span>
                  <span className="font-mono font-bold text-foreground">{stats.developerScores?.projectQualityScore || 80}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${stats.developerScores?.projectQualityScore || 80}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Open Source Impact</span>
                  <span className="font-mono font-bold text-foreground">{stats.developerScores?.openSourceScore || 75}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{ width: `${stats.developerScores?.openSourceScore || 75}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-secondary/30 border border-border space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Code Velocity</span>
                  <span className="font-mono font-bold text-foreground">{stats.developerScores?.activityScore || 85}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${stats.developerScores?.activityScore || 85}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Top Languages Tags */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <span className="text-[11px] font-semibold text-muted-foreground block">Top Languages:</span>
              <div className="flex flex-wrap gap-2">
                {stats.topLanguages.map((lang, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-foreground font-mono font-semibold flex items-center gap-1.5 border border-border"
                  >
                    <span>{lang.name}</span>
                    <span className="text-[10px] text-muted-foreground">{lang.percentage}%</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Repositories Explorer */}
      {repos.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Public Repositories ({filteredRepos.length})
              </h2>
              <span className="text-xs text-muted-foreground">
                ({selectedRepoIds.size} selected for import)
              </span>
            </div>

            {/* Filter & Search */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter repos..."
                  className="h-8 pl-8 pr-3 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden w-48"
                />
              </div>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
              >
                <option value="all">All Languages</option>
                {allLanguages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>

              <Button
                size="sm"
                variant="outline"
                onClick={handleImportToPortfolio}
                disabled={selectedRepoIds.size === 0}
                className="h-8 text-xs gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Import to Portfolio</span>
              </Button>
            </div>
          </div>

          {/* Repositories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRepos.map((repo) => {
              const isSelected = selectedRepoIds.has(repo.id);
              const isAnalyzing = analyzingRepoId === repo.id;
              const summary = projectSummaries[repo.id];

              return (
                <div
                  key={repo.id}
                  className={`p-5 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                    isSelected
                      ? "bg-card border-primary shadow-xs ring-1 ring-primary/40"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Title, Stars, Checkbox */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => toggleRepoSelection(repo.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                            isSelected ? "bg-primary border-primary text-primary-foreground" : "border-border bg-secondary"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </button>

                        <div className="min-w-0">
                          <a
                            href={repo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
                          >
                            <span>{repo.name}</span>
                            <ExternalLink className="w-3 h-3 shrink-0 text-muted-foreground" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                        <span className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          <span>{repo.stars}</span>
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <GitFork className="w-3 h-3" />
                          <span>{repo.forks}</span>
                        </span>
                      </div>
                    </div>

                    {/* Description or AI Summary */}
                    {summary ? (
                      <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-1.5 text-xs animate-in fade-in duration-200">
                        <div className="flex items-center justify-between text-[10px] font-mono text-primary font-bold">
                          <span>AI VERIFIED SUMMARY</span>
                          <span>STAR FORMAT</span>
                        </div>
                        <p className="text-xs text-foreground leading-relaxed">{summary.resumeDescription}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {repo.description || "No description provided for this repository."}
                      </p>
                    )}

                    {/* Language & Topics Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {repo.primaryLanguage && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary text-foreground font-semibold border border-border">
                          {repo.primaryLanguage}
                        </span>
                      )}
                      {repo.topics.slice(0, 4).map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-secondary/50 text-muted-foreground"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Score: {repo.qualityScore}/100
                    </span>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleAnalyzeRepo(repo)}
                      disabled={isAnalyzing}
                      className="h-7 text-xs gap-1.5 text-primary hover:bg-primary/10"
                    >
                      <Sparkles className={`w-3 h-3 ${isAnalyzing ? "animate-spin" : ""}`} />
                      <span>{isAnalyzing ? "Analyzing README..." : summary ? "Regenerate Summary" : "Auto-Summary"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && repos.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border rounded-3xl bg-card space-y-3">
          <GithubIcon className="w-10 h-10 text-muted-foreground mx-auto" />
          <h3 className="font-bold text-base text-foreground">Connect Your GitHub Profile</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto">
            Enter your GitHub username above to import your repositories, analyze contribution metrics, and generate verified portfolio cards.
          </p>
        </div>
      )}
    </div>
  );
}
