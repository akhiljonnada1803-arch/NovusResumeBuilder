import { Resume } from "@/types/resume";
import { PortfolioTheme, PortfolioSectionConfig, PortfolioCustomizationSettings } from "@/types/portfolio";
import { DeploymentLogEntry, VercelDeploymentResult } from "@/types/vercel-deploy";

/**
 * Validates a user's personal Vercel Access Token against Vercel REST API
 */
export async function validateVercelToken(token: string): Promise<{
  valid: boolean;
  user?: { id: string; username: string; email: string; name: string; avatar: string };
  error?: string;
}> {
  const cleanToken = token.trim();
  if (!cleanToken || cleanToken.length < 10) {
    return { valid: false, error: "Please enter a valid Vercel Access Token." };
  }

  try {
    const res = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      return {
        valid: true,
        user: {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          name: data.user.name || data.user.username,
          avatar: data.user.avatar ? `https://vercel.com/api/www/avatar/${data.user.avatar}` : "",
        },
      };
    }

    if (res.status === 403 || res.status === 401) {
      return { valid: false, error: "Invalid or expired Vercel Access Token." };
    }

    return { valid: false, error: `Vercel API error (${res.status}): ${res.statusText}` };
  } catch (err: any) {
    return { valid: false, error: err.message || "Network error validating token." };
  }
}

function escapeHtml(str?: string): string {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Fix #4: Caps a string to a maximum length to prevent unbounded HTML output in generated portfolios.
 */
function cap(str?: string, max = 500): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "\u2026" : str;
}

/**
 * Synthesizes a standalone, zero-dependency static HTML/CSS/JS bundle tailored for the selected template.
 */
export function synthesizeStaticPortfolioHTML(
  resume: Resume,
  theme: PortfolioTheme = "developer",
  sections: PortfolioSectionConfig[] = [],
  customization?: PortfolioCustomizationSettings
): string {
  const pi = resume.personalInfo || { fullName: "Candidate", jobTitle: "Professional" };

  let rawFullName = (customization?.headlineOverride?.trim() || pi.fullName || "Candidate").trim();
  // Fix broken letter spacing from PDF kerning (e.g. "JONNADA AKHI L" -> "JONNADA AKHIL", "SA I" -> "SAI")
  rawFullName = rawFullName.replace(/\b([A-Za-z]{2,})\s+([A-Za-z])\b/g, "$1$2");
  const safeFullName = escapeHtml(rawFullName);

  let rawJobTitle = (customization?.taglineOverride?.trim() || pi.jobTitle || "").trim();
  const lowerTitle = rawJobTitle.toLowerCase();
  const isInvalidTitle =
    !rawJobTitle ||
    lowerTitle.includes("github") ||
    lowerTitle.includes("linkedin") ||
    lowerTitle.includes("portfolio") ||
    lowerTitle.includes("leetcode") ||
    lowerTitle.includes("hackerrank") ||
    lowerTitle.includes("codechef") ||
    lowerTitle.includes("http") ||
    lowerTitle.includes("@");

  if (isInvalidTitle) {
    rawJobTitle =
      resume.targetRole?.trim() ||
      resume.experience?.[0]?.position?.trim() ||
      "AI / Software Engineer";
  }
  const safeJobTitle = escapeHtml(rawJobTitle);

  let rawSummary = (customization?.bioOverride?.trim() || pi.summary || "").trim();
  if (!rawSummary) {
    const topSkills = (resume.skills || []).map((s) => s.name).filter(Boolean).slice(0, 5).join(", ");
    if (topSkills) {
      rawSummary = `Engineer specialized in architecting scalable systems, deep learning pipelines, and modern web applications with ${topSkills}.`;
    } else {
      rawSummary = `Engineer passionate about building robust architectures, distributed web applications, and intelligent systems.`;
    }
  }
  const safeSummary = escapeHtml(rawSummary);
  const safeLocation = escapeHtml(pi.location || "Global / Remote");
  const safeEmail = escapeHtml(pi.email || "");
  const safeGithub = escapeHtml(pi.github || "");
  const safeLinkedin = escapeHtml(pi.linkedin || "");
  const safeWebsite = escapeHtml(pi.website || "");

  const experience = resume.experience || [];
  const education = resume.education || [];
  const skills = resume.skills || [];
  const projects = resume.projects || [];

  if (theme === "student") {
    const primaryEdu = education[0] || { institution: "University", degree: "Bachelor of Computer Science", gpa: "3.85 / 4.0", endDate: "2025", fieldOfStudy: "Computer Science & Engineering" };
    const safeInstitution = escapeHtml(primaryEdu.institution || "University");
    const safeDegree = escapeHtml(primaryEdu.degree || "Computer Science");
    const safeField = escapeHtml(primaryEdu.fieldOfStudy || "Engineering");
    const safeEndDate = escapeHtml(primaryEdu.endDate || "2025");
    const safeGpa = escapeHtml(primaryEdu.gpa || "3.85 / 4.0");

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFullName} • Campus &amp; Capstone Portfolio</title>
  <meta name="description" content="${safeSummary}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070b14;
      --card-bg: #0f172a;
      --card-border: rgba(59, 130, 246, 0.25);
      --primary: #3b82f6;
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); background-image: radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.12), transparent 35%), radial-gradient(circle at 85% 25%, rgba(99, 102, 241, 0.1), transparent 35%); color: var(--text); line-height: 1.6; padding-bottom: 5rem; }
    .container { max-width: 1120px; margin: 0 auto; padding: 0 1.5rem; }
    
    header { position: sticky; top: 0; z-index: 50; backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); background: rgba(7, 11, 20, 0.85); border-bottom: 1px solid rgba(59, 130, 246, 0.2); padding: 0.9rem 0; }
    .nav-inner { display: flex; justify-content: space-between; align-items: center; }
    .nav-brand { font-weight: 800; font-size: 1.15rem; color: #fff; display: flex; align-items: center; gap: 0.6rem; text-decoration: none; }
    .brand-icon { width: 32px; height: 32px; border-radius: 10px; background: linear-gradient(135deg, #2563eb, #4f46e5); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
    .nav-links { display: flex; gap: 1.5rem; align-items: center; }
    @media (max-width: 768px) { .nav-links { display: none; } }
    .nav-link { color: #94a3b8; text-decoration: none; font-size: 0.875rem; font-weight: 500; transition: color 0.2s; }
    .nav-link:hover { color: #fff; }
    .nav-btn { font-size: 0.8rem; font-weight: 700; padding: 0.5rem 1.25rem; border-radius: 9999px; background: #2563eb; color: #fff; text-decoration: none; transition: all 0.2s; }
    .nav-btn:hover { background: #1d4ed8; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4); }

    .hero { padding: 4rem 0 3rem; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 2.5rem; align-items: center; }
    @media (max-width: 860px) { .hero { grid-template-columns: 1fr; } }
    .badge { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'JetBrains Mono', monospace; font-size: 0.725rem; font-weight: 700; padding: 0.4rem 1rem; border-radius: 9999px; background: rgba(59, 130, 246, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); color: #60a5fa; margin-bottom: 1.5rem; }
    h1 { font-size: clamp(2.6rem, 6vw, 4.5rem); font-weight: 900; line-height: 1.08; margin-bottom: 1.25rem; color: #fff; }
    .gradient-text { background: linear-gradient(135deg, #60a5fa 0%, #93c5fd 50%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-bio { font-size: 1.05rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 2rem; word-break: break-word; }
    .hero-ctas { display: flex; gap: 0.85rem; flex-wrap: wrap; }
    .btn-primary { background: #2563eb; color: #fff; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.2s; }
    .btn-primary:hover { background: #1d4ed8; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35); }
    .btn-secondary { background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.12); padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.2s; }
    .btn-secondary:hover { background: rgba(255,255,255,0.12); transform: translateY(-2px); }

    .edu-card { background: linear-gradient(135deg, #0f1a36, #0a1024); border: 1px solid rgba(59, 130, 246, 0.3); border-radius: 1.25rem; padding: 1.75rem; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
    .edu-title { font-size: 1.25rem; font-weight: 800; color: #fff; margin-bottom: 0.25rem; }
    .edu-details { font-size: 0.9rem; color: #60a5fa; margin-bottom: 1.25rem; }
    .edu-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
    .stat-box { background: rgba(7, 11, 20, 0.6); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 0.75rem; padding: 0.75rem; }
    .stat-label { font-size: 0.65rem; font-family: 'JetBrains Mono', monospace; color: #94a3b8; text-transform: uppercase; }
    .stat-val { font-size: 1.25rem; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: #fff; }

    .section-title { font-size: 1.75rem; font-weight: 900; margin: 4rem 0 1.5rem; display: flex; align-items: center; gap: 0.6rem; color: #fff; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; }
    .card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 1.25rem; padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between; transition: all 0.3s; word-break: break-word; overflow-wrap: anywhere; }
    .card:hover { border-color: rgba(59, 130, 246, 0.6); transform: translateY(-4px); box-shadow: 0 12px 30px rgba(59, 130, 246, 0.15); }
    .card-num { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; color: #60a5fa; background: rgba(59, 130, 246, 0.15); padding: 0.2rem 0.6rem; border-radius: 0.4rem; display: inline-block; margin-bottom: 0.75rem; }
    .card h3 { font-size: 1.2rem; font-weight: 800; color: #fff; margin-bottom: 0.6rem; }
    .card p { font-size: 0.875rem; color: var(--text-muted); margin-bottom: 1.25rem; line-height: 1.6; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1.25rem; }
    .tag { font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; font-weight: 600; padding: 0.25rem 0.65rem; border-radius: 0.5rem; background: rgba(59, 130, 246, 0.12); border: 1px solid rgba(59, 130, 246, 0.25); color: #93c5fd; }
    .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 1rem; font-size: 0.85rem; }
    .card-link { color: #60a5fa; font-weight: 700; text-decoration: none; }
    .card-link:hover { text-decoration: underline; }

    .skills-grid { display: flex; flex-wrap: wrap; gap: 0.6rem; }
    .skill-pill { font-size: 0.85rem; font-weight: 600; padding: 0.5rem 1.1rem; border-radius: 0.75rem; background: rgba(15, 23, 42, 0.8); border: 1px solid rgba(59, 130, 246, 0.25); color: #e2e8f0; }

    .cta-box { margin-top: 4rem; padding: 3rem 2rem; background: linear-gradient(135deg, rgba(37, 99, 235, 0.2), rgba(79, 70, 229, 0.2)); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 1.5rem; text-align: center; }
    .cta-box h2 { font-size: 2rem; font-weight: 900; color: #fff; margin-bottom: 0.75rem; }
    .cta-box p { font-size: 0.95rem; color: #cbd5e1; max-width: 540px; margin: 0 auto 1.5rem; }

    footer { text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 2.5rem; margin-top: 4rem; font-size: 0.8rem; color: #64748b; font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <header>
    <div class="container nav-inner">
      <a href="#" class="nav-brand">
        <div class="brand-icon">🎓</div>
        <span>${safeFullName}</span>
      </a>
      <div class="nav-links">
        <a href="#about" class="nav-link">About</a>
        <a href="#projects" class="nav-link">Capstone Projects</a>
        <a href="#skills" class="nav-link">Skills</a>
        ${safeEmail ? `<a href="mailto:${safeEmail}" class="nav-btn">Contact Student</a>` : ""}
      </div>
    </div>
  </header>

  <main class="container">
    <section id="about" class="hero">
      <div>
        <div class="badge">🎓 CLASS OF ${safeEndDate} • SEEKING FULL-TIME &amp; INTERNSHIPS</div>
        <h1>Learn. Build.<br><span class="gradient-text">Innovate.</span><br>Excel.</h1>
        <p class="hero-bio">${safeSummary}</p>
        <div class="hero-ctas">
          <a href="#projects" class="btn-primary">View Capstone Projects</a>
          ${safeGithub ? `<a href="${safeGithub}" target="_blank" class="btn-secondary">GitHub Repos</a>` : ""}
        </div>
      </div>

      <div class="edu-card">
        <div class="edu-title">${safeInstitution}</div>
        <div class="edu-details">${safeDegree} &bull; ${safeField}</div>
        <div class="edu-stats">
          <div class="stat-box">
            <div class="stat-label">Cumulative GPA</div>
            <div class="stat-val">${safeGpa}</div>
          </div>
          <div class="stat-box">
            <div class="stat-label">Graduation</div>
            <div class="stat-val">${safeEndDate}</div>
          </div>
        </div>
      </div>
    </section>

    <h2 id="projects" class="section-title">🚀 Capstone &amp; Flagship Projects</h2>
    <div class="grid">
      ${projects.map((p, idx) => `
      <div class="card">
        <div>
          <span class="card-num">PROJECT 0${idx + 1}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(cap(p.description, 400))}</p>
        </div>
        <div>
          <div class="tags">
            ${(p.technologies || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
          </div>
          <div class="card-footer">
            ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" class="card-link">Launch Demo &rarr;</a>` : `<span style="color:#64748b; font-size:0.75rem;">Academic Build</span>`}
            ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" class="card-link">Source Code</a>` : ""}
          </div>
        </div>
      </div>
      `).join("")}
    </div>

    ${skills.length > 0 ? `
    <h2 id="skills" class="section-title">⚡ Technical Competencies</h2>
    <div class="skills-grid">
      ${skills.map((s) => `<div class="skill-pill">${escapeHtml(s.name)}</div>`).join("")}
    </div>
    ` : ""}

    <div class="cta-box">
      <h2>Looking for verified credentials?</h2>
      <p>Download my official verified ATS-friendly student resume containing coursework and academic achievements.</p>
      ${safeEmail ? `<a href="mailto:${safeEmail}" class="btn-primary">Email Student</a>` : ""}
    </div>

    <footer>
      <p>© ${new Date().getFullYear()} ${safeFullName} &bull; Synthesized via Novus Resume AI</p>
    </footer>
  </main>
</body>
</html>`;
  }

  if (theme === "researcher") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFullName} • Scholarly Research Profile</title>
  <meta name="description" content="${safeSummary}">
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,600;0,6..72,700;1,6..72,400&family=JetBrains+Mono:wght@400;500;700&family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Newsreader', Georgia, serif; background: #0d1117; color: #f0f6fc; line-height: 1.7; padding: 3rem 1.5rem; }
    .container { max-width: 860px; margin: 0 auto; }
    .header { border-bottom: 1px solid #30363d; padding-bottom: 2rem; margin-bottom: 2.5rem; }
    .label { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #818cf8; letter-spacing: 0.08em; }
    h1 { font-size: 3.2rem; font-weight: 700; line-height: 1.1; margin: 0.5rem 0; color: #ffffff; }
    .meta { font-family: 'Inter', sans-serif; font-size: 1rem; color: #8b949e; font-weight: 500; margin-bottom: 1.5rem; }
    .abstract { background: #161b22; border: 1px solid #30363d; border-left: 4px solid #6366f1; border-radius: 0.75rem; padding: 1.5rem 1.75rem; margin: 1.5rem 0; font-style: italic; color: #e6edf3; font-size: 1.05rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); word-break: break-word; }
    .social-links { display: flex; gap: 0.75rem; font-family: 'Inter', sans-serif; font-size: 0.8rem; margin-top: 1.25rem; flex-wrap: wrap; }
    .social-btn { padding: 0.45rem 1rem; border-radius: 0.5rem; background: #21262d; border: 1px solid #30363d; color: #f0f6fc; text-decoration: none; font-weight: 600; transition: all 0.2s; }
    .social-btn:hover { background: #6366f1; color: #ffffff; border-color: #6366f1; }

    h2 { font-size: 1.75rem; font-weight: 700; margin: 3rem 0 1.25rem; color: #ffffff; border-bottom: 1px solid #30363d; padding-bottom: 0.5rem; }
    .pub-card { background: #161b22; border: 1px solid #30363d; border-radius: 0.75rem; padding: 1.5rem; margin-bottom: 1.25rem; word-break: break-word; overflow-wrap: anywhere; }
    .pub-card h3 { font-size: 1.25rem; font-weight: 700; margin-bottom: 0.4rem; color: #ffffff; }
    .pub-card p { font-family: 'Inter', sans-serif; font-size: 0.875rem; color: #8b949e; line-height: 1.6; margin-bottom: 0.75rem; }
    .pub-tags { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .pub-tag { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; padding: 0.2rem 0.5rem; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 0.35rem; color: #a5b4fc; }
    footer { font-family: 'JetBrains Mono', monospace; text-align: center; margin-top: 5rem; padding-top: 2rem; border-top: 1px solid #30363d; font-size: 0.75rem; color: #6e7681; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="label">SCHOLARLY PROFILE // PEER-REVIEWED RESEARCH</span>
      <h1>${safeFullName}</h1>
      <p class="meta">${safeJobTitle} &bull; ${safeLocation}</p>
      <div class="abstract">&ldquo;${safeSummary}&rdquo;</div>
      <div class="social-links">
        ${safeEmail ? `<a href="mailto:${safeEmail}" class="social-btn">Email Scholar</a>` : ""}
        ${safeGithub ? `<a href="${safeGithub}" target="_blank" class="social-btn">GitHub</a>` : ""}
        ${safeLinkedin ? `<a href="${safeLinkedin}" target="_blank" class="social-btn">LinkedIn</a>` : ""}
      </div>
    </div>

    <h2>Selected Publications &amp; Preprints</h2>
    ${projects.map((p, idx) => `
    <div class="pub-card">
      <span style="font-family:'JetBrains Mono', monospace; font-size:0.75rem; color:#818cf8; font-weight:700;">[${idx + 1}] PREPRINT // ARTIFACT</span>
      <h3 style="margin-top:0.3rem;">${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(cap(p.description, 400))}</p>
      <div class="pub-tags">
        ${(p.technologies || []).map((t) => `<span class="pub-tag">${escapeHtml(t)}</span>`).join("")}
      </div>
    </div>
    `).join("")}

    <footer>
      <span>Published via User-Owned Vercel Account &bull; Novus Resume AI</span>
    </footer>
  </div>
</body>
</html>`;
  }

  if (theme === "designer") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFullName} • Product Design &amp; Interaction Craft</title>
  <meta name="description" content="${safeSummary}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #09090b; color: #f4f4f5; line-height: 1.6; padding: 3rem 1.5rem; background-image: radial-gradient(circle at 50% 0%, rgba(244,63,94,0.15), transparent 45%); }
    .container { max-width: 1080px; margin: 0 auto; }
    .tagline { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; color: #f43f5e; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; }
    h1 { font-size: clamp(2.8rem, 7vw, 4.8rem); font-weight: 900; line-height: 1.05; margin: 1rem 0; letter-spacing: -0.02em; color: #fff; }
    .bio { font-size: 1.2rem; color: #a1a1aa; max-width: 680px; margin-bottom: 2rem; line-height: 1.6; word-break: break-word; }
    .actions { display: flex; gap: 0.85rem; flex-wrap: wrap; margin-bottom: 4rem; }
    .btn { padding: 0.8rem 1.6rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; text-decoration: none; transition: all 0.2s; }
    .btn-rose { background: #f43f5e; color: #fff; }
    .btn-rose:hover { background: #e11d48; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(244,63,94,0.4); }
    .btn-dark { background: #18181b; border: 1px solid #27272a; color: #fff; }
    .btn-dark:hover { background: #27272a; transform: translateY(-2px); }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.75rem; margin-bottom: 4rem; }
    .case-card { background: #18181b; border: 1px solid #27272a; border-radius: 1.5rem; padding: 1.75rem; transition: all 0.3s; display: flex; flex-direction: column; justify-content: space-between; word-break: break-word; overflow-wrap: anywhere; }
    .case-card:hover { border-color: rgba(244,63,94,0.5); transform: translateY(-4px); box-shadow: 0 12px 30px rgba(244,63,94,0.15); }
    .case-badge { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #f43f5e; font-weight: 700; margin-bottom: 0.5rem; display: inline-block; }
    .case-card h3 { font-size: 1.35rem; font-weight: 800; margin-bottom: 0.6rem; color: #fff; }
    .case-card p { font-size: 0.875rem; color: #a1a1aa; margin-bottom: 1.25rem; line-height: 1.6; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag { font-size: 0.75rem; font-family: 'JetBrains Mono', monospace; padding: 0.25rem 0.65rem; border-radius: 0.5rem; background: #27272a; color: #f43f5e; font-weight: 600; }
    footer { text-align: center; margin-top: 5rem; font-size: 0.8rem; color: #71717a; font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 4rem;">
      <span class="tagline">PRODUCT DESIGN &amp; INTERACTION ENGINEERING</span>
      <h1>${safeFullName}</h1>
      <p class="bio">${safeSummary}</p>
      <div class="actions">
        ${safeEmail ? `<a href="mailto:${safeEmail}" class="btn btn-rose">Book Design Review</a>` : ""}
        ${safeGithub ? `<a href="${safeGithub}" target="_blank" class="btn btn-dark">Explore Code</a>` : ""}
      </div>
    </div>

    <h2 style="font-size: 1.75rem; font-weight: 900; margin-bottom: 1.5rem; color: #fff;">Selected Case Studies</h2>
    <div class="grid">
      ${projects.map((p, idx) => `
      <div class="case-card">
        <div>
          <span class="case-badge">CASE 0${idx + 1}</span>
          <h3>${escapeHtml(p.title)}</h3>
          <p>${escapeHtml(cap(p.description, 400))}</p>
        </div>
        <div class="tags">
          ${(p.technologies || []).map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}
        </div>
      </div>
      `).join("")}
    </div>

    <footer>
      <span>Hosted on User Vercel Account &bull; Novus Resume AI</span>
    </footer>
  </div>
</body>
</html>`;
  }

  if (theme === "freelancer") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFullName} • Independent Technical Consultant</title>
  <meta name="description" content="${safeSummary}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #0c0a17; color: #f1f5f9; line-height: 1.6; padding: 3rem 1.5rem; background-image: radial-gradient(circle at 50% 0%, rgba(147, 51, 234, 0.18), transparent 45%); }
    .container { max-width: 1080px; margin: 0 auto; }
    .status-badge { display: inline-flex; align-items: center; gap: 0.5rem; font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; padding: 0.4rem 1rem; border-radius: 9999px; background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; margin-bottom: 1.25rem; }
    .pulse { width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px #10b981; }
    h1 { font-size: clamp(2.8rem, 7vw, 4.5rem); font-weight: 900; line-height: 1.08; margin-bottom: 0.5rem; color: #fff; }
    .role { font-size: 1.25rem; color: #c084fc; font-weight: 700; margin-bottom: 1rem; }
    .bio { font-size: 1.05rem; color: #94a3b8; max-width: 680px; margin-bottom: 2rem; word-break: break-word; }
    .btn { display: inline-block; padding: 0.8rem 1.75rem; border-radius: 0.75rem; background: #9333ea; color: #ffffff; font-weight: 700; text-decoration: none; font-size: 0.9rem; transition: all 0.2s; }
    .btn:hover { background: #7e22ce; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(147, 51, 234, 0.4); }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; margin-top: 2rem; margin-bottom: 4rem; }
    .card { background: #141024; border: 1px solid rgba(168,85,247,0.25); border-radius: 1.25rem; padding: 1.75rem; word-break: break-word; overflow-wrap: anywhere; transition: all 0.3s; }
    .card:hover { border-color: rgba(168,85,247,0.6); transform: translateY(-3px); }
    .card h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 0.6rem; color: #ffffff; }
    .card p { font-size: 0.875rem; color: #cbd5e1; line-height: 1.6; }
    footer { text-align: center; margin-top: 5rem; font-size: 0.8rem; color: #64748b; font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div style="margin-bottom: 3.5rem;">
      <div class="status-badge"><span class="pulse"></span> AVAILABLE FOR CONTRACT &amp; FRACTIONAL ROLES</div>
      <h1>${safeFullName}</h1>
      <p class="role">${safeJobTitle}</p>
      <p class="bio">${safeSummary}</p>
      ${safeEmail ? `<a href="mailto:${safeEmail}" class="btn">Hire / Request Engagement</a>` : ""}
    </div>

    <h2 style="font-size: 1.75rem; font-weight: 800; color: #fff;">Client Case Studies &amp; Product Builds</h2>
    <div class="grid">
      ${projects.map((p) => `
      <div class="card">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(cap(p.description, 400))}</p>
      </div>
      `).join("")}
    </div>

    <footer>
      <span>Deployed to User Vercel Account &bull; Novus Resume AI</span>
    </footer>
  </div>
</body>
</html>`;
  }

  if (theme === "founder") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFullName} • Venture Executive Memorandum</title>
  <meta name="description" content="${safeSummary}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: #080c14; color: #f1f5f9; line-height: 1.6; padding: 3rem 1.5rem; background-image: radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15), transparent 45%); }
    .container { max-width: 1080px; margin: 0 auto; }
    .badge { font-family: 'JetBrains Mono', monospace; font-size: 0.75rem; font-weight: 700; padding: 0.35rem 0.9rem; border-radius: 9999px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.3); color: #fbbf24; display: inline-block; margin-bottom: 1.25rem; }
    h1 { font-size: clamp(2.8rem, 7vw, 4.5rem); font-weight: 900; line-height: 1.08; margin-bottom: 0.5rem; color: #fff; }
    .role { font-size: 1.2rem; color: #fbbf24; font-weight: 700; margin-bottom: 0.75rem; }
    .bio { font-size: 1.05rem; color: #94a3b8; max-width: 680px; margin-bottom: 2.5rem; word-break: break-word; }

    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 3.5rem; }
    .kpi-card { background: #0f1422; border: 1px solid rgba(245,158,11,0.25); border-radius: 1rem; padding: 1.5rem; }
    .kpi-val { font-family: 'JetBrains Mono', monospace; font-size: 2.2rem; font-weight: 900; color: #fbbf24; }
    .kpi-label { font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-top: 0.25rem; }

    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem; }
    .card { background: #0f1422; border: 1px solid rgba(245,158,11,0.2); border-radius: 1.25rem; padding: 1.75rem; word-break: break-word; overflow-wrap: anywhere; }
    .card h3 { font-size: 1.25rem; font-weight: 800; margin-bottom: 0.6rem; color: #ffffff; }
    .card p { font-size: 0.875rem; color: #cbd5e1; line-height: 1.6; }
    footer { text-align: center; margin-top: 5rem; font-size: 0.8rem; color: #64748b; font-family: 'JetBrains Mono', monospace; }
  </style>
</head>
<body>
  <div class="container">
    <div class="badge">VENTURE MEMORANDUM // EXECUTIVE LEADERSHIP</div>
    <h1>${safeFullName}</h1>
    <p class="role">${safeJobTitle}</p>
    <p class="bio">${safeSummary}</p>

    <div class="kpi-grid">
      <div class="kpi-card"><div class="kpi-val">${projects.length}</div><div class="kpi-label">Ventures &amp; Systems</div></div>
      <div class="kpi-card"><div class="kpi-val">${experience.length}</div><div class="kpi-label">Executive Roles</div></div>
      <div class="kpi-card"><div class="kpi-val">${skills.length}+</div><div class="kpi-label">Core Technologies</div></div>
      <div class="kpi-card"><div class="kpi-val">${education.length > 0 ? escapeHtml(education[0].endDate || "Grad.") : "Active"}</div><div class="kpi-label">Track Record</div></div>
    </div>

    <h2 style="font-size: 1.75rem; font-weight: 800; margin-bottom: 1.5rem; color: #fff;">Ventures &amp; Product Initiatives</h2>
    <div class="grid">
      ${projects.map((p) => `
      <div class="card">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(cap(p.description, 400))}</p>
      </div>
      `).join("")}
    </div>

    <footer>
      <span>Vercel Edge Deployment &bull; Novus Resume AI</span>
    </footer>
  </div>
</body>
</html>`;
  }

  // ==========================================
  // Premium Modern Developer & AI Engineer Template (Matching User Reference)
  // ==========================================
  const badgeRole = safeJobTitle.toUpperCase().includes("STUDENT") || safeJobTitle.toUpperCase().includes("ENGINEER")
    ? `${safeJobTitle.toUpperCase()} | FULL STACK DEVELOPER | PROBLEM SOLVER`
    : `AI & ML ENGINEERING SPECIALIST | FULL STACK DEVELOPER | PROBLEM SOLVER`;

  // Tilted photo or fallback monochrome engineer silhouette
  const photoSrc = pi.photoUrl || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23131722"/><stop offset="100%" stop-color="%23090c15"/></linearGradient><linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%2360a5fa"/><stop offset="100%" stop-color="%23a855f7"/></linearGradient></defs><rect width="600" height="700" fill="url(%23bg)"/><circle cx="300" cy="240" r="110" fill="%23242b3d"/><path d="M150,560 C150,420 220,380 300,380 C380,380 450,420 450,560 Z" fill="%23242b3d"/><circle cx="300" cy="235" r="95" fill="%232f384e"/><path d="M170,560 C170,435 230,400 300,400 C370,400 430,435 430,560 Z" fill="%232f384e"/><rect x="180" y="600" width="240" height="8" rx="4" fill="url(%23accent)"/></svg>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${safeFullName} | AI &amp; Full Stack Engineer Portfolio</title>
  <meta name="description" content="${safeSummary}">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #07090e;
      --card-bg: #0f131d;
      --card-border: rgba(255, 255, 255, 0.08);
      --accent-blue: #38bdf8;
      --accent-gradient: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
      --text: #f8fafc;
      --text-muted: #94a3b8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      background-image: 
        radial-gradient(circle at 15% 15%, rgba(56, 189, 248, 0.08), transparent 35%),
        radial-gradient(circle at 85% 20%, rgba(139, 92, 246, 0.06), transparent 35%);
      color: var(--text);
      line-height: 1.6;
      padding-bottom: 5rem;
    }
    .container { max-width: 1160px; margin: 0 auto; padding: 0 1.5rem; }

    /* Top Navigation Header */
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      background: rgba(7, 9, 14, 0.85);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      padding: 1rem 0;
    }
    .nav-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .nav-brand {
      font-size: 1.25rem;
      font-weight: 800;
      color: #ffffff;
      text-decoration: none;
      letter-spacing: -0.02em;
    }
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1.75rem;
    }
    @media (max-width: 820px) {
      .nav-menu { display: none; }
    }
    .nav-link {
      font-size: 0.9rem;
      font-weight: 500;
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.2s;
    }
    .nav-link:hover { color: #ffffff; }
    .resume-pill {
      font-size: 0.85rem;
      font-weight: 700;
      padding: 0.45rem 1.25rem;
      border-radius: 9999px;
      background: #7dd3fc;
      color: #0c1527;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-block;
    }
    .resume-pill:hover {
      background: #38bdf8;
      transform: translateY(-1px);
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.35);
    }

    /* Hero Section */
    .hero {
      padding: 4.5rem 0 3.5rem;
      display: grid;
      grid-template-columns: 1.2fr 0.9fr;
      gap: 3.5rem;
      align-items: center;
    }
    @media (max-width: 960px) {
      .hero { grid-template-columns: 1fr; gap: 2.5rem; padding: 2.5rem 0; }
    }

    .hero-capsule {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.725rem;
      font-weight: 700;
      padding: 0.45rem 1rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      margin-bottom: 2rem;
      letter-spacing: 0.04em;
    }

    .hero-heading {
      font-size: clamp(3rem, 7vw, 5.2rem);
      font-weight: 900;
      line-height: 1.05;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin-bottom: 1.75rem;
    }
    .gradient-text {
      background: linear-gradient(135deg, #7dd3fc 0%, #93c5fd 60%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-description {
      font-size: 1.05rem;
      color: #94a3b8;
      line-height: 1.7;
      max-width: 600px;
      margin-bottom: 2.25rem;
      word-break: break-word;
      overflow-wrap: anywhere;
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .btn-blue {
      background: #0284c7;
      color: #ffffff;
      padding: 0.8rem 1.6rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
    }
    .btn-blue:hover {
      background: #0369a1;
      transform: translateY(-2px);
      box-shadow: 0 10px 25px rgba(2, 132, 199, 0.4);
    }
    .btn-dark {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #ffffff;
      padding: 0.8rem 1.6rem;
      border-radius: 0.75rem;
      font-weight: 700;
      font-size: 0.95rem;
      text-decoration: none;
      transition: all 0.2s;
    }
    .btn-dark:hover {
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-2px);
    }

    /* Tilted Card on Hero Right */
    .hero-image-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
    }
    .angled-frame {
      width: 100%;
      max-width: 380px;
      aspect-ratio: 4 / 4.8;
      background: #111624;
      border-radius: 1.5rem;
      border: 2px solid rgba(255, 255, 255, 0.15);
      transform: rotate(-3deg) perspective(1000px);
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.75), 0 0 30px rgba(56, 189, 248, 0.1);
      overflow: hidden;
      transition: transform 0.4s ease;
    }
    .angled-frame:hover {
      transform: rotate(0deg) scale(1.02);
    }
    .profile-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      filter: grayscale(15%) contrast(105%);
    }

    /* Section Styling */
    section {
      padding: 4rem 0 1rem;
    }
    .section-title-wrap {
      margin-bottom: 2.5rem;
    }
    .section-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      color: #38bdf8;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      display: block;
      margin-bottom: 0.4rem;
    }
    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.02em;
    }

    /* Education Cards */
    .edu-timeline {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .edu-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 1rem;
      transition: border-color 0.2s;
    }
    .edu-card:hover {
      border-color: rgba(56, 189, 248, 0.4);
    }
    .edu-inst {
      font-size: 1.3rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.35rem;
    }
    .edu-deg {
      font-size: 1rem;
      color: #38bdf8;
      font-weight: 600;
      margin-bottom: 0.5rem;
    }
    .edu-badge {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.8rem;
      padding: 0.35rem 0.85rem;
      border-radius: 9999px;
      background: rgba(56, 189, 248, 0.12);
      border: 1px solid rgba(56, 189, 248, 0.3);
      color: #7dd3fc;
      font-weight: 700;
    }

    /* Skills Grid */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }
    .skill-cat-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 1.75rem;
    }
    .skill-cat-card h3 {
      font-size: 1.15rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .skill-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-pill {
      font-size: 0.85rem;
      font-weight: 600;
      padding: 0.35rem 0.85rem;
      border-radius: 0.6rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      transition: all 0.2s;
    }
    .skill-pill:hover {
      background: rgba(56, 189, 248, 0.15);
      border-color: rgba(56, 189, 248, 0.35);
      color: #7dd3fc;
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 1.75rem;
    }
    .project-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1.25rem;
      padding: 1.75rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.3s ease;
      word-break: break-word;
      overflow-wrap: anywhere;
    }
    .project-card:hover {
      border-color: rgba(56, 189, 248, 0.5);
      transform: translateY(-4px);
      box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5), 0 0 25px rgba(56, 189, 248, 0.1);
    }
    .proj-title {
      font-size: 1.35rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.75rem;
    }
    .proj-desc {
      font-size: 0.9rem;
      color: #94a3b8;
      line-height: 1.65;
      margin-bottom: 1.5rem;
    }
    .proj-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-bottom: 1.5rem;
    }
    .proj-tag {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.725rem;
      font-weight: 600;
      padding: 0.25rem 0.65rem;
      border-radius: 0.4rem;
      background: rgba(56, 189, 248, 0.08);
      border: 1px solid rgba(56, 189, 248, 0.2);
      color: #7dd3fc;
    }
    .proj-actions {
      display: flex;
      gap: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 1rem;
    }
    .proj-link {
      font-size: 0.85rem;
      font-weight: 700;
      color: #38bdf8;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
    }
    .proj-link:hover { text-decoration: underline; }

    /* Profiles Grid */
    .profiles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .profile-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 1rem;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .profile-card:hover {
      border-color: rgba(56, 189, 248, 0.4);
      transform: translateY(-2px);
      background: rgba(15, 19, 29, 0.9);
    }
    .profile-card h4 {
      font-size: 1.1rem;
      font-weight: 800;
      color: #ffffff;
    }
    .profile-card span {
      font-size: 0.8rem;
      color: #38bdf8;
      font-weight: 600;
    }

    /* Contact Card */
    .contact-card {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 19, 29, 0.9) 100%);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 1.5rem;
      padding: 3rem 2rem;
      text-align: center;
    }
    .contact-card h2 {
      font-size: 2.2rem;
      font-weight: 900;
      margin-bottom: 0.75rem;
      color: #ffffff;
    }
    .contact-card p {
      font-size: 1rem;
      color: #94a3b8;
      max-width: 540px;
      margin: 0 auto 2rem;
    }

    /* Footer */
    footer {
      text-align: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 3rem;
      font-size: 0.85rem;
      color: #64748b;
    }
  </style>
</head>
<body>
  <!-- Fixed Navbar -->
  <header>
    <div class="container nav-inner">
      <a href="#" class="nav-brand">${safeFullName}</a>
      <nav class="nav-menu">
        <a href="#about" class="nav-link">About</a>
        <a href="#education" class="nav-link">Education</a>
        <a href="#skills" class="nav-link">Skills</a>
        <a href="#projects" class="nav-link">Projects</a>
        <a href="#profiles" class="nav-link">Profiles</a>
        <a href="#contact" class="nav-link">Contact</a>
      </nav>
      <a href="#contact" class="resume-pill">Resume</a>
    </div>
  </header>

  <main class="container">
    <!-- Hero Section -->
    <section class="hero" id="about">
      <div>
        <div class="hero-capsule">
          <span>📍</span>
          <span>${escapeHtml(badgeRole)}</span>
        </div>

        <h1 class="hero-heading">
          Code. Train.<br>
          <span class="gradient-text">Optimize.</span><br>
          Repeat.
        </h1>

        <p class="hero-description">${safeSummary}</p>

        <div class="hero-actions">
          <a href="#projects" class="btn-blue">View Projects &rarr;</a>
          <a href="#contact" class="btn-dark">Let's Talk</a>
        </div>
      </div>

      <!-- Right Side Angled Frame -->
      <div class="hero-image-wrapper">
        <div class="angled-frame">
          <img src="${photoSrc}" alt="${safeFullName}" class="profile-img" />
        </div>
      </div>
    </section>

    <!-- Education Section -->
    ${education.length > 0 ? `
    <section id="education">
      <div class="section-title-wrap">
        <span class="section-tag">Academics &amp; Foundations</span>
        <h2 class="section-title">Education</h2>
      </div>

      <div class="edu-timeline">
        ${education.map((edu) => `
        <div class="edu-card">
          <div>
            <div class="edu-inst">${escapeHtml(edu.institution)}</div>
            <div class="edu-deg">${escapeHtml(edu.degree || edu.fieldOfStudy || "Engineering Graduate")}</div>
            <p style="font-size:0.875rem; color:#94a3b8;">${escapeHtml(edu.description || "")}</p>
          </div>
          <div class="edu-badge">${escapeHtml(edu.startDate)} &mdash; ${escapeHtml(edu.endDate || "Present")}${edu.gpa ? ` &bull; GPA: ${escapeHtml(edu.gpa)}` : ""}</div>
        </div>
        `).join("")}
      </div>
    </section>
    ` : ""}

    <!-- Skills Section -->
    ${skills.length > 0 ? `
    <section id="skills">
      <div class="section-title-wrap">
        <span class="section-tag">Expertise &amp; Tooling</span>
        <h2 class="section-title">Technical Skills</h2>
      </div>

      <div class="skills-grid">
        <div class="skill-cat-card">
          <h3>⚡ Core Technologies &amp; Frameworks</h3>
          <div class="skill-pills">
            ${skills.map((s) => `<span class="skill-pill">${escapeHtml(s.name)}</span>`).join("")}
          </div>
        </div>
      </div>
    </section>
    ` : ""}

    <!-- Projects Section -->
    <section id="projects">
      <div class="section-title-wrap">
        <span class="section-tag">Engineering Showcase</span>
        <h2 class="section-title">Featured Projects</h2>
      </div>

      <div class="projects-grid">
        ${projects.map((p) => `
        <div class="project-card">
          <div>
            <div class="proj-title">${escapeHtml(p.title)}</div>
            <div class="proj-desc">${escapeHtml(cap(p.description, 400))}</div>
          </div>
          <div>
            <div class="proj-tags">
              ${(p.technologies || []).map((t) => `<span class="proj-tag">${escapeHtml(t)}</span>`).join("")}
            </div>
            <div class="proj-actions">
              ${p.liveUrl ? `<a href="${p.liveUrl}" target="_blank" rel="noreferrer" class="proj-link">Live Demo &rarr;</a>` : ""}
              ${p.githubUrl ? `<a href="${p.githubUrl}" target="_blank" rel="noreferrer" class="proj-link">Source Code &rarr;</a>` : `<a href="#contact" class="proj-link">View Overview &rarr;</a>`}
            </div>
          </div>
        </div>
        `).join("")}
      </div>
    </section>

    <!-- Profiles Section -->
    <section id="profiles">
      <div class="section-title-wrap">
        <span class="section-tag">Online Presence</span>
        <h2 class="section-title">Coding &amp; Professional Profiles</h2>
      </div>

      <div class="profiles-grid">
        ${safeGithub ? `
        <a href="${safeGithub}" target="_blank" rel="noreferrer" class="profile-card">
          <h4>GitHub</h4>
          <span>${safeGithub.replace(/^https?:\/\//, "")} &rarr;</span>
        </a>` : ""}

        ${safeLinkedin ? `
        <a href="${safeLinkedin}" target="_blank" rel="noreferrer" class="profile-card">
          <h4>LinkedIn</h4>
          <span>Connect Professionally &rarr;</span>
        </a>` : ""}

        ${safeWebsite ? `
        <a href="${safeWebsite}" target="_blank" rel="noreferrer" class="profile-card">
          <h4>Personal Website</h4>
          <span>Visit Domain &rarr;</span>
        </a>` : ""}

        ${safeEmail ? `
        <a href="mailto:${safeEmail}" class="profile-card">
          <h4>Direct Email</h4>
          <span>${safeEmail} &rarr;</span>
        </a>` : ""}
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact">
      <div class="contact-card">
        <h2>Let's Connect &amp; Collaborate</h2>
        <p>Interested in working together or discussing innovative AI/ML and software engineering challenges? Feel free to reach out.</p>
        ${safeEmail ? `<a href="mailto:${safeEmail}" class="btn-blue">Send Email Message &rarr;</a>` : `<a href="${safeLinkedin || "#"}" class="btn-blue">Connect on LinkedIn &rarr;</a>`}
      </div>
    </section>

    <!-- Footer -->
    <footer>
      <p>&copy; ${new Date().getFullYear()} ${safeFullName}. Built with Novus Resume AI &bull; Hosted on Vercel.</p>
    </footer>
  </main>
</body>
</html>`;
}

/**
 * Creates or links a Vercel project in the user's Vercel account
 */
export async function createOrGetVercelProject(
  token: string,
  projectName: string
): Promise<{ id: string; name: string } | null> {
  const cleanToken = token.trim();
  const cleanName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50);

  try {
    const res = await fetch("https://api.vercel.com/v9/projects", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanName,
        framework: null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return { id: data.id, name: data.name };
    }

    if (res.status === 409) {
      const getRes = await fetch(`https://api.vercel.com/v9/projects/${cleanName}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      if (getRes.ok) {
        const data = await getRes.json();
        return { id: data.id, name: data.name };
      }
    }

    // Fix #7: log the Vercel error response body without echoing the token
    const errText = await res.text().catch(() => "");
    console.warn(`Vercel project API returned ${res.status}:`, errText.slice(0, 300));
  } catch (e: any) {
    console.warn("Vercel project API network error:", e.message);
  }

  return null;
}

/**
 * Deploys static files directly to user's Vercel account
 */
export async function deployToVercel(
  token: string,
  projectName: string,
  htmlContent: string
): Promise<{ url: string; deploymentId: string } | null> {
  const cleanToken = token.trim();
  const cleanName = projectName.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 50);

  try {
    const res = await fetch("https://api.vercel.com/v13/deployments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cleanToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: cleanName,
        files: [
          {
            file: "index.html",
            data: Buffer.from(htmlContent).toString("base64"),
            encoding: "base64",
          },
          {
            file: "robots.txt",
            data: Buffer.from("User-agent: *\nAllow: /").toString("base64"),
            encoding: "base64",
          },
        ],
        projectSettings: {
          framework: null,
        },
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        url: data.url ? `https://${data.url}` : `https://${cleanName}.vercel.app`,
        deploymentId: data.id || `dpl_${Math.random().toString(36).substring(2, 9)}`,
      };
    }

    // Fix #5: read and log the Vercel error body so the caller gets an actionable null
    const errText = await res.text().catch(() => "");
    console.error(`Vercel deployment API returned ${res.status}:`, errText.slice(0, 500));
  } catch (e: any) {
    // Fix #14: log only message — the full error may embed the token in some HTTP client stacks
    console.warn("Vercel deployment API network error:", e.message);
  }

  return null;
}
