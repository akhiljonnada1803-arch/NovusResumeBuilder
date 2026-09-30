import { ResumeDesignSettings, ResumeTemplateId } from "@/types/resume";

export const TEMPLATE_OPTIONS: {
  id: ResumeTemplateId;
  name: string;
  description: string;
  badge?: string;
  popular?: boolean;
}[] = [
  {
    id: "modern",
    name: "Modern Gradient",
    description: "Sleek two-column header with balanced spacing, clean accent bars, and optimal ATS parsing.",
    popular: true,
  },
  {
    id: "minimalist",
    name: "Minimalist Slate",
    description: "Timeless single-column typography-driven layout preferred by top tech firms and design agencies.",
    badge: "Clean",
  },
  {
    id: "executive",
    name: "Executive Navy",
    description: "Authoritative design featuring an elegant sidebar column, structured metrics, and polished borders.",
    popular: false,
  },
  {
    id: "tech",
    name: "Tech & Engineering",
    description: "Compact monospace badges, technical skills focus, and highlighted project links.",
    badge: "Top for Devs",
    popular: true,
  },
  {
    id: "creative",
    name: "Creative Portfolio",
    description: "Vibrant accent badges, card-style section blocks, and aesthetic visual hierarchy.",
  },
];

export const ACCENT_COLORS = [
  { name: "Indigo Nebula", value: "#4f46e5", bgClass: "bg-indigo-600" },
  { name: "Emerald Forest", value: "#059669", bgClass: "bg-emerald-600" },
  { name: "Electric Violet", value: "#7c3aed", bgClass: "bg-purple-600" },
  { name: "Cyber Cyan", value: "#0284c7", bgClass: "bg-sky-600" },
  { name: "Crimson Rose", value: "#e11d48", bgClass: "bg-rose-600" },
  { name: "Amber Gold", value: "#d97706", bgClass: "bg-amber-600" },
  { name: "Midnight Charcoal", value: "#1e293b", bgClass: "bg-slate-800" },
  { name: "Teal Matrix", value: "#0d9488", bgClass: "bg-teal-600" },
];

export const DEFAULT_DESIGN: ResumeDesignSettings = {
  template: "modern",
  accentColor: "#4f46e5",
  fontFamily: "Inter",
  fontSize: "base",
  spacing: "normal",
  margins: "normal",
  customMarginMm: 20,
  showIcons: true,
  showSectionDividers: true,
};

export const AI_ENHANCEMENT_MODES = [
  {
    id: "action-verbs",
    label: "Power Action Verbs",
    description: "Rephrase passive phrases with strong, high-impact leadership verbs (e.g. Orchestrated, Spearheaded).",
  },
  {
    id: "quantify",
    label: "Quantify & Add Metrics",
    description: "Transform generic descriptions into measurable accomplishments with numbers, percentages, and ROI.",
  },
  {
    id: "ats-keywords",
    label: "ATS Keyword Injection",
    description: "Embed high-frequency recruiter search terms and technical proficiencies for your target role.",
  },
  {
    id: "concise",
    label: "Make Concise & Punchy",
    description: "Trim filler words and ensure maximum impact within 1-2 lines per bullet.",
  },
];
