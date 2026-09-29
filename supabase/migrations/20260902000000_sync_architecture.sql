-- ==============================================================================
-- NOVUS RESUME AI - SYNCHRONIZATION ARCHITECTURE MIGRATION
-- Adds sync_sessions, sync_logs, and sync_preferences for career profile truth
-- ==============================================================================

-- 1. Sync Sessions Table
CREATE TABLE IF NOT EXISTS public.sync_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('resume-to-portfolio', 'portfolio-to-resume', 'bidirectional')),
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'conflicts-resolved', 'cancelled', 'failed')),
  changed_fields TEXT[] DEFAULT ARRAY[]::TEXT[],
  conflicts_count INTEGER DEFAULT 0,
  duration_ms INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_sessions_user ON public.sync_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_resume ON public.sync_sessions(resume_id);
CREATE INDEX IF NOT EXISTS idx_sync_sessions_created ON public.sync_sessions(created_at DESC);

-- 2. Sync Operation Logs Table
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.sync_sessions(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error', 'success')),
  event TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sync_logs_user ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_level ON public.sync_logs(level);

-- 3. Sync Preferences Table
CREATE TABLE IF NOT EXISTS public.sync_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  auto_sync_enabled BOOLEAN DEFAULT TRUE,
  auto_sync_debounce_ms INTEGER DEFAULT 1200,
  default_direction TEXT DEFAULT 'bidirectional' CHECK (default_direction IN ('resume-to-portfolio', 'portfolio-to-resume', 'bidirectional')),
  selective_sync JSONB DEFAULT '{
    "skills": true,
    "experience": true,
    "education": true,
    "projects": true,
    "certifications": true,
    "achievements": true,
    "personalInfo": true
  }'::jsonb,
  prompt_on_conflicts BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sync_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_preferences ENABLE ROW LEVEL SECURITY;

-- Policies for sync_sessions
CREATE POLICY "Users can view own sync sessions"
  ON public.sync_sessions FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert sync sessions"
  ON public.sync_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policies for sync_logs
CREATE POLICY "Users can view own sync logs"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert sync logs"
  ON public.sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policies for sync_preferences
CREATE POLICY "Users can view own sync preferences"
  ON public.sync_preferences FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own sync preferences"
  ON public.sync_preferences FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);
