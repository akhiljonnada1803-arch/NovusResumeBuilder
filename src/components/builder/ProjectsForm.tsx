"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProjectItem } from "@/types/resume";
import { GitHubImportModal } from "@/components/integrations/GitHubImportModal";
import {
  FolderGit2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { GithubIcon } from "@/components/shared/icons";

export function ProjectsForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addProject = useResumeStore((state) => state.addProject);
  const updateProject = useResumeStore((state) => state.updateProject);
  const deleteProject = useResumeStore((state) => state.deleteProject);
  const reorderProjects = useResumeStore((state) => state.reorderProjects);
  const openAIEnhancer = useResumeStore((state) => state.openAIEnhancer);

  const { projects } = activeResume;
  const [expandedId, setExpandedId] = useState<string | null>(
    projects.length > 0 ? projects[0].id : null
  );
  const [techInput, setTechInput] = useState<{ [id: string]: string }>({});
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState(false);

  const handleAddNew = () => {
    addProject();
    setTimeout(() => {
      const updated = useResumeStore.getState().getActiveResume().projects;
      if (updated.length > 0) {
        setExpandedId(updated[updated.length - 1].id);
      }
    }, 50);
  };

  const handleItemChange = (id: string, field: keyof ProjectItem, value: any) => {
    updateProject(id, { [field]: value });
  };

  const handleAddTech = (projectId: string, techName: string) => {
    if (!techName.trim()) return;
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    if (project.technologies.includes(techName.trim())) return;
    updateProject(projectId, {
      technologies: [...project.technologies, techName.trim()],
    });
    setTechInput((prev) => ({ ...prev, [projectId]: "" }));
  };

  const handleRemoveTech = (projectId: string, techName: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;
    updateProject(projectId, {
      technologies: project.technologies.filter((t) => t !== techName),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-foreground" />
            Key Projects & Portfolio
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Open-source systems, web apps, AI tools, SaaS products, and system builds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsGitHubModalOpen(true)}
            size="sm"
            variant="radiant"
            className="gap-1.5 h-7 text-xs font-semibold shadow-2xs"
            type="button"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            Import from GitHub
          </Button>

          <Button
            onClick={handleAddNew}
            size="sm"
            variant="outline"
            className="gap-1.5 h-7 text-xs font-medium"
            type="button"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </Button>
        </div>
      </div>

      <GitHubImportModal
        open={isGitHubModalOpen}
        onOpenChange={setIsGitHubModalOpen}
      />

      {projects.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs">
          <FolderGit2 className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-semibold text-foreground text-xs">No projects listed yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-3">
            Showcase technical applications, live demos, and stack architectures.
          </p>
          <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add First Project
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const displayTitle = item.title || "New Project Title";
            const displaySub = item.technologies?.length
              ? item.technologies.slice(0, 4).join(", ") + (item.technologies.length > 4 ? "..." : "")
              : "Tech Stack & Description";

            return (
              <div
                key={item.id}
                className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden transition-colors"
              >
                {/* Header bar */}
                <div
                  className="flex items-center justify-between p-3.5 cursor-pointer select-none"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-6 h-6 rounded-md bg-secondary text-foreground flex items-center justify-center font-mono text-[11px] font-semibold border border-border/60">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-xs text-foreground">{displayTitle}</h4>
                      <p className="text-[11px] text-muted-foreground">{displaySub}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {index > 0 && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderProjects(index, index - 1);
                        }}
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {index < projects.length - 1 && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderProjects(index, index + 1);
                        }}
                        title="Move Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      className="hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(item.id);
                      }}
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Body Form */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3.5 border-t border-border/70 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div>
                        <Label required>Project Title</Label>
                        <Input
                          placeholder="e.g. Distributed Database Engine"
                          value={item.title || ""}
                          onChange={(e) => handleItemChange(item.id, "title", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Role / Subtitle</Label>
                        <Input
                          placeholder="e.g. Lead Architect & Creator"
                          value={item.subtitle || ""}
                          onChange={(e) => handleItemChange(item.id, "subtitle", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Live Demo / Website URL</Label>
                        <Input
                          type="url"
                          placeholder="e.g. https://myproject.dev"
                          value={item.liveUrl || ""}
                          onChange={(e) => handleItemChange(item.id, "liveUrl", e.target.value)}
                          leftIcon={<Globe className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div>
                        <Label>GitHub / Source Repository URL</Label>
                        <Input
                          type="url"
                          placeholder="e.g. github.com/user/project"
                          value={item.githubUrl || ""}
                          onChange={(e) => handleItemChange(item.id, "githubUrl", e.target.value)}
                          leftIcon={<GithubIcon className="w-3.5 h-3.5" />}
                        />
                      </div>

                      {/* Tech Stack Chips Tag Input */}
                      <div className="md:col-span-2 space-y-2">
                        <Label>Technologies & Architecture Stack</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Type a technology (e.g. Rust, WebSockets) and press Add or Enter"
                            value={techInput[item.id] || ""}
                            onChange={(e) =>
                              setTechInput((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddTech(item.id, techInput[item.id] || "");
                              }
                            }}
                            leftIcon={<Tag className="w-3.5 h-3.5" />}
                          />
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="shrink-0 h-9"
                            onClick={() => handleAddTech(item.id, techInput[item.id] || "")}
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" />
                            Add
                          </Button>
                        </div>

                        {item.technologies && item.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.technologies.map((tech) => (
                              <span
                                key={tech}
                                className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/80"
                              >
                                <span>{tech}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTech(item.id, tech)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="mb-0">Project Description & Impact</Label>
                            <p className="text-[11px] text-muted-foreground">
                              Highlight architecture decisions, problem statement, and quantifiable performance gains.
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-xs h-6.5 gap-1 font-medium"
                            onClick={() =>
                              openAIEnhancer({
                                type: "project",
                                id: item.id,
                                text: item.description || "",
                              })
                            }
                          >
                            <Sparkles className="w-3 h-3 text-foreground" />
                            AI Enhance
                          </Button>
                        </div>

                        <Textarea
                          rows={3}
                          placeholder="e.g. Designed high-throughput distributed message queue handling 1M+ msg/sec with sub-millisecond p99 latency..."
                          value={item.description || ""}
                          onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
