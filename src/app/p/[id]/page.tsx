import React from "react";
import { Metadata } from "next";
import { SAMPLE_RESUMES } from "@/lib/mock-data";
import { PortfolioView } from "@/components/portfolio/PortfolioView";
import { PortfolioTheme, normalizeTheme, parseSectionsQuery } from "@/types/portfolio";

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ theme?: PortfolioTheme | string; sections?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const resume = SAMPLE_RESUMES.find((r) => r.id === id) || SAMPLE_RESUMES[0];
  const name = resume.personalInfo?.fullName || "Alex Rivera";
  const title = resume.personalInfo?.jobTitle || "Senior Software Engineer";
  const summary =
    resume.personalInfo?.summary ||
    `Personal engineering portfolio and projects for ${name}.`;

  return {
    title: `${name} | ${title} - Portfolio`,
    description: summary.substring(0, 160),
    openGraph: {
      title: `${name} – Professional Portfolio`,
      description: summary.substring(0, 160),
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} | ${title}`,
      description: summary.substring(0, 160),
    },
  };
}

export default async function PublicPortfolioPage({
  params,
  searchParams,
}: PortfolioPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const rawTheme = resolvedSearchParams?.theme;
  const rawSections = resolvedSearchParams?.sections;
  const validatedTheme = normalizeTheme(rawTheme);
  const sectionsConfig = parseSectionsQuery(rawSections);

  // In production, fetch from Supabase database; fallback to mock resumes
  const resume = SAMPLE_RESUMES.find((r) => r.id === id) || SAMPLE_RESUMES[0];

  return (
    <PortfolioView
      resume={resume}
      initialTheme={validatedTheme}
      isPublicView={true}
      sectionsConfig={sectionsConfig}
    />
  );
}
