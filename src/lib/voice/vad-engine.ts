export type TurnTakingState =
  | "idle"
  | "recruiter-speaking"
  | "candidate-speaking"
  | "candidate-paused"
  | "interrupted"
  | "AI_SPEAKING"
  | "USER_SPEAKING";

export interface VADConfig {
  speechEnergyThreshold?: number;
  silenceEnergyThreshold?: number;
  speechOnsetDurationMs?: number;
  silenceCutoffDurationMs?: number;
  smoothingTimeConstant?: number;
  silenceTimeoutMs?: number;
}

export const DEFAULT_VAD_CONFIG: VADConfig = {
  speechEnergyThreshold: 14,
  silenceEnergyThreshold: 8,
  speechOnsetDurationMs: 180,
  silenceCutoffDurationMs: 1200,
  smoothingTimeConstant: 0.8,
  silenceTimeoutMs: 2000,
};

export class VoiceActivityDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private animFrameId: number | null = null;

  private config: VADConfig = DEFAULT_VAD_CONFIG;
  private isSpeechActive = false;
  private silenceTimer: number | null = null;
  private maxTimer: number | null = null;

  private onSpeechStartCb: (() => void) | null = null;
  private onSpeechEndCb: (() => void) | null = null;
  private onVolumeChangeCb: ((rms: number, isSpeech: boolean) => void) | null = null;
  private onMaxTimeoutCb: (() => void) | null = null;

  constructor(config: Partial<VADConfig> = {}) {
    this.config = { ...DEFAULT_VAD_CONFIG, ...config };
  }

  public onSpeechStart(cb: () => void) {
    this.onSpeechStartCb = cb;
    return this;
  }

  public onSpeechEnd(cb: () => void) {
    this.onSpeechEndCb = cb;
    return this;
  }

  public onVolumeChange(cb: (rms: number, isSpeech: boolean) => void) {
    this.onVolumeChangeCb = cb;
    return this;
  }

  public onMaxTimeout(cb: () => void) {
    this.onMaxTimeoutCb = cb;
    return this;
  }

  public async start(stream: MediaStream) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant || 0.8;

      this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
      this.mediaStreamSource.connect(this.analyser);

      this.loop();
    } catch (err) {
      console.warn("VAD start error:", err);
    }
  }

  public stop() {
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.mediaStreamSource) {
      try { this.mediaStreamSource.disconnect(); } catch {}
      this.mediaStreamSource = null;
    }
    if (this.audioContext && this.audioContext.state !== "closed") {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
  }

  private loop = () => {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    const rms = Math.sqrt(sum / dataArray.length);
    const threshold = this.config.speechEnergyThreshold || 14;
    const isSpeech = rms >= threshold;

    if (this.onVolumeChangeCb) {
      this.onVolumeChangeCb(rms, isSpeech);
    }

    if (isSpeech) {
      if (!this.isSpeechActive) {
        this.isSpeechActive = true;
        this.onSpeechStartCb?.();
      }
      if (this.silenceTimer) {
        clearTimeout(this.silenceTimer);
        this.silenceTimer = null;
      }
    } else {
      if (this.isSpeechActive && !this.silenceTimer) {
        this.silenceTimer = window.setTimeout(() => {
          this.isSpeechActive = false;
          this.silenceTimer = null;
          this.onSpeechEndCb?.();
        }, this.config.silenceTimeoutMs || 2000);
      }
    }

    this.animFrameId = requestAnimationFrame(this.loop);
  };
}

export const globalVADEngine = new VoiceActivityDetector();
export const VADEngine = VoiceActivityDetector;
