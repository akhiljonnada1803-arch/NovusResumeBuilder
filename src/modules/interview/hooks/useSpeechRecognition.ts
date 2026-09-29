"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { globalVoiceEngine } from "@/lib/voice/voice-engine";

export interface UseSpeechRecognitionReturn {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  finalTranscript: string;
  startListening: (micStream?: MediaStream) => Promise<void>;
  stopListening: () => void;
  clearFinal: () => void;
}

/**
 * Hook that wraps globalVoiceEngine (Web Speech API + VAD) to provide
 * real-time interim transcripts and silence-triggered final transcripts
 * for the live interview room.
 */
export function useSpeechRecognition(): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");

  // Detect support client-side only
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsSupported(
        Boolean(
          (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition
        )
      );
    }
  }, []);

  // Keep state in sync with VoiceEngine pipeline state
  useEffect(() => {
    const unsub = globalVoiceEngine.onStateChange((state) => {
      setIsListening(state === "LISTENING" || state === "USER_SPEAKING");
      // When AI starts speaking, clear any lingering interim text
      if (state === "AI_SPEAKING") {
        setInterimTranscript("");
      }
    });
    // onStateChange returns `this` (VoiceEngine) not an unsubscribe fn — store nothing
    return () => {};
  }, []);

  const startListening = useCallback(
    async (micStream?: MediaStream) => {
      if (!isSupported) return;

      await globalVoiceEngine.startListening(
        // onTranscriptUpdate: fires on every interim + final chunk
        (text: string, isFinal: boolean) => {
          if (isFinal) {
            setInterimTranscript("");
          } else {
            setInterimTranscript(text);
          }
        },
        // onEndOfSpeech: fires the accumulated final transcript after silence
        (final: string) => {
          setInterimTranscript("");
          setFinalTranscript(final);
        }
      );

      setIsListening(true);
    },
    [isSupported]
  );

  const stopListening = useCallback(() => {
    globalVoiceEngine.stopListening();
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const clearFinal = useCallback(() => {
    setFinalTranscript("");
  }, []);

  return {
    isListening,
    isSupported,
    interimTranscript,
    finalTranscript,
    startListening,
    stopListening,
    clearFinal,
  };
}
