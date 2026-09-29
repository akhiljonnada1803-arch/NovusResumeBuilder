# Novus Resume AI

> **The AI-powered career platform for modern professionals.** Build ATS-optimized resumes, publish stunning portfolio sites, and accelerate your career with Gemini AI — all in one place.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/akhiljonnada1803-arch/NovusResumeBuilder/releases/tag/v1.0.0)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black.svg)](https://nextjs.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/akhiljonnada1803-arch/NovusResumeBuilder/actions)

---

## What's in v1.0.0

Everything listed here is **live and fully working** in the current release.

### Resume Builder
- **WYSIWYG Resume Editor** — Real-time preview with live zoom and section reordering
- **High-Fidelity PDF Export** — Client-side rendering with vector typography and print CSS
- **8 Professional Templates** — ATS Modern, Classic Executive, Minimalist Dual, Corporate Leadership, Tech/Developer, Designer Minimal, Single-Page Dense, Academic CV
- **Resume Versioning** — Auto-save snapshots with version history and one-click rollback
- **Multi-Resume Management** — Duplicate, delete, rename, and switch templates across multiple resumes

### AI Features (Powered by Gemini 1.5 Flash)
- **AI Bullet Enhancer** — STAR-method rewriter with quantifiable business impact metrics
- **AI Cover Letter Generator** — Tailored 4-paragraph letters from your resume + target JD
- **AI Interview Coach** — Role-based question generator with live STAR answer evaluation and scoring
- **AI Career Intelligence Dashboard** — 6-dimension skill radar, salary benchmarks, and 6-month growth trajectory
- **AI Resume Import** — PDF & Word (.docx) neural parser with confidence scoring and manual correction

### Portfolio & Hosting
- **10 Distinct Portfolio Themes** — Silicon Valley Founder, Apple Engineer, GitHub Developer, Interactive Timeline, Product Showcase, AI Engineer, Cyberpunk Terminal, Designer Portfolio, Executive Professional, 3D Interactive
- **20 Modular Sections** — Drag-and-drop ordering and visibility toggles across all themes
- **Multi-Tenant Subdomain Hosting** — `username.novusresume.ai` subdomains via edge routing
- **Custom Domain Support** — CNAME & TXT DNS ownership verification
- **Recruiter Analytics** — 14-day traffic telemetry, geo breakdown, and PDF download conversion rates

### Integrations
- **GitHub Integration** — Repository fetcher, README analyzer, and 5-tier skill extractor
- **LinkedIn Import** — PDF and text export parser for experiences, education, and skills
- **ATS Match Scanner** — JD parser, keyword gap radar, ATS score calculation, and 1-click bullet optimizer

### Platform
- **Supabase Authentication** — Email/password, OAuth (Google + GitHub), password reset, SSR session persistence
- **Rate Limiting** — Upstash Redis sliding window with in-memory fallback
- **Security** — CSP, HSTS, X-Frame-Options, RLS on all database tables
- **Health Check** — `/api/health` endpoint probing all subsystems
- **Structured Logging** — Datadog/CloudWatch compatible JSON logger with PII scrubbing

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3.3 (App Router, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4 |
| AI | Google Gemini 1.5 Flash (`@google/genai`) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase SSR (`@supabase/ssr`) |
| State | Zustand 5 |
| Rate Limiting | Upstash Redis + in-memory fallback |
| PDF Export | jsPDF + html2canvas |
| DOCX Parsing | mammoth |
| PDF Parsing | unpdf |
| Animations | Framer Motion |

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key

### 1. Clone & Install

```bash
git clone https://github.com/akhiljonnada1803-arch/NovusResumeBuilder.git
cd NovusResumeBuilder
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials. Required keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GEMINI_API_KEY=your-gemini-api-key
```

See [`.env.example`](./.env.example) for all available options including optional Upstash Redis, Sentry, and feature flags.

### 3. Run Database Migrations

In your Supabase SQL editor, run the migrations in order:

```
supabase/migrations/20260830000000_phase_a_schema.sql
supabase/migrations/20260901000000_portfolio_import.sql
supabase/migrations/20260902000000_sync_architecture.sql
supabase/migrations/20260903000000_career_analytics.sql
supabase/migrations/20261001000000_interview_sessions.sql
supabase/migrations/20261002000000_interview_scorecards.sql
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub and import the repository in [Vercel](https://vercel.com)
2. Set all environment variables from `.env.example` in your Vercel project settings
3. Deploy — the build compiles 72 routes with zero errors

**Required Vercel environment variables:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Docker / Cloud Run

The app outputs a standard Next.js standalone build compatible with any Node.js container runtime.

---

## Feature Flags

Future version features are shipped behind `NEXT_PUBLIC_FEATURE_*` environment flags. All flags default to `false` in v1.0.

To preview an upcoming feature locally, set the corresponding flag to `true` in `.env.local`:

```env
# Unlock v1.1 Interview Suite (Voice + Video interview pages)
NEXT_PUBLIC_FEATURE_VOICE_INTERVIEW=true
NEXT_PUBLIC_FEATURE_VIDEO_INTERVIEW=true
```

See [`src/lib/features.ts`](./src/lib/features.ts) for the full flag registry.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, signup, password reset
│   ├── (dashboard)/        # All authenticated app pages
│   ├── (marketing)/        # Landing page, templates gallery
│   ├── api/                # API route handlers (15 route groups)
│   ├── builder/            # Resume editor [id]
│   └── p/                  # Public portfolio routes [id]
├── components/             # React components
│   ├── builder/            # Resume editor sections
│   ├── portfolio/          # 10 portfolio theme layouts
│   ├── shared/             # Common UI primitives
│   └── ui/                 # Design system components
├── lib/                    # Business logic & utilities
│   ├── features.ts         # Feature flag registry
│   ├── rate-limit.ts       # Upstash rate limiting
│   ├── logger.ts           # Structured JSON logger
│   ├── ats/                # ATS scoring engine
│   ├── gemini/             # Gemini AI client wrappers
│   ├── import/             # Resume PDF/DOCX parser
│   ├── portfolio/          # Multi-tenant hosting engine
│   └── supabase/           # Auth & DB clients
├── store/                  # Zustand state stores
├── templates/              # Resume template renderers
└── types/                  # TypeScript type definitions
```

---

## Roadmap

This project follows a structured version release plan. Features under development live on dedicated `feature/*` branches and are merged to `main` when production-ready.

| Version | Status | Highlights |
|---------|--------|-----------|
| **v1.0.0** | ✅ Released | Resume builder, PDF export, 10 portfolio themes, ATS scanner, AI suite, GitHub & LinkedIn import |
| **v1.1.0** | 🔨 In Development | Voice interview coaching, video interview studio with AI facial analysis, session history persistence |
| **v1.2.0** | 📋 Planned | Live LinkedIn OAuth sync, GitHub webhook auto-sync, monthly career report emails, custom domain SSL automation |
| **v2.0.0** | 📋 Planned | Multi-seat enterprise workspace, recruiter candidate pipeline, Stripe billing |
| **v3.0.0** | 📋 Planned | Tauri desktop binaries (Windows, macOS, Linux), iOS & Android apps via Expo |

See [the full release plan](./AUDIT_REPORT_AND_ROADMAP.md) for detailed feature breakdowns per version.

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

**Branch naming convention:**

```
feature/v1.1-<feature-name>    # New features targeting a specific version
fix/<issue-description>        # Bug fixes
docs/<description>             # Documentation only
```

**Branching model:**
- `main` — always production-stable and deployable
- `develop` — integration branch for ongoing work
- `feature/*` — individual feature branches (merged to develop, then main on release)

---

## License

[MIT](./LICENSE) — Copyright © 2026 Novus Resume AI
