import { RepositoryItem, ContributionStats, DeveloperScoreBreakdown } from "../types";

const GITHUB_API_BASE = "https://api.github.com";

interface FetchReposOptions {
  username: string;
  token?: string;
  perPage?: number;
  sort?: "updated" | "stars" | "pushed";
}

/**
 * Calculates a 0-100 quality score for a repository to help recruiters identify top projects.
 */
export function calculateRepoQualityScore(repo: any, hasReadme: boolean = true): {
  score: number;
  breakdown: RepositoryItem["qualityBreakdown"];
} {
  let docScore = 0;
  let activityScore = 0;
  let popScore = 0;
  let completeScore = 0;

  // 1. Documentation (Max 30)
  if (hasReadme) docScore += 15;
  if (repo.description && repo.description.length > 20) docScore += 10;
  if (repo.topics && repo.topics.length >= 3) docScore += 5;

  // 2. Popularity & Social Proof (Max 25)
  if (repo.stargazers_count > 0) popScore += 5;
  if (repo.stargazers_count >= 5) popScore += 5;
  if (repo.stargazers_count >= 20) popScore += 5;
  if (repo.stargazers_count >= 100) popScore += 5;
  if (repo.forks_count > 0) popScore += 5;

  // 3. Completeness & Deployment (Max 25)
  if (repo.homepage && repo.homepage.startsWith("http")) completeScore += 15; // Live demo URL
  if (repo.license) completeScore += 5;
  if (!repo.fork) completeScore += 5; // Original creation

  // 4. Activity & Freshness (Max 20)
  const pushedDate = new Date(repo.pushed_at || repo.updated_at).getTime();
  const monthsAgo = (Date.now() - pushedDate) / (1000 * 60 * 60 * 24 * 30);
  if (monthsAgo <= 1) activityScore += 20;
  else if (monthsAgo <= 3) activityScore += 15;
  else if (monthsAgo <= 6) activityScore += 10;
  else if (monthsAgo <= 12) activityScore += 5;

  const totalScore = Math.min(100, docScore + activityScore + popScore + completeScore);

  return {
    score: totalScore,
    breakdown: {
      documentation: docScore,
      activity: activityScore,
      popularity: popScore,
      completeness: completeScore,
    },
  };
}

/**
 * Calculates 3D developer scores (Quality, Open Source Impact, Developer Activity).
 */
export function calculateDeveloperScores(
  repos: RepositoryItem[],
  totalStars: number,
  totalForks: number,
  followers: number
): DeveloperScoreBreakdown {
  if (repos.length === 0) {
    return {
      projectQualityScore: 0,
      openSourceScore: 0,
      activityScore: 0,
      compositeScore: 0,
      tier: "Emerging Developer",
    };
  }

  // 1. Project Quality (Average quality score of top 5 repos)
  const topRepos = [...repos].sort((a, b) => b.qualityScore - a.qualityScore).slice(0, 5);
  const avgQuality = Math.round(
    topRepos.reduce((acc, r) => acc + r.qualityScore, 0) / Math.max(1, topRepos.length)
  );

  // 2. Open Source Score (Stars, Forks, Community Followers)
  let osScore = 0;
  if (totalStars > 0) osScore += Math.min(40, totalStars * 4);
  if (totalForks > 0) osScore += Math.min(30, totalForks * 6);
  if (followers > 0) osScore += Math.min(30, followers * 3);
  osScore = Math.min(100, Math.max(20, osScore));

  // 3. Developer Activity Score (Freshness & active push cadence)
  let actScore = 50;
  const recentlyPushed = repos.filter((r) => {
    const pushedDate = new Date(r.pushedAt).getTime();
    const monthsAgo = (Date.now() - pushedDate) / (1000 * 60 * 60 * 24 * 30);
    return monthsAgo <= 3;
  }).length;
  actScore += Math.min(40, recentlyPushed * 8);
  if (repos.length >= 10) actScore += 10;
  actScore = Math.min(100, actScore);

  // 4. Composite Score
  const composite = Math.round(avgQuality * 0.45 + osScore * 0.3 + actScore * 0.25);

  let tier: DeveloperScoreBreakdown["tier"] = "Proficient Builder";
  if (composite >= 88) tier = "Elite Lead / Staff";
  else if (composite >= 75) tier = "Senior Engineer";
  else if (composite >= 60) tier = "Proficient Builder";
  else tier = "Emerging Developer";

  return {
    projectQualityScore: avgQuality,
    openSourceScore: osScore,
    activityScore: actScore,
    compositeScore: composite,
    tier,
  };
}

/**
 * Fetches user repositories and calculates quality scores & metrics.
 */
export async function fetchGitHubRepositories(options: FetchReposOptions): Promise<{
  repos: RepositoryItem[];
  stats: ContributionStats;
  user: {
    login: string;
    name: string;
    avatarUrl: string;
    bio: string;
    publicRepos: number;
    followers: number;
  };
}> {
  const { username, token, perPage = 30 } = options;

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "Novus-Resume-AI",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // 1. Fetch user profile
  const userRes = await fetch(`${GITHUB_API_BASE}/users/${encodeURIComponent(username)}`, {
    headers,
    next: { revalidate: 60 },
  });

  if (!userRes.ok) {
    if (userRes.status === 404) {
      throw new Error(`GitHub user "${username}" was not found.`);
    }
    if (userRes.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please provide a Personal Access Token.");
    }
    throw new Error(`GitHub API error: ${userRes.statusText}`);
  }

  const userData = await userRes.json();

  // 2. Fetch public repositories
  const reposRes = await fetch(
    `${GITHUB_API_BASE}/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&sort=pushed&type=all`,
    { headers, next: { revalidate: 60 } }
  );

  if (!reposRes.ok) {
    throw new Error("Failed to fetch user repositories.");
  }

  const rawRepos = await reposRes.json();

  // Language aggregation for stats
  const languageCounts: { [lang: string]: number } = {};
  let totalStars = 0;
  let totalForks = 0;

  const parsedRepos: RepositoryItem[] = rawRepos.map((r: any) => {
    const { score, breakdown } = calculateRepoQualityScore(r, true);
    totalStars += r.stargazers_count || 0;
    totalForks += r.forks_count || 0;

    if (r.language) {
      languageCounts[r.language] = (languageCounts[r.language] || 0) + 1;
    }

    return {
      id: r.id,
      name: r.name,
      fullName: r.full_name,
      description: r.description || null,
      url: r.html_url,
      homepageUrl: r.homepage || null,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      openIssues: r.open_issues_count || 0,
      primaryLanguage: r.language || null,
      languages: r.language ? { [r.language]: 1 } : {},
      topics: r.topics || [],
      isFork: r.fork,
      isArchived: r.archived,
      isPrivate: r.private || false,
      hasReadme: true,
      defaultBranch: r.default_branch || "main",
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      pushedAt: r.pushed_at,
      qualityScore: score,
      qualityBreakdown: breakdown,
    };
  });

  // Calculate top language distribution
  const totalLangEntries = Object.values(languageCounts).reduce((a, b) => a + b, 0) || 1;
  const topLanguages = Object.entries(languageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({
      name,
      percentage: Math.round((count / totalLangEntries) * 100),
    }));

  // Sort repos by quality score descending
  parsedRepos.sort((a, b) => b.qualityScore - a.qualityScore);

  // Calculate 3D Developer Scores
  const developerScores = calculateDeveloperScores(
    parsedRepos,
    totalStars,
    totalForks,
    userData.followers || 0
  );

  const stats: ContributionStats = {
    totalRepos: userData.public_repos || parsedRepos.length,
    totalStars,
    totalForks,
    topLanguages,
    developerScores,
  };

  return {
    repos: parsedRepos,
    stats,
    user: {
      login: userData.login,
      name: userData.name || userData.login,
      avatarUrl: userData.avatar_url,
      bio: userData.bio || "",
      publicRepos: userData.public_repos,
      followers: userData.followers,
    },
  };
}

/**
 * Fetches the raw README markdown of a specific repository.
 */
export async function fetchRepositoryReadme(
  owner: string,
  repo: string,
  token?: string
): Promise<string> {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3.raw",
    "User-Agent": "Novus-Resume-AI",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`, {
      headers,
    });

    if (!res.ok) {
      return "";
    }

    return await res.text();
  } catch {
    return "";
  }
}
