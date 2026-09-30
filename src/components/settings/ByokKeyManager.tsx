"use client";

import React, { useState, useEffect } from "react";
import {
  getByokKeys,
  saveByokKeys,
  clearByokKeys,
  type ByokKeys,
} from "@/lib/storage/byok-store";
import {
  Key,
  Eye,
  EyeOff,
  Save,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ByokKeyManager() {
  const [keys, setKeys] = useState<ByokKeys>({
    geminiApiKey: "",
    supabaseUrl: "",
    supabaseAnonKey: "",
  });
  const [showGemini, setShowGemini] = useState(false);
  const [showAnonKey, setShowAnonKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hasExistingKeys, setHasExistingKeys] = useState(false);

  // Load saved keys on mount (masked)
  useEffect(() => {
    const stored = getByokKeys();
    setHasExistingKeys(
      !!(stored.geminiApiKey || stored.supabaseUrl || stored.supabaseAnonKey)
    );
    // Pre-fill with stored values so user can see/edit
    setKeys(stored);
  }, []);

  const handleSave = () => {
    saveByokKeys(keys);
    setSaved(true);
    setHasExistingKeys(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleClear = () => {
    clearByokKeys();
    setKeys({ geminiApiKey: "", supabaseUrl: "", supabaseAnonKey: "" });
    setHasExistingKeys(false);
  };

  const geminiKeyValid =
    keys.geminiApiKey.startsWith("AIza") && keys.geminiApiKey.length > 20;

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/8">
        <ShieldCheck className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-300 space-y-0.5">
          <p className="font-semibold text-blue-200">
            Your keys stay on your device
          </p>
          <p className="text-xs text-blue-400">
            Keys are saved only in your browser&apos;s local storage and are
            never transmitted to any server. Clearing browser data will remove
            them.
          </p>
        </div>
      </div>

      {/* Club / Open-Source Context */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/30">
        <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-1">
            Why do I need my own keys?
          </p>
          <p className="text-xs">
            Novus is an open-source project — everyone runs their own free
            instance. Both Google Gemini and Supabase offer{" "}
            <strong className="text-foreground">permanent free tiers</strong>{" "}
            with no credit card required. Each member&apos;s data is stored only
            in their own account.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href="https://aistudio.google.com/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Get free Gemini key
            </a>
            <span className="text-border">·</span>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Create free Supabase project
            </a>
          </div>
        </div>
      </div>

      {/* Gemini API Key */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="gemini-key" className="flex items-center gap-2">
            <Key className="w-3.5 h-3.5" />
            Google Gemini API Key
            <span className="text-[10px] font-normal text-muted-foreground">
              (Required for AI features)
            </span>
          </Label>
          {geminiKeyValid && (
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Valid format
            </span>
          )}
        </div>
        <div className="relative">
          <Input
            id="gemini-key"
            type={showGemini ? "text" : "password"}
            placeholder="AIzaSy••••••••••••••••••••••••••••••••"
            value={keys.geminiApiKey}
            onChange={(e) =>
              setKeys((k) => ({ ...k, geminiApiKey: e.target.value }))
            }
            className="pr-10 font-mono text-sm"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowGemini((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showGemini ? "Hide key" : "Show key"}
          >
            {showGemini ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Free tier: 1,500 requests/day · 15 requests/minute. No credit card
          needed.
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-[11px] text-muted-foreground">
          Optional — for personal cloud sync
        </span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Supabase URL */}
      <div className="space-y-2">
        <Label htmlFor="supabase-url">Supabase Project URL</Label>
        <Input
          id="supabase-url"
          type="url"
          placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
          value={keys.supabaseUrl}
          onChange={(e) =>
            setKeys((k) => ({ ...k, supabaseUrl: e.target.value }))
          }
          className="font-mono text-sm"
          autoComplete="off"
        />
      </div>

      {/* Supabase Anon Key */}
      <div className="space-y-2">
        <Label htmlFor="supabase-anon-key" className="flex items-center gap-2">
          Supabase Anon Key
        </Label>
        <div className="relative">
          <Input
            id="supabase-anon-key"
            type={showAnonKey ? "text" : "password"}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9••••"
            value={keys.supabaseAnonKey}
            onChange={(e) =>
              setKeys((k) => ({ ...k, supabaseAnonKey: e.target.value }))
            }
            className="pr-10 font-mono text-sm"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => setShowAnonKey((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showAnonKey ? "Hide key" : "Show key"}
          >
            {showAnonKey ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Find it in your Supabase project → Settings → API → anon public key.
        </p>
      </div>

      {/* Without Supabase notice */}
      {!keys.supabaseUrl && !keys.supabaseAnonKey && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg border border-amber-500/20 bg-amber-500/8 text-amber-400 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
          <span>
            Without Supabase keys, resumes are saved to your browser&apos;s
            local storage only and won&apos;t sync across devices.
          </span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          onClick={handleSave}
          className="flex-1 gap-2"
          disabled={!keys.geminiApiKey}
        >
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Keys
            </>
          )}
        </Button>
        {hasExistingKeys && (
          <Button
            onClick={handleClear}
            variant="outline"
            className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </Button>
        )}
      </div>
    </div>
  );
}
