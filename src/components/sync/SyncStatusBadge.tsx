"use client";

import React from "react";
import { useSyncStore } from "@/store/useSyncStore";
import { SyncStatus } from "@/types/sync";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  History,
  Sparkles,
  SlidersHorizontal,
  Layers,
} from "lucide-react";

interface SyncStatusBadgeProps {
  status?: SyncStatus;
  lastSyncedAt?: string;
  onTriggerSync?: () => void;
  isSyncing?: boolean;
  className?: string;
}

export function SyncStatusBadge({
  status = "in-sync",
  lastSyncedAt,
  onTriggerSync,
  isSyncing = false,
  className = "",
}: SyncStatusBadgeProps) {
  const syncSettings = useSyncStore((state) => state.syncSettings);
  const setSyncDashboardOpen = useSyncStore((state) => state.setSyncDashboardOpen);

  const displayTime = lastSyncedAt || syncSettings.lastSyncedAt;
  const formattedTime = displayTime
    ? new Date(displayTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Never";

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Visual Status Indicator Button (Opens Dashboard) */}
      <button
        type="button"
        onClick={() => setSyncDashboardOpen(true)}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-semibold border transition-all cursor-pointer hover:opacity-90 ${
          isSyncing
            ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
            : status === "in-sync"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
            : status === "conflicts"
            ? "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
            : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
        }`}
        title="Click to open Synchronization Command Center"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            isSyncing
              ? "bg-blue-500 animate-pulse"
              : status === "in-sync"
              ? "bg-emerald-500"
              : status === "conflicts"
              ? "bg-rose-500 animate-pulse"
              : "bg-amber-500"
          }`}
        />
        <span>
          {isSyncing
            ? "Syncing..."
            : status === "in-sync"
            ? "In Sync"
            : status === "conflicts"
            ? "Conflicts Detected"
            : "Unsynced Changes"}
        </span>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          ({formattedTime})
        </span>
      </button>

      {/* Sync Trigger Action Button */}
      {onTriggerSync && (
        <Button
          size="sm"
          variant="outline"
          onClick={onTriggerSync}
          disabled={isSyncing}
          className="h-7 text-xs gap-1 font-semibold border-border hover:bg-secondary"
          title="Synchronize Career Profile"
        >
          <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin text-primary" : ""}`} />
          <span className="hidden sm:inline">Sync Now</span>
        </Button>
      )}

      {/* Sync Dashboard Trigger */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setSyncDashboardOpen(true)}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
        title="Open Synchronization Settings & Logs"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
}
