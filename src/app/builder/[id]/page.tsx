"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useResumeStore } from "@/store/useResumeStore";
import { ResumeBuilderStudio } from "@/components/builder/ResumeBuilderStudio";

export default function BuilderPage() {
  const params = useParams();
  const resumeId = params?.id as string;
  const setActiveResumeId = useResumeStore((state) => state.setActiveResumeId);
  const resumes = useResumeStore((state) => state.resumes);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (resumeId) {
      const match = resumes.find((r) => r.id === resumeId);
      if (match) {
        setActiveResumeId(resumeId);
      }
    }
  }, [resumeId, resumes, setActiveResumeId]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent dark:border-white dark:border-t-transparent rounded-full animate-spin" />
          <span>Loading Studio...</span>
        </div>
      </div>
    );
  }

  return <ResumeBuilderStudio />;
}
