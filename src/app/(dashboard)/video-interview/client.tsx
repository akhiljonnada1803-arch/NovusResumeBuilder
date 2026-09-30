"use client";

import React, { useState, useEffect } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { VideoInterviewStudio } from "@/components/video-interview/VideoInterviewStudio";
import { Video, ChevronDown, AlertTriangle } from "lucide-react";

export function VideoInterviewPageClient() {
  const { resumes, activeResumeId } = useResumeStore();
  const [selectedResumeId, setSelectedResumeId] = useState(activeResumeId);
  const [cameraPermission, setCameraPermission] = useState<
    "unknown" | "granted" | "denied"
  >("unknown");

  // Keep in sync with active resume
  useEffect(() => {
    setSelectedResumeId(activeResumeId);
  }, [activeResumeId]);

  // Probe camera permission on mount so we can show a helpful banner
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions) return;
    navigator.permissions
      .query({ name: "camera" as PermissionName })
      .then((result) => {
        setCameraPermission(
          result.state === "granted"
            ? "granted"
            : result.state === "denied"
              ? "denied"
              : "unknown"
        );
        result.onchange = () => {
          setCameraPermission(
            result.state === "granted"
              ? "granted"
              : result.state === "denied"
                ? "denied"
                : "unknown"
          );
        };
      })
      .catch(() => {
        // Permissions API not available — let the studio handle it
      });
  }, []);

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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Video className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Video Interview Studio
              </h1>
              <p className="text-xs text-muted-foreground">
                Face-to-face AI recruiter with live eye contact &amp; posture
                analysis
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

        {/* Camera denied banner */}
        {cameraPermission === "denied" && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              Camera access is blocked. Open your browser settings and allow
              camera access for this site, then reload the page to start a video
              session.
            </span>
          </div>
        )}
      </div>

      {/* Studio — fills remaining height */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <VideoInterviewStudio
          resume={selectedResume}
          targetRole={targetRole}
        />
      </div>
    </div>
  );
}
