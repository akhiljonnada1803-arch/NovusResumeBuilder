import { NextRequest, NextResponse } from "next/server";
import { fetchGitHubRepositories } from "@/lib/integrations/github/github-client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, token, perPage = 50 } = body;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { error: "A valid GitHub username is required." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().replace(/^@/, "").replace(/^https?:\/\/github\.com\//, "");

    const result = await fetchGitHubRepositories({
      username: cleanUsername,
      token: token || process.env.GITHUB_PERSONAL_ACCESS_TOKEN || undefined,
      perPage,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("GitHub Repos API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch GitHub repositories." },
      { status: 500 }
    );
  }
}
