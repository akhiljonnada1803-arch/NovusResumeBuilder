import { NextRequest, NextResponse } from "next/server";
import { computeCareerAnalytics } from "@/lib/analytics/analytics-service";
import { TimeRangeFilter } from "@/types/analytics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get("range") as TimeRangeFilter) || "30d";
    const githubUsername = searchParams.get("github") || "alexrivera";
    const isLinkedInConnected = searchParams.get("linkedin") !== "false";

    const metrics = computeCareerAnalytics(null, range, githubUsername, isLinkedInConnected);

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    console.error("Analytics Metrics API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to load metrics." }, { status: 500 });
  }
}
