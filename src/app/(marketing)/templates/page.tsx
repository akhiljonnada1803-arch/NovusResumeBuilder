"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { RESUME_TEMPLATES } from "@/templates/registry";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { SAMPLE_RESUMES } from "@/lib/mock-data";
import { useResumeStore } from "@/store/useResumeStore";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TemplateCategory, TemplateMetadata, ResumeTemplateId } from "@/types/resume";
import {
  Search,
  CheckCircle2,
  ShieldCheck,
  Eye,
  ArrowRight,
  Heart,
  Check,
} from "lucide-react";

const CATEGORIES: { id: TemplateCategory | "all"; label: string; count: number }[] = [
  { id: "all", label: "All Templates", count: 25 },
  { id: "ats", label: "ATS Professional", count: 5 },
  { id: "professional", label: "Modern Professional", count: 5 },
  { id: "engineering", label: "Software Engineer", count: 4 },
  { id: "creative", label: "Creative Designer", count: 4 },
  { id: "student", label: "Student & Fresher", count: 3 },
  { id: "premium", label: "Premium Showcase", count: 4 },
];

export default function TemplatesPage() {
  const router = useRouter();
  const { success } = useToast();
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const updateDesign = useResumeStore((state) => state.updateDesign);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateMetadata | null>(null);
  const [favorites, setFavorites] = useState<{ [id: string]: boolean }>({});

  const sampleData = activeResume?.personalInfo?.fullName ? activeResume : SAMPLE_RESUMES[0];

  const filteredTemplates = useMemo(() => {
    return RESUME_TEMPLATES.filter((template) => {
      const matchesCategory =
        selectedCategory === "all" || template.category === selectedCategory;

      const matchesSearch =
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        template.bestFor.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUseTemplate = (templateId: ResumeTemplateId) => {
    updateDesign({ template: templateId });
    success(`Applied template "${templateId}"!`);
    router.push(`/builder/${activeResume.id || "sample-resume-1"}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary text-foreground text-xs font-semibold border border-border">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>25 ATS-Verified Resume Templates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Recruiter-Ready Templates
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Switch between all 25 professional, engineering, and executive templates instantly with 100% data preservation.
        </p>

        {/* Search Input */}
        <div className="max-w-md mx-auto relative pt-2">
          <Input
            type="text"
            placeholder="Search templates (e.g. 'Software', 'Executive', 'Classic')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-muted-foreground" />}
            className="h-10 rounded-lg pl-9 text-xs"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              selectedCategory === cat.id
                ? "bg-secondary text-foreground font-semibold border border-border/80 shadow-2xs"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                selectedCategory === cat.id ? "bg-card text-foreground border border-border/60" : "text-muted-foreground"
              }`}
            >
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((template) => {
          const isFav = !!favorites[template.id];
          const isCurrent = activeResume.design?.template === template.id;

          return (
            <div
              key={template.id}
              className="rounded-xl border border-border bg-card hover:border-slate-400 dark:hover:border-slate-600 transition-colors duration-150 flex flex-col justify-between overflow-hidden group shadow-2xs"
            >
              {/* Card Preview Graphic Area */}
              <div
                className="relative h-60 bg-secondary/40 border-b border-border overflow-hidden cursor-pointer flex items-center justify-center p-4"
                onClick={() => setPreviewTemplate(template)}
              >
                {/* Scaled Mini Preview */}
                <div className="w-[170%] origin-top scale-[0.44] pointer-events-none select-none rounded-xs shadow-md bg-white text-black overflow-hidden max-h-[500px]">
                  <TemplateRenderer data={sampleData} templateId={template.id} />
                </div>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-slate-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 z-10">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs bg-white text-slate-900 hover:bg-slate-100 border-none font-semibold gap-1 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewTemplate(template);
                    }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="radiant"
                    className="text-xs font-semibold gap-1 shadow-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUseTemplate(template.id);
                    }}
                  >
                    <Check className="w-3.5 h-3.5" />
                    Use
                  </Button>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-20">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-900/80 text-white backdrop-blur-xs">
                    {template.categoryName}
                  </span>
                  {template.popular && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-500 text-white">
                      Popular
                    </span>
                  )}
                </div>

                {/* Favorite Button */}
                <button
                  type="button"
                  onClick={(e) => toggleFavorite(template.id, e)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-colors z-20 ${
                    isFav ? "bg-red-500 text-white" : "bg-slate-900/50 text-white hover:bg-slate-900/80"
                  }`}
                  title="Favorite Template"
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-current" : ""}`} />
                </button>
              </div>

              {/* Card Meta Description */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {template.name}
                    </h3>
                    <div className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{template.atsScore}% ATS</span>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {template.description}
                  </p>
                </div>

                <div className="space-y-3 pt-2">
                  {/* Tag Chips */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-1/2 text-xs font-medium gap-1"
                      onClick={() => setPreviewTemplate(template)}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant={isCurrent ? "outline" : "radiant"}
                      className="w-1/2 text-xs font-semibold gap-1"
                      onClick={() => handleUseTemplate(template.id)}
                    >
                      {isCurrent ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          Active
                        </>
                      ) : (
                        <>
                          Use
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Modal */}
      {previewTemplate && (
        <Dialog
          open={!!previewTemplate}
          onOpenChange={(open) => {
            if (!open) setPreviewTemplate(null);
          }}
          maxWidth="4xl"
        >
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-secondary text-foreground uppercase">
                    {previewTemplate.categoryName}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{previewTemplate.atsScore}% ATS Verified</span>
                  </div>
                </div>
                <DialogTitle>{previewTemplate.name}</DialogTitle>
                <DialogDescription>{previewTemplate.description}</DialogDescription>
              </div>

              <Button
                variant="radiant"
                size="sm"
                className="text-xs font-semibold gap-1.5 shrink-0 shadow-2xs"
                onClick={() => {
                  handleUseTemplate(previewTemplate.id);
                  setPreviewTemplate(null);
                }}
              >
                <Check className="w-4 h-4" />
                Apply Template
              </Button>
            </div>
          </DialogHeader>

          <div className="p-4 bg-secondary/50 rounded-xl max-h-[70vh] overflow-y-auto flex justify-center border border-border">
            <div className="w-full max-w-2xl bg-white text-black shadow-lg rounded-xs overflow-hidden border border-slate-200">
              <TemplateRenderer data={sampleData} templateId={previewTemplate.id} />
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
