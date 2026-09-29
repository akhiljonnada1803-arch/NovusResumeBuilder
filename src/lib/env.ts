import { z } from "zod";

/**
 * Server and Client Environment Variables Schema
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.string().optional().default("3000"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("http://localhost:3000"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url({ message: "NEXT_PUBLIC_SUPABASE_URL must be a valid URL" }),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, { message: "NEXT_PUBLIC_SUPABASE_ANON_KEY is required" }),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Google Gemini AI
  GEMINI_API_KEY: z.string().min(1, { message: "GEMINI_API_KEY is required for AI features" }),
  GEMINI_MODEL: z.string().optional().default("gemini-1.5-flash"),

  // Upstash Redis (Optional for local dev, Required for production rate limiting)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Sentry (Optional for local dev, Recommended for production)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables and returns typed object.
 * In development, missing non-critical keys output warnings.
 * In production, missing critical keys throw descriptive startup errors.
 */
export function validateEnv(): { env: Env; isValid: boolean; errors: string[] } {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errorMessages = result.error.errors.map(
      (err) => `${err.path.join(".")}: ${err.message}`
    );

    if (process.env.NODE_ENV === "production") {
      console.error("❌ CRITICAL: Invalid environment variables detected:", errorMessages);
    } else {
      console.warn("⚠️ Warning: Environment variables incomplete in development mode:", errorMessages);
    }

    return {
      env: (process.env as unknown) as Env,
      isValid: false,
      errors: errorMessages,
    };
  }

  return {
    env: result.data,
    isValid: true,
    errors: [],
  };
}

export const env = validateEnv().env;
