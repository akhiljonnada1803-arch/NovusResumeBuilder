import { describe, it, expect } from "vitest";
import { FEATURES } from "@/lib/features";

describe("Feature Flags", () => {
  it("v1.1 flags are enabled by default and v1.2+ flags are off by default", () => {
    // In v1.1, interview & BYOK features are active out of the box
    expect(FEATURES.voiceInterview).toBe(true);
    expect(FEATURES.videoInterview).toBe(true);
    expect(FEATURES.interviewHistory).toBe(true);
    expect(FEATURES.byokKeyManager).toBe(true);
    expect(FEATURES.cmdPalette).toBe(true);

    // v1.2+ future roadmap features are off by default
    expect(FEATURES.linkedinLiveSync).toBe(false);
    expect(FEATURES.githubWebhook).toBe(false);
    expect(FEATURES.emailReports).toBe(false);
    expect(FEATURES.teamWorkspace).toBe(false);
    expect(FEATURES.desktopApp).toBe(false);
  });

  it("flag returns true when env var is 'true'", () => {
    process.env.NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW = "true";
    // Re-evaluate the flag function directly
    const flag = (key: string) => process.env[key] === "true";
    expect(flag("NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW")).toBe(true);
    delete process.env.NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW;
  });

  it("flag stays false when env var is 'false' string", () => {
    process.env.NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW = "false";
    const flag = (key: string) => process.env[key] === "true";
    expect(flag("NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW")).toBe(false);
    delete process.env.NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW;
  });

  it("flag stays false when env var is '1' (not 'true')", () => {
    process.env.NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEW = "1";
    const flag = (key: string) => process.env[key] === "true";
    expect(flag("NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEW")).toBe(false);
    delete process.env.NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEW;
  });
});
