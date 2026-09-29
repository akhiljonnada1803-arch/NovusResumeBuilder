"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepProgressBar } from "@/components/onboarding/StepProgressBar";
import { WelcomeStep } from "@/components/onboarding/steps/WelcomeStep";
import { GeminiStep } from "@/components/onboarding/steps/GeminiStep";
import { SupabaseStep } from "@/components/onboarding/steps/SupabaseStep";
import { GitHubStep } from "@/components/onboarding/steps/GitHubStep";
import { LinkedInStep } from "@/components/onboarding/steps/LinkedInStep";
import { VercelStep } from "@/components/onboarding/steps/VercelStep";
import { SummaryStep } from "@/components/onboarding/steps/SummaryStep";
import { OnboardingStep, OnboardingFormData, INITIAL_ONBOARDING_DATA } from "@/types/onboarding";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>("welcome");
  const [formData, setFormData] = useState<OnboardingFormData>(INITIAL_ONBOARDING_DATA);

  const updateFormData = (patch: Partial<OnboardingFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
  };

  const handleSkipAll = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("novus_onboarding_completed", "true");
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Navbar */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4 border-b border-border/60">
        <Link href="/" className="flex items-center gap-2 font-black text-sm tracking-tight text-foreground">
          <div className="w-6 h-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-black text-xs shadow-xs">
            N
          </div>
          <span>Novus Resume AI</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSkipAll}
            className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            Skip to Dashboard
          </button>
        </div>
      </header>

      {/* Main Wizard Card Container */}
      <main className="max-w-3xl w-full mx-auto my-auto py-8">
        <div className="p-6 sm:p-10 rounded-3xl border border-border bg-card shadow-lg space-y-6">
          {/* 7-Step Visual Progress Bar */}
          <StepProgressBar
            currentStep={currentStep}
            onStepClick={(step) => setCurrentStep(step)}
          />

          {/* Active Step Content View */}
          <div className="pt-2">
            {currentStep === "welcome" && (
              <WelcomeStep
                onNext={() => setCurrentStep("gemini")}
                onSkipAll={handleSkipAll}
              />
            )}

            {currentStep === "gemini" && (
              <GeminiStep
                apiKey={formData.geminiApiKey}
                modelName={formData.geminiModel}
                status={formData.geminiStatus}
                onChange={(fields) => {
                  updateFormData({
                    ...(fields.apiKey !== undefined && { geminiApiKey: fields.apiKey }),
                    ...(fields.modelName !== undefined && { geminiModel: fields.modelName }),
                    ...(fields.status !== undefined && { geminiStatus: fields.status }),
                  });
                }}
                onNext={() => setCurrentStep("supabase")}
                onBack={() => setCurrentStep("welcome")}
                onSkip={() => {
                  updateFormData({ geminiStatus: { status: "skipped" } });
                  setCurrentStep("supabase");
                }}
              />
            )}

            {currentStep === "supabase" && (
              <SupabaseStep
                url={formData.supabaseUrl}
                anonKey={formData.supabaseAnonKey}
                status={formData.supabaseStatus}
                onChange={(fields) => {
                  updateFormData({
                    ...(fields.url !== undefined && { supabaseUrl: fields.url }),
                    ...(fields.anonKey !== undefined && { supabaseAnonKey: fields.anonKey }),
                    ...(fields.status !== undefined && { supabaseStatus: fields.status }),
                  });
                }}
                onNext={() => setCurrentStep("github")}
                onBack={() => setCurrentStep("gemini")}
                onSkip={() => {
                  updateFormData({ supabaseStatus: { status: "skipped" } });
                  setCurrentStep("github");
                }}
              />
            )}

            {currentStep === "github" && (
              <GitHubStep
                token={formData.githubToken}
                username={formData.githubUsername}
                status={formData.githubStatus}
                user={formData.githubUser}
                onChange={(fields) => {
                  updateFormData({
                    ...(fields.token !== undefined && { githubToken: fields.token }),
                    ...(fields.username !== undefined && { githubUsername: fields.username }),
                    ...(fields.status !== undefined && { githubStatus: fields.status }),
                    ...(fields.user !== undefined && { githubUser: fields.user }),
                  });
                }}
                onNext={() => setCurrentStep("linkedin")}
                onBack={() => setCurrentStep("supabase")}
                onSkip={() => {
                  updateFormData({ githubStatus: { status: "skipped" } });
                  setCurrentStep("linkedin");
                }}
              />
            )}

            {currentStep === "linkedin" && (
              <LinkedInStep
                url={formData.linkedinUrl}
                status={formData.linkedinStatus}
                profile={formData.linkedinProfile}
                onChange={(fields) => {
                  updateFormData({
                    ...(fields.url !== undefined && { linkedinUrl: fields.url }),
                    ...(fields.status !== undefined && { linkedinStatus: fields.status }),
                    ...(fields.profile !== undefined && { linkedinProfile: fields.profile }),
                  });
                }}
                onNext={() => setCurrentStep("vercel")}
                onBack={() => setCurrentStep("github")}
                onSkip={() => {
                  updateFormData({ linkedinStatus: { status: "skipped" } });
                  setCurrentStep("vercel");
                }}
              />
            )}

            {currentStep === "vercel" && (
              <VercelStep
                token={formData.vercelToken}
                status={formData.vercelStatus}
                user={formData.vercelUser}
                onChange={(fields) => {
                  updateFormData({
                    ...(fields.token !== undefined && { vercelToken: fields.token }),
                    ...(fields.status !== undefined && { vercelStatus: fields.status }),
                    ...(fields.user !== undefined && { vercelUser: fields.user }),
                  });
                }}
                onNext={() => setCurrentStep("summary")}
                onBack={() => setCurrentStep("linkedin")}
                onSkip={() => {
                  updateFormData({ vercelStatus: { status: "skipped" } });
                  setCurrentStep("summary");
                }}
              />
            )}

            {currentStep === "summary" && (
              <SummaryStep
                formData={formData}
                onBack={() => setCurrentStep("vercel")}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-3xl w-full mx-auto text-center pt-4 border-t border-border/40 text-[11px] text-muted-foreground">
        <span>Novus Resume AI • Multi-Tenant Developer Career Platform</span>
      </footer>
    </div>
  );
}
