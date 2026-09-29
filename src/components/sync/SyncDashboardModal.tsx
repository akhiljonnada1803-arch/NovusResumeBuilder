"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/store/useSyncStore";
import { useToast } from "@/components/ui/toast";
import { globalSyncQueue } from "@/lib/sync/sync-queue";
import { SyncQueueItem, SelectiveSyncConfig, SyncDirection } from "@/types/sync";
import {
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  ArrowRight,
  ArrowRightLeft,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Layers,
  Terminal,
  Activity,
  Check,
  X,
  Play,
  RotateCcw,
  Zap,
  Lock,
} from "lucide-react";

interface SyncDashboardModalProps {
  onManualSyncTrigger?: () => void;
}

export function SyncDashboardModal({ onManualSyncTrigger }: SyncDashboardModalProps) {
  const { success, error: showErrorToast } = useToast();
  const isSyncDashboardOpen = useSyncStore((state) => state.isSyncDashboardOpen);
  const setSyncDashboardOpen = useSyncStore((state) => state.setSyncDashboardOpen);

  const syncSettings = useSyncStore((state) => state.syncSettings);
  const updateSyncSettings = useSyncStore((state) => state.updateSyncSettings);
  const updateSelectiveSync = useSyncStore((state) => state.updateSelectiveSync);

  const syncHistory = useSyncStore((state) => state.syncHistory);
  const clearHistory = useSyncStore((state) => state.clearHistory);

  const syncLogs = useSyncStore((state) => state.syncLogs);
  const clearLogs = useSyncStore((state) => state.clearLogs);

  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [activeTab, setActiveTab] = useState<"controls" | "queue" | "history" | "logs">("controls");

  // Subscribe to sync queue
  useEffect(() => {
    const unsubscribe = globalSyncQueue.subscribe((updatedQueue) => {
      setQueue(updatedQueue);
    });
    return () => unsubscribe();
  }, []);

  if (!isSyncDashboardOpen) return null;

  const handleToggleSection = (sectionKey: keyof SelectiveSyncConfig) => {
    const updatedVal = !syncSettings.selectiveSync[sectionKey];
    updateSelectiveSync({ [sectionKey]: updatedVal });
    success(`${updatedVal ? "Enabled" : "Disabled"} sync for ${sectionKey}`);
  };

  const handleRetryJob = (jobId: string) => {
    globalSyncQueue.retryJob(jobId);
    success("Retrying sync job...");
  };

  const handleClearCompletedQueue = () => {
    globalSyncQueue.clearCompleted();
    success("Cleared completed queue tasks.");
  };

  const lastSyncedTime = syncSettings.lastSyncedAt
    ? new Date(syncSettings.lastSyncedAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Never";

  return (
    <Dialog open={isSyncDashboardOpen} onOpenChange={setSyncDashboardOpen} maxWidth="4xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-bold text-foreground">
            <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Career Data Synchronization Command Center</DialogTitle>
              <span className="text-[11px] text-muted-foreground font-normal block">
                Single source of truth management between ATS Resumes and Vercel Portfolios.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onManualSyncTrigger && (
              <Button
                size="sm"
                variant="radiant"
                onClick={() => {
                  onManualSyncTrigger();
                  success("Triggered manual synchronization cycle!");
                }}
                className="h-8 text-xs font-bold gap-1.5 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync Now</span>
              </Button>
            )}
          </div>
        </div>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        {/* Status Telemetry Banner */}
        <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Sync Engine Status
              </span>
              <div className="flex items-center gap-2 font-bold text-foreground">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{syncSettings.autoSyncEnabled ? "Auto Sync Active" : "Manual Sync Only"}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Last Synced
              </span>
              <span className="font-bold text-foreground block font-mono text-[11px]">
                {lastSyncedTime}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Active Queue Jobs
              </span>
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{queue.filter((q) => q.status === "pending" || q.status === "processing").length} Pending</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary/40 border border-border/80 space-y-1">
              <span className="text-[10px] font-mono uppercase text-muted-foreground block font-bold">
                Total Audit Sessions
              </span>
              <span className="font-bold text-foreground block font-mono text-[11px]">
                {syncHistory.length} Sessions Logged
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1.5 bg-secondary/50 p-1 rounded-xl border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("controls")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "controls"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
            <span>Selective Sync & Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "queue"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Queue Monitor ({queue.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "history"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>History ({syncHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeTab === "logs"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-purple-500" />
            <span>Diagnostic Logs ({syncLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: Controls & Selective Sync Matrix */}
        {activeTab === "controls" && (
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {/* Mode Switches */}
            <div className="p-4 rounded-2xl border border-border bg-card space-y-4 text-xs">
              <span className="font-bold text-foreground block">Synchronization Policy</span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Auto Sync Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">Real-Time Auto Sync</span>
                    <p className="text-[11px] text-muted-foreground">
                      Debounced background propagation when editing.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSyncSettings({ autoSyncEnabled: !syncSettings.autoSyncEnabled })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      syncSettings.autoSyncEnabled ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                        syncSettings.autoSyncEnabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Prompt on Conflicts Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-foreground block">Conflict Resolution Prompt</span>
                    <p className="text-[11px] text-muted-foreground">
                      Always show Current vs Incoming modal on divergence.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSyncSettings({ promptOnConflicts: !syncSettings.promptOnConflicts })}
                    className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                      syncSettings.promptOnConflicts ? "bg-primary" : "bg-muted-foreground/30"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform absolute top-1 left-1 ${
                        syncSettings.promptOnConflicts ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Selective Sync Section Matrix */}
            <div className="p-4 rounded-2xl border border-border bg-card space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-foreground block">Selective Sync Matrix</span>
                  <p className="text-[11px] text-muted-foreground">
                    Choose exactly which career entities synchronize between your Resume and Portfolio.
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Granular Filters
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 pt-1">
                {[
                  { key: "skills", label: "Skills & Tech Stack", desc: "Taxonomies, levels, categories" },
                  { key: "projects", label: "Projects & Showcases", desc: "Descriptions, URLs, repos" },
                  { key: "experience", label: "Work Experience", desc: "Roles, companies, highlights" },
                  { key: "education", label: "Education & Degrees", desc: "Institutions, GPA, dates" },
                  { key: "certifications", label: "Certifications", desc: "Credentials, issuers, licenses" },
                  { key: "personalInfo", label: "Contact & Social Links", desc: "GitHub, LinkedIn, Email" },
                ].map((item) => {
                  const isEnabled = syncSettings.selectiveSync[item.key as keyof SelectiveSyncConfig];

                  return (
                    <div
                      key={item.key}
                      onClick={() => handleToggleSection(item.key as keyof SelectiveSyncConfig)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                        isEnabled
                          ? "bg-secondary text-foreground border-primary/60 shadow-2xs"
                          : "bg-secondary/20 border-border text-muted-foreground hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs">{item.label}</span>
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                            isEnabled ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card"
                          }`}
                        >
                          {isEnabled && <Check className="w-2.5 h-2.5" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-tight">{item.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Sync Queue Monitor */}
        {activeTab === "queue" && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Background Task Queue</span>
              {queue.some((q) => q.status === "completed" || q.status === "failed") && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearCompletedQueue}
                  className="h-7 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear Finished Jobs
                </Button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-secondary/20 text-xs text-muted-foreground space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <span className="font-bold text-foreground block">Queue is Empty</span>
                <p className="text-[11px]">All real-time and scheduled sync tasks are up to date.</p>
              </div>
            ) : (
              queue.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-foreground">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.status === "processing"
                            ? "bg-blue-500 animate-spin"
                            : item.status === "completed"
                            ? "bg-emerald-500"
                            : item.status === "failed"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                      <span>{item.sourceName} &rarr; {item.targetName}</span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                        item.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : item.status === "failed"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30"
                          : item.status === "processing"
                          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>Enqueued: {new Date(item.enqueuedAt).toLocaleTimeString()}</span>
                    {item.status === "failed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetryJob(item.id)}
                        className="h-6 text-[10px] gap-1 text-primary"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>Retry</span>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: History & Audit Trail */}
        {activeTab === "history" && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Audit Session Log</span>
              {syncHistory.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearHistory}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear History</span>
                </Button>
              )}
            </div>

            {syncHistory.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-secondary/20 text-xs text-muted-foreground">
                No past sync sessions recorded yet.
              </div>
            ) : (
              syncHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      {entry.sourceLabel} &rarr; {entry.targetLabel}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {entry.direction}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      {entry.status}
                    </span>
                  </div>
                  {entry.notes && <p className="text-[11px] text-muted-foreground">{entry.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Diagnostic Logs */}
        {activeTab === "logs" && (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Live Operational Stream</span>
              {syncLogs.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={clearLogs}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear Logs</span>
                </Button>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-black text-emerald-400 font-mono text-[11px] space-y-1 overflow-x-auto max-h-[350px]">
              {syncLogs.length === 0 ? (
                <div className="text-slate-500 italic py-2">-- No logs recorded yet --</div>
              ) : (
                syncLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2">
                    <span className="text-slate-500 select-none">
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span
                      className={`font-bold select-none ${
                        log.level === "error"
                          ? "text-rose-400"
                          : log.level === "warn"
                          ? "text-amber-400"
                          : log.level === "success"
                          ? "text-emerald-400"
                          : "text-blue-400"
                      }`}
                    >
                      [{log.level.toUpperCase()}]
                    </span>
                    <span className="text-slate-200">{log.event}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
