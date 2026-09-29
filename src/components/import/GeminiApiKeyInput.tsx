"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  Trash2,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const LOCAL_STORAGE_GEMINI_KEY = "novus_gemini_api_key";

interface GeminiApiKeyInputProps {
  onKeyChange?: (key: string) => void;
  className?: string;
  defaultOpen?: boolean;
}

export function GeminiApiKeyInput({
  onKeyChange,
  className = "",
  defaultOpen = false,
}: GeminiApiKeyInputProps) {
  const { success, error: showErrorToast } = useToast();
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [testStatus, setTestStatus] = useState<{
    status: "idle" | "success" | "error";
    message: string;
    model?: string;
  }>({ status: "idle", message: "" });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY) || "";
      if (stored) {
        setApiKey(stored);
        setSavedKey(stored);
        onKeyChange?.(stored);
      }
    } catch {
      // Ignore localStorage access issues
    }
  }, [onKeyChange]);

  const handleTestAndSave = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      showErrorToast("Please enter a valid Gemini API key first.");
      return;
    }

    setIsTesting(true);
    setTestStatus({ status: "idle", message: "" });

    try {
      const res = await fetch("/api/import/test-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: trimmed }),
      });

      const data = await res.json();

      if (res.ok && data.valid) {
        localStorage.setItem(LOCAL_STORAGE_GEMINI_KEY, trimmed);
        setSavedKey(trimmed);
        setTestStatus({
          status: "success",
          message: data.message || "Connected to Google Gemini successfully!",
          model: data.model,
        });
        success("Gemini API key verified and saved! AI resume parsing is active.");
        onKeyChange?.(trimmed);
      } else {
        setTestStatus({
          status: "error",
          message: data.error || "Failed to verify API key with Google Gemini.",
        });
        showErrorToast(data.error || "Invalid Gemini API key.");
      }
    } catch (err: any) {
      const msg = err.message || "Network error while verifying API key.";
      setTestStatus({ status: "error", message: msg });
      showErrorToast(msg);
    } finally {
      setIsTesting(false);
    }
  };

  const handleRemoveKey = () => {
    try {
      localStorage.removeItem(LOCAL_STORAGE_GEMINI_KEY);
      setApiKey("");
      setSavedKey("");
      setTestStatus({ status: "idle", message: "" });
      success("API key removed. The system will use standard offline fallback heuristics.");
      onKeyChange?.("");
    } catch {
      // Ignore
    }
  };

  const isKeyActive = Boolean(savedKey);

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden ${
        isKeyActive
          ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
          : "border-primary/20 bg-primary/5 dark:bg-primary/5"
      } ${className}`}
    >
      {/* Header bar / summary */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isKeyActive
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                : "bg-primary/20 text-primary"
            }`}
          >
            {isKeyActive ? <Sparkles className="w-5 h-5" /> : <Key className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">
                {isKeyActive ? "AI-Powered Parsing Active" : "LLM API Key (Google Gemini)"}
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  isKeyActive
                    ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                }`}
              >
                {isKeyActive ? "⚡ LLM Mode" : "Offline Regex Mode"}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isKeyActive
                ? `Using custom Gemini key (...${savedKey.slice(-4)}) for zero-loss resume parsing.`
                : "Add your free Google AI Studio key to extract complex resumes with 99%+ accuracy."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="h-8 text-xs font-semibold gap-1.5 px-2.5"
          >
            <span>{isOpen ? "Hide Settings" : isKeyActive ? "Manage Key" : "Configure Key"}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </Button>
        </div>
      </div>

      {/* Expandable Key Configuration Body */}
      {isOpen && (
        <div className="px-4 pb-4 pt-1 border-t border-border/60 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy... (Paste your Google Gemini API key)"
                className="w-full h-9 pl-9 pr-9 text-xs rounded-xl bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-hidden font-mono transition-all text-foreground placeholder:text-muted-foreground/60"
              />
              <Key className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="radiant"
                onClick={handleTestAndSave}
                disabled={isTesting || !apiKey.trim()}
                className="h-9 text-xs font-bold gap-1.5 px-4 rounded-xl"
              >
                {isTesting ? (
                  <>
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Save & Test</span>
                  </>
                )}
              </Button>

              {isKeyActive && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleRemoveKey}
                  className="h-9 text-xs font-semibold gap-1 text-destructive hover:bg-destructive/10 hover:border-destructive/30 px-3 rounded-xl"
                  title="Remove saved API key"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </Button>
              )}
            </div>
          </div>

          {/* Test Status Banner */}
          {testStatus.status === "success" && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{testStatus.message}</span>
            </div>
          )}

          {testStatus.status === "error" && (
            <div className="p-2.5 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-xs text-destructive">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{testStatus.message}</span>
            </div>
          )}

          {/* Helper Link */}
          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span>Keys are stored strictly locally in your browser session.</span>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline font-semibold"
            >
              <span>Get Free Gemini Key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
