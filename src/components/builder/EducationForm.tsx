"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { EducationItem } from "@/types/resume";
import {
  GraduationCap,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
} from "lucide-react";

export function EducationForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const addEducation = useResumeStore((state) => state.addEducation);
  const updateEducation = useResumeStore((state) => state.updateEducation);
  const deleteEducation = useResumeStore((state) => state.deleteEducation);
  const reorderEducation = useResumeStore((state) => state.reorderEducation);

  const { education } = activeResume;
  const [expandedId, setExpandedId] = useState<string | null>(
    education.length > 0 ? education[0].id : null
  );

  const handleAddNew = () => {
    addEducation();
    setTimeout(() => {
      const updated = useResumeStore.getState().getActiveResume().education;
      if (updated.length > 0) {
        setExpandedId(updated[updated.length - 1].id);
      }
    }, 50);
  };

  const handleItemChange = (id: string, field: keyof EducationItem, value: any) => {
    updateEducation(id, { [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-foreground" />
            Education & Academics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Degrees, academic honors, universities, and foundational coursework.
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
          Add Education
        </Button>
      </div>

      {education.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card shadow-2xs">
          <GraduationCap className="w-8 h-8 mx-auto text-muted-foreground/60 mb-2" />
          <h3 className="font-semibold text-foreground text-xs">No education added yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto mb-3">
            Add your degree, university, GPA, and graduation year.
          </p>
          <Button onClick={handleAddNew} size="sm" variant="outline" className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            Add First Education
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {education.map((item, index) => {
            const isExpanded = expandedId === item.id;
            const displayTitle = item.institution || "New School / University";
            const displaySub = item.degree
              ? `${item.degree} ${item.fieldOfStudy ? `in ${item.fieldOfStudy}` : ""}`
              : "Degree & Field of Study";

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
                          reorderEducation(index, index - 1);
                        }}
                        title="Move Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    {index < education.length - 1 && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          reorderEducation(index, index + 1);
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
                        deleteEducation(item.id);
                      }}
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Collapsible Form Body */}
                {isExpanded && (
                  <div className="p-4 pt-0 space-y-3.5 border-t border-border/70 mt-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
                      <div>
                        <Label required>School / University Name</Label>
                        <Input
                          placeholder="e.g. UC Berkeley, Stanford University"
                          value={item.institution || ""}
                          onChange={(e) => handleItemChange(item.id, "institution", e.target.value)}
                          leftIcon={<Building2 className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div>
                        <Label required>Degree</Label>
                        <Input
                          placeholder="e.g. Bachelor of Science"
                          value={item.degree || ""}
                          onChange={(e) => handleItemChange(item.id, "degree", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label required>Field of Study / Major</Label>
                        <Input
                          placeholder="e.g. Computer Science"
                          value={item.fieldOfStudy || ""}
                          onChange={(e) => handleItemChange(item.id, "fieldOfStudy", e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Location / Campus</Label>
                        <Input
                          placeholder="e.g. Berkeley, CA"
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
                            {item.current ? "Expected End Date" : "End Date / Graduation"}
                          </Label>
                          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={item.current || false}
                              onChange={(e) => handleItemChange(item.id, "current", e.target.checked)}
                              className="rounded accent-primary"
                            />
                            Enrolled
                          </label>
                        </div>
                        <Input
                          type="month"
                          disabled={item.current}
                          placeholder={item.current ? "Present" : ""}
                          value={item.current ? "" : item.endDate || ""}
                          onChange={(e) => handleItemChange(item.id, "endDate", e.target.value)}
                          leftIcon={<Calendar className="w-3.5 h-3.5" />}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Cumulative GPA / Honors (Optional)</Label>
                        <Input
                          placeholder="e.g. 3.88 / 4.0 (Magna Cum Laude)"
                          value={item.gpa || ""}
                          onChange={(e) => handleItemChange(item.id, "gpa", e.target.value)}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Label>Relevant Coursework or Honors</Label>
                        <Textarea
                          rows={2}
                          placeholder="e.g. Relevant Coursework: Algorithms & Data Structures, Distributed Systems, Machine Learning..."
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
