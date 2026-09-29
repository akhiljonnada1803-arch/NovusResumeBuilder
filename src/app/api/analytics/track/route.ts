import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, entityId, eventType, channel, metadata } = body;

    if (!entityType || !eventType) {
      return NextResponse.json({ error: "Missing entityType or eventType" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const referrer = req.headers.get("referer") || "";

    // Determine device type
    const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
    const isTablet = /tablet|ipad/i.test(userAgent);
    const deviceType = isTablet ? "tablet" : isMobile ? "mobile" : "desktop";

    // In a live Supabase environment, record into public.career_analytics_events
    // Graceful fallback for local runtime
    return NextResponse.json({
      success: true,
      tracked: {
        entityType,
        entityId: entityId || "default",
        eventType,
        channel: channel || "web",
        referrer,
        deviceType,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Analytics Tracking Error:", error);
    return NextResponse.json({ error: error.message || "Failed to track analytics event." }, { status: 500 });
  }
}
