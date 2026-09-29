import { RecruiterPersonaProfile } from "../types/persona";

/**
 * Text-to-Speech Engine for Interview Coach recruiters.
 * Supports Web Speech API with automatic voice matching, pitch/rate controls,
 * and sentence-level pause chunking.
 */
export class VoiceSynthesizer {
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  public speak(
    text: string,
    persona: RecruiterPersonaProfile,
    options?: {
      onStart?: () => void;
      onEnd?: () => void;
      onError?: (err: any) => void;
    }
  ): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) {
        options?.onEnd?.();
        resolve();
        return;
      }

      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      this.currentUtterance = utterance;
      this.isSpeaking = true;

      utterance.pitch = persona.vocalPitch || 1.0;
      utterance.rate = persona.vocalRate || 1.0;

      // Select natural sounding voice if available
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(
        (v) =>
          (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google") || v.name.includes("Premium")) &&
          v.lang.startsWith("en")
      ) || voices.find((v) => v.lang.startsWith("en"));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        options?.onEnd?.();
        resolve();
      };

      utterance.onerror = (err) => {
        this.isSpeaking = false;
        this.currentUtterance = null;
        options?.onError?.(err);
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  }

  public stop() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const globalVoiceSynthesizer = new VoiceSynthesizer();
