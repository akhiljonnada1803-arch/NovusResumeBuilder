"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ServiceVerificationState } from "@/types/onboarding";
import {
  Globe,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  User,
} from "lucide-react";

interface VercelStepProps {
  token: string;
  status: ServiceVerificationState;
  user?: { username: string; email: string; name?: string };
  onChange: (fields: {
    token?: string;
    status?: ServiceVerificationState;
    user?: { username: string; email: string; name?: string };
  }) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function VercelStep({
  token,
  status,
  user,
  onChange,
  onNext,
  onBack,
  onSkip,
}: VercelStepProps) {
  const { success, error: showErrorToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestToken = async () => {
    if (!token || token.trim().length < 10) {
      showErrorToast("Please enter a valid Vercel Access Token.");
      return;
    }

    setIsTesting(true);
    onChange({ status: { status: "testing", message: "Authenticating with Vercel API..." } });

    try {
      const res = await fetch("/api/setup/test-vercel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        success(`Connected to Vercel account @${data.user.username}!`);
        onChange({
          user: data.user,
          status: {
            status: "success",
            message: data.message,
            testedAt: new Date().toLocaleTimeString(),
          },
        });
      } else {
        showErrorToast(data.error || "Authentication failed.");
        onChange({
          status: {
            status: "error",
            message: data.error || "Token invalid or expired.",
          },
        });
      }
    } catch (err: any) {
      showErrorToast("Error communicating with Vercel verification endpoint.");
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
          <Globe className="w-4 h-4" />
          <span>STEP 4 OF 6: EDGE CLOUD HOSTING</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Vercel Platform Integration
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Enables automated DNS CNAME propagation and edge CDN hosting for portfolio subdomains and custom domains.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Vercel Personal Access Token</Label>
            <a
              href="https://vercel.com/account/tokens"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Generate Vercel Token</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <KeyRound className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              placeholder="vercel_tok_..."
              value={token}
              onChange={(e) => onChange({ token: e.target.value, status: { status: "idle" } })}
              className="pl-9 text-xs font-mono h-9"
            />
          </div>
        </div>

        {/* Verification Status Feedback with Account Card */}
        {status.status === "success" && user && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Verified Vercel Account</span>
              </div>
              <span className="text-[10px] font-mono opacity-80">{status.testedAt}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-card/60 border border-emerald-500/20 flex items-center justify-between text-foreground">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-bold text-xs block font-mono">@{user.username}</span>
                  {user.email && <span className="text-[10px] text-muted-foreground block">{user.email}</span>}
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                Connected
              </span>
            </div>
          </div>
        )}

        {status.status === "error" && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="font-bold block">Authorization Failed</span>
              <p className="text-[11px] opacity-90">{status.message}</p>
            </div>
          </div>
        )}

        {/* Test Connection Trigger */}
        <Button
          type="button"
          variant="outline"
          onClick={handleTestToken}
          disabled={isTesting || !token}
          className="w-full h-9 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
          <span>{isTesting ? "Validating Vercel Token..." : "Validate Token & Fetch Account"}</span>
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
