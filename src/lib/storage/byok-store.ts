/**
 * BYOK (Bring Your Own Key) Store — Novus Resume AI
 *
 * Saves user-supplied API keys in browser localStorage using the Web Crypto
 * API to XOR-obfuscate the values (prevents casual shoulder-surfing in DevTools;
 * NOT a substitute for server-side encryption of secrets).
 *
 * Keys are NEVER sent to any server — all reads happen client-side only.
 */

const STORAGE_KEY = "novus_byok_v1";
const OBFUSCATION_SEED = "novus-byok-2026";

/**
 * Simple XOR cipher for localStorage obfuscation.
 * Not cryptographically secure — just prevents casual inspection.
 */
function xorObfuscate(text: string, seed: string): string {
  const seedBytes = Array.from(seed);
  return Array.from(text)
    .map((char, i) =>
      String.fromCharCode(
        char.charCodeAt(0) ^ seedBytes[i % seedBytes.length].charCodeAt(0)
      )
    )
    .join("");
}

function encode(value: string): string {
  try {
    return btoa(xorObfuscate(value, OBFUSCATION_SEED));
  } catch {
    return value;
  }
}

function decode(value: string): string {
  try {
    return xorObfuscate(atob(value), OBFUSCATION_SEED);
  } catch {
    return value;
  }
}

export interface ByokKeys {
  /** Google Gemini API key from https://aistudio.google.com */
  geminiApiKey: string;
  /** Supabase project URL (optional — for personal cloud sync) */
  supabaseUrl: string;
  /** Supabase anon key (optional — for personal cloud sync) */
  supabaseAnonKey: string;
}

const EMPTY: ByokKeys = {
  geminiApiKey: "",
  supabaseUrl: "",
  supabaseAnonKey: "",
};

/** Read BYOK keys from localStorage. Returns empty strings for unset keys. */
export function getByokKeys(): ByokKeys {
  if (typeof window === "undefined") return { ...EMPTY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Record<string, string>;
    return {
      geminiApiKey: parsed.geminiApiKey ? decode(parsed.geminiApiKey) : "",
      supabaseUrl: parsed.supabaseUrl ? decode(parsed.supabaseUrl) : "",
      supabaseAnonKey: parsed.supabaseAnonKey
        ? decode(parsed.supabaseAnonKey)
        : "",
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Save BYOK keys to localStorage (obfuscated). */
export function saveByokKeys(keys: Partial<ByokKeys>): void {
  if (typeof window === "undefined") return;
  const current = getByokKeys();
  const merged: ByokKeys = { ...current, ...keys };
  const toStore: Record<string, string> = {};
  if (merged.geminiApiKey) toStore.geminiApiKey = encode(merged.geminiApiKey);
  if (merged.supabaseUrl) toStore.supabaseUrl = encode(merged.supabaseUrl);
  if (merged.supabaseAnonKey)
    toStore.supabaseAnonKey = encode(merged.supabaseAnonKey);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
}

/** Remove all BYOK keys from localStorage. */
export function clearByokKeys(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Returns true if the user has set a Gemini API key. */
export function hasByokGeminiKey(): boolean {
  return getByokKeys().geminiApiKey.length > 0;
}
