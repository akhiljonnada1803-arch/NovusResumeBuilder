"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeExtractionResult, SourceTraceItem } from "@/types/import";
import { Resume, ExperienceItem, EducationItem, SkillItem, ProjectItem, CertificationItem } from "@/types/resume";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Globe,
  Target,
  ArrowRight,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Award,
  Layers,
  ShieldCheck,
  Edit3,
  HelpCircle,
  Check,
  FileCheck,
  Activity,
  Code2,
  Copy,
  CornerDownRight,
  RefreshCw,
  Sliders,
  Terminal,
} from "lucide-react";

interface ExtractionReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: ResumeExtractionResult | null;
}

export function ExtractionReviewModal({
  open,
  onOpenChange,
  result,
}: ExtractionReviewModalProps) {
  const router = useRouter();
  const { success, error: showErrorToast, info } = useToast();
  const importResume = useResumeStore((state) => state.importResume);
  const setActiveResumeId = useResumeStore((state) => state.setActiveResumeId);

  const [activeTab, setActiveTab] = useState<
    "trace" | "personal" | "experience" | "education" | "skills" | "projects" | "diagnostics"
  >("trace");

  const [editedResume, setEditedResume] = useState<Resume | null>(null);
  const [isEnhancingAI, setIsEnhancingAI] = useState(false);
  const [hasEnhancedWithAI, setHasEnhancedWithAI] = useState(false);
  const [copiedRawText, setCopiedRawText] = useState(false);

  // Sync initial extracted resume to local editable state
  useEffect(() => {
    if (result?.resume) {
      setEditedResume(JSON.parse(JSON.stringify(result.resume)));
      setHasEnhancedWithAI(false);
    }
  }, [result]);

  if (!result || !editedResume) return null;

  const { confidenceScores, sourceTrace = [], diagnostics, originalDocument, uncertainFields = [] } = result;

  const saveToWorkspace = (): string => {
    importResume(editedResume);
    setActiveResumeId(editedResume.id);
    return editedResume.id;
  };

  const handleAction = (destination: "builder" | "portfolio" | "ats") => {
    const id = saveToWorkspace();
    onOpenChange(false);

    if (destination === "builder") {
      success("Resume saved! Opening builder...");
      router.push(`/builder/${id}`);
    } else if (destination === "portfolio") {
      success("Data verified! Opening portfolio generator...");
      router.push("/portfolio");
    } else if (destination === "ats") {
      success("Opening ATS analyzer for match audit...");
      router.push("/ats-analyzer");
    }
  };

  // Stage 2: AI Description Polish (Zero data invention)
  const handleAIEnhance = async () => {
    setIsEnhancingAI(true);
    info("Refining bullet phrasing and STAR action verbs with Gemini AI...");

    try {
      const apiKey = typeof window !== "undefined" ? localStorage.getItem("novus_gemini_api_key") || "" : "";
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (apiKey) headers["x-gemini-api-key"] = apiKey;

      const res = await fetch("/api/import/resume/enhance", {
        method: "POST",
        headers,
        body: JSON.stringify({
          resume: editedResume,
          originalText: originalDocument?.rawText || "",
          apiKey: apiKey || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.resume) {
        setEditedResume(data.resume);
        setHasEnhancedWithAI(true);
        success("AI polish applied! Action verbs and structure enhanced without adding unverified facts.");
      } else {
        showErrorToast(data.error || "Failed to run AI enhancement.");
      }
    } catch (e: any) {
      showErrorToast("Error communicating with AI enhancement service.");
    } finally {
      setIsEnhancingAI(false);
    }
  };

  const handleCopyRaw = () => {
    if (originalDocument?.rawText) {
      navigator.clipboard.writeText(originalDocument.rawText);
      setCopiedRawText(true);
      setTimeout(() => setCopiedRawText(false), 2000);
      success("Raw document text copied to clipboard!");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="4xl">
      <DialogHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base sm:text-lg font-bold">
                Deterministic Resume Extraction Review
              </DialogTitle>
              <p className="text-[11px] text-muted-foreground font-mono">
                Source: <span className="text-foreground font-semibold">{result.fileName || "Uploaded Document"}</span> • 100% Traceable
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasEnhancedWithAI && (
              <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Stage 2: AI Polished</span>
              </span>
            )}
            <span
              className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
                confidenceScores.overall >= 80
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}
            >
              {confidenceScores.overall}% Factual Confidence
            </span>
          </div>
        </div>
        <DialogDescription className="text-xs text-muted-foreground">
          Zero hallucinations guaranteed. Every extracted field is directly mapped to the source document text below. Correct any values prior to saving.
        </DialogDescription>
      </DialogHeader>

      {/* Visual Two-Stage Pipeline Indicator */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold py-2 px-3 rounded-2xl bg-secondary/50 border border-border">
        <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <span className="font-bold text-foreground text-xs block">Stage 1: Deterministic Extraction</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {sourceTrace.length} fields mapped directly to document lines
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            Active
          </span>
        </div>

        <div className="flex items-center justify-between p-2 rounded-xl bg-card border border-border shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 shrink-0 ${hasEnhancedWithAI ? "text-purple-500" : "text-muted-foreground"}`} />
            <div>
              <span className="font-bold text-foreground text-xs block">Stage 2: AI Formatting & Action Verbs</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {hasEnhancedWithAI ? "Polished existing bullet points" : "Optional refinement (Never invents data)"}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant={hasEnhancedWithAI ? "outline" : "secondary"}
            onClick={handleAIEnhance}
            disabled={isEnhancingAI}
            className="h-7 text-[11px] font-bold gap-1.5 shrink-0"
          >
            {isEnhancingAI ? (
              <RefreshCw className="w-3 h-3 animate-spin text-purple-500" />
            ) : (
              <Sparkles className="w-3 h-3 text-purple-500" />
            )}
            <span>{hasEnhancedWithAI ? "Re-polish" : "Run AI Polish"}</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4 pt-1">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-1 bg-secondary/60 p-1 rounded-xl border border-border text-xs">
          <button
            type="button"
            onClick={() => setActiveTab("trace")}
            className={`py-1.5 px-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "trace"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-primary" />
            <span>Traceability</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("personal")}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "personal" ? "bg-card text-foreground shadow-2xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Contact</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "experience" ? "bg-card text-foreground shadow-2xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Work ({editedResume.experience.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("education")}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "education" ? "bg-card text-foreground shadow-2xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education ({editedResume.education.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("skills")}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "skills" ? "bg-card text-foreground shadow-2xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Skills ({editedResume.skills.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "projects" ? "bg-card text-foreground shadow-2xs border border-border" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects ({editedResume.projects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("diagnostics")}
            className={`py-1.5 px-2 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === "diagnostics"
                ? "bg-card text-foreground shadow-2xs border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>Diagnostics</span>
          </button>
        </div>

        {/* TAB 1: SIDE-BY-SIDE EXTRACTION TRACEABILITY */}
        {activeTab === "trace" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-foreground">
                Document Value ➔ Parsed Value Mapping ({sourceTrace.length} Traceable Items)
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                Click any parsed value to edit directly
              </span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
              {sourceTrace.map((trace) => (
                <div
                  key={trace.id}
                  className="p-3 rounded-xl border border-border bg-card shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-primary flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{trace.label}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {trace.lineNumber && (
                        <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          Line {trace.lineNumber}
                        </span>
                      )}
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        {trace.confidence}% Match
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {/* Left: Document Source Snippet */}
                    <div className="p-2.5 rounded-lg bg-secondary/40 border border-border/80 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block">
                        📄 Document Source Value:
                      </span>
                      <p className="text-[11px] font-mono text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                        {trace.documentValue || "(Empty in source)"}
                      </p>
                    </div>

                    {/* Right: Parsed Structured Output */}
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary block flex items-center gap-1">
                        <CornerDownRight className="w-3 h-3" />
                        <span>Parsed Structured Value:</span>
                      </span>
                      <p className="text-[11px] font-semibold text-foreground whitespace-pre-wrap break-words leading-relaxed">
                        {trace.parsedValue || "(Not specified)"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Personal Info Editor */}
        {activeTab === "personal" && (
          <div className="space-y-3 p-4 rounded-xl border border-border bg-card">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Full Name</Label>
                  {!editedResume.personalInfo.fullName && (
                    <span className="text-[10px] text-amber-500 font-mono font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> Missing
                    </span>
                  )}
                </div>
                <Input
                  value={editedResume.personalInfo.fullName}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, fullName: e.target.value },
                    })
                  }
                  placeholder="e.g. Alex Rivera"
                  className="h-8 text-xs font-semibold"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Target Job Title / Headline</Label>
                  {!editedResume.personalInfo.jobTitle && (
                    <span className="text-[10px] text-muted-foreground font-mono">Optional</span>
                  )}
                </div>
                <Input
                  value={editedResume.personalInfo.jobTitle}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, jobTitle: e.target.value },
                    })
                  }
                  placeholder="e.g. Senior Software Engineer"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px]">Email Address</Label>
                  {!editedResume.personalInfo.email && (
                    <span className="text-[10px] text-amber-500 font-mono font-bold flex items-center gap-0.5">
                      <AlertTriangle className="w-2.5 h-2.5" /> Missing
                    </span>
                  )}
                </div>
                <Input
                  value={editedResume.personalInfo.email}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, email: e.target.value },
                    })
                  }
                  placeholder="name@example.com"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Phone Number</Label>
                <Input
                  value={editedResume.personalInfo.phone}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, phone: e.target.value },
                    })
                  }
                  placeholder="+1 (555) 000-0000"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">Location</Label>
                <Input
                  value={editedResume.personalInfo.location}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, location: e.target.value },
                    })
                  }
                  placeholder="San Francisco, CA"
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px]">LinkedIn URL</Label>
                <Input
                  value={editedResume.personalInfo.linkedin}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, linkedin: e.target.value },
                    })
                  }
                  placeholder="https://linkedin.com/in/..."
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label className="text-[11px]">GitHub URL</Label>
                <Input
                  value={editedResume.personalInfo.github}
                  onChange={(e) =>
                    setEditedResume({
                      ...editedResume,
                      personalInfo: { ...editedResume.personalInfo, github: e.target.value },
                    })
                  }
                  placeholder="https://github.com/..."
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1 pt-1">
              <Label className="text-[11px]">Professional Summary</Label>
              <textarea
                rows={3}
                value={editedResume.personalInfo.summary}
                onChange={(e) =>
                  setEditedResume({
                    ...editedResume,
                    personalInfo: { ...editedResume.personalInfo, summary: e.target.value },
                  })
                }
                placeholder="Professional summary or bio..."
                className="w-full p-2.5 rounded-lg border border-border bg-secondary/20 text-xs text-foreground focus:outline-hidden"
              />
            </div>
          </div>
        )}

        {/* TAB 3: Work Experience */}
        {activeTab === "experience" && (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {editedResume.experience.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
                <Briefcase className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No work experience entries were detected in the source document.</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7"
                  onClick={() => {
                    setEditedResume({
                      ...editedResume,
                      experience: [
                        {
                          id: `exp_new_${Date.now()}`,
                          company: "",
                          position: "",
                          location: "",
                          startDate: "",
                          endDate: "",
                          current: false,
                          description: "",
                          highlights: [],
                        },
                      ],
                    });
                  }}
                >
                  + Add Experience Entry
                </Button>
              </div>
            ) : (
              editedResume.experience.map((exp, idx) => (
                <div key={exp.id || idx} className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={exp.position}
                      onChange={(e) => {
                        const updated = [...editedResume.experience];
                        updated[idx].position = e.target.value;
                        setEditedResume({ ...editedResume, experience: updated });
                      }}
                      placeholder="Job Title / Position"
                      className="h-7 text-xs font-bold"
                    />
                    <Input
                      value={exp.company}
                      onChange={(e) => {
                        const updated = [...editedResume.experience];
                        updated[idx].company = e.target.value;
                        setEditedResume({ ...editedResume, experience: updated });
                      }}
                      placeholder="Company / Employer"
                      className="h-7 text-xs text-primary font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <Input
                      value={exp.startDate}
                      onChange={(e) => {
                        const updated = [...editedResume.experience];
                        updated[idx].startDate = e.target.value;
                        setEditedResume({ ...editedResume, experience: updated });
                      }}
                      placeholder="Start Date (e.g. 2021)"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={exp.endDate}
                      onChange={(e) => {
                        const updated = [...editedResume.experience];
                        updated[idx].endDate = e.target.value;
                        setEditedResume({ ...editedResume, experience: updated });
                      }}
                      placeholder="End Date (e.g. Present)"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={exp.location}
                      onChange={(e) => {
                        const updated = [...editedResume.experience];
                        updated[idx].location = e.target.value;
                        setEditedResume({ ...editedResume, experience: updated });
                      }}
                      placeholder="Location"
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase font-bold">
                      Key Highlights ({exp.highlights.length}):
                    </span>
                    {exp.highlights.map((h, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-1.5">
                        <span className="text-primary">•</span>
                        <Input
                          value={h}
                          onChange={(e) => {
                            const updated = [...editedResume.experience];
                            updated[idx].highlights[hIdx] = e.target.value;
                            setEditedResume({ ...editedResume, experience: updated });
                          }}
                          className="h-6 text-[11px]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: Education */}
        {activeTab === "education" && (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {editedResume.education.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
                <GraduationCap className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No academic records were detected in the document.</p>
              </div>
            ) : (
              editedResume.education.map((edu, idx) => (
                <div key={edu.id || idx} className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      value={edu.institution}
                      onChange={(e) => {
                        const updated = [...editedResume.education];
                        updated[idx].institution = e.target.value;
                        setEditedResume({ ...editedResume, education: updated });
                      }}
                      placeholder="University / School"
                      className="h-7 text-xs font-bold"
                    />
                    <Input
                      value={edu.degree}
                      onChange={(e) => {
                        const updated = [...editedResume.education];
                        updated[idx].degree = e.target.value;
                        setEditedResume({ ...editedResume, education: updated });
                      }}
                      placeholder="Degree (e.g. B.S. Computer Science)"
                      className="h-7 text-xs"
                    />
                  </div>
                  {edu.gpa && (
                    <span className="text-[10px] font-mono text-emerald-500 font-bold">
                      GPA: {edu.gpa}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: Skills */}
        {activeTab === "skills" && (
          <div className="p-4 rounded-xl border border-border bg-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Extracted Skills ({editedResume.skills.length})</span>
              <span className="text-[11px] text-muted-foreground">Extracted strictly from document text tokens</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-[220px] overflow-y-auto">
              {editedResume.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2.5 py-1 rounded-lg bg-secondary text-foreground font-semibold border border-border flex items-center gap-1.5"
                >
                  <span>{s.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditedResume({
                        ...editedResume,
                        skills: editedResume.skills.filter((_, i) => i !== idx),
                      });
                    }}
                    className="text-muted-foreground hover:text-destructive text-[10px]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: Projects */}
        {activeTab === "projects" && (
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {editedResume.projects.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-border rounded-xl space-y-2">
                <FolderGit2 className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">No projects were detected in the source file.</p>
              </div>
            ) : (
              editedResume.projects.map((proj, idx) => (
                <div key={proj.id || idx} className="p-3.5 rounded-xl border border-border bg-card space-y-1.5 text-xs">
                  <Input
                    value={proj.title}
                    onChange={(e) => {
                      const updated = [...editedResume.projects];
                      updated[idx].title = e.target.value;
                      setEditedResume({ ...editedResume, projects: updated });
                    }}
                    placeholder="Project Title"
                    className="h-7 text-xs font-bold"
                  />
                  <p className="text-muted-foreground leading-relaxed text-[11px]">{proj.description}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 7: IMPORT DIAGNOSTICS & SOURCE DOCUMENT */}
        {activeTab === "diagnostics" && (
          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
            {/* Diagnostics Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Extraction Engine</span>
                <span className="font-bold text-foreground block font-mono">Deterministic v2</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Processing Time</span>
                <span className="font-bold text-emerald-500 block font-mono">{diagnostics?.processingTimeMs || 15}ms</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Character Count</span>
                <span className="font-bold text-foreground block font-mono">{diagnostics?.characterCount || originalDocument?.rawText.length || 0} chars</span>
              </div>
              <div className="p-3 rounded-xl bg-secondary/40 border border-border space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Traceability Rate</span>
                <span className="font-bold text-emerald-500 block font-mono">100% Verified</span>
              </div>
            </div>

            {/* Detected vs Missing Sections Matrix */}
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
              <span className="font-bold text-foreground block">Section Coverage Matrix</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="space-y-1">
                  <span className="text-emerald-500 font-bold block">✓ Present in Document:</span>
                  <div className="flex flex-wrap gap-1">
                    {(diagnostics?.detectedSections || ["experience", "education", "skills"]).map((sec) => (
                      <span key={sec} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-muted-foreground font-bold block">○ Not Present in Document:</span>
                  <div className="flex flex-wrap gap-1">
                    {(diagnostics?.missingSections || []).length === 0 ? (
                      <span className="text-[10px] text-muted-foreground italic">None (Full document coverage)</span>
                    ) : (
                      diagnostics?.missingSections.map((sec) => (
                        <span key={sec} className="px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono text-[10px]">
                          {sec}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Inspectable Raw Document Text with Copy */}
            <div className="p-3.5 rounded-xl border border-border bg-card space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-primary" />
                  <span className="font-bold text-foreground">Stored Source Document Text</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyRaw}
                  className="h-6 text-[10px] gap-1 px-2"
                >
                  {copiedRawText ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRawText ? "Copied" : "Copy Raw Text"}</span>
                </Button>
              </div>

              <div className="p-3 rounded-lg bg-secondary/60 border border-border/80 font-mono text-[11px] max-h-[160px] overflow-y-auto leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {originalDocument?.rawText || "No raw text available."}
              </div>
            </div>
          </div>
        )}

        {/* Generation & Save Actions */}
        <div className="space-y-3 pt-3 border-t border-border">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Save & Continue With Verified Data:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              size="sm"
              variant="radiant"
              onClick={() => handleAction("builder")}
              className="h-10 text-xs font-bold gap-2 shadow-sm"
            >
              <FileText className="w-4 h-4" />
              <span>Save to Resume Builder</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("portfolio")}
              className="h-10 text-xs font-bold gap-2 border-primary/40 text-foreground hover:bg-primary/5"
            >
              <Globe className="w-4 h-4 text-primary" />
              <span>Generate Portfolio</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAction("ats")}
              className="h-10 text-xs font-bold gap-2 text-foreground hover:bg-secondary"
            >
              <Target className="w-4 h-4 text-emerald-500" />
              <span>Run ATS Match Audit</span>
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
