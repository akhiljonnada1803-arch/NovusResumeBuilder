import { VoiceSettings } from "@/types/voice-interview";
import { VoiceActivityDetector, DEFAULT_VAD_CONFIG } from "./vad-engine";

export type VoicePipelineState =
  | "IDLE"
  | "AI_SPEAKING"
  | "LISTENING"
  | "USER_SPEAKING"
  | "PROCESSING";

export const DEFAULT_VOICE_SETTINGS: VoiceSettings = {
  voiceName: "",
  rate: 1.0,
  pitch: 1.0,
  volume: 1.0,
  autoSpeak: true,
  silenceTimeoutMs: 2000,
};

export class VoiceEngine {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private vad: VoiceActivityDetector | null = null;
  private micStream: MediaStream | null = null;

  private currentState: VoicePipelineState = "IDLE";
  private currentTranscript = "";
  private accumulatedTranscript = "";
  private availableVoices: SpeechSynthesisVoice[] = [];

  // Callbacks
  private onStateChangeCb?: (state: VoicePipelineState) => void;
  private onTranscriptUpdateCb?: (transcript: string, isFinal: boolean) => void;
  private onEndOfSpeechCb?: (finalTranscript: string) => void;
  private onVolumeChangeCb?: (rms: number, isSpeech: boolean) => void;

  // Timers
  private silenceTimer: NodeJS.Timeout | null = null;
  private safetyTimeoutTimer: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
      this.initRecognition();
    }
  }

  private setState(newState: VoicePipelineState) {
    if (this.currentState !== newState) {
      this.currentState = newState;
      this.onStateChangeCb?.(newState);
    }
  }

  public getState(): VoicePipelineState {
    return this.currentState;
  }

  public onStateChange(cb: (state: VoicePipelineState) => void): this {
    this.onStateChangeCb = cb;
    cb(this.currentState);
    return this;
  }

  public onEndOfSpeech(cb: (finalTranscript: string) => void): this {
    this.onEndOfSpeechCb = cb;
    return this;
  }

  public onTranscriptUpdate(cb: (transcript: string, isFinal: boolean) => void): this {
    this.onTranscriptUpdateCb = cb;
    return this;
  }

  public onVolumeChange(cb: (rms: number, isSpeech: boolean) => void): this {
    this.onVolumeChangeCb = cb;
    return this;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.availableVoices = this.synth.getVoices().filter((v) => v.lang.startsWith("en"));
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.availableVoices.length === 0) {
      this.loadVoices();
    }
    return this.availableVoices;
  }

  private initRecognition() {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web SpeechRecognition is not supported in this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event: any) => {
        // Disallow processing transcript if AI is currently speaking
        if (this.currentState === "AI_SPEAKING") return;

        let interimTranscript = "";
        let finalChunk = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalChunk += event.results[i][0].transcript + " ";
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        if (finalChunk) {
          this.accumulatedTranscript += finalChunk;
        }

        const fullText = (this.accumulatedTranscript + " " + interimTranscript).trim();
        this.currentTranscript = fullText;

        if (fullText) {
          this.setState("USER_SPEAKING");
          this.onTranscriptUpdateCb?.(fullText, Boolean(finalChunk));
          this.resetSilenceTimer();
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error !== "no-speech" && event.error !== "aborted") {
          console.warn("Speech recognition error:", event.error);
        }
      };

      this.recognition.onend = () => {
        if (this.currentState === "LISTENING" || this.currentState === "USER_SPEAKING") {
          try {
            this.recognition?.start();
          } catch {}
        }
      };
    } catch (e) {
      console.warn("Speech recognition init error:", e);
    }
  }

  /**
   * AI Speaking: Disables microphone during speech synthesis to prevent echo & self-listening.
   */
  public speak(
    text: string,
    settings: Partial<VoiceSettings> = {},
    onEnd?: () => void
  ): Promise<void> {
    return new Promise((resolve) => {
      // 1. Mute / Stop listening before AI begins speaking
      this.stopListening();
      this.setState("AI_SPEAKING");

      if (!this.synth || !text) {
        this.setState("LISTENING");
        onEnd?.();
        resolve();
        return;
      }

      this.stopSpeaking();

      const mergedSettings = { ...DEFAULT_VOICE_SETTINGS, ...settings };
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = this.getVoices();
      if (voices.length > 0) {
        const preferred =
          voices.find((v) => v.name === mergedSettings.voiceName) ||
          voices.find(
            (v) =>
              v.name.includes("Google") ||
              v.name.includes("Natural") ||
              v.name.includes("Samantha") ||
              v.name.includes("Jenny")
          ) ||
          voices[0];
        if (preferred) utterance.voice = preferred;
      }

      utterance.rate = mergedSettings.rate || 1.0;
      utterance.pitch = mergedSettings.pitch || 1.0;
      utterance.volume = mergedSettings.volume || 1.0;

      utterance.onstart = () => {
        this.setState("AI_SPEAKING");
      };

      const handleSpeechEnd = () => {
        this.setState("LISTENING");
        onEnd?.();
        resolve();
      };

      utterance.onend = handleSpeechEnd;
      utterance.onerror = (e) => {
        console.warn("Speech synthesis error:", e);
        handleSpeechEnd();
      };

      this.synth.speak(utterance);
    });
  }

  public stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
      if (this.currentState === "AI_SPEAKING") {
        this.setState("IDLE");
      }
    }
  }

  /**
   * Starts microphone recording and attaches WebRTC/Web Audio VAD.
   */
  public async startListening(
    onTranscript?: (transcript: string, isFinal: boolean) => void,
    onEndOfSpeech?: (finalTranscript: string) => void
  ): Promise<boolean> {
    this.stopSpeaking();
    this.stopListening();

    this.currentTranscript = "";
    this.accumulatedTranscript = "";

    if (onTranscript) this.onTranscriptUpdateCb = onTranscript;
    if (onEndOfSpeech) this.onEndOfSpeechCb = onEndOfSpeech;

    this.setState("LISTENING");

    // 1. Start SpeechRecognition
    try {
      this.recognition?.start();
    } catch {}

    // 2. Attach Web Audio VAD
    try {
      if (!this.micStream || !this.micStream.active) {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
      }

      if (this.micStream) {
        this.vad = new VoiceActivityDetector({ silenceTimeoutMs: 2000 });

        this.vad
          .onSpeechStart(() => {
            if (this.currentState !== "AI_SPEAKING") {
              this.setState("USER_SPEAKING");
            }
          })
          .onSpeechEnd(() => {
            this.handleEndOfSpeech();
          })
          .onVolumeChange((rms, isSpeech) => {
            this.onVolumeChangeCb?.(rms, isSpeech);
          })
          .onMaxTimeout(() => {
            console.warn("VAD Max Listening Safety Timeout fired.");
            this.handleEndOfSpeech();
          });

        await this.vad.start(this.micStream);
      }
    } catch (e) {
      console.warn("VAD microphone acquisition notice:", e);
    }

    // 3. Fallback silence timer
    this.resetSilenceTimer();

    // 4. Hard safety timer (Never allow infinite listening)
    this.safetyTimeoutTimer = setTimeout(() => {
      if (this.currentState === "LISTENING" || this.currentState === "USER_SPEAKING") {
        console.warn("Safety Turn Timeout: Auto-submitting current spoken response.");
        this.handleEndOfSpeech();
      }
    }, 45000);

    return true;
  }

  /**
   * Triggered when silence > 2 seconds is detected after speech.
   */
  private handleEndOfSpeech() {
    if (this.currentState === "PROCESSING" || this.currentState === "AI_SPEAKING") return;

    const finalResult = this.currentTranscript.trim();
    this.stopListening();
    this.setState("PROCESSING");

    if (this.onEndOfSpeechCb && finalResult) {
      this.onEndOfSpeechCb(finalResult);
    }
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    // If user has spoken something substantive, schedule 2.0s silence auto-submit
    if (this.currentTranscript.trim().length > 0) {
      this.silenceTimer = setTimeout(() => {
        this.handleEndOfSpeech();
      }, 2000);
    }
  }

  public stopListening(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.safetyTimeoutTimer) {
      clearTimeout(this.safetyTimeoutTimer);
      this.safetyTimeoutTimer = null;
    }

    if (this.vad) {
      this.vad.stop();
      this.vad = null;
    }

    try {
      this.recognition?.stop();
    } catch {}

    if (this.currentState === "LISTENING" || this.currentState === "USER_SPEAKING") {
      this.setState("IDLE");
    }
  }

  public setSpeakingStateListener(cb: (speaking: boolean) => void) {
    this.onStateChange((state) => cb(state === "AI_SPEAKING"));
  }

  public setListeningStateListener(cb: (listening: boolean) => void) {
    this.onStateChange((state) => cb(state === "LISTENING" || state === "USER_SPEAKING"));
  }

  public isSpeechSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public isMicSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    );
  }
}

export const globalVoiceEngine = new VoiceEngine();
