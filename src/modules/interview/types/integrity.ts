export type IntegritySeverity = "low" | "medium" | "high" | "critical";

export type IntegrityEventType =
  | "tab-blur"
  | "tab-focus"
  | "fullscreen-exit"
  | "fullscreen-enter"
  | "window-blur"
  | "face-not-detected"
  | "multiple-faces"
  | "excessive-gaze-away"
  | "unexpected-audio-stream"
  | "device-change"
  | "paste-detected"
  | "devtools-open";

export interface IntegrityEvent {
  id: string;
  type: IntegrityEventType;
  timestamp: string;
  severity: IntegritySeverity;
  description: string;
  metadata?: Record<string, any>;
  // Legacy aliases
  reason?: string;
  startTime?: string;
}

export type IntegrityVerdict = "clean" | "low-suspicion" | "flagged" | "high-risk";

export interface IntegrityReport {
  overallScore: number; // 0-100 (100 = completely clean)
  verdict: IntegrityVerdict;
  tabSwitchCount: number;
  unfocusedDurationSeconds: number;
  gazeAwayCount: number;
  multipleFaceDetectedCount: number;
  devtoolsDetected: boolean;
  events: IntegrityEvent[];
  summary: string;
  // Legacy aliases
  integrityScore?: number;
  totalFocusLossCount?: number;
  totalSecondsAway?: number;
  longestInterruptionSeconds?: number;
  verdictDescription?: string;
}
