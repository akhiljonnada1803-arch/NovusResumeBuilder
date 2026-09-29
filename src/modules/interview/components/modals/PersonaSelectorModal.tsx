"use client";

import React from "react";
import {
  RecruiterPersonaId,
  RecruiterPersonaProfile,
  RECRUITER_PERSONAS,
} from "../../types";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Check, ShieldCheck, Zap } from "lucide-react";

interface PersonaSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPersonaId: RecruiterPersonaId;
  onSelectPersona: (id: RecruiterPersonaId) => void;
}

export function PersonaSelectorModal({
  open,
  onOpenChange,
  selectedPersonaId,
  onSelectPersona,
}: PersonaSelectorModalProps) {
  const personas = Object.values(RECRUITER_PERSONAS);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="lg">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <Bot className="w-5 h-5 text-primary" />
          <DialogTitle>Select Your AI Recruiter Persona</DialogTitle>
        </div>
        <DialogDescription>
          Choose the interviewer archetype, evaluation rigor, and questioning style for your session.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 py-2">
        {personas.map((persona) => {
          const isSelected = persona.id === selectedPersonaId;

          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 relative ${
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-xs"
                  : "border-border bg-card hover:border-primary/40 hover:bg-secondary/30"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-tr ${persona.accentColor} flex items-center justify-center text-white font-bold text-sm shadow-xs`}
                  >
                    {persona.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{persona.name}</h4>
                    <p className="text-[11px] text-muted-foreground">{persona.title}</p>
                  </div>
                </div>

                {isSelected && (
                  <div className="p-1 rounded-full bg-primary text-primary-foreground shadow-2xs">
                    <Check className="w-3 h-3" />
                  </div>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {persona.toneDescription}
              </p>

              <div className="p-2 rounded-lg bg-secondary/60 border border-border text-[10px] space-y-1">
                <span className="font-bold text-primary block flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {persona.scoringFocus.primaryMetric}
                </span>
                <p className="text-muted-foreground line-clamp-1">{persona.scoringFocus.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button size="sm" variant="radiant" onClick={() => onOpenChange(false)} className="text-xs font-semibold">
          Confirm Persona Selection
        </Button>
      </div>
    </Dialog>
  );
}
