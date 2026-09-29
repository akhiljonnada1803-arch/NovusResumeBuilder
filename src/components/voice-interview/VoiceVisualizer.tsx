"use client";

import React from "react";
import { VoicePipelineState } from "@/lib/voice/voice-engine";
import { Bot, Mic, Sparkles, Volume2, Loader2, Radio } from "lucide-react";

interface VoiceVisualizerProps {
  state: VoicePipelineState;
  volumeRms?: number;
}

export function VoiceVisualizer({ state, volumeRms = 0 }: VoiceVisualizerProps) {
  // Dynamic or simulated heights depending on state
  const isAISpeaking = state === "AI_SPEAKING";
  const isUserSpeaking = state === "USER_SPEAKING";
  const isListening = state === "LISTENING";
  const isProcessing = state === "PROCESSING";

  const dynamicHeight = Math.min(100, Math.max(15, Math.round(volumeRms * 800)));

  const barHeights = isAISpeaking
    ? [60, 90, 45, 100, 75, 95, 50, 85, 65, 90, 40, 80]
    : isUserSpeaking
    ? [
        dynamicHeight * 0.8,
        dynamicHeight,
        dynamicHeight * 1.1,
        dynamicHeight * 0.9,
        dynamicHeight * 1.2,
        dynamicHeight,
        dynamicHeight * 0.85,
        dynamicHeight * 1.15,
        dynamicHeight * 0.75,
        dynamicHeight * 1.05,
        dynamicHeight * 0.7,
        dynamicHeight * 0.9,
      ]
    : isListening
    ? [20, 30, 25, 35, 30, 25, 35, 30, 25, 30, 20, 25]
    : isProcessing
    ? [30, 45, 60, 75, 90, 75, 60, 45, 30, 45, 60, 30]
    : [15, 20, 15, 25, 20, 15, 25, 20, 15, 20, 15, 20];

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      {/* Central Visualizer Glowing Orb */}
      <div className="relative flex items-center justify-center">
        {/* Animated Glow Rings */}
        <div
          className={`absolute w-36 h-36 rounded-full transition-all duration-700 blur-xl opacity-60 ${
            isAISpeaking
              ? "bg-blue-500 scale-125 animate-pulse"
              : isUserSpeaking
              ? "bg-emerald-500 scale-125 animate-pulse"
              : isListening
              ? "bg-teal-500/40 scale-105"
              : isProcessing
              ? "bg-purple-500 scale-110 animate-spin"
              : "bg-slate-400/20 scale-95"
          }`}
        />

        <div
          className={`relative w-28 h-28 rounded-3xl border-2 flex flex-col items-center justify-center shadow-2xl transition-all duration-500 ${
            isAISpeaking
              ? "border-blue-400 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white shadow-blue-500/30 scale-105"
              : isUserSpeaking
              ? "border-emerald-400 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white shadow-emerald-500/30 scale-105"
              : isListening
              ? "border-teal-400/80 bg-gradient-to-br from-slate-900 to-teal-950 text-teal-300 shadow-teal-500/20"
              : isProcessing
              ? "border-purple-400 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-900 text-white shadow-purple-500/30"
              : "border-border bg-card text-muted-foreground"
          }`}
        >
          {isAISpeaking ? (
            <div className="flex flex-col items-center gap-1">
              <Volume2 className="w-8 h-8 animate-bounce" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">AI Speaking</span>
            </div>
          ) : isUserSpeaking ? (
            <div className="flex flex-col items-center gap-1">
              <Mic className="w-8 h-8 animate-pulse text-white" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Speaking</span>
            </div>
          ) : isListening ? (
            <div className="flex flex-col items-center gap-1">
              <Radio className="w-8 h-8 animate-pulse text-teal-400" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Listening</span>
            </div>
          ) : isProcessing ? (
            <div className="flex flex-col items-center gap-1">
              <Loader2 className="w-8 h-8 animate-spin text-purple-200" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Evaluating</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Bot className="w-8 h-8" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Animated Frequency Soundwaves */}
      <div className="flex items-center justify-center gap-1.5 h-12 w-64 px-4 bg-secondary/30 rounded-2xl border border-border">
        {barHeights.map((height, idx) => (
          <div
            key={idx}
            className={`w-2 rounded-full transition-all duration-150 ${
              isAISpeaking
                ? "bg-blue-500"
                : isUserSpeaking
                ? "bg-emerald-500"
                : isListening
                ? "bg-teal-400/60"
                : isProcessing
                ? "bg-purple-500"
                : "bg-muted-foreground/30"
            }`}
            style={{
              height: `${Math.min(100, Math.max(10, height))}%`,
              animationDelay: `${idx * 40}ms`,
            }}
          />
        ))}
      </div>

      {/* Status Label */}
      <div className="text-center space-y-0.5">
        <span
          className={`text-xs font-mono font-bold uppercase tracking-wider px-3.5 py-1 rounded-full border ${
            isAISpeaking
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
              : isUserSpeaking
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : isListening
              ? "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30"
              : isProcessing
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
              : "bg-secondary text-muted-foreground border-border"
          }`}
        >
          {isAISpeaking
            ? "🔊 Recruiter Speaking (Microphone Disabled)"
            : isUserSpeaking
            ? "🟢 Speech Detected • Auto-Submit after 2s Silence"
            : isListening
            ? "🎙️ VAD Active • Listening for Your Answer"
            : isProcessing
            ? "🤖 Processing Candidate Answer..."
            : "Click 'Start Speaking' to begin"}
        </span>
      </div>
    </div>
  );
}
