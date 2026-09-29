"use client";

import React from "react";
import { GitHubAnalyticsMetrics } from "@/types/analytics";
import {
  FolderGit2,
  Star,
  GitFork,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Code2,
  ExternalLink,
} from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";

interface GitHubAnalyticsWidgetProps {
  metrics: GitHubAnalyticsMetrics;
}

export function GitHubAnalyticsWidget({ metrics }: GitHubAnalyticsWidgetProps) {
  const { username, totalRepos, totalStars, starsGrowth, totalForks, totalContributionsLastYear, contributionsGrowth, topLanguages, recentActivity } = metrics;

  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-secondary border border-border text-foreground">
            <GithubIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              GitHub Engineering & Code Velocity
              <a
                href={`https://github.com/${username}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary hover:underline font-mono font-normal flex items-center gap-1"
              >
                <span>@{username}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </h2>
            <p className="text-xs text-muted-foreground">
              Live repository metrics, stargazers, annual commits, and language distribution.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{contributionsGrowth}% Velocity</span>
          </span>
        </div>
      </div>

      {/* 4 Metric Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Repositories</span>
            <FolderGit2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{totalRepos}</span>
          <span className="text-[10px] text-muted-foreground">Public & Showcases</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Stargazers</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{totalStars}</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">+{starsGrowth}% this year</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Forks</span>
            <GitFork className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{totalForks}</span>
          <span className="text-[10px] text-muted-foreground">Community Copies</span>
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-secondary/30 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[10px] uppercase font-bold tracking-wider">Contributions</span>
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold font-mono text-foreground block">{totalContributionsLastYear}</span>
          <span className="text-[10px] text-muted-foreground">Commits, PRs & Reviews</span>
        </div>
      </div>

      {/* Language Breakdown */}
      <div className="p-4 rounded-xl border border-border bg-secondary/20 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-foreground">Language Usage & Tech Stack Density</span>
          <span className="text-[10px] font-mono text-muted-foreground">Derived from repository codebases</span>
        </div>

        {/* Multi-Colored Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-secondary">
          {topLanguages.map((lang, idx) => (
            <div
              key={idx}
              style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}
              className="h-full transition-all duration-500 first:rounded-l-full last:rounded-r-full"
              title={`${lang.language}: ${lang.percentage}%`}
            />
          ))}
        </div>

        {/* Language Legend */}
        <div className="flex flex-wrap gap-4 pt-1 text-xs">
          {topLanguages.map((lang, idx) => (
            <div key={idx} className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: lang.color }} />
              <span className="font-semibold text-foreground">{lang.language}</span>
              <span className="text-muted-foreground">({lang.percentage}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-foreground block">Recent Codebase Milestones</span>
        <div className="space-y-2">
          {recentActivity.map((act, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-secondary text-primary font-bold font-mono text-[10px]">
                  {act.repoName}
                </span>
                <p className="text-muted-foreground">{act.description}</p>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground shrink-0">{act.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
