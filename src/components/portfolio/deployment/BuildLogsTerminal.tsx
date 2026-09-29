"use client";

import React, { useEffect, useRef } from "react";
import { DeploymentLogEntry } from "@/types/vercel-deploy";
import { Terminal, CheckCircle2, AlertCircle, Copy, Check } from "lucide-react";

interface BuildLogsTerminalProps {
  logs: DeploymentLogEntry[];
  isDeploying?: boolean;
}

export function BuildLogsTerminal({ logs, isDeploying }: BuildLogsTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  const copyAllLogs = () => {
    const raw = logs.map((l) => `[${l.timestamp.split("T")[1]?.slice(0, 8)}] [${l.phase.toUpperCase()}] ${l.message}`).join("\n");
    navigator.clipboard.writeText(raw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border bg-[#0B0F19] text-[#E2E8F0] shadow-md overflow-hidden font-mono text-xs">
      {/* Terminal Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#131B2E] border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1 ml-2">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span>vercel-build-pipeline</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isDeploying && (
            <span className="flex items-center gap-1.5 text-[10px] text-cyan-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Building...</span>
            </span>
          )}
          <button
            type="button"
            onClick={copyAllLogs}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 bg-secondary/30 hover:bg-secondary/60 px-2 py-0.5 rounded transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? "Copied" : "Copy Logs"}</span>
          </button>
        </div>
      </div>

      {/* Terminal Content Stream */}
      <div
        ref={terminalRef}
        className="p-4 max-h-[260px] overflow-y-auto space-y-1.5 leading-relaxed font-mono select-text"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground/60 italic py-4 text-center">
            Waiting to initialize Vercel deployment pipeline...
          </div>
        ) : (
          logs.map((log) => {
            const time = log.timestamp.split("T")[1]?.slice(0, 8) || "00:00:00";
            return (
              <div key={log.id} className="flex items-start gap-2 text-[11px]">
                <span className="text-muted-foreground/60 shrink-0">[{time}]</span>
                <span className={`shrink-0 font-bold uppercase text-[10px] px-1.5 py-0.2 rounded ${
                  log.phase === "synthesis" ? "text-purple-400 bg-purple-500/10" :
                  log.phase === "bundle" ? "text-blue-400 bg-blue-500/10" :
                  log.phase === "upload" ? "text-amber-400 bg-amber-500/10" :
                  log.phase === "edge_route" ? "text-cyan-400 bg-cyan-500/10" :
                  log.phase === "ready" ? "text-emerald-400 bg-emerald-500/10" : "text-slate-400 bg-slate-500/10"
                }`}>
                  {log.phase}
                </span>
                <span className={`flex-1 ${
                  log.type === "success" ? "text-emerald-300" :
                  log.type === "error" ? "text-rose-400 font-bold" : "text-slate-300"
                }`}>
                  {log.message}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
