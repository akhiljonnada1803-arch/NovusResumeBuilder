"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Menu,
  X,
  Compass,
  LogOut,
  ShieldCheck,
  FileText,
  Search,
  Sparkles,
  Command,
  Globe,
  Bot,
  UploadCloud,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { FEATURES } from "@/lib/features";

const DASHBOARD_LINKS = [
  { href: "/dashboard", label: "All Resumes", icon: LayoutDashboard },
  { href: "/import", label: "Import Resume", icon: UploadCloud },
  { href: "/linkedin", label: "LinkedIn Sync", icon: LinkedinIcon },
  { href: "/github", label: "GitHub Hub", icon: GithubIcon },
  { href: "/career-dashboard", label: "Career Intel", icon: Compass },
  { href: "/interview-coach", label: "Interview Coach", icon: Bot },
  ...(FEATURES.voiceInterview
    ? [{ href: "/voice-interview", label: "Voice Interview", icon: Bot }]
    : []),
  ...(FEATURES.videoInterview
    ? [{ href: "/video-interview", label: "Video Interview", icon: Bot }]
    : []),
  { href: "/portfolio", label: "Portfolio Site", icon: Globe },
  { href: "/cover-letters", label: "Cover Letters", icon: FileText },
  { href: "/ats-analyzer", label: "ATS Scanner", icon: ShieldCheck },
  { href: "/templates", label: "Templates", icon: FolderKanban },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/discover", label: "Roadmap", icon: Compass, badge: "New" },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, signOut } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const initials = profile?.fullName
    ? profile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2)
    : "AR";

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Linear-Style Minimal Sidebar */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-60 bg-card border-r border-border flex flex-col justify-between p-3.5 transition-transform duration-200 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-5">
          {/* Brand Logo */}
          <div className="flex items-center justify-between px-2 pt-1">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 flex items-center justify-center font-bold text-xs shadow-2xs group-hover:opacity-90 transition-opacity">
                N
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-xs tracking-tight text-foreground flex items-center gap-1">
                  Novus Resume
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Enterprise AI
                </span>
              </div>
            </Link>
            <button
              suppressHydrationWarning
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Search Bar Placeholder */}
          <div className="px-1">
            <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-secondary/60 border border-border/60 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Search className="w-3.5 h-3.5" />
                <span className="text-[11px]">Quick find...</span>
              </div>
              <kbd className="text-[10px] font-mono bg-card px-1.5 py-0.5 rounded border border-border/80">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-0.5 px-1">
            <div className="px-2 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Workspace
            </div>
            {DASHBOARD_LINKS.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              const badge = (link as { badge?: string }).badge;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground font-semibold border border-border/60"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
                  <span className="flex-1">{link.label}</span>
                  {badge && (
                    <span className="text-[9px] font-bold tracking-wide text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Plan Status & User Profile */}
        <div className="space-y-3 pt-3 border-t border-border">
          {/* Subtle Tier Badge */}
          <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-foreground text-[11px]">
                {profile?.plan || "Pro"} Plan
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono">Active</span>
          </div>

          {/* User Profile Info */}
          <div className="flex items-center justify-between px-1">
            <Link href="/settings" className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0">
              <div className="w-7 h-7 rounded-md bg-secondary border border-border text-foreground font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="text-left truncate">
                <span className="text-xs font-medium text-foreground block leading-tight truncate">
                  {profile?.fullName || "Alex Rivera"}
                </span>
                <span className="text-[10px] text-muted-foreground block truncate">
                  {profile?.jobTitle || "Engineer"}
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-0.5 shrink-0">
              <ThemeToggle />
              <button
                suppressHydrationWarning
                onClick={signOut}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-12 border-b border-border bg-card/60 backdrop-blur-xs px-4 sm:px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              suppressHydrationWarning
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:bg-secondary"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Novus</span>
              <span>/</span>
              <span className="text-foreground font-medium">
                {pathname === "/dashboard"
                  ? "Resumes"
                  : pathname === "/ats-analyzer"
                  ? "ATS Analyzer"
                  : pathname === "/templates"
                  ? "Templates"
                  : pathname === "/settings"
                  ? "Settings"
                  : "Workspace"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/onboarding">
              <Button suppressHydrationWarning size="sm" variant="outline" className="text-xs gap-1.5 h-7 px-2.5 font-semibold text-primary border-primary/30 hover:bg-primary/10">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>Setup Wizard</span>
              </Button>
            </Link>
            <Link href="/">
              <Button suppressHydrationWarning size="sm" variant="ghost" className="text-xs gap-1.5 h-7 px-2 text-muted-foreground hover:text-foreground">
                <Compass className="w-3.5 h-3.5" />
                Landing Page
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
