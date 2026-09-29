"use client";

import React, { useState, useRef } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { ExtractedPortfolioData } from "@/types/portfolio-import";
import { GithubIcon } from "@/components/shared/icons";
import {
  Globe,
  FileArchive,
  UploadCloud,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
} from "lucide-react";

interface PortfolioImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtractionSuccess: (data: ExtractedPortfolioData) => void;
}

export function PortfolioImportModal({
  open,
  onOpenChange,
  onExtractionSuccess,
}: PortfolioImportModalProps) {
  const { error: showErrorToast, success } = useToast();
  const [activeSource, setActiveSource] = useState<"url" | "github" | "zip" | "html">("url");

  // Inputs
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [githubToken, setGithubToken] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Status
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleHtmlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!htmlCode.trim()) {
      showErrorToast("Please paste HTML or codebase markup to analyze.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Analyzing HTML markup & extracting structured profile...");

    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("novus_gemini_api_key") || "" : "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["x-gemini-api-key"] = apiKey;

      const res = await fetch("/api/import/portfolio", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sourceType: "html_snippet",
          htmlContent: htmlCode.trim(),
          apiKey: apiKey || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to parse HTML code.");
      }

      success("HTML code analyzed and structured successfully!");
      onOpenChange(false);
      onExtractionSuccess(json.data);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process HTML code.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!websiteUrl.trim()) {
      showErrorToast("Please enter a valid website URL.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Scraping webpage structure & JSON-LD metadata...");

    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("novus_gemini_api_key") || "" : "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["x-gemini-api-key"] = apiKey;

      const res = await fetch("/api/import/portfolio", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sourceType: "url",
          url: websiteUrl.trim(),
          apiKey: apiKey || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to parse portfolio website.");
      }

      success("Portfolio website scraped and structured successfully!");
      onOpenChange(false);
      onExtractionSuccess(json.data);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process portfolio URL.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleGitHubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubRepo.trim()) {
      showErrorToast("Please enter a GitHub repository (e.g. username/portfolio).");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Scanning repository tree, README & data files...");

    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("novus_gemini_api_key") || "" : "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["x-gemini-api-key"] = apiKey;

      const res = await fetch("/api/import/portfolio", {
        method: "POST",
        headers,
        body: JSON.stringify({
          sourceType: "github",
          repo: githubRepo.trim(),
          githubToken: githubToken.trim() || undefined,
          apiKey: apiKey || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to parse GitHub portfolio repository.");
      }

      success("GitHub portfolio codebase analyzed and structured!");
      onOpenChange(false);
      onExtractionSuccess(json.data);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process GitHub repository.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  const handleZipFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setZipFile(file);
    }
  };

  const handleZipSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zipFile) {
      showErrorToast("Please select a ZIP file to upload.");
      return;
    }

    setIsProcessing(true);
    setProcessingStep("Unpacking ZIP archive & parsing codebase files...");

    const apiKey = typeof window !== "undefined" ? localStorage.getItem("novus_gemini_api_key") || "" : "";
    const formData = new FormData();
    formData.append("file", zipFile);
    if (apiKey) formData.append("apiKey", apiKey);

    const headers: Record<string, string> = {};
    if (apiKey) headers["x-gemini-api-key"] = apiKey;

    try {
      const res = await fetch("/api/import/portfolio", {
        method: "POST",
        headers,
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to extract ZIP archive.");
      }

      success("ZIP archive parsed and candidate profile extracted!");
      onOpenChange(false);
      onExtractionSuccess(json.data);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to extract ZIP file.");
    } finally {
      setIsProcessing(false);
      setProcessingStep("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="2xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Globe className="w-5 h-5 text-primary" />
          <DialogTitle>Import Existing Portfolio</DialogTitle>
        </div>
        <DialogDescription>
          Extract verified projects, tech stacks, work history, and bio directly from your live website, GitHub codebase, or code ZIP archive.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-5 pt-2">
        {/* Source Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-secondary/50 p-1 rounded-xl border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveSource("url")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeSource === "url"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span>Website URL</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource("github")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeSource === "github"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5 text-foreground" />
            <span>GitHub Repo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource("zip")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeSource === "zip"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileArchive className="w-3.5 h-3.5 text-amber-500" />
            <span>ZIP Archive</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSource("html")}
            className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-semibold transition-all ${
              activeSource === "html"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-purple-500" />
            <span>HTML / Code</span>
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 space-y-2 text-xs text-center animate-in fade-in duration-200">
            <div className="flex items-center justify-center gap-2 font-bold text-primary">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Portfolio Structure...</span>
            </div>
            <p className="text-muted-foreground font-mono text-[11px]">{processingStep}</p>
          </div>
        )}

        {/* TAB 1: Live Website URL */}
        {activeSource === "url" && !isProcessing && (
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Live Portfolio Website URL</Label>
              <Input
                type="url"
                required
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://alexrivera.dev or https://username.github.io"
                className="h-9 text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                We analyze your website&apos;s HTML, headings, project showcases, and social links.
              </p>
            </div>

            <Button
              type="submit"
              variant="radiant"
              size="sm"
              className="w-full h-9 text-xs font-bold gap-2 shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Extract Data from Website URL</span>
            </Button>
          </form>
        )}

        {/* TAB 2: GitHub Repository */}
        {activeSource === "github" && !isProcessing && (
          <form onSubmit={handleGitHubSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">GitHub Repository</Label>
              <Input
                required
                value={githubRepo}
                onChange={(e) => setGithubRepo(e.target.value)}
                placeholder="e.g. alexrivera/portfolio or https://github.com/alexrivera/portfolio"
                className="h-9 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                We parse your repository&apos;s `README.md`, `package.json`, and project data files.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">GitHub Personal Access Token (Optional)</Label>
                <span className="text-[10px] text-muted-foreground">For private repos / higher rate limits</span>
              </div>
              <Input
                type="password"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                placeholder="ghp_... (optional)"
                className="h-8 text-xs font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="radiant"
              size="sm"
              className="w-full h-9 text-xs font-bold gap-2 shadow-xs"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>Analyze GitHub Portfolio Codebase</span>
            </Button>
          </form>
        )}

        {/* TAB 3: ZIP Archive */}
        {activeSource === "zip" && !isProcessing && (
          <form onSubmit={handleZipSubmit} className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-primary/80 bg-secondary/20 p-8 rounded-2xl text-center cursor-pointer transition-colors space-y-2.5"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".zip"
                onChange={handleZipFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto shadow-2xs">
                <FileArchive className="w-6 h-6 text-amber-500" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">
                {zipFile ? zipFile.name : "Upload Portfolio Code ZIP Archive"}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Select a `.zip` file of your portfolio codebase (e.g. Next.js, Astro, or static HTML).
              </p>
            </div>

            <Button
              type="submit"
              variant="radiant"
              size="sm"
              disabled={!zipFile}
              className="w-full h-9 text-xs font-bold gap-2 shadow-xs"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Unpack & Extract Profile Data</span>
            </Button>
          </form>
        )}

        {/* TAB 4: Paste HTML / Code Snippet */}
        {activeSource === "html" && !isProcessing && (
          <form onSubmit={handleHtmlSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Paste HTML Markup / Component Code</Label>
                <span className="text-[10px] text-muted-foreground">Static HTML, React JSX, or Markdown</span>
              </div>
              <textarea
                required
                rows={7}
                value={htmlCode}
                onChange={(e) => setHtmlCode(e.target.value)}
                placeholder="<!DOCTYPE html><html><head><title>Alex Rivera | Senior Engineer</title>...</head><body><section id='projects'>...</section></body></html>"
                className="w-full p-3 rounded-xl border border-border bg-card text-xs font-mono focus:outline-hidden resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                Paste your website&apos;s source HTML, exported portfolio page, or React JSX markup.
              </p>
            </div>

            <Button
              type="submit"
              variant="radiant"
              size="sm"
              className="w-full h-9 text-xs font-bold gap-2 shadow-xs"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Analyze & Extract Profile from Markup</span>
            </Button>
          </form>
        )}

        {/* Zero Hallucination Guarantee Callout */}
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>
            <strong>Zero-Hallucination Verified:</strong> Only factual projects, tech stacks, and experiences present in your source are extracted.
          </span>
        </div>
      </div>
    </Dialog>
  );
}
