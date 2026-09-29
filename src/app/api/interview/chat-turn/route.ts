import { NextRequest, NextResponse } from "next/server";
import { processConversationTurn } from "@/modules/interview";
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
    const result = await processConversationTurn(body);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Chat Turn API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recruiter response." },
      { status: 500 }
    );
  }
}
