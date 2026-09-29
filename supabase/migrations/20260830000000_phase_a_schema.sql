-- ==============================================================================
-- NOVUS RESUME AI - PHASE A DATABASE MIGRATION
-- Supabase Schema Update for Production Resume + Portfolio Platform
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. EXTEND PROFILES TABLE
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS vercel_access_token TEXT,
  ADD COLUMN IF NOT EXISTS github_username TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_settings JSONB DEFAULT '{
    "defaultTemplate": "developer",
    "autoSyncGithub": false,
    "showPoweredBy": false
  }'::jsonb;

-- ------------------------------------------------------------------------------
-- 2. PORTFOLIO TEMPLATES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Default 6 Unique Templates
INSERT INTO public.portfolio_templates (id, name, slug, category, description, is_active)
VALUES
  ('developer', 'Developer Pro', 'developer', 'Engineering & Code', 'IDE / Split Sidebar layout with live GitHub activity, code snippet hero, and interactive repo cards.', TRUE),
  ('student', 'Campus & Graduate', 'student', 'Academic & Early Career', 'Campus-forward hero with University crest, GPA badge, capstone & hackathon projects, and coursework grid.', TRUE),
  ('researcher', 'Academic Researcher', 'researcher', 'Publications & Science', 'High-credibility two-column publication layout with ORCID badges, citations, and one-click BibTeX copy.', TRUE),
  ('designer', 'Designer Editorial', 'designer', 'Creative & Visual', 'Visual-first editorial masonry layout with typography swatches, design tokens, and deep-dive case studies.', TRUE),
  ('freelancer', 'Freelancer & Consultant', 'freelancer', 'Consultancy & Client Work', 'High-conversion client layout with availability status, pricing packages, verified ROI metrics, and booking form.', TRUE),
  ('founder', 'Startup Founder', 'founder', 'Venture & Pitch Deck', 'Investor memo & pitch deck aesthetic with live traction KPI dials ($ARR, MAU, Capital Raised) and roadmap.', TRUE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category;

-- ------------------------------------------------------------------------------
-- 3. PORTFOLIO DEPLOYMENTS TABLE (Tracks User-Owned Vercel Deployments)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_deployments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES public.portfolio_templates(id),
  vercel_project_id TEXT,
  vercel_project_name TEXT NOT NULL,
  deployment_url TEXT,
  deployment_id TEXT,
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Unpublished')),
  deployed_at TIMESTAMPTZ,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_deployments_user ON public.portfolio_deployments(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_deployments_resume ON public.portfolio_deployments(resume_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_deployments_status ON public.portfolio_deployments(status);

-- ------------------------------------------------------------------------------
-- 4. GITHUB CONNECTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.github_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  github_username TEXT NOT NULL,
  access_token TEXT,
  avatar_url TEXT,
  profile_url TEXT,
  bio TEXT,
  public_repos_count INTEGER DEFAULT 0,
  total_stars_count INTEGER DEFAULT 0,
  total_forks_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  top_languages JSONB DEFAULT '[]'::jsonb,
  developer_scores JSONB DEFAULT '{
    "compositeScore": 0,
    "projectQualityScore": 0,
    "openSourceScore": 0,
    "activityScore": 0,
    "tier": "Emerging Developer"
  }'::jsonb,
  synced_repositories JSONB DEFAULT '[]'::jsonb,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_github_connections_user ON public.github_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_github_connections_username ON public.github_connections(github_username);

-- ------------------------------------------------------------------------------
-- 5. LINKEDIN CONNECTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.linkedin_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  linkedin_url TEXT,
  full_name TEXT NOT NULL,
  headline TEXT,
  summary TEXT,
  avatar_url TEXT,
  location TEXT,
  connections_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  experience JSONB DEFAULT '[]'::jsonb,
  education JSONB DEFAULT '[]'::jsonb,
  skills JSONB DEFAULT '[]'::jsonb,
  certifications JSONB DEFAULT '[]'::jsonb,
  projects JSONB DEFAULT '[]'::jsonb,
  raw_payload JSONB DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_linkedin_connections_user ON public.linkedin_connections(user_id);

-- ------------------------------------------------------------------------------
-- 6. PORTFOLIO PROJECTS TABLE (Portfolio-Enhanced Project Showcase)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT NOT NULL,
  architecture_narrative TEXT,
  technologies TEXT[] DEFAULT '{}',
  live_url TEXT,
  github_url TEXT,
  preview_image_url TEXT,
  github_repo_id BIGINT,
  github_stars INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT TRUE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user ON public.portfolio_projects(user_id, order_index ASC);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_resume ON public.portfolio_projects(resume_id);

-- ------------------------------------------------------------------------------
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.portfolio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Templates: readable by all authenticated and anonymous users
CREATE POLICY "Public read for portfolio templates"
  ON public.portfolio_templates FOR SELECT
  USING (is_active = TRUE);

-- Deployments Policies
CREATE POLICY "Users manage own portfolio deployments"
  ON public.portfolio_deployments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- GitHub Connections Policies
CREATE POLICY "Users manage own github connection"
  ON public.github_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- LinkedIn Connections Policies
CREATE POLICY "Users manage own linkedin connection"
  ON public.linkedin_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Portfolio Projects Policies
CREATE POLICY "Users manage own portfolio projects"
  ON public.portfolio_projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Updated_at triggers
CREATE TRIGGER set_portfolio_deployments_updated_at
  BEFORE UPDATE ON public.portfolio_deployments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_github_connections_updated_at
  BEFORE UPDATE ON public.github_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_linkedin_connections_updated_at
  BEFORE UPDATE ON public.linkedin_connections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_portfolio_projects_updated_at
  BEFORE UPDATE ON public.portfolio_projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
