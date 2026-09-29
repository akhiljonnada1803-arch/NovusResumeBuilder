export type PortfolioTemplateId =
  | "developer"
  | "student"
  | "researcher"
  | "designer"
  | "freelancer"
  | "founder";

export type PortfolioTheme =
  | "developer"
  | "student"
  | "researcher"
  | "designer"
  | "freelancer"
  | "founder"
  | "apple-engineer"
  | "github-developer"
  | "timeline"
  | "showcase"
  | "ai-engineer"
  | "terminal"
  | "executive"
  | "interactive-3d";

export interface PortfolioTemplateMeta {
  id: PortfolioTemplateId;
  name: string;
  category: string;
  description: string;
  badge: string;
  accentColor: string;
  previewClass: string;
}

export const PORTFOLIO_TEMPLATES: PortfolioTemplateMeta[] = [
  {
    id: "developer",
    name: "Developer Pro",
    category: "Engineering & Code",
    description: "IDE / Split Sidebar layout with live GitHub activity, code syntax hero, interactive repo explorer, and terminal snippet runner.",
    badge: "IDE & TERMINAL",
    accentColor: "text-emerald-500 border-emerald-500/40 bg-emerald-500/10",
    previewClass: "from-emerald-950/40 via-background to-background border-emerald-500/30",
  },
  {
    id: "student",
    name: "Campus & Graduate",
    category: "Academic & Early Career",
    description: "Campus-forward layout with University crest, GPA badge, capstone & hackathon projects, coursework grid, and student resume CTA.",
    badge: "CAMPUS & CAPSTONE",
    accentColor: "text-blue-500 border-blue-500/40 bg-blue-500/10",
    previewClass: "from-blue-950/40 via-background to-background border-blue-500/30",
  },
  {
    id: "researcher",
    name: "Academic Researcher",
    category: "Publications & Science",
    description: "High-credibility two-column publication layout with ORCID badges, citations counter, peer-reviewed list, and one-click BibTeX copy.",
    badge: "CITATIONS & BIBTEX",
    accentColor: "text-indigo-500 border-indigo-500/40 bg-indigo-500/10",
    previewClass: "from-indigo-950/40 via-background to-background border-indigo-500/30",
  },
  {
    id: "designer",
    name: "Designer Editorial",
    category: "Creative & Visual",
    description: "Visual-first editorial masonry portfolio with design system token swatches, deep-dive problem/solution case studies, and floating dock.",
    badge: "MASONRY & DESIGN SYSTEM",
    accentColor: "text-rose-500 border-rose-500/40 bg-rose-500/10",
    previewClass: "from-rose-950/40 via-background to-background border-rose-500/30",
  },
  {
    id: "freelancer",
    name: "Freelancer & Consultant",
    category: "Consultancy & Client Work",
    description: "High-conversion client consultancy layout with availability status, pricing packages, verified ROI metrics, client reviews, and booking form.",
    badge: "HIGH CONVERSION & PACKAGES",
    accentColor: "text-purple-500 border-purple-500/40 bg-purple-500/10",
    previewClass: "from-purple-950/40 via-background to-background border-purple-500/30",
  },
  {
    id: "founder",
    name: "Startup Founder",
    category: "Venture & Pitch Deck",
    description: "Investor memo & pitch deck aesthetic with live venture traction KPI dials ($ARR, MAU, Capital Raised), product roadmap, and deck download.",
    badge: "VENTURE MEMO & TRACTION",
    accentColor: "text-amber-500 border-amber-500/40 bg-amber-500/10",
    previewClass: "from-amber-950/40 via-background to-background border-amber-500/30",
  },
];

export type PortfolioSectionId =
  | "hero"
  | "about"
  | "featured-projects"
  | "open-source"
  | "experience"
  | "leadership"
  | "education"
  | "skills"
  | "tech-stack"
  | "achievements"
  | "certifications"
  | "awards"
  | "publications"
  | "volunteer"
  | "blog-posts"
  | "github-stats"
  | "timeline"
  | "testimonials"
  | "contact"
  | "resume-download";

export interface PortfolioSectionConfig {
  id: PortfolioSectionId;
  label: string;
  enabled: boolean;
  order: number;
}

export const DEFAULT_PORTFOLIO_SECTIONS: PortfolioSectionConfig[] = [
  { id: "hero", label: "Profile Photo & Hero", enabled: true, order: 1 },
  { id: "about", label: "About & Bio", enabled: true, order: 2 },
  { id: "featured-projects", label: "Featured Projects", enabled: true, order: 3 },
  { id: "open-source", label: "Open Source Projects", enabled: true, order: 4 },
  { id: "experience", label: "Work Experience", enabled: true, order: 5 },
  { id: "leadership", label: "Leadership & Advisory", enabled: true, order: 6 },
  { id: "education", label: "Education & Academics", enabled: true, order: 7 },
  { id: "skills", label: "Skills Radar & Competencies", enabled: true, order: 8 },
  { id: "tech-stack", label: "Tech Stack Explorer", enabled: true, order: 9 },
  { id: "achievements", label: "Key Achievements", enabled: true, order: 10 },
  { id: "certifications", label: "Verified Certifications", enabled: true, order: 11 },
  { id: "awards", label: "Honors & Hackathon Awards", enabled: true, order: 12 },
  { id: "publications", label: "Publications & Research", enabled: true, order: 13 },
  { id: "volunteer", label: "Volunteer & Community", enabled: true, order: 14 },
  { id: "blog-posts", label: "Technical Articles & Blog", enabled: true, order: 15 },
  { id: "github-stats", label: "GitHub Code Velocity", enabled: true, order: 16 },
  { id: "timeline", label: "Career Timeline Journey", enabled: true, order: 17 },
  { id: "testimonials", label: "Recommendations & Social Proof", enabled: true, order: 18 },
  { id: "resume-download", label: "Resume PDF Download CTA", enabled: true, order: 19 },
  { id: "contact", label: "Executive Contact & Scheduler", enabled: true, order: 20 },
];

export function serializeSectionsQuery(sections: PortfolioSectionConfig[]): string {
  return sections
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)
    .map((s) => s.id)
    .join(",");
}

export function parseSectionsQuery(sectionsQuery?: string): PortfolioSectionConfig[] {
  if (!sectionsQuery) return DEFAULT_PORTFOLIO_SECTIONS;
  const activeIds = sectionsQuery.split(",").map((id) => id.trim() as PortfolioSectionId);
  if (activeIds.length === 0) return DEFAULT_PORTFOLIO_SECTIONS;

  const result: PortfolioSectionConfig[] = [];
  activeIds.forEach((id, index) => {
    const found = DEFAULT_PORTFOLIO_SECTIONS.find((s) => s.id === id);
    if (found) {
      result.push({
        ...found,
        enabled: true,
        order: index + 1,
      });
    }
  });

  // Append remaining sections as disabled
  DEFAULT_PORTFOLIO_SECTIONS.forEach((s) => {
    if (!activeIds.includes(s.id)) {
      result.push({
        ...s,
        enabled: false,
        order: result.length + 1,
      });
    }
  });

  return result;
}

export function normalizeTheme(theme?: string): PortfolioTheme {
  switch (theme) {
    case "developer":
    case "github-developer":
    case "terminal":
      return "developer";
    case "student":
      return "student";
    case "researcher":
      return "researcher";
    case "designer":
      return "designer";
    case "freelancer":
      return "freelancer";
    case "founder":
    case "executive":
      return "founder";
    case "apple-engineer":
      return "developer";
    case "showcase":
      return "freelancer";
    case "ai-engineer":
      return "developer";
    case "interactive-3d":
      return "designer";
    default:
      return "developer";
  }
}

export interface PortfolioCustomizationSettings {
  headlineOverride?: string;
  taglineOverride?: string;
  bioOverride?: string;
  photoUrl?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  customSocialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    portfolio?: string;
    email?: string;
  };
  sectionVisibility?: Record<string, boolean>;
  themeColorOverride?: string;
}

export interface BaseThemeProps {
  resume: any;
  subdomain?: string;
  onThemeChange?: (theme: PortfolioTheme) => void;
  currentTheme?: PortfolioTheme;
  sectionsConfig?: PortfolioSectionConfig[];
  customization?: PortfolioCustomizationSettings;
}

