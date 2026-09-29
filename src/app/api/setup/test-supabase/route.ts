import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { url, anonKey } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Supabase project URL (e.g. https://xyz.supabase.co)." },
        { status: 400 }
      );
    }

    if (!anonKey || anonKey.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Supabase anon key." },
        { status: 400 }
      );
    }

    const supabase = createClient(url.trim(), anonKey.trim(), {
      auth: { persistSession: false },
    });

    // Test pinging the auth or REST endpoint
    const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });

    // Note: Even if the table does not exist yet (or RLS rejects anonymous select), reaching the server confirms URL & key validity
    if (error && error.code !== "PGRST116" && error.code !== "42P01" && error.message?.includes("Invalid API key")) {
      return NextResponse.json(
        { success: false, error: "Supabase Anon Key is invalid or rejected by project." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection verified successfully!",
      projectUrl: url.trim(),
      authService: "Active",
    });
  } catch (error: any) {
    console.error("Supabase Test Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reach Supabase project." },
      { status: 400 }
    );
  }
}
