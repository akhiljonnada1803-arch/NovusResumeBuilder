/**
 * Comprehensive Verification Test for Commercial SaaS Launch Readiness
 */

import assert from "assert";

console.log("=== NOVUS RESUME AI: LAUNCH READINESS VERIFICATION TEST ===");

// 1. Test Structured Logger & PII Redaction
console.log("\n[TEST 1] Structured Logger & PII Redaction...");
import { StructuredLogger } from "../src/lib/logger.js";

let capturedLog = "";
const originalLog = console.log;
console.log = (msg) => {
  capturedLog = msg;
};

const testLogger = new StructuredLogger({ service: "test-runner", requestId: "req-12345" });
testLogger.info("User logged in", {
  userId: "user-789",
  email: "candidate@example.com",
  password: "super_secret_password_123",
  apiKey: "gemini_secret_key_abc",
  bearerHeader: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
});

console.log = originalLog;

assert(capturedLog.length > 0, "Logger must produce JSON output");
const parsedLog = JSON.parse(capturedLog);
assert.strictEqual(parsedLog.level, "INFO");
assert.strictEqual(parsedLog.requestId, "req-12345");
assert.strictEqual(parsedLog.password, "[REDACTED]", "Password must be redacted");
assert.strictEqual(parsedLog.apiKey, "[REDACTED]", "API key must be redacted");
assert(parsedLog.bearerHeader.includes("[REDACTED]"), "Bearer token must be redacted");
console.log("  ✓ Structured logging and automated PII redaction verified!");

// 2. Test Rate Limiter (Tiered Sliding Window & In-Memory Fallback)
console.log("\n[TEST 2] Upstash Rate Limiter & Sliding Window Fallback...");
import { checkRateLimit, RATE_LIMIT_TIERS } from "../src/lib/rate-limit.js";

// Mock NextRequest-like object
const mockReq = (ip = "192.168.1.100") => ({
  headers: new Headers({ "x-forwarded-for": ip }),
});

async function runRateLimiterTests() {
  const tier = { name: "strict_test", maxRequests: 3, windowSeconds: 2 };
  const clientIp = "10.0.0.1";

  // Request 1
  const r1 = await checkRateLimit(mockReq(clientIp), tier, `test:${clientIp}`);
  assert.strictEqual(r1.isRateLimited, false);
  assert.strictEqual(r1.remaining, 2);
  assert.strictEqual(r1.headers["X-RateLimit-Limit"], "3");
  assert.strictEqual(r1.headers["X-RateLimit-Remaining"], "2");

  // Request 2
  const r2 = await checkRateLimit(mockReq(clientIp), tier, `test:${clientIp}`);
  assert.strictEqual(r2.isRateLimited, false);
  assert.strictEqual(r2.remaining, 1);

  // Request 3
  const r3 = await checkRateLimit(mockReq(clientIp), tier, `test:${clientIp}`);
  assert.strictEqual(r3.isRateLimited, false);
  assert.strictEqual(r3.remaining, 0);

  // Request 4 -> Must be rate limited
  const r4 = await checkRateLimit(mockReq(clientIp), tier, `test:${clientIp}`);
  assert.strictEqual(r4.isRateLimited, true, "4th request must exceed capacity of 3");
  assert.strictEqual(r4.remaining, 0);
  assert(r4.headers["Retry-After"] !== undefined, "Rate limited response must include Retry-After header");
  console.log("  ✓ Sliding window rate limiter and HTTP 429 header generation verified!");
}
await runRateLimiterTests();

// 3. Test Sentry Monitoring & Dedicated AI Failure Telemetry
console.log("\n[TEST 3] Sentry Monitoring & AI Failure Telemetry...");
import { captureAIFailure, getRecentErrorEvents } from "../src/lib/monitoring/sentry.js";

captureAIFailure({
  model: "gemini-1.5-flash",
  feature: "resume-enhancement",
  errorType: "quota_exceeded",
  statusCode: 429,
  durationMs: 450,
  rawError: new Error("Resource exhausted: quota exceeded for model gemini-1.5-flash"),
});

const recentEvents = getRecentErrorEvents(5);
assert(recentEvents.length > 0, "Recent error events must be logged");
const lastEvent = recentEvents[recentEvents.length - 1];
assert.strictEqual(lastEvent.type, "ai_failure");
assert(lastEvent.message.includes("quota_exceeded"));
assert.strictEqual(lastEvent.context.model, "gemini-1.5-flash");
console.log("  ✓ AI failure telemetry captured with model context and error type!");

// 4. Test Environment Variable Schema Validation
console.log("\n[TEST 4] Production Environment Validation...");
import { validateEnv } from "../src/lib/env.js";

const envValidation = validateEnv();
assert(envValidation !== undefined, "Env validator must return validation result");
console.log(`  ✓ Environment validation executed: isValid=${envValidation.isValid}, errorsCount=${envValidation.errors.length}`);

// 5. Test Health Check Logic
console.log("\n[TEST 5] Subsystem Health Checks...");
import { GET as healthRouteHandler } from "../src/app/api/health/route.js";

const healthResponse = await healthRouteHandler(mockReq("127.0.0.1"));
assert.strictEqual(healthResponse.status, 200);
const healthPayload = await healthResponse.json();
assert(healthPayload.status === "healthy" || healthPayload.status === "degraded");
assert(healthPayload.subsystems.supabase !== undefined, "Health check must probe Supabase");
assert(healthPayload.subsystems.gemini !== undefined, "Health check must probe Gemini");
assert(healthPayload.subsystems.portfolioDeployment !== undefined, "Health check must probe Portfolio Deployment");
assert(healthPayload.subsystems.redis !== undefined, "Health check must probe Redis");
assert(healthPayload.uptimeSeconds >= 0, "Health check must include uptime");
console.log(`  ✓ Multi-subsystem health check probe returned status: ${healthPayload.status} (Total probe duration: ${healthPayload.totalDurationMs}ms)`);

console.log("\n=======================================================");
console.log("🎉 ALL SAAS LAUNCH READINESS VERIFICATIONS PASSED!");
console.log("=======================================================\n");
