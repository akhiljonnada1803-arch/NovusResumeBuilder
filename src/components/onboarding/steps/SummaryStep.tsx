"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { OnboardingFormData } from "@/types/onboarding";
import {
  Sparkles,
  Database,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

interface SummaryStepProps {
  formData: OnboardingFormData;
  onBack: () => void;
}

export function SummaryStep({ formData, onBack }: SummaryStepProps) {
  const router = useRouter();
  const { success, error: showErrorToast } = useToast();
  const [isFinishing, setIsFinishing] = useState(false);

  const services = [
    {
      name: "Google Gemini AI",
      category: "Neural Intelligence",
      icon: Sparkles,
      status: formData.geminiStatus.status === "success" ? "active" : "offline_fallback",
      label: formData.geminiStatus.status === "success" ? "Verified & Active" : "Offline Heuristic Fallback",
      detail: formData.geminiModel,
      accent: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      name: "Supabase PostgreSQL",
      category: "Database & Storage",
      icon: Database,
      status: formData.supabaseStatus.status === "success" ? "active" : "offline_fallback",
      label: formData.supabaseStatus.status === "success" ? "Connected" : "Local Workspace Cache",
      detail: formData.supabaseUrl ? "Custom Instance" : "Demo Session",
      accent: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      name: "GitHub Developer Sync",
      category: "Portfolio & Skills",
      icon: GithubIcon,
      status: formData.githubStatus.status === "success" ? "active" : "offline_fallback",
      label: formData.githubStatus.status === "success" ? `@${formData.githubUser?.login}` : "Public Repositories",
      detail: `${formData.githubUser?.publicRepos || 0} repositories`,
      accent: "text-purple-500 bg-purple-500/10 border-purple-500/20",
    },
    {
      name: "LinkedIn Integration",
      category: "Career & Experience",
      icon: LinkedinIcon,
      status: formData.linkedinStatus.status === "success" ? "active" : "offline_fallback",
      label: formData.linkedinStatus.status === "success" ? `in/${formData.linkedinProfile?.vanityName || "profile"}` : "Manual Import",
      detail: formData.linkedinUrl ? "Verified Profile" : "Not Connected",
      accent: "text-blue-600 bg-blue-600/10 border-blue-600/20",
    },
    {
      name: "Vercel Portfolio Deployment",
      category: "Personal Edge Hosting",
      icon: Globe,
      status: formData.vercelStatus.status === "success" ? "active" : "offline_fallback",
      label: formData.vercelStatus.status === "success" ? `@${formData.vercelUser?.username}` : "Local Preview Only",
      detail: "User-Owned Vercel Account",
      accent: "text-blue-500 bg-blue-500/10 border-blue-500/20",
    },
  ];

  const handleComplete = async () => {
    setIsFinishing(true);

    try {
      // Save configuration to backend / storage
      await fetch("/api/setup/save-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          geminiApiKey: formData.geminiApiKey,
          supabaseUrl: formData.supabaseUrl,
          supabaseAnonKey: formData.supabaseAnonKey,
          vercelToken: formData.vercelToken,
          githubToken: formData.githubToken,
          githubUsername: formData.githubUsername,
          linkedinUrl: formData.linkedinUrl,
        }),
      });

      // Save tokens to localStorage
      if (typeof window !== "undefined") {
        if (formData.geminiApiKey) localStorage.setItem("novus_gemini_key", formData.geminiApiKey);
        if (formData.vercelToken) localStorage.setItem("novus_vercel_token", formData.vercelToken);
        if (formData.githubToken) localStorage.setItem("novus_github_token", formData.githubToken);
        if (formData.githubUsername) localStorage.setItem("novus_github_username", formData.githubUsername);
        if (formData.linkedinUrl) localStorage.setItem("novus_linkedin_url", formData.linkedinUrl);

        localStorage.setItem("novus_onboarding_completed", "true");
        localStorage.setItem("novus_onboarding_date", new Date().toISOString());
      }

      success("Novus Resume AI configured successfully! Launching dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 400);
    } catch (e: any) {
      showErrorToast("Error saving configuration, proceeding to dashboard.");
      router.push("/dashboard");
    } finally {
      setIsFinishing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
      {/* Step Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>STEP 7 OF 7: CONFIGURATION COMPLETE</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          Platform Health & Verification Summary
        </h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
          Review your configured environment. All services with offline fallbacks will seamlessly operate without interruption.
        </p>
      </div>

      {/* Services Health Matrix Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((svc, idx) => {
          const Icon = svc.icon;
          const isActive = svc.status === "active";

          return (
            <div key={idx} className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${svc.accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block">{svc.name}</span>
                    <span className="text-[10px] text-muted-foreground block">{svc.category}</span>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-muted-foreground"}`} />
                  <span>{isActive ? "Connected" : "Demo Mode"}</span>
                </span>
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
                <span>{svc.label}</span>
                <span className="font-mono text-[10px] text-foreground/80">{svc.detail}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Launch Action */}
      <div className="p-5 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card space-y-3 text-center">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-foreground">Ready to Build Outstanding Resumes & Portfolios</h3>
          <p className="text-xs text-muted-foreground">
            You can modify API keys, themes, and database settings at any time in your Settings dashboard.
          </p>
        </div>

        <Button
          type="button"
          variant="radiant"
          size="lg"
          onClick={handleComplete}
          disabled={isFinishing}
          className="w-full sm:w-auto h-11 px-8 text-xs font-black gap-2 shadow-md uppercase tracking-wider"
        >
          <Rocket className="w-4 h-4" />
          <span>{isFinishing ? "Launching Application..." : "Save & Launch Dashboard"}</span>
        </Button>
      </div>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onBack} className="text-xs gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Previous Step</span>
        </Button>

        <span className="text-[11px] text-muted-foreground font-mono">
          Novus Resume AI v1.0
        </span>
      </div>
    </div>
  );
}
