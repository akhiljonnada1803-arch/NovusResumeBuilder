export type AnalyticsEvent =
  | "resume_created"
  | "resume_exported_pdf"
  | "resume_duplicated"
  | "ai_bullet_enhanced"
  | "ai_project_rewritten"
  | "ai_achievement_generated"
  | "ai_skills_suggested"
  | "ats_analysis_run"
  | "portfolio_viewed"
  | "template_switched";

export const Analytics = {
  /**
   * Track custom telemetry / user analytics events
   */
  track(event: AnalyticsEvent, properties: Record<string, any> = {}) {
    try {
      const payload = {
        event,
        properties,
        timestamp: new Date().toISOString(),
        url: typeof window !== "undefined" ? window.location.pathname : "",
      };

      // Log in development
      if (process.env.NODE_ENV === "development") {
        console.log(`[Novus Analytics] 📊 ${event}:`, properties);
      }

      // Store in session storage for local diagnostic auditing
      if (typeof window !== "undefined") {
        const existing = JSON.parse(sessionStorage.getItem("novus_analytics_events") || "[]");
        existing.push(payload);
        sessionStorage.setItem("novus_analytics_events", JSON.stringify(existing.slice(-50)));
      }
    } catch {
      // Fail silently to never impact user experience
    }
  },
};
