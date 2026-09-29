import React from "react";
import { Metadata } from "next";
import { LinkedInIdentityHub } from "@/components/integrations/LinkedInIdentityHub";

export const metadata: Metadata = {
  title: "LinkedIn Unified Identity & 3-Way Sync | Novus Resume",
  description:
    "Unified professional identity system connecting LinkedIn, ATS Resumes, and live Portfolio sites with automated 3-way synchronization, profile completeness audit, and career insights.",
};

export default function LinkedInPage() {
  return <LinkedInIdentityHub />;
}
