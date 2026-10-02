# Novus Resume AI

> Build ATS-optimized resumes, create portfolio websites, prepare for interviews, and accelerate your career with AI.

![Version](https://img.shields.io/badge/version-1.1.1-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Overview

Novus Resume AI is an AI-powered career platform designed to help students, developers, and professionals throughout their job-seeking journey.

Instead of using separate tools for resumes, portfolios, interview preparation, ATS optimization, and career planning, Novus Resume AI brings everything together into a single platform.

The platform combines modern web technologies, AI-powered workflows, and cloud-native architecture to deliver an end-to-end career development experience.

---

## Features

### Resume Builder

- ATS-optimized resume creation
- 26 professional templates
- Real-time editing and preview
- Resume version history
- Profile photo customization
- PDF export
- Microsoft Word (.docx) export
- Auto-save and cloud sync

### AI Resume Enhancement

- AI-powered bullet improvement
- STAR methodology optimization
- Achievement quantification
- Resume content suggestions
- Cover letter generation

### Portfolio Builder

- 10 portfolio themes
- Responsive layouts
- Custom domains
- Public portfolio hosting
- Recruiter analytics
- Project showcase pages

### ATS Scanner

- Job description parsing
- ATS compatibility scoring
- Missing keyword detection
- Resume-job match analysis
- Optimization recommendations

### Interview Coach

#### Voice Interview Mode

- Speech-to-text transcription
- Filler word analysis
- Confidence tracking
- Communication scoring

#### Video Interview Mode

- Eye-contact tracking
- Posture analysis
- Engagement monitoring
- Interview integrity checks

#### Chat Interview Simulator

- Conversational AI interviews
- Multi-turn memory
- Technical and behavioral questions

#### Question Bank

- Technical questions
- Behavioral questions
- System design questions
- Leadership questions
- HR questions
- Flashcard mode

### Career Intelligence

- Skill gap analysis
- Career growth insights
- Personalized recommendations
- Progress tracking

### Integrations

- GitHub profile analysis
- LinkedIn profile import
- Resume import (PDF/DOCX)
- AI-powered profile enrichment

---

## Project Metrics

| Metric | Value |
|----------|---------|
| Resume Templates | 26 |
| Portfolio Themes | 10 |
| API Routes | 50+ |
| Automated Tests | 27 |
| AI Modules | 8+ |
| Database Tables | 20+ |
| Supported Platforms | Web + Desktop |

---

## Architecture

```text
Frontend
├── Next.js 16
├── React 19
├── Tailwind CSS v4
└── Framer Motion

Backend
├── Next.js API Routes
├── Gemini AI
├── Supabase Auth
└── Business Services

Database
└── PostgreSQL (Supabase)

Desktop
└── Tauri v2
```

---

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Framer Motion

### Backend

- Next.js Route Handlers
- Supabase
- PostgreSQL
- Zustand

### AI

- Google Gemini
- Prompt Engineering
- Context-Aware Workflows

### Infrastructure

- Vercel
- Supabase
- Upstash Redis
- GitHub Actions

### Desktop

- Tauri v2
- Rust

---

## Screenshots

### Dashboard

Add dashboard screenshot here

### Resume Builder

Add resume builder screenshot here

### Portfolio Builder

Add portfolio screenshot here

### Interview Coach

Add interview coach screenshot here

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Supabase Project
- Gemini API Key

### Installation

```bash
git clone https://github.com/akhiljonnada1803-arch/NovusResumeBuilder.git

cd NovusResumeBuilder

npm install
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=

NEXT_PUBLIC_APP_URL=
```

### Run Development Server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

## Testing

Run all tests:

```bash
npm test
```

Generate coverage:

```bash
npm run test:coverage
```

Quality checks:

```bash
npm run lint

npm run build
```

---

## CI/CD

GitHub Actions automatically performs:

- TypeScript type checking
- Next.js production build
- ESLint validation
- Vitest test execution
- Rust compile checks

Every pull request must pass all checks before merging.

---

## Why This Project Exists

Most career platforms solve only one problem:

- Resume builders create resumes.
- Portfolio builders create portfolios.
- Interview platforms train interviews.

Novus Resume AI combines all of these into a single AI-powered ecosystem that helps users build, improve, showcase, and communicate their professional experience.

---

## Roadmap

### Current

- Resume Builder
- ATS Scanner
- Portfolio Hosting
- Interview Coach
- Career Intelligence

### Upcoming

- AI-generated interview questions from resume context
- Session replay and history
- PDF interview scorecards
- LinkedIn live synchronization
- GitHub webhook synchronization
- Enterprise workspaces
- Mobile applications

---

## Contributing

Contributions are welcome.

```text
main       → Production stable
develop    → Integration branch

feature/*
fix/*
docs/*
```

Please create a feature branch before opening a pull request.

---

## License

MIT License

Copyright © 2026 Novus Resume AI

---

## Author

**Akhil Jonnada**

B.Tech CSE (AI & ML)

GitHub:
https://github.com/akhiljonnada1803-arch

LinkedIn:
https://www.linkedin.com/in/jonnada-akhil-6a8b5a386
