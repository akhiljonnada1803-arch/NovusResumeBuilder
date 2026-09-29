# Contributing to Novus Resume AI

Thank you for your interest in contributing to **Novus Resume AI**! We welcome contributions from developers, designers, and career advocates of all experience levels.

---

## 📜 Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Local Development Setup](#local-development-setup)
- [Branching Strategy & Commit Guidelines](#branching-strategy--commit-guidelines)
- [Pull Request Workflow](#pull-request-workflow)
- [Style & Quality Guidelines](#style--quality-guidelines)

---

## Code of Conduct
By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please report any unacceptable behavior to `team@novusresume.ai`.

---

## How Can I Contribute?

### 1. Reporting Bugs
- Search existing issues to ensure the bug hasn't already been reported.
- Use our [Bug Report Template](.github/ISSUE_TEMPLATE/bug_report.md).
- Include clear reproduction steps, browser/OS version, and console logs if available.

### 2. Suggesting Enhancements
- Check the [Audit Report & Roadmap](AUDIT_REPORT_AND_ROADMAP.md) to see if the feature is already planned.
- Use our [Feature Request Template](.github/ISSUE_TEMPLATE/feature_request.md).

### 3. Submitting Code Contributions
- Pick an open issue labeled `good first issue` or `help wanted`.
- Follow the pull request process below.

---

## Local Development Setup

1. **Fork and Clone**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/novus-resume-ai.git
   cd novus-resume-ai
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Local Development Server**:
   ```bash
   npm run dev
   ```

4. **Verify TypeScript & Production Build**:
   ```bash
   npm run build
   ```

---

## Branching Strategy & Commit Guidelines

### Branch Naming Conventions
- `feature/description` - New features (e.g. `feature/linkedin-oauth`)
- `fix/issue-description` - Bug fixes (e.g. `fix/pdf-page-cut-off`)
- `docs/description` - Documentation changes (e.g. `docs/setup-guide`)
- `refactor/description` - Code refactoring without behavioral change

### Conventional Commits
We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

---

## Pull Request Workflow

1. Create your branch from `main`:
   ```bash
   git checkout -b feature/my-cool-feature
   ```
2. Make your modifications and ensure `npm run build` succeeds with zero errors.
3. Push your branch to your fork:
   ```bash
   git push origin feature/my-cool-feature
   ```
4. Open a Pull Request on GitHub against `main`.
5. Fill out the [Pull Request Template](.github/PULL_REQUEST_TEMPLATE.md).
6. A maintainer will review your pull request within 24-48 hours.

---

## Style & Quality Guidelines

- **TypeScript**: Ensure all data models have strict types in `src/types/`. Avoid using `any` whenever possible.
- **Styling**: Use Tailwind CSS utilities and theme design tokens. Support both dark and light modes.
- **Resilience**: Every third-party integration (Gemini, Supabase, Vercel, GitHub) must have an offline heuristic fallback so the app continues to operate without API keys.

---

Thank you for helping make Novus Resume AI the best open-source career platform! 🚀
