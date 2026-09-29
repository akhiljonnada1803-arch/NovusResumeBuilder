"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ATSMatchResult, MissingKeywordItem, OptimizedResumeDiff } from "@/lib/ats/jd-matcher";
import { ResumeOptimizationDiffModal } from "@/components/ats/ResumeOptimizationDiffModal";
import {
  ShieldCheck,
  Target,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Plus,
  FileText,
  Check,
  FileSearch,
  Zap,
  Code2,
  Layers,
  UploadCloud,
  FileUp,
  Sparkles,
  Loader2,
  RefreshCw,
  Sliders,
  TrendingUp,
  Award,
  CheckCheck,
} from "lucide-react";

const SAMPLE_JOB_DESCRIPTIONS = [
  {
    title: "Senior Full-Stack AI Engineer",
    text: `Job Title: Senior Full-Stack & AI Systems Engineer
Company: Anthropic / Tech Corp
Location: San Francisco, CA (Remote / Hybrid)

Requirements:
- 5+ years of experience building high-scale distributed web applications using TypeScript, React, Next.js, and Node.js.
- Strong hands-on experience with Python, FastAPI, and integrating LLM APIs / RAG vector databases (Pinecone, pgvector, Redis).
- Proven track record architecting PostgreSQL databases, caching layers, and microservices in Docker and Kubernetes on AWS.
- Experience with CI/CD automation, Jest/Playwright automated testing, and web performance optimization.
- Bachelor's degree in Computer Science, Software Engineering, or equivalent practical experience.

Responsibilities:
- Architect and deploy scalable full-stack features from vector search to responsive web interfaces.
- Collaborate with AI researchers to productionize generative pipelines with sub-100ms response times.
- Maintain high code quality, test coverage, and security standards.`,
  },
  {
    title: "Staff Backend Infrastructure Architect",
    text: `Job Title: Staff Backend Infrastructure Architect
Company: Scale AI / Cloud Systems
Location: Remote

Requirements:
- 8+ years of software engineering experience focusing on distributed cloud platforms and backend microservices.
- Mastery of Go (Golang), Python, Java, or Rust with deep concurrency and networking expertise.
- Expertise in AWS or GCP cloud architecture, Terraform infrastructure-as-code, and Kubernetes orchestration.
- Deep knowledge of high-throughput Kafka or RabbitMQ event streaming, distributed consensus, and Redis caching.
- Excellent communication skills and proven ability to lead technical RFC designs across multi-team organizations.`,
  },
];

export default function ATSAnalyzerPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const setActiveResumeId = useResumeStore((state) => state.setActiveResumeId);
  const addSkill = useResumeStore((state) => state.addSkill);

  const selectedResume =
    resumes.find((r) => r.id === activeResumeId) || resumes[0] || null;

  const [inputMode, setInputMode] = useState<"paste" | "upload">("paste");
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTIONS[0].text);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<ATSMatchResult | null>(null);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationDiff, setOptimizationDiff] = useState<OptimizedResumeDiff | null>(null);
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);

  const [addedKeywords, setAddedKeywords] = useState<{ [kw: string]: boolean }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!selectedResume) {
    return (
      <div className="p-10 text-center rounded-xl border border-border bg-card max-w-xl mx-auto space-y-4 shadow-2xs">
        <FileText className="w-10 h-10 mx-auto text-muted-foreground/60" />
        <h2 className="text-base font-semibold text-foreground">No Resumes Found</h2>
        <p className="text-xs text-muted-foreground">
          Create or import a resume first before running the ATS analyzer.
        </p>
        <Link href="/dashboard">
          <Button size="sm" variant="radiant">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Handle File Upload (PDF / DOCX)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploadedFileName(file.name);
      const res = await fetch("/api/ats/parse-jd", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to parse document");

      setJobDescription(data.text);
      success(`Parsed ${file.name} successfully!`);
    } catch (err: any) {
      showErrorToast(err.message || "Failed to parse document.");
    }
  };

  // Run ATS Match analysis
  const handleRunMatch = async () => {
    if (!jobDescription.trim() || jobDescription.length < 20) {
      showErrorToast("Please enter or upload a valid job description.");
      return;
    }

    setIsMatching(true);
    try {
      const res = await fetch("/api/ats/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: selectedResume,
          jdText: jobDescription.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to calculate ATS match.");

      setMatchResult(data.matchResult);
      success("ATS Match analysis complete!");
    } catch (err: any) {
      showErrorToast(err.message || "Match calculation failed.");
    } finally {
      setIsMatching(false);
    }
  };

  // Run 1-Click AI Resume Optimization
  const handleOptimizeResume = async () => {
    if (!matchResult) return;

    setIsOptimizing(true);
    try {
      const res = await fetch("/api/ats/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: selectedResume,
          jdText: jobDescription.trim(),
          jdRequirements: matchResult.extractedJD,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate optimized resume.");

      setOptimizationDiff(data.diff);
      setIsDiffModalOpen(true);
    } catch (err: any) {
      showErrorToast(err.message || "Optimization failed.");
    } finally {
      setIsOptimizing(false);
    }
  };

  // 1-Click Add Missing Keyword
  const handleAddKeyword = (keyword: MissingKeywordItem) => {
    addSkill({
      name: keyword.name,
      category: keyword.category === "Methodology" ? "Technical" : (keyword.category as any),
      level: keyword.isRequired ? "Advanced" : "Intermediate",
    });
    setAddedKeywords((prev) => ({ ...prev, [keyword.name]: true }));
    success(`Added "${keyword.name}" to skills.`);
  };

  const getMatchLevelColor = (level: string) => {
    switch (level) {
      case "Excellent":
        return "text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40";
      case "Good":
        return "text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/40";
      case "Average":
        return "text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40";
      case "Weak":
      default:
        return "text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40";
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Top Header & Resume Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-secondary border border-border text-foreground">
              <ShieldCheck className="w-5 h-5 text-foreground" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                Job Description ATS Matcher & Optimizer
              </h1>
              <p className="text-xs text-muted-foreground">
                Compare your resume against any job description, pinpoint missing keywords, and 1-click optimize your bullet points.
              </p>
            </div>
          </div>
        </div>

        {/* Resume Selector */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Testing:</span>
          <select
            value={selectedResume.id}
            onChange={(e) => setActiveResumeId(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-hidden"
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Input Zone (Left) & Live ATS Dashboard (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Job Description Input (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-foreground" />
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Job Description Input
                </h2>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    inputMode === "paste"
                      ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paste Text
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    inputMode === "upload"
                      ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Input Method Content */}
            {inputMode === "paste" ? (
              <div className="space-y-2">
                <Textarea
                  rows={10}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description or role requirements here..."
                  className="text-xs font-mono resize-none leading-relaxed"
                />

                {/* Sample JDs Chips */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  <span className="text-[10px] text-muted-foreground font-medium">Presets:</span>
                  {SAMPLE_JOB_DESCRIPTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setJobDescription(s.text)}
                      className="text-[10px] px-2 py-0.5 rounded bg-secondary hover:bg-secondary/80 text-foreground border border-border/70 transition-colors"
                    >
                      {s.title}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* File Upload Dropzone */
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border hover:border-slate-400 dark:hover:border-slate-600 bg-secondary/20 p-8 rounded-xl text-center cursor-pointer transition-colors space-y-2"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center mx-auto shadow-2xs">
                  <FileUp className="w-5 h-5 text-foreground" />
                </div>
                <h4 className="text-xs font-semibold text-foreground">
                  {uploadedFileName || "Upload Job Description (PDF / DOCX)"}
                </h4>
                <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
                  Click to browse or drop your job specification file. Text will be parsed automatically.
                </p>
              </div>
            )}

            {/* Run Match Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="w-full text-xs font-semibold gap-1.5 shadow-2xs h-8.5"
                onClick={handleRunMatch}
                disabled={isMatching}
              >
                {isMatching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Calculating ATS Match...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Run ATS Match & Keyword Analysis
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Right Column: ATS Match Dashboard & Insights (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {matchResult ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* ATS Score Header Card */}
              <div className="p-5 rounded-xl border border-border bg-card shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-5">
                {/* Score Gauge */}
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full border-4 border-secondary flex items-center justify-center bg-secondary/30 shrink-0">
                    <div className="text-center">
                      <span className="text-2xl font-black text-foreground font-mono leading-none">
                        {matchResult.overallScore}
                      </span>
                      <span className="text-[10px] text-muted-foreground block font-semibold mt-0.5">
                        / 100
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-md border ${getMatchLevelColor(
                          matchResult.matchLevel
                        )}`}
                      >
                        {matchResult.matchLevel} Match
                      </span>
                      <span className="text-xs text-muted-foreground font-medium truncate max-w-[200px]">
                        Target: {matchResult.extractedJD.roleTitle}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {matchResult.summaryVerdict}
                    </p>
                  </div>
                </div>

                {/* 1-Click AI Optimizer Trigger */}
                <Button
                  type="button"
                  variant="radiant"
                  size="sm"
                  className="gap-1.5 text-xs font-semibold h-8 shrink-0 shadow-2xs w-full sm:w-auto"
                  onClick={handleOptimizeResume}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      1-Click AI Optimize Resume
                    </>
                  )}
                </Button>
              </div>

              {/* 4-Dimensional Metric Progress Bars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(matchResult.dimensions).map(([key, dim]) => (
                  <div
                    key={key}
                    className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{dim.label}</span>
                      <span className="font-mono font-bold text-foreground">{dim.score}%</span>
                    </div>
                    <Progress value={dim.score} className="h-1.5" />
                    <p className="text-[10px] text-muted-foreground">{dim.details}</p>
                  </div>
                ))}
              </div>

              {/* Missing Keywords Hub */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Missing Keywords Detected ({matchResult.missingKeywords.length})
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Click keyword to add instantly to Resume
                  </span>
                </div>

                {matchResult.missingKeywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missingKeywords.map((kw, idx) => {
                      const isAdded = !!addedKeywords[kw.name];
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleAddKeyword(kw)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all active:scale-95 ${
                            isAdded
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 opacity-80"
                              : kw.isRequired
                              ? "bg-rose-50/80 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40 font-semibold"
                              : "bg-secondary text-foreground border-border hover:border-slate-400 dark:hover:border-slate-600"
                          }`}
                        >
                          {isAdded ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Plus className="w-3 h-3 text-muted-foreground" />
                          )}
                          <span>{kw.name}</span>
                          {kw.isRequired && (
                            <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400">
                              Must-Have
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No critical keyword gaps found! Your resume covers all core criteria.</span>
                  </div>
                )}
              </div>

              {/* Extracted JD Requirements Inspector */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-foreground" />
                  Extracted Job Criteria Breakdown
                </h3>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {matchResult.extractedJD.requiredSkills.map((s, i) => (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-secondary font-medium text-foreground border border-border/80"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block mb-1">
                      Key Responsibilities Extracted:
                    </span>
                    <ul className="space-y-1 pl-4 list-disc text-muted-foreground">
                      {matchResult.extractedJD.responsibilities.map((r, i) => (
                        <li key={i} className="leading-relaxed">{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="p-10 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs space-y-3">
              <FileSearch className="w-10 h-10 mx-auto text-muted-foreground/50" />
              <h3 className="font-semibold text-xs text-foreground">
                Ready to Match & Analyze
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Paste a job description or upload a JD document on the left, then click <strong>Run ATS Match</strong> to view your 4D score and missing keywords.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Diff Optimization Modal */}
      <ResumeOptimizationDiffModal
        open={isDiffModalOpen}
        onOpenChange={setIsDiffModalOpen}
        diff={optimizationDiff}
        onApplied={() => {
          handleRunMatch();
        }}
      />
    </div>
  );
}
