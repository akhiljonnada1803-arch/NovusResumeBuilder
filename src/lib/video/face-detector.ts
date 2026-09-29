/**
 * LiveFaceDetector — client-side face presence monitoring for the integrity tracker.
 *
 * Uses the browser-native MediaPipe Tasks Vision WASM runtime when available.
 * Falls back gracefully (no-op) when the library is not loaded or the browser
 * does not support WASM.
 *
 * Model assets should be placed in /public/mediapipe/:
 *   wasm/             — from @mediapipe/tasks-vision npm package
 *   blaze_face_short_range.tflite
 *
 * Usage:
 *   const detector = new LiveFaceDetector();
 *   await detector.initialize();
 *   detector.attachToVideo(videoEl);
 *   detector.startDetecting((count) => { ... });
 *   detector.stop();
 */

export type FaceCountCallback = (count: number) => void;

export class LiveFaceDetector {
  private detector: any = null;
  private videoEl: HTMLVideoElement | null = null;
  private frameTimer: number | null = null;
  private isInitialized = false;
  private isSupported = false;

  /**
   * Asynchronously loads the MediaPipe FaceDetector WASM module.
   * Safe to call multiple times — subsequent calls are no-ops.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    if (typeof window === "undefined") return;

    try {
      // Dynamic import keeps the heavy WASM out of the initial bundle
      const { FaceDetector, FilesetResolver } = await import(
        "@mediapipe/tasks-vision" as any
      );

      const vision = await FilesetResolver.forVisionTasks("/mediapipe/wasm");

      this.detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "/mediapipe/blaze_face_short_range.tflite",
          delegate: "GPU",
        },
        minDetectionConfidence: 0.55,
        runningMode: "VIDEO",
      });

      this.isInitialized = true;
      this.isSupported = true;
    } catch (err) {
      // MediaPipe unavailable (old browser, missing assets, no WASM support)
      console.info(
        "LiveFaceDetector: MediaPipe unavailable — face detection disabled.",
        err
      );
      this.isSupported = false;
    }
  }

  /** Attach the video element whose frames will be analysed. */
  attachToVideo(videoEl: HTMLVideoElement | null): void {
    this.videoEl = videoEl;
  }

  /**
   * Start sampling video frames at `intervalMs` (default 1 000 ms).
   * Calls `onFaceCount` with the number of faces detected in each frame.
   * No-ops silently if MediaPipe failed to initialise.
   */
  startDetecting(onFaceCount: FaceCountCallback, intervalMs = 1000): void {
    if (!this.isSupported || !this.detector) return;
    if (this.frameTimer !== null) this.stop();

    this.frameTimer = window.setInterval(() => {
      if (!this.detector || !this.videoEl) return;
      if (this.videoEl.readyState < 2) return; // Not enough data yet

      try {
        const result = this.detector.detectForVideo(
          this.videoEl,
          performance.now()
        );
        onFaceCount(result.detections?.length ?? 0);
      } catch {
        // Frame decode errors are transient — ignore silently
      }
    }, intervalMs);
  }

  /** Stop frame sampling and release resources. */
  stop(): void {
    if (this.frameTimer !== null) {
      clearInterval(this.frameTimer);
      this.frameTimer = null;
    }
  }

  get supported(): boolean {
    return this.isSupported;
  }
}

/** Global singleton — initialised lazily when the interview room joins a call. */
export const globalFaceDetector = new LiveFaceDetector();
