/**
 * Production-Grade Structured JSON Logger
 * Formatted for CloudWatch, Datadog, GCP Cloud Logging, and Vercel Log Drains.
 */

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogContext {
  requestId?: string;
  userId?: string;
  path?: string;
  method?: string;
  durationMs?: number;
  statusCode?: number;
  subsystem?: string;
  [key: string]: unknown;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const CURRENT_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ||
  (process.env.NODE_ENV === "production" ? "info" : "debug");

// Sensitive patterns and exact keys to automatically redact in logs
const SENSITIVE_KEY_PATTERNS = [
  "password",
  "token",
  "authorization",
  "secret",
  "apikey",
  "api_key",
  "anon_key",
  "service_role",
  "cookie",
  "bearer",
];

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase().replace(/[-_]/g, "");
  return SENSITIVE_KEY_PATTERNS.some((pattern) => {
    const cleanPattern = pattern.replace(/[-_]/g, "");
    return lower === cleanPattern || lower.includes(cleanPattern);
  });
}

function redactSensitiveData(obj: unknown, depth = 0): unknown {
  if (depth > 5 || obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Redact Bearer tokens
    return obj.replace(/Bearer\s+[A-Za-z0-9-_.]+/gi, "Bearer [REDACTED]");
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveData(item, depth + 1));
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (isSensitiveKey(key)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = redactSensitiveData(val, depth + 1);
      }
    }
    return sanitized;
  }

  return obj;
}

export class StructuredLogger {
  private baseContext: LogContext;

  constructor(context: LogContext = {}) {
    this.baseContext = context;
  }

  public child(childContext: LogContext): StructuredLogger {
    return new StructuredLogger({
      ...this.baseContext,
      ...childContext,
    });
  }

  private write(level: LogLevel, message: string, meta?: Record<string, unknown>, error?: Error | unknown) {
    if (LOG_LEVELS[level] < LOG_LEVELS[CURRENT_LEVEL]) return;

    const timestamp = new Date().toISOString();
    const sanitizedMeta = meta ? redactSensitiveData(meta) : undefined;
    const sanitizedContext = redactSensitiveData(this.baseContext);

    const logEntry: Record<string, unknown> = {
      timestamp,
      level: level.toUpperCase(),
      message,
      environment: process.env.NODE_ENV || "development",
      ...(sanitizedContext as object),
      ...(sanitizedMeta as object),
    };

    if (error) {
      if (error instanceof Error) {
        logEntry.error = {
          name: error.name,
          message: error.message,
          stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
        };
      } else {
        logEntry.error = { message: String(error) };
      }
    }

    const output = JSON.stringify(logEntry);

    if (level === "error" || level === "fatal") {
      console.error(output);
    } else if (level === "warn") {
      console.warn(output);
    } else {
      console.log(output);
    }
  }

  public debug(message: string, meta?: Record<string, unknown>) {
    this.write("debug", message, meta);
  }

  public info(message: string, meta?: Record<string, unknown>) {
    this.write("info", message, meta);
  }

  public warn(message: string, meta?: Record<string, unknown>, error?: Error | unknown) {
    this.write("warn", message, meta, error);
  }

  public error(message: string, meta?: Record<string, unknown>, error?: Error | unknown) {
    this.write("error", message, meta, error);
  }

  public fatal(message: string, meta?: Record<string, unknown>, error?: Error | unknown) {
    this.write("fatal", message, meta, error);
  }
}

export const logger = new StructuredLogger({ service: "novus-resume-ai" });
