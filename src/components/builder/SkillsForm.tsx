"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SkillItem, SkillProficiency } from "@/types/resume";
import { GitHubImportModal } from "@/components/integrations/GitHubImportModal";
import { GithubIcon } from "@/components/shared/icons";
import { Code2, Plus, Sparkles, Check, X } from "lucide-react";

const PRESET_SKILL_SUGGESTIONS = [
  "TypeScript",
  "React 19",
  "Next.js 15",
  "Tailwind CSS",
  "Node.js",
  "Python",
  "FastAPI",
  "PostgreSQL",
  "Prisma ORM",
  "Docker",
  "Kubernetes",
  "AWS Cloud",
  "Git & GitHub",
  "System Architecture",
  "REST APIs & GraphQL",
  "LLM Prompting & RAG",
];

const CATEGORIES: SkillItem["category"][] = [
  "Languages",
  "Frameworks",
  "Technical",
  "Tools",
  "Soft Skills",
  "Other",
];

const PROFICIENCY_LEVELS: SkillProficiency[] = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Expert",
];

export function SkillsForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addSkill = useResumeStore((state) => state.addSkill);
  const deleteSkill = useResumeStore((state) => state.deleteSkill);

  const { skills } = activeResume;
  const [customSkillName, setCustomSkillName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<SkillItem["category"]>("Technical");
  const [selectedLevel, setSelectedLevel] = useState<SkillProficiency>("Advanced");
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customSkillName.trim()) return;
    addSkill({
      name: customSkillName.trim(),
      category: selectedCategory,
      level: selectedLevel,
    });
    setCustomSkillName("");
  };

  const handleQuickAdd = (skillName: string) => {
    if (skills.some((s) => s.name.toLowerCase() === skillName.toLowerCase())) return;
    addSkill({
      name: skillName,
      category: selectedCategory,
      level: "Advanced",
    });
  };

  // Group existing skills by category
  const skillsByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat!] = skills.filter((s) => (s.category || "Technical") === cat);
    return acc;
  }, {} as Record<string, SkillItem[]>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Code2 className="w-4 h-4 text-foreground" />
            Skills & Keyword Optimization
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Target high-impact keywords, programming languages, libraries, and core proficiencies.
          </p>
        </div>

        <Button
          onClick={() => setIsGitHubModalOpen(true)}
          size="sm"
          variant="radiant"
          className="gap-1.5 h-7 text-xs font-semibold shadow-2xs self-start sm:self-center"
          type="button"
        >
          <GithubIcon className="w-3.5 h-3.5" />
          Sync from GitHub
        </Button>
      </div>

      <GitHubImportModal
        open={isGitHubModalOpen}
        onOpenChange={setIsGitHubModalOpen}
      />

      {/* Add Custom Skill Form */}
      <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-3">
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Add New Skill
        </h3>
        <form onSubmit={handleAddCustom} className="grid grid-cols-1 md:grid-cols-4 gap-2.5">
          <div className="md:col-span-2">
            <Label required>Skill / Keyword</Label>
            <Input
              placeholder="e.g. Distributed Systems, Rust, Next.js..."
              value={customSkillName}
              onChange={(e) => setCustomSkillName(e.target.value)}
            />
          </div>

          <div>
            <Label>Category</Label>
            <select
              className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer shadow-2xs"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as SkillItem["category"])}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Proficiency</Label>
            <div className="flex gap-1.5">
              <select
                className="flex h-9 w-full rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer shadow-2xs"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as SkillProficiency)}
              >
                {PROFICIENCY_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}
                  </option>
                ))}
              </select>
              <Button type="submit" size="sm" variant="radiant" className="shrink-0 h-9">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Suggested Quick Add Chips */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Sparkles className="w-3.5 h-3.5 text-foreground" />
          <span>Recommended ATS Keywords (Click to add)</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_SKILL_SUGGESTIONS.map((suggestion) => {
            const isAdded = skills.some(
              (s) => s.name.toLowerCase() === suggestion.toLowerCase()
            );
            return (
              <button
                key={suggestion}
                type="button"
                disabled={isAdded}
                onClick={() => handleQuickAdd(suggestion)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  isAdded
                    ? "bg-secondary text-muted-foreground border border-border/80 cursor-default opacity-70"
                    : "bg-card hover:bg-secondary text-foreground border border-border shadow-2xs cursor-pointer"
                }`}
              >
                {isAdded ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-3 h-3" />}
                {suggestion}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grouped Existing Skills */}
      <div className="space-y-3 pt-1">
        {CATEGORIES.map((category) => {
          const categorySkills = skillsByCategory[category!] || [];
          if (categorySkills.length === 0) return null;

          return (
            <div key={category} className="p-3.5 rounded-xl border border-border bg-card shadow-2xs">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {category} ({categorySkills.length})
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {categorySkills.map((skill) => (
                  <div
                    key={skill.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-secondary text-foreground border border-border/70 text-xs font-medium group"
                  >
                    <span>{skill.name}</span>
                    {skill.level && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        • {skill.level}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => deleteSkill(skill.id)}
                      className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 cursor-pointer"
                      title="Remove skill"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
