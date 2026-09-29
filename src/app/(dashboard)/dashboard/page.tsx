"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";
import { calculateATSScore } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TEMPLATE_OPTIONS } from "@/lib/constants";
import { ResumeTemplateId } from "@/types/resume";
import {
  FileText,
  Plus,
  Copy,
  Trash2,
  Edit,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Globe,
  Sparkles,
  Check,
  UploadCloud,
} from "lucide-react";

import { LinkedInImportModal } from "@/components/integrations/LinkedInImportModal";
import { GitHubImportModal } from "@/components/integrations/GitHubImportModal";
import { LinkedinIcon, GithubIcon } from "@/components/shared/icons";

export default function DashboardPage() {
  const router = useRouter();
  const resumes = useResumeStore((state) => state.resumes);
  const createNewResume = useResumeStore((state) => state.createNewResume);
  const duplicateResume = useResumeStore((state) => state.duplicateResume);
  const deleteResume = useResumeStore((state) => state.deleteResume);
  const resetToSampleData = useResumeStore((state) => state.resetToSampleData);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);
  const [newResumeTitle, setNewResumeTitle] = useState("");
  const [newResumeTemplate, setNewResumeTemplate] = useState<ResumeTemplateId>("modern");

  // Calculate statistics across all user resumes
  const totalResumes = resumes.length;
  const avgAtsScore =
    totalResumes > 0
      ? Math.round(
          resumes.reduce((acc, r) => acc + calculateATSScore(r).overallScore, 0) / totalResumes
        )
      : 0;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = createNewResume(newResumeTitle || "Untitled Resume", newResumeTemplate);
    setIsCreateModalOpen(false);
    setNewResumeTitle("");
    router.push(`/builder/${id}`);
  };

  const handleDuplicate = (id: string) => {
    const newId = duplicateResume(id);
    router.push(`/builder/${newId}`);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Resume Management
          </h1>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Create, test, and tailor your resumes against top enterprise ATS parsers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {resumes.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetToSampleData}
              className="text-xs"
            >
              Load Sample Resume
            </Button>
          )}

          <Button
            onClick={() => setIsLinkedInModalOpen(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/40 hover:bg-blue-50 dark:hover:bg-blue-950/30"
          >
            <LinkedinIcon className="w-3.5 h-3.5" />
            Import LinkedIn
          </Button>

          <Button
            onClick={() => setIsGitHubModalOpen(true)}
            size="sm"
            variant="outline"
            className="gap-1.5 text-xs"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            Import GitHub
          </Button>

          <Link href="/import">
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Import PDF / DOCX</span>
            </Button>
          </Link>

          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            variant="radiant"
            className="gap-1.5 text-xs shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            New Resume
          </Button>
        </div>
      </div>

      <LinkedInImportModal
        open={isLinkedInModalOpen}
        onOpenChange={setIsLinkedInModalOpen}
      />

      <GitHubImportModal
        open={isGitHubModalOpen}
        onOpenChange={setIsGitHubModalOpen}
      />

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Total Resumes</span>
            <FileText className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">{totalResumes}</p>
          <span className="text-[10px] text-muted-foreground">Ready for applications</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Avg ATS Score</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {avgAtsScore}%
          </p>
          <span className="text-[10px] text-muted-foreground">Industry standard &gt; 80%</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">AI Bullet Enhancer</span>
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">Active</p>
          <span className="text-[10px] text-muted-foreground">Unlimited smart suggestions</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-[11px] font-medium">Job Match Rate</span>
            <TrendingUp className="w-3.5 h-3.5 text-foreground" />
          </div>
          <p className="text-xl font-bold text-foreground">96%</p>
          <span className="text-[10px] text-muted-foreground">Tier-1 company benchmark</span>
        </div>
      </div>

      {/* Resume Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Resumes ({resumes.length})
          </h2>
        </div>

        {resumes.length === 0 ? (
          <div className="p-10 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs space-y-3">
            <FileText className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <h3 className="text-sm font-semibold text-foreground">No resumes created yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Start building your first ATS-optimized resume in under 3 minutes.
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)} size="sm" className="gap-1.5 mt-2">
              <Plus className="w-3.5 h-3.5" />
              Create First Resume
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume) => {
              const ats = calculateATSScore(resume);

              return (
                <div
                  key={resume.id}
                  className="group rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 transition-colors duration-150 flex flex-col justify-between overflow-hidden shadow-2xs"
                >
                  {/* Card Header */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0">
                        <span className="text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border/60">
                          {resume.design?.template || "Modern"}
                        </span>
                        <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                          {resume.title || "Untitled Resume"}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {resume.personalInfo.fullName
                            ? `${resume.personalInfo.fullName} • ${resume.personalInfo.jobTitle || "Role"}`
                            : "Draft Resume"}
                        </p>
                      </div>

                      {/* ATS Pill */}
                      <div
                        className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md shrink-0 border ${
                          ats.overallScore >= 80
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40"
                        }`}
                        title="ATS Score"
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{ats.overallScore}%</span>
                      </div>
                    </div>

                    {/* Resume Details snippet */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-2.5 border-t border-border/60">
                      <div>
                        <span>Experience: </span>
                        <span className="font-medium text-foreground">
                          {resume.experience.length} roles
                        </span>
                      </div>
                      <div>
                        <span>Skills: </span>
                        <span className="font-medium text-foreground">
                          {resume.skills.length} listed
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">
                      Updated {formatDate(resume.updatedAt?.split("T")[0]) || "Recently"}
                    </span>

                    <div className="flex items-center gap-1">
                      <Link href={`/p/${resume.id}`} target="_blank">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          title="View Live Portfolio Website"
                        >
                          <Globe className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => handleDuplicate(resume.id)}
                        title="Duplicate Resume"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {resumes.length > 1 && (
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          className="hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteResume(resume.id)}
                          title="Delete Resume"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Link href={`/builder/${resume.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 font-medium">
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Resume Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} maxWidth="lg">
        <DialogHeader>
          <DialogTitle>Create New Resume</DialogTitle>
          <DialogDescription>
            Choose a resume title and starting template. Content can be customized at any time.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreate} className="space-y-4 pt-1">
          <div>
            <Label required>Resume Title</Label>
            <Input
              placeholder="e.g. Senior Software Engineer - Stripe Application"
              value={newResumeTitle}
              onChange={(e) => setNewResumeTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label>Initial Template</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TEMPLATE_OPTIONS.map((tmpl) => {
                const isSelected = newResumeTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setNewResumeTemplate(tmpl.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? "border-primary bg-secondary text-foreground font-semibold"
                        : "border-border bg-card hover:bg-secondary/50 text-foreground"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold">{tmpl.name}</h4>
                      {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" variant="radiant" className="gap-1.5">
              Launch Builder
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
