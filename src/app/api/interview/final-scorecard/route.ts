import { NextRequest, NextResponse } from "next/server";
import { generateFinalScorecard } from "@/modules/interview";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const scorecard = await generateFinalScorecard({
      ...body,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      scorecard,
    });
  } catch (error: any) {
    console.error("Final Scorecard API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate interview scorecard." },
      { status: 500 }
    );
  }
}
