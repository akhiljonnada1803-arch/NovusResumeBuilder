"use client";

import React from "react";
import { useResumeStore } from "@/store/useResumeStore";
import { SectionType } from "@/types/resume";
import {
  User,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Code2,
  Award,
  Trophy,
  Palette,
  Check,
} from "lucide-react";

interface NavItem {
  id: SectionType | "design";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isComplete: (resume: ReturnType<typeof useResumeStore.getState>["resumes"][0]) => boolean;
  count?: (resume: ReturnType<typeof useResumeStore.getState>["resumes"][0]) => number;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "personalInfo",
    label: "Contact & Info",
    icon: User,
    isComplete: (r) => !!(r.personalInfo?.fullName && r.personalInfo?.email && r.personalInfo?.phone),
  },
  {
    id: "experience",
    label: "Work Experience",
    icon: Briefcase,
    isComplete: (r) => r.experience?.length > 0,
    count: (r) => r.experience?.length || 0,
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCap,
    isComplete: (r) => r.education?.length > 0,
    count: (r) => r.education?.length || 0,
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderGit2,
    isComplete: (r) => r.projects?.length > 0,
    count: (r) => r.projects?.length || 0,
  },
  {
    id: "skills",
    label: "Skills & Keywords",
    icon: Code2,
    isComplete: (r) => r.skills?.length >= 4,
    count: (r) => r.skills?.length || 0,
  },
  {
    id: "certifications",
    label: "Certifications",
    icon: Award,
    isComplete: (r) => r.certifications?.length > 0,
    count: (r) => r.certifications?.length || 0,
  },
  {
    id: "achievements",
    label: "Achievements",
    icon: Trophy,
    isComplete: (r) => r.achievements?.length > 0,
    count: (r) => r.achievements?.length || 0,
  },
];

export function SectionNav() {
  const activeResume = useResumeStore((state) => state.getActiveResume());
  const activeSection = useResumeStore((state) => state.activeSection);
  const setActiveSection = useResumeStore((state) => state.setActiveSection);

  return (
    <div className="flex flex-col gap-0.5 w-full">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeSection === item.id;
        const complete = item.isComplete(activeResume);
        const count = item.count ? item.count(activeResume) : null;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveSection(item.id as SectionType)}
            className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
              isActive
                ? "bg-secondary text-foreground font-semibold border border-border/70"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-foreground" : "text-muted-foreground"}`} />
              <span>{item.label}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {count !== null && count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? "bg-card text-foreground border border-border/60" : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {count}
                </span>
              )}
              {complete && (
                <Check
                  className={`w-3 h-3 ${
                    isActive ? "text-foreground" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                />
              )}
            </div>
          </button>
        );
      })}

      {/* Design Tab */}
      <div className="pt-2 mt-1.5 border-t border-border/70">
        <button
          type="button"
          onClick={() => setActiveSection("design" as any)}
          className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-left text-xs font-medium w-full transition-colors cursor-pointer ${
            (activeSection as any) === "design"
              ? "bg-secondary text-foreground font-semibold border border-border/70"
              : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette
              className={`w-3.5 h-3.5 ${
                (activeSection as any) === "design"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            />
            <span>Styling & Font</span>
          </div>
          <span
            className="w-2.5 h-2.5 rounded-full border border-border/80"
            style={{ backgroundColor: activeResume.design?.accentColor || "#0F172A" }}
          />
        </button>
      </div>
    </div>
  );
}
