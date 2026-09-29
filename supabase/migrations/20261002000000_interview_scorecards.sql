-- Interview Scorecards Table
-- Stores completed interview scorecards and evaluation metrics

CREATE TABLE IF NOT EXISTS public.interview_scorecards (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_name TEXT NOT NULL DEFAULT 'Candidate',
  target_role TEXT NOT NULL DEFAULT 'Software Engineer',
  persona_id TEXT NOT NULL DEFAULT 'tech-lead',
  overall_score NUMERIC DEFAULT 0,
  scores_json JSONB NOT NULL DEFAULT '{}',
  speech_analytics JSONB DEFAULT '{}',
  verdict TEXT NOT NULL DEFAULT 'Needs Improvement',
  transcript_json JSONB NOT NULL DEFAULT '[]',
  evidence_json JSONB NOT NULL DEFAULT '[]',
  full_scorecard JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_interview_scorecards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_interview_scorecards_updated_at ON public.interview_scorecards;
CREATE TRIGGER trg_interview_scorecards_updated_at
  BEFORE UPDATE ON public.interview_scorecards
  FOR EACH ROW EXECUTE FUNCTION public.update_interview_scorecards_updated_at();

-- Row Level Security
ALTER TABLE public.interview_scorecards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can select own scorecards"
  ON public.interview_scorecards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scorecards"
  ON public.interview_scorecards FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own scorecards"
  ON public.interview_scorecards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scorecards"
  ON public.interview_scorecards FOR DELETE
  USING (auth.uid() = user_id);

-- Index for querying scorecards by user and creation date
CREATE INDEX IF NOT EXISTS idx_interview_scorecards_user_created
  ON public.interview_scorecards (user_id, created_at DESC);
