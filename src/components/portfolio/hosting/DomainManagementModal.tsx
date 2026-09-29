"use client";

import React, { useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomDomainConfig } from "@/types/hosting";
import { generateDomainDnsConfig } from "@/lib/portfolio/domain-resolver";
import { useToast } from "@/components/ui/toast";
import {
  Globe,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ArrowUpRight,
  Lock,
  Server,
  Zap,
} from "lucide-react";

interface DomainManagementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentDomainConfig?: CustomDomainConfig;
  onDomainSaved: (config: CustomDomainConfig) => void;
}

export function DomainManagementModal({
  open,
  onOpenChange,
  currentDomainConfig,
  onDomainSaved,
}: DomainManagementModalProps) {
  const { success, error: showErrorToast } = useToast();
  const [domainInput, setDomainInput] = useState(currentDomainConfig?.domain || "");
  const [dnsConfig, setDnsConfig] = useState<CustomDomainConfig | null>(currentDomainConfig || null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleGenerateDns = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    const clean = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "");
    const generated = generateDomainDnsConfig(clean);
    setDnsConfig(generated);
  };

  const handleCopy = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
    success("Copied to clipboard!");
  };

  const handleVerifyDns = async () => {
    if (!dnsConfig) return;
    setIsVerifying(true);
    try {
      const res = await fetch("/api/portfolio/domains/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: dnsConfig.domain, existingConfig: dnsConfig }),
      });
      const data = await res.json();
      if (data.success && data.domainConfig) {
        setDnsConfig(data.domainConfig);
        onDomainSaved(data.domainConfig);
        if (data.domainConfig.status === "verified") {
          success(data.message);
        } else {
          showErrorToast(data.message);
        }
      }
    } catch (err: any) {
      showErrorToast("Failed to verify DNS records.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-primary">
          <Globe className="w-5 h-5" />
          <DialogTitle>Connect Custom Domain (Pro)</DialogTitle>
        </div>
        <DialogDescription>
          Host your portfolio on your own apex domain or subdomain with automated edge SSL.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 pt-2">
        {/* Domain Input Form */}
        {!dnsConfig ? (
          <form onSubmit={handleGenerateDns} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Enter Custom Domain Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="e.g. portfolio.yourname.com or yourname.dev"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  className="text-xs font-mono"
                  required
                />
                <Button type="submit" size="sm" className="h-9 text-xs shrink-0">
                  Generate DNS Records
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Works with Cloudflare, GoDaddy, Namecheap, Google Domains, and AWS Route53.
              </p>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            {/* Domain Status Banner */}
            <div className="p-4 rounded-xl border border-border bg-secondary/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dnsConfig.status === "verified" ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-400"}`}>
                  {dnsConfig.status === "verified" ? <ShieldCheck className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                </div>
                <div>
                  <span className="font-bold text-sm text-foreground block font-mono">{dnsConfig.domain}</span>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={`inline-flex items-center gap-1 font-semibold ${dnsConfig.status === "verified" ? "text-emerald-500" : "text-amber-400"}`}>
                      {dnsConfig.status === "verified" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      <span className="capitalize">{dnsConfig.status}</span>
                    </span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-500" />
                      <span>{dnsConfig.sslActive ? "Auto-SSL Active" : "SSL Pending"}</span>
                    </span>
                  </div>
                </div>
              </div>

              <Button
                size="sm"
                variant={dnsConfig.status === "verified" ? "outline" : "radiant"}
                className="h-8 text-xs gap-1.5 font-semibold"
                onClick={handleVerifyDns}
                disabled={isVerifying}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
                <span>{isVerifying ? "Verifying DNS..." : "Verify DNS"}</span>
              </Button>
            </div>

            {/* DNS Instructions & Copy Cards */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Required DNS Records
              </span>

              {/* CNAME Record */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[11px] font-bold text-primary">RECORD 1: CNAME (Routing)</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary">Target Host</span>
                </div>
                <div className="grid grid-cols-12 gap-2 font-mono text-[11px]">
                  <div className="col-span-3 p-2 rounded bg-secondary/60">
                    <span className="text-[9px] text-muted-foreground block font-sans">Type</span>
                    <span>CNAME</span>
                  </div>
                  <div className="col-span-4 p-2 rounded bg-secondary/60 truncate">
                    <span className="text-[9px] text-muted-foreground block font-sans">Name / Host</span>
                    <span>{dnsConfig.cnameRecord.host}</span>
                  </div>
                  <div className="col-span-5 p-2 rounded bg-secondary/60 flex items-center justify-between">
                    <div className="truncate">
                      <span className="text-[9px] text-muted-foreground block font-sans">Value</span>
                      <span className="truncate">{dnsConfig.cnameRecord.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(dnsConfig.cnameRecord.value, "cname")}
                      className="p-1 rounded hover:bg-card shrink-0 ml-1"
                    >
                      {copiedField === "cname" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* TXT Record */}
              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="font-mono text-[11px] font-bold text-primary">RECORD 2: TXT (Ownership)</span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-secondary">Verification</span>
                </div>
                <div className="grid grid-cols-12 gap-2 font-mono text-[11px]">
                  <div className="col-span-3 p-2 rounded bg-secondary/60">
                    <span className="text-[9px] text-muted-foreground block font-sans">Type</span>
                    <span>TXT</span>
                  </div>
                  <div className="col-span-4 p-2 rounded bg-secondary/60 truncate">
                    <span className="text-[9px] text-muted-foreground block font-sans">Name / Host</span>
                    <span className="truncate">{dnsConfig.txtRecord.host}</span>
                  </div>
                  <div className="col-span-5 p-2 rounded bg-secondary/60 flex items-center justify-between">
                    <div className="truncate">
                      <span className="text-[9px] text-muted-foreground block font-sans">Value</span>
                      <span className="truncate">{dnsConfig.txtRecord.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(dnsConfig.txtRecord.value, "txt")}
                      className="p-1 rounded hover:bg-card shrink-0 ml-1"
                    >
                      {copiedField === "txt" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Change domain or close */}
            <div className="flex items-center justify-between pt-2 border-t border-border/80">
              <button
                type="button"
                onClick={() => setDnsConfig(null)}
                className="text-xs text-muted-foreground hover:text-foreground underline"
              >
                Configure different domain
              </button>
              <Button size="sm" variant="outline" onClick={() => onOpenChange(false)} className="text-xs h-8">
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
