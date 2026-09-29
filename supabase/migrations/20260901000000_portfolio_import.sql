-- ==============================================================================
-- NOVUS RESUME AI - EXISTING PORTFOLIO IMPORT DATABASE MIGRATION
-- Adds portfolio_imports tracking table & audit history
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.portfolio_imports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL CHECK (source_type IN ('url', 'github', 'zip', 'html_snippet', 'react_project', 'nextjs_project')),
  source_identifier TEXT NOT NULL,
  detected_framework TEXT,
  project_type TEXT,
  confidence_score INTEGER NOT NULL DEFAULT 100,
  extracted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  destination_type TEXT NOT NULL DEFAULT 'resume' CHECK (destination_type IN ('resume', 'portfolio', 'merged')),
  destination_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_imports_user ON public.portfolio_imports(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_imports_source ON public.portfolio_imports(source_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_imports_destination ON public.portfolio_imports(destination_id);

-- Enable RLS
ALTER TABLE public.portfolio_imports ENABLE ROW LEVEL SECURITY;

-- Users can view their own portfolio import history
CREATE POLICY "Users can view own portfolio imports"
  ON public.portfolio_imports
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Users can insert portfolio imports
CREATE POLICY "Users can insert portfolio imports"
  ON public.portfolio_imports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
