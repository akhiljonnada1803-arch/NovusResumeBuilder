"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LinkedinIcon } from "@/components/shared/icons";
import { ParsedLinkedInProfile } from "@/lib/integrations/linkedin/linkedin-parser";
import { Resume } from "@/types/resume";
import {
  UploadCloud,
  FileUp,
  Sparkles,
  Loader2,
  Check,
  Plus,
  Briefcase,
  GraduationCap,
  Award,
  Code2,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  FolderGit2,
  User,
  Info,
  Globe,
} from "lucide-react";

const SAMPLE_LINKEDIN_PROFILE = `Alex Rivera
Senior Full-Stack & AI Systems Engineer
San Francisco Bay Area • alex.rivera.dev@example.com • +1 (555) 389-4021
LinkedIn: linkedin.com/in/alexrivera-ai • Website: https://alexrivera.dev

About:
High-velocity Software Engineer with 6+ years of experience architecting distributed cloud applications, LLM pipelines, and modern web platforms. Proven track record of scaling Next.js and Microservices architectures to 2M+ active users while reducing latency by 42%.

Experience:
Staff Software Engineer / Tech Lead
Synthetix AI Systems • San Francisco, CA
Mar 2022 - Present
- Lead the core platform architecture team building generative AI workflows and agentic tool execution pipelines.
- Architected real-time RAG ingestion pipeline indexing 50M+ documents with sub-80ms semantic retrieval.
- Spearheaded migration of legacy monolith to Next.js App Router and Go microservices, boosting lighthouse performance by 35%.

Senior Full-Stack Developer
Veloce Labs • Austin, TX
Jun 2019 - Feb 2022
- Engineered high-throughput financial analytics dashboard with Next.js, TypeScript, and Tailwind CSS.
- Optimized Redis caching layers and PostgreSQL indexing, reducing median API query response times by 48%.

Education:
University of California, Berkeley
Bachelor of Science in Computer Science
2015 - 2019

Skills:
TypeScript, React, Next.js, Node.js, Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes, AWS Cloud, GraphQL, Microservices, CI/CD, System Architecture

Licenses & Certifications:
- AWS Certified Solutions Architect - Associate (Amazon Web Services, 2023)
- Certified Kubernetes Application Developer (CKAD) (Linux Foundation, 2022)

Projects:
- OpenVector Semantic Search: High-performance vector search engine built in Rust and Next.js.
- AgentCraft IDE: Autonomous developer workspace for generative coding pipelines.`;

interface LinkedInImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (newResumeId: string) => void;
}

export function LinkedInImportModal({
  open,
  onOpenChange,
  onSuccess,
}: LinkedInImportModalProps) {
  const router = useRouter();
  const { success, error: showErrorToast } = useToast();
  const importResume = useResumeStore((state) => state.importResume);
  const activeResumeId = useResumeStore((state) => state.activeResumeId);
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const addExperience = useResumeStore((state) => state.addExperience);
  const addEducation = useResumeStore((state) => state.addEducation);
  const addSkill = useResumeStore((state) => state.addSkill);
  const addCertification = useResumeStore((state) => state.addCertification);
  const addProject = useResumeStore((state) => state.addProject);

  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [profileText, setProfileText] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<{
    profile: ParsedLinkedInProfile;
    resume: Resume;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle PDF file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setUploadedFileName(file.name);
    setParsedData(null);

    const formData = new FormData();
    formData.append("file", file);
    if (linkedinUrl) formData.append("linkedinUrl", linkedinUrl);

    try {
      const res = await fetch("/api/integrations/linkedin/import", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import LinkedIn profile.");

      setParsedData(data);
      success("LinkedIn profile parsed successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to parse LinkedIn document.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Text Import
  const handleTextImport = async () => {
    if (!profileText.trim() || profileText.length < 20) {
      showErrorToast("Please paste your complete LinkedIn profile text.");
      return;
    }

    setIsProcessing(true);
    setParsedData(null);

    try {
      const res = await fetch("/api/integrations/linkedin/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileText: profileText.trim(),
          linkedinUrl: linkedinUrl.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to import profile.");

      setParsedData(data);
      success("LinkedIn profile parsed successfully!");
    } catch (err: any) {
      showErrorToast(err.message || "Failed to process profile text.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Action A: Create as Brand New Resume
  const handleCreateNewResume = () => {
    if (!parsedData) return;

    const newResume = parsedData.resume;
    importResume(newResume);
    success(`Created new resume for ${parsedData.profile.fullName}!`);
    onOpenChange(false);

    if (onSuccess) {
      onSuccess(newResume.id);
    } else {
      router.push(`/builder/${newResume.id}`);
    }
  };

  // Action B: Merge into Active Resume
  const handleMergeIntoCurrent = () => {
    if (!parsedData) return;
    const { profile } = parsedData;

    // 1. Update personal info if empty or requested
    updatePersonalInfo({
      fullName: profile.fullName,
      jobTitle: profile.jobTitle,
      summary: profile.summary,
      linkedin: profile.linkedinUrl,
    });

    // 2. Add experience items
    profile.experience.forEach((exp) => {
      addExperience({
        company: exp.company,
        position: exp.position,
        location: exp.location,
        startDate: exp.startDate,
        endDate: exp.endDate,
        current: exp.current,
        description: exp.description,
        highlights: exp.highlights,
      });
    });

    // 3. Add education items
    profile.education.forEach((edu) => {
      addEducation({
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy,
        startDate: edu.startDate,
        endDate: edu.endDate,
      });
    });

    // 4. Add skills
    profile.skills.forEach((sk) => {
      addSkill({
        name: sk.name,
        category: sk.category,
        level: sk.level,
      });
    });

    // 5. Add certifications
    profile.certifications.forEach((cert) => {
      addCertification({
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate,
        credentialUrl: cert.credentialUrl,
      });
    });

    // 6. Add projects
    profile.projects.forEach((proj) => {
      addProject({
        title: proj.title,
        subtitle: proj.subtitle,
        description: proj.description,
        technologies: proj.technologies,
      });
    });

    success("Successfully merged LinkedIn profile data into your active resume!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <LinkedinIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <DialogTitle>Import from LinkedIn</DialogTitle>
        </div>
        <DialogDescription>
          Import your work experience, education, endorsements, and certifications directly from your LinkedIn profile.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        {/* State 1: Input & Ingestion */}
        {!parsedData ? (
          <div className="space-y-4">
            {/* Method Tabs */}
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-1.5 bg-secondary/50 p-0.5 rounded-lg border border-border/60">
                <button
                  type="button"
                  onClick={() => setInputMode("upload")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    inputMode === "upload"
                      ? "bg-card text-foreground shadow-2xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload LinkedIn PDF Export
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("paste")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                    inputMode === "paste"
                      ? "bg-card text-foreground shadow-2xs border border-border/60"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Paste Profile Text / JSON
                </button>
              </div>
            </div>

            {/* Ingestion Mode Content */}
            {inputMode === "upload" ? (
              <div className="space-y-3">
                {/* PDF Dropzone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border hover:border-blue-500/80 bg-secondary/20 p-8 rounded-xl text-center cursor-pointer transition-colors space-y-2.5"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".pdf,.docx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-xl bg-card border border-border flex items-center justify-center mx-auto shadow-2xs">
                    <LinkedinIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {uploadedFileName || "Upload your LinkedIn Profile PDF Export"}
                  </h4>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Click to browse or drop your LinkedIn PDF file. Text, experience, and skills will be extracted automatically.
                  </p>
                </div>

                {/* How-To Tip */}
                <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 flex items-start gap-2.5 text-xs text-blue-800 dark:text-blue-300">
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">How to get your LinkedIn PDF:</span>
                    <span>
                      Open your LinkedIn profile &rarr; click <strong>More</strong> (under your headline) &rarr; select <strong>Save to PDF</strong>.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Paste Text Mode */
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label className="mb-0">Paste LinkedIn Profile Text</Label>
                    <button
                      type="button"
                      onClick={() => setProfileText(SAMPLE_LINKEDIN_PROFILE)}
                      className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Use Sample Profile
                    </button>
                  </div>
                  <Textarea
                    rows={8}
                    value={profileText}
                    onChange={(e) => setProfileText(e.target.value)}
                    placeholder="Paste the text from your LinkedIn profile here (Experience, Education, Skills, About)..."
                    className="text-xs font-mono resize-none leading-relaxed"
                  />
                </div>

                <div>
                  <Label>LinkedIn Profile URL (Optional)</Label>
                  <Input
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    leftIcon={<LinkedinIcon className="w-4 h-4 text-blue-600" />}
                    className="h-8 text-xs"
                  />
                </div>

                <Button
                  type="button"
                  variant="radiant"
                  size="sm"
                  className="w-full text-xs font-semibold gap-1.5 shadow-2xs h-8.5"
                  onClick={handleTextImport}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Parsing Profile with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      Parse & Structure LinkedIn Profile
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* State 2: Parsed Profile Preview & Action Choices */
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Header summary */}
            <div className="p-4 rounded-xl border border-border bg-card shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 text-sm">
                  {parsedData.profile.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {parsedData.profile.fullName}
                  </h3>
                  <p className="text-xs font-medium text-muted-foreground">
                    {parsedData.profile.jobTitle}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setParsedData(null)}
              >
                <RefreshCw className="w-3 h-3" /> Re-import
              </Button>
            </div>

            {/* Extracted Sections Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg border border-border bg-secondary/30">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Experience
                </span>
                <span className="font-bold font-mono text-sm text-foreground">
                  {parsedData.profile.experience.length} Roles
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-secondary/30">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Education
                </span>
                <span className="font-bold font-mono text-sm text-foreground">
                  {parsedData.profile.education.length} Degrees
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-secondary/30">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Skills
                </span>
                <span className="font-bold font-mono text-sm text-foreground">
                  {parsedData.profile.skills.length} Keywords
                </span>
              </div>
              <div className="p-2.5 rounded-lg border border-border bg-secondary/30">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Certs & Projects
                </span>
                <span className="font-bold font-mono text-sm text-foreground">
                  {parsedData.profile.certifications.length + parsedData.profile.projects.length} Items
                </span>
              </div>
            </div>

            {/* Skills preview cloud */}
            {parsedData.profile.skills.length > 0 && (
              <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-2 text-xs">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                  Extracted Skills & Competencies:
                </span>
                <div className="flex flex-wrap gap-1">
                  {parsedData.profile.skills.map((s, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/80 font-medium"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Decision Card */}
            <div className="p-4 rounded-xl border border-border bg-secondary/40 space-y-3">
              <span className="text-xs font-semibold text-foreground block">
                How would you like to use this profile?
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={handleCreateNewResume}
                  className="p-3.5 rounded-xl border border-primary/60 bg-card hover:bg-secondary text-left transition-colors space-y-1 shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between font-semibold text-xs text-foreground group-hover:text-primary">
                    <span>Create New Resume</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Build a brand new ATS resume populated from LinkedIn.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleCreateNewResume();
                    router.push("/portfolio");
                  }}
                  className="p-3.5 rounded-xl border border-blue-500/50 bg-card hover:bg-secondary text-left transition-colors space-y-1 shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between font-semibold text-xs text-foreground group-hover:text-blue-500">
                    <span>Generate Portfolio</span>
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Instantly turn your LinkedIn into a deployable portfolio.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={handleMergeIntoCurrent}
                  className="p-3.5 rounded-xl border border-border bg-card hover:bg-secondary text-left transition-colors space-y-1 shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between font-semibold text-xs text-foreground group-hover:text-primary">
                    <span>Merge to Active</span>
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Import missing sections into your active resume.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
