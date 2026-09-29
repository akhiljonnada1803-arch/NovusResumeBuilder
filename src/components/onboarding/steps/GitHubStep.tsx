"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ServiceVerificationState } from "@/types/onboarding";
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Key,
  FolderGit2,
  User,
} from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";

interface GitHubStepProps {
  token: string;
  username: string;
  status: ServiceVerificationState;
  user?: { login: string; name?: string; avatarUrl?: string; publicRepos?: number };
  onChange: (fields: {
    token?: string;
    username?: string;
    status?: ServiceVerificationState;
    user?: { login: string; name?: string; avatarUrl?: string; publicRepos?: number };
  }) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function GitHubStep({
  token,
  username,
  status,
  user,
  onChange,
  onNext,
  onBack,
  onSkip,
}: GitHubStepProps) {
  const { success, error: showErrorToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);
  const [githubUsername, setGithubUsername] = useState(username || "");

  const handleTestGitHub = async () => {
    setIsTesting(true);
    onChange({ status: { status: "testing", message: "Connecting to GitHub API..." } });

    try {
      const res = await fetch("/api/setup/test-github", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim(), username: githubUsername.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        success(`Connected to GitHub @${data.user.login}!`);
        onChange({
          user: data.user,
          status: {
            status: "success",
            message: data.message,
            testedAt: new Date().toLocaleTimeString(),
          },
        });
      } else {
        showErrorToast(data.error || "GitHub authentication failed.");
        onChange({
          status: {
            status: "error",
            message: data.error || "Token or username invalid.",
          },
        });
      }
    } catch (err: any) {
      showErrorToast("Error communicating with GitHub test endpoint.");
      onChange({
        status: { status: "error", message: "Network connection failure." },
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      {/* Step Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-mono text-xs font-bold">
          <GithubIcon className="w-4 h-4" />
          <span>STEP 5 OF 6: DEVELOPER ECOSYSTEM</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          GitHub Integration
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Import projects, auto-generate README portfolio case studies, and extract 5-tier technical skill taxonomies.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">GitHub Personal Access Token (Optional)</Label>
            <a
              href="https://github.com/settings/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>GitHub Token Settings</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <Key className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              placeholder="ghp_..."
              value={token}
              onChange={(e) => onChange({ token: e.target.value, status: { status: "idle" } })}
              className="pl-9 text-xs font-mono h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Or Public GitHub Username</Label>
          <div className="relative">
            <User className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="torvalds"
              value={githubUsername}
              onChange={(e) => {
                setGithubUsername(e.target.value);
                onChange({ username: e.target.value });
              }}
              className="pl-9 text-xs font-mono h-9"
            />
          </div>
        </div>

        {/* Verification Status Feedback with Profile Card */}
        {status.status === "success" && user && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified GitHub Profile</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">{status.testedAt}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-card/60 border border-emerald-500/20 flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2.5">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.login} className="w-8 h-8 rounded-full border border-border" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                    {user.login.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <span className="font-bold text-xs block font-mono">@{user.login}</span>
                  <span className="text-[10px] text-muted-foreground block">{user.name || "GitHub Developer"}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] font-mono bg-secondary px-2.5 py-1 rounded border border-border">
                <FolderGit2 className="w-3.5 h-3.5 text-primary" />
                <span>{user.publicRepos ?? 0} Repos</span>
              </div>
            </div>
          </div>
        )}

        {status.status === "error" && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="font-bold block">GitHub Verification Failed</span>
              <p className="text-[11px] opacity-90">{status.message}</p>
            </div>
          </div>
        )}

        {/* Test Connection Trigger */}
        <Button
          type="button"
          variant="outline"
          onClick={handleTestGitHub}
          disabled={isTesting || (!token && !githubUsername)}
          className="w-full h-9 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
          <span>{isTesting ? "Validating GitHub Account..." : "Connect & Test GitHub API"}</span>
        </Button>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-2">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onSkip} className="text-xs text-muted-foreground">
            Skip for Now
          </Button>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            onClick={onNext}
            className="h-9 px-4 text-xs font-bold gap-1.5 shadow-2xs"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
