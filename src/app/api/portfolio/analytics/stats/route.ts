import { NextResponse } from "next/server";
import { getPortfolioAnalytics } from "@/lib/portfolio/analytics-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId") || "default";

    const analytics = getPortfolioAnalytics(resumeId);
    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
