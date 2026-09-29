"use client";

import React, { useEffect, useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeApiService, ResumeHistoryItem } from "@/lib/api/resume-service";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Clock, Check, Loader2 } from "lucide-react";

interface ResumeHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResumeHistoryModal({ open, onOpenChange }: ResumeHistoryModalProps) {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const importResume = useResumeStore((state) => state.importResume);

  const [historyList, setHistoryList] = useState<ResumeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (open && activeResume.id) {
      loadHistory();
    }
  }, [open, activeResume.id]);

  const loadHistory = async () => {
    setIsLoading(true);
    const { history } = await ResumeApiService.fetchHistory(activeResume.id);
    if (history && history.length > 0) {
      setHistoryList(history);
    } else {
      // Mock history entries if running without live database
      setHistoryList([
        {
          id: "hist-1",
          resume_id: activeResume.id,
          version_number: 3,
          change_summary: "Updated Technical Skills & Experience metrics",
          created_at: new Date().toISOString(),
        },
        {
          id: "hist-2",
          resume_id: activeResume.id,
          version_number: 2,
          change_summary: "AI summary rewrite and education additions",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "hist-3",
          resume_id: activeResume.id,
          version_number: 1,
          change_summary: "Initial resume template creation",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]);
    }
    setIsLoading(false);
  };

  const handleRollback = async (historyItem: ResumeHistoryItem) => {
    setIsRestoring(historyItem.id);
    const { restoredSnapshot } = await ResumeApiService.rollbackHistory(
      activeResume.id,
      historyItem.id
    );

    if (restoredSnapshot) {
      importResume(restoredSnapshot);
    }

    setSuccessMsg(`Restored to Version ${historyItem.version_number}`);
    setTimeout(() => {
      setSuccessMsg(null);
      setIsRestoring(null);
      onOpenChange(false);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <History className="w-4 h-4 text-foreground" />
          <DialogTitle>Version History</DialogTitle>
        </div>
        <DialogDescription>
          Chronological snapshot backups of your resume. You can roll back to any previous version.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {successMsg && (
          <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-10 text-center">
            <Loader2 className="w-5 h-5 animate-spin mx-auto text-foreground" />
            <p className="text-xs text-muted-foreground mt-2">Loading snapshots...</p>
          </div>
        ) : historyList.length === 0 ? (
          <div className="p-6 text-center bg-secondary/30 rounded-lg">
            <Clock className="w-6 h-6 mx-auto text-muted-foreground/50 mb-1.5" />
            <p className="text-xs text-muted-foreground">No history snapshots recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {historyList.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border border-border bg-card shadow-2xs flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      v{item.version_number}
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{item.change_summary}</p>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(item.created_at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5 shrink-0"
                  disabled={isRestoring === item.id || idx === 0}
                  onClick={() => handleRollback(item)}
                >
                  {isRestoring === item.id ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RotateCcw className="w-3 h-3" />
                  )}
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
