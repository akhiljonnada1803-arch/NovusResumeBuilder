import { NextRequest, NextResponse } from "next/server";
import { validateVercelToken } from "@/lib/portfolio/vercel-deployer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Fix #1: Accept token from Authorization header (preferred) or body (backward compat)
    const authHeader = req.headers.get("authorization") || "";
    const token = (
      authHeader.startsWith("Bearer ") ? authHeader.slice(7) : (body.token || "")
    ).trim();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ valid: false, error: "Token is required." }, { status: 400 });
    }

    const result = await validateVercelToken(token);
    return NextResponse.json(result);
  } catch (error: any) {
    // Fix #14: log only message, not the full error object (prevents token leaking into logs)
    console.error("Vercel Validate Token Error:", error.message);
    return NextResponse.json({ valid: false, error: error.message || "Failed to validate Vercel token." }, { status: 500 });
  }
}
