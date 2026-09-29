"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SUPPORTED_PLATFORMS } from "@/lib/integrations/registry";
import { GitHubImportModal } from "@/components/integrations/GitHubImportModal";
import { LinkedInImportModal } from "@/components/integrations/LinkedInImportModal";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import {
  User,
  Mail,
  Briefcase,
  Lock,
  LogOut,
  Check,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Shield,
  CreditCard,
  Layers,
  Code2,
  Terminal,
  BookOpen,
  GraduationCap,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";

export default function SettingsPage() {
  const { profile, updateUserProfile, updateUserPassword, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<"account" | "integrations">("account");
  const [fullName, setFullName] = useState(profile?.fullName || "");
  const [jobTitle, setJobTitle] = useState(profile?.jobTitle || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(false);

    if (!fullName) {
      setProfileError("Full Name is required.");
      return;
    }

    setIsSavingProfile(true);
    const { error } = await updateUserProfile({ fullName, jobTitle });

    if (error) {
      setProfileError(error);
    } else {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
    setIsSavingProfile(false);
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setIsSavingPassword(true);
    const { error } = await updateUserPassword(password);

    if (error) {
      setPasswordError(error);
    } else {
      setPasswordSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    }
    setIsSavingPassword(false);
  };

  const renderPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case "github":
        return <GithubIcon className="w-5 h-5" />;
      case "linkedin":
        return <LinkedinIcon className="w-5 h-5" />;
      case "code":
        return <Code2 className="w-5 h-5" />;
      case "terminal":
        return <Terminal className="w-5 h-5" />;
      case "book-open":
        return <BookOpen className="w-5 h-5" />;
      case "graduation-cap":
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <Layers className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Header & Tab Switcher */}
      <div className="space-y-4 border-b border-border/80 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Settings & Portfolio Integrations
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
              Manage your personal profile, credentials, subscription, and multi-platform portfolio integrations.
            </p>
          </div>

          <a href="/onboarding" className="shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Setup Wizard</span>
            </Button>
          </a>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("account")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "account"
                ? "bg-secondary text-foreground border border-border shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            Account & Security
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("integrations")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === "integrations"
                ? "bg-secondary text-foreground border border-border shadow-2xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            Integrations Hub ({SUPPORTED_PLATFORMS.length})
          </button>
        </div>
      </div>

      {activeTab === "account" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-2 space-y-6">
            {/* Section 1: Profile Information */}
            <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <User className="w-4 h-4 text-foreground" />
                  Personal Profile
                </h2>
                {profileSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Saved
                  </span>
                )}
              </div>

              {profileError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{profileError}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-3.5">
                <div>
                  <Label required>Full Name</Label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    leftIcon={<User className="w-3.5 h-3.5" />}
                  />
                </div>

                <div>
                  <Label>Professional Headline / Job Title</Label>
                  <Input
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    leftIcon={<Briefcase className="w-3.5 h-3.5" />}
                  />
                </div>

                <div>
                  <Label>Email Address</Label>
                  <Input
                    value={profile?.email || ""}
                    disabled
                    leftIcon={<Mail className="w-3.5 h-3.5" />}
                    className="opacity-75 cursor-not-allowed bg-secondary/50"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Managed via Supabase Auth identity provider.
                  </span>
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="radiant" size="sm" disabled={isSavingProfile}>
                    {isSavingProfile ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            {/* Section 2: Security & Password */}
            <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Lock className="w-4 h-4 text-foreground" />
                  Security & Password
                </h2>
                {passwordSuccess && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Updated
                  </span>
                )}
              </div>

              {passwordError && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handleSavePassword} className="space-y-3.5">
                <div>
                  <Label required>New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  />
                </div>

                <div>
                  <Label required>Confirm New Password</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    leftIcon={<Lock className="w-3.5 h-3.5" />}
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="outline" size="sm" disabled={isSavingPassword}>
                    {isSavingPassword ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                        Updating...
                      </>
                    ) : (
                      "Update Password"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Plan & Actions Sidebar */}
          <div className="space-y-5">
            {/* Plan Widget */}
            <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Subscription Plan
                </span>
                <span className="text-xs font-semibold text-foreground bg-secondary px-2 py-0.5 rounded border border-border">
                  {profile?.plan || "Pro"}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="font-semibold text-sm text-foreground">Novus Enterprise AI</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All 25 templates unlocked, unlimited bullet suggestions, and high-DPI multi-page PDF exports.
                </p>
              </div>

              <div className="pt-2.5 border-t border-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Unlimited Resumes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-Time ATS Scanners</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>AI Bullet Enhancer</span>
                </div>
              </div>
            </div>

            {/* Session Management */}
            <div className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-3">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Session Management
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Sign out of this session on this device.
              </p>
              <Button
                onClick={signOut}
                variant="outline"
                size="sm"
                className="w-full text-xs font-semibold gap-2 text-destructive hover:bg-destructive/10 border-border"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Integrations Hub */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SUPPORTED_PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className="p-5 rounded-xl border border-border bg-card shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-foreground border border-border/80">
                        {renderPlatformIcon(platform.iconName)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                          {platform.name}
                        </h3>
                        <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                          {platform.category}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-semibold px-2 py-0.5 rounded-md border ${
                        platform.isAvailable
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
                          : "bg-secondary text-muted-foreground border-border/80"
                      }`}
                    >
                      {platform.badgeText}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {platform.description}
                  </p>

                  <ul className="space-y-1 pt-1 text-[11px] text-muted-foreground">
                    {platform.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-border/60">
                  {platform.isAvailable ? (
                    <Button
                      type="button"
                      variant="radiant"
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 shadow-2xs"
                      onClick={() => {
                        if (platform.id === "github") setIsGitHubModalOpen(true);
                        else if (platform.id === "linkedin") setIsLinkedInModalOpen(true);
                      }}
                    >
                      <Zap className="w-3.5 h-3.5" />
                      Manage & Sync {platform.name}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full text-xs font-medium opacity-60 cursor-not-allowed"
                      disabled
                    >
                      Coming in v2.0
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <GitHubImportModal
            open={isGitHubModalOpen}
            onOpenChange={setIsGitHubModalOpen}
          />

          <LinkedInImportModal
            open={isLinkedInModalOpen}
            onOpenChange={setIsLinkedInModalOpen}
          />
        </div>
      )}
    </div>
  );
}
