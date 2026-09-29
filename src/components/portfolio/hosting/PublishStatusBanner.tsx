"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { CustomDomainConfig, DeploymentStatus } from "@/types/hosting";
import {
  Globe,
  Lock,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Power,
  Shield,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

interface PublishStatusBannerProps {
  resumeId: string;
  subdomain: string;
  customDomainConfig?: CustomDomainConfig;
  status: DeploymentStatus;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  onOpenDomainModal: () => void;
  publicUrl: string;
}

export function PublishStatusBanner({
  resumeId,
  subdomain,
  customDomainConfig,
  status,
  onPublish,
  onUnpublish,
  onOpenDomainModal,
  publicUrl,
}: PublishStatusBannerProps) {
  const { success, error: showErrorToast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fullDomain = customDomainConfig?.status === "verified"
    ? `https://${customDomainConfig.domain}`
    : `https://${subdomain}.novusresume.ai`;

  const handleCopy = () => {
    if (typeof window !== "undefined") {
      const liveLink = `${window.location.origin}${publicUrl}`;
      navigator.clipboard.writeText(liveLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      success("Live website link copied!");
    }
  };

  const handlePublishClick = async () => {
    setIsProcessing(true);
    try {
      await onPublish();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnpublishClick = async () => {
    setIsProcessing(true);
    try {
      await onUnpublish();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-border bg-gradient-to-br from-card via-card to-secondary/30 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Status and Domain Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl border shrink-0 ${
            status === "live"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
              : status === "publishing"
              ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
              : "bg-secondary border-border text-muted-foreground"
          }`}>
            <Globe className="w-5 h-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-sm text-foreground font-mono">
                {customDomainConfig?.status === "verified" ? customDomainConfig.domain : `${subdomain}.novusresume.ai`}
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                status === "live"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-secondary text-muted-foreground border-border"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === "live" ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground"}`} />
                <span className="capitalize">{status}</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground border border-border">
                <Lock className="w-2.5 h-2.5 text-emerald-500" />
                <span>SSL Encrypted</span>
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              {status === "live"
                ? "Your portfolio is live and globally distributed across cloud edge CDN nodes."
                : "Your changes are in draft mode. Click 'Publish Updates' to push live."}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 font-medium"
            onClick={handleCopy}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Link"}</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5 font-semibold text-primary border-primary/30 hover:bg-primary/5"
            onClick={onOpenDomainModal}
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>{customDomainConfig?.status === "verified" ? "Manage Domain" : "Custom Domain (Pro)"}</span>
          </Button>

          {status === "live" ? (
            <Button
              size="sm"
              variant="radiant"
              className="h-8 text-xs gap-1.5 font-bold shadow-2xs"
              onClick={handlePublishClick}
              disabled={isProcessing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
              <span>{isProcessing ? "Updating..." : "Publish Updates"}</span>
            </Button>
          ) : (
            <Button
              size="sm"
              variant="radiant"
              className="h-8 text-xs gap-1.5 font-bold shadow-2xs"
              onClick={handlePublishClick}
              disabled={isProcessing}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isProcessing ? "Publishing..." : "Publish Website"}</span>
            </Button>
          )}

          {status === "live" && (
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleUnpublishClick}
              title="Pause Live Hosting"
              disabled={isProcessing}
            >
              <Power className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
