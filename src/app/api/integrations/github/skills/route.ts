import { NextRequest, NextResponse } from "next/server";
import { extractSkillsFromRepositories } from "@/lib/integrations/github/readme-analyzer";
import { RepositoryItem } from "@/lib/integrations/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repos } = body;

    if (!Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "A list of repositories is required." },
        { status: 400 }
      );
    }

    const skills = await extractSkillsFromRepositories(repos as RepositoryItem[]);

    return NextResponse.json({ skills: Array.isArray(skills) ? skills : [] });
  } catch (error: any) {
    console.error("GitHub Skills API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to extract skills from repositories." },
      { status: 500 }
    );
  }
}
