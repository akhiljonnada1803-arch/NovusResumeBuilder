import JSZip from "jszip";
import {
  RawPortfolioSourceMeta,
  DetectedProjectType,
  ExtractedSocialLinks,
} from "@/types/portfolio-import";

export interface ScrapedPortfolioContent {
  rawText: string;
  sourceMeta: RawPortfolioSourceMeta;
  socialLinks: ExtractedSocialLinks;
  structuredSnippets?: {
    jsonLd?: any[];
    socialLinks?: { type: string; url: string }[];
    pageHeadings?: string[];
    packageData?: any;
    rawJsonFiles?: Record<string, any>;
  };
}

/**
 * Clean malformed HTML by stripping script tags, style blocks, SVG data, and decoding entities.
 * Designed to handle unclosed tags, malformed layouts, and broken DOM trees gracefully.
 */
export function cleanHtmlToText(html: string): {
  cleanText: string;
  pageTitle: string;
  metaDescription: string;
  socialLinks: ExtractedSocialLinks;
  pageHeadings: string[];
  jsonLdSchemas: any[];
  detectedProjectType: DetectedProjectType;
} {
  // Extract Title gracefully
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].trim() : "";

  // Extract Meta Description
  const metaDescMatch =
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const metaDescription = metaDescMatch ? metaDescMatch[1].trim() : "";

  // Extract Social / Contact Links
  const socialLinks: ExtractedSocialLinks = {};
  const linkMatches = html.matchAll(/href=["'](https?:\/\/[^"']+|mailto:[^"']+|tel:[^"']+)["']/gi);
  for (const match of linkMatches) {
    const href = match[1];
    if (href.includes("github.com/")) socialLinks.github = href;
    else if (href.includes("linkedin.com/")) socialLinks.linkedin = href;
    else if (href.includes("twitter.com/") || href.includes("x.com/")) socialLinks.twitter = href;
    else if (href.startsWith("mailto:")) socialLinks.email = href.replace("mailto:", "").trim();
    else if (href.startsWith("tel:")) socialLinks.phone = href.replace("tel:", "").trim();
  }

  // Extract Headings
  const pageHeadings: string[] = [];
  const headingMatches = html.matchAll(/<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/gi);
  for (const match of headingMatches) {
    const headingText = match[1].replace(/<[^>]+>/g, "").trim();
    if (headingText.length > 2 && headingText.length < 150) {
      pageHeadings.push(headingText);
    }
  }

  // Extract JSON-LD structured data
  const jsonLdSchemas: any[] = [];
  const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const parsed = JSON.parse(match[1].trim());
      jsonLdSchemas.push(parsed);
    } catch {
      // Ignore invalid JSON-LD in malformed websites
    }
  }

  // Detect Framework & Project Type
  let detectedProjectType: DetectedProjectType = "Static HTML/CSS/JS Site";
  if (html.includes("__NEXT_DATA__") || html.includes("/_next/")) {
    detectedProjectType = "Next.js Project";
  } else if (html.includes("data-reactroot") || html.includes("react-dom") || html.includes("react")) {
    detectedProjectType = "React Project";
  } else if (html.includes("astro-")) {
    detectedProjectType = "Astro Site";
  } else if (html.includes("data-v-") || html.includes("vue")) {
    detectedProjectType = "Vue / Nuxt Site";
  }

  // Remove scripts, styles, SVGs, base64 images, comments
  let cleaned = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
    .replace(/data:image\/[^;]+;base64,[^\s"']+/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return {
    cleanText: cleaned.slice(0, 16000),
    pageTitle,
    metaDescription,
    socialLinks,
    pageHeadings,
    jsonLdSchemas,
    detectedProjectType,
  };
}

/**
 * Scrapes a live Portfolio URL with timeout and fallback protection for malformed sites.
 */
export async function scrapePortfolioUrl(url: string): Promise<ScrapedPortfolioContent> {
  const targetUrl = url.startsWith("http") ? url : `https://${url}`;

  let html = "";
  try {
    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 NovusResumeAI/1.0",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) {
      throw new Error(`Website returned HTTP status ${res.status}`);
    }

    html = await res.text();
  } catch (err: any) {
    throw new Error(`Failed to fetch portfolio URL: ${err.message || "Network unreachable or timeout"}`);
  }

  const parsed = cleanHtmlToText(html);

  const compositeText = `
PORTFOLIO WEBSITE SOURCE: ${targetUrl}
PAGE TITLE: ${parsed.pageTitle}
META DESCRIPTION: ${parsed.metaDescription}
DETECTED PROJECT TYPE: ${parsed.detectedProjectType}

HEADINGS & SECTIONS:
${parsed.pageHeadings.join(" | ")}

CONTACT & SOCIAL LINKS FOUND:
${Object.entries(parsed.socialLinks)
  .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
  .join("\n")}

PAGE TEXT CONTENT:
${parsed.cleanText}
  `.trim();

  return {
    rawText: compositeText,
    sourceMeta: {
      sourceType: "url",
      sourceIdentifier: targetUrl,
      detectedFramework: parsed.detectedProjectType,
      projectType: parsed.detectedProjectType,
      pageTitle: parsed.pageTitle,
      previewUrl: targetUrl,
      scrapedAt: new Date().toISOString(),
    },
    socialLinks: parsed.socialLinks,
    structuredSnippets: {
      jsonLd: parsed.jsonLdSchemas,
      pageHeadings: parsed.pageHeadings,
    },
  };
}

/**
 * Scrapes a raw HTML/CSS/JS snippet or pasted HTML document.
 */
export function scrapeHtmlSnippet(htmlContent: string, identifier = "Static HTML Site"): ScrapedPortfolioContent {
  const parsed = cleanHtmlToText(htmlContent);

  const compositeText = `
RAW HTML SOURCE: ${identifier}
PAGE TITLE: ${parsed.pageTitle}
META DESCRIPTION: ${parsed.metaDescription}
DETECTED PROJECT TYPE: ${parsed.detectedProjectType}

HEADINGS:
${parsed.pageHeadings.join(" | ")}

CONTACT & SOCIAL LINKS:
${Object.entries(parsed.socialLinks)
  .map(([k, v]) => `${k.toUpperCase()}: ${v}`)
  .join("\n")}

CLEANED BODY TEXT:
${parsed.cleanText}
  `.trim();

  return {
    rawText: compositeText,
    sourceMeta: {
      sourceType: "html_snippet",
      sourceIdentifier: identifier,
      detectedFramework: parsed.detectedProjectType,
      projectType: parsed.detectedProjectType,
      pageTitle: parsed.pageTitle || identifier,
      scrapedAt: new Date().toISOString(),
    },
    socialLinks: parsed.socialLinks,
    structuredSnippets: {
      jsonLd: parsed.jsonLdSchemas,
      pageHeadings: parsed.pageHeadings,
    },
  };
}

/**
 * Scrapes a GitHub repository portfolio codebase (React, Next.js, Static).
 */
export async function scrapeGitHubPortfolioRepo(
  repoInput: string,
  githubToken?: string
): Promise<ScrapedPortfolioContent> {
  let cleanInput = repoInput.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\/$/, "");
  const parts = cleanInput.split("/").filter(Boolean);

  if (parts.length < 2) {
    throw new Error("Invalid GitHub repository identifier. Format must be 'owner/repo' or a full GitHub URL.");
  }

  const owner = parts[0];
  const repo = parts[1];

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "NovusResumeAI-Importer",
  };
  if (githubToken) {
    headers.Authorization = `Bearer ${githubToken}`;
  }

  // 1. Get Repo Details
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
  if (!repoRes.ok) {
    throw new Error(`Failed to access GitHub repository ${owner}/${repo} (${repoRes.status}). Ensure it is public or provide a valid access token.`);
  }
  const repoData = await repoRes.json();

  // 2. Try fetching README.md
  let readmeText = "";
  try {
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
      headers: { ...headers, Accept: "application/vnd.github.raw" },
    });
    if (readmeRes.ok) {
      readmeText = await readmeRes.text();
    }
  } catch (e) {
    console.warn("Could not fetch README:", e);
  }

  // 3. Search tree for portfolio data files
  let extraContent = "";
  let filesScanned = 1;
  let detectedProjectType: DetectedProjectType = "Static HTML/CSS/JS Site";
  const socialLinks: ExtractedSocialLinks = {
    github: `https://github.com/${owner}`,
  };

  try {
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch || "main"}?recursive=1`,
      { headers }
    );

    if (treeRes.ok) {
      const treeData = await treeRes.json();
      const files: { path: string; url: string; size: number }[] = treeData.tree || [];
      filesScanned = files.length;

      const candidatePaths = [
        "package.json",
        "data/projects.json",
        "data/experience.json",
        "data/skills.json",
        "src/data/projects.json",
        "src/data/resume.json",
        "src/data/portfolio.ts",
        "src/data/projects.ts",
        "content/about.md",
        "about.md",
      ];

      const matchedFiles = files.filter((f) =>
        candidatePaths.includes(f.path) ||
        (f.path.startsWith("data/") && f.path.endsWith(".json")) ||
        (f.path.startsWith("content/") && f.path.endsWith(".md"))
      ).slice(0, 10);

      for (const mf of matchedFiles) {
        try {
          const fileRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch || "main"}/${mf.path}`, { headers });
          if (fileRes.ok) {
            const content = await fileRes.text();
            extraContent += `\n\n--- FILE: ${mf.path} ---\n${content.slice(0, 3500)}`;

            if (mf.path === "package.json") {
              try {
                const pkg = JSON.parse(content);
                const deps = { ...pkg.dependencies, ...pkg.devDependencies };
                if (deps["next"]) detectedProjectType = "Next.js Project";
                else if (deps["react"]) detectedProjectType = "React Project";
                else if (deps["astro"]) detectedProjectType = "Astro Site";
                else if (deps["vue"]) detectedProjectType = "Vue / Nuxt Site";
              } catch {}
            }
          }
        } catch {}
      }
    }
  } catch (e) {
    console.warn("Tree scan failed:", e);
  }

  const compositeText = `
GITHUB REPOSITORY PORTFOLIO: https://github.com/${owner}/${repo}
REPO NAME: ${repoData.name}
DESCRIPTION: ${repoData.description || "N/A"}
PRIMARY LANGUAGE: ${repoData.language || "N/A"}
TOPICS: ${(repoData.topics || []).join(", ")}
HOMEPAGE URL: ${repoData.homepage || "N/A"}
DETECTED PROJECT TYPE: ${detectedProjectType}

=== README CONTENT ===
${readmeText.slice(0, 8000)}

=== PROJECT DATA FILES ===
${extraContent.slice(0, 12000)}
  `.trim();

  return {
    rawText: compositeText,
    sourceMeta: {
      sourceType: "github",
      sourceIdentifier: `${owner}/${repo}`,
      detectedFramework: detectedProjectType,
      projectType: detectedProjectType,
      filesScanned,
      pageTitle: repoData.name,
      previewUrl: repoData.homepage || `https://github.com/${owner}/${repo}`,
      scrapedAt: new Date().toISOString(),
    },
    socialLinks,
  };
}

/**
 * Extracts and parses files from an uploaded ZIP archive (React, Next.js, or Static HTML/CSS/JS site).
 */
export async function extractPortfolioFromZip(
  zipBuffer: Buffer,
  fileName: string
): Promise<ScrapedPortfolioContent> {
  const zip = await JSZip.loadAsync(zipBuffer);
  const fileEntries: string[] = [];
  let combinedText = `ZIP ARCHIVE PORTFOLIO: ${fileName}\n\n`;
  let detectedProjectType: DetectedProjectType = "Static HTML/CSS/JS Site";
  let filesScanned = 0;
  const socialLinks: ExtractedSocialLinks = {};

  const validExtensions = [".md", ".mdx", ".json", ".html", ".ts", ".js", ".tsx", ".jsx", ".yml", ".yaml", ".txt"];
  const ignoredPatterns = ["node_modules/", ".git/", ".next/", "dist/", "build/", ".vscode/", "package-lock.json", ".png", ".jpg", ".jpeg", ".svg"];

  const filePromises: Promise<void>[] = [];

  zip.forEach((relativePath, file) => {
    if (file.dir) return;
    filesScanned++;

    const isIgnored = ignoredPatterns.some((pattern) => relativePath.includes(pattern));
    const hasValidExt = validExtensions.some((ext) => relativePath.toLowerCase().endsWith(ext));

    if (!isIgnored && hasValidExt) {
      fileEntries.push(relativePath);

      filePromises.push(
        file.async("text").then((content) => {
          if (relativePath.endsWith("package.json")) {
            try {
              const pkg = JSON.parse(content);
              const deps = { ...pkg.dependencies, ...pkg.devDependencies };
              if (deps["next"]) detectedProjectType = "Next.js Project";
              else if (deps["react"]) detectedProjectType = "React Project";
              else if (deps["astro"]) detectedProjectType = "Astro Site";
              else if (deps["vue"]) detectedProjectType = "Vue / Nuxt Site";
            } catch {}
          }

          if (relativePath.endsWith(".html")) {
            const parsed = cleanHtmlToText(content);
            if (parsed.socialLinks.github) socialLinks.github = parsed.socialLinks.github;
            if (parsed.socialLinks.linkedin) socialLinks.linkedin = parsed.socialLinks.linkedin;
            if (parsed.socialLinks.email) socialLinks.email = parsed.socialLinks.email;
          }

          combinedText += `\n--- FILE: ${relativePath} ---\n${content.slice(0, 3000)}\n`;
        })
      );
    }
  });

  await Promise.all(filePromises);

  if (fileEntries.length === 0) {
    throw new Error("No readable text, markdown, HTML, or JSON files found in the uploaded ZIP archive.");
  }

  return {
    rawText: combinedText.slice(0, 22000),
    sourceMeta: {
      sourceType: "zip",
      sourceIdentifier: fileName,
      detectedFramework: detectedProjectType,
      projectType: detectedProjectType,
      filesScanned,
      pageTitle: fileName.replace(/\.zip$/i, ""),
      scrapedAt: new Date().toISOString(),
    },
    socialLinks,
  };
}
