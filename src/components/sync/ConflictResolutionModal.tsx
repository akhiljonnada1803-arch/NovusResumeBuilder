"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSyncStore } from "@/store/useSyncStore";
import { FieldConflict } from "@/types/sync";
import {
  AlertTriangle,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";

export function ConflictResolutionModal() {
  const isConflictModalOpen = useSyncStore((state) => state.isConflictModalOpen);
  const activeConflicts = useSyncStore((state) => state.activeConflicts);
  const sourceContext = useSyncStore((state) => state.sourceContext);
  const closeConflictModal = useSyncStore((state) => state.closeConflictModal);
  const onConflictsResolvedCallback = useSyncStore((state) => state.onConflictsResolvedCallback);

  const [resolutions, setResolutions] = useState<Record<string, "current" | "incoming">>({});

  // Initialize resolutions defaulting to "incoming"
  useEffect(() => {
    const initial: Record<string, "current" | "incoming"> = {};
    activeConflicts.forEach((c) => {
      initial[c.id] = c.selectedChoice || "incoming";
    });
    setResolutions(initial);
  }, [activeConflicts]);

  const handleSelectChoice = (conflictId: string, choice: "current" | "incoming") => {
    setResolutions((prev) => ({
      ...prev,
      [conflictId]: choice,
    }));
  };

  const handleSelectAll = (choice: "current" | "incoming") => {
    const updated: Record<string, "current" | "incoming"> = {};
    activeConflicts.forEach((c) => {
      updated[c.id] = choice;
    });
    setResolutions(updated);
  };

  const handleApplyResolutions = () => {
    if (onConflictsResolvedCallback) {
      onConflictsResolvedCallback(resolutions);
    }
    closeConflictModal();
  };

  if (!isConflictModalOpen || activeConflicts.length === 0) return null;

  const sourceName = sourceContext?.sourceName || "Source";
  const targetName = sourceContext?.targetName || "Target";

  return (
    <Dialog open={isConflictModalOpen} onOpenChange={(open) => !open && closeConflictModal()} maxWidth="4xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-foreground">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <DialogTitle>Sync Conflict Resolution</DialogTitle>
          </div>

          <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            {activeConflicts.length} Differences Detected
          </span>
        </div>
        <DialogDescription>
          Data has diverged between <strong>{sourceName}</strong> and <strong>{targetName}</strong>. Choose which value to preserve for each field below.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-2">
        {/* Bulk Choice Controls */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/40 border border-border text-xs">
          <span className="text-muted-foreground font-semibold">Bulk Actions:</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleSelectAll("current")}
              className="h-7 text-xs font-semibold"
            >
              Keep All Current ({targetName})
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => handleSelectAll("incoming")}
              className="h-7 text-xs font-semibold text-primary border-primary/30"
            >
              Accept All Incoming ({sourceName})
            </Button>
          </div>
        </div>

        {/* Conflicts List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {activeConflicts.map((conflict, idx) => {
            const currentChoice = resolutions[conflict.id] || "incoming";

            return (
              <div
                key={conflict.id || idx}
                className="p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-foreground flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{conflict.fieldLabel}</span>
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase">
                    {conflict.section}
                  </span>
                </div>

                {/* 2-Column Choice Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Current Value Card */}
                  <div
                    onClick={() => handleSelectChoice(conflict.id, "current")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      currentChoice === "current"
                        ? "bg-secondary text-foreground border-primary shadow-2xs ring-1 ring-primary/40"
                        : "bg-secondary/20 border-border text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-muted-foreground">
                        Current ({targetName})
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          currentChoice === "current"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-card"
                        }`}
                      >
                        {currentChoice === "current" && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                      {typeof conflict.currentValue === "object"
                        ? JSON.stringify(conflict.currentValue, null, 2)
                        : String(conflict.currentValue)}
                    </p>
                  </div>

                  {/* Incoming Value Card */}
                  <div
                    onClick={() => handleSelectChoice(conflict.id, "incoming")}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                      currentChoice === "incoming"
                        ? "bg-secondary text-foreground border-primary shadow-2xs ring-1 ring-primary/40"
                        : "bg-secondary/20 border-border text-muted-foreground hover:bg-secondary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-primary">
                        Incoming ({sourceName})
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          currentChoice === "incoming"
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-card"
                        }`}
                      >
                        {currentChoice === "incoming" && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-foreground whitespace-pre-wrap leading-relaxed">
                      {typeof conflict.incomingValue === "object"
                        ? JSON.stringify(conflict.incomingValue, null, 2)
                        : String(conflict.incomingValue)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={closeConflictModal}
            className="text-xs"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            onClick={handleApplyResolutions}
            className="h-8.5 px-6 text-xs font-bold gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Apply Selected Values & Synchronize</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
