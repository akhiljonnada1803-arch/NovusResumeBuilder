"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Label } from "@/components/ui/label";
import { ACCENT_COLORS } from "@/lib/constants";
import { RESUME_TEMPLATES } from "@/templates/registry";
import { ResumeFontFamily, TemplateCategory } from "@/types/resume";
import {
  Palette,
  Check,
  LayoutTemplate,
  Type,
  ArrowRight,
  Camera,
  Circle,
  Square,
  Eye,
  EyeOff,
  Sliders,
} from "lucide-react";
import Link from "next/link";
import { ProfilePhotoModal } from "./ProfilePhotoModal";

const FONT_OPTIONS: { name: string; value: ResumeFontFamily; fontClass: string }[] = [
  { name: "Inter (Modern Sans)", value: "Inter", fontClass: "font-sans" },
  { name: "Roboto (Clean Tech)", value: "Roboto", fontClass: "font-sans" },
  { name: "Merriweather (Editorial Serif)", value: "Merriweather", fontClass: "font-serif" },
  { name: "Outfit (Geometric Sans)", value: "Outfit", fontClass: "font-sans" },
  { name: "Playfair Display (Executive Serif)", value: "Playfair Display", fontClass: "font-serif" },
];

const CATEGORIES: { id: TemplateCategory | "all"; label: string }[] = [
  { id: "all", label: "All (25)" },
  { id: "ats", label: "ATS Safe" },
  { id: "professional", label: "Professional" },
  { id: "engineering", label: "Engineering" },
  { id: "creative", label: "Creative" },
  { id: "student", label: "Student" },
  { id: "premium", label: "Premium" },
];

export function DesignSettingsForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const updateDesign = useResumeStore((state) => state.updateDesign);
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const { design, personalInfo } = activeResume;

  const [activeCategory, setActiveCategory] = useState<TemplateCategory | "all">("all");
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const filteredTemplates =
    activeCategory === "all"
      ? RESUME_TEMPLATES
      : RESUME_TEMPLATES.filter((t) => t.category === activeCategory);

  const photoShape = design.photoShape || personalInfo?.photoShape || "circle";
  const photoSize = design.photoSize || (personalInfo?.photoSize as any) || "md";
  const photoPosition = design.photoPosition || personalInfo?.photoPosition || "top-right";
  const photoShadow = design.photoShadow || personalInfo?.photoShadow || "subtle";
  const photoBorderWidth = design.photoBorderWidth ?? 2;
  const showPhoto = personalInfo?.showPhoto !== false && !!personalInfo?.photoUrl;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4 text-foreground" />
            Resume Design & 25 Templates
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Switch between all 25 ATS-optimized, engineering, and creative templates with zero data loss.
          </p>
        </div>

        <Link href="/templates" target="_blank" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
          <span>Gallery</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Template Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <LayoutTemplate className="w-3.5 h-3.5 text-foreground" />
            Select Template ({filteredTemplates.length})
          </Label>

          {/* Quick Filter */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat.id
                    ? "bg-secondary text-foreground font-semibold border border-border/70"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredTemplates.map((tmpl) => {
            const isSelected = design.template === tmpl.id;
            return (
              <div
                key={tmpl.id}
                onClick={() => updateDesign({ template: tmpl.id })}
                className={`p-3 rounded-lg border text-left cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-secondary text-foreground font-semibold shadow-2xs"
                    : "border-border bg-card hover:bg-secondary/40 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h4 className="font-semibold text-xs text-foreground truncate">{tmpl.name}</h4>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-semibold px-1 py-0.2 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                      {tmpl.atsScore}% ATS
                    </span>
                    {isSelected && <Check className="w-3 h-3 text-primary" />}
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {tmpl.description}
                </p>

                <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-border/60 text-[10px] text-muted-foreground">
                  <span className="uppercase font-medium text-foreground">{tmpl.categoryName}</span>
                  <span>• {tmpl.layoutType}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Profile Photo Styling Controls */}
      <div className="space-y-3.5 pt-2 border-t border-border/80">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Camera className="w-3.5 h-3.5 text-foreground" />
            Profile Photo Settings
          </Label>

          {personalInfo?.photoUrl && (
            <button
              type="button"
              onClick={() =>
                updatePersonalInfo({ showPhoto: personalInfo.showPhoto === false ? true : false })
              }
              className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 cursor-pointer"
            >
              {showPhoto ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPhoto ? "Hide on Resume" : "Show on Resume"}</span>
            </button>
          )}
        </div>

        <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-3.5">
          {/* Shape and Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-[11px]">Photo Shape</Label>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {(["circle", "rounded", "square"] as const).map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => {
                      updateDesign({ photoShape: shape });
                      updatePersonalInfo({ photoShape: shape });
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium capitalize transition-colors flex items-center justify-center gap-1 ${
                      photoShape === shape
                        ? "bg-secondary text-foreground font-semibold border-primary shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {shape === "circle" && <Circle className="w-3 h-3" />}
                    {shape === "rounded" && <div className="w-3 h-3 border-2 border-current rounded-xs" />}
                    {shape === "square" && <Square className="w-3 h-3" />}
                    <span>{shape}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[11px]">Photo Size</Label>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(["sm", "md", "lg", "xl"] as const).map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      updateDesign({ photoSize: size });
                      updatePersonalInfo({ photoSize: size });
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-xs font-medium uppercase transition-colors ${
                      photoSize === size
                        ? "bg-secondary text-foreground font-semibold border-primary shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Position and Shadow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
            <div>
              <Label className="text-[11px]">Photo Position</Label>
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {[
                  { id: "top-right", label: "Right" },
                  { id: "top-left", label: "Left" },
                  { id: "center-header", label: "Center" },
                  { id: "sidebar", label: "Sidebar" },
                  { id: "floating-hero", label: "Floating" },
                ].map((pos) => (
                  <button
                    key={pos.id}
                    type="button"
                    onClick={() => {
                      updateDesign({ photoPosition: pos.id as any });
                      updatePersonalInfo({ photoPosition: pos.id as any });
                    }}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-medium transition-colors ${
                      photoPosition === pos.id
                        ? "bg-secondary text-foreground font-semibold border-primary shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {pos.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-[11px]">Elevation & Shadow</Label>
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                {(["none", "subtle", "elevated", "glow"] as const).map((sh) => (
                  <button
                    key={sh}
                    type="button"
                    onClick={() => {
                      updateDesign({ photoShadow: sh });
                      updatePersonalInfo({ photoShadow: sh });
                    }}
                    className={`py-1.5 px-1 rounded-lg border text-[10px] font-medium capitalize transition-colors ${
                      photoShadow === sh
                        ? "bg-secondary text-foreground font-semibold border-primary shadow-2xs"
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {sh}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Accent Color */}
      <div className="space-y-2.5 pt-1">
        <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Palette className="w-3.5 h-3.5 text-foreground" />
          Accent Color
        </Label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((col) => {
            const isSelected = design.accentColor.toLowerCase() === col.value.toLowerCase();
            return (
              <button
                key={col.value}
                type="button"
                onClick={() => updateDesign({ accentColor: col.value })}
                className={`relative w-7 h-7 rounded-md flex items-center justify-center border border-border/60 transition-transform ${
                  isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-105" : "hover:scale-105"
                }`}
                style={{ backgroundColor: col.value }}
                title={col.name}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-2.5 pt-1">
        <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          <Type className="w-3.5 h-3.5 text-foreground" />
          Font Family
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => {
            const isSelected = design.fontFamily === f.value;
            return (
              <div
                key={f.value}
                onClick={() => updateDesign({ fontFamily: f.value })}
                className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected
                    ? "border-primary bg-secondary font-semibold text-foreground"
                    : "border-border bg-card hover:bg-secondary/40 text-muted-foreground"
                }`}
              >
                <span className={`text-xs ${f.fontClass}`}>{f.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Margins & Page Padding */}
      <div className="space-y-3 pt-2 border-t border-border/60">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <Sliders className="w-3.5 h-3.5 text-foreground" />
            Page Margins & Spacing
          </Label>
          <span className="text-[11px] font-mono text-muted-foreground">
            {design.margins === "compact"
              ? "12mm (Compact)"
              : design.margins === "spacious"
              ? "28mm (Spacious)"
              : design.margins === "custom"
              ? `${design.customMarginMm || 20}mm (Custom)`
              : "20mm (Standard)"}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {[
            { id: "compact", label: "Compact", mm: "12mm" },
            { id: "normal", label: "Standard", mm: "20mm" },
            { id: "spacious", label: "Spacious", mm: "28mm" },
            { id: "custom", label: "Custom", mm: `${design.customMarginMm || 20}mm` },
          ].map((m) => {
            const isSelected = (design.margins || "normal") === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => updateDesign({ margins: m.id as any })}
                className={`py-2 px-1 rounded-lg border text-center transition-all ${
                  isSelected
                    ? "border-primary bg-secondary font-semibold text-foreground shadow-2xs"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="text-[11px] font-semibold leading-none">{m.label}</div>
                <div className="text-[9px] text-muted-foreground mt-1">{m.mm}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Margin Slider */}
        {design.margins === "custom" && (
          <div className="p-3 bg-secondary/40 rounded-lg border border-border/80 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Adjust Page Margin:</span>
              <span className="font-semibold text-foreground font-mono">{design.customMarginMm || 20} mm</span>
            </div>
            <input
              type="range"
              min="8"
              max="35"
              step="1"
              value={design.customMarginMm || 20}
              onChange={(e) => updateDesign({ customMarginMm: Number(e.target.value) })}
              className="w-full accent-primary h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>8mm (Tight)</span>
              <span>20mm (Standard)</span>
              <span>35mm (Wide)</span>
            </div>
          </div>
        )}

        {/* Section Spacing & Density */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Line Spacing</Label>
            <div className="grid grid-cols-3 gap-1">
              {(["compact", "normal", "spacious"] as const).map((sp) => (
                <button
                  key={sp}
                  type="button"
                  onClick={() => updateDesign({ spacing: sp })}
                  className={`py-1 text-[11px] font-medium capitalize rounded-md border transition-colors ${
                    (design.spacing || "normal") === sp
                      ? "border-primary bg-secondary font-semibold text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {sp}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-[11px] text-muted-foreground mb-1 block">Base Font Size</Label>
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: "sm", label: "Small" },
                { id: "base", label: "Normal" },
                { id: "lg", label: "Large" },
              ].map((fs) => (
                <button
                  key={fs.id}
                  type="button"
                  onClick={() => updateDesign({ fontSize: fs.id as any })}
                  className={`py-1 text-[11px] font-medium rounded-md border transition-colors ${
                    (design.fontSize || "base") === fs.id
                      ? "border-primary bg-secondary font-semibold text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fs.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Photo Crop Modal Trigger */}
      <ProfilePhotoModal
        open={isPhotoModalOpen}
        onOpenChange={setIsPhotoModalOpen}
        currentPhotoUrl={personalInfo?.photoUrl}
        initialShape={photoShape}
        onSave={(newUrl, shape) => {
          updatePersonalInfo({ photoUrl: newUrl, photoShape: shape, showPhoto: true });
          updateDesign({ photoShape: shape });
        }}
        onRemove={() => {
          updatePersonalInfo({ photoUrl: undefined, showPhoto: false });
        }}
      />
    </div>
  );
}
