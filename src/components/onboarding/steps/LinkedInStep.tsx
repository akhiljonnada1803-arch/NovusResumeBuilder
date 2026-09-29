"use client";

import React, { useState } from "react";
import { ServiceVerificationState } from "@/types/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  ShieldCheck,
  Globe,
} from "lucide-react";
import { LinkedinIcon } from "@/components/shared/icons";

interface LinkedInStepProps {
  url: string;
  status: ServiceVerificationState;
  profile?: {
    name?: string;
    headline?: string;
    vanityName?: string;
  };
  onChange: (fields: {
    url?: string;
    status?: ServiceVerificationState;
    profile?: any;
  }) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function LinkedInStep({
  url,
  status,
  profile,
  onChange,
  onNext,
  onBack,
  onSkip,
}: LinkedInStepProps) {
  const [inputUrl, setInputUrl] = useState(url || "");

  const handleTestConnection = async () => {
    if (!inputUrl.trim()) {
      onChange({
        status: {
          status: "error",
          message: "Please enter your LinkedIn profile URL (e.g. https://linkedin.com/in/yourprofile).",
        },
      });
      return;
    }

    onChange({
      url: inputUrl.trim(),
      status: { status: "testing", message: "Validating LinkedIn profile URL..." },
    });

    try {
      const res = await fetch("/api/setup/test-linkedin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl.trim() }),
      });

      const data = await res.json();

      if (data.success && data.profile) {
        onChange({
          url: inputUrl.trim(),
          profile: data.profile,
          status: {
            status: "success",
            message: data.message || "LinkedIn profile validated!",
            testedAt: new Date().toISOString(),
          },
        });
      } else {
        onChange({
          status: {
            status: "error",
            message: data.error || "Invalid LinkedIn profile URL.",
          },
        });
      }
    } catch (e: any) {
      onChange({
        status: {
          status: "error",
          message: "Failed to validate LinkedIn profile. Check URL and try again.",
        },
      });
    }
  };

  const isTesting = status.status === "testing";
  const isSuccess = status.status === "success";
  const isError = status.status === "error";

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-600/20">
            <LinkedinIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Connect LinkedIn Profile</h2>
            <p className="text-xs text-muted-foreground">
              Enable instant LinkedIn profile data imports for automated resume & portfolio generation.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="p-5 rounded-2xl border border-border bg-secondary/20 space-y-4 text-xs">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">LinkedIn Profile URL</Label>
            <span className="text-[11px] text-muted-foreground">Optional</span>
          </div>

          <div className="relative">
            <Input
              type="url"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                if (status.status !== "idle") {
                  onChange({ status: { status: "idle" } });
                }
              }}
              placeholder="https://linkedin.com/in/alexrivera"
              className="h-10 text-xs pl-8 font-mono"
            />
            <Globe className="w-4 h-4 text-muted-foreground absolute left-2.5 top-3" />
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Your public LinkedIn profile URL allows Novus to structure experience, education, and endorsements.
          </p>
        </div>

        {/* Live Validation / Status Feedback */}
        {isSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{status.message}</span>
            </div>
            {profile && (
              <div className="text-[11px] text-muted-foreground flex items-center gap-2 pt-1">
                <span>Profile Handle: <strong className="text-foreground">in/{profile.vanityName}</strong></span>
              </div>
            )}
          </div>
        )}

        {isError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>Validation Failed</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {status.message}
            </p>
          </div>
        )}

        {/* Validation Trigger */}
        <div className="flex items-center gap-2 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            disabled={isTesting || !inputUrl.trim()}
            className="h-8 text-xs font-bold gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-primary" : ""}`} />
            <span>{isTesting ? "Validating..." : isError ? "Retry Validation" : "Validate Profile URL"}</span>
          </Button>

          {isSuccess && (
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </span>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-xs gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            onClick={onNext}
            className="h-8.5 px-5 text-xs font-bold gap-1.5 shadow-xs"
          >
            <span>Continue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
