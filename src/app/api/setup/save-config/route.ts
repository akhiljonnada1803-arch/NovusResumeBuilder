import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const config = await req.json();
    const { geminiApiKey, supabaseUrl, supabaseAnonKey, vercelToken, githubToken, githubUsername, linkedinUrl } = config;

    // Optional: Safely update .env.local if running in local development
    const envPath = path.join(process.cwd(), ".env.local");
    let envContent = "";

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, "utf-8");
    }

    const updates: Record<string, string> = {};
    if (geminiApiKey && !geminiApiKey.includes("demo")) updates["GEMINI_API_KEY"] = geminiApiKey;
    if (supabaseUrl && supabaseUrl.startsWith("http")) {
      updates["SUPABASE_URL"] = supabaseUrl;
      updates["NEXT_PUBLIC_SUPABASE_URL"] = supabaseUrl;
    }
    if (supabaseAnonKey && supabaseAnonKey.length > 10) {
      updates["SUPABASE_ANON_KEY"] = supabaseAnonKey;
      updates["NEXT_PUBLIC_SUPABASE_ANON_KEY"] = supabaseAnonKey;
    }
    if (vercelToken && vercelToken.length > 10) updates["VERCEL_ACCESS_TOKEN"] = vercelToken;
    if (githubToken && githubToken.length > 10) updates["GITHUB_PERSONAL_ACCESS_TOKEN"] = githubToken;
    if (githubUsername) updates["NEXT_PUBLIC_GITHUB_USERNAME"] = githubUsername;
    if (linkedinUrl) updates["NEXT_PUBLIC_LINKEDIN_URL"] = linkedinUrl;

    let updatedEnv = envContent;
    for (const [key, val] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, "m");
      if (regex.test(updatedEnv)) {
        updatedEnv = updatedEnv.replace(regex, `${key}=${val}`);
      } else {
        updatedEnv += `\n${key}=${val}`;
      }
    }

    try {
      fs.writeFileSync(envPath, updatedEnv.trim() + "\n", "utf-8");
    } catch (e) {
      console.warn("Could not write to .env.local file directly (might be in serverless/readonly container):", e);
    }

    return NextResponse.json({
      success: true,
      message: "Platform settings saved successfully.",
      configuredKeys: Object.keys(updates),
    });
  } catch (error: any) {
    console.error("Save Config Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to persist configuration." },
      { status: 500 }
    );
  }
}
