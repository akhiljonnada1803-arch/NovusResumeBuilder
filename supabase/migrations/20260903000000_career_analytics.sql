-- ==============================================================================
-- NOVUS RESUME AI - CAREER ANALYTICS & TELEMETRY DATABASE MIGRATION
-- Adds career_analytics_events, github_metrics_cache, linkedin_metrics_cache,
-- and monthly_career_reports tables.
-- ==============================================================================

-- 1. Career Analytics Events Table
CREATE TABLE IF NOT EXISTS public.career_analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('resume', 'portfolio', 'github', 'linkedin')),
  entity_id TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'download_pdf', 'download_docx', 'download_txt',
    'export_json', 'export_markdown', 'export_latex',
    'share_view', 'recruiter_click', 'qr_scan',
    'portfolio_visit', 'page_view', 'section_view', 'contact_click'
  )),
  channel TEXT DEFAULT 'web',
  referrer TEXT,
  device_type TEXT DEFAULT 'desktop',
  country_code TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.career_analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON public.career_analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.career_analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.career_analytics_events(created_at DESC);

-- 2. GitHub Metrics Cache Table
CREATE TABLE IF NOT EXISTS public.github_metrics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  total_repos INTEGER DEFAULT 0,
  total_stars INTEGER DEFAULT 0,
  total_forks INTEGER DEFAULT 0,
  annual_contributions INTEGER DEFAULT 0,
  languages_breakdown JSONB DEFAULT '[]'::jsonb,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_github_cache_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_github_cache_user ON public.github_metrics_cache(user_id);

-- 3. LinkedIn Metrics Cache Table
CREATE TABLE IF NOT EXISTS public.linkedin_metrics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_views INTEGER DEFAULT 0,
  search_appearances INTEGER DEFAULT 0,
  connections_count INTEGER DEFAULT 0,
  endorsements_count INTEGER DEFAULT 0,
  top_keywords JSONB DEFAULT '[]'::jsonb,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_linkedin_cache_user UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS idx_linkedin_cache_user ON public.linkedin_metrics_cache(user_id);

-- 4. Monthly Career Reports Table
CREATE TABLE IF NOT EXISTS public.monthly_career_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  month_name TEXT NOT NULL,
  report_year INTEGER NOT NULL,
  overall_score INTEGER NOT NULL DEFAULT 85,
  score_change INTEGER NOT NULL DEFAULT 0,
  executive_summary TEXT NOT NULL,
  kpi_summary JSONB NOT NULL DEFAULT '{}'::jsonb,
  top_performing_assets JSONB NOT NULL DEFAULT '[]'::jsonb,
  recruiter_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monthly_reports_user ON public.monthly_career_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_reports_date ON public.monthly_career_reports(report_year, month_name);

-- Enable RLS
ALTER TABLE public.career_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_metrics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_career_reports ENABLE ROW LEVEL SECURITY;

-- Policies for career_analytics_events
CREATE POLICY "Users can view own analytics events"
  ON public.career_analytics_events FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users and visitors can insert analytics events"
  ON public.career_analytics_events FOR INSERT
  WITH CHECK (TRUE);

-- Policies for github_metrics_cache
CREATE POLICY "Users can view own github metrics"
  ON public.github_metrics_cache FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own github metrics"
  ON public.github_metrics_cache FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for linkedin_metrics_cache
CREATE POLICY "Users can view own linkedin metrics"
  ON public.linkedin_metrics_cache FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own linkedin metrics"
  ON public.linkedin_metrics_cache FOR ALL
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Policies for monthly_career_reports
CREATE POLICY "Users can view own monthly reports"
  ON public.monthly_career_reports FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own monthly reports"
  ON public.monthly_career_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
