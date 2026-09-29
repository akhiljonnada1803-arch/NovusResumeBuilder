import {
  IntegrityEvent,
  IntegrityReport,
  IntegrityVerdict,
  IntegritySeverity,
  IntegrityEventType,
} from "../types/integrity";

export class IntegrityTracker {
  private events: IntegrityEvent[] = [];
  private tabSwitchCount = 0;
  private unfocusedDurationSeconds = 0;
  private blurStartTime: number | null = null;
  private gazeAwayCount = 0;
  private multipleFaceDetectedCount = 0;
  private devtoolsDetected = false;
  private isTracking = false;

  private onBlurHandler: (() => void) | null = null;
  private onFocusHandler: (() => void) | null = null;
  private onVisibilityHandler: (() => void) | null = null;

  public startTracking() {
    if (typeof window === "undefined" || this.isTracking) return;
    this.reset();
    this.isTracking = true;

    // Track unfocused duration via window blur/focus — does NOT count switches
    // (visibilitychange is the authoritative source for switch counting)
    this.onBlurHandler = () => {
      this.blurStartTime = Date.now();
    };

    this.onFocusHandler = () => {
      if (this.blurStartTime) {
        const elapsed = Math.round((Date.now() - this.blurStartTime) / 1000);
        this.unfocusedDurationSeconds += elapsed;
        this.blurStartTime = null;
      }
      this.recordEvent("tab-focus", "low", "Candidate returned to the interview tab.");
    };

    // Single source of truth for tab-switch counting
    this.onVisibilityHandler = () => {
      if (document.hidden) {
        this.tabSwitchCount++;
        this.blurStartTime = Date.now();
        this.recordEvent("tab-blur", "medium", "Interview tab lost visibility.");
      } else {
        // Visibility restored — accumulate unfocused duration
        if (this.blurStartTime) {
          const elapsed = Math.round((Date.now() - this.blurStartTime) / 1000);
          this.unfocusedDurationSeconds += elapsed;
          this.blurStartTime = null;
        }
      }
    };

    window.addEventListener("blur", this.onBlurHandler);
    window.addEventListener("focus", this.onFocusHandler);
    document.addEventListener("visibilitychange", this.onVisibilityHandler);
  }

  public stopTracking() {
    if (typeof window === "undefined" || !this.isTracking) return;
    this.isTracking = false;

    if (this.onBlurHandler) window.removeEventListener("blur", this.onBlurHandler);
    if (this.onFocusHandler) window.removeEventListener("focus", this.onFocusHandler);
    if (this.onVisibilityHandler) document.removeEventListener("visibilitychange", this.onVisibilityHandler);
  }

  public reset() {
    this.events = [];
    this.tabSwitchCount = 0;
    this.unfocusedDurationSeconds = 0;
    this.blurStartTime = null;
    this.gazeAwayCount = 0;
    this.multipleFaceDetectedCount = 0;
    this.devtoolsDetected = false;
  }

  public recordEvent(
    type: IntegrityEventType,
    severity: IntegritySeverity,
    description: string,
    metadata?: Record<string, any>
  ) {
    const event: IntegrityEvent = {
      id: `integ_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      severity,
      description,
      metadata,
      timestamp: new Date().toISOString(),
    };

    this.events.push(event);

    if (type === "excessive-gaze-away") this.gazeAwayCount++;
    if (type === "multiple-faces") this.multipleFaceDetectedCount++;
    if (type === "devtools-open") this.devtoolsDetected = true;
  }

  public generateReport(): IntegrityReport {
    let penalty = 0;
    penalty += Math.min(40, this.tabSwitchCount * 8);
    penalty += Math.min(30, Math.floor(this.unfocusedDurationSeconds / 5) * 5);
    penalty += Math.min(20, this.gazeAwayCount * 4);
    penalty += this.multipleFaceDetectedCount * 15;
    if (this.devtoolsDetected) penalty += 25;

    const overallScore = Math.max(0, 100 - penalty);

    let verdict: IntegrityVerdict = "clean";
    if (overallScore < 50) verdict = "high-risk";
    else if (overallScore < 75) verdict = "flagged";
    else if (overallScore < 90) verdict = "low-suspicion";

    let summary = "Interview completed with full environmental integrity.";
    if (verdict === "high-risk") {
      summary = `High suspicion: Multiple tab switches (${this.tabSwitchCount}) and prolonged unfocused duration (${this.unfocusedDurationSeconds}s) detected.`;
    } else if (verdict === "flagged") {
      summary = `Minor integrity warnings recorded: ${this.tabSwitchCount} tab switch events during technical evaluation.`;
    }

    return {
      overallScore,
      verdict,
      tabSwitchCount: this.tabSwitchCount,
      unfocusedDurationSeconds: this.unfocusedDurationSeconds,
      gazeAwayCount: this.gazeAwayCount,
      multipleFaceDetectedCount: this.multipleFaceDetectedCount,
      devtoolsDetected: this.devtoolsDetected,
      events: this.events,
      summary,
    };
  }
}

export const globalIntegrityTracker = new IntegrityTracker();
