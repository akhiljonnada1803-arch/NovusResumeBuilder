"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ServiceVerificationState } from "@/types/onboarding";
import {
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Server,
  Lock,
} from "lucide-react";

interface SupabaseStepProps {
  url: string;
  anonKey: string;
  status: ServiceVerificationState;
  onChange: (fields: { url?: string; anonKey?: string; status?: ServiceVerificationState }) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function SupabaseStep({
  url,
  anonKey,
  status,
  onChange,
  onNext,
  onBack,
  onSkip,
}: SupabaseStepProps) {
  const { success, error: showErrorToast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestConnection = async () => {
    if (!url || !url.startsWith("http")) {
      showErrorToast("Please enter a valid Supabase project URL.");
      return;
    }
    if (!anonKey || anonKey.trim().length < 15) {
      showErrorToast("Please enter a valid Supabase anon key.");
      return;
    }

    setIsTesting(true);
    onChange({ status: { status: "testing", message: "Connecting to Supabase project..." } });

    try {
      const res = await fetch("/api/setup/test-supabase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        success("Supabase database connected successfully!");
        onChange({
          status: {
            status: "success",
            message: data.message,
            testedAt: new Date().toLocaleTimeString(),
          },
        });
      } else {
        showErrorToast(data.error || "Connection failed.");
        onChange({
          status: {
            status: "error",
            message: data.error || "Could not reach database.",
          },
        });
      }
    } catch (err: any) {
      showErrorToast("Error communicating with Supabase test endpoint.");
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
          <Database className="w-4 h-4" />
          <span>STEP 3 OF 6: RELATIONAL DATABASE & AUTH</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Supabase PostgreSQL Setup
        </h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Provides user authentication, candidate resume version control, and multi-tenant data isolation.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">Supabase Project URL</Label>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="relative">
            <Server className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              placeholder="https://xyzproject.supabase.co"
              value={url}
              onChange={(e) => onChange({ url: e.target.value, status: { status: "idle" } })}
              className="pl-9 text-xs font-mono h-9"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Supabase Anon Key (Public API Key)</Label>
          <div className="relative">
            <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => onChange({ anonKey: e.target.value, status: { status: "idle" } })}
              className="pl-9 text-xs font-mono h-9"
            />
          </div>
        </div>

        {/* Verification Status Feedback */}
        {status.status === "success" && (
          <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 flex items-start gap-2.5 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-0.5 flex-1">
              <span className="font-bold block">Database Connected</span>
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
              <span className="font-bold block">Connection Failed</span>
              <p className="text-[11px] opacity-90">{status.message}</p>
            </div>
          </div>
        )}

        {/* Test Connection Trigger */}
        <Button
          type="button"
          variant="outline"
          onClick={handleTestConnection}
          disabled={isTesting || !url || !anonKey}
          className="w-full h-9 text-xs font-semibold gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
          <span>{isTesting ? "Testing Database Connection..." : "Test Connection"}</span>
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
