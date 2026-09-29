"use client";

import React from "react";
import { ShieldAlert, KeyRound, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIServiceFallbackProps {
  onRetry?: () => void;
}

export function AIServiceFallback({ onRetry }: AIServiceFallbackProps) {
  return (
    <div className="p-4 rounded-xl border border-slate-500/20 bg-slate-500/5 text-xs text-foreground space-y-2.5">
      <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
        <ShieldAlert className="w-4 h-4 text-amber-500" />
        <span>Evidence-Based Evaluation Notice</span>
      </div>

      <p className="text-muted-foreground leading-relaxed text-[11px]">
        The AI Evaluation service is running in local grounded fallback mode. To maintain evaluation integrity,
        fabricated scores are suppressed until live Gemini verification is available.
      </p>

      {onRetry && (
        <div className="flex items-center gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={onRetry} className="h-7 text-[11px] gap-1.5">
            <RefreshCw className="w-3 h-3" />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}
    </div>
  );
}
