-- Interview Sessions Table
-- Stores in-progress and completed interview sessions for resume/persistence.

CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  persona_id TEXT NOT NULL DEFAULT ''tech-lead'',
  target_role TEXT NOT NULL DEFAULT ''Software Engineer'',
  job_description TEXT,
  resume_snapshot JSONB,
  turns JSONB NOT NULL DEFAULT ''[]'',
  current_stage TEXT NOT NULL DEFAULT ''intro'',
  status TEXT NOT NULL DEFAULT ''active''
    CHECK (status IN (''active'', ''completed'', ''abandoned'')),
  scorecard JSONB,
  integrity_report JSONB,
  duration_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_interview_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interview_sessions_updated_at ON public.interview_sessions;
CREATE TRIGGER trg_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_interview_sessions_updated_at();

-- Row Level Security
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own interview sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own interview sessions"
  ON public.interview_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookup of active sessions by user + persona
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user_status
  ON public.interview_sessions (user_id, status, started_at DESC);
