"use client";

import React from "react";
import { RecruiterPersonaProfile, RecruiterInternalState } from "../../types";
import { Bot, Volume2, Sparkles } from "lucide-react";

interface LiveRecruiterTileProps {
  persona: RecruiterPersonaProfile;
  internalState: RecruiterInternalState;
  isSpeaking: boolean;
  activeTurnText?: string;
}

export function LiveRecruiterTile({
  persona,
  internalState,
  isSpeaking,
  activeTurnText,
}: LiveRecruiterTileProps) {
  return (
    <div className="relative rounded-2xl border border-border bg-gradient-to-b from-card to-secondary/30 overflow-hidden shadow-xs flex flex-col h-[340px] sm:h-[400px]">
      {/* Top Banner Tag */}
      <div className="p-3 border-b border-border/80 flex items-center justify-between bg-card/60 backdrop-blur-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-foreground">{persona.name}</span>
          <span className="text-[10px] text-muted-foreground hidden sm:inline">• {persona.title}</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-[10px] font-mono font-semibold border border-border">
          <span>{internalState.emotionEmoji || "🧐"}</span>
          <span className="truncate max-w-[120px]">{internalState.technicalImpression || "Evaluating"}</span>
        </div>
      </div>

      {/* Main Recruiter Avatar Tile */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative space-y-4">
        <div className="relative">
          {/* Animated Glow when speaking */}
          <div
            className={`w-28 h-28 rounded-full bg-gradient-to-tr ${persona.accentColor} flex items-center justify-center shadow-lg transition-all duration-300 ${
              isSpeaking ? "scale-105 ring-4 ring-primary/40" : "scale-100"
            }`}
          >
            <span className="text-3xl font-black text-white">{persona.name.charAt(0)}</span>
          </div>

          {isSpeaking && (
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-primary text-primary-foreground shadow-md animate-bounce">
              <Volume2 className="w-4 h-4" />
            </div>
          )}
        </div>

        <div className="space-y-1 max-w-md">
          <h3 className="font-bold text-sm text-foreground">{persona.name}</h3>
          <p className="text-xs text-muted-foreground">{persona.company}</p>
        </div>

        {/* Live Speaking Caption Overlay */}
        {activeTurnText && (
          <div className="w-full max-w-lg p-3 rounded-xl bg-background/90 border border-border text-xs text-foreground leading-relaxed shadow-sm">
            <p className="line-clamp-3 italic">&ldquo;{activeTurnText}&rdquo;</p>
          </div>
        )}
      </div>

      {/* Bottom Recruiter Emotion Bar */}
      <div className="p-2.5 border-t border-border/80 bg-secondary/40 flex items-center justify-between text-[11px] text-muted-foreground px-4">
        <span className="flex items-center gap-1.5 truncate">
          <Sparkles className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{internalState.activeEmotion || "Evaluating technical depth"}</span>
        </span>

        <span className="font-mono font-semibold text-foreground shrink-0 ml-2">
          Interest: {internalState.interestLevel}%
        </span>
      </div>
    </div>
  );
}
