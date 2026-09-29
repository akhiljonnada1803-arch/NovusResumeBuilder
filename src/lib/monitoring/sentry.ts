import { logger } from "@/lib/logger";

export interface SentryBreadcrumb {
  category: string;
  message: string;
  level?: "info" | "warning" | "error";
  data?: Record<string, unknown>;
  timestamp?: number;
}

export interface AIFailureContext {
  model: string;
  feature: string; // e.g. "resume-enhancement", "interview-evaluation", "portfolio-extraction"
  promptTokensEstimate?: number;
  statusCode?: number;
  durationMs?: number;
  errorType: "timeout" | "rate_limit" | "quota_exceeded" | "schema_validation" | "network" | "unknown";
  rawError?: unknown;
}

// In-memory telemetry buffer for errors captured during active sessions
const errorEventLog: Array<{
  timestamp: string;
  type: "client" | "server" | "ai_failure";
  message: string;
  context?: Record<string, unknown>;
}> = [];

/**
 * Capture client or server application errors
 */
export function captureException(
  error: Error | unknown,
  context?: {
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
    user?: { id?: string; email?: string };
    level?: "error" | "warning" | "fatal";
  }
) {
  const errMessage = error instanceof Error ? error.message : String(error);
  const errStack = error instanceof Error ? error.stack : undefined;

  logger.error(`[Sentry Capture] ${errMessage}`, {
    ...context?.tags,
    ...context?.extra,
    userId: context?.user?.id,
    stack: errStack,
  });

  errorEventLog.push({
    timestamp: new Date().toISOString(),
    type: "server",
    message: errMessage,
    context: {
      tags: context?.tags,
      extra: context?.extra,
      userId: context?.user?.id,
    },
  });

  // If Sentry DSN is present, send to Sentry API or global Sentry instance
  if (typeof window !== "undefined" && (window as unknown as { Sentry?: { captureException: Function } }).Sentry) {
    try {
      (window as unknown as { Sentry: { captureException: Function } }).Sentry.captureException(error, {
        tags: context?.tags,
        extra: context?.extra,
      });
    } catch {
      // Ignore Sentry dispatch failures
    }
  }
}

/**
 * Dedicated AI Failure Telemetry Logger
 * Captures Gemini model timeouts, JSON schema decoding errors, and rate limits
 */
export function captureAIFailure(aiContext: AIFailureContext) {
  const message = `[AI Failure: ${aiContext.feature}] ${aiContext.errorType} - Model: ${aiContext.model}`;

  logger.error(message, {
    subsystem: "gemini-ai",
    model: aiContext.model,
    feature: aiContext.feature,
    errorType: aiContext.errorType,
    statusCode: aiContext.statusCode,
    durationMs: aiContext.durationMs,
    rawError: aiContext.rawError instanceof Error ? aiContext.rawError.message : String(aiContext.rawError),
  });

  errorEventLog.push({
    timestamp: new Date().toISOString(),
    type: "ai_failure",
    message,
    context: {
      model: aiContext.model,
      feature: aiContext.feature,
      errorType: aiContext.errorType,
      statusCode: aiContext.statusCode,
      durationMs: aiContext.durationMs,
    },
  });
}

/**
 * Adds an informational breadcrumb to the transaction context
 */
export function addBreadcrumb(breadcrumb: SentryBreadcrumb) {
  logger.debug(`[Breadcrumb: ${breadcrumb.category}] ${breadcrumb.message}`, breadcrumb.data);
}

/**
 * Retrieves the recent telemetry events for health checks & diagnostic panels
 */
export function getRecentErrorEvents(limit = 10) {
  return errorEventLog.slice(-limit);
}
