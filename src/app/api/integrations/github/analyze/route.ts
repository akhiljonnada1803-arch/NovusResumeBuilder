import { NextRequest, NextResponse } from "next/server";
import { fetchRepositoryReadme } from "@/lib/integrations/github/github-client";
import { analyzeRepositoryWithAI } from "@/lib/integrations/github/readme-analyzer";
import { RepositoryItem } from "@/lib/integrations/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, repositoryData, token } = body;

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo name are required." },
        { status: 400 }
      );
    }

    const authToken = token || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || undefined;

    // 1. Fetch raw README markdown
    const readme = await fetchRepositoryReadme(owner, repo, authToken);

    // 2. Construct or fallback repository object
    const repoItem: RepositoryItem = repositoryData || {
      id: `${owner}/${repo}`,
      name: repo,
      fullName: `${owner}/${repo}`,
      description: null,
      url: `https://github.com/${owner}/${repo}`,
      stars: 0,
      forks: 0,
      primaryLanguage: "TypeScript",
      languages: {},
      topics: [],
      isFork: false,
      isArchived: false,
      hasReadme: !!readme,
      defaultBranch: "main",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      qualityScore: 70,
      qualityBreakdown: { documentation: 20, activity: 20, popularity: 15, completeness: 15 },
    };

    // 3. Analyze with AI
    const project = await analyzeRepositoryWithAI(repoItem, readme);

    return NextResponse.json({ project });
  } catch (error: any) {
    console.error("GitHub Analyze API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze repository." },
      { status: 500 }
    );
  }
}
