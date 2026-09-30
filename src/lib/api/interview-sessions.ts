/**
 * Interview Session API Helper — Novus Resume AI v1.1
 *
 * Client-side functions for creating, saving, and listing interview sessions
 * against the Supabase `interview_sessions` + `interview_scorecards` tables.
 */

export interface InterviewSessionRow {
  id: string;
  user_id: string;
  interview_type: string;
  target_role: string;
  total_turns: number;
  overall_score: number | null;
  completed_at: string | null;
  created_at: string;
}

export interface InterviewScorecardRow {
  id: string;
  session_id: string;
  turn_number: number;
  question: string;
  answer_transcript: string;
  star_score: number | null;
  clarity_score: number | null;
  feedback: string | null;
  created_at: string;
}

export interface CreateSessionPayload {
  interviewType: string;
  targetRole: string;
  totalTurns: number;
}

export interface SaveScorecardPayload {
  sessionId: string;
  overallScore: number;
  turns: Array<{
    turnNumber: number;
    question: string;
    answerTranscript: string;
    starScore?: number;
    clarityScore?: number;
    feedback?: string;
  }>;
}

/** Create a new session row at the start of an interview. Returns the session ID. */
export async function createInterviewSession(
  payload: CreateSessionPayload
): Promise<string | null> {
  try {
    const res = await fetch("/api/interview/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { id: string };
    return data.id;
  } catch {
    return null;
  }
}

/** Save the final scorecard turns against a completed session. */
export async function saveInterviewScorecard(
  payload: SaveScorecardPayload
): Promise<boolean> {
  try {
    const res = await fetch(`/api/interview/sessions/${payload.sessionId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch the user's past interview sessions sorted by newest first. */
export async function listInterviewSessions(): Promise<InterviewSessionRow[]> {
  try {
    const res = await fetch("/api/interview/sessions");
    if (!res.ok) return [];
    const data = (await res.json()) as { sessions: InterviewSessionRow[] };
    return data.sessions ?? [];
  } catch {
    return [];
  }
}

/** Fetch a specific session with its scorecards. */
export async function getInterviewSession(sessionId: string): Promise<{
  session: InterviewSessionRow | null;
  scorecards: InterviewScorecardRow[];
}> {
  try {
    const res = await fetch(`/api/interview/sessions/${sessionId}`);
    if (!res.ok) return { session: null, scorecards: [] };
    const data = (await res.json()) as {
      session: InterviewSessionRow;
      scorecards: InterviewScorecardRow[];
    };
    return data;
  } catch {
    return { session: null, scorecards: [] };
  }
}
