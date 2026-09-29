export type CameraPermissionStatus =
  | "prompt"
  | "connected"
  | "blocked"
  | "granted"
  | "denied"
  | "unavailable"
  | "idle"
  | "requesting"
  | "busy"
  | "not-found";

export type CameraErrorType =
  | "none"
  | "denied"
  | "permission_denied"
  | "device_busy"
  | "device_missing"
  | "not_found"
  | "hardware_error"
  | "overconstrained"
  | "unsupported";

export interface CameraDiagnosticsInfo {
  permissionStatus: CameraPermissionStatus;
  cameraActive: boolean;
  cameraFound: boolean;
  audioActive: boolean;
  audioFound: boolean;
  deviceName: string;
  audioDeviceName: string;
  resolution: string;
  fps: number;
  bitrateKbps: number;
  lightingScore: number;
  framingScore: number;
  faceDetected: boolean;
  errorType?: CameraErrorType;
  errorMessage?: string;
  // Module aliases
  status?: CameraPermissionStatus;
  hasCamera?: boolean;
  hasMicrophone?: boolean;
  selectedCameraLabel?: string;
  selectedMicrophoneLabel?: string;
}

export class CameraService {
  private stream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordedBlobUrl: string | null = null;

  private diagnostics: CameraDiagnosticsInfo = {
    permissionStatus: "prompt",
    cameraActive: false,
    cameraFound: true,
    audioActive: false,
    audioFound: true,
    deviceName: "Default Camera",
    audioDeviceName: "Default Microphone",
    resolution: "1280x720",
    fps: 30,
    bitrateKbps: 1500,
    lightingScore: 85,
    framingScore: 90,
    faceDetected: true,
    errorType: "none",
  };

  private diagListeners: Set<(d: CameraDiagnosticsInfo) => void> = new Set();
  private streamListeners: Set<(s: MediaStream | null) => void> = new Set();

  public getDiagnostics(): CameraDiagnosticsInfo {
    return { ...this.diagnostics };
  }

  public getStream(): MediaStream | null {
    return this.stream;
  }

  public onDiagnosticsChange(cb: (d: CameraDiagnosticsInfo) => void): () => void {
    this.diagListeners.add(cb);
    cb(this.diagnostics);
    return () => this.diagListeners.delete(cb);
  }

  public onStreamChange(cb: (s: MediaStream | null) => void): () => void {
    this.streamListeners.add(cb);
    cb(this.stream);
    return () => this.streamListeners.delete(cb);
  }

  private notify() {
    this.diagListeners.forEach((fn) => fn({ ...this.diagnostics }));
    this.streamListeners.forEach((fn) => fn(this.stream));
  }

  public async startCamera(withVideo = true, withAudio = true): Promise<{ stream: MediaStream | null; error?: string }> {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      this.diagnostics.permissionStatus = "unavailable";
      this.diagnostics.errorType = "unsupported";
      this.diagnostics.errorMessage = "Media devices unsupported.";
      this.notify();
      return { stream: null, error: this.diagnostics.errorMessage };
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: withVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" } : false,
        audio: withAudio,
      };

      const s = await navigator.mediaDevices.getUserMedia(constraints);
      this.stream = s;

      const videoTrack = s.getVideoTracks()[0];
      const audioTrack = s.getAudioTracks()[0];

      if (videoTrack) {
        this.diagnostics.cameraActive = true;
        this.diagnostics.cameraFound = true;
        this.diagnostics.deviceName = videoTrack.label || "HD Webcam";
        const settings = videoTrack.getSettings();
        this.diagnostics.resolution = `${settings.width || 1280}x${settings.height || 720}`;
        this.diagnostics.fps = Math.round(settings.frameRate || 30);
      }

      if (audioTrack) {
        this.diagnostics.audioActive = true;
        this.diagnostics.audioFound = true;
        this.diagnostics.audioDeviceName = audioTrack.label || "Microphone";
      }

      this.diagnostics.permissionStatus = "granted";
      this.diagnostics.errorType = "none";
      this.diagnostics.errorMessage = undefined;
      this.notify();

      return { stream: s };
    } catch (err: any) {
      const isDenied = err.name === "NotAllowedError" || err.name === "PermissionDeniedError";
      this.diagnostics.permissionStatus = isDenied ? "denied" : "unavailable";
      this.diagnostics.errorType = isDenied ? "permission_denied" : "hardware_error";
      this.diagnostics.errorMessage = err.message || "Failed to access camera/mic.";
      this.diagnostics.cameraActive = false;
      this.diagnostics.audioActive = false;
      this.notify();
      return { stream: null, error: this.diagnostics.errorMessage };
    }
  }

  public async requestCameraDetails(withVideo = true, withAudio = true) {
    const res = await this.startCamera(withVideo, withAudio);
    return {
      stream: res.stream,
      status: this.diagnostics.permissionStatus === "granted" ? "connected" as const : (this.diagnostics.permissionStatus === "denied" ? "blocked" as const : "prompt" as const),
      error: res.error,
    };
  }

  public async requestPermissions(audioOnly = false, preferredVideoId?: string, preferredAudioId?: string) {
    return this.startCamera(!audioOnly, true);
  }

  public stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
    }
    this.diagnostics.cameraActive = false;
    this.diagnostics.audioActive = false;
    this.notify();
  }

  public stopStream() {
    this.stopCamera();
  }

  public toggleVideoTrack(enabled: boolean) {
    if (this.stream) {
      this.stream.getVideoTracks().forEach((t) => (t.enabled = enabled));
      this.diagnostics.cameraActive = enabled;
      this.notify();
    }
  }

  public toggleAudioTrack(enabled: boolean) {
    if (this.stream) {
      this.stream.getAudioTracks().forEach((t) => (t.enabled = enabled));
      this.diagnostics.audioActive = enabled;
      this.notify();
    }
  }

  public attachToVideoElement(videoEl: HTMLVideoElement | null) {
    if (!videoEl) return;
    if (this.stream) {
      if (videoEl.srcObject !== this.stream) {
        videoEl.srcObject = this.stream;
      }
      videoEl.play().catch(() => {});
    }
  }

  public updateDiagnostics(partial?: Partial<CameraDiagnosticsInfo>) {
    if (partial) {
      this.diagnostics = { ...this.diagnostics, ...partial };
    }
    this.notify();
  }

  public startRecording(): boolean {
    if (!this.stream) return false;
    try {
      this.recordedChunks = [];
      const options = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? { mimeType: "video/webm;codecs=vp9,opus" }
        : { mimeType: "video/webm" };

      this.mediaRecorder = new MediaRecorder(this.stream, options);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.mediaRecorder.start(1000);
      return true;
    } catch (e) {
      console.warn("Failed to start MediaRecorder:", e);
      return false;
    }
  }

  public async stopRecording(): Promise<string | null> {
    return new Promise((resolve) => {
      if (!this.mediaRecorder || this.mediaRecorder.state === "inactive") {
        resolve(this.recordedBlobUrl);
        return;
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: "video/webm" });
        if (this.recordedBlobUrl) {
          URL.revokeObjectURL(this.recordedBlobUrl);
        }
        this.recordedBlobUrl = URL.createObjectURL(blob);
        resolve(this.recordedBlobUrl);
      };

      this.mediaRecorder.stop();
    });
  }

  public subscribe(fn: (diag: CameraDiagnosticsInfo) => void): () => void {
    return this.onDiagnosticsChange(fn);
  }
}

export const globalCameraService = new CameraService();
export const globalCameraManager = globalCameraService;
export const CameraManager = CameraService;
