"use client";

import { useEffect, useRef, useCallback } from "react";
import { ConversationTurn, InterviewStage } from "../types";
import { InterviewSessionConfig } from "./useInterviewSession";

interface SessionPersistenceOptions {
  sessionId: string;
  userId?: string;
  turns: ConversationTurn[];
  stage: InterviewStage;
  config: InterviewSessionConfig;
  isActive: boolean;
}

/**
 * Debounced auto-save of interview session turns to Supabase.
 * Saves 2s after the last turn change while the session is active.
 */
export function useSessionPersistence({
  sessionId,
  userId,
  turns,
  stage,
  config,
  isActive,
}: SessionPersistenceOptions) {
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  const saveSession = useCallback(async () => {
    if (!userId || !isActive || turns.length === 0) return;
    try {
      await fetch("/api/interview/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId,
          turns,
          currentStage: stage,
          personaId: config.initialPersonaId || "tech-lead",
          targetRole: config.targetRole || "Software Engineer",
          jobDescription: config.jobDescription || "",
        }),
      });
    } catch (err) {
      // Non-fatal — session save is best-effort
      console.warn("Session auto-save failed (non-fatal):", err);
    }
  }, [sessionId, userId, turns, stage, config, isActive]);

  // Debounce: save 2s after each turn change
  useEffect(() => {
    if (!isActive || turns.length === 0) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(saveSession, 2000);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [turns, stage, isActive, saveSession]);

  // Force-save on unmount if session was active
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  const markCompleted = useCallback(
    async (scorecard: any, integrityReport: any, durationMinutes: number) => {
      if (!userId) return;
      try {
        await fetch("/api/interview/session/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            userId,
            scorecard,
            integrityReport,
            durationMinutes,
          }),
        });
      } catch (err) {
        console.warn("Session completion save failed (non-fatal):", err);
      }
    },
    [sessionId, userId]
  );

  return { markCompleted };
}
