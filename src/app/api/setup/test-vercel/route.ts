import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token || token.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Vercel Personal Access Token." },
        { status: 400 }
      );
    }

    const cleanToken = token.trim();
    const res = await fetch("https://api.vercel.com/v2/user", {
      headers: {
        Authorization: `Bearer ${cleanToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json();
      return NextResponse.json(
        { success: false, error: err?.error?.message || "Vercel Access Token is invalid or unauthorized." },
        { status: 400 }
      );
    }

    const data = await res.json();
    const user = data.user || {};

    return NextResponse.json({
      success: true,
      message: "Vercel API token verified successfully!",
      user: {
        username: user.username || "Vercel User",
        email: user.email || "",
        name: user.name || user.username || "",
      },
    });
  } catch (error: any) {
    console.error("Vercel Test Error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to authenticate with Vercel API." },
      { status: 400 }
    );
  }
}
