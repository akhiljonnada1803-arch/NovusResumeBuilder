/**
 * Feature Flags — Novus Resume AI
 *
 * Controls which features are visible in the UI per release version.
 * All flags read from NEXT_PUBLIC_FEATURE_* environment variables.
 * Set to "true" in your .env.local or Vercel environment settings to enable.
 *
 * Version plan:
 *   v1.0  → All flags false (launch stable)
 *   v1.1  → VOICE_INTERVIEW, VIDEO_INTERVIEW, INTERVIEW_HISTORY = true
 *   v1.2  → LINKEDIN_LIVE_SYNC, GITHUB_WEBHOOK, EMAIL_REPORTS = true
 *   v2.0  → TEAM_WORKSPACE = true
 *   v3.0  → DESKTOP_APP = true
 */

function flag(envKey: string): boolean {
  return process.env[envKey] === "true";
}

export const FEATURES = {
  // v1.1 — Interview Suite
  voiceInterview: flag("NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW"),
  videoInterview: flag("NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEW"),
  interviewHistory: flag("NEXT_PUBLIC_FEATURE_INTERVIEW_HISTORY"),

  // v1.2 — Identity Hub
  linkedinLiveSync: flag("NEXT_PUBLIC_FEATURE_LINKEDIN_LIVE_SYNC"),
  githubWebhook: flag("NEXT_PUBLIC_FEATURE_GITHUB_WEBHOOK"),
  emailReports: flag("NEXT_PUBLIC_FEATURE_EMAIL_REPORTS"),

  // v2.0 — Enterprise
  teamWorkspace: flag("NEXT_PUBLIC_FEATURE_TEAM_WORKSPACE"),

  // v3.0 — Native Apps
  desktopApp: flag("NEXT_PUBLIC_FEATURE_DESKTOP_APP"),
} as const;

export type FeatureKey = keyof typeof FEATURES;
