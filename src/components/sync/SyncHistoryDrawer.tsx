"use client";

import React from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/store/useSyncStore";
import {
  History,
  Trash2,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
} from "lucide-react";

export function SyncHistoryDrawer() {
  const isHistoryDrawerOpen = useSyncStore((state) => state.isHistoryDrawerOpen);
  const setHistoryDrawerOpen = useSyncStore((state) => state.setHistoryDrawerOpen);
  const syncHistory = useSyncStore((state) => state.syncHistory);
  const clearHistory = useSyncStore((state) => state.clearHistory);

  if (!isHistoryDrawerOpen) return null;

  return (
    <Dialog open={isHistoryDrawerOpen} onOpenChange={setHistoryDrawerOpen} maxWidth="2xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <History className="w-5 h-5 text-primary" />
            <DialogTitle>Sync Audit History</DialogTitle>
          </div>

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
        <DialogDescription>
          Chronological record of data synchronization between your Resume and Portfolio workspaces.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-1">
        {syncHistory.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-2xl bg-secondary/20 space-y-2">
            <Clock className="w-8 h-8 text-muted-foreground mx-auto" />
            <h4 className="font-bold text-xs text-foreground">No Sync Records Yet</h4>
            <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
              Changes synchronized between your Resume and Portfolio will appear here as an audit trail.
            </p>
          </div>
        ) : (
          syncHistory.map((entry) => {
            const timeStr = new Date(entry.timestamp).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            });

            return (
              <div
                key={entry.id}
                className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        entry.status === "success"
                          ? "bg-emerald-500"
                          : entry.status === "conflicts-resolved"
                          ? "bg-amber-500"
                          : "bg-slate-400"
                      }`}
                    />
                    <span className="font-bold text-foreground">
                      {entry.sourceLabel} &rarr; {entry.targetLabel}
                    </span>
                  </div>

                  <span className="font-mono text-[10px] text-muted-foreground">{timeStr}</span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-secondary text-muted-foreground font-mono">
                    Direction: <strong className="text-foreground">{entry.direction}</strong>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                      entry.status === "success"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {entry.status === "success"
                      ? "Direct Sync"
                      : `Resolved ${entry.conflictsCount} Conflicts`}
                  </span>
                </div>

                {entry.changedFields && entry.changedFields.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-border/60">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Synchronized Fields:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {entry.changedFields.map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary/80 text-foreground border border-border/60"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Dialog>
  );
}
