/**
 * Feature Flags — Novus Resume AI
 *
 * Controls which features are visible in the UI per release version.
 * All flags read from NEXT_PUBLIC_FEATURE_* environment variables.
 * Set to "true" in your .env.local or Vercel environment settings to enable.
 *
 * v1.0  → Core flags only (launched)
 * v1.1  → voiceInterview, videoInterview, interviewHistory, byokKeyManager, cmdPalette = true
 * v1.2  → linkedinLiveSync, githubWebhook, emailReports = true
 * v2.0  → teamWorkspace = true
 * v3.0  → desktopApp = true
 */

function flag(envKey: string, defaultValue = false): boolean {
  const val = process.env[envKey];
  if (val === undefined) return defaultValue;
  return val === "true";
}

export const FEATURES = {
  // v1.1 — Interview Suite & BYOK (enabled by default in v1.1)
  voiceInterview: flag("NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW", true),
  videoInterview: flag("NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEW", true),
  interviewHistory: flag("NEXT_PUBLIC_FEATURE_INTERVIEW_HISTORY", true),
  byokKeyManager: flag("NEXT_PUBLIC_FEATURE_BYOK_KEY_MANAGER", true),
  cmdPalette: flag("NEXT_PUBLIC_FEATURE_CMD_PALETTE", true),

  // v1.2 — Identity Hub (off by default)
  linkedinLiveSync: flag("NEXT_PUBLIC_FEATURE_LINKEDIN_LIVE_SYNC"),
  githubWebhook: flag("NEXT_PUBLIC_FEATURE_GITHUB_WEBHOOK"),
  emailReports: flag("NEXT_PUBLIC_FEATURE_EMAIL_REPORTS"),

  // v2.0 — Enterprise (off by default)
  teamWorkspace: flag("NEXT_PUBLIC_FEATURE_TEAM_WORKSPACE"),

  // v3.0 — Native Apps (off by default)
  desktopApp: flag("NEXT_PUBLIC_FEATURE_DESKTOP_APP"),
} as const;

export type FeatureKey = keyof typeof FEATURES;
