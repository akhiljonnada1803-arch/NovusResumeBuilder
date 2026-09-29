import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

const ENV_GEMINI_API_KEY =
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_API_KEY ||
  process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
  "";

export function isValidApiKey(key?: string): boolean {
  const k = (key || ENV_GEMINI_API_KEY || "").trim();
  return (
    Boolean(k) &&
    k.length > 20 &&
    !k.includes("your-") &&
    !k.includes("your_") &&
    !k.includes("demo") &&
    !k.includes("placeholder") &&
    !k.includes("key-here")
  );
}

export const IS_VALID_API_KEY = isValidApiKey(ENV_GEMINI_API_KEY);

/**
 * Returns a configured Gemini GenerativeModel.
 * Supports passing a user-provided API key or falls back to environment variables.
 * @param temperature Generation temperature (default 0.2)
 * @param mimeType Response MIME type (default "application/json")
 * @param customApiKey Optional user-provided API key
 * @param customModel Optional model name override
 */
export function getGeminiModel(
  temperature = 0.2,
  mimeType: "application/json" | "text/plain" = "application/json",
  customApiKey?: string,
  customModel?: string
): GenerativeModel {
  const effectiveKey = (customApiKey || "").trim() || ENV_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(effectiveKey);
  const modelName = customModel || process.env.GEMINI_MODEL || "gemini-2.5-flash";

  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { temperature, responseMimeType: mimeType },
  });
}
