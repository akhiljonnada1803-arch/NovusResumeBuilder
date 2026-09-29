"use client";

import React, { useState } from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Button } from "@/components/ui/button";
import { ProfilePhotoModal } from "./ProfilePhotoModal";
import {
  Camera,
  Upload,
  Eye,
  EyeOff,
  Sliders,
  Check,
  User,
  Sparkles,
} from "lucide-react";

export function ProfilePhotoCard() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const updateDesign = useResumeStore((state) => state.updateDesign);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const pi = activeResume.personalInfo || {};
  const photoUrl = pi.photoUrl;
  const showPhoto = pi.showPhoto !== false; // Default true if photo exists
  const photoShape = activeResume.design?.photoShape || pi.photoShape || "circle";

  const handleSavePhoto = (newUrl: string, shape: "circle" | "rounded" | "square") => {
    updatePersonalInfo({
      photoUrl: newUrl,
      showPhoto: true,
      photoShape: shape,
    });
    updateDesign({
      photoShape: shape,
    });
  };

  const handleRemovePhoto = () => {
    updatePersonalInfo({
      photoUrl: undefined,
      showPhoto: false,
    });
  };

  const toggleShowPhoto = () => {
    updatePersonalInfo({
      showPhoto: !showPhoto,
    });
  };

  const handleShapeChange = (shape: "circle" | "rounded" | "square") => {
    updatePersonalInfo({ photoShape: shape });
    updateDesign({ photoShape: shape });
  };

  const getShapeClipClass = () => {
    switch (photoShape) {
      case "circle":
        return "rounded-full";
      case "rounded":
        return "rounded-xl";
      case "square":
      default:
        return "rounded-none";
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-border bg-card shadow-2xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Photo Avatar & Info */}
        <div className="flex items-center gap-3">
          <div
            className={`relative w-14 h-14 shrink-0 bg-secondary/80 border border-border/80 flex items-center justify-center overflow-hidden cursor-pointer group shadow-2xs transition-all ${getShapeClipClass()}`}
            onClick={() => setIsModalOpen(true)}
            title="Click to change or crop photo"
          >
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={photoUrl}
                alt="Profile Preview"
                className={`w-full h-full object-cover ${!showPhoto ? "opacity-40 grayscale" : ""}`}
              />
            ) : (
              <User className="w-6 h-6 text-muted-foreground/60 group-hover:text-foreground transition-colors" />
            )}

            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-semibold text-foreground">Profile Headshot</h4>
              {photoUrl && (
                <span
                  className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                    showPhoto
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "bg-secondary text-muted-foreground border-border/80"
                  }`}
                >
                  {showPhoto ? "Visible" : "Hidden"}
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {photoUrl
                ? "Professional headshot calibrated for modern & executive templates."
                : "Add a high-resolution photo. Compatible with modern & executive templates."}
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {photoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2 gap-1 font-medium text-muted-foreground hover:text-foreground"
              onClick={toggleShowPhoto}
              title={showPhoto ? "Hide photo on resume" : "Show photo on resume"}
            >
              {showPhoto ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{showPhoto ? "Hide" : "Show"}</span>
            </Button>
          )}

          <Button
            type="button"
            variant={photoUrl ? "outline" : "radiant"}
            size="sm"
            className="h-7 text-xs px-2.5 gap-1.5 font-semibold shadow-2xs"
            onClick={() => setIsModalOpen(true)}
          >
            {photoUrl ? (
              <>
                <Sliders className="w-3 h-3" />
                <span>Crop / Edit</span>
              </>
            ) : (
              <>
                <Upload className="w-3 h-3" />
                <span>Upload Photo</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Shape Quick Switcher when photo is active */}
      {photoUrl && showPhoto && (
        <div className="flex items-center justify-between pt-2 border-t border-border/70 text-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Display Shape
          </span>
          <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => handleShapeChange("circle")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                photoShape === "circle"
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Circle
            </button>
            <button
              type="button"
              onClick={() => handleShapeChange("rounded")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                photoShape === "rounded"
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Rounded
            </button>
            <button
              type="button"
              onClick={() => handleShapeChange("square")}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                photoShape === "square"
                  ? "bg-card text-foreground font-semibold shadow-2xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Square
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <ProfilePhotoModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        currentPhotoUrl={photoUrl}
        initialShape={photoShape}
        onSave={handleSavePhoto}
        onRemove={handleRemovePhoto}
      />
    </div>
  );
}
