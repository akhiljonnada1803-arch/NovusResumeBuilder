"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ResumeDropzone } from "@/components/import/ResumeDropzone";
import { ExtractionReviewModal } from "@/components/import/ExtractionReviewModal";
import { PortfolioImportModal } from "@/components/import/PortfolioImportModal";
import { PortfolioExtractionReviewModal } from "@/components/import/PortfolioExtractionReviewModal";
import { ResumeExtractionResult } from "@/types/import";
import { ExtractedPortfolioData } from "@/types/portfolio-import";
import { Button } from "@/components/ui/button";
import { GithubIcon } from "@/components/shared/icons";
import {
  UploadCloud,
  Sparkles,
  FileCheck,
  Globe,
  Target,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Lock,
  FileText,
  AlertCircle,
  FileArchive,
  Layers,
} from "lucide-react";

export default function UnifiedImportPage() {
  const [importMode, setImportMode] = useState<"resume" | "portfolio">("resume");

  // Resume Document State
  const [resumeExtractionResult, setResumeExtractionResult] = useState<ResumeExtractionResult | null>(null);
  const [isResumeReviewOpen, setIsResumeReviewOpen] = useState(false);

  // Existing Portfolio State
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioExtractionData, setPortfolioExtractionData] = useState<ExtractedPortfolioData | null>(null);
  const [isPortfolioReviewOpen, setIsPortfolioReviewOpen] = useState(false);

  const handleResumeExtraction = (result: ResumeExtractionResult) => {
    setResumeExtractionResult(result);
    setIsResumeReviewOpen(true);
  };

  const handlePortfolioExtractionSuccess = (data: ExtractedPortfolioData) => {
    setPortfolioExtractionData(data);
    setIsPortfolioReviewOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 text-xs px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ZERO-HALLUCINATION VERIFIED IMPORT ENGINE</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          Import Your Existing Career Assets
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Import from an existing PDF/DOCX resume or parse your live portfolio website, GitHub codebase, and ZIP archive with verified factual extraction.
        </p>

        {/* Mode Switcher */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-secondary border border-border shadow-xs mt-2">
          <button
            type="button"
            onClick={() => setImportMode("resume")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              importMode === "resume"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Resume Document (PDF / DOCX)</span>
          </button>

          <button
            type="button"
            onClick={() => setImportMode("portfolio")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              importMode === "portfolio"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Existing Portfolio (URL / GitHub / ZIP)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: Resume Upload */}
      {importMode === "resume" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pipeline Stage Steps */}
          <div className="p-4 rounded-2xl border border-border bg-card shadow-2xs">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-2 text-center">
              Verified Resume Import Pipeline
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs text-center font-semibold">
              <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1">
                <span className="text-[10px] font-mono text-primary block font-bold">STAGE 01</span>
                <span className="text-foreground block">PDF / DOCX Upload</span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1">
                <span className="text-[10px] font-mono text-primary block font-bold">STAGE 02</span>
                <span className="text-foreground block">Text Extraction</span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1">
                <span className="text-[10px] font-mono text-primary block font-bold">STAGE 03</span>
                <span className="text-foreground block">Strict Parsing</span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1">
                <span className="text-[10px] font-mono text-emerald-500 block font-bold">STAGE 04</span>
                <span className="text-foreground block">Factual Validation</span>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/60 border border-border/80 space-y-1">
                <span className="text-[10px] font-mono text-primary block font-bold">STAGE 05</span>
                <span className="text-foreground block">Review & Save</span>
              </div>
            </div>
          </div>

          {/* Upload Dropzone */}
          <ResumeDropzone onExtractionComplete={handleResumeExtraction} />
        </div>
      )}

      {/* MODE 2: Existing Portfolio Ingestion */}
      {importMode === "portfolio" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="p-8 rounded-3xl border border-border bg-card shadow-2xs space-y-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center mx-auto shadow-xs">
              <Globe className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-foreground">Import Existing Portfolio</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your live personal website URL, public GitHub portfolio repository, or upload a code ZIP archive.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left text-xs">
              <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>1. Live Website URL</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Scrapes HTML headings, projects, experience, and contact links.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <GithubIcon className="w-4 h-4 text-foreground" />
                  <span>2. GitHub Repository</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Analyzes README, package.json, and data files across your repo tree.
                </p>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-secondary/30 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <FileArchive className="w-4 h-4 text-amber-500" />
                  <span>3. ZIP Archive</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Extracts markdown, HTML, and JSON data files from uploaded codebases.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="radiant"
              onClick={() => setIsPortfolioModalOpen(true)}
              className="h-10 px-8 rounded-xl font-bold text-xs gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Portfolio Import Assistant</span>
            </Button>
          </div>
        </div>
      )}

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Zero-Hallucination Parsing</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Extracts strictly verified data from uploaded documents and websites. Missing fields are left blank without fabricating fake data.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Field-Level Confidence Scoring</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Identifies uncertain fields with warning flags and side-by-side review before saving to your workspace.
          </p>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-card shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-foreground">Dual Generation Pipeline</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Instantly outputs an editable resume for ATS applications and generates a portfolio ready to deploy to your personal Vercel account.
          </p>
        </div>
      </div>

      {/* Resume Document Review Modal */}
      <ExtractionReviewModal
        open={isResumeReviewOpen}
        onOpenChange={setIsResumeReviewOpen}
        result={resumeExtractionResult}
      />

      {/* Portfolio Ingestion Modal */}
      <PortfolioImportModal
        open={isPortfolioModalOpen}
        onOpenChange={setIsPortfolioModalOpen}
        onExtractionSuccess={handlePortfolioExtractionSuccess}
      />

      {/* Portfolio Extraction Review Modal */}
      <PortfolioExtractionReviewModal
        open={isPortfolioReviewOpen}
        onOpenChange={setIsPortfolioReviewOpen}
        data={portfolioExtractionData}
      />
    </div>
  );
}
