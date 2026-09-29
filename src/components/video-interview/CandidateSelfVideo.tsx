"use client";

import React, { useEffect, useRef, useState } from "react";
import { globalCameraService, CameraDiagnosticsInfo } from "@/lib/video/camera-service";
import { CameraDiagnosticsPanel } from "./CameraDiagnosticsPanel";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Eye,
  Activity,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CandidateSelfVideoProps {
  candidateName: string;
  isRecordingMic?: boolean;
  cameraEnabled?: boolean;
  liveEyeContact?: number;
  livePaceWpm?: number;
  className?: string;
}

export function CandidateSelfVideo({
  candidateName,
  isRecordingMic = false,
  cameraEnabled = true,
  liveEyeContact = 92,
  livePaceWpm = 135,
  className = "",
}: CandidateSelfVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(globalCameraService.getStream());
  const [diag, setDiag] = useState<CameraDiagnosticsInfo>(globalCameraService.getDiagnostics());
  const [showDiagPanel, setShowDiagPanel] = useState(false);

  // Subscribe to camera stream & diagnostics
  useEffect(() => {
    const unsubStream = globalCameraService.onStreamChange((activeStream) => {
      setStream(activeStream);
      if (videoRef.current && activeStream) {
        globalCameraService.attachToVideoElement(videoRef.current);
      }
    });

    const unsubDiag = globalCameraService.onDiagnosticsChange((d) => {
      setDiag({ ...d });
    });

    // Auto-attach if stream already exists
    if (videoRef.current) {
      globalCameraService.attachToVideoElement(videoRef.current);
    }

    return () => {
      unsubStream();
      unsubDiag();
    };
  }, []);

  // Ensure stream stays attached on re-renders or camera enable toggles
  useEffect(() => {
    if (videoRef.current && cameraEnabled && stream) {
      globalCameraService.attachToVideoElement(videoRef.current);
    }
  }, [cameraEnabled, stream]);

  const hasHardwareError = Boolean(diag.errorMessage && (!stream || !diag.cameraActive));

  return (
    <div
      className={`relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center shadow-lg group select-none ${className}`}
    >
      {/* 1. Live Video Stream */}
      {cameraEnabled && !hasHardwareError && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              globalCameraService.updateDiagnostics();
            }
          }}
        />
      )}

      {/* 2. Camera Disabled / Muted State */}
      {!cameraEnabled && !hasHardwareError && (
        <div className="flex flex-col items-center justify-center gap-3 p-6 text-center animate-in fade-in duration-200">
          <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-300 font-bold text-2xl shadow-inner">
            {candidateName
              ? candidateName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
              : "YOU"}
          </div>
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-200 block">{candidateName}</span>
            <span className="text-[10px] text-slate-400 font-mono">Camera Paused</span>
          </div>
        </div>
      )}

      {/* 3. Hardware / Permission Error Screen */}
      {hasHardwareError && (
        <div className="p-6 text-center space-y-3 max-w-sm mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto shadow-md">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-white">
              {diag.errorType === "permission_denied"
                ? "Camera Permission Required"
                : diag.errorType === "device_busy"
                ? "Camera Device Busy"
                : "Camera Not Found"}
            </h4>
            <p className="text-[11px] text-slate-300 leading-relaxed">{diag.errorMessage}</p>
          </div>
          <Button
            size="sm"
            variant="radiant"
            onClick={() => globalCameraService.startCamera(true, true)}
            className="h-8 px-4 text-xs font-bold gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}

      {/* 4. Candidate Identification Badge (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-semibold flex items-center gap-1.5 shadow-md">
        <span
          className={`w-2 h-2 rounded-full ${
            isRecordingMic ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
          }`}
        />
        <span>You ({candidateName || "Candidate"})</span>
        {isRecordingMic ? (
          <Mic className="w-3 h-3 text-emerald-400 animate-bounce" />
        ) : (
          <MicOff className="w-3 h-3 text-slate-400" />
        )}
      </div>

      {/* 5. Real-Time HUD & Diagnostics Floating Bar (Top-Right) */}
      <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
        <div className="flex items-center gap-1.5">
          {/* Gaze telemetry */}
          <div className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs border border-white/10 text-white font-mono text-[10px] flex items-center gap-1">
            <Eye className="w-3 h-3 text-blue-400" />
            <span>Gaze: {liveEyeContact}%</span>
          </div>

          {/* Pace telemetry */}
          <div className="px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-xs border border-white/10 text-white font-mono text-[10px] flex items-center gap-1">
            <Activity className="w-3 h-3 text-purple-400" />
            <span>{livePaceWpm} WPM</span>
          </div>

          {/* Diagnostics toggle button */}
          <button
            type="button"
            onClick={() => setShowDiagPanel(!showDiagPanel)}
            className="p-1 rounded-full bg-black/75 border border-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Toggle Camera Diagnostics"
          >
            <Sliders className="w-3 h-3" />
          </button>
        </div>

        {/* Compact Diagnostics Pill */}
        <CameraDiagnosticsPanel compact />
      </div>

      {/* 6. Diagnostics Popover Drawer */}
      {showDiagPanel && (
        <div className="absolute inset-x-3 top-12 z-20 animate-in fade-in zoom-in-95 duration-200">
          <CameraDiagnosticsPanel onRetry={() => setShowDiagPanel(false)} />
        </div>
      )}
    </div>
  );
}
