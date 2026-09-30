# Novus Resume AI

> **The AI-powered career platform for modern professionals.** Build ATS-optimized resumes, ace your next interview, publish stunning portfolio sites, and accelerate your career with Gemini AI — all in one place.

[![Version](https://img.shields.io/badge/version-1.1.1-indigo.svg)](https://github.com/akhiljonnada1803-arch/NovusResumeBuilder/releases/tag/v1.1.1)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black.svg)](https://nextjs.org)
[![CI](https://github.com/akhiljonnada1803-arch/NovusResumeBuilder/actions/workflows/ci.yml/badge.svg)](https://github.com/akhiljonnada1803-arch/NovusResumeBuilder/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-27%20passing-brightgreen.svg)](#testing)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

---

## What's New in v1.1.1

> **v1.1.1** is a quality-hardening patch on top of v1.1.0. It ships a rebuilt PDF export engine, Microsoft Word export, a Page Margin Studio, and a full automated quality gate to prevent regressions.

### ✅ What's Live in v1.1.x

#### 🎤 Interview Suite
- **Voice Interview Coach** — Real-time speech-to-text analysis, filler word detection, confidence scoring, and STAR methodology evaluation
- **Video Interview Studio** — AI-powered posture, eye contact, and facial engagement metrics via MediaPipe
- **Chat Interview Simulator** — Conversational text-based AI interview with multi-turn context
- **Question Bank Studio** — 60+ curated questions across 6 categories (Technical, Behavioral, System Design, Project, Leadership, HR) with difficulty tags, company tags, bookmarks, and Flashcard mode
- **BYOK Key Manager** — Bring-your-own Gemini/OpenAI API key stored client-side with obfuscated encryption
- **⌘K Command Palette** — Global fuzzy-search navigation across all pages and actions
- **4D Radar Scoring** — Real-time visual scoring across Confidence, Clarity, Technical Depth, and Communication
- **AI Persona System** — Choose your interviewer style: Google, FAANG, Startup, or Consulting

#### 📄 Resume Builder (v1.0 + v1.1.1 Improvements)
- **26 ATS-Optimized Templates** — Professional, creative, engineering, student, and premium showcase templates
- **Rebuilt PDF Export Engine** — `html2canvas` + `jsPDF` pipeline with transform-safe canvas capture
- **Microsoft Word (.docx) Export** — Full ATS-compliant `.docx` generation via the `docx` library
- **Page Margin Studio** — Compact, Normal, Spacious, and Custom (mm) margin presets
- **Iframe Print Strategy** — Isolated vector print bypassing all layout transform clipping
- **WYSIWYG Resume Editor** — Real-time preview with live zoom, section reordering, and auto-save
- **Profile Photo System** — Upload, crop, and position photos with shape/border/shadow controls
- **Resume Versioning** — Auto-save snapshots with version history and one-click rollback
- **Multi-Resume Management** — Duplicate, delete, rename, and switch templates across resumes

#### 🤖 AI Features (Powered by Gemini)
- **AI Bullet Enhancer** — STAR-method rewriter with quantifiable business impact metrics
- **AI Cover Letter Generator** — Tailored 4-paragraph letters from your resume + target JD
- **AI Career Intelligence Dashboard** — 6-dimension skill radar, salary benchmarks, and 6-month growth trajectory
- **AI Resume Import** — PDF & Word (.docx) neural parser with confidence scoring and manual correction

#### 🌐 Portfolio & Hosting
- **10 Distinct Portfolio Themes** — Silicon Valley Founder, Apple Engineer, GitHub Developer, Interactive Timeline, Product Showcase, AI Engineer, Cyberpunk Terminal, Designer Portfolio, Executive Professional, 3D Interactive
- **Multi-Tenant Subdomain Hosting** — `username.novusresume.ai` subdomains via edge routing
- **Custom Domain Support** — CNAME & TXT DNS ownership verification
- **Recruiter Analytics** — 14-day traffic telemetry, geo breakdown, and PDF download conversion rates

#### 🔗 Integrations
- **GitHub Integration** — Repository fetcher, README analyzer, and 5-tier skill extractor
- **LinkedIn Import** — PDF and text export parser for experiences, education, and skills
- **ATS Match Scanner** — JD parser, keyword gap radar, ATS score calculation, and 1-click bullet optimizer

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.3.3 (App Router, Turbopack) |
| Language | TypeScript 5 (strict) |
| UI | React 19, Tailwind CSS v4, Framer Motion |
| AI | Google Gemini 2.0 Flash (`@google/genai`) |
| Database | Supabase (PostgreSQL + Row Level Security) |
| Auth | Supabase SSR (`@supabase/ssr`) |
| State | Zustand 5 |
| Rate Limiting | Upstash Redis + in-memory fallback |
| PDF Export | jsPDF + html2canvas |
| Word Export | docx (Microsoft OOXML) |
| DOCX Parsing | mammoth |
| PDF Parsing | unpdf |
| Desktop | Tauri v2 (Windows, macOS, Linux) |
| Testing | Vitest + happy-dom |

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

## Testing

The project ships a comprehensive automated test suite powered by **Vitest** and **happy-dom**.

```bash
# Run all tests once
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Coverage

| Test Suite | File | Coverage |
|-----------|------|---------|
| PDF Export Engine | `src/lib/__tests__/pdf-export.test.ts` | `html2canvas` canvas rendering + iframe print |
| Word (.docx) Export | `src/lib/__tests__/docx-export.test.ts` | Full `.docx` binary compilation |
| ATS Analyzer | `src/lib/__tests__/ats-analyzer.test.ts` | Keyword matching, scoring, recommendations |
| Feature Flags | `src/lib/__tests__/features.test.ts` | Flag defaults & env overrides |
| Rate Limiting | `src/lib/__tests__/rate-limit.test.ts` | Sliding window & in-memory fallback |
| Import Validator | `src/lib/__tests__/validator.test.ts` | Resume schema validation edge cases |

**27 tests across 6 suites — all passing.**

### Pre-Release Gate

Before tagging a release, run the full quality gate:

```bash
node scripts/pre-release-check.js 1.2.0
```

This script validates:
1. ✅ `package.json` version matches the target tag
2. ✅ TypeScript strict check passes (`tsc --noEmit`)
3. ✅ All Vitest tests pass

---

## CI/CD Pipeline

Every push to `main` and every pull request triggers the [GitHub Actions CI pipeline](./.github/workflows/ci.yml) which runs:

| Job | What It Checks |
|-----|---------------|
| `typescript-and-build` | TypeScript strict type-check + Next.js production build |
| `rust-check` | `cargo check` + `cargo clippy` on the Tauri desktop backend |
| `unit-tests` | Vitest test suite across all 6 test files |
| `lint` | ESLint with `eslint-config-next` rules |

> **No merge to `main` is possible if any CI job fails.** This prevents the class of bugs that shipped in v1.1.0 (broken PDF canvas, Rust compile errors) from ever reaching a release tag again.

---

## Deployment

### Vercel (Recommended)

1. Push to GitHub and import the repository in [Vercel](https://vercel.com)
2. Set all environment variables from `.env.example` in your Vercel project settings
3. Deploy — the build compiles **76 routes** with zero errors

**Required Vercel environment variables:**

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GEMINI_API_KEY
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Desktop App (Tauri v2)

```bash
# Development
npm run tauri:dev

# Production build (current platform)
npm run tauri:build

# Platform-specific builds
npm run tauri:build:win    # Windows NSIS + MSI
npm run tauri:build:mac    # macOS DMG + .app
npm run tauri:build:linux  # Linux DEB + AppImage
```

---

## Feature Flags

v1.1+ interview features are **enabled by default**. Future roadmap features are shipped behind `NEXT_PUBLIC_FEATURE_*` environment flags and default to `false`.

```env
# v1.2 — Identity Hub (off by default, set to true to preview)
NEXT_PUBLIC_FEATURE_LINKEDIN_LIVE_SYNC=true
NEXT_PUBLIC_FEATURE_GITHUB_WEBHOOK=true
NEXT_PUBLIC_FEATURE_EMAIL_REPORTS=true
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
│   ├── api/                # API route handlers (50+ routes)
│   ├── builder/            # Resume editor [id]
│   └── p/                  # Public portfolio routes [id]
├── components/             # React components
│   ├── builder/            # Resume editor sections & controls
│   ├── interview/          # Voice, Video, Chat, QuestionBank studio
│   ├── portfolio/          # 10 portfolio theme layouts
│   ├── shared/             # Common UI & ErrorBoundary
│   └── ui/                 # Design system primitives
├── lib/                    # Business logic & utilities
│   ├── __tests__/          # Vitest test suites (6 files, 27 tests)
│   ├── pdf-export.ts       # html2canvas + jsPDF pipeline
│   ├── docx-export.ts      # Microsoft Word generation engine
│   ├── ats-analyzer.ts     # Deep ATS scoring engine
│   ├── features.ts         # Feature flag registry
│   ├── rate-limit.ts       # Upstash rate limiting
│   └── logger.ts           # Structured JSON logger
├── modules/
│   └── interview/          # Interview engine, question bank, scoring
├── store/                  # Zustand state stores
├── templates/              # 26 resume template renderers
└── types/                  # TypeScript type definitions
```

---

## Roadmap

| Version | Status | Highlights |
|---------|--------|-----------|
| **v1.0.0** | 🟢 Released | Resume builder, PDF export, 10 portfolio themes, ATS scanner, AI suite, GitHub & LinkedIn import |
| **v1.1.0** | 🟢 Released | Voice interview coaching, video interview studio, chat simulator, BYOK key manager, ⌘K palette |
| **v1.1.1** | 🟢 Released | PDF engine rebuild, Word (.docx) export, Page Margin Studio, CI quality gate, 27 automated tests |
| **v1.2.0** | 🔵 Planned | AI-generated questions from resume, post-session PDF scorecard, session replay/history |
| **v1.3.0** | 🔵 Planned | Live LinkedIn OAuth sync, GitHub webhook auto-sync, monthly career report emails |
| **v2.0.0** | 🔵 Planned | Multi-seat enterprise workspace, recruiter candidate pipeline, Stripe billing |
| **v3.0.0** | 🔵 Planned | Tauri desktop binaries (Windows, macOS, Linux), iOS & Android apps via Expo |

---

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

**Branch naming convention:**

```
feature/v1.2-<feature-name>    # New features targeting a specific version
fix/<issue-description>        # Bug fixes
docs/<description>             # Documentation only
```

**Branching model:**
- `main` — always production-stable and deployable; protected by CI
- `develop` — integration branch for ongoing work
- `feature/*` — individual feature branches (merged to develop, then main on release)

---

## License

[MIT](./LICENSE) — Copyright © 2026 Novus Resume AI
