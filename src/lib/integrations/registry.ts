import { IntegrationPlatform, IntegrationProvider } from "./types";

export interface PlatformMetadata {
  id: IntegrationPlatform;
  name: string;
  category: "Code & Engineering" | "Professional Network" | "Competitive Coding" | "Publications";
  description: string;
  iconName: string;
  badgeText: string;
  isAvailable: boolean;
  features: string[];
}

export const SUPPORTED_PLATFORMS: PlatformMetadata[] = [
  {
    id: "github",
    name: "GitHub",
    category: "Code & Engineering",
    description: "Sync repositories, extract architecture from READMEs, analyze commit metrics, and auto-generate STAR projects.",
    iconName: "github",
    badgeText: "Active & AI Powered",
    isAvailable: true,
    features: [
      "README.md parsing & tech stack extraction",
      "AI-generated STAR resume bullet points",
      "0-100 repository quality benchmark score",
      "Auto-generated categorized skills radar",
      "Commit & contribution statistics",
    ],
  },
  {
    id: "leetcode",
    name: "LeetCode",
    category: "Competitive Coding",
    description: "Import problem-solving stats, contest rating, ranking percentiles, and algorithm mastery tags.",
    iconName: "code",
    badgeText: "Coming Soon",
    isAvailable: false,
    features: [
      "Total problems solved (Easy/Med/Hard)",
      "Global contest rating & top percentiles",
      "Badges and algorithmic proficiency tags",
    ],
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    category: "Professional Network",
    description: "Import verified job titles, career history, endorsed skills, certifications, and projects into full resumes.",
    iconName: "linkedin",
    badgeText: "Active & AI Powered",
    isAvailable: true,
    features: [
      "PDF export & public profile parsing",
      "Work experience with STAR accomplishment bullets",
      "Categorized skills & keyword extraction",
      "Verified licenses, certifications & education",
      "1-click complete resume creation & merge",
    ],
  },
  {
    id: "hackerrank",
    name: "HackerRank",
    category: "Competitive Coding",
    description: "Import verified skill certificates, problem solving stars, and domain badges.",
    iconName: "terminal",
    badgeText: "Coming Soon",
    isAvailable: false,
    features: [
      "Verified skill certificates",
      "Domain gold badges (Algorithms, SQL, Python)",
    ],
  },
  {
    id: "medium",
    name: "Medium & Dev.to",
    category: "Publications",
    description: "Import published technical articles, reader claps, view stats, and engineering blog posts.",
    iconName: "book-open",
    badgeText: "Coming Soon",
    isAvailable: false,
    features: [
      "Published articles & publications section",
      "Total reads, claps, and audience metrics",
    ],
  },
  {
    id: "scholar",
    name: "Google Scholar",
    category: "Publications",
    description: "Import academic papers, journal citations, h-index, and research publications.",
    iconName: "graduation-cap",
    badgeText: "Coming Soon",
    isAvailable: false,
    features: [
      "Peer-reviewed publications & citations count",
      "h-index and i10-index academic scoring",
    ],
  },
];
