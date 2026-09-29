import { describe, it, expect, beforeEach } from "vitest";
import { RATE_LIMIT_TIERS } from "@/lib/rate-limit";

// Test the in-memory sliding window logic in isolation
// We recreate the logic here to avoid needing NextRequest/NextResponse in unit tests

interface MemoryEntry {
  timestamps: number[];
}

const store = new Map<string, MemoryEntry>();

function checkInMemory(identifier: string, tier: (typeof RATE_LIMIT_TIERS)[keyof typeof RATE_LIMIT_TIERS]) {
  const now = Date.now();
  const windowMs = tier.windowSeconds * 1000;
  const cutoff = now - windowMs;

  const entry = store.get(identifier) || { timestamps: [] };
  const valid = entry.timestamps.filter((ts) => ts > cutoff);

  if (valid.length >= tier.maxRequests) {
    store.set(identifier, { timestamps: valid });
    return { isRateLimited: true, remaining: 0 };
  }

  valid.push(now);
  store.set(identifier, { timestamps: valid });
  return { isRateLimited: false, remaining: tier.maxRequests - valid.length };
}

describe("Rate Limit Tiers", () => {
  it("anonymous tier: 20 req / 60s", () => {
    const tier = RATE_LIMIT_TIERS.anonymous;
    expect(tier.maxRequests).toBe(20);
    expect(tier.windowSeconds).toBe(60);
  });

  it("authenticated tier: 60 req / 60s", () => {
    const tier = RATE_LIMIT_TIERS.authenticated;
    expect(tier.maxRequests).toBe(60);
    expect(tier.windowSeconds).toBe(60);
  });

  it("ai_generation tier: 15 req / 60s", () => {
    const tier = RATE_LIMIT_TIERS.ai_generation;
    expect(tier.maxRequests).toBe(15);
    expect(tier.windowSeconds).toBe(60);
  });

  it("strict tier: 5 req / 60s", () => {
    const tier = RATE_LIMIT_TIERS.strict;
    expect(tier.maxRequests).toBe(5);
    expect(tier.windowSeconds).toBe(60);
  });
});

describe("In-memory sliding window rate limiter", () => {
  beforeEach(() => store.clear());

  it("allows requests under the limit", () => {
    const tier = RATE_LIMIT_TIERS.strict; // 5 req / 60s
    for (let i = 0; i < 5; i++) {
      const result = checkInMemory("test-ip", tier);
      expect(result.isRateLimited).toBe(false);
    }
  });

  it("blocks the (limit+1)th request", () => {
    const tier = RATE_LIMIT_TIERS.strict; // 5 req / 60s
    for (let i = 0; i < 5; i++) {
      checkInMemory("test-ip-block", tier);
    }
    const result = checkInMemory("test-ip-block", tier);
    expect(result.isRateLimited).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("tracks remaining count correctly", () => {
    const tier = RATE_LIMIT_TIERS.strict;
    const r1 = checkInMemory("test-ip-remaining", tier);
    expect(r1.remaining).toBe(4);
    const r2 = checkInMemory("test-ip-remaining", tier);
    expect(r2.remaining).toBe(3);
  });

  it("different identifiers are tracked independently", () => {
    const tier = RATE_LIMIT_TIERS.strict;
    for (let i = 0; i < 5; i++) checkInMemory("ip-a", tier);
    const resultA = checkInMemory("ip-a", tier);
    const resultB = checkInMemory("ip-b", tier);
    expect(resultA.isRateLimited).toBe(true);
    expect(resultB.isRateLimited).toBe(false);
  });
});
