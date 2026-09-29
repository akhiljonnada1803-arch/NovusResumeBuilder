"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sparkles,
  Wand2,
  Check,
  Copy,
  FolderGit2,
  Trophy,
  Code2,
  User,
  Briefcase,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";

interface AIAssistantStudioProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialMode?: "improve_bullet" | "rewrite_project" | "generate_achievement" | "suggest_skills" | "professional_polish";
}

export function AIAssistantStudio({
  open,
  onOpenChange,
  initialMode = "improve_bullet",
}: AIAssistantStudioProps) {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const addSkill = useResumeStore((state) => state.addSkill);
  const addAchievement = useResumeStore((state) => state.addAchievement);
  const addExperienceHighlight = useResumeStore((state) => state.addExperienceHighlight);

  const [activeTab, setActiveTab] = useState<string>(initialMode);
  const [inputText, setInputText] = useState("");
  const [targetContext, setTargetContext] = useState(activeResume.targetRole || activeResume.personalInfo?.jobTitle || "Senior Software Engineer");
  const [streamedResult, setStreamedResult] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Suggested skills parsed from JSON if in skills mode
  const [suggestedSkillsList, setSuggestedSkillsList] = useState<any[]>([]);

  const handleGenerate = async (modeOverride?: string) => {
    const mode = modeOverride || activeTab;
    setIsStreaming(true);
    setStreamedResult("");
    setErrorMessage(null);
    setSuggestedSkillsList([]);

    try {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          input: inputText || (mode === "professional_polish" ? activeResume.personalInfo?.summary : ""),
          context: {
            targetRole: targetContext,
            existingSkills: activeResume.skills.map((s) => s.name),
            company: activeResume.experience[0]?.company || "Tech Company",
            title: activeResume.projects[0]?.title || "Project",
          },
        }),
      });

      if (!response.ok) {
        throw new Error("AI service returned an error. Please try again.");
      }

      if (!response.body) {
        throw new Error("No response stream received.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setStreamedResult((prev) => prev + chunk);
      }

      // If in skills suggestion mode, try to parse JSON
      if (mode === "suggest_skills") {
        try {
          const parsed = JSON.parse(accumulated.trim());
          if (Array.isArray(parsed)) {
            setSuggestedSkillsList(parsed);
          }
        } catch {
          // Keep as text
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to generate AI enhancement");
    } finally {
      setIsStreaming(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(streamedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplySummary = (text: string) => {
    const clean = text.replace(/^\[.*?\]\n?/gm, "").trim();
    updatePersonalInfo({ summary: clean });
    onOpenChange(false);
  };

  const handleAddSuggestedSkill = (skill: any) => {
    addSkill({
      name: skill.name,
      category: skill.category || "Technical",
      level: skill.level || "Advanced",
    });
    setSuggestedSkillsList((prev) => prev.filter((s) => s.name !== skill.name));
  };

  const handleApplyAchievement = (text: string) => {
    const lines = text.split("\n").filter((l) => l.trim().length > 0);
    const firstLine = lines[0]?.replace(/^[•\-\*]\s*/, "").replace(/^\[.*?\]\s*/, "") || text;
    addAchievement({
      title: firstLine.substring(0, 60),
      description: text,
      date: new Date().toISOString().substring(0, 7),
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} maxWidth="3xl">
      <DialogHeader>
        <div className="flex items-center gap-2 text-foreground">
          <Sparkles className="w-4 h-4 text-foreground" />
          <DialogTitle>AI Assistant Studio</DialogTitle>
        </div>
        <DialogDescription>
          Generate ATS-optimized bullet points, rewrite technical projects, craft achievement statements, and identify missing high-demand skills.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {/* Feature Mode Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 bg-secondary/60 rounded-lg border border-border/80">
          <button
            type="button"
            onClick={() => {
              setActiveTab("improve_bullet");
              setStreamedResult("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "improve_bullet"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Bullets</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("rewrite_project");
              setStreamedResult("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "rewrite_project"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Projects</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("generate_achievement");
              setStreamedResult("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "generate_achievement"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Awards</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("suggest_skills");
              setStreamedResult("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors ${
              activeTab === "suggest_skills"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Skill Radar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("professional_polish");
              setStreamedResult("");
            }}
            className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-colors col-span-2 sm:col-span-1 ${
              activeTab === "professional_polish"
                ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Summary</span>
          </button>
        </div>

        {/* Input & Context Form */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          <div>
            <Label>Target Role</Label>
            <Input
              value={targetContext}
              onChange={(e) => setTargetContext(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
              leftIcon={<Briefcase className="w-3.5 h-3.5" />}
            />
          </div>

          <div className="md:col-span-2">
            <Label>
              {activeTab === "suggest_skills"
                ? "Additional focus or industry context (Optional)"
                : "Your Draft / Notes to Enhance"}
            </Label>
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTab === "improve_bullet"
                    ? "e.g. helped team build web app frontend and improved performance"
                    : activeTab === "rewrite_project"
                    ? "e.g. built a multi-modal AI search engine with nextjs and python"
                    : activeTab === "generate_achievement"
                    ? "e.g. won 1st prize in global AI hackathon"
                    : "e.g. focused on high-scale distributed backend and cloud"
                }
              />
              <Button
                type="button"
                variant="radiant"
                size="sm"
                className="shrink-0 h-9"
                disabled={isStreaming}
                onClick={() => handleGenerate()}
              >
                {isStreaming ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Streaming Output Panel */}
        <div className="rounded-lg border border-border bg-card p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                AI Generated Output
              </span>
              {isStreaming && (
                <span className="text-[10px] text-foreground font-mono animate-pulse">
                  • Streaming...
                </span>
              )}
            </div>

            {streamedResult && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-6 text-xs gap-1"
                onClick={handleCopy}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            )}
          </div>

          {/* Render Missing Skills Tags if activeTab === suggest_skills */}
          {activeTab === "suggest_skills" && suggestedSkillsList.length > 0 ? (
            <div className="space-y-2 pt-1">
              <p className="text-xs text-muted-foreground">
                Click any suggested skill to instantly add it to your resume:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestedSkillsList.map((skill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSuggestedSkill(skill)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-secondary hover:bg-card text-foreground border border-border/80 text-xs font-medium cursor-pointer shadow-2xs"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{skill.name}</span>
                    {skill.category && (
                      <span className="text-[10px] text-muted-foreground">({skill.category})</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-md bg-secondary/30 border border-border/60 min-h-[120px] text-xs font-medium leading-relaxed whitespace-pre-wrap font-sans text-foreground">
              {streamedResult || (
                <span className="text-muted-foreground italic">
                  Click &ldquo;Generate&rdquo; above to stream professional, ATS-optimized suggestions.
                </span>
              )}
            </div>
          )}

          {/* Quick Apply Actions */}
          {streamedResult && !isStreaming && (
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/60">
              {activeTab === "professional_polish" && (
                <Button
                  size="sm"
                  variant="radiant"
                  className="text-xs gap-1.5"
                  onClick={() => handleApplySummary(streamedResult)}
                >
                  <Check className="w-3.5 h-3.5" />
                  Apply to Summary
                </Button>
              )}

              {activeTab === "generate_achievement" && (
                <Button
                  size="sm"
                  variant="radiant"
                  className="text-xs gap-1.5"
                  onClick={() => handleApplyAchievement(streamedResult)}
                >
                  <Check className="w-3.5 h-3.5" />
                  Add as New Achievement
                </Button>
              )}

              {activeTab === "improve_bullet" && (
                <Button
                  size="sm"
                  variant="radiant"
                  className="text-xs gap-1.5"
                  onClick={() => {
                    const lines = streamedResult
                      .split("\n")
                      .filter((l) => l.trim().startsWith("•") || l.trim().startsWith("-"));
                    const bullet = lines[0]?.replace(/^[•\-\*]\s*/, "") || streamedResult;
                    if (activeResume.experience.length > 0) {
                      addExperienceHighlight(activeResume.experience[0].id, bullet);
                    }
                    onOpenChange(false);
                  }}
                >
                  <Check className="w-3.5 h-3.5" />
                  Add Bullet to Latest Role
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
