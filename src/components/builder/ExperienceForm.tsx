"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExperienceItem } from "@/types/resume";
import {
  Briefcase,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Building,
  Calendar,
} from "lucide-react";

export function ExperienceForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addExperience = useResumeStore((state) => state.addExperience);
  const updateExperience = useResumeStore((state) => state.updateExperience);
  const deleteExperience = useResumeStore((state) => state.deleteExperience);
  const reorderExperience = useResumeStore((state) => state.reorderExperience);
  const addExperienceHighlight = useResumeStore((state) => state.addExperienceHighlight);
  const updateExperienceHighlight = useResumeStore((state) => state.updateExperienceHighlight);
  const deleteExperienceHighlight = useResumeStore((state) => state.deleteExperienceHighlight);
  const openAIEnhancer = useResumeStore((state) => state.openAIEnhancer);

  const { experience } = activeResume;
  const [expandedId, setExpandedId] = useState<string | null>(
    experience.length > 0 ? experience[0].id : null
  );

  const handleAddNew = () => {
    addExperience();
    setTimeout(() => {
      const updated = useResumeStore.getState().getActiveResume().experience;
      if (updated.length > 0) {
        setExpandedId(updated[updated.length - 1].id);
      }
    }, 50);
  };

  const handleItemChange = (id: string, field: keyof ExperienceItem, value: any) => {
    updateExperience(id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-foreground" />
            Work Experience
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your employment history, responsibilities, and quantified impact.
          </p>
        </div>
        <Button
          onClick={handleAddNew}
          size="sm"
          variant="outline"
          className="gap-1.5 h-7 text-xs font-medium"
          type="button"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Role
        </Button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs">
          <Briefcase className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-semibold text-foreground text-xs">No experience added yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-3">
            Showcase your career roles, technical leadership, and measurable results.
          </p>
          <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add First Role
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {experience.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const displayTitle = item.position || "New Role / Position";
            const displaySub = item.company ? `${item.company}${item.location ? ` • ${item.location}` : ""}` : "Company Name";

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
                          reorderExperience(index, index - 1);
                        }}
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {index < experience.length - 1 && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderExperience(index, index + 1);
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
                        deleteExperience(item.id);
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
                        <Label required>Job Title / Position</Label>
                        <Input
                          placeholder="e.g. Senior Software Engineer"
                          value={item.position || ""}
                          onChange={(e) => handleItemChange(item.id, "position", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label required>Company / Organization</Label>
                        <Input
                          placeholder="e.g. Acme Corp"
                          value={item.company || ""}
                          onChange={(e) => handleItemChange(item.id, "company", e.target.value)}
                          leftIcon={<Building className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div>
                        <Label>Location</Label>
                        <Input
                          placeholder="e.g. San Francisco, CA (or Remote)"
                          value={item.location || ""}
                          onChange={(e) => handleItemChange(item.id, "location", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label required>Start Date</Label>
                        <Input
                          type="month"
                          value={item.startDate || ""}
                          onChange={(e) => handleItemChange(item.id, "startDate", e.target.value)}
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between">
                          <Label required={!item.current}>
                            {item.current ? "Present" : "End Date"}
                          </Label>
                          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={item.current || false}
                              onChange={(e) => handleItemChange(item.id, "current", e.target.checked)}
                              className="rounded accent-primary"
                            />
                            Current Role
                          </label>
                        </div>
                        <Input
                          type="month"
                          disabled={item.current}
                          value={item.current ? "" : item.endDate || ""}
                          onChange={(e) => handleItemChange(item.id, "endDate", e.target.value)}
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        />
                      </div>
                    </div>

                    {/* Bullet Points / Highlights with AI Enhancer */}
                    <div className="pt-3 border-t border-border/70 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="mb-0">Accomplishments & Bullets</Label>
                          <p className="text-[11px] text-muted-foreground">
                            Use action verbs and metrics (e.g. &ldquo;Architected X resulting in 35% Y&rdquo;).
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs h-6.5 gap-1 font-medium"
                          onClick={() =>
                            addExperienceHighlight(
                              item.id,
                              "Architected scalable services improving query throughput by 40%."
                            )
                          }
                        >
                          <Plus className="w-3 h-3" />
                          Add Bullet
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {item.highlights && item.highlights.length > 0 ? (
                          item.highlights.map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex items-start gap-1.5">
                              <div className="w-5 h-5 rounded bg-secondary text-muted-foreground flex items-center justify-center text-[10px] font-mono mt-2 shrink-0">
                                {bulletIdx + 1}
                              </div>
                              <div className="flex-1">
                                <Input
                                  value={bullet}
                                  onChange={(e) =>
                                    updateExperienceHighlight(item.id, bulletIdx, e.target.value)
                                  }
                                  placeholder="Describe an accomplishment with metrics..."
                                />
                              </div>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="outline"
                                className="shrink-0 mt-0.5"
                                title="Enhance this bullet with AI"
                                onClick={() =>
                                  openAIEnhancer({
                                    type: "experience",
                                    id: item.id,
                                    bulletIndex: bulletIdx,
                                    text: bullet,
                                  })
                                }
                              >
                                <Sparkles className="w-3 h-3 text-foreground" />
                              </Button>
                              <Button
                                type="button"
                                size="icon-sm"
                                variant="ghost"
                                className="text-muted-foreground hover:text-destructive shrink-0 mt-0.5"
                                title="Remove bullet"
                                onClick={() => deleteExperienceHighlight(item.id, bulletIdx)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="p-3 text-center bg-secondary/30 rounded-lg">
                            <p className="text-xs text-muted-foreground">No bullets added yet.</p>
                            <Button
                              type="button"
                              size="sm"
                              variant="link"
                              className="text-xs mt-1"
                              onClick={() =>
                                addExperienceHighlight(
                                  item.id,
                                  "Orchestrated cross-functional initiatives delivering 25% efficiency gains."
                                )
                              }
                            >
                              + Add your first bullet point
                            </Button>
                          </div>
                        )}
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
