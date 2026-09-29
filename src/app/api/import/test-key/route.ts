import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { isValidApiKey } from "@/lib/gemini/client";

export const runtime = "nodejs";

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
].filter(Boolean) as string[];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const headerKey = req.headers.get("x-gemini-api-key") || "";
    const apiKey = (body.apiKey || headerKey || process.env.GEMINI_API_KEY || "").trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          valid: false,
          error: "No Gemini API key provided. Please enter an API key from Google AI Studio.",
        },
        { status: 400 }
      );
    }

    if (!isValidApiKey(apiKey)) {
      return NextResponse.json(
        {
          valid: false,
          error:
            "Invalid API key format. A valid Google Gemini API key typically starts with 'AIzaSy...' and is at least 25 characters long.",
        },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    let lastError: any = null;
    let workingModel: string | null = null;

    // Test candidate models to find a working model
    for (const modelName of CANDIDATE_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.1,
            responseMimeType: "application/json",
          },
        });

        const testPrompt =
          'Respond with JSON: {"status": "ok", "message": "API key verified"}';
        const result = await model.generateContent(testPrompt);
        const text = result.response.text();

        if (text && text.length > 0) {
          workingModel = modelName;
          break;
        }
      } catch (err: any) {
        lastError = err;
        // Continue to next candidate model
      }
    }

    if (workingModel) {
      return NextResponse.json({
        valid: true,
        model: workingModel,
        message: `API Key verified successfully with model: ${workingModel}!`,
      });
    }

    const errorMsg =
      lastError?.message ||
      "Could not connect to Gemini API. Please verify that your API key has Google Generative Language API enabled.";

    return NextResponse.json(
      {
        valid: false,
        error: errorMsg,
      },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        valid: false,
        error: error.message || "An unexpected error occurred while validating the API key.",
      },
      { status: 500 }
    );
  }
}
