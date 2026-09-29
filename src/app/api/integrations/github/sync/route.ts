import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubRepositories, fetchRepositoryReadme } from "@/lib/integrations/github/github-client";
import { analyzeRepositoryWithAI, extractSkillsFromRepositories } from "@/lib/integrations/github/readme-analyzer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, token, repoNames } = body;

    if (!username) {
      return NextResponse.json({ error: "GitHub username is required." }, { status: 400 });
    }

    // 1. Fetch repositories and 3D developer scores
    const { repos, stats, user } = await fetchGitHubRepositories({ username, token });

    // 2. Filter repositories to sync
    const targetRepos = repoNames && Array.isArray(repoNames) && repoNames.length > 0
      ? repos.filter((r) => repoNames.includes(r.name))
      : repos.slice(0, 4); // default top 4

    // 3. Analyze each target repo with AI
    const analyzedProjects = await Promise.all(
      targetRepos.map(async (repo) => {
        const readme = await fetchRepositoryReadme(user.login, repo.name, token);
        return await analyzeRepositoryWithAI(repo, readme);
      })
    );

    // 4. Extract 5-tier categorized skills
    const extractedSkills = await extractSkillsFromRepositories(repos);

    return NextResponse.json({
      syncedAt: new Date().toISOString(),
      user,
      stats,
      projects: analyzedProjects,
      skills: extractedSkills,
    });
  } catch (error: any) {
    console.error("GitHub Sync API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync GitHub profile." },
      { status: 500 }
    );
  }
}
