"use client";

import React, { useState, useEffect } from "react";
import { CameraDiagnosticsInfo, globalCameraService } from "@/lib/video/camera-service";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Monitor,
  Activity,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraDiagnosticsPanelProps {
  compact?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function CameraDiagnosticsPanel({
  compact = false,
  onRetry,
  className = "",
}: CameraDiagnosticsPanelProps) {
  const [diag, setDiag] = useState<CameraDiagnosticsInfo>(globalCameraService.getDiagnostics());

  useEffect(() => {
    const unsub = globalCameraService.onDiagnosticsChange((updated) => {
      setDiag({ ...updated });
    });
    return () => unsub();
  }, []);

  const handleRetry = async () => {
    await globalCameraService.startCamera(true, true);
    if (onRetry) onRetry();
  };

  const getPermissionBadge = () => {
    switch (diag.permissionStatus) {
      case "granted":
        return {
          label: "Granted",
          bg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
          icon: CheckCircle2,
        };
      case "denied":
        return {
          label: "Denied / Blocked",
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          icon: XCircle,
        };
      case "busy":
        return {
          label: "Device Busy",
          bg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
          icon: AlertTriangle,
        };
      case "not-found":
        return {
          label: "Not Found",
          bg: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30",
          icon: XCircle,
        };
      default:
        return {
          label: "Prompt / Checking",
          bg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
          icon: RefreshCw,
        };
    }
  };

  const permBadge = getPermissionBadge();

  // Compact Pills Mode for Floating HUD inside video player
  if (compact) {
    return (
      <div className={`flex items-center flex-wrap gap-1.5 ${className}`}>
        {/* Camera Active Pill */}
        <div
          className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold flex items-center gap-1 backdrop-blur-xs ${
            diag.cameraActive
              ? "bg-black/75 border-emerald-500/40 text-emerald-300"
              : "bg-black/75 border-rose-500/40 text-rose-300"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              diag.cameraActive ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
            }`}
          />
          <span>{diag.cameraActive ? "Camera Active" : "Camera Off"}</span>
        </div>

        {/* Resolution & FPS */}
        {diag.cameraActive && (
          <div className="px-2 py-0.5 rounded-full bg-black/75 border border-white/10 text-slate-200 font-mono text-[10px] flex items-center gap-1 backdrop-blur-xs">
            <Monitor className="w-2.5 h-2.5 text-blue-400" />
            <span>{diag.resolution}</span>
            <span className="text-slate-400">@</span>
            <span>{diag.fps} FPS</span>
          </div>
        )}

        {/* Permission Status */}
        <div
          className={`px-2 py-0.5 rounded-full border text-[10px] font-mono font-semibold flex items-center gap-1 backdrop-blur-xs ${permBadge.bg}`}
        >
          <permBadge.icon className="w-2.5 h-2.5" />
          <span>Perm: {permBadge.label}</span>
        </div>
      </div>
    );
  }

  // Full Diagnostics Card
  return (
    <div className={`p-4 rounded-2xl border border-border bg-card shadow-2xs space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Camera & Audio Diagnostics</h4>
            <p className="text-[10px] text-muted-foreground">Real-time hardware feed inspection</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleRetry}
          className="h-7 px-2.5 text-[10px] font-bold gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Meaningful Error Alerts */}
      {diag.errorMessage && (
        <div
          className={`p-3 rounded-xl border text-xs leading-relaxed space-y-1 ${
            diag.errorType === "permission_denied"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
              : diag.errorType === "device_busy"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300"
              : "bg-destructive/10 border-destructive/30 text-destructive"
          }`}
        >
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {diag.errorType === "permission_denied"
                ? "Camera Permission Denied"
                : diag.errorType === "device_busy"
                ? "Camera Device Busy"
                : diag.errorType === "device_missing"
                ? "No Camera Hardware Found"
                : "Camera Connection Error"}
            </span>
          </div>
          <p className="text-[11px] opacity-90">{diag.errorMessage}</p>
        </div>
      )}

      {/* Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Item 1: Camera Found */}
        <div className="p-2.5 rounded-xl bg-secondary/30 border border-border space-y-0.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Camera Found</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                diag.cameraFound ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-bold text-foreground truncate">
              {diag.cameraFound ? "Connected" : "Not Detected"}
            </span>
          </div>
        </div>

        {/* Item 2: Camera Active */}
        <div className="p-2.5 rounded-xl bg-secondary/30 border border-border space-y-0.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Camera Active</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                diag.cameraActive ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            <span className="text-xs font-bold text-foreground">
              {diag.cameraActive ? "Live Stream" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Item 3: Resolution & FPS */}
        <div className="p-2.5 rounded-xl bg-secondary/30 border border-border space-y-0.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Resolution & FPS</span>
          <div className="flex items-center gap-1">
            <span className="text-xs font-mono font-bold text-foreground">
              {diag.cameraActive ? diag.resolution : "0 × 0"}
            </span>
            {diag.cameraActive && (
              <span className="text-[10px] font-mono text-primary">({diag.fps} FPS)</span>
            )}
          </div>
        </div>

        {/* Item 4: Permission Status */}
        <div className="p-2.5 rounded-xl bg-secondary/30 border border-border space-y-0.5">
          <span className="text-[10px] font-mono text-muted-foreground uppercase block">Permissions</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono border ${permBadge.bg}`}
            >
              {permBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* Device Name Footer */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/60">
        <span className="truncate max-w-[250px] sm:max-w-xs">📹 {diag.deviceName}</span>
        <span className="truncate max-w-[200px]">🎙️ {diag.audioDeviceName}</span>
      </div>
    </div>
  );
}
