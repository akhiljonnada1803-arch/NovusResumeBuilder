"use client";

import React from "react";
import { AlertTriangle, Mic, Video, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DevicePermissionFallbackProps {
  type: "camera" | "microphone" | "both";
  onRetry: () => void;
  onContinueWithoutDevice?: () => void;
}

export function DevicePermissionFallback({
  type,
  onRetry,
  onContinueWithoutDevice,
}: DevicePermissionFallbackProps) {
  return (
    <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 text-center space-y-4 max-w-lg mx-auto animate-in fade-in duration-200">
      <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
        <AlertTriangle className="w-6 h-6" />
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-sm text-foreground">
          {type === "both"
            ? "Camera & Microphone Access Required"
            : type === "camera"
            ? "Camera Access Denied or Unavailable"
            : "Microphone Access Denied or Unavailable"}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Please check your browser permissions to allow audio and video streaming, or continue with interactive text mode.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        <Button size="sm" variant="outline" onClick={onRetry} className="text-xs gap-1.5 font-medium">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Device Access</span>
        </Button>

        {onContinueWithoutDevice && (
          <Button size="sm" variant="radiant" onClick={onContinueWithoutDevice} className="text-xs font-semibold">
            Continue in Text Mode
          </Button>
        )}
      </div>
    </div>
  );
}
