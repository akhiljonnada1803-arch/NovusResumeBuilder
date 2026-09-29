import { NextRequest, NextResponse } from "next/server";
import {
  scrapePortfolioUrl,
  scrapeGitHubPortfolioRepo,
  extractPortfolioFromZip,
  scrapeHtmlSnippet,
} from "@/lib/import/portfolio-scraper";
import { parsePortfolioWithAI } from "@/lib/import/portfolio-ai-parser";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let scrapedContent: any = null;

    let userApiKey = req.headers.get("x-gemini-api-key") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const formKey = formData.get("apiKey") as string | null;
      if (formKey) userApiKey = formKey;

      if (!file) {
        return NextResponse.json({ error: "No ZIP file uploaded." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const fileName = file.name || "portfolio.zip";

      if (!fileName.toLowerCase().endsWith(".zip")) {
        return NextResponse.json(
          { error: "Invalid file format. Please upload a .zip archive of your portfolio codebase." },
          { status: 400 }
        );
      }

      scrapedContent = await extractPortfolioFromZip(buffer, fileName);
    } else {
      const body = await req.json();
      const { sourceType, url, repo, githubToken, htmlContent, pageTitle, apiKey } = body;
      if (apiKey) userApiKey = apiKey;

      if (sourceType === "url") {
        if (!url || typeof url !== "string" || url.trim().length < 4) {
          return NextResponse.json({ error: "Please enter a valid website URL." }, { status: 400 });
        }
        scrapedContent = await scrapePortfolioUrl(url.trim());
      } else if (sourceType === "github") {
        if (!repo || typeof repo !== "string" || repo.trim().length < 3) {
          return NextResponse.json(
            { error: "Please provide a valid GitHub repository ('owner/repo' or URL)." },
            { status: 400 }
          );
        }
        scrapedContent = await scrapeGitHubPortfolioRepo(repo.trim(), githubToken);
      } else if (sourceType === "html_snippet") {
        if (!htmlContent || typeof htmlContent !== "string" || htmlContent.trim().length < 10) {
          return NextResponse.json(
            { error: "Please provide valid HTML content to analyze." },
            { status: 400 }
          );
        }
        scrapedContent = scrapeHtmlSnippet(htmlContent.trim(), pageTitle || "Static HTML Portfolio");
      } else {
        return NextResponse.json(
          { error: "Invalid import sourceType. Expected 'url', 'github', 'html_snippet', or multipart ZIP." },
          { status: 400 }
        );
      }
    }

    if (!scrapedContent || !scrapedContent.rawText || scrapedContent.rawText.length < 15) {
      return NextResponse.json(
        { error: "Failed to extract sufficient content from the provided portfolio source." },
        { status: 400 }
      );
    }

    // Parse structured entity with zero-hallucination Gemini AI & Validator
    const extractedData = await parsePortfolioWithAI(scrapedContent, userApiKey);

    return NextResponse.json({
      success: true,
      data: extractedData,
    });
  } catch (error: any) {
    console.error("Portfolio Import API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process portfolio import." },
      { status: 500 }
    );
  }
}
