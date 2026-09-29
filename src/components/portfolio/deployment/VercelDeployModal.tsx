"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Resume } from "@/types/resume";
import { PortfolioTheme, PortfolioSectionConfig } from "@/types/portfolio";
import { DeploymentLogEntry, VercelDeploymentResult } from "@/types/vercel-deploy";
import { BuildLogsTerminal } from "./BuildLogsTerminal";
import {
  Globe,
  ExternalLink,
  Copy,
  Check,
  Rocket,
  CheckCircle2,
  Lock,
} from "lucide-react";

interface VercelDeployModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: Resume;
  theme: PortfolioTheme;
  sections?: PortfolioSectionConfig[];
}

export function VercelDeployModal({
  open,
  onOpenChange,
  resume,
  theme,
  sections,
}: VercelDeployModalProps) {
  const { success, error: showErrorToast } = useToast();

  const candidateName = resume.personalInfo?.fullName || "Candidate";
  const defaultProjectName = `${candidateName.toLowerCase().replace(/[^a-z0-9]/g, "")}-portfolio`;

  const [projectName, setProjectName] = useState(defaultProjectName);
  const [vercelToken, setVercelToken] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentResult, setDeploymentResult] = useState<VercelDeploymentResult | null>(null);
  const [logs, setLogs] = useState<DeploymentLogEntry[]>([]);
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    setIsDeploying(true);
    setLogs([]);

    try {
      // Fix #1: token sent as Authorization header, not in the request body
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (vercelToken.trim()) headers["Authorization"] = `Bearer ${vercelToken.trim()}`;

      const res = await fetch("/api/portfolio/vercel/deploy", {
        method: "POST",
        headers,
        body: JSON.stringify({
          resume,
          resumeId: resume.id,
          theme,
          sectionsConfig: sections,
          projectName: projectName.trim() || defaultProjectName,
        }),
      });

      const data: VercelDeploymentResult = await res.json();

      if (data.success) {
        setDeploymentResult(data);
        setLogs(data.logs || []);
        if (data.isDemoFallback) {
          success(`Preview complete — connect Vercel to go live.`);
        } else {
          success(`Portfolio deployed live to ${data.url}!`);
        }
      } else {
        showErrorToast((data as any).error || "Deployment failed.");
      }
    } catch (e: any) {
      showErrorToast("Error deploying portfolio to Vercel.");
    } finally {
      setIsDeploying(false);
    }
  };

  const copyLiveUrl = () => {
    if (deploymentResult?.url) {
      navigator.clipboard.writeText(deploymentResult.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success("Live URL copied to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary font-bold">
            <Globe className="w-5 h-5" />
            <DialogTitle>Deploy Portfolio to Your Personal Vercel Account</DialogTitle>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
            User-Owned Project • SSL
          </span>
        </div>
        <DialogDescription>
          Synthesizes a standalone, zero-dependency static build and deploys it directly to your Vercel project with automatic edge routing.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 pt-2">
        {/* Configuration Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-semibold">Vercel Project Name</Label>
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder="my-portfolio"
              className="h-8 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-semibold">Vercel Access Token</Label>
              <a
                href="https://vercel.com/account/tokens"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-primary hover:underline flex items-center gap-1"
              >
                <span>Get Token</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <Input
              type="password"
              value={vercelToken}
              onChange={(e) => setVercelToken(e.target.value)}
              placeholder="vercel_tok_..."
              className="h-8 text-xs font-mono"
            />
          </div>
        </div>

        {/* Live Build Logs Console */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-foreground">
            <span>Live Build & Edge Deployment Telemetry</span>
            {deploymentResult && (
              <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Ready</span>
              </span>
            )}
          </div>
          <BuildLogsTerminal logs={logs} isDeploying={isDeploying} />
        </div>

        {/* Deployment Success Card */}
        {deploymentResult && (
          <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-xs space-y-3 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Live Website Active on Vercel</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>Edge SSL Active</span>
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-card border border-border flex items-center justify-between gap-3">
              <span className="font-mono text-xs font-bold text-foreground truncate">{deploymentResult.url}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={copyLiveUrl}>
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy"}</span>
                </Button>
                <Link href={deploymentResult.url} target="_blank">
                  <Button size="sm" variant="radiant" className="h-7 text-xs gap-1 font-semibold">
                    <span>Visit Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="text-xs">
            Close
          </Button>

          <Button
            type="button"
            variant="radiant"
            size="sm"
            onClick={handleDeploy}
            disabled={isDeploying}
            className="h-9 px-5 text-xs font-bold gap-1.5 shadow-sm"
          >
            <Rocket className={`w-3.5 h-3.5 ${isDeploying ? "animate-spin" : ""}`} />
            <span>{isDeploying ? "Deploying to Vercel..." : deploymentResult ? "Redeploy Latest Changes" : "Deploy to Vercel"}</span>
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
