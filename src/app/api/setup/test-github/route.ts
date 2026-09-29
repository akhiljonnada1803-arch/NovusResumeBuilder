import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token, username } = await req.json();

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "Novus-Resume-AI-Setup",
    };

    if (token && token.trim()) {
      headers.Authorization = `Bearer ${token.trim()}`;
    }

    const endpoint = token && token.trim()
      ? "https://api.github.com/user"
      : `https://api.github.com/users/${encodeURIComponent(username || "octocat")}`;

    const res = await fetch(endpoint, { headers });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: "GitHub token/username is invalid or unauthenticated." },
        { status: 400 }
      );
    }

    const user = await res.json();

    return NextResponse.json({
      success: true,
      message: "GitHub integration verified successfully!",
      user: {
        login: user.login || "GitHub User",
        name: user.name || user.login || "",
        avatarUrl: user.avatar_url || "",
        publicRepos: user.public_repos || 0,
      },
    });
  } catch (error: any) {
    console.error("GitHub Test Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reach GitHub API." },
      { status: 400 }
    );
  }
}
