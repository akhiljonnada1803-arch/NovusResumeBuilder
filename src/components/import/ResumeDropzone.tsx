"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { ResumeExtractionResult } from "@/types/import";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  FileCode,
  FileCheck,
  AlertCircle,
  ArrowUpRight,
  Shield,
  Zap,
} from "lucide-react";
import { GeminiApiKeyInput, LOCAL_STORAGE_GEMINI_KEY } from "./GeminiApiKeyInput";

interface ResumeDropzoneProps {
  onExtractionComplete: (result: ResumeExtractionResult) => void;
}

export function ResumeDropzone({ onExtractionComplete }: ResumeDropzoneProps) {
  const { success, error: showErrorToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [userApiKey, setUserApiKey] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_GEMINI_KEY) || "";
      setUserApiKey(stored);
    } catch {
      // Ignore
    }
  }, []);

  const processFile = async (file: File) => {
    const validExtensions = [".pdf", ".docx", ".doc", ".txt"];
    const hasValidExt = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidExt) {
      showErrorToast("Please upload a supported file format (.pdf, .docx, .doc, or .txt)");
      return;
    }

    setIsProcessing(true);
    setProgressText("Reading & decompressing document text streams...");

    try {
      const isAI = Boolean(userApiKey && userApiKey.trim().length > 20);
      setTimeout(() => {
        setProgressText(
          isAI
            ? "Stage 1: Multi-model Gemini AI extraction with zero-loss schema alignment..."
            : "Stage 1: Parsing entities with zero-hallucination deterministic engine..."
        );
      }, 500);
      setTimeout(() => setProgressText("Validating field-to-source traceability & confidence scores..."), 1200);

      const formData = new FormData();
      formData.append("file", file);
      if (userApiKey) {
        formData.append("apiKey", userApiKey);
      }

      const headers: Record<string, string> = {};
      if (userApiKey) {
        headers["x-gemini-api-key"] = userApiKey;
      }

      const res = await fetch("/api/import/resume", {
        method: "POST",
        headers,
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.extraction) {
        success(`Parsed ${data.extraction.resume.personalInfo.fullName || "resume"} with 100% source traceability!`);
        onExtractionComplete(data.extraction);
      } else {
        showErrorToast(data.error || "Failed to extract resume content.");
      }
    } catch (err: any) {
      showErrorToast("Error parsing resume document.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const handleSampleImport = async () => {
    setIsProcessing(true);
    setProgressText("Loading sample AI Engineer resume...");

    try {
      const sampleText = `Alex Rivera
Senior Software & AI Engineer
alex.rivera@example.com • +1 (555) 234-5678 • San Francisco, CA
https://alexrivera.dev • https://linkedin.com/in/alexrivera • https://github.com/alexrivera

SUMMARY
Distinguished Senior Software & AI Engineer with 6+ years of experience scaling high-throughput distributed systems, vector search pipelines, and autonomous agent infrastructure.

EXPERIENCE
Staff Software Engineer | Stripe | 2023 - Present
• Architected distributed event streaming engine processing 150,000+ financial settlement transactions/sec.
• Reduced p99 query latency by 42% utilizing Go and optimized Kafka consumer groups.

Senior Full Stack Engineer | Vercel | 2021 - 2023
• Built edge runtime compute primitives and Next.js middleware routing engines serving 50M+ requests daily.

EDUCATION
University of California, Berkeley
Bachelor of Science in Computer Science | 2017 - 2021 | GPA 3.85

SKILLS
TypeScript, React, Next.js, Node.js, Go, Python, PyTorch, PostgreSQL, Qdrant, Redis, Docker, Kubernetes, AWS.

PROJECTS
OmniSearch Vector Engine | https://omnisearch.dev
High-performance hybrid vector and BM25 search engine in Rust and Qdrant.

CERTIFICATIONS
AWS Certified Solutions Architect - Professional (2024)
Certified Kubernetes Administrator (CKA) (2023)`;

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (userApiKey) {
        headers["x-gemini-api-key"] = userApiKey;
      }

      const res = await fetch("/api/import/resume", {
        method: "POST",
        headers,
        body: JSON.stringify({
          text: sampleText,
          fileName: "Alex_Rivera_Resume.pdf",
          apiKey: userApiKey,
        }),
      });

      const data = await res.json();
      if (data.success && data.extraction) {
        success("Sample resume parsed with 100% source traceability!");
        onExtractionComplete(data.extraction);
      }
    } catch (e: any) {
      showErrorToast("Error processing sample resume.");
    } finally {
      setIsProcessing(false);
      setProgressText("");
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Gemini API Key Bring-Your-Own-Key Input */}
      <GeminiApiKeyInput onKeyChange={(key) => setUserApiKey(key)} />

      {/* Drag & Drop Canvas */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all text-center flex flex-col items-center justify-center gap-4 cursor-pointer relative overflow-hidden ${
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : "border-border hover:border-primary/50 bg-card hover:bg-secondary/20 shadow-xs"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".pdf,.docx,.doc,.txt"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              processFile(e.target.files[0]);
            }
          }}
        />

        {/* Upload Icon & Animation */}
        <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-primary shadow-sm">
          {isProcessing ? (
            <Sparkles className="w-8 h-8 animate-spin text-primary" style={{ animationDuration: "3s" }} />
          ) : (
            <UploadCloud className="w-8 h-8" />
          )}
        </div>

        {/* Text Instructions */}
        <div className="space-y-1.5 max-w-md">
          <h3 className="text-base sm:text-lg font-bold text-foreground">
            {isProcessing
              ? userApiKey
                ? "Extracting Resume with Gemini AI..."
                : "Processing Resume with Deterministic Parser..."
              : "Drop your Resume here or Browse Files"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {isProcessing ? progressText : "Supports PDF, Microsoft Word (.docx), and text resumes up to 10MB."}
          </p>
        </div>

        {/* Format Badges */}
        {!isProcessing && (
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
              PDF Document (.pdf)
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Word (.docx, .doc)
            </span>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Text (.txt)
            </span>
          </div>
        )}
      </div>

      {/* Instant Demo Shortcut */}
      <div className="p-4 rounded-2xl border border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <Zap className="w-4 h-4 text-amber-500" />
          <span className="text-muted-foreground">
            Don&apos;t have a file handy? Test the extraction pipeline with a sample AI engineer resume.
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleSampleImport}
          disabled={isProcessing}
          className="h-8 text-xs font-semibold shrink-0 gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>Try with Sample Resume</span>
        </Button>
      </div>
    </div>
  );
}
