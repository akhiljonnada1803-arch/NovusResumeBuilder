import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkRateLimit, RATE_LIMIT_TIERS, createRateLimitResponse } from "@/lib/rate-limit";
import { logger } from "@/lib/logger";
import { captureAIFailure, captureException } from "@/lib/monitoring/sentry";

export const runtime = "nodejs";

const SYSTEM_PROMPTS = {
  improve_bullet: `You are an elite Silicon Valley executive resume coach and ATS optimization specialist.
Your task is to rewrite a resume bullet point to make it high-impact, concise, professional, and quantifiable.
Follow these strict rules:
1. Start with a strong power action verb (e.g. Spearheaded, Architected, Engineered, Orchestrated, Streamlined).
2. Quantify results with metrics (percentages, numbers, latency reduction, dollar savings, or scale like "2M+ users").
3. Include high-frequency ATS technical keywords relevant to the target role.
4. Keep the output to 1-2 punchy lines.
5. Return 3 distinct variations labeled:
[Option 1 - Metric Focused]
[Option 2 - Leadership & Scale]
[Option 3 - Technical & ATS Keyword Rich]`,

  rewrite_project: `You are an expert technical resume writer.
Rewrite the provided project description for a tech resume.
Follow these strict rules:
1. Highlight system architecture, core engineering challenge solved, and performance outcomes.
2. Mention the primary tech stack cleanly.
3. Keep it ATS compliant, concise, and impactful (2-3 sentences max).
4. Provide 2 distinct variations.`,

  generate_achievement: `You are an expert resume writer specializing in honors, awards, and major milestones.
Generate 2 compelling, quantifiable achievement statements based on the provided context.
Focus on business impact, hackathon wins, top performer awards, open source adoption, or technical leadership.`,

  suggest_skills: `You are an ATS keyword extraction engine.
Analyze the user's target role and provide a categorized list of 10-15 high-demand ATS keywords and skills that recruiters search for.
Format as JSON array of objects:
[{"name": "Skill Name", "category": "Languages" | "Frameworks" | "Technical" | "Tools" | "Soft Skills", "level": "Advanced" | "Expert"}]`,

  professional_polish: `You are an executive resume writer.
Polish and elevate the provided professional summary into a high-converting 3-sentence executive summary.
Highlight years of experience, core technical mastery, leadership, and notable scale metrics.
Provide 2 distinct variations.`,
};

export async function POST(req: NextRequest) {
  const reqStart = Date.now();
  const requestId = req.headers.get("x-request-id") || crypto.randomUUID();

  try {
    // Upstash Redis distributed sliding window rate limit (Tier: AI Generation)
    const rateLimitResult = await checkRateLimit(req, RATE_LIMIT_TIERS.ai_generation);
    if (rateLimitResult.isRateLimited) {
      logger.warn("AI Enhance rate limit exceeded", { requestId, tier: "ai_generation" });
      return createRateLimitResponse(rateLimitResult);
    }

    const { mode = "improve_bullet", input = "", context = {} } = await req.json();

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_AI_STUDIO_API_KEY ||
      process.env.GOOGLE_API_KEY;

    const systemPrompt =
      SYSTEM_PROMPTS[mode as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.improve_bullet;

    const userMessage = `
Input / Draft: "${input}"
Target Role / Headline: "${context.targetRole || "Senior Software Engineer"}"
Company / Project: "${context.company || context.title || "General"}"
Existing Skills / Tools: "${(context.existingSkills || []).join(", ")}"
    `.trim();

    // If Gemini API key is provided, stream directly from Google AI Studio
    if (
      apiKey &&
      !apiKey.includes("your-gemini") &&
      !apiKey.includes("demo") &&
      apiKey.length > 10
    ) {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
        systemInstruction: systemPrompt,
      });

      try {
        const result = await model.generateContentStream(userMessage);

        const stream = new ReadableStream({
          async start(controller) {
            const encoder = new TextEncoder();
            try {
              for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) {
                  controller.enqueue(encoder.encode(text));
                }
              }
            } catch (streamErr) {
              captureAIFailure({
                model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
                feature: `ai-enhance-${mode}`,
                errorType: "network",
                rawError: streamErr,
                durationMs: Date.now() - reqStart,
              });
              controller.error(streamErr);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            ...rateLimitResult.headers,
          },
        });
      } catch (geminiErr: any) {
        captureAIFailure({
          model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
          feature: `ai-enhance-${mode}`,
          errorType: geminiErr?.status === 429 ? "quota_exceeded" : "unknown",
          statusCode: geminiErr?.status || 500,
          rawError: geminiErr,
          durationMs: Date.now() - reqStart,
        });
        throw geminiErr;
      }
    }

    // High-fidelity streaming simulation for testing/demo without API key
    const mockOutput = generateSimulatedResponse(mode, input, context);
    const stream = createSimulatedStream(mockOutput);

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        ...rateLimitResult.headers,
      },
    });
  } catch (err: any) {
    captureException(err, {
      tags: { route: "/api/ai/enhance", requestId },
    });
    return NextResponse.json(
      { error: err.message || "Failed to generate AI enhancement with Gemini" },
      { status: 500 }
    );
  }
}

function generateSimulatedResponse(mode: string, input: string, context: any): string {
  const cleanInput = input.trim() || "Worked on team software engineering and application delivery.";
  const stripped = cleanInput.replace(/^(worked on|helped with|responsible for|developed)/i, "").trim();
  const targetRole = context.targetRole || "Software Engineer";

  switch (mode) {
    case "improve_bullet":
      return `[Option 1 - Metric Focused]
• Spearheaded and engineered ${stripped || "core distributed services"}, boosting processing throughput by 42% and reducing 99th percentile API latency by 65ms across 2.5M+ active users.

[Option 2 - Leadership & Scale]
• Architected end-to-end ${stripped || "high-throughput cloud infrastructure"} using Next.js 15, Go, and PostgreSQL, maintaining 99.99% uptime during peak enterprise workloads.

[Option 3 - Technical & ATS Keyword Rich]
• Orchestrated automated CI/CD deployment pipelines for ${stripped || "microservices ecosystem"}, accelerating delivery release velocity by 35% while establishing strict code quality benchmarks.`;

    case "rewrite_project":
      return `[Option 1 - Full-Stack Architecture]
Architected an enterprise-grade ${context.title || "Full-Stack Application"} combining Next.js App Router, TypeScript, and Redis caching to achieve sub-80ms response times. Implemented secure OAuth2 authentication and real-time observability handling 500,000+ daily requests.

[Option 2 - Performance & Product Scale]
Engineered a distributed ${context.title || "Platform"} with microservices backend and vector search index, increasing data retrieval throughput by 40% and eliminating database query bottlenecks.`;

    case "generate_achievement":
      return `[Achievement 1 - Performance Excellence]
• 1st Place Winner – Global Cloud & AI Hackathon 2024: Designed and pitched an automated multi-modal assistant agent chosen 1st among 1,200+ global engineering teams.

[Achievement 2 - Engineering Impact]
• Top 1% Open Source Contributor: Authored high-performance developer tooling libraries surpassing 25,000+ GitHub stars and 500,000+ monthly npm downloads.`;

    case "suggest_skills":
      return `[
  {"name": "TypeScript", "category": "Languages", "level": "Expert"},
  {"name": "Next.js 15", "category": "Frameworks", "level": "Expert"},
  {"name": "React 19", "category": "Frameworks", "level": "Expert"},
  {"name": "Tailwind CSS", "category": "Frameworks", "level": "Expert"},
  {"name": "Node.js & Express", "category": "Frameworks", "level": "Advanced"},
  {"name": "PostgreSQL & Prisma", "category": "Technical", "level": "Advanced"},
  {"name": "Docker & Kubernetes", "category": "Tools", "level": "Advanced"},
  {"name": "AWS Cloud (S3, Lambda)", "category": "Tools", "level": "Advanced"},
  {"name": "System Architecture", "category": "Technical", "level": "Expert"},
  {"name": "REST & GraphQL APIs", "category": "Technical", "level": "Expert"},
  {"name": "Gemini & LLM Prompting", "category": "Technical", "level": "Advanced"},
  {"name": "CI/CD & GitHub Actions", "category": "Tools", "level": "Advanced"}
]`;

    case "professional_polish":
    default:
      return `[Option 1 - Executive & Strategic]
High-velocity ${targetRole} with 6+ years of experience architecting distributed cloud applications, Gemini LLM pipelines, and modern web platforms. Proven track record of scaling high-concurrency Next.js microservices to 2M+ active users while reducing latency by 42%.

[Option 2 - Results & Engineering Leadership]
Results-driven ${targetRole} skilled in modern TypeScript, full-stack systems, and performance optimization. Spearheaded cross-functional delivery cycles, mentor engineering teams, and established robust CI/CD standards driving 35% productivity gains.`;
  }
}

function createSimulatedStream(fullText: string): ReadableStream {
  const encoder = new TextEncoder();
  const words = fullText.split(" ");
  let i = 0;

  return new ReadableStream({
    async start(controller) {
      function pushChunk() {
        if (i < words.length) {
          const chunk = (i === 0 ? "" : " ") + words[i];
          controller.enqueue(encoder.encode(chunk));
          i++;
          setTimeout(pushChunk, 20);
        } else {
          controller.close();
        }
      }
      pushChunk();
    },
  });
}
