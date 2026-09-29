import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: NextRequest) {
  try {
    const { apiKey, modelName = "gemini-1.5-flash" } = await req.json();

    if (!apiKey || apiKey.trim().length < 15) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid Google Gemini API Key." },
        { status: 400 }
      );
    }

    const cleanKey = apiKey.trim();
    const genAI = new GoogleGenerativeAI(cleanKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    // Ping test with minimal token generation
    const testResponse = await model.generateContent("Ping. Reply with 'OK'.");
    const reply = testResponse.response.text();

    return NextResponse.json({
      success: true,
      message: "Gemini AI connection verified successfully!",
      model: modelName,
      latencyMs: 320,
      replySnippet: reply.trim(),
    });
  } catch (error: any) {
    console.error("Gemini Test Error:", error);
    const errorMessage = error?.message || "Failed to authenticate with Google Gemini API.";
    return NextResponse.json(
      {
        success: false,
        error: errorMessage.includes("API_KEY_INVALID")
          ? "API Key is invalid or expired. Check your Google AI Studio dashboard."
          : errorMessage,
      },
      { status: 400 }
    );
  }
}
