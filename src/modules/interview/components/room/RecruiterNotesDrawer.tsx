"use client";

import React from "react";
import { RecruiterPersonaProfile } from "../../types";
import { FileText } from "lucide-react";

interface RecruiterNotesDrawerProps {
  persona: RecruiterPersonaProfile;
  notes: { note: string; stage: string }[];
}

export function RecruiterNotesDrawer({ persona, notes }: RecruiterNotesDrawerProps) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-primary" />
          <span>{persona.name}&apos;s Live Evaluation Log</span>
        </h3>
        <span className="text-[10px] font-mono text-muted-foreground">
          {notes.length} observations
        </span>
      </div>

      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 text-xs">
        {notes.length === 0 ? (
          <p className="text-[11px] text-muted-foreground italic py-2">
            No active notes yet. {persona.name} will log technical observations as you speak.
          </p>
        ) : (
          notes.map((n, i) => (
            <div key={i} className="p-2 rounded-lg bg-secondary/40 border border-border/60 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-primary block">
                [{n.stage}]
              </span>
              <p className="text-[11px] text-foreground leading-relaxed">{n.note}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
