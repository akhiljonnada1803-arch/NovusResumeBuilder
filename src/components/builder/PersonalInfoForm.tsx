"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProfilePhotoCard } from "./ProfilePhotoCard";
import { Sparkles, User, Briefcase, Mail, Phone, MapPin, Globe } from "lucide-react";
import { GithubIcon, LinkedinIcon } from "@/components/shared/icons";

export function PersonalInfoForm() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const updatePersonalInfo = useResumeStore((state) => state.updatePersonalInfo);
  const openAIEnhancer = useResumeStore((state) => state.openAIEnhancer);

  const { personalInfo } = activeResume;

  const handleChange = (field: keyof typeof personalInfo, value: string) => {
    updatePersonalInfo({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border/80 pb-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground flex items-center gap-2">
            <User className="w-4 h-4 text-foreground" />
            Contact & Identification
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your primary name, professional headline, and contact channels.
          </p>
        </div>
      </div>

      {/* Profile Photo Headshot Component */}
      <ProfilePhotoCard />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div>
          <Label required>Full Name</Label>
          <Input
            placeholder="e.g. Alex Rivera"
            value={personalInfo.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            leftIcon={<User className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label required>Target Job Title / Headline</Label>
          <Input
            placeholder="e.g. Senior Software Engineer"
            value={personalInfo.jobTitle || ""}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
            leftIcon={<Briefcase className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label required>Email Address</Label>
          <Input
            type="email"
            placeholder="e.g. alex@example.com"
            value={personalInfo.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            leftIcon={<Mail className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label required>Phone Number</Label>
          <Input
            placeholder="e.g. +1 (555) 234-5678"
            value={personalInfo.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            leftIcon={<Phone className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label required>Location / City</Label>
          <Input
            placeholder="e.g. San Francisco, CA"
            value={personalInfo.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            leftIcon={<MapPin className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label>Portfolio / Website</Label>
          <Input
            placeholder="e.g. https://alexrivera.dev"
            value={personalInfo.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            leftIcon={<Globe className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label>LinkedIn Profile</Label>
          <Input
            placeholder="e.g. linkedin.com/in/alexrivera"
            value={personalInfo.linkedin || ""}
            onChange={(e) => handleChange("linkedin", e.target.value)}
            leftIcon={<LinkedinIcon className="w-3.5 h-3.5" />}
          />
        </div>

        <div>
          <Label>GitHub URL</Label>
          <Input
            placeholder="e.g. github.com/alexrivera"
            value={personalInfo.github || ""}
            onChange={(e) => handleChange("github", e.target.value)}
            leftIcon={<GithubIcon className="w-3.5 h-3.5" />}
          />
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/80">
        <div className="flex items-center justify-between">
          <div>
            <Label className="mb-0">Executive Summary / Objective</Label>
            <p className="text-[11px] text-muted-foreground">
              A 2-4 sentence summary highlighting core strengths and measurable impact.
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-xs h-6.5 gap-1 font-medium"
            onClick={() =>
              openAIEnhancer({
                type: "summary",
                text: personalInfo.summary || "",
              })
            }
          >
            <Sparkles className="w-3 h-3 text-foreground" />
            AI Enhance
          </Button>
        </div>

        <Textarea
          rows={4}
          placeholder="e.g. High-velocity Software Engineer with 6+ years of experience building scalable distributed systems..."
          value={personalInfo.summary || ""}
          onChange={(e) => handleChange("summary", e.target.value)}
          maxLength={1500}
        />
        <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono">
          <span>{personalInfo.summary?.length || 0} / 1500 chars</span>
          <span>~{personalInfo.summary?.split(/\s+/).filter(Boolean).length || 0} words</span>
        </div>
      </div>
    </div>
  );
}
