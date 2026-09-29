"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ServiceVerificationState } from "@/types/onboarding";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Key,
  ShieldAlert,
} from "lucide-react";

interface GeminiStepProps {
  apiKey: string;
  modelName: string;
  status: ServiceVerificationState;
  onChange: (fields: { apiKey?: string; modelName?: string; status?: ServiceVerificationState }) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function GeminiStep({
  apiKey,
  modelName,
  status,
  onChange,
  onNext,
  onBack,
  onSkip,
}: GeminiStepProps) {
  const { success, error: showErrorToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!apiKey || apiKey.trim().length < 15) {
      showErrorToast("Please enter a valid Google Gemini API Key.");
      return;
    }

    setIsTesting(true);
    onChange({ status: { status: "testing", message: "Pinging Google Gemini API..." } });

    try {
      const res = await fetch("/api/setup/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: apiKey.trim(), modelName }),
      });

      const data = await res.json();
      if (data.success) {
        success("Google Gemini AI connected successfully!");
        onChange({
          status: {
            status: "success",
            message: data.message,
            details: { latency: `${data.latencyMs}ms`, model: data.model },
            testedAt: new Date().toLocaleTimeString(),
          },
        });
      } else {
        showErrorToast(data.error || "Connection failed.");
        onChange({
          status: {
            status: "error",
            message: data.error || "API Key invalid or rate limited.",
          },
        });
      }
    } catch (err: any) {
      showErrorToast("Error communicating with Gemini test endpoint.");
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
          <Sparkles className="w-4 h-4" />
          <span>STEP 2 OF 6: ARTIFICIAL INTELLIGENCE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Google Gemini AI Integration
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Powers neural resume structuring, ATS semantic match scores, and interview answer evaluations.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Gemini API Key</Label>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Get Free Key at Google AI Studio</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <Key className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              placeholder="AIzaSy..."
              value={apiKey}
              onChange={(e) => {
                onChange({ apiKey: e.target.value, status: { status: "idle" } });
              }}
              className="pl-9 text-xs font-mono h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">AI Model Selection</Label>
          <select
            value={modelName}
            onChange={(e) => onChange({ modelName: e.target.value })}
            className="w-full h-9 px-3 rounded-lg border border-border bg-secondary/30 text-xs text-foreground focus:outline-hidden"
          >
            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Recommended - Fastest & High Precision)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning for Executive Portfolios)</option>
          </select>
        </div>

        {/* Verification Status Feedback */}
        {status.status === "success" && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="font-bold block">Connected & Ready</span>
              <p className="text-[11px] opacity-90">{status.message}</p>
            </div>
            {status.testedAt && (
              <span className="text-[10px] font-mono opacity-80">{status.testedAt}</span>
            )}
          </div>
        )}

        {status.status === "error" && (
          <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="font-bold block">Authentication Failed</span>
              <p className="text-[11px] opacity-90">{status.message}</p>
            </div>
          </div>
        )}

        {/* Test Connection Trigger */}
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={isTesting || !apiKey}
          className="w-full h-9 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
          <span>{isTesting ? "Testing Gemini API..." : "Test Connection"}</span>
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
