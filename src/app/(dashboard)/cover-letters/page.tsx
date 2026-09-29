"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { useCoverLetterStore } from "@/store/useCoverLetterStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CoverLetterArchetype, CoverLetterTone } from "@/types/cover-letter";
import { exportCoverLetterPDF } from "@/lib/cover-letter/export-pdf";
import { exportCoverLetterDOCX } from "@/lib/cover-letter/export-docx";
import {
  FileText,
  Sparkles,
  Download,
  FileDown,
  History,
  Copy,
  Plus,
  Trash2,
  Check,
  Loader2,
  RefreshCw,
  Sliders,
  Briefcase,
  Building2,
  User,
  GraduationCap,
  Rocket,
  Atom,
  Clock,
  Layers,
  CheckCircle2,
} from "lucide-react";

const ARCHETYPES: { id: CoverLetterArchetype; label: string; icon: any; description: string }[] = [
  { id: "software-engineer", label: "Software Engineer", icon: Briefcase, description: "Technical metrics, scale & architectures" },
  { id: "internship", label: "Internship & Grad", icon: GraduationCap, description: "Academic projects & high velocity" },
  { id: "product-manager", label: "Product Manager", icon: Layers, description: "Strategy, roadmaps & metrics" },
  { id: "startup", label: "Startup / Generalist", icon: Rocket, description: "Speed, wearing multiple hats & ownership" },
  { id: "corporate", label: "Enterprise Corporate", icon: Building2, description: "Governance, compliance & stability" },
  { id: "research", label: "R&D / Research", icon: Atom, description: "Algorithmic rigor & publications" },
];

const TONES: { id: CoverLetterTone; label: string }[] = [
  { id: "professional", label: "Professional" },
  { id: "enthusiastic", label: "Enthusiastic" },
  { id: "minimalist", label: "Minimalist" },
  { id: "storytelling", label: "Storytelling" },
  { id: "data-driven", label: "Data-Driven" },
];

export default function CoverLettersPage() {
  const { success, error: showErrorToast } = useToast();
  const resumes = useResumeStore((state) => state.resumes);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);

  const coverLetters = useCoverLetterStore((state) => state.coverLetters);
  const activeCoverLetterId = useCoverLetterStore((state) => state.activeCoverLetterId);
  const getActiveCoverLetter = useCoverLetterStore((state) => state.getActiveCoverLetter);
  const setActiveCoverLetterId = useCoverLetterStore((state) => state.setActiveCoverLetterId);
  const createNewCoverLetter = useCoverLetterStore((state) => state.createNewCoverLetter);
  const updateCoverLetter = useCoverLetterStore((state) => state.updateCoverLetter);
  const deleteCoverLetter = useCoverLetterStore((state) => state.deleteCoverLetter);
  const saveVersionSnapshot = useCoverLetterStore((state) => state.saveVersionSnapshot);
  const restoreVersion = useCoverLetterStore((state) => state.restoreVersion);

  const activeCL = getActiveCoverLetter();

  const selectedResume =
    resumes.find((r) => r.id === (activeCL.resumeId || activeResumeId)) || resumes[0];

  const [selectedResumeId, setSelectedResumeId] = useState(selectedResume?.id || "");
  const [targetRole, setTargetRole] = useState(activeCL.targetRole || "Senior Software Engineer");
  const [companyName, setCompanyName] = useState(activeCL.companyName || "Anthropic");
  const [hiringManager, setHiringManager] = useState(activeCL.hiringManager || "Hiring Team");
  const [jobDescription, setJobDescription] = useState(activeCL.jobDescription || "");
  const [selectedArchetype, setSelectedArchetype] = useState<CoverLetterArchetype>(activeCL.archetype || "software-engineer");
  const [selectedTone, setSelectedTone] = useState<CoverLetterTone>(activeCL.tone || "professional");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingDOCX, setIsExportingDOCX] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Sync state when active cover letter changes
  const handleSelectCoverLetter = (id: string) => {
    setActiveCoverLetterId(id);
    const target = coverLetters.find((c) => c.id === id);
    if (target) {
      setTargetRole(target.targetRole);
      setCompanyName(target.companyName);
      setHiringManager(target.hiringManager || "");
      setJobDescription(target.jobDescription || "");
      setSelectedArchetype(target.archetype);
      setSelectedTone(target.tone);
    }
  };

  // Generate with AI
  const handleGenerate = async (toneOverride?: CoverLetterTone) => {
    if (!targetRole.trim() || !companyName.trim()) {
      showErrorToast("Please enter Target Role and Company Name.");
      return;
    }

    const currentResume = resumes.find((r) => r.id === selectedResumeId) || selectedResume;
    if (!currentResume) {
      showErrorToast("Please select a valid resume.");
      return;
    }

    setIsGenerating(true);
    const toneToUse = toneOverride || selectedTone;

    try {
      // Save snapshot of current content before regenerating
      saveVersionSnapshot(activeCL.id);

      const res = await fetch("/api/cover-letter/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume: currentResume,
          jobDescription,
          targetRole,
          companyName,
          hiringManager,
          archetype: selectedArchetype,
          tone: toneToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate cover letter.");

      updateCoverLetter(activeCL.id, {
        title: `${targetRole} – ${companyName}`,
        targetRole,
        companyName,
        hiringManager,
        jobDescription,
        archetype: selectedArchetype,
        tone: toneToUse,
        senderName: currentResume.personalInfo?.fullName || activeCL.senderName,
        senderTitle: currentResume.personalInfo?.jobTitle || activeCL.senderTitle,
        senderEmail: currentResume.personalInfo?.email || activeCL.senderEmail,
        senderPhone: currentResume.personalInfo?.phone || activeCL.senderPhone,
        senderLocation: currentResume.personalInfo?.location || activeCL.senderLocation,
        recipientCompany: companyName,
        recipientName: hiringManager || "Hiring Team",
        content: data.content,
      });

      success(`Generated ${toneToUse} cover letter for ${companyName}!`);
    } catch (err: any) {
      showErrorToast(err.message || "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Export PDF
  const handleExportPDF = async () => {
    setIsExportingPDF(true);
    try {
      await exportCoverLetterPDF(activeCL);
      success("Cover letter PDF downloaded!");
    } catch (err) {
      showErrorToast("Failed to export PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Export DOCX
  const handleExportDOCX = async () => {
    setIsExportingDOCX(true);
    try {
      await exportCoverLetterDOCX(activeCL);
      success("Cover letter Word (.docx) downloaded!");
    } catch (err) {
      showErrorToast("Failed to export DOCX.");
    } finally {
      setIsExportingDOCX(false);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(activeCL.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    success("Copied to clipboard!");
  };

  const wordCount = activeCL.content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Top Header & Cover Letter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary border border-border text-foreground">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              AI Cover Letter Studio
            </h1>
            <p className="text-xs text-muted-foreground">
              Generate metric-backed, authentic cover letters tailored to specific jobs and career archetypes.
            </p>
          </div>
        </div>

        {/* Cover Letter Selector & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={activeCL.id}
            onChange={(e) => handleSelectCoverLetter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-semibold text-foreground focus:outline-hidden max-w-[200px]"
          >
            {coverLetters.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.title || "Untitled Cover Letter"}
              </option>
            ))}
          </select>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1 font-medium"
            onClick={() => {
              const newId = createNewCoverLetter({
                targetRole: "Senior Software Engineer",
                companyName: "Target Company",
                senderName: selectedResume?.personalInfo?.fullName || "Candidate Name",
                senderEmail: selectedResume?.personalInfo?.email || "candidate@example.com",
              });
              handleSelectCoverLetter(newId);
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            New Letter
          </Button>
        </div>
      </div>

      {/* Main Studio Grid: Control Sidebar (Left) & Notion Live Canvas (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Generation Controls & Criteria (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5" />
              Target Role & Context
            </h2>

            {/* Resume Source Selector */}
            <div className="space-y-1">
              <Label className="text-[11px]">Source Resume</Label>
              <select
                value={selectedResumeId}
                onChange={(e) => {
                  setSelectedResumeId(e.target.value);
                  const r = resumes.find((res) => res.id === e.target.value);
                  if (r) {
                    updateCoverLetter(activeCL.id, {
                      resumeId: r.id,
                      senderName: r.personalInfo?.fullName || activeCL.senderName,
                      senderTitle: r.personalInfo?.jobTitle || activeCL.senderTitle,
                      senderEmail: r.personalInfo?.email || activeCL.senderEmail,
                    });
                  }
                }}
                className="w-full h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground focus:outline-hidden"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Role & Company */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <Label required className="text-[11px]">Target Role</Label>
                <Input
                  placeholder="e.g. Senior Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <Label required className="text-[11px]">Company Name</Label>
                <Input
                  placeholder="e.g. Anthropic"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div>
              <Label className="text-[11px]">Hiring Manager Name (Optional)</Label>
              <Input
                placeholder="e.g. Sarah Jenkins or Engineering Hiring Team"
                value={hiringManager}
                onChange={(e) => setHiringManager(e.target.value)}
                className="h-8 text-xs"
              />
            </div>

            {/* Career Archetype Selector */}
            <div className="space-y-1.5">
              <Label className="text-[11px]">Career Archetype</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {ARCHETYPES.map((arch) => {
                  const Icon = arch.icon;
                  const isSelected = selectedArchetype === arch.id;
                  return (
                    <button
                      key={arch.id}
                      type="button"
                      onClick={() => setSelectedArchetype(arch.id)}
                      className={`p-2 rounded-lg border text-left transition-colors ${
                        isSelected
                          ? "bg-secondary text-foreground border-primary font-semibold shadow-2xs"
                          : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[11px] truncate">{arch.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tone Selector */}
            <div className="space-y-1.5">
              <Label className="text-[11px]">Writing Tone</Label>
              <div className="flex flex-wrap gap-1">
                {TONES.map((t) => {
                  const isSelected = selectedTone === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setSelectedTone(t.id);
                        if (activeCL.content && !isGenerating) {
                          handleGenerate(t.id);
                        }
                      }}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                        isSelected
                          ? "bg-secondary text-foreground border border-border shadow-2xs font-semibold"
                          : "text-muted-foreground hover:bg-secondary/50"
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-1">
              <Label className="text-[11px]">Job Description / Key Requirements</Label>
              <Textarea
                rows={5}
                placeholder="Paste key responsibilities or JD requirements to calibrate project citations..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="text-xs font-mono resize-none leading-relaxed"
              />
            </div>

            {/* Generate Button */}
            <Button
              type="button"
              variant="radiant"
              size="sm"
              className="w-full text-xs font-semibold gap-1.5 shadow-2xs h-8.5"
              onClick={() => handleGenerate()}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating Letter...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate AI Cover Letter
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Notion-Style Live Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Top Document Action Bar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-border bg-card shadow-2xs text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-muted-foreground font-semibold px-2 py-0.5 rounded bg-secondary">
                {wordCount} words
              </span>
              <span className="text-[11px] text-muted-foreground capitalize">
                • {activeCL.tone} tone
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 gap-1"
                onClick={() => setIsHistoryModalOpen(true)}
                title="Version History"
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Versions ({activeCL.versions?.length || 0})</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 gap-1"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2 gap-1"
                onClick={handleExportDOCX}
                disabled={isExportingDOCX}
                title="Download Microsoft Word .docx"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOCX</span>
              </Button>

              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="h-7 text-xs px-2.5 gap-1 font-semibold shadow-2xs"
                onClick={handleExportPDF}
                disabled={isExportingPDF}
                title="Download formatted Letterhead PDF"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>PDF</span>
              </Button>
            </div>
          </div>

          {/* Notion Document Canvas */}
          <div className="p-8 sm:p-12 rounded-xl border border-border bg-card shadow-xs space-y-6 text-foreground font-sans leading-relaxed">
            {/* Sender Header Block */}
            <div className="border-b border-border/80 pb-4 space-y-1">
              <input
                type="text"
                value={activeCL.senderName}
                onChange={(e) => updateCoverLetter(activeCL.id, { senderName: e.target.value })}
                placeholder="Your Full Name"
                className="text-xl font-bold text-foreground bg-transparent border-none focus:outline-hidden w-full"
              />
              <input
                type="text"
                value={activeCL.senderTitle || ""}
                onChange={(e) => updateCoverLetter(activeCL.id, { senderTitle: e.target.value })}
                placeholder="Professional Headline"
                className="text-xs text-muted-foreground bg-transparent border-none focus:outline-hidden w-full font-medium"
              />
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1">
                <span>{activeCL.senderEmail}</span>
                {activeCL.senderPhone && <span>• {activeCL.senderPhone}</span>}
                {activeCL.senderLocation && <span>• {activeCL.senderLocation}</span>}
              </div>
            </div>

            {/* Date & Recipient Details */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <input
                type="text"
                value={activeCL.date}
                onChange={(e) => updateCoverLetter(activeCL.id, { date: e.target.value })}
                className="bg-transparent border-none focus:outline-hidden font-medium text-foreground w-48 block"
              />
              <div className="pt-2 text-foreground font-medium space-y-0.5">
                <input
                  type="text"
                  value={activeCL.recipientName || ""}
                  onChange={(e) => updateCoverLetter(activeCL.id, { recipientName: e.target.value })}
                  placeholder="Hiring Manager / Team"
                  className="bg-transparent border-none focus:outline-hidden text-xs font-bold block w-full text-foreground"
                />
                <input
                  type="text"
                  value={activeCL.recipientCompany || activeCL.companyName || ""}
                  onChange={(e) => updateCoverLetter(activeCL.id, { recipientCompany: e.target.value })}
                  placeholder="Company Name"
                  className="bg-transparent border-none focus:outline-hidden text-xs text-muted-foreground block w-full"
                />
              </div>
            </div>

            {/* Editable Letter Body */}
            <div className="pt-2">
              <Textarea
                rows={16}
                value={activeCL.content}
                onChange={(e) => updateCoverLetter(activeCL.id, { content: e.target.value })}
                placeholder="Write or generate your cover letter content..."
                className="w-full bg-transparent border-none focus:outline-hidden text-xs sm:text-sm font-sans leading-relaxed resize-none p-0 focus-visible:ring-0 shadow-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen} maxWidth="md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-foreground">
            <History className="w-4 h-4" />
            <DialogTitle>Version History</DialogTitle>
          </div>
          <DialogDescription>
            Restore previous drafts and tone iterations of this cover letter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {activeCL.versions && activeCL.versions.length > 0 ? (
            activeCL.versions.map((ver, idx) => (
              <div
                key={ver.id}
                className="p-3 rounded-lg border border-border bg-secondary/30 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground capitalize">{ver.tone} Tone</span>
                    <span className="text-[10px] text-muted-foreground font-mono">({ver.wordCount} words)</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(ver.savedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-6.5 text-[11px] px-2 font-medium"
                  onClick={() => {
                    restoreVersion(activeCL.id, ver.id);
                    success("Restored previous version!");
                    setIsHistoryModalOpen(false);
                  }}
                >
                  Restore
                </Button>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-6">
              No previous versions saved yet. New snapshots are captured automatically when regenerating.
            </p>
          )}
        </div>
      </Dialog>
    </div>
  );
}
