import { z } from "zod";

/**
 * Server and Client Environment Variables Schema
 *
 * Required:   NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
 * Recommended: GEMINI_API_KEY (AI features degrade gracefully without it)
 * Optional:   UPSTASH_*, SENTRY_*, NEXT_PUBLIC_APP_URL
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().optional().default("3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),

  // Supabase — required for any real data persistence
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(30, {
    message:
      "NEXT_PUBLIC_SUPABASE_ANON_KEY is required. Get it from Supabase Dashboard → Project Settings → API.",
  }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Google Gemini AI — optional, AI endpoints fall back to heuristic engine if absent
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().optional().default("gemini-1.5-flash"),

  // Upstash Redis — optional locally, required in production for distributed rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry — optional locally, strongly recommended in production
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns a typed object.
 *
 * In development:  Logs warnings for missing optional keys.
 * In production:   Throws for missing critical keys (Supabase).
 *                  Warns (does not throw) for missing recommended keys (Gemini).
 */
export function validateEnv(): { env: Env; isValid: boolean; errors: string[]; warnings: string[] } {
  const result = envSchema.safeParse(process.env);

  const warnings: string[] = [];

  // Warn about missing GEMINI_API_KEY regardless of parse result
  if (!process.env.GEMINI_API_KEY) {
    warnings.push(
      "GEMINI_API_KEY is not set. AI features (bullet enhancer, cover letter, interview coach, ATS match) will use heuristic fallbacks."
    );
    if (process.env.NODE_ENV !== "development") {
      console.warn("⚠️ [Novus] GEMINI_API_KEY not configured — AI features running in fallback mode.");
    }
  }

  // Warn about missing Upstash in production
  if (process.env.NODE_ENV === "production" && !process.env.UPSTASH_REDIS_REST_URL) {
    warnings.push(
      "UPSTASH_REDIS_REST_URL not set in production. Rate limiting is using in-memory fallback (not distributed)."
    );
    console.warn("⚠️ [Novus] Upstash Redis not configured — using in-memory rate limiter (non-distributed).");
  }

  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );

    if (process.env.NODE_ENV === "production") {
      console.error("❌ [Novus] CRITICAL: Invalid environment variables:", errorMessages);
      // Only throw for truly critical keys (Supabase)
      const criticalErrors = errorMessages.filter(
        (e) => e.includes("SUPABASE") || e.includes("URL")
      );
      if (criticalErrors.length > 0) {
        throw new Error(`Missing critical environment variables:\n${criticalErrors.join("\n")}`);
      }
    } else {
      console.warn("⚠️ [Novus] Environment variables incomplete in development:", errorMessages);
    }

    return {
      env: process.env as unknown as Env,
      isValid: false,
      errors: errorMessages,
      warnings,
    };
  }

  return {
    env: result.data,
    isValid: true,
    errors: [],
    warnings,
  };
}

export const env = validateEnv().env;
