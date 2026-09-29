-- ==============================================================================
-- NOVUS RESUME AI - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Production-Ready Scalable Relational Database with Row-Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. USERS / PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  job_title TEXT,
  avatar_url TEXT,
  vercel_access_token TEXT,
  github_username TEXT,
  linkedin_url TEXT,
  portfolio_settings JSONB DEFAULT '{
    "defaultTemplate": "developer",
    "autoSyncGithub": false,
    "showPoweredBy": false
  }'::jsonb,
  plan TEXT DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

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
-- 3. RESUMES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Resume',
  slug TEXT,
  target_role TEXT,
  ats_score INTEGER DEFAULT 0,
  personal_info JSONB DEFAULT '{
    "fullName": "",
    "jobTitle": "",
    "email": "",
    "phone": "",
    "location": "",
    "website": "",
    "linkedin": "",
    "github": "",
    "summary": ""
  }'::jsonb,
  design JSONB DEFAULT '{
    "template": "modern",
    "accentColor": "#4f46e5",
    "fontFamily": "Inter",
    "fontSize": "base",
    "spacing": "normal",
    "showIcons": true,
    "showSectionDividers": true
  }'::jsonb,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resume Indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON public.resumes(updated_at DESC);

-- ------------------------------------------------------------------------------
-- 4. PORTFOLIO DEPLOYMENTS TABLE (Tracks User-Owned Vercel Deployments)
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
-- 5. GITHUB CONNECTIONS TABLE
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
-- 6. LINKEDIN CONNECTIONS TABLE
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
-- 7. PORTFOLIO PROJECTS TABLE (Portfolio-Enhanced Project Showcase)
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
-- 8. EDUCATION TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  gpa TEXT,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_education_resume_id ON public.education(resume_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 9. EXPERIENCE TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.experience (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  position TEXT NOT NULL,
  location TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT DEFAULT '',
  highlights TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_experience_resume_id ON public.experience(resume_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 10. PROJECTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subtitle TEXT,
  live_url TEXT,
  github_url TEXT,
  start_date TEXT,
  end_date TEXT,
  description TEXT NOT NULL DEFAULT '',
  technologies TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_resume_id ON public.projects(resume_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 11. SKILLS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  category TEXT DEFAULT 'Technical' CHECK (category IN ('Technical', 'Languages', 'Frameworks', 'Tools', 'Soft Skills', 'Other')),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_skills_resume_id ON public.skills(resume_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 12. CERTIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date TEXT NOT NULL,
  expiry_date TEXT,
  credential_id TEXT,
  credential_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certifications_resume_id ON public.certifications(resume_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 13. ACHIEVEMENTS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issuer TEXT,
  date TEXT,
  description TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_achievements_resume_id ON public.achievements(resume_id, order_index ASC);

-- ------------------------------------------------------------------------------
-- 14. RESUME HISTORY / SNAPSHOTS TABLE (Version Control & Rollback)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.resume_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  change_summary TEXT DEFAULT 'Auto-save snapshot',
  snapshot_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resume_history_resume ON public.resume_history(resume_id, created_at DESC);

-- ------------------------------------------------------------------------------
-- 15. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_history ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Templates Policies
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

-- Resumes Policies
CREATE POLICY "Users can view their own resumes"
  ON public.resumes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
  ON public.resumes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
  ON public.resumes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
  ON public.resumes FOR DELETE
  USING (auth.uid() = user_id);

-- Child Relational Tables Policies (Using resume ownership check)
CREATE POLICY "Users can manage education for own resumes"
  ON public.education FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = education.resume_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage experience for own resumes"
  ON public.experience FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = experience.resume_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage projects for own resumes"
  ON public.projects FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = projects.resume_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage skills for own resumes"
  ON public.skills FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = skills.resume_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage certifications for own resumes"
  ON public.certifications FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = certifications.resume_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage achievements for own resumes"
  ON public.achievements FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = achievements.resume_id AND user_id = auth.uid()));

CREATE POLICY "Users can manage resume history for own resumes"
  ON public.resume_history FOR ALL
  USING (EXISTS (SELECT 1 FROM public.resumes WHERE id = resume_history.resume_id AND user_id = auth.uid()));

-- ------------------------------------------------------------------------------
-- 16. AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 17. AUTOMATIC UPDATED_AT TIMESTAMP TRIGGERS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
