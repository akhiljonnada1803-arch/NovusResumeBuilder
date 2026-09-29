export type OnboardingStep =
  | "welcome"
  | "gemini"
  | "supabase"
  | "github"
  | "linkedin"
  | "vercel"
  | "summary";

export interface ServiceVerificationState {
  status: "idle" | "testing" | "success" | "error" | "skipped";
  message?: string;
  details?: Record<string, any>;
  testedAt?: string;
}

export interface OnboardingFormData {
  // Step 2: Gemini
  geminiApiKey: string;
  geminiModel: string;
  geminiStatus: ServiceVerificationState;

  // Step 3: Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseStatus: ServiceVerificationState;

  // Step 4: GitHub
  githubUsername: string;
  githubToken: string;
  githubStatus: ServiceVerificationState;
  githubUser?: {
    login: string;
    name?: string;
    avatarUrl?: string;
    publicRepos?: number;
  };

  // Step 5: LinkedIn
  linkedinUrl: string;
  linkedinStatus: ServiceVerificationState;
  linkedinProfile?: {
    name?: string;
    headline?: string;
    vanityName?: string;
  };

  // Step 6: Vercel
  vercelToken: string;
  vercelStatus: ServiceVerificationState;
  vercelUser?: {
    username: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}

export const INITIAL_ONBOARDING_DATA: OnboardingFormData = {
  geminiApiKey: "",
  geminiModel: "gemini-1.5-flash",
  geminiStatus: { status: "idle" },

  supabaseUrl: "",
  supabaseAnonKey: "",
  supabaseStatus: { status: "idle" },

  githubUsername: "",
  githubToken: "",
  githubStatus: { status: "idle" },

  linkedinUrl: "",
  linkedinStatus: { status: "idle" },

  vercelToken: "",
  vercelStatus: { status: "idle" },
};
