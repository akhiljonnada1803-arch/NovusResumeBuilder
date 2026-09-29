"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  RecruiterPersonaId,
  RECRUITER_PERSONAS,
  InterviewStage,
  ConversationTurn,
  InterviewScorecard,
  RecruiterInternalState,
  INTERVIEW_STAGES,
} from "../types";
import { globalIntegrityTracker } from "../services/integrity-tracker";
import { globalVoiceSynthesizer } from "../voice/voice-synthesizer";
import { globalTranscriptManager } from "../transcript/transcript-manager";
import { globalAdaptiveMemoryGraph } from "../services/adaptive-memory-graph";

export interface InterviewSessionConfig {
  resume?: any;
  targetRole?: string;
  jobDescription?: string;
  initialPersonaId?: RecruiterPersonaId;
}

export function useInterviewSession(config: InterviewSessionConfig) {
  const [personaId, setPersonaId] = useState<RecruiterPersonaId>(config.initialPersonaId || "tech-lead");
  const [currentStage, setCurrentStage] = useState<InterviewStage>("intro");
  const [turns, setTurns] = useState<ConversationTurn[]>([]);
  const [isEvaluatingTurn, setIsEvaluatingTurn] = useState(false);
  const [isGeneratingScorecard, setIsGeneratingScorecard] = useState(false);
  const [scorecard, setScorecard] = useState<InterviewScorecard | null>(null);
  const [isRecruiterSpeaking, setIsRecruiterSpeaking] = useState(false);
  const [isCandidateSpeaking, setIsCandidateSpeaking] = useState(false);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [isSessionActive, setIsSessionActive] = useState(false);

  const [recruiterNotes, setRecruiterNotes] = useState<{ note: string; stage: string }[]>([]);
  const [internalState, setInternalState] = useState<RecruiterInternalState>({
    confidenceLevel: 80,
    interestLevel: 85,
    concernLevel: 10,
    technicalImpression: "Solid",
    activeEmotion: "Starting conversation",
    emotionEmoji: "ðŸ‘‹",
  });

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const persona = RECRUITER_PERSONAS[personaId] || RECRUITER_PERSONAS["tech-lead"];

  // Manage call duration timer based on session active state
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => setCallDurationSeconds((p) => p + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSessionActive]);

  const startSession = useCallback(async () => {
    startTimeRef.current = Date.now();
    setTurns([]);
    setRecruiterNotes([]);
    setScorecard(null);
    setCallDurationSeconds(0);
    setIsSessionActive(true);
    globalTranscriptManager.reset();
    // Reset client-side memory graph to prevent prior session bleedthrough
    globalAdaptiveMemoryGraph.resetSession();
    globalIntegrityTracker.startTracking();

    try {
      const res = await fetch("/api/interview/chat-turn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          stage: "intro",
          history: [],
          candidateAnswer: "",
          resume: config.resume,
          targetRole: config.targetRole,
          jobDescription: config.jobDescription,
        }),
      });

      const data = await res.json();
      if (data.recruiterResponse) {
        const initialTurn: ConversationTurn = {
          id: `recruiter_${Date.now()}`,
          speaker: "recruiter",
          stage: "intro",
          text: data.recruiterResponse,
          timestamp: new Date().toISOString(),
          recruiterReaction: data.activeEmotion,
          recruiterEmotionEmoji: data.emotionEmoji,
          recruiterInternalState: data.internalState,
        };

        setTurns([initialTurn]);
        globalTranscriptManager.addTurn(initialTurn);

        if (data.internalState) setInternalState(data.internalState);
        if (data.recruiterLiveNote) {
          setRecruiterNotes([{ note: data.recruiterLiveNote, stage: "intro" }]);
        }

        // Speak greeting with speaking indicator
        setIsRecruiterSpeaking(true);
        globalVoiceSynthesizer.speak(data.recruiterResponse, persona, {
          onEnd: () => setIsRecruiterSpeaking(false),
        });
      }
    } catch (err) {
      console.warn("Session start turn fallback:", err);
    }
  }, [personaId, config.resume, config.targetRole, config.jobDescription, persona]);

  const sendCandidateAnswer = useCallback(
    async (answerText: string) => {
      if (!answerText.trim() || isEvaluatingTurn) return;

      const candidateTurn: ConversationTurn = {
        id: `cand_${Date.now()}`,
        speaker: "candidate",
        stage: currentStage,
        text: answerText.trim(),
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...turns, candidateTurn];
      setTurns(updatedHistory);
      globalTranscriptManager.addTurn(candidateTurn);
      setIsEvaluatingTurn(true);

      try {
        const res = await fetch("/api/interview/chat-turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personaId,
            stage: currentStage,
            history: updatedHistory,
            candidateAnswer: answerText.trim(),
            recruiterNotes,
            resume: config.resume,
            targetRole: config.targetRole,
            jobDescription: config.jobDescription,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.error || `Turn failed with status ${res.status}`);
        }

        if (data.recruiterResponse) {
          const recruiterTurn: ConversationTurn = {
            id: `recruiter_${Date.now()}`,
            speaker: "recruiter",
            stage: data.suggestedNextStage || currentStage,
            text: data.recruiterResponse,
            timestamp: new Date().toISOString(),
            recruiterReaction: data.activeEmotion,
            recruiterEmotionEmoji: data.emotionEmoji,
            recruiterInternalState: data.internalState,
            evaluationSnippet: {
              score: data.instantScore ?? 0,
              feedback: data.instantFeedback || "Evaluated response",
            },
          };

          const finalTurns = [...updatedHistory, recruiterTurn];
          setTurns(finalTurns);
          globalTranscriptManager.addTurn(recruiterTurn);

          if (data.suggestedNextStage && data.suggestedNextStage !== currentStage) {
            setCurrentStage(data.suggestedNextStage);
          }

          if (data.internalState) setInternalState(data.internalState);
          if (data.recruiterLiveNote) {
            setRecruiterNotes((prev) => [
              ...prev,
              { note: data.recruiterLiveNote, stage: data.suggestedNextStage || currentStage },
            ]);
          }

          // Speak response with speaking indicator
          setIsRecruiterSpeaking(true);
          globalVoiceSynthesizer.speak(data.recruiterResponse, persona, {
            onEnd: () => setIsRecruiterSpeaking(false),
          });
        }
      } catch (err) {
        console.warn("Turn evaluation error:", err);
        throw err;
      } finally {
        setIsEvaluatingTurn(false);
      }
    },
    [
      isEvaluatingTurn,
      currentStage,
      turns,
      personaId,
      recruiterNotes,
      config.resume,
      config.targetRole,
      config.jobDescription,
      persona,
    ]
  );

  const finishInterview = useCallback(async () => {
    globalVoiceSynthesizer.stop();
    globalIntegrityTracker.stopTracking();
    const integrityReport = globalIntegrityTracker.generateReport();
    const durationMinutes = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 60000));

    setIsSessionActive(false);
    setIsGeneratingScorecard(true);

    try {
      const res = await fetch("/api/interview/final-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          turns,
          durationMinutes,
          integrityReport,
          resume: config.resume,
          targetRole: config.targetRole,
          jobDescription: config.jobDescription,
        }),
      });

      const data = await res.json();
      if (data.scorecard) {
        setScorecard(data.scorecard);
        return data.scorecard;
      }
      return null;
    } catch (err) {
      console.warn("Failed to generate scorecard:", err);
      return null;
    } finally {
      setIsGeneratingScorecard(false);
      setCurrentStage("completed");
    }
  }, [personaId, turns, config.resume, config.targetRole, config.jobDescription]);

  const restoreSession = useCallback(
    (
      savedTurns: ConversationTurn[],
      savedStage: InterviewStage,
      savedPersonaId?: RecruiterPersonaId
    ) => {
      startTimeRef.current = Date.now();
      setTurns(savedTurns);
      setCurrentStage(savedStage);
      if (savedPersonaId) setPersonaId(savedPersonaId);
      setScorecard(null);
      setIsSessionActive(true);
      globalTranscriptManager.reset();
      savedTurns.forEach((turn) => globalTranscriptManager.addTurn(turn));
      globalIntegrityTracker.startTracking();
    },
    []
  );

  return {
    // Persona
    personaId,
    setPersonaId,
    persona,
    // Stage & turns
    currentStage,
    setCurrentStage,
    turns,
    // Loading states
    isEvaluatingTurn,
    isGeneratingScorecard,
    // Speaking states (drives UI indicators)
    isRecruiterSpeaking,
    isCandidateSpeaking,
    setIsCandidateSpeaking,
    // Call timer
    callDurationSeconds,
    isSessionActive,
    // Scorecard & notes
    scorecard,
    setScorecard,
    recruiterNotes,
    internalState,
    // Actions
    startSession,
    sendCandidateAnswer,
    finishInterview,
    restoreSession,
  };
}
