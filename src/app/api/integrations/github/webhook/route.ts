import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const event = req.headers.get("x-github-event") || "ping";
    const signature = req.headers.get("x-hub-signature-256") || "";
    const secret = process.env.GITHUB_WEBHOOK_SECRET;

    // Verify HMAC signature if secret is configured
    if (secret && signature) {
      const hmac = crypto.createHmac("sha256", secret);
      const digest = "sha256=" + hmac.update(rawBody).digest("hex");
      if (signature !== digest) {
        return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
      }
    }

    const payload = rawBody ? JSON.parse(rawBody) : {};

    // Handle supported events
    switch (event) {
      case "ping":
        return NextResponse.json({ message: "GitHub webhook connected successfully." });

      case "push": {
        const repo = payload.repository;
        console.log(`[GitHub Webhook] Push received for ${repo?.full_name}`);
        return NextResponse.json({
          received: true,
          event: "push",
          repo: repo?.full_name,
          commitsCount: payload.commits?.length || 0,
        });
      }

      case "release": {
        const repo = payload.repository;
        const release = payload.release;
        console.log(`[GitHub Webhook] New release ${release?.tag_name} for ${repo?.full_name}`);
        return NextResponse.json({
          received: true,
          event: "release",
          repo: repo?.full_name,
          tag: release?.tag_name,
        });
      }

      case "watch":
      case "star": {
        const repo = payload.repository;
        return NextResponse.json({
          received: true,
          event: "star",
          repo: repo?.full_name,
          stars: repo?.stargazers_count,
        });
      }

      default:
        return NextResponse.json({ received: true, event });
    }
  } catch (error: any) {
    console.error("GitHub Webhook Error:", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed." },
      { status: 500 }
    );
  }
}
