"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { VoiceInterviewStudio } from "@/components/voice-interview/VoiceInterviewStudio";
import { Mic, ChevronDown } from "lucide-react";

export function VoiceInterviewPageClient() {
  const { resumes, activeResumeId } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState(activeResumeId);

  // Keep in sync if the user changes their active resume elsewhere
  useEffect(() => {
    setSelectedResumeId(activeResumeId);
  }, [activeResumeId]);

  const selectedResume =
    resumes.find((r) => r.id === selectedResumeId) ?? resumes[0] ?? null;

  const targetRole =
    selectedResume?.experience?.[0]?.position ?? "Software Engineer";

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Page Header with Resume Picker */}
      <div className="flex-none border-b border-border bg-background/80 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Voice Interview Studio
              </h1>
              <p className="text-xs text-muted-foreground">
                Speak naturally — AI listens, transcribes, and scores your
                answers
              </p>
            </div>
          </div>

          {/* Resume Picker */}
          {resumes.length > 1 && (
            <div className="relative">
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="appearance-none bg-card border border-border rounded-lg pl-3 pr-8 py-2 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.personalInfo.fullName
                      ? `${r.personalInfo.fullName} — ${r.design?.template || "Template"}`
                      : r.design?.template || "Untitled Resume"}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Studio — fills remaining height */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <VoiceInterviewStudio
          resume={selectedResume}
          targetRole={targetRole}
        />
      </div>
    </div>
  );
}
