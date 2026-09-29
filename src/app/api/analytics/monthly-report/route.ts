import { NextRequest, NextResponse } from "next/server";
import { generateMonthlyCareerReport, computeCareerAnalytics } from "@/lib/analytics/analytics-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const candidateName = searchParams.get("name") || "Alex Rivera";
    const targetRole = searchParams.get("role") || "Senior AI Systems Engineer";

    const summary = computeCareerAnalytics(null, "30d");
    const report = generateMonthlyCareerReport(candidateName, targetRole, summary);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error("Monthly Report API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate monthly report." }, { status: 500 });
  }
}
