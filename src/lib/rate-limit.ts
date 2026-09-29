import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export interface RateLimitTier {
  name: "anonymous" | "authenticated" | "ai_generation" | "strict";
  maxRequests: number;
  windowSeconds: number;
}

export const RATE_LIMIT_TIERS: Record<string, RateLimitTier> = {
  anonymous: { name: "anonymous", maxRequests: 20, windowSeconds: 60 },
  authenticated: { name: "authenticated", maxRequests: 60, windowSeconds: 60 },
  ai_generation: { name: "ai_generation", maxRequests: 15, windowSeconds: 60 },
  strict: { name: "strict", maxRequests: 5, windowSeconds: 60 },
};

export interface RateLimitResult {
  isRateLimited: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // in seconds
  headers: Record<string, string>;
}

// In-memory sliding window store as fallback when Upstash is unconfigured or unreachable
interface MemoryEntry {
  timestamps: number[];
}
const memoryStore = new Map<string, MemoryEntry>();

/**
 * Fallback in-memory sliding window rate limiter
 */
function checkInMemoryRateLimit(
  identifier: string,
  tier: RateLimitTier
): RateLimitResult {
  const now = Date.now();
  const windowMs = tier.windowSeconds * 1000;
  const cutoff = now - windowMs;

  const entry = memoryStore.get(identifier) || { timestamps: [] };
  // Filter out timestamps outside the current window
  const validTimestamps = entry.timestamps.filter((ts) => ts > cutoff);

  const resetTime = Math.ceil(
    ((validTimestamps[0] || now) + windowMs - now) / 1000
  );

  if (validTimestamps.length >= tier.maxRequests) {
    memoryStore.set(identifier, { timestamps: validTimestamps });
    return {
      isRateLimited: true,
      limit: tier.maxRequests,
      remaining: 0,
      resetTime: Math.max(1, resetTime),
      headers: {
        "X-RateLimit-Limit": String(tier.maxRequests),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.max(1, resetTime)),
        "Retry-After": String(Math.max(1, resetTime)),
      },
    };
  }

  validTimestamps.push(now);
  memoryStore.set(identifier, { timestamps: validTimestamps });

  const remaining = tier.maxRequests - validTimestamps.length;
  return {
    isRateLimited: false,
    limit: tier.maxRequests,
    remaining,
    resetTime: Math.max(1, resetTime),
    headers: {
      "X-RateLimit-Limit": String(tier.maxRequests),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.max(1, resetTime)),
    },
  };
}

/**
 * Production Rate Limiter with Upstash Redis and automatic fallback
 */
export async function checkRateLimit(
  req: NextRequest,
  tier: RateLimitTier = RATE_LIMIT_TIERS.anonymous,
  customIdentifier?: string
): Promise<RateLimitResult> {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const identifier = customIdentifier || `${tier.name}:${ip}`;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // If Upstash Redis credentials are provided, use Upstash Redis REST
  if (redisUrl && redisToken) {
    try {
      const { Redis } = await import("@upstash/redis");
      const { Ratelimit } = await import("@upstash/ratelimit");

      const redis = new Redis({
        url: redisUrl,
        token: redisToken,
      });

      const ratelimit = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(
          tier.maxRequests,
          `${tier.windowSeconds} s`
        ),
        analytics: true,
        prefix: `@novus/ratelimit`,
      });

      const result = await ratelimit.limit(identifier);

      return {
        isRateLimited: !result.success,
        limit: result.limit,
        remaining: result.remaining,
        resetTime: Math.ceil((result.reset - Date.now()) / 1000),
        headers: {
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": String(result.remaining),
          "X-RateLimit-Reset": String(Math.ceil((result.reset - Date.now()) / 1000)),
          ...(!result.success
            ? { "Retry-After": String(Math.ceil((result.reset - Date.now()) / 1000)) }
            : {}),
        },
      };
    } catch (err) {
      logger.warn("Upstash Redis rate limit call failed, falling back to in-memory limiter", {
        identifier,
        error: err instanceof Error ? err.message : String(err),
      });
      return checkInMemoryRateLimit(identifier, tier);
    }
  }

  // Graceful in-memory fallback for local dev and testing
  return checkInMemoryRateLimit(identifier, tier);
}

/**
 * Standard HTTP 429 Too Many Requests response builder with rate limit headers
 */
export function createRateLimitResponse(result: RateLimitResult): NextResponse {
  return NextResponse.json(
    {
      error: "Too Many Requests",
      message: `Rate limit exceeded. Please retry in ${result.resetTime} seconds.`,
      retryAfterSeconds: result.resetTime,
    },
    {
      status: 429,
      headers: result.headers,
    }
  );
}
